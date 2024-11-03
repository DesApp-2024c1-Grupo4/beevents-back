/* eslint-disable prettier/prettier */
//locations.controller.ts

import { Controller, Get, Query, Post, Patch, Delete, Param, Body, Put, UseGuards, Request, SetMetadata, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { LocationService } from '../modules/locations/locations.services';
import { CreateLocationDto } from '../modules/locations/dto/create-location.dto';
import { UpdateLocationDto } from '../modules/locations/dto/update-location.dto';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';
import axios from 'axios';

@Controller('location')
export class LocationController {
    private readonly logger = new Logger(LocationController.name);
    constructor(private readonly locationService: LocationService) { }

    @Get()
    async findAll(@Request() req: any) {
        return this.locationService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string, @Request() req: any) {
        return this.locationService.findById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para crear un evento
    @Post()
    async create(@Body() createLocationDto: CreateLocationDto, @Request() req: any) {
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
                this.logger.warn(`No se pudieron obtener coordenadas para la direccion postal: ${address}`);
                // Asignar coordenadas [0, 0]
                createLocationDto.coordinates = [0, 0]; // [lon, lat]
                this.logger.warn('Se asignaron las coordenadas por defecto  [0, 0] para indicar que no tiene coordenadas');
            }
        }

        console.log('LOCATION POR CREAR: ', createLocationDto); // Para verificar que se está llamando


        return this.locationService.create(createLocationDto, userRole);
    }
    // FUNCIONES AUXILIARES
    // Función que obtiene las coordenadas basadas en la dirección
    private async getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
        this.logger.warn(`Direccion obtenida: ${encodeURIComponent(address)}`);
        this.logger.warn(`URL obtenida: ${url}`);
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Beevents/1.0 (restorepass.beevents@gmail.com)' // Agrega un User-Agent válido
                }
            });

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