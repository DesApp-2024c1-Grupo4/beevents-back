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
        type: { type: String, required: true},
        rows: { type: Number, required: true},
        seats: { type: Number, required: true}
    }])
    sectors: {
        name: string;
        type: string;
        rows: number;
        seats: number;
    }[];

    @Prop({ required: true })
    event_state: boolean;

    // Otras propiedades y métodos según sea necesario
}

export const EventSchema = SchemaFactory.createForClass(Event);
