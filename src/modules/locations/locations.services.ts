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

    // Función para calcular la capacidad de cada sector
    private calculateSectorCapacity(sectors: any[]): any[] {
        return sectors.map(sector => {
            // Si el sector es numerado, calcular la capacidad considerando los eliminados
            if (sector.numbered) {
                sector.eliminated = sector.eliminated || []; // Asegurarse de que 'eliminated' siempre sea un array
                sector.capacity = (sector.rowsNumber * sector.seatsNumber) - sector.eliminated.length;
            } else {
                // Si el sector no es numerado, la capacidad es simplemente filas * asientos
                sector.capacity = sector.rowsNumber * sector.seatsNumber;
            }
            return sector;
        });
    }

    async create(locationDto: CreateLocationDto, userRole: string): Promise<Location> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden crear Locations');
        }
    
        // Verificar si configurations existe y no está vacío
        if (locationDto.configurations && locationDto.configurations.length > 0) {
            // Calcular capacidad para cada sector en todas las configuraciones
            locationDto.configurations.forEach(config => {
                config.sectors = this.calculateSectorCapacity(config.sectors);
            });
        }
    
        const createdLocation = new this.locationModel(locationDto);
        return createdLocation.save();
    }
    

    async findAll(): Promise<Location[]> {
    //    if (userRole !== 'user' && userRole !== 'admin') {
    //        throw new ForbiddenException('Solo los usuarios pueden ver los Locations');
    //    }
        return this.locationModel.find().exec();
    }

    async findById(id: string): Promise<Location> {
    //    if (userRole !== 'user' && userRole !== 'admin') {
    //        throw new ForbiddenException('Solo los usuarios pueden ver los locations');
    //    }
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

        // Calcular capacidad para cada sector si se están actualizando los sectores
        if (locationDto.configurations) {
            locationDto.configurations.forEach(config => {
                if (config.sectors) {
                    config.sectors = this.calculateSectorCapacity(config.sectors);
                }
            });
        }

        const updatedLocation = await this.locationModel.findByIdAndUpdate(id, locationDto, { new: true }).exec();
        if (!updatedLocation) {
            throw new NotFoundException('Location no encontrado');
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