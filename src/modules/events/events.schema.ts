/* eslint-disable prettier/prettier */
// event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema()
export class Sector extends Document {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Boolean, required: true })
    numbered: boolean;

    @Prop({ type: Number, required: true })
    rowsNumber: number;

    @Prop({ type: Number, required: true })
    seatsNumber: number;

    @Prop({ type: Number, required: false })
    available: number;

    @Prop([{
        displayId: { type: String, required: false },
        available: { type: Boolean, required: true },
        timestamp: { type: Date, required: true },
        reservedBy: { type: String, required: true }
    }])
    rows: {
        displayId: string;
        available: boolean;
        timestamp: Date;
        reservedBy: string;
    }[];
}

const SectorSchema = SchemaFactory.createForClass(Sector);

@Schema()
export class Dates {
    @Prop({ type: String, required: true })
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
    
    // Otras propiedades y métodos según sea necesario
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Función para convertir un número a una secuencia alfabética
function numberToAlphabet(num: number): string {
    let str = '';
    while (num >= 0) {
        str = String.fromCharCode((num % 26) + 65) + str;
        num = Math.floor(num / 26) - 1;
    }
    return str;
}

// Middleware pre-save para establecer `available` y crear los asientos si `numbered` es true
EventSchema.pre<EventDocument>('save', function(next) {
    if (this.isNew) {
        this.dates.forEach(dateItem => {
            dateItem.sectors.forEach(sector => {
                // Establecer la propiedad `available` siempre
                sector.available = sector.rowsNumber * sector.seatsNumber;

                // Si `numbered` es true, crear los asientos
                if (sector.numbered) {
                    for (let i = 0; i < sector.rowsNumber; i++) {
                        const rowLabel = numberToAlphabet(i);
                        for (let j = 0; j < sector.seatsNumber; j++) {
                            sector.rows.push({
                                displayId: `${rowLabel}-${j + 1}`,
                                available: true,
                                timestamp: new Date(),
                                reservedBy: ''
                            });
                        }
                    }
                }
            });
        });
    }
    next();
});
