/* eslint-disable prettier/prettier */
// events.services.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument, Dates, Sector, SectorDocument } from './events.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto, UpdateSectorDto } from './dto/update-event.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { CreateSeatDto } from './dto/create-seat.dto';
import { CreateEventReservationsDto } from './dto/reservations.dto'
import { Location, LocationDocument } from '../locations/locations.schema'; // Importamos el modelo de Location para obtener el name
import * as crypto from 'crypto';
import mongoose from 'mongoose';
import { LocationService } from '../locations/locations.services';
import axios from 'axios';
@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
        @InjectModel(Location.name) private readonly locationModel: Model<LocationDocument>, // Inyecta el modelo de Location
        @InjectModel(Sector.name) private sectorModel: Model<SectorDocument>,
        private readonly locationService: LocationService, // Añade LocationService al constructor
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

    // Crear un nuevo evento, sólo permitido para administradores
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


    // Obtener todos los eventos
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

    // Obtener todos los eventos como documentos
    async findAllDocuments(): Promise<EventDocument[]> {
        return this.eventModel.find().exec(); // Esto retorna EventDocument[]
    }

    // Método para obtener la dirección de un evento a partir de location_id
    async getAddress(locationId: string): Promise<string> {
        const location = await this.locationService.findById(locationId);
        if (!location) {
            throw new NotFoundException('Ubicación no encontrada');
        }

        // Convertir el objeto address a una cadena
        const addressString = `${location.address.street} ${location.address.number}`;
        return addressString;
    }

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


    // Obtener eventos futuros, filtrando las fechas pasadas
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

    // Buscar evento por ID
    async findById(id: string): Promise<Event> {
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

        const event = await this.eventModel.findById(id).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        //console.log('Contenido del body (eventDto):', JSON.stringify(eventDto, null, 2));

        // Si solo se envían `publicated` y `user_id`, se actualiza solo `publicated`
        if (eventDto.publicated !== undefined && eventDto.user_id !== undefined) {
            event.publicated = eventDto.publicated;
        }

        // Eliminar sectores si existen `delete_sectors_name`
        if (eventDto.delete_sectors_name && eventDto.delete_sectors_name.length > 0) {
            event.dates.forEach(date => {
                date.sectors = date.sectors.filter(sector => !eventDto.delete_sectors_name.includes(sector.name));
            });
        }

        // Guardar el evento actualizado con los sectores eliminados
        await event.save();

        // Actualizar los campos generales del evento
        if (eventDto.name) event.name = eventDto.name;
        if (eventDto.artist) event.artist = eventDto.artist;
        if (eventDto.image) event.image = eventDto.image;
        if (eventDto.description) event.description = eventDto.description;
        if (eventDto.location_id) event.location_id = eventDto.location_id;

        // Asignar user_id del token al evento
        event.user_id = eventDto.user_id;

        // Actualizar fechas si existen `new_date_times`
        if (eventDto.new_date_times && eventDto.new_date_times.length > 0) {
            for (const newDate of eventDto.new_date_times) {
                // Crea un nuevo subdocumento "Date" usando el esquema de Mongoose
                const newDate = new this.eventModel({
                    dates: [{
                        date_time: eventDto.new_date_times, // o lo que sea relevante aquí
                        sectors: [], // Inicializa el sector vacío o con datos relevantes
                    }]
                }).dates[0];

                // Clonar sectores actuales sin las reservas y pre-reservas
                for (const sector of event.dates[0].sectors) {
                    const clonedSector = {
                        ...sector.toObject(), // Clonar los campos del sector
                        available: (sector.rowsNumber * sector.seatsNumber) - sector.eliminated.length, // Restablecer los valores
                        ocuped: 0, // Sin asientos ocupados
                        rows: sector.numbered ? [] : [[]] // Si es numerado, inicializar las filas
                    };

                    // Si es numerado, generar asientos con las mismas configuraciones
                    if (sector.numbered) {
                        for (let i = 0; i < sector.rowsNumber; i++) {
                            const rowSeats = [];
                            for (let j = 0; j < sector.seatsNumber; j++) {
                                const availableStatus = sector.eliminated.some(([row, seat]) => row === i && seat === j)
                                    ? 'eliminated'
                                    : 'true';

                                rowSeats.push({
                                    displayId: `${String.fromCharCode(65 + i)}-${j + 1}`,
                                    available: availableStatus,
                                    timestamp: new Date(),
                                    reservedBy: 'vacio',
                                    idTicket: generateIdTicket()
                                });
                            }
                            clonedSector.rows.push(rowSeats);
                        }
                    }

                    newDate.sectors.push(clonedSector); // Agregar sector clonado a la nueva fecha
                }

                event.dates.push(newDate); // Agregar la nueva fecha al evento
            }
        }

        // Actualizar sectores si existen `new_sectors`
        if (eventDto.new_sectors && eventDto.new_sectors.length > 0) {
            for (const newSector of eventDto.new_sectors) {

                // Crear una nueva instancia del modelo Sector utilizando Mongoose
                const newSectorObj = new this.sectorModel({
                    available: 0,
                    capacity: 0,
                    ocuped: 0,
                    rows: newSector.numbered ? [] : [[]], // Inicializar filas si es numerado
                    name: newSector.name,
                    numbered: newSector.numbered,
                    rowsNumber: newSector.rowsNumber,
                    seatsNumber: newSector.seatsNumber,
                    eliminated: newSector.eliminated || []
                });

                // Lógica para sectores numerados
                if (newSector.numbered) {
                    for (let i = 0; i < newSector.rowsNumber; i++) {
                        const rowLabel = numberToAlphabet(i);
                        const rowSeats = [];

                        for (let j = 0; j < newSector.seatsNumber; j++) {
                            let availableStatus = "true";
                            let preResUser = "vacio";

                            // Verificar si el asiento está en la lista de eliminados
                            if (newSector.eliminated && newSector.eliminated.some(([row, seat]) => row === i && seat === j)) {
                                availableStatus = "eliminated";
                            }

                            if (availableStatus === "true") {
                                newSectorObj.available += 1;
                                newSectorObj.capacity += 1;
                            }

                            rowSeats.push({
                                displayId: `${rowLabel}-${j + 1}`,
                                available: availableStatus,
                                timestamp: new Date(),
                                reservedBy: preResUser,
                                idTicket: generateIdTicket()
                            });
                        }

                        newSectorObj.rows.push(rowSeats);
                    }
                } else {
                    // Para sectores no numerados
                    newSectorObj.available = newSector.rowsNumber * newSector.seatsNumber;
                    newSectorObj.capacity = newSector.rowsNumber * newSector.seatsNumber;
                    newSectorObj.ocuped = 0;
                }

                // Agregar el nuevo sector al array de sectores de cada fecha
                event.dates.forEach(date => {
                    date.sectors.push(newSectorObj); // Empujar el nuevo sector en el array
                });
            }
        }

        // Eliminar fechas si existen `delete_date_times_id`
        if (eventDto.delete_date_times_id && eventDto.delete_date_times_id.length > 0) {
            event.dates = event.dates.filter(date => !eventDto.delete_date_times_id.includes(date._id.toString()));
        }

        // Guardar el evento actualizado
        const updatedEvent = await event.save();
        return updatedEvent;
    }


    // Eliminar un evento por ID, sólo permitido para administradores
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


    // Crear un asiento en un sector no numerado
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

        await event.save();

        return { message: 'Asiento creado correctamente' };
    }


    // Obtener todas las reservas realizadas por un usuario específico
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



    // Encontrar hasta 4 eventos cercanos a una ubicación geoespacial
    async findNearbyEvents(lon: any, lat: any): Promise<any[]> {
        const currentDate = new Date(); // Fecha y hora actuales

        // Filtrar eventos publicados y con al menos una fecha válida
        const events = await this.eventModel.find({
            dates: {
                $elemMatch: { 'date_time': { $gte: currentDate } } // Al menos una fecha futura
            },
            publicated: true, // Solo eventos publicados
            coordinates: {
                $near: {
                    $geometry: {
                        type: 'Point', // Asegurarse de especificar el tipo de geometría
                        coordinates: [lon, lat]
                    },
                    //$maxDistance: 100000, // Distancia máxima de ejemplo
                },
            },
        })
            .limit(4) // Limitar a 4 eventos
            .exec();

        // Filtramos los datos para responder solo con la información necesaria
        return events.map(event => ({
            _id: event._id,
            name: event.name,
            artist: event.artist,
            image: event.image,
            description: event.description,
            location_id: event.location_id,
            publicated: event.publicated,
            coordinates: event.coordinates,
        }));
    }



    // Método para actualizar coordenadas en el evento
    async updateEventCoordinates(eventId: string, coordinates: [number, number]) {
        return this.eventModel.findByIdAndUpdate(
            eventId,
            { coordinates },
            { new: true }
        ).exec();
    }

}


// Funciones auxiliares
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


// Función para obtener las coordenadas de una direccion
async function getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                addressdetails: 1,
                limit: 1,
            },
        });
        const data = response.data[0];
        if (data) {
            return [parseFloat(data.lon), parseFloat(data.lat)];
        }
        return null;
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
}


