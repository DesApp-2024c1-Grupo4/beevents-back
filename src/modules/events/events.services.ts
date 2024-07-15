/* eslint-disable prettier/prettier */
// events.services.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './events.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { CreateSeatDto } from './dto/create-seat.dto';

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

    async updateSeat(eventId: string, updateSeatDto: UpdateSeatDto): Promise<any> {
        const event = await this.eventModel.findById(eventId).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        const { sectorId, date_time, displayId, reservedBy } = updateSeatDto;
        const currentDate = new Date();

        const date = event.dates.find(dateItem => dateItem.date_time.toISOString() === date_time);
        if (!date) {
            throw new NotFoundException('Fecha no encontrada');
        }

        const sector = date.sectors.find(sectorItem => sectorItem._id.toString() === sectorId && sectorItem.numbered);
        if (!sector) {
            throw new NotFoundException('Sector no encontrado o no numerado');
        }

        let seatUpdated = false;

        for (const row of sector.rows) {
            const seat = row.find(seatItem => seatItem.displayId === displayId);
            if (seat) {
                if (!seat.available) {
                    throw new BadRequestException('El asiento no está disponible');
                }
                seat.available = false;
                seat.timestamp = currentDate;
                seat.reservedBy = reservedBy;
                seatUpdated = true;
                break;
            }
        }

        if (!seatUpdated) {
            throw new NotFoundException('Asiento no encontrado');
        }

        sector.available -= 1;

        await event.save();

        return { message: 'Reserva realizada correctamente' };
    }

    async createSeat(eventId: string, createSeatDto: CreateSeatDto): Promise<any> {
        const event = await this.eventModel.findById(eventId).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        const { sectorId, reservedBy, date_time } = createSeatDto;
        const currentDate = new Date();

        const date = event.dates.find(dateItem => dateItem.date_time.toISOString() === date_time);
        if (!date) {
            throw new NotFoundException('Fecha no encontrada');
        }

        const sector = date.sectors.find(sectorItem => sectorItem._id.toString() === sectorId && !sectorItem.numbered);
        if (!sector) {
            throw new BadRequestException('No se puede realizar esta reserva porque es un sector numerado o el sector no existe');
        }

        const seat = {
            displayId: '',
            available: false,
            timestamp: currentDate,
            reservedBy: reservedBy,
        };

        if (!sector.rows) {
            sector.rows = [];
        }

        if (sector.rows.length === 0) {
            sector.rows.push([seat]);
        } else {
            sector.rows[0].push(seat);
        }

        sector.available -= 1;

        await event.save();

        return { message: 'Place creado correctamente' };
    }

    async getReservationsByReservedBy(reservedBy: string): Promise<any[]> {
        const events = await this.eventModel.find().exec();
        const reservations: any[] = [];

        events.forEach(event => {
            event.dates.forEach(date => {
                date.sectors.forEach(sector => {
                    if (sector.numbered) {
                        sector.rows.forEach(row => {
                            row.forEach(seat => {
                                if (seat.reservedBy === reservedBy) {
                                    reservations.push({
                                        numbered: true,
                                        EventName: event.name,
                                        SectorName: sector.name,
                                        date_time: date.date_time,
                                        displayId: seat.displayId,
                                        timestamp: seat.timestamp,
                                        reservedBy: seat.reservedBy,
                                    });
                                }
                            });
                        });
                    } else {
                        const seatsReserved = sector.rows.flat().filter(seat => seat.reservedBy === reservedBy);
                        if (seatsReserved.length > 0) {
                            reservations.push({
                                numbered: false,
                                EventName: event.name,
                                SectorName: sector.name,
                                date_time: date.date_time,
                                cantidad: seatsReserved.length,
                                reservedBy: reservedBy
                            });
                        }
                    }
                });
            });
        });

        return reservations;
    }
}

