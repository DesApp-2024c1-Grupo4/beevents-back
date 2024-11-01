/* eslint-disable prettier/prettier */
//users.controller.ts

import { Controller, Get, Post, Patch, Req, Delete, Param, Body, UseGuards, ForbiddenException , SetMetadata } from '@nestjs/common';
import { UserService } from '../modules/users/users.services';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../modules/users/dto/update-user.dto';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para consultar todos los usuarios
    @Get()
    async findAll() {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para consultar un usuario por id
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.userService.findById(id);
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Req() req
    ) {
        const tokenUserId = req.user.userId; // El ID del usuario autenticado desde el token

        if (id !== tokenUserId) {
            throw new ForbiddenException('No tienes permiso para modificar este usuario.');
        }

        return this.userService.update(id, updateUserDto, tokenUserId);
    }

    /*
    @Put(':id')
    async fullUpdate(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }
    */

    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('role', 'admin') // Requiere rol 'admin' para eliminar un usuario
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.userService.delete(id);
    }
}