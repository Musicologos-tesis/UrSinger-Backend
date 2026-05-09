import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';

export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private readonly _password: Password,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  get id(): string { return this._id; }
  get email(): Email { return this._email; }
  get password(): Password { return this._password; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  static create(id: string, email: Email, password: Password): User {
    const now = new Date();
    return new User(id, email, password, now, now);
  }

  static reconstitute(
    id: string,
    email: Email,
    password: Password,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(id, email, password, createdAt, updatedAt);
  }
}
