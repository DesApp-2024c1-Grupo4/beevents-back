/* eslint-disable prettier/prettier */
//locations.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body, Put, UseGuards } from '@nestjs/common';
import { LocationService } from '../modules/locations/locations.services';
import { CreateLocationDto } from '../modules/locations/dto/create-location.dto';
import { UpdateLocationDto } from '../modules/locations/dto/update-location.dto';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';

// FALTA definir como tomar el user_role segun el usuario
const user_role = 'admin'

@UseGuards(JwtAuthGuard)
@Controller('location')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    @Get()
    async findAll() {
        // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
        return this.locationService.findAll(user_role);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
        return this.locationService.findById(id, user_role);
    }

    @Post()
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async create(@Body() createLocationDto: CreateLocationDto) {
        return this.locationService.create(createLocationDto, user_role);
    }

    @Patch(':id')
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
        return this.locationService.update(id, updateLocationDto, user_role);
    }

    @Put(':id')
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async fullUpdate(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
        return this.locationService.update(id, updateLocationDto, user_role);
    }

    @Delete(':id')
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async delete(@Param('id') id: string) {
        return this.locationService.delete(id, user_role);
    }
}