/* eslint-disable prettier/prettier */
// update-event.dto.ts
import mongoose from "mongoose";
export class UpdateSeatDto {
    readonly displayId?: string;
    available?: string;
    readonly timestamp?: Date;
    reservedBy?: string;
    readonly idTicket?: string;
}

export class UpdateSectorDto {
    readonly name?: string;
    readonly numbered?: boolean;
    readonly rowsNumber?: number;
    readonly seatsNumber?: number;
    readonly available?: number;
    rows?: UpdateSeatDto[][];
    readonly eliminated?: [number, number][];
    //readonly preReserved?: [number, number][];
    capacity?: number;
    ocuped?: number;
    readonly _id?: mongoose.Types.ObjectId; // Cambiar a ObjectId
}

export class UpdateDateDto {
    date_time?: Date;
    sectors?: UpdateSectorDto[];
}

export class UpdateEventDto {
    readonly name?: string;
    readonly artist?: string;
    readonly image?: string;
    readonly description?: string;
    readonly location_id?: string;
    user_id?: string;
    readonly dates?: UpdateDateDto[];
    readonly publicated?: boolean;
    readonly coordinates?: [number, number]; // Coordenadas opcionales
}
