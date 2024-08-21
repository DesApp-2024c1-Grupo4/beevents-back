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
        const user_role = req.user.role;
        return this.locationService.findAll(user_role);
    }

    @Get(':id')
    async findById(@Param('id') id: string, @Request() req: any) {
        const userRole = req.user.role;
        return this.locationService.findById(id, userRole);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para crear un evento
    @Post()
    async create(@Body() createLocationDto: CreateLocationDto, @Request() req: any) {
        const userRole = req.user.role;
        const userId = req.user.userId;  // Extrae el userId del token JWT
        createLocationDto.user_id = userId; // Asigna el userId al evento
        return this.locationService.create(createLocationDto, userRole);
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