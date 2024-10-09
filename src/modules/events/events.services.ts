/* eslint-disable prettier/prettier */
// events.services.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LocationService } from '../locations/locations.services';
import { Event, EventDocument } from './events.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto, UpdateSectorDto } from './dto/update-event.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { CreateSeatDto } from './dto/create-seat.dto';
import { Location, LocationDocument } from '../locations/locations.schema'; // Importamos el modelo de Location para obtener el name
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
        @InjectModel(Location.name) private readonly locationModel: Model<LocationDocument>, // Inyecta el modelo de Location
        private readonly locationService: LocationService, // Añade LocationService al constructor
    ) { }

    // Crear un nuevo evento, sólo permitido para administradores
    async create(eventDto: CreateEventDto, userRole: string): Promise<Event> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden crear los eventos');
        }
        const createdEvent = new this.eventModel(eventDto);
        return createdEvent.save();
    }

    // Obtener todos los eventos
    async findAll(): Promise<Event[]> {
        return this.eventModel.find().exec();
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

    // Obtener eventos futuros, filtrando las fechas pasadas
    async findUpcomingEvents(): Promise<Event[]> {
        const currentDate = new Date();
        const events = await this.eventModel.find().exec();

        return events
            .map(event => {
                // Filtrar fechas dentro del evento que sean mayores o iguales a la fecha actual
                event.dates = event.dates.filter(date => date.date_time >= currentDate);
                return event;
            })
            .filter(event => event.dates.length > 0); // Filtrar eventos que tienen fechas válidas
    }

    // Buscar evento por ID
    async findById(id: string): Promise<Event> {
        const event = await this.eventModel.findById(id).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }
        return event;
    }

    // Actualizar un evento, sólo permitido para administradores
    async update(id: string, eventDto: UpdateEventDto, userRole: string): Promise<Event> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden actualizar los eventos');
        }

        const event = await this.eventModel.findById(id).exec();
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        // Mantener una copia de los sectores actuales para compararlos luego
        const currentSectors = event.dates.flatMap(date => date.sectors);

        // Actualizar el evento con los datos del DTO
        Object.assign(event, eventDto);

        // Verificar si hay sectores numerados nuevos y crear asientos
        event.dates.forEach(dateItem => {
            dateItem.sectors.forEach(sector => {
                // Verificar si el sector ya existía o si es nuevo
                const isExistingSector = currentSectors.some(currentSector => currentSector._id.toString() === sector._id.toString());
                if (!isExistingSector && sector.numbered) {
                    // Crear los asientos automáticamente para los sectores numerados
                    sector.rows = [];
                    for (let i = 0; i < sector.rowsNumber; i++) {
                        const rowLabel = numberToAlphabet(i); // Generar etiqueta de la fila
                        const rowSeats = [];
                        for (let j = 0; j < sector.seatsNumber; j++) {
                            rowSeats.push({
                                displayId: `${rowLabel}-${j + 1}`, // Etiqueta del asiento
                                available: true, // El asiento está disponible
                                timestamp: new Date(),
                                reservedBy: "vacio", // Sin reserva al crear el asiento
                                idTicket: generateIdTicket()  // Generar idTicket para cada asiento
                            });
                        }
                        sector.rows.push(rowSeats); // Agregar los asientos a la fila
                    }
                }
                // Inicializar la cantidad de asientos disponibles si el sector es nuevo
                if (!isExistingSector) {
                    sector.available = sector.rowsNumber * sector.seatsNumber;
                }
            });
        });

        return event.save(); // Guardar los cambios en el evento
    }

    // Eliminar un evento por ID, sólo permitido para administradores
    async delete(id: string, userRole: string): Promise<Event> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden eliminar los eventos');
        }
        const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec(); // Eliminar el evento
        if (!deletedEvent) {
            throw new NotFoundException('Evento no encontrado'); // Lanzar excepción si no se encuentra
        }
        return deletedEvent;
    }

    async updateSeat(eventId: string, updateSeatDto: UpdateSeatDto): Promise<any> {
        const event = await this.eventModel.findById(eventId).exec(); // Buscar el evento por ID
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        const { sectorId, date_time, displayId, reservedBy } = updateSeatDto;
        const currentDate = new Date();

        const date = event.dates.find(dateItem => dateItem.date_time.toISOString() === date_time); // Buscar la fecha específica
        if (!date) {
            throw new NotFoundException('Fecha no encontrada');
        }

        const sector = date.sectors.find(sectorItem => sectorItem._id.toString() === sectorId && sectorItem.numbered); // Buscar el sector numerado
        if (!sector) {
            throw new NotFoundException('Sector no encontrado o no numerado');
        }

        let seatUpdated = false;

        // Buscar el asiento en las filas del sector
        for (const row of sector.rows) {
            const seat = row.find(seatItem => seatItem.displayId === displayId);
            if (seat) {
                if (!seat.available) {
                    throw new BadRequestException('El asiento no está disponible'); // Asiento ya reservado
                }
                seat.available = false; // Marcar el asiento como no disponible
                seat.timestamp = currentDate;
                seat.reservedBy = reservedBy;
                seatUpdated = true;
                break;
            }
        }

        if (!seatUpdated) {
            throw new NotFoundException('Asiento no encontrado'); // Lanzar excepción si el asiento no existe
        }

        sector.available -= 1; // Reducir la cantidad de asientos disponibles

        await event.save(); // Guardar los cambios

        return { message: 'Reserva realizada correctamente' }; // Confirmar la reserva
    }

    // Crear un asiento en un sector no numerado
    async createSeat(eventId: string, createSeatDto: CreateSeatDto): Promise<any> {
        const event = await this.eventModel.findById(eventId).exec(); // Buscar el evento
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        const { sectorId, reservedBy, date_time } = createSeatDto;
        const currentDate = new Date();

        const date = event.dates.find(dateItem => dateItem.date_time.toISOString() === date_time); // Buscar la fecha
        if (!date) {
            throw new NotFoundException('Fecha no encontrada');
        }

        const sector = date.sectors.find(sectorItem => sectorItem._id.toString() === sectorId && !sectorItem.numbered);
        if (!sector) {
            throw new BadRequestException('No se puede realizar esta reserva porque es un sector numerado o el sector no existe');
        }

        // Crear un nuevo asiento en el sector no numerado
        const seat = {
            displayId: '',
            available: false,
            timestamp: currentDate,
            reservedBy: reservedBy,
            idTicket: generateIdTicket()  // Generar idTicket para el nuevo asiento
        };

        // Agregar el asiento a la primera fila disponible
        if (!sector.rows) {
            sector.rows = [];
        }

        if (sector.rows.length === 0) {
            sector.rows.push([seat]);
        } else {
            sector.rows[0].push(seat);
        }

        sector.available -= 1; // Reducir la cantidad de asientos disponibles

        await event.save(); // Guardar los cambios

        return { message: 'Asiento creado correctamente' }; // Confirmar la creación
    }

    // Obtener todas las reservas realizadas por un usuario específico
    async getReservationsByReservedBy(reservedBy: string): Promise<any[]> {
        const events = await this.eventModel.find().exec();
        const reservations: any[] = [];

        for (const event of events) {
            // Buscar la ubicación del evento
            const location = await this.locationModel.findById(event.location_id).exec();
            if (!location) {
                throw new NotFoundException('Ubicación no encontrada'); // Si no se encuentra la ubicación, omitir el evento
            }

            // Recorrer las fechas y sectores del evento para encontrar las reservas del usuario
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

        return reservations; // Retornar todas las reservas del usuario
    }

    // Encontrar hasta 3 eventos cercanos a una ubicación geoespacial
    async findNearbyEvents(longitude: number, latitude: number): Promise<Event[]> {
        return this.eventModel
            .find({
                coordinates: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude], // Coordenadas para la búsqueda geoespacial
                        },
                    },
                },
            })
            .limit(3) // Limitar a 3 eventos
            .exec();
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