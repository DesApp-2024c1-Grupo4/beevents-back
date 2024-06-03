/* eslint-disable prettier/prettier */
// location.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { connectToMongoDB } from '../../database.connection';
import { LocationController } from '../../controllers/locations.controller';
import { LocationService } from './locations.services';
import { Location, LocationSchema } from './locations.schema';

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
        MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }]),
    ],
    controllers: [LocationController],
    providers: [LocationService],
})
export class LocationModule { }