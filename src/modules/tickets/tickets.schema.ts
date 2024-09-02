/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema()
export class Ticket {
  @Prop({ required: true })
  event_id: string;

  @Prop([{
    date_time: { type: Date, required: true },
    sector: { type: String, required: true },
    numbered: { type: Boolean, required: true},
    row: { type: Number, required: true},
    seat: { type: Number, required: true}
  }])
  place: {
    date_time: Date;
    sector: string;
    numbered: boolean;
    row: number;
    seat: number
};

@Prop([{
  name: { type: String, required: false },
  last_name: { type: String, required: false },
  document: { type: Number, required: false},
  document_type: { type: String, required: false},
}])
customer: {
  name: string;
  last_name: string;
  document: number;
  document_type: string;
};

@Prop({ required: true })
user_id: string;

@Prop({ required: true })
status: string;

}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
