// dto/update-seat.dto.ts
export class UpdateSeatDto {
    readonly eventId: string;
    readonly sectorId: string;
    readonly date_time: string;
    readonly displayId: string;
    readonly reservedBy: string;
    readonly available: string;
    readonly timestamp: Date;
    readonly idTicket: string;
    readonly _id: string;
}