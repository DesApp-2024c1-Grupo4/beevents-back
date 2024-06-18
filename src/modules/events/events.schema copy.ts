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

    @Prop([{
        name: { type: String, required: true },
        numbered: { type: Boolean, required: true },
        rows: { type: Number, required: true },
        seats: { type: Number, required: true },
    }])
    sectors: {
        name: string;
        numbered: boolean;
        rows: number;
        seats: number;
    }[];

    @Prop([{
        date_times: { type: Date, required: true },
        available: [{ type: Number, required: true }],
    }])
    date: {
        date_times: Date;
        available: number[];
    }[];

    // Otras propiedades y métodos según sea necesario
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Pre hook to set default values for `available`
EventSchema.pre<EventDocument>('save', function(next) {
    if (this.isNew) {
        this.date.forEach(dateItem => {
            if (!dateItem.available || dateItem.available.length === 0) {
                dateItem.available = this.sectors.map(sector => sector.rows * sector.seats);
            }
        });
    }
    next();
});
