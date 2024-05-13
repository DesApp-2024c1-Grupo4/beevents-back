/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './events.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    ) { }

    async create(eventDto: CreateEventDto, userRole: string): Promise<Event> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden crear los eventos');
        }
        const createdEvent = new this.eventModel(eventDto);
        return createdEvent.save();
    }

    async findAll(userRole: string): Promise<Event[]> {
        if (userRole !== 'user' && userRole !== 'admin') {
            throw new ForbiddenException('Solo los usuarios pueden ver los eventos');
        }
        return this.eventModel.find().exec();
    }

    async findById(id: string, userRole: string): Promise<Event> {
        if (userRole !== 'user' && userRole !== 'admin') {
            throw new ForbiddenException('Solo los usuarios pueden ver los eventos');
        }
        const event = await this.eventModel.findById(id).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }
        return event;
    }

    async update(id: string, eventDto: UpdateEventDto, userRole: string): Promise<Event> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden actualizar los eventos');
        }
        const updatedEvent = await this.eventModel.findByIdAndUpdate(id, eventDto, { new: true }).exec();
        if (!updatedEvent) {
            throw new NotFoundException('Evento no encontado');
        }
        return updatedEvent;
    }

    async delete(id: string, userRole: string): Promise<Event> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden eliminar los eventos');
        }
        const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec();
        if (!deletedEvent) {
            throw new NotFoundException('Evento no encontrado');
        }
        return deletedEvent;
    }
}

