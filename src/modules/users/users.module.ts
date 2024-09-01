/* eslint-disable prettier/prettier */
// user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { connectToMongoDB } from '../../database.connection';
import { UserController } from '../../controllers/users.controller';
import { UserService } from './users.services';
import { User, UserSchema } from './users.schema';
import { MailModule } from '../mail/mail.module'; // Importa el MailModule

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async () => {
                await connectToMongoDB();
                return {
                    uri: process.env.MONGO_DB_URL,
                    dbName: process.env.MONGO_DB_NAME,
                };
            },
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MailModule, // Añade el MailModule aquí
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule { }