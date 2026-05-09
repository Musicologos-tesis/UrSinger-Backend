export class Calibration {
  private constructor(
    private readonly _id: string,
    private readonly _profileId: string,
    private readonly _sessionId: string,
    private readonly _deviceIdHash: string,
    private readonly _sampleRate: number,
    private readonly _noiseFloorDbfs: number,
    private readonly _snrDb: number | null,
    private _isCurrent: boolean,
    private readonly _createdAt: Date,
  ) {}

  get id(): string { return this._id; }
  get profileId(): string { return this._profileId; }
  get sessionId(): string { return this._sessionId; }
  get deviceIdHash(): string { return this._deviceIdHash; }
  get sampleRate(): number { return this._sampleRate; }
  get noiseFloorDbfs(): number { return this._noiseFloorDbfs; }
  get snrDb(): number | null { return this._snrDb; }
  get isCurrent(): boolean { return this._isCurrent; }
  get createdAt(): Date { return this._createdAt; }

  static create(
    id: string,
    profileId: string,
    sessionId: string,
    deviceIdHash: string,
    sampleRate: number,
    noiseFloorDbfs: number,
    snrDb: number | null,
  ): Calibration {
    return new Calibration(id, profileId, sessionId, deviceIdHash, sampleRate, noiseFloorDbfs, snrDb, true, new Date());
  }

  static reconstitute(
    id: string,
    profileId: string,
    sessionId: string,
    deviceIdHash: string,
    sampleRate: number,
    noiseFloorDbfs: number,
    snrDb: number | null,
    isCurrent: boolean,
    createdAt: Date,
  ): Calibration {
    return new Calibration(id, profileId, sessionId, deviceIdHash, sampleRate, noiseFloorDbfs, snrDb, isCurrent, createdAt);
  }
}
