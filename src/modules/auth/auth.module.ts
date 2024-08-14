import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserModule } from '../users/users.module'; // Importa el módulo de usuarios
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from '../../controllers/auth.controller';

@Module({
  imports: [
    UserModule, // Asegúrate de que el módulo de usuarios esté importado aquí
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY',  // Cambia esto por tu clave secreta
      signOptions: { expiresIn: '10m' }, // El token expirará en 60 minutos
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
