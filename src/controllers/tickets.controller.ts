/* eslint-disable prettier/prettier */
//ticket.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TicketService } from '../modules/tickets/tickets.services';
import { CreateTicketDto } from '../modules/tickets/dto/create-ticket.dto';
import { UpdateTicketDto } from '../modules/tickets/dto/update-ticket.dto';

@Controller('ticket')
export class TicketController {
    constructor(private readonly ticketService: TicketService) { }

    @Get()
    async findAll() {
        return this.ticketService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.ticketService.findById(id);
    }

    // hace filter de los tickets por id de evento, solo aquellos que numered sean true
    @Get('numbered/:id')
    async filterNumbered(@Param('id') id: string) {
        return this.ticketService.filterNumbered(id);
    }

    // hace filter de los tickets por id de evento, solo aquellos que numered sean true
    @Get('notNumbered/:id')
    async filterNotNumbered(@Param('id') id: string) {
        return this.ticketService.filterNotNumbered(id);
    }

    // retorna la cantidad de tickets para un event, date y place
    @Get('quantityNotNumbered/:eventId/:date/:place')
    async quantityNotNumbered(@Param('eventId') eventId: string, @Param('date') date: string, @Param('place') place: string) {
        return this.ticketService.quantityNotNumbered(eventId, date, place);
    }

    @Post()
    async create(@Body() createTicketDto: CreateTicketDto) {
        return this.ticketService.create(createTicketDto);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
        return this.ticketService.update(id, updateTicketDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.ticketService.delete(id);
    }
}
