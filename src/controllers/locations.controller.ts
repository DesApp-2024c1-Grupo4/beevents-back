/* eslint-disable prettier/prettier */
//locations.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body, Put, UseGuards, Request, SetMetadata } from '@nestjs/common';
import { LocationService } from '../modules/locations/locations.services';
import { CreateLocationDto } from '../modules/locations/dto/create-location.dto';
import { UpdateLocationDto } from '../modules/locations/dto/update-location.dto';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';


@Controller('location')
export class LocationController {
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

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @SetMetadata('role', 'admin') // Requiere rol 'admin' para crear un evento
    // @Post()
    // async create(@Body() createLocationDto: CreateLocationDto, @Request() req: any) {
    //     const userRole = req.user.role;
    //     const userId = req.user.userId;  // Extrae el userId del token JWT
    //     createLocationDto.user_id = userId; // Asigna el userId al evento
    //     return this.locationService.create(createLocationDto, userRole);
    // }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    async create(@Body() createLocationDto: CreateLocationDto, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        createLocationDto.user_id = userId; // Asigna el userId a la location

        // Si no se proporcionan las coordenadas en el DTO, obtenlas desde la dirección
        if (!createLocationDto.coordinates) {
            const address = createLocationDto.address; // Obtiene la dirección del DTO
            const coordinates = await this.getCoordinatesFromAddress(address);
            console.log('DIRECCION: ', address); // Para verificar que se está llamando
            console.log('COORDENADAS: ', coordinates); // Para verificar que se está llamando

            if (coordinates) {
                createLocationDto.coordinates = coordinates;
            } else {
                console.warn(`No se pudieron obtener coordenadas para la dirección: ${address}`);
                // Asignar coordenadas del Obelisco de Buenos Aires como fallback
                createLocationDto.coordinates = [-58.3816, -34.6037]; // [lon, lat]
                console.warn('Se asignaron las coordenadas por defecto del Obelisco de Buenos Aires');
            }
        }

        console.log('LOCATION POR CREAR: ', createLocationDto); // Para verificar que se está llamando

        return this.locationService.create(createLocationDto, userRole);
    }

    // Función que obtiene las coordenadas basadas en la dirección
    private async getCoordinatesFromAddress(address: { street: string, number: number }): Promise<[number, number] | null> {
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