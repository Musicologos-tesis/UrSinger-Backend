import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterUserUseCase, RegisterUserCommand } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async register(@Body() dto: RegisterDto) {
    try {
      const user = await this.registerUseCase.execute(
        new RegisterUserCommand(
          dto.email,
          dto.password,
          dto.name,
          dto.age,
          dto.gender,
          dto.weeklyTrainingFreq,
        ),
      );
      return {
        user: {
          id: user.id,
          email: user.email.toString(),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        message: 'Usuario registrado exitosamente. Por favor inicia sesión.',
      };
    } catch (e) {
      if (e instanceof UserAlreadyExistsException) throw new ConflictException(e.message);
      throw e;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto) {
    try {
      const result = await this.loginUseCase.execute(dto.email, dto.password);
      return {
        access_token: result.access_token,
        token_type: result.token_type,
        user: {
          id: result.user.id,
          email: result.user.email.toString(),
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
      };
    } catch (e) {
      if (e instanceof InvalidCredentialsException) throw new UnauthorizedException(e.message);
      throw e;
    }
  }
}
