import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthController } from './http/auth.controller';
import { PrismaUserRepository } from './persistence/prisma-user.repository';
import { JwtTokenAdapter } from './services/jwt-token.adapter';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../application/use-cases/login-user.use-case';
import { ValidateTokenUseCase } from '../application/use-cases/validate-token.use-case';
import { USER_REPOSITORY, IUserRepository } from '../domain/repositories/user.repository.interface';
import { TOKEN_SERVICE, ITokenService } from '../domain/services/token.service.interface';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'ursinger-secret-key-change-in-production',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaUserRepository,
    JwtTokenAdapter,
    {
      provide: USER_REPOSITORY,
      useExisting: PrismaUserRepository,
    },
    {
      provide: TOKEN_SERVICE,
      useExisting: JwtTokenAdapter,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepo: IUserRepository) => new RegisterUserUseCase(userRepo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (userRepo: IUserRepository, tokenService: ITokenService) =>
        new LoginUserUseCase(userRepo, tokenService),
      inject: [USER_REPOSITORY, TOKEN_SERVICE],
    },
    {
      provide: ValidateTokenUseCase,
      useFactory: (userRepo: IUserRepository, tokenService: ITokenService) =>
        new ValidateTokenUseCase(userRepo, tokenService),
      inject: [USER_REPOSITORY, TOKEN_SERVICE],
    },
  ],
  exports: [ValidateTokenUseCase, TOKEN_SERVICE, JwtModule],
})
export class AuthModule {}
