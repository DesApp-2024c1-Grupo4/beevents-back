/* eslint-disable prettier/prettier */
//events.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body, Put, } from '@nestjs/common';
import { EventService } from '../modules/events/events.services';
import { CreateEventDto } from '../modules/events/dto/create-event.dto';
import { UpdateEventDto } from '../modules/events/dto/update-event.dto';
import { UpdateSeatDto } from '../modules/events/dto/update-seat.dto';

// FALTA definir como tomar el user_role segun el usuario
const user_role = 'admin'

@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Get()
    async findAll() {
        // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
        return this.eventService.findAll(user_role);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
        return this.eventService.findById(id, user_role);
    }

    @Post()
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async create(@Body() createEventDto: CreateEventDto) {
        return this.eventService.create(createEventDto, user_role);
    }

    @Patch(':id')
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        return this.eventService.update(id, updateEventDto, user_role);
    }

    @Put(':id')
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async put(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        return this.eventService.update(id, updateEventDto, user_role);
    }

    @Delete(':id')
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async delete(@Param('id') id: string) {
        return this.eventService.delete(id, user_role);
    }

    @Patch(':eventId/seat')
    async updateSeat(@Param('eventId') eventId: string, @Body() updateSeatDto: UpdateSeatDto) {
        return this.eventService.updateSeat(eventId, updateSeatDto);
    }
}