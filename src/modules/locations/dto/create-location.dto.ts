/* eslint-disable prettier/prettier */
// create-location.dto.ts
export class CreateLocationDto {
    readonly name: string;
    user_id: string;
    readonly address: {
        street: string;
        number: number;
    };
    readonly configurations: {
        name: string;
        description: string;
        sectors: {
            name: string;
            numbered: boolean;
            rows: number;
            seats: number;
        }[];
    }[];
}