// app.module.ts
import { Module } from '@nestjs/common';
import { EventModule } from './modules/events/events.module';
import { TicketModule } from './modules/tickets/tickets.module';
import { UserModule } from './modules/users/users.module';
import { LocationModule } from './modules/locations/locations.module';
import { MailModule } from './modules/mail/mail.module'; // Importa el módulo de correo

@Module({
  imports: [
    EventModule,
    TicketModule,
    UserModule,
    LocationModule,
    MailModule, // Añade el módulo de correo aquí
  ],
})
export class AppModule { }
