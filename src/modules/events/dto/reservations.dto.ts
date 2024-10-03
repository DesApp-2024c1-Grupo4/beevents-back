// dto/create-reservation.dto.ts
export class ReservationDto {
    readonly displayId: string;
    readonly timestamp: Date;
    readonly _id: string;
  }
  
  // dto/create-numbered-sector.dto.ts
  export class NumberedSectorDto {
    readonly sector_id: string;
    readonly reservations: ReservationDto[];
  }
  
  // dto/create-not-numbered-sector.dto.ts
  export class NotNumberedSectorDto {
    readonly sector_id: string;
    readonly quantity: number;
  }
  
  // dto/create-event-reservations.dto.ts
  export class CreateEventReservationsDto {
    readonly eventId: string;
    readonly date_time: string;
    readonly reservedBy: string;
    readonly numbered: NumberedSectorDto[];
    readonly notNumbered: NotNumberedSectorDto[];
  }
  