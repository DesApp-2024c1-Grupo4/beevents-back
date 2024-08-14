/* eslint-disable prettier/prettier */
// users.services.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    // Método para buscar un usuario por email
    async findByEmail(email: string): Promise<User | undefined> {
        return this.userModel.findOne({ email }).lean().exec(); // Convierte el resultado a un objeto JavaScript plano
    }

    async create(userDto: CreateUserDto, userRole: string): Promise<User> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden crear los usuarios');
        }
        const createdUser = new this.userModel(userDto);
        return createdUser.save();
    }

    async findAll(userRole: string): Promise<User[]> {
        if (userRole !== 'user' && userRole !== 'admin') {
            throw new ForbiddenException('Solo los usuarios admin pueden ver los usuarios');
        }
        return this.userModel.find().exec();
    }

    async findById(id: string, userRole: string): Promise<User> {
        if (userRole !== 'user' && userRole !== 'admin') {
            throw new ForbiddenException('Solo los usuarios admin pueden ver los usuarios');
        }
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return user;
    }

    async update(id: string, userDto: UpdateUserDto, userRole: string): Promise<User> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden actualizar los usuarios');
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(id, userDto, { new: true }).exec();
        if (!updatedUser) {
            throw new NotFoundException('Usuario no encontado');
        }
        return updatedUser;
    }

    async delete(id: string, userRole: string): Promise<User> {
        if (userRole !== 'admin') {
            throw new ForbiddenException('Solo los administradores pueden eliminar los usuarios');
        }
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
        if (!deletedUser) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return deletedUser;
    }
}