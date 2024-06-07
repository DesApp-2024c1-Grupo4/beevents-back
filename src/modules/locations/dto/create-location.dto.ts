/* eslint-disable prettier/prettier */
// create-location.dto.ts
export class CreateLocationDto {
    readonly name: string;
    readonly address: {
        street: string;
        number: number;
    };
    readonly configurations: {
        name: string;
        sectors: {
            name: string;
            numbered: boolean;
            rows: number;
            seats: number;
        }[];
    }[];
}