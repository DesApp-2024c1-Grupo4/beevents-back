/* eslint-disable prettier/prettier */
// app.module.ts
import { Module } from '@nestjs/common';
import { EventModule } from './modules/events/events.module';
import { TicketModule } from './modules/tickets/tickets.module';

@Module({
  imports: [
    EventModule,
    TicketModule,
  ],
})
export class AppModule { }
