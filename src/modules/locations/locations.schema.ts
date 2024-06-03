/* eslint-disable prettier/prettier */
// location.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema()
export class Location {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    latitude: string;

    @Prop({ required: true })
    longitude: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    city: string;

    // Otras propiedades y métodos según sea necesario
}

export const LocationSchema = SchemaFactory.createForClass(Location);
