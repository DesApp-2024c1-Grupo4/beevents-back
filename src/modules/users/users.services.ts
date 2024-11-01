/* eslint-disable prettier/prettier */
// users.services.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    // Método para buscar un usuario por email
    async findByEmail(email: string): Promise<User | undefined> {
        return this.userModel.findOne({ email }).lean().exec(); // Convierte el resultado a un objeto JavaScript plano
    }

    async create(userDto: CreateUserDto): Promise<User> {
        const userWithRole = {
            ...userDto,
            role: 'user'  // Asignar el rol "user" automáticamente
        };
        const createdUser = new this.userModel(userWithRole);
        return createdUser.save();
    }

    async findAll(): Promise<User[]> {
        // if (userRole !== 'user' && userRole !== 'admin') {
        //     throw new ForbiddenException('Solo los usuarios admin pueden ver los usuarios');
        // }
        return this.userModel.find().exec();
    }

    async findById(id: string): Promise<User> {
        // if (userRole !== 'user' && userRole !== 'admin') {
        //     throw new ForbiddenException('Solo los usuarios admin pueden ver los usuarios');
        // }
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return user;
    }

    async update(id: string, userDto: UpdateUserDto, tokenUserId: string): Promise<User> {
        // Confirmar que el usuario autenticado está intentando actualizar solo sus propios datos
        if (id !== tokenUserId) {
            throw new ForbiddenException('No tienes permiso para modificar este usuario.');
        }
    
        // Solo permitir actualizar los campos `names` y `surname`
        const updateFields = {
            ...(userDto.names && { names: userDto.names }),
            ...(userDto.surname && { surname: userDto.surname })
        };
    
        const updatedUser = await this.userModel.findByIdAndUpdate(id, updateFields, { new: true }).exec();
        if (!updatedUser) {
            throw new NotFoundException('Usuario no encontrado');
        }
    
        return updatedUser;
    }

    // Método para cambiar la contraseña
    async changePassword(id: string, oldPassword: string, newPassword: string): Promise<{ message: string }> {
        // Buscar al usuario por id
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Verificar que `oldPassword` coincide con la contraseña actual del usuario
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new ForbiddenException('La contraseña actual es incorrecta.');
        }

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt();
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Actualizar la contraseña en la base de datos
        user.password = hashedNewPassword;
        await user.save();

        return { message: 'Contraseña actualizada exitosamente' };
    }

    async delete(id: string): Promise<User> {
        // if (userRole !== 'admin') {
        //     throw new ForbiddenException('Solo los administradores pueden eliminar los usuarios');
        // }
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
        if (!deletedUser) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return deletedUser;
    }
}