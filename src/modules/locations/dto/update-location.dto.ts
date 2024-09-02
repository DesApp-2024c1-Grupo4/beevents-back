/* eslint-disable prettier/prettier */
// update-locations.dto.ts
export class UpdateLocationDto {
    readonly name?: string;
    user_id: string;
    readonly address?: {
        street?: string;
        number?: number;
    };
    readonly configurations?: {
        name?: string;
        sectors?: {
            name?: string;
            numbered?: boolean;
            rows?: number;
            seats?: number;
        }[];
    }[];
}