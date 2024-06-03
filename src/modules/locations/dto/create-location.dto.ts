/* eslint-disable prettier/prettier */
// create-location.dto.ts
export class CreateLocationDto {
    readonly name: string;
    readonly street: {
        street: string;
        number: number
    };
}

