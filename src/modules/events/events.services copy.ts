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
import { Location, LocationDocument } from '../locations/locations.schema'; // Importamos el modelo de Location para obtener el name
import * as crypto from 'crypto';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
        @InjectModel(Location.name) private readonly locationModel: Model<LocationDocument>, // Inyecta el modelo de Location
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
            idTicket: generateIdTicket()  // Generar idTicket para el nuevo asiento
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

        return { message: 'Asiento creado correctamente' };
    }

    async getReservationsByReservedBy(reservedBy: string): Promise<any[]> {
        const events = await this.eventModel.find().exec();
        const reservations: any[] = [];

        for (const event of events) {
            // Busca la información de la location correspondiente
            const location = await this.locationModel.findById(event.location_id).exec();
            if (!location) {
                throw new NotFoundException('Ubicación no encontrada');
            }

            event.dates.forEach(date => {
                date.sectors.forEach(sector => {
                    if (sector.numbered) {
                        sector.rows.forEach(row => {
                            row.forEach(seat => {
                                if (seat.reservedBy === reservedBy) {
                                    reservations.push({
                                        numbered: true,
                                        eventName: event.name,
                                        artist: event.artist,
                                        image: event.image,
                                        locationName: location.name,
                                        sectorName: sector.name,
                                        date_time: date.date_time,
                                        displayId: seat.displayId,
                                        timestamp: seat.timestamp,
                                        reservedBy: seat.reservedBy,
                                        idTicket: seat.idTicket  // Incluir idTicket para asientos numerados
                                    });
                                }
                            });
                        });
                    } else {
                        const seatsReserved = sector.rows.flat().filter(seat => seat.reservedBy === reservedBy);
                        if (seatsReserved.length > 0) {
                            reservations.push({
                                numbered: false,
                                eventName: event.name,
                                artist: event.artist,
                                image: event.image,
                                locationName: location.name,
                                sectorName: sector.name,
                                date_time: date.date_time,
                                cantidad: seatsReserved.length,
                                reservedBy: reservedBy,
                                idTicket: seatsReserved[0].idTicket  // Incluir idTicket del primer asiento reservado
                            });
                        }
                    }
                });
            });
        }

        return reservations;
    }
}

// Función para generar un código alfanumérico de 6 caracteres con letras mayúsculas y números
function generateIdTicket(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let idTicket = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        idTicket += chars[randomIndex];
    }
    return idTicket;
}