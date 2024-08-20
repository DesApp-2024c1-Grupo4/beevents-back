/* eslint-disable prettier/prettier */
//events.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body, Put, UseGuards} from '@nestjs/common';
import { EventService } from '../modules/events/events.services';
import { CreateEventDto } from '../modules/events/dto/create-event.dto';
import { UpdateEventDto } from '../modules/events/dto/update-event.dto';
import { UpdateSeatDto } from '../modules/events/dto/update-seat.dto';
import { CreateSeatDto } from '../modules/events/dto/create-seat.dto';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';

// FALTA definir como tomar el user_role segun el usuario
const user_role = 'admin'


@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Get()
    async findUpcomingEvents() {
        return this.eventService.findUpcomingEvents(user_role);
    }

    @Get('allEvents')
    async findAllEvents() {
        return this.eventService.findAll(user_role);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.eventService.findById(id, user_role);
    }
    
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() createEventDto: CreateEventDto) {
        return this.eventService.create(createEventDto, user_role);
    }
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        return this.eventService.update(id, updateEventDto, user_role);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async put(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        return this.eventService.update(id, updateEventDto, user_role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.eventService.delete(id, user_role);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':eventId/seat')
    async updateSeat(@Param('eventId') eventId: string, @Body() updateSeatDto: UpdateSeatDto) {
        return this.eventService.updateSeat(eventId, updateSeatDto);
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