/* eslint-disable prettier/prettier */
import mongoose from "mongoose";

export class UpdateSeatDto {
    readonly displayId?: string;
    available?: string;
    readonly timestamp?: Date;
    reservedBy?: string;
    readonly idTicket?: string;
    readonly _id?: mongoose.Types.ObjectId;
}

export class UpdateSectorDto {
    readonly name?: string;
    readonly numbered?: boolean;
    readonly rowsNumber?: number;
    readonly seatsNumber?: number;
    available?: number;
    rows?: UpdateSeatDto[][];
    readonly eliminated?: [number, number][]; // Matriz de asientos eliminados
    capacity?: number;
    ocuped?: number;
}

export class UpdateDateDto {
    date_time?: Date;
    sectors?: UpdateSectorDto[];
    readonly _id?: mongoose.Types.ObjectId;
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

    // Nuevos campos para fechas y sectores
    readonly new_date_times?: Date[];         // Nuevas fechas a agregar
    readonly new_sectors?: UpdateSectorDto[]; // Nuevos sectores a agregar

    // IDs para eliminar fechas y sectores
    readonly delete_date_times_id?: string[];   // IDs de las fechas a eliminar
    readonly delete_sectors_id?: string[];      // IDs de los sectores a eliminar
}
