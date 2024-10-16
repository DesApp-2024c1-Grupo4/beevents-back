/* eslint-disable prettier/prettier */
// location.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema()
export class Sector {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Boolean, required: true })
    numbered: boolean;

    @Prop({ type: Number, required: true })
    rowsNumber: number;

    @Prop({ type: Number, required: true })
    seatsNumber: number;

    @Prop({ type: [[Number]], required: false, default: [] })
    eliminated: [number, number][];

    //@Prop({ type: [[Number]], required: false, default: [] })
    //preReserved: [number, number][];

    @Prop({ type: Number, required: false, default: 0 })
    capacity: number;

}

const SectorSchema = SchemaFactory.createForClass(Sector);

@Schema()
export class Configuration {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: false })
    description: string;

    @Prop({ type: [SectorSchema], required: true })
    sectors: Sector[];
}

const ConfigurationSchema = SchemaFactory.createForClass(Configuration);

@Schema()
export class Location {
    @Prop({ required: true })
    name: string;

    @Prop({
        type: {
            street: { type: String, required: true },
            number: { type: Number, required: false }
        },
        required: true
    })
    address: {
        street: string;
        number: number;
    };

    @Prop({ type: [ConfigurationSchema], required: false, default: [] })
    configurations: Configuration[];

    // Otras propiedades y métodos según sea necesario
}

export const LocationSchema = SchemaFactory.createForClass(Location);
