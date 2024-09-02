import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRole = this.reflector.get<string>('role', context.getHandler());
        if (!requiredRole) {
            return true; // Si no hay rol requerido, permite el acceso
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user.role !== requiredRole) {
            throw new ForbiddenException('No tienes permiso para realizar esta acción');
        }

        return true;
    }
}
