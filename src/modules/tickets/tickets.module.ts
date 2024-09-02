/* eslint-disable prettier/prettier */
// ticket.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketController } from '../../controllers/tickets.controller';
import { TicketService } from './tickets.services';
import { Ticket, TicketSchema } from './tickets.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
  ],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule { }
