export class Email {
  private readonly _value: string;

  constructor(email: string) {
    const normalized = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error(`Email inválido: ${email}`);
    }
    this._value = normalized;
  }

  toString(): string { return this._value; }
  equals(other: Email): boolean { return this._value === other.toString(); }
}
