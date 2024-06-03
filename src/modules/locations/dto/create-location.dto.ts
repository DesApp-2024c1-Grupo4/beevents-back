/* eslint-disable prettier/prettier */
// create-location.dto.ts
export class CreateLocationDto {
    readonly name: string;
    readonly address: {
        street: string;
        number: number
    };
}