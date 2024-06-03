/* eslint-disable prettier/prettier */
// update-locations.dto.ts
export class UpdateLocationDto {
    readonly name?: string;
    readonly street?: {
        street: string;
        number: number
    };
}
