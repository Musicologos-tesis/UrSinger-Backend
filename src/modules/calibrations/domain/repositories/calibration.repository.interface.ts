import { Calibration } from '../entities/calibration.entity';

export interface CreateCalibrationData {
  id: string;
  profileId: string;
  sessionId: string;
  deviceIdHash: string;
  sampleRate: number;
  noiseFloorDbfs: number;
  snrDb?: number;
}

export interface ICalibrationRepository {
  profileExists(profileId: string): Promise<boolean>;
  sessionIdExists(sessionId: string): Promise<boolean>;
  save(data: CreateCalibrationData): Promise<Calibration>;
  findCurrentByProfile(profileId: string): Promise<Calibration | null>;
  findAllByProfile(profileId: string): Promise<Calibration[]>;
  findBySessionId(sessionId: string): Promise<Calibration | null>;
  setCurrentForProfile(sessionId: string, profileId: string): Promise<Calibration>;
}

export const CALIBRATION_REPOSITORY = Symbol('ICalibrationRepository');
