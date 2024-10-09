/* eslint-disable prettier/prettier */
// locations.services.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from './locations.schema';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
    constructor(
        @InjectModel(Location.name) private readonly locationModel: Model<LocationDocument>,
    ) { }

    async create(locationDto: CreateLocationDto, userRole: string): Promise<Location> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden crear Locations');
        }
        const createdLocation = new this.locationModel(locationDto);
        return createdLocation.save();
    }

    async findAll(): Promise<Location[]> {
        return this.locationModel.find().exec();
    }

    async findById(id: string): Promise<Location> {
        const location = await this.locationModel.findById(id).exec();
        if (!location) {
            throw new NotFoundException('Location no encontrado');
        }
        return location;
    }

    async update(id: string, locationDto: UpdateLocationDto, userRole: string): Promise<Location> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden actualizar los Location');
        }
        const updatedLocation = await this.locationModel.findByIdAndUpdate(id, locationDto, { new: true }).exec();
        if (!updatedLocation) {
            throw new NotFoundException('Location no encontado');
        }
        return updatedLocation;
    }

    async delete(id: string, userRole: string): Promise<Location> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden eliminar los Location');
        }
        const deletedLocation = await this.locationModel.findByIdAndDelete(id).exec();
        if (!deletedLocation) {
            throw new NotFoundException('Location no encontrado');
        }
        return deletedLocation;
    }
}