import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.services';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/users.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id, role: user.role }; // Incluye 'role' en el payload
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role
    };
  }

  async register(userDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.userService.findByEmail(userDto.email);
    if (existingUser) {
      throw new ConflictException('El email ingresado ya existe. Ingrese otro email o intente recuperar su contraseña');
    }
    // Si el email no existe, se procede a crear el usuario
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDto.password, salt);
    const newUser = await this.userService.create({
      ...userDto,
      password: hashedPassword,
    });
    return newUser;
  }
}
