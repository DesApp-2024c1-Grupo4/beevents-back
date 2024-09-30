/* eslint-disable prettier/prettier */
// update-event.dto.ts

export class UpdateSeatDto {
    readonly displayId?: string;
    readonly available?: string;
    readonly timestamp?: Date;
    readonly reservedBy?: string;
    readonly idTicket?: string;
}

export class UpdateSectorDto {
    readonly name?: string;
    readonly numbered?: boolean;
    readonly rowsNumber?: number;
    readonly seatsNumber?: number;
    readonly available?: number;
    readonly rows?: UpdateSeatDto[][];
    readonly eliminated?: [number, number][];
    //readonly preReserved?: [number, number][];
    readonly capacity?: number;
    readonly ocuped?: number;
}

export class UpdateDateDto {
    readonly date_time?: Date;
    readonly sectors?: UpdateSectorDto[];
}

export class UpdateEventDto {
    readonly name?: string;
    readonly artist?: string;
    readonly image?: string;
    readonly description?: string;
    readonly location_id?: string;
    user_id: string;
    readonly dates?: UpdateDateDto[];
    readonly publicated?: boolean;
}
