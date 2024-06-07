/* eslint-disable prettier/prettier */
// update-locations.dto.ts
export class UpdateLocationDto {
    readonly name?: string;
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