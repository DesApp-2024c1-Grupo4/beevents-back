/* eslint-disable prettier/prettier */
// event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema()
export class Event {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    artist: string;

    @Prop({ required: true })
    image: string;

    @Prop({ required: true })
    gps_location: string;

    @Prop({ required: true })
    location_name: string;

    @Prop({ required: true })
    location_address: string;

    @Prop({ required: true })
    location_city: string;

    @Prop([String])
    sector: string[];

    @Prop([Number])
    capacity: number[];

    @Prop([{
        date_time: { type: Date, required: true },
        stock_ticket: [Number]
    }])
    event_date: {
        date_time: Date;
        stock_ticket: number[];
    }[];

    @Prop({ required: true })
    event_state: boolean;

    // Otras propiedades y métodos según sea necesario
}

export const EventSchema = SchemaFactory.createForClass(Event);
