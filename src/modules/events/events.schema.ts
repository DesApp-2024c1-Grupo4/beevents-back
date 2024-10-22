/* eslint-disable prettier/prettier */
// event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document , Types } from 'mongoose';
import * as crypto from 'crypto';

export type EventDocument = Event & Document;
export type SectorDocument = Sector & Document;

@Schema()
export class Seat {
  @Prop({ type: String, required: false, default: '' })
  displayId: string;

  @Prop({ type: String, required: true })
  available: string;

  @Prop({ type: Date, required: true, default: Date.now })
  timestamp: Date;

  @Prop({ type: String, required: false, default: '' })
  reservedBy: string;

  @Prop({ type: String, required: true, default: () => generateIdTicket() })
  idTicket: string;
}

const SeatSchema = SchemaFactory.createForClass(Seat);

@Schema()
export class Sector extends Document {
  @Prop({ type: Types.ObjectId, required: false, default: () => new Types.ObjectId() }) // Genera un ObjectId único
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Boolean, required: true })
  numbered: boolean;

  @Prop({ type: Number, required: true })
  rowsNumber: number;

  @Prop({ type: Number, required: true })
  seatsNumber: number;

  @Prop({ type: Number, required: false, default: 0 })
  available: number;

  @Prop({ type: [[SeatSchema]], required: function () { return this.numbered; }, default: [] })
  rows: Seat[][];

  @Prop({ type: [[Number]], required: false, default: [] })
  eliminated: [number, number][];

  //@Prop({ type: [[Number]], required: false, default: [] })
  //preReserved: [number, number][];

  @Prop({ type: Number, required: false, default: 0 })
  capacity: number;

  @Prop({ type: Number, required: false, default: 0 })
  ocuped: number;

}

export const SectorSchema = SchemaFactory.createForClass(Sector);

@Schema()
export class Dates extends Document {
  @Prop({ type: Date, required: true })
  date_time: Date;

  @Prop({ type: [SectorSchema], required: true })
  sectors: Sector[];
}

const DatesSchema = SchemaFactory.createForClass(Dates);

@Schema()
export class Event {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  artist: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ type: [DatesSchema], required: true })
  dates: Dates[];

  @Prop({ required: false, default: false })
  publicated: boolean;

  // Otras propiedades y métodos según sea necesario

  @Prop({ type: [Number], index: '2dsphere' }) // Index geoespacial para coordenadas
  coordinates?: [number, number];  // Coordenadas en formato [longitud, latitud]

  // @Prop({
  //   type: {
  //     type: String, // GeoJSON tipo 'Point'
  //     enum: ['Point'],
  //   },
  //   coordinates: {
  //     type: [Number], // Array de números [longitud, latitud]
  //   },
  //   _id: false, // Para evitar que este subdocumento tenga su propio _id
  // })
  // coordinates?: { type: string, coordinates: [number, number] };  // GeoJSON para coordenadas, opcional

}

export const EventSchema = SchemaFactory.createForClass(Event);


// Se agrega un índice geoespacial, aunque sea una propiedad opcional
EventSchema.index({ coordinates: '2dsphere' });

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

// Middleware pre-save para establecer available y crear los asientos si numbered es true
EventSchema.pre<EventDocument>('save', function (next) {
  if (this.isNew) {
    this.dates.forEach(dateItem => {
      dateItem.sectors.forEach(sector => {
        sector._id = new Types.ObjectId(); // Genera un ObjectId único para cada sector

        // Inicializar available, capacity y ocuped
        sector.available = 0;
        sector.capacity = 0;
        sector.ocuped = 0;

        if (sector.numbered) {
          sector.rows = []; // Inicializar como lista de listas
          for (let i = 0; i < sector.rowsNumber; i++) {
            const rowLabel = numberToAlphabet(i);
            const rowSeats = [];

            for (let j = 0; j < sector.seatsNumber; j++) {
              let availableStatus = "true"; // Asiento disponible por defecto
              let preResUser = "vacio"; // Inicialmente vacío 

              // Verificar si está en la lista de eliminados
              if (sector.eliminated && sector.eliminated.some(([row, seat]) => row === i && seat === j)) {
                availableStatus = "eliminated";
              }

              // Si el asiento está disponible ("true"), incrementar el contador de asientos disponibles
              if (availableStatus === "true") {
                sector.available += 1;
                sector.capacity += 1; // Incrementar capacidad en cada iteración
              }

              rowSeats.push({
                displayId: `${rowLabel}-${j + 1}`,
                available: availableStatus,
                timestamp: new Date(),
                reservedBy: preResUser, // PreResUser solo es this.user_id si está preReservado
                idTicket: generateIdTicket()
              });
            }
            sector.rows.push(rowSeats);
          }
        } else {
          // Sector no numerado
          sector.available = sector.rowsNumber * sector.seatsNumber;
          sector.capacity = sector.rowsNumber * sector.seatsNumber;
          sector.ocuped = 0;

          sector.rows = [[]]; // Inicializar la colección de filas, con la fila 0
        }
      });
    });
  }
  next();
});

