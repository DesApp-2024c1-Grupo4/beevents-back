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
