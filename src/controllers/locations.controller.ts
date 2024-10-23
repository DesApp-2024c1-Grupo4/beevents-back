/* eslint-disable prettier/prettier */
//locations.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body, Put, UseGuards, Request, SetMetadata, Logger } from '@nestjs/common';
import { LocationService } from '../modules/locations/locations.services';
import { CreateLocationDto } from '../modules/locations/dto/create-location.dto';
import { UpdateLocationDto } from '../modules/locations/dto/update-location.dto';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';
import axios from 'axios';  // Asegúrate de tener axios instalado


@Controller('location')
export class LocationController {
    private readonly logger = new Logger(LocationController.name);
    constructor(private readonly locationService: LocationService) { }

    @Get()
    async findAll(@Request() req: any) {
        //    const user_role = req.user.role;
        return this.locationService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string, @Request() req: any) {
        //    const userRole = req.user.role;
        return this.locationService.findById(id);
    }


    // Endpoint para crear un evento. Requiere autenticación JWT y rol de 'admin'.
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para crear un evento
    @Post()
    async create(@Body() createLocationDto: CreateLocationDto, @Request() req: any) {
        console.log('Llamado al controlador crear Location'); // Para verificar que se está llamando
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT

        createLocationDto.user_id = userId; // Asigna el userId al evento

        // Si no se proporcionan las coordenadas en el DTO, obtenlas desde la ubicación (location_id)
        if (!createLocationDto.coordinates) {
            const address = `${createLocationDto.address.street} ${createLocationDto.address.number}`;
            // const address = createLocationDto.address.street; // Obtiene la dirección del DTO
            const coordinates = await this.getCoordinatesFromAddress(address);
            console.log('DIRECCION: ', address); // Para verificar que se está llamando
            console.log('COORDENADAS: ', coordinates); // Para verificar que se está llamando

            if (coordinates) {
                createLocationDto.coordinates = coordinates;
            } else {
                // this.logger.warn(`No se pudieron obtener coordenadas para la ubicación con ID: ${createEventDto.location_id}`);
                // Asignar coordenadas del Obelisco de Buenos Aires
                createLocationDto.coordinates = [-58.3816, -34.6037]; // [lon, lat]
                this.logger.warn('Se asignaron las coordenadas por defecto del Obelisco de Buenos Aires');
            }
        }
        console.log('LOCATION POR CREAR: ', createLocationDto); // Para verificar que se está llamando

        return this.locationService.create(createLocationDto, userRole);
    }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @SetMetadata('role', 'admin') // Requiere rol 'admin' para crear un evento
    // @Post()
    // async create(@Body() createLocationDto: CreateLocationDto, @Request() req: any) {
    //     const userRole = req.user.role;
    //     const userId = req.user.userId;  // Extrae el userId del token JWT
    //     createLocationDto.user_id = userId; // Asigna el userId al evento
    //     return this.locationService.create(createLocationDto, userRole);
    // }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Post()
    // async create(@Body() createLocationDto: CreateLocationDto, @Request() req: any) {
    //     console.log('Llamado al controlador crear location'); // Para verificar que se está llamando
    //     const userRole = req.user.role;
    //     const userId = req.user.userId;  // Extrae el userId del token JWT
    //     createLocationDto.user_id = userId; // Asigna el userId a la location

    //     // Si no se proporcionan las coordenadas en el DTO, obtenlas desde la dirección
    //     if (!createLocationDto.coordinates) {
    //         const address = createLocationDto.address; // Obtiene la dirección del DTO
    //         console.log('DIRECCION COMPLETA:', `${address.street} ${address.number}`);
    //         const coordinates = await this.getCoordinatesFromAddress(address);
    //         console.log('DIRECCION: ', address); // Para verificar que se está llamando
    //         console.log('COORDENADAS: ', coordinates); // Para verificar que se está llamando

    //         if (coordinates) {
    //             createLocationDto.coordinates = coordinates;
    //             console.log('COORDENADAS ASIGNADAS:', createLocationDto.coordinates);
    //         } else {
    //             console.warn(`No se pudieron obtener coordenadas para la dirección: ${address}`);
    //             // Asignar coordenadas del Obelisco de Buenos Aires como fallback
    //             createLocationDto.coordinates = [-58.3816, -34.6037]; // [lon, lat]
    //             console.log('COORDENADAS ASIGNADAS POR DEFECTO:', createLocationDto.coordinates);
    //             console.warn('Se asignaron las coordenadas por defecto del Obelisco de Buenos Aires');
    //         }
    //     }

    //     console.log('LOCATION POR CREAR: ', createLocationDto); // Para verificar que se está llamando

    //     return this.locationService.create(createLocationDto, userRole);
    // }


    // Función que obtiene las coordenadas basadas en la dirección
    private async getCoordinatesFromAddress_1(address: { street: string, number: number }): Promise<[number, number] | null> {
        // Lógica para obtener las coordenadas usando la dirección (integrar con OpenStreetMap o API de geolocalización)
        const fullAddress = `${address.street} ${address.number}`;
        try {
            const coordinates = await this.locationService.getCoordinatesFromAddress(fullAddress);
            return coordinates;
        } catch (error) {
            console.error('Error obteniendo las coordenadas:', error);
            return null;
        }
    }

    private async getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
        this.logger.warn(`Direccion obtenida: ${encodeURIComponent(address)}`);
        this.logger.warn(`URL obtenida: ${url}`);
        try {
            const response = await axios.get(url);
            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                return [parseFloat(lon), parseFloat(lat)];
            }
        } catch (error) {
            this.logger.error('Error obteniendo coordenadas:', error);
        }
        return null;
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para modificar un location
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        updateLocationDto.user_id = userId; // Asigna el userId al location
        return this.locationService.update(id, updateLocationDto, userRole);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para modificar un location
    @Put(':id')
    async fullUpdate(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        updateLocationDto.user_id = userId; // Asigna el userId al evento
        return this.locationService.update(id, updateLocationDto, userRole);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para modificar un location
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        return this.locationService.delete(id, userRole);
    }
}