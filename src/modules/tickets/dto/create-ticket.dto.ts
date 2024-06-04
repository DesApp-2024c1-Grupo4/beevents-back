/* eslint-disable prettier/prettier */
export class CreateTicketDto {
    readonly event_id: string;
    readonly place: {
        date_time: Date;
        sector: string;
        numbered: boolean;
        row: number;
        seat: number;
    };
    readonly customer: {
        name: string;
        last_name: string;
        document: number;
        document_type: string;
    };
    readonly user_id: string;
    readonly status: string;
}

