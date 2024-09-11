/* eslint-disable prettier/prettier */
// app.module.ts
import { Module } from '@nestjs/common';
import { EventModule } from './modules/events/events.module';
import { TicketModule } from './modules/tickets/tickets.module';
import { UserModule } from './modules/users/users.module';
import { LocationModule } from './modules/locations/locations.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ImagesModule } from './modules/images/images.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    ImagesModule,
    EventModule,
    TicketModule,
    UserModule,
    LocationModule,
    AuthModule
  ]
})
export class AppModule { }