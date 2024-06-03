/* eslint-disable prettier/prettier */
// location.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema()
export class Location {
    @Prop({ required: true })
    name: string;

    @Prop({
        street: { type: String, required: true },
        number: { type: Number, required: false }
    })
    address: {
        street: string;
        number: number
    }[];

    // Otras propiedades y métodos según sea necesario
}

export const LocationSchema = SchemaFactory.createForClass(Location);