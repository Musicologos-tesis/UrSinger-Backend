export class SessionIdAlreadyExistsException extends Error {
  constructor(sessionId: string) {
    super(`El sessionId ${sessionId} ya existe`);
    this.name = 'SessionIdAlreadyExistsException';
  }
}
