export interface TokenPayload {
  sub: string;
  email: string;
}

export interface ITokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}

export const TOKEN_SERVICE = Symbol('ITokenService');
