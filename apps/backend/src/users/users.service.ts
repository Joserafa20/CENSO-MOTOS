import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { documento: createUserDto.documento },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        existingUser.username === createUserDto.username
          ? 'Username already exists'
          : 'Document already exists',
      );
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nombre: createUserDto.nombre,
        documento: createUserDto.documento,
        username: createUserDto.username,
        passwordHash,
        rol: createUserDto.rol as any,
        estado: createUserDto.estado ?? true,
      },
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

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (updateUserDto.username || updateUserDto.documento) {
      const existing = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(updateUserDto.username
                  ? [{ username: updateUserDto.username }]
                  : []),
                ...(updateUserDto.documento
                  ? [{ documento: updateUserDto.documento }]
                  : []),
              ],
            },
          ],
        },
      });

      if (existing) {
        throw new ConflictException('Username or document already in use');
      }
    }

    const data: any = { ...updateUserDto };

    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete data.password;
    }

    if (updateUserDto.rol) {
      data.rol = updateUserDto.rol;
    }

    return this.prisma.user.update({
      where: { id },
      data,
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
  }

  async updateStatus(id: string, estado: boolean) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { estado },
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
  }
}
