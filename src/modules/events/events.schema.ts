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
    location_id: string;

    @Prop({ required: true })
    user_id: string;

    @Prop([Date])
    date_times: Date[];

    @Prop([{
        name: { type: String, required: true },
        numbered: { type: Boolean, required: true},
        rows: { type: Number, required: true},
        seats: { type: Number, required: true},
        available: { type: Number, required: true, default: function() { return this.rows * this.seats; }}
    }])
    sectors: {
        name: string;
        numbered: boolean;
        rows: number;
        seats: number;
        available: boolean;
    }[];

    // Otras propiedades y métodos según sea necesario
}

export const EventSchema = SchemaFactory.createForClass(Event);