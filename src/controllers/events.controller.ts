/* eslint-disable prettier/prettier */
// events.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body, Put, UseGuards, Request, SetMetadata, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { EventService } from '../modules/events/events.services';
import { Event, EventDocument } from '../modules/events/events.schema';
import { CreateEventDto } from '../modules/events/dto/create-event.dto';
import { UpdateEventDto } from '../modules/events/dto/update-event.dto';
import { UpdateSeatDto } from '../modules/events/dto/update-seat.dto';
import { CreateSeatDto } from '../modules/events/dto/create-seat.dto';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';
import { LocationService } from '../modules/locations/locations.services';
import axios from 'axios';  // Asegúrate de tener axios instalado

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

    private async getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

        try {
            const response = await axios.get(url);
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
    async getNearbyEvents(@Request() req) {
        try {
            // Llama a un servicio externo para obtener la IP pública
            const response = await axios.get('https://api.ipify.org?format=json');
            const clientIP = response.data.ip;
            // const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(`IP pública del cliente: ${clientIP}`);
            // return { ip: clientIP };
            // Lógica para obtener la ubicación según la IP pública
            const clientLocation = await this.getLocationFromIP(clientIP);
            // return { LOCATION: clientLocation };

            if (clientLocation) {
                const { lon, lat } = clientLocation;
                const events = await this.eventService.findNearbyEvents(lon, lat);
                return events;
            } else {
                return { message: 'No se pudo obtener la ubicación' };
            }
        } catch (error) {
            console.error('Error al obtener la IP pública:', error);
            return { message: 'Error al obtener la IP pública' };
        }
    }

    // Definir la función getLocationFromIP en el controlador
    async getLocationFromIP(ip: string) {
        try {
            const response = await axios.get(`http://ip-api.com/json/${ip}`);
            if (response.data.status === 'success') {
                return {
                    lat: response.data.lat,
                    lon: response.data.lon
                };
            }
        } catch (error) {
            console.error('Error obteniendo ubicación por IP:', error);
        }
        return null;
    }

    // Endpoint para obtener los eventos futuros. No requiere autenticación.
    @Get()
    async findUpcomingEvents(@Request() req: any) {
        return this.eventService.findUpcomingEvents();
    }

    // Endpoint para obtener todos los eventos. No requiere autenticación.
    @Get('allEvents')
    async findAllEvents(@Request() req: any) {
        return this.eventService.findAll();
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
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        createEventDto.user_id = userId; // Asigna el userId al evento
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

    // Endpoint para actualizar un evento (PUT). Requiere autenticación JWT y rol de 'admin'.
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
