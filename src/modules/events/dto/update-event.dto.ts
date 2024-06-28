/* eslint-disable prettier/prettier */
// update-event.dto.ts
export class UpdateEventDto {
    readonly name?: string;
    readonly artist?: string;
    readonly image?: string;
    readonly description?: string;
    readonly location_id?: string;
    readonly dates?: {
        date_time?: Date;
        sectors?: {
            name?: string;
            rowsNumber?: number;
            seatsNumber?: number;
            available?: number;
            rows?: {
                displayId?: string;
                available?: boolean;
                timestamp?: Date;
                reservedBy?: string;
            }[];
        }[];
    }[];
}