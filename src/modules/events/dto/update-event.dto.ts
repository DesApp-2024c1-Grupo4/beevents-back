/* eslint-disable prettier/prettier */
// update-event.dto.ts

export class UpdateRowDto {
    readonly displayId?: string;
    readonly available?: boolean;
    readonly timestamp?: Date;
    readonly reservedBy?: string;
}

export class UpdateSectorDto {
    readonly name?: string;
    readonly numbered?: boolean;
    readonly rowsNumber?: number;
    readonly seatsNumber?: number;
    readonly available?: number;
    readonly rows?: UpdateRowDto[][];
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
    readonly dates?: UpdateDateDto[];
}
