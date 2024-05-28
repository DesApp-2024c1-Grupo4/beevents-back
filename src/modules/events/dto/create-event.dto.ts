/* eslint-disable prettier/prettier */
// create-event.dto.ts
export class CreateEventDto {
    readonly name: string;
    readonly artist: string;
    readonly image: string;
    readonly gps_location: string;
    readonly location_name: string;
    readonly location_address: string;
    readonly location_city: string;
    readonly sector: string[];
    readonly capacity: number[];
    readonly event_date: {
        date_time: string;
        stock_ticket: number[];
    }[];
    readonly event_state: boolean;
}
