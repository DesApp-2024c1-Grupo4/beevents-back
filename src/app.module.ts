/* eslint-disable prettier/prettier */
// app.module.ts
import { Module } from '@nestjs/common';
import { EventModule } from './modules/events/events.module';
import { TicketModule } from './modules/tickets/tickets.module';
import { UserModule } from './modules/users/users.module';
import { LocationModule } from './modules/locations/locations.module';

@Module({
  imports: [
    EventModule,
    TicketModule,
    UserModule,
    LocationModule
  ]
})
export class AppModule { }