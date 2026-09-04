import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

interface AuthenticatedUser {
  id: string;
  nombre: string;
  documento: string;
  username: string;
  rol: string;
  estado: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      return null;
    }

    if (!user.estado) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      nombre: user.nombre,
      documento: user.documento,
      username: user.username,
      rol: user.rol,
      estado: user.estado,
    };
  }

  async login(user: AuthenticatedUser) {
    const payload = {
      sub: user.id,
      username: user.username,
      rol: user.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        documento: user.documento,
        username: user.username,
        rol: user.rol,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        documento: true,
        username: true,
        rol: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
