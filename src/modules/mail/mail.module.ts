// src/modules/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
//import { join } from 'path';
import * as path from 'path';
import { MailService } from './mail.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: process.env.SMTP_HOST, // Usa la variable de entorno MAIL_HOST
                port: parseInt(process.env.SMTP_PORT, 10), // Usa la variable de entorno MAIL_PORT
                auth: {
                    user: process.env.SMTP_USER, // Usa la variable de entorno MAIL_USER
                    pass: process.env.SMTP_PASS, // Usa la variable de entorno MAIL_PASS
                },
            },
            defaults: {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // Usa la variable de entorno MAIL_FROM
            },
            template: {
                dir: path.join(__dirname, '../../../src/modules/mail/templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {
    constructor() {
        console.log('Template directory:', path.join(__dirname, '../../../src/modules/mail/templates'));
    }
}