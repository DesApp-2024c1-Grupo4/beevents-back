/* eslint-disable prettier/prettier */
// create-event.dto.ts

export class CreateSeatDto {
    readonly displayId: string;
    readonly available: boolean;
    readonly timestamp: Date;
    readonly reservedBy: string;
    readonly idTicket: string;
}

export class CreateSectorDto {
    readonly name: string;
    readonly numbered: boolean;
    readonly rowsNumber: number;
    readonly seatsNumber: number;
    readonly available?: number;
    readonly rows: CreateSeatDto[][];
}

export class CreateDateDto {
    readonly date_time: Date;
    readonly sectors: CreateSectorDto[];
}

export class CreateEventDto {
    readonly name: string;
    readonly artist: string;
    readonly image: string;
    readonly description: string;
    readonly location_id: string;
    user_id: string;
    readonly dates: CreateDateDto[];
}
