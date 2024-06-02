/* eslint-disable prettier/prettier */
// app.module.ts
import { Module } from '@nestjs/common';
import { EventModule } from './modules/events/events.module';
import { TicketModule } from './modules/tickets/tickets.module';
import { AppController } from './controllers/app.controller';

@Module({
  imports: [
    EventModule,
    TicketModule,
    AppController
  ],
  controllers: [AppController]
})
export class AppModule { }
