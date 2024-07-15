/* eslint-disable prettier/prettier */
// event.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { connectToMongoDB } from '../../database.connection';
import { EventController } from '../../controllers/events.controller';
import { EventService } from './events.services';
import { Event, EventSchema } from './events.schema';
import { Location, LocationSchema } from '../locations/locations.schema';

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
        MongooseModule.forFeature([
            { name: Event.name, schema: EventSchema },
            { name: Location.name, schema: LocationSchema },
        ]),
    ],
    controllers: [EventController],
    providers: [EventService],
})
export class EventModule { }
