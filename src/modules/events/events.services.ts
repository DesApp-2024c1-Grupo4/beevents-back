/* eslint-disable prettier/prettier */
// events.services.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument, Dates, Sector } from './events.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { CreateSeatDto } from './dto/create-seat.dto';
import { CreateEventReservationsDto } from './dto/reservations.dto'
import { Location, LocationDocument } from '../locations/locations.schema'; // Importamos el modelo de Location para obtener el name
import * as crypto from 'crypto';
import mongoose from 'mongoose';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
        @InjectModel(Location.name) private readonly locationModel: Model<LocationDocument>, // Inyecta el modelo de Location
    ) { }


    async reservations(eventId: string, reservationsDto: CreateEventReservationsDto): Promise<any> {
        const event = await this.eventModel.findById(eventId).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }
    
        const { reservedBy, numbered, notNumbered } = reservationsDto;
        const currentDate = new Date();
    
        // Manejo para sectores numerados
        for (const numberedSector of numbered) {
            // Busca la fecha dentro del sector numerado
            const date = event.dates.find(dateItem => dateItem.date_time.toISOString() === numberedSector.date_time);
            if (!date) {
                throw new NotFoundException('Fecha no encontrada');
            }
    
            const sector = date.sectors.find(sectorItem => sectorItem._id.toString() === numberedSector.sector_id && sectorItem.numbered);
            if (!sector) {
                throw new NotFoundException('Sector numerado no encontrado');
            }
    
            // Validar si todos los asientos en el DTO están disponibles
            const allAvailable = numberedSector.reservations.every(reservation => {
                return sector.rows.some(row =>
                    row.some(seat => seat.displayId === reservation.displayId && seat.available === "true")
                );
            });
    
            if (!allAvailable) {
                throw new BadRequestException('Alguno de los asientos no está disponible');
            }
    
            // Actualización de los asientos
            for (const reservation of numberedSector.reservations) {
                let seatUpdated = false;
                for (const row of sector.rows) {
                    const seat = row.find(seatItem => seatItem.displayId === reservation.displayId);
                    if (seat) {
                        seat.available = event.publicated ? "false" : "preReserved";
                        seat.timestamp = currentDate;
                        seat.reservedBy = reservedBy;
                        sector.available -= 1;
                        sector.ocuped += 1;
                        seatUpdated = true;
                        break;
                    }
                }
                if (!seatUpdated) {
                    throw new NotFoundException(`Asiento con displayId ${reservation.displayId} no encontrado`);
                }
            }
        }
    
        // Manejo para sectores no numerados
        for (const notNumberedSector of notNumbered) {
            // Busca la fecha dentro del sector no numerado
            const date = event.dates.find(dateItem => dateItem.date_time.toISOString() === notNumberedSector.date_time);
            if (!date) {
                throw new NotFoundException('Fecha no encontrada');
            }
    
            const sector = date.sectors.find(sectorItem => sectorItem._id.toString() === notNumberedSector.sector_id && !sectorItem.numbered);
            if (!sector) {
                throw new NotFoundException('Sector no numerado no encontrado');
            }
    
            // Validar si hay suficientes asientos disponibles
            if (notNumberedSector.quantity > sector.available) {
                throw new BadRequestException('No hay suficientes asientos disponibles en el sector no numerado');
            }
    
            // Crear asientos en el sector no numerado
            for (let i = 0; i < notNumberedSector.quantity; i++) {
                const seat = {
                    displayId: '',
                    available: event.publicated ? "false" : "preReserved",
                    timestamp: currentDate,
                    reservedBy: reservedBy,
                    idTicket: generateIdTicket()
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
                sector.ocuped += 1;
            }
        }
    
        await event.save();
    
        return { message: 'Reservas realizadas correctamente' };
    }
    

    /* version previa a la pedida por Luqui
    async reservations(eventId: string, reservationsDto: CreateEventReservationsDto): Promise<any> {
        const event = await this.eventModel.findById(eventId).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }
    
        const { date_time, reservedBy, numbered, notNumbered } = reservationsDto;
        const currentDate = new Date();
    
        const date = event.dates.find(dateItem => dateItem.date_time.toISOString() === date_time);
        if (!date) {
            throw new NotFoundException('Fecha no encontrada');
        }
    
        // Manejo para sectores numerados
        for (const numberedSector of numbered) {
            const sector = date.sectors.find(sectorItem => sectorItem._id.toString() === numberedSector.sector_id && sectorItem.numbered);
            if (!sector) {
                throw new NotFoundException('Sector numerado no encontrado');
            }
    
            // Validar si todos los asientos en el DTO están disponibles
            const allAvailable = numberedSector.reservations.every(reservation => {
                return sector.rows.some(row =>
                    row.some(seat => seat.displayId === reservation.displayId && seat.available === "true")
                );
            });
    
            if (!allAvailable) {
                throw new BadRequestException('Alguno de los asientos no está disponible');
            }
    
            // Actualización de los asientos
            for (const reservation of numberedSector.reservations) {
                let seatUpdated = false;
                for (const row of sector.rows) {
                    const seat = row.find(seatItem => seatItem.displayId === reservation.displayId);
                    if (seat) {
                        seat.available = event.publicated ? "false" : "preReserved";
                        seat.timestamp = currentDate;
                        seat.reservedBy = reservedBy;
                        sector.available -= 1;
                        sector.ocuped += 1;
                        seatUpdated = true;
                        break;
                    }
                }
                if (!seatUpdated) {
                    throw new NotFoundException(`Asiento con displayId ${reservation.displayId} no encontrado`);
                }
            }
        }
    
        // Manejo para sectores no numerados
        for (const notNumberedSector of notNumbered) {
            const sector = date.sectors.find(sectorItem => sectorItem._id.toString() === notNumberedSector.sector_id && !sectorItem.numbered);
            if (!sector) {
                throw new NotFoundException('Sector no numerado no encontrado');
            }
    
            // Validar si hay suficientes asientos disponibles
            if (notNumberedSector.quantity > sector.available) {
                throw new BadRequestException('No hay suficientes asientos disponibles en el sector no numerado');
            }
    
            // Crear asientos en el sector no numerado
            for (let i = 0; i < notNumberedSector.quantity; i++) {
                const seat = {
                    displayId: '',
                    available: event.publicated ? "false" : "preReserved",
                    timestamp: currentDate,
                    reservedBy: reservedBy,
                    idTicket: generateIdTicket()
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
                sector.ocuped += 1;
            }
        }
    
        await event.save();
    
        return { message: 'Reservas realizadas correctamente' };
    }
            
*/

    async create(eventDto: CreateEventDto, userRole: string): Promise<Event> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden crear los eventos');
        }
        const createdEvent = new this.eventModel(eventDto);
        return createdEvent.save();
    }

    
    async findAllFull(): Promise<Event[]> {
        return this.eventModel.find().exec();
    }
    


//*** Retorna solo algunos campos del evento
async findAll(): Promise<any[]> {
    const events = await this.eventModel.find().exec();
    
    // Mapeamos los datos para responder solo con la información necesaria
    return events.map(event => ({
        _id: event._id,
        name: event.name,
        artist: event.artist,
        image: event.image,
        description: event.description,
        location_id: event.location_id,
        user_id: event.user_id,
        dates: event.dates.map(date => ({
            date_time: date.date_time,
            sectors: date.sectors.map(sector => ({
                name: sector.name,
                numbered: sector.numbered,
                _id: sector._id,
                available: sector.available,
                capacity: sector.capacity,
                ocuped: sector.ocuped,
            })),
            _id: date._id,
        })),
        publicated: event.publicated,
    }));
}





/*
    async findUpcomingEvents(): Promise<Event[]> {
        const currentDate = new Date();
        const events = await this.eventModel.find({ publicated: true }).exec();
    
        return events
            .map(event => {
                event.dates = event.dates.filter(date => date.date_time >= currentDate);
                return event;
            })
            .filter(event => event.dates.length > 0);
    }

*/


//*** Retorna solo algunos campos del evento

async findUpcomingEvents(): Promise<any[]> {
    const currentDate = new Date();
    const events = await this.eventModel.find({ publicated: true }).exec();
    
    // Filtramos los datos para responder solo con la información necesaria
    return events
        .map(event => ({
            _id: event._id,
            name: event.name,
            artist: event.artist,
            image: event.image,
            description: event.description,
            location_id: event.location_id,
            user_id: event.user_id,
            dates: event.dates
                .filter(date => date.date_time >= currentDate)
                .map(date => ({
                    date_time: date.date_time,
                    sectors: date.sectors.map(sector => ({
                        name: sector.name,
                        numbered: sector.numbered,
                        _id: sector._id,
                        available: sector.available,
                        capacity: sector.capacity,
                        ocuped: sector.ocuped,
                    })),
                    _id: date._id,
                })),
            publicated: event.publicated,
        }))
        .filter(event => event.dates.length > 0);
}


/*
    async findUpcomingAll(): Promise<Event[]> {
        const currentDate = new Date();
        const events = await this.eventModel.find().exec();
    
        return events
            .map(event => {
                event.dates = event.dates.filter(date => date.date_time >= currentDate);
                return event;
            })
            .filter(event => event.dates.length > 0);
    }

*/

//*** Retorna solo algunos campos del evento 
async findUpcomingAll(): Promise<any[]> {
    const currentDate = new Date();
    const events = await this.eventModel.find().exec();

    return events
        .map(event => ({
            _id: event._id,
            name: event.name,
            artist: event.artist,
            image: event.image,
            description: event.description,
            location_id: event.location_id,
            user_id: event.user_id,
            dates: event.dates
                .filter(date => date.date_time >= currentDate)
                .map(date => ({
                    date_time: date.date_time,
                    sectors: date.sectors.map(sector => ({
                        name: sector.name,
                        numbered: sector.numbered,
                        _id: sector._id,
                        available: sector.available,
                        capacity: sector.capacity,
                        ocuped: sector.ocuped,
                    })),
                    _id: date._id,
                })),
            publicated: event.publicated,
        }))
        .filter(event => event.dates.length > 0);
}




    async findById(id: string): Promise<Event> {
        const event = await this.eventModel.findById(id).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }
//        if (!event.publicated) {
//            throw new ForbiddenException('Evento no publicado');
//        }
        return event;
    }
          


/*
// logica previa

async update(id: string, eventDto: UpdateEventDto, userRole: string): Promise<Event> {
    if (userRole !== 'admin') {
        throw new ForbiddenException('Solo los administradores pueden actualizar los eventos');
    }

    const event = await this.eventModel.findById(id).exec();
    if (!event) {
        throw new NotFoundException('Evento no encontrado');
    }

    // Si en el body solo se informa el atributo publicated, actualizamos solo ese campo
    if (Object.keys(eventDto).length === 2 && 'publicated' in eventDto) {
        event.publicated = eventDto.publicated;
        return event.save();
    }

    const currentSectors = event.dates.flatMap(date => date.sectors);
    Object.assign(event, eventDto);

    event.dates.forEach(dateItem => {
        dateItem.sectors.forEach(sector => {
            const existingSector = currentSectors.find(currentSector => currentSector._id.toString() === sector._id.toString());

            if (existingSector) {
                // Si el sector ya existe, mantenemos las filas y la disponibilidad existentes
                sector.rows = existingSector.rows; // Mantenemos las filas existentes
                sector.available = existingSector.available; // Mantenemos la disponibilidad existente
            } else {
                // Si el sector no existe, inicializamos sus filas y asientos
                if (sector.numbered) {
                    sector.rows = []; // Reiniciamos filas solo si es un sector numerado
                    for (let i = 0; i < sector.rowsNumber; i++) {
                        const rowLabel = numberToAlphabet(i);
                        const rowSeats = [];
                        for (let j = 0; j < sector.seatsNumber; j++) {
                            const isEliminated = existingSector && existingSector.eliminated[i] && existingSector.eliminated[i][j];
                            rowSeats.push({
                                displayId: `${rowLabel}-${j + 1}`,
                                available: isEliminated ? "eliminated" : "true", // Verificamos si el asiento está en eliminados
                                timestamp: new Date(),
                                reservedBy: "vacio",
                                idTicket: generateIdTicket()
                            });
                        }
                        sector.rows.push(rowSeats);
                    }
                    sector.available = sector.rowsNumber * sector.seatsNumber; // Establecemos la capacidad total
                } else {
                    // Para sectores no numerados, se puede inicializar la capacidad
                    sector.available = sector.rowsNumber * sector.seatsNumber; // Establecemos el disponible del sector no numerado
                    sector.capacity = sector.rowsNumber * sector.seatsNumber; // Establecemos la capacidad total
                }
            }
        });
    });

    return event.save();
}
*/

    // lógica de update que agrega sectores pero al agregar fecha no limpia las reservas
    async update(id: string, eventDto: UpdateEventDto, userRole: string): Promise<Event> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden actualizar los eventos');
        }
    
        const event = await this.eventModel.findById(id).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }
    
        // Si solo se envían `publicated` y `user_id`, se actualiza solo `publicated`
        if (eventDto.publicated !== undefined && eventDto.user_id !== undefined) {
            event.publicated = eventDto.publicated;
        }
    
        // Actualización de campos permitidos
        if (eventDto.name || eventDto.artist || eventDto.image || eventDto.description || eventDto.location_id) {
            if (eventDto.name) event.name = eventDto.name;
            if (eventDto.artist) event.artist = eventDto.artist;
            if (eventDto.image) event.image = eventDto.image;
            if (eventDto.description) event.description = eventDto.description;
            if (eventDto.location_id) event.location_id = eventDto.location_id;
        }
    
/*

        // Manejo de la colección de fechas
        if (eventDto.dates && Array.isArray(eventDto.dates)) {
            for (const dateDto of eventDto.dates) {
                // Convertir date_time en un objeto Date si es una cadena
                if (typeof dateDto.date_time === 'string' || !(dateDto.date_time instanceof Date)) {
                    dateDto.date_time = new Date(dateDto.date_time);
                }
        
                const existingDate = event.dates.find(date => date.date_time.toISOString() === dateDto.date_time.toISOString());
        
                if (existingDate) {
                    // Si existe la fecha, no hacer nada
                    continue;
                } else {
                    continue;
                    // Si la fecha no existe, añadimos una nueva
                    
                    const newDate: Dates = new Dates(); // Crear una instancia de Dates
                    newDate.date_time = dateDto.date_time;

                    // Asignar sectores
                    newDate.sectors = dateDto.sectors.map(sectorDto => {
                        const clonedSector: Sector = new Sector(); // Crear una instancia de Sector

                        // Copiar las propiedades necesarias
                        clonedSector.name = sectorDto.name;
                        clonedSector.numbered = sectorDto.numbered;
                        clonedSector.rowsNumber = sectorDto.rowsNumber;
                        clonedSector.seatsNumber = sectorDto.seatsNumber;
                        clonedSector.available = sectorDto.available;
                        clonedSector.eliminated = sectorDto.eliminated;
                        clonedSector.capacity = sectorDto.capacity;
                        clonedSector.ocuped = sectorDto.ocuped;

                        // Clonar filas y asientos
                        clonedSector.rows = sectorDto.rows.map(row => row.map(seat => ({
                            displayId: seat.displayId,
                            available: seat.available,
                            timestamp: seat.timestamp,
                            reservedBy: seat.reservedBy,
                            idTicket: seat.idTicket,
                            // Agregar _id aquí si es necesario o dejar que se genere automáticamente
                            _id: new mongoose.Types.ObjectId().toString() // Asegúrate de que esto sea el tipo correcto
                        })));
                    
                        return clonedSector;
                    });
                    
                    // Agregar el nuevo objeto de fecha al evento
                    event.dates.push(newDate);
                
                }
                
            }
        }

    */
        // Guardar el evento actualizado
        const updatedEvent = await event.save();
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
                if (seat.available !== "true") {
                    throw new BadRequestException('El asiento no está disponible');
                }
                seat.available = event.publicated ? "false" : "preReserved";
                seat.timestamp = currentDate;
                seat.reservedBy = reservedBy;
                seatUpdated = true;
                sector.available -= 1;
                sector.ocuped += 1;
                
                break;
            }
        }
    
        if (!seatUpdated) {
            throw new NotFoundException('Asiento no encontrado');
        }
    
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
            available: event.publicated ? "false" : "preReserved",
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
        sector.ocuped += 1;

        /*
        console.log(`Antes de incrementar, ocuped: ${sector.ocuped}`);
        console.log(`Antes de incrementar, available: ${sector.available}`);
        sector.available -= 1;
        sector.ocuped += 1;
        console.log(`Después de incrementar, ocuped: ${sector.ocuped}`);
        console.log(`Después de incrementar, available: ${sector.available}`);
        */

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

// Función para convertir un número a una secuencia alfabética
function numberToAlphabet(num: number): string {
    let str = '';
    while (num >= 0) {
        str = String.fromCharCode((num % 26) + 65) + str;
        num = Math.floor(num / 26) - 1;
    }
    return str;
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