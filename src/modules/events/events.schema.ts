/* eslint-disable prettier/prettier */
// event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema()
export class Event {
    @Prop({ required: true })
    imagen_evento: string;

    @Prop({ required: true })
    ubicacion: string;

    @Prop({ required: true })
    establecimiento: string;

    @Prop({ required: true })
    direccion: string;

    @Prop({ required: true, min: 1, max: 12 })
    horario: number;

    @Prop({ required: true, enum: ['am', 'pm'] })
    franja: string;

    @Prop({ required: true })
    fecha: string;

    @Prop([String])
    sector: string[];

    @Prop({ required: true, min: 0 })
    stock_tickets: number;

    @Prop({ required: true })
    descripcion: string;

    // Otras propiedades y métodos según sea necesario
}

export const EventSchema = SchemaFactory.createForClass(Event);
