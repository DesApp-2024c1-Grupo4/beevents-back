/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema()
export class Ticket {
  @Prop({ required: true })
  id_evento: string;

  @Prop({ required: true })
  propietario_ticket: string;

  @Prop({ required: true })
  dni_ticket: string;

  @Prop({ required: true })
  email: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
