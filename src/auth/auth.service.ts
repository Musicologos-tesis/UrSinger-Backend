import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario con su perfil
   * Solo crea el usuario, NO retorna token (mejor práctica)
   */
  async register(dto: RegisterDto) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear usuario con perfil en transacción
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        profile: {
          create: {
            name: dto.name,
            age: dto.age,
            gender: dto.gender,
            weeklyTrainingFreq: dto.weeklyTrainingFreq,
          },
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      user,
      message: 'Usuario registrado exitosamente. Por favor inicia sesión.',
    };
  }

  /**
   * Inicia sesión de un usuario
   * Retorna el token JWT (mejor práctica)
   */
  async login(dto: LoginDto) {
    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const token = this.generateToken(user.id, user.email);

    return {
      access_token: token,
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Genera un token JWT
   */
  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  /**
   * Valida un token JWT y retorna el usuario
   */
  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Token inválido');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
