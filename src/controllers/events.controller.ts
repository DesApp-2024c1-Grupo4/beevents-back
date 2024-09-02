/* eslint-disable prettier/prettier */
// events.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body, Put, UseGuards, Request, SetMetadata } from '@nestjs/common';
import { EventService } from '../modules/events/events.services';
import { CreateEventDto } from '../modules/events/dto/create-event.dto';
import { UpdateEventDto } from '../modules/events/dto/update-event.dto';
import { UpdateSeatDto } from '../modules/events/dto/update-seat.dto';
import { CreateSeatDto } from '../modules/events/dto/create-seat.dto';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';

@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Get()
    async findUpcomingEvents(@Request() req: any) {
        //const userRole = req.user.role;
        return this.eventService.findUpcomingEvents();
    }

    @Get('allEvents')
    async findAllEvents(@Request() req: any) {
        //const userRole = req.user.role;
        return this.eventService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string, @Request() req: any) {
        //const userRole = req.user.role;
        return this.eventService.findById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para crear un evento
    @Post()
    async create(@Body() createEventDto: CreateEventDto, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        createEventDto.user_id = userId; // Asigna el userId al evento
        return this.eventService.create(createEventDto, userRole);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para modificar un evento
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        updateEventDto.user_id = userId; // Asigna el userId al evento
        return this.eventService.update(id, updateEventDto, userRole);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para modificar un evento
    @Put(':id')
    async put(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        updateEventDto.user_id = userId; // Asigna el userId al evento
        return this.eventService.update(id, updateEventDto, userRole);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para modificar un evento
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        return this.eventService.delete(id, userRole);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':eventId/seat')
    async updateSeat(@Param('eventId') eventId: string, @Body() updateSeatDto: UpdateSeatDto, @Request() req: any) {
        const userRole = req.user.role;
        return this.eventService.updateSeat(eventId, updateSeatDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':eventId/place')
    async createSeat(@Param('eventId') eventId: string, @Body() createSeatDto: CreateSeatDto, @Request() req: any) {
        const userRole = req.user.role;
        return this.eventService.createSeat(eventId, createSeatDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('reservedBy/:id')
    async getReservationsByReservedBy(@Param('id') id: string, @Request() req: any) {
        return this.eventService.getReservationsByReservedBy(id);
    }
}
