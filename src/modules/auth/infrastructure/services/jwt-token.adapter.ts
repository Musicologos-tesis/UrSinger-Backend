import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService, TokenPayload } from '../../domain/services/token.service.interface';

@Injectable()
export class JwtTokenAdapter implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token);
  }
}
