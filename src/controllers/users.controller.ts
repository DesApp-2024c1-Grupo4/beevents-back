/* eslint-disable prettier/prettier */
//users.controller.ts

import { Controller, Get, Post, Patch, Put, Delete, Param, Body, } from '@nestjs/common';
import { UserService } from '../modules/users/users.services';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../modules/users/dto/update-user.dto';

// FALTA definir como tomar el user_role segun el usuario
const user_role = 'admin'

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async findAll() {
        // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
        return this.userService.findAll(user_role);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
        return this.userService.findById(id, user_role);
    }

    @Post()
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto, user_role);
    }

    @Patch(':id')
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto, user_role);
    }

    @Put(':id')
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async fullUpdate(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto, user_role);
    }

    @Delete(':id')
    // FALTA MANEJAR ROLES CORRECTAMENTE CON GUARDIANES
    // @UseGuards(AdminGuard) // Utiliza un guardia para verificar el rol de administrador
    async delete(@Param('id') id: string) {
        return this.userService.delete(id, user_role);
    }

    // Controlador para restablecer contraseñas
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        await this.userService.requestPasswordReset(email);
        return { message: 'Si el correo está registrado, se enviará un enlace para restablecer la contraseña.' };
    }
}