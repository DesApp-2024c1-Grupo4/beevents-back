/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './tickets.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<TicketDocument>,
  ) { }

  async findAll(): Promise<Ticket[]> {
    return this.ticketModel.find().exec();
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return ticket;
  }

  async filterNumbered(eventId: string): Promise<Ticket[]> {
    return this.ticketModel.find({
      event_id: eventId,
      place: { $elemMatch: { numbered: true } }
    }).exec();
  }

  async getLastFilteredNumbered(eventId: string): Promise<Ticket | null> {
    const filteredTickets = await this.filterNumbered(eventId);
    if (filteredTickets.length > 0) {
      return filteredTickets[filteredTickets.length - 1];
    } else {
      return null;
    }
  }

  async filterNotNumbered(eventId: string): Promise<Ticket[]> {
    return this.ticketModel.find({
      event_id: eventId,
      place: { $elemMatch: { numbered: false } }
    }).exec();
  }

  async quantityNotNumbered(eventId: string, date: string, place: string): Promise<number> {
    return this.ticketModel.countDocuments({
      event_id: eventId,
      place: { $elemMatch: { date_time: new Date(date), sector: place, numbered: false } }
    }).exec();
  }


  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const createdTicket = new this.ticketModel(createTicketDto);
    return createdTicket.save();
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const updatedTicket = await this.ticketModel.findByIdAndUpdate(id, updateTicketDto, { new: true }).exec();
    if (!updatedTicket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return updatedTicket;
  }

  async delete(id: string): Promise<Ticket> {
    const deletedTicket = await this.ticketModel.findByIdAndDelete(id).exec();
    if (!deletedTicket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return deletedTicket;
  }
}
