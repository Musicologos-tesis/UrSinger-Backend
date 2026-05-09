import * as bcrypt from 'bcrypt';

export class Password {
  private constructor(private readonly _hash: string) {}

  static async create(plainText: string): Promise<Password> {
    if (plainText.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
    return new Password(await bcrypt.hash(plainText, 10));
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  async verify(plainText: string): Promise<boolean> {
    return bcrypt.compare(plainText, this._hash);
  }

  toString(): string { return this._hash; }
}
