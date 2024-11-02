/* eslint-disable prettier/prettier */
// events.controller.ts

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
import { LocationService } from '../modules/locations/locations.services';
import axios from 'axios';

@Controller('event')
export class EventController {
    private readonly logger = new Logger(EventController.name);

    constructor(
        private readonly eventService: EventService,
        private readonly locationService: LocationService, // Corrección en el typo
    ) { }

    // Endpoint para actualizar todos los eventos agregando la propiedad coordenadas
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
        this.logger.warn(`Dirección obtenida: ${encodeURIComponent(address)}`);
        this.logger.warn(`URL obtenida: ${url}`);
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
    async getNearbyEvents(@Query('lat') lat: any, @Query('lon') lon: any) {
        console.log('Llamado al controlador nearby');
        try {
            if (!lat || !lon) {
                return { message: 'Faltan las coordenadas de latitud y longitud' };
            }

            const events = await this.eventService.findNearbyEvents(lon, lat);
            return events;
        } catch (error) {
            return { message: 'Error al obtener los eventos cercanos' };
        }
    }

    // Método auxiliar para obtener ubicación desde la IP
    private async getLocationFromIP() {
        try {
            const geoResponse = await axios.get('https://get.geojs.io/v1/ip/geo.json');
            return {
                lat: geoResponse.data.latitude,
                lon: geoResponse.data.longitude,
            };
        } catch (error) {
            console.error('Error obteniendo ubicación por IP:', error);
        }
        return null;
    }

    // Endpoint para obtener los eventos futuros. No requiere autenticación.
    @Get()
    async findUpcomingEvents() {
        return this.eventService.findUpcomingEvents();
    }

    // Endpoint para obtener todos los eventos. No requiere autenticación.
    @Get('allEvents')
    async findAllEvents() {
        return this.eventService.findAll();
    }

    // Endpoint para obtener todos los eventos, con o sin publicaciones y con detalles de asientos.
    @Get('allEventsFull')
    async findAllFull() {
        return this.eventService.findAllFull();
    }

    // Endpoint para obtener todos los eventos, vencidos, publicados y no publicados.
    @Get('pubAndNotPub')
    async findUpcomingAll() {
        return this.eventService.findUpcomingAll();
    }

    // Endpoint para obtener un evento por su ID. No requiere autenticación.
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.eventService.findById(id);
    }

    // Endpoint para crear un evento. Requiere autenticación JWT y rol de 'admin'.
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin')
    @Post()
    async create(@Body() createEventDto: CreateEventDto, @Request() req: any) {
        console.log('Llamado al controlador crear evento');

        const userRole = req.user.role;
        const userId = req.user.userId;
        createEventDto.user_id = userId;

        // Obtiene coordenadas si no se proporcionan en el DTO
        if (!createEventDto.coordinates) {
            const address = await this.eventService.getAddress(createEventDto.location_id);
            const coordinates = await this.getCoordinatesFromAddress(address);
            console.log('DIRECCIÓN:', address);
            console.log('COORDENADAS:', coordinates);

            if (coordinates) {
                createEventDto.coordinates = coordinates;
            } else {
                this.logger.warn(`No se pudieron obtener coordenadas para la ubicación con ID: ${createEventDto.location_id}`);
                createEventDto.coordinates = [-58.3816, -34.6037]; // Coordenadas por defecto
                this.logger.warn('Se asignaron las coordenadas del Obelisco de Buenos Aires');
            }
        }
        console.log('EVENTO POR CREAR:', createEventDto);

        return this.eventService.create(createEventDto, userRole);
    }

    // Métodos para actualizar y eliminar eventos, requieren autenticación y rol de 'admin'
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin')
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req: any) {
        const userRole = req.user.role;
        updateEventDto.user_id = req.user.userId;
        return this.eventService.update(id, updateEventDto, userRole);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin')
    @Put(':id')
    async put(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req: any) {
        const userRole = req.user.role;
        updateEventDto.user_id = req.user.userId;
        return this.eventService.update(id, updateEventDto, userRole);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin')
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req: any) {
        const userRole = req.user.role;
        return this.eventService.delete(id, userRole);
    }

    // Métodos para manejar asientos y reservas en eventos, requieren autenticación
    @UseGuards(JwtAuthGuard)
    @Patch(':eventId/seat')
    async updateSeat(@Param('eventId') eventId: string, @Body() updateSeatDto: UpdateSeatDto) {
        return this.eventService.updateSeat(eventId, updateSeatDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':eventId/reservations')
    async reservations(@Param('eventId') eventId: string, @Body() reservationsDto: CreateEventReservationsDto) {
        return this.eventService.reservations(eventId, reservationsDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':eventId/place')
    async createSeat(@Param('eventId') eventId: string, @Body() createSeatDto: CreateSeatDto) {
        return this.eventService.createSeat(eventId, createSeatDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('reservedBy/:id')
    async getReservationsByReservedBy(@Param('id') id: string) {
        return this.eventService.getReservationsByReservedBy(id);
    }
}
