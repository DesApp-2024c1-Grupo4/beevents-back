/* eslint-disable prettier/prettier */
// event.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { connectToMongoDB } from '../../database.connection';
import { EventController } from '../../controllers/events.controller';
import { EventService } from './events.services';
import { Event, EventSchema } from './events.schema';
import { Location, LocationSchema } from '../locations/locations.schema';
import { LocationService } from '../locations/locations.services';
import { LocationModule } from '../locations/locations.module';  // Asegúrate de que la ruta sea correcta

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
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
        LocationModule,  // Importa el LocationModule aquí        
    ],
    controllers: [EventController/*, LocationService*/],
    providers: [EventService],
    exports: [EventService],
})
export class EventModule { }
