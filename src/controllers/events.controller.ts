/* eslint-disable prettier/prettier */
// events.controller.ts
// import { LocationService } from '../modules/locations/locations.services';

import { Controller, Get, Query, Post, Patch, Delete, Param, Body, Put, UseGuards, Request, SetMetadata, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { EventService } from '../modules/events/events.services';
import { Event, EventDocument } from '../modules/events/events.schema';
import { CreateEventDto } from '../modules/events/dto/create-event.dto';
import { UpdateEventDto } from '../modules/events/dto/update-event.dto';
import { UpdateSeatDto } from '../modules/events/dto/update-seat.dto';
import { CreateSeatDto } from '../modules/events/dto/create-seat.dto';
import { CreateEventReservationsDto } from '../modules/events/dto/reservations.dto';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';
import axios from 'axios';

@Controller('event')
export class EventController {
    private readonly logger = new Logger(EventController.name);

    constructor(
        private readonly eventService: EventService,
        private readonly locationtService: EventService,
    ) { }

    // Endpoin para actualizar todos los eventos agregando la propiedad coordenadas
    @Post('update-coordinates')
    @HttpCode(HttpStatus.OK)
    async updateEventsWithCoordinates(): Promise<void> {
        try {
            const events: EventDocument[] = await this.eventService.findAllDocuments();
            for (const event of events) {
                const address = await this.eventService.getAddress(event.location_id);
                const coordinates = await this.getCoordinatesFromAddress(address);

                if (coordinates) {
                    await this.eventService.updateEventCoordinates(event._id, coordinates);
                    this.logger.log(`Evento ${event._id} actualizado con coordenadas ${coordinates}`);
                } else {
                    this.logger.warn(`No se pudieron obtener coordenadas para el evento ${event._id}`);
                }
            }
        } catch (error) {
            this.logger.error('Error al actualizar eventos:', error);
        }
    }

    // Funcion auxiliar para obtener las coordenadas geoespaciales de una direeccion postal
    private async getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
        this.logger.warn(`Direccion obtenida: ${encodeURIComponent(address)}`);
        this.logger.warn(`URL obtenida: ${url}`);
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Beevents/1.0 (restorepass.beevents@gmail.com)' // Agrega un User-Agent válido
                }
            });
            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                return [parseFloat(lon), parseFloat(lat)];
            }
        } catch (error) {
            this.logger.error('Error obteniendo coordenadas:', error);
        }
        return null;
    }


    // Endpoint para obtener los eventos cercanos a la ubicación del usuario según su IP. No requiere autenticación.
    @Get('nearby')
    async getNearbyEvents(@Query('lat') lat: any, @Query('lon') lon: any) {
        console.log('Llamado al controlador nearby'); // Para verificar que se está llamando
        try {
            if (!lat || !lon) {
                return { message: 'Faltan las coordenadas de latitud y longitud' };
            }

            // Lógica para obtener eventos cercanos
            const events = await this.eventService.findNearbyEvents(lon, lat);
            return events;
        } catch (error) {
            return { message: 'Error al obtener los eventos cercanos' };
        }
    }


    // Función para obtener la ubicacion geoespacial de una IP (Deprecada porque la obtiene el front)
    async getLocationFromIP() {
        try {
            // Si ip-api falla, usamos get.geojs.io
            try {
                const geoResponse = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                return {
                    lat: geoResponse.data.latitude,
                    lon: geoResponse.data.longitude
                };
            } catch (error) {
                console.error('Error al usar geojs.io:', error);
            }

        } catch (error) {
            console.error('Error obteniendo ubicación por IP:', error);
        }
        return null;
    }


    // Endpoint para obtener los eventos futuros. No requiere autenticación.
    @Get() // eventos que no están vencidos y están publicados
    async findUpcomingEvents(@Request() req: any) {
        return this.eventService.findUpcomingEvents();
    }

    // Endpoint para obtener todos los eventos. No requiere autenticación.
    @Get('allEvents')
    async findAllEvents(@Request() req: any) {
        return this.eventService.findAll();
    }

    // Endpoint para obtener todos los eventos, vencidos, no vencidos, publicados, no publicados con los Seat
    @Get('allEventsFull')
    async findAllFull(@Request() req: any) {
        return this.eventService.findAllFull();
    }

    // Endpoint para obtener todos los eventos que no están vencidos, publicados y no publicados
    @Get('pubAndNotPub')
    async findUpcomingAll(@Request() req: any) {
        return this.eventService.findUpcomingAll();
    }

    // Endpoint para obtener un evento por su ID. No requiere autenticación.
    @Get(':id')
    async findById(@Param('id') id: string, @Request() req: any) {
        return this.eventService.findById(id);
    }


    // Endpoint para crear un evento. Requiere autenticación JWT y rol de 'admin'.
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para crear un evento
    @Post()
    async create(@Body() createEventDto: CreateEventDto, @Request() req: any) {
        console.log('Llamado al controlador crear evento'); // Para verificar que se está llamando

        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        createEventDto.user_id = userId; // Asigna el userId al evento

        // Si no se proporcionan las coordenadas en el DTO, obtenlas desde la ubicación (location_id)
        if (!createEventDto.coordinates) {
            const address = await this.eventService.getAddress(createEventDto.location_id);
            const coordinates = await this.getCoordinatesFromAddress(address);
            console.log('DIRECCION: ', address); // Para verificar que se está llamando
            console.log('COORDENADAS: ', coordinates); // Para verificar que se está llamando

            if (coordinates) {
                createEventDto.coordinates = coordinates;
            } else {
                this.logger.warn(`No se pudieron obtener coordenadas para la ubicación con ID: ${createEventDto.location_id}`);
                // Asignar coordenadas del Obelisco de Buenos Aires
                createEventDto.coordinates = [0, 0]; // [lon, lat]
                this.logger.warn('Se asignaron las coordenadas por defecto  [0, 0] para indicar que no tiene coordenadas');
            }
        }
        console.log('EVENTO POR CREAR: ', createEventDto); // Para verificar que se está llamando

        return this.eventService.create(createEventDto, userRole);
    }


    // Endpoint para actualizar un evento (PATCH). Requiere autenticación JWT y rol de 'admin'.
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para modificar un evento
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        updateEventDto.user_id = userId; // Asigna el userId al evento
        return this.eventService.update(id, updateEventDto, userRole);
    }


    // Endpoint para actualizar un evento (PATCH). Requiere autenticación JWT y rol de 'admin'.
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para modificar un evento
    @Put(':id')
    async put(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        updateEventDto.user_id = userId; // Asigna el userId al evento
        return this.eventService.update(id, updateEventDto, userRole);
    }


    // Endpoint para eliminar un evento. Requiere autenticación JWT y rol de 'admin'.
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para modificar un evento
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        return this.eventService.delete(id, userRole);
    }


    // Endpoint para actualizar un asiento dentro de un evento. Requiere autenticación JWT.
    @UseGuards(JwtAuthGuard)
    @Patch(':eventId/seat')
    async updateSeat(@Param('eventId') eventId: string, @Body() updateSeatDto: UpdateSeatDto, @Request() req: any) {
        const userRole = req.user.role;
        return this.eventService.updateSeat(eventId, updateSeatDto);
    }


    // Endpoint para enviar lista de reservas. Requiere autenticación JWT.
    @UseGuards(JwtAuthGuard)
    @Patch(':eventId/reservations')
    async reservations(@Param('eventId') eventId: string, @Body() reservationsDto: CreateEventReservationsDto, @Request() req: any) {
        const userRole = req.user.role;
        return this.eventService.reservations(eventId, reservationsDto);
    }


    // Endpoint para crear un asiento en un evento. Requiere autenticación JWT.
    @UseGuards(JwtAuthGuard)
    @Patch(':eventId/place')
    async createSeat(@Param('eventId') eventId: string, @Body() createSeatDto: CreateSeatDto, @Request() req: any) {
        const userRole = req.user.role;
        return this.eventService.createSeat(eventId, createSeatDto);
    }


    // Endpoint para obtener las reservas realizadas por un usuario específico. Requiere autenticación JWT.
    @UseGuards(JwtAuthGuard)
    @Get('reservedBy/:id')
    async getReservationsByReservedBy(@Param('id') id: string, @Request() req: any) {
        return this.eventService.getReservationsByReservedBy(id);
    }

}

