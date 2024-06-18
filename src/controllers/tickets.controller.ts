/* eslint-disable prettier/prettier */
//ticket.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body, Put, } from '@nestjs/common';
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
    @Get('numberedSold/:id')
    async filterNumbered(@Param('id') id: string) {
        return this.ticketService.filterNumbered(id);
    }

    // hace filter de los tickets por id de evento, solo aquellos que numered sean true
    @Get('notNumberedSold/:id')
    async filterNotNumbered(@Param('id') id: string) {
        return this.ticketService.filterNotNumbered(id);
    }

    @Get('lastFilteredNumbered/:id')
    async getLastFilteredNumbered(@Param('id') id: string) {
        return this.ticketService.getLastFilteredNumbered(id);
    }

    //hacer el lastSold/:eventId/:date/:place

    // retorna la cantidad de tickets para un event, date y place sin importar si son numerados o no
    @Get('quantitySold/:eventId/:date/:place')
    async quantitySold(@Param('eventId') eventId: string, @Param('date') date: string, @Param('place') place: string) {
        return this.ticketService.quantitySold(eventId, date, place);
    }    

    // retorna la cantidad de tickets para un event, date y place no numerado
    @Get('quantityNotNumberedSold/:eventId/:date/:place')
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

    @Put(':id')
    async fullUpdate(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
        return this.ticketService.update(id, updateTicketDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.ticketService.delete(id);
    }
}
