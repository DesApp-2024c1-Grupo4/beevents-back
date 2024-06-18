/* eslint-disable prettier/prettier */
// update-event.dto.ts
export class UpdateEventDto {
    readonly name?: string;
    readonly artist?: string;
    readonly image?: string;
    readonly location_id?: string;
    readonly user_id?: string;
    readonly date_times?: Date[];
    readonly sectors?: {
        name: string;
        numbered: boolean;
        rows: number;
        seats: number;
    }[];
}