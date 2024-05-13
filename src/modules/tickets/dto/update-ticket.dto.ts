/* eslint-disable prettier/prettier */
export class UpdateTicketDto {
    readonly imagen_evento?: string;
    readonly ubicacion?: string;
    readonly establecimiento?: string;
    readonly direccion?: string;
    readonly horario?: number;
    readonly franja?: 'am' | 'pm';
    readonly fecha?: string;
    readonly sector?: string[];
    readonly stock_tickets?: number;
    readonly descripcion?: string;
}
