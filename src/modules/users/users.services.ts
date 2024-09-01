/* eslint-disable prettier/prettier */
// users.services.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service'; // Importa el MailService

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly mailService: MailService, // Inyecta el MailService
    ) { }

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
            throw new NotFoundException('Usuario no encontrado');
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

    // Nuevo método para solicitar el restablecimiento de contraseña
    async requestPasswordReset(email: string): Promise<void> {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const resetToken = 'someGeneratedToken'; // Aquí deberías implementar la generación de un token único
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

        await this.mailService.sendPasswordResetEmail(email, resetLink);
    }
}
