import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartCalibrationDto } from './dto/start-calibration.dto';
import { FinishCalibrationDto } from './dto/finish-calibration.dto';
import { GainTickDto, MetricsTickDto, RoomCheckTickDto } from './dto/ws-ticks.dto';

const THRESHOLDS = {
  noise_floor_threshold_dbfs: -40,
  snr_min_db: 20,
  rms_target_range_db: [-28, -16] as [number, number],
  clip_tolerance: 0,
  pitch_tolerance_cents: 15,
  window_agg_ms: 5000,
};

@Injectable()
export class CalibrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async start(dto: StartCalibrationDto) {
    await this.prisma.calibrationSession.create({
      data: {
        id: dto.sessionId,
        deviceIdHash: dto.deviceIdHash,
        sampleRate: dto.sampleRate,
        status: 'started',
      },
    });
    return { thresholds: THRESHOLDS };
  }

  async deviceSelected(payload: { sessionId: string; deviceIdHash: string; sampleRate: number }) {
    await this.prisma.calibrationSession.update({
      where: { id: payload.sessionId },
      data: { deviceIdHash: payload.deviceIdHash, sampleRate: payload.sampleRate },
    });
  }

  async roomCheck(dto: RoomCheckTickDto) {
    const status = dto.noiseFloorDbfs > THRESHOLDS.noise_floor_threshold_dbfs ? 'room_warn' : 'room_ok';
    await this.prisma.calibrationSession.update({
      where: { id: dto.sessionId },
      data: { status },
    });
    const roomData: any = {
      sessionId: dto.sessionId,
      phase: 'room_check',
      windowMs: Math.round(dto.durationSec * 1000),
      baseLatencyMs: dto.baseLatencyMs,
      avgRmsDb: null, // ✅ Room check NO mide RMS de señal
      stdRmsDb: null, // Room check no tiene stdRms
      clipRate: null, // Room check no tiene clipRate
      snrDb: null, // SNR no se calcula en room_check
      noiseFloorDbfs: dto.noiseFloorDbfs, // ✅ Campo correcto para noise floor
      result: status === 'room_ok' ? 'OK' : 'Fail',
    };
    await this.prisma.calibrationMetric.create({ data: roomData });
  }

  async gainTick(dto: GainTickDto) {
    const gainData: any = {
      sessionId: dto.sessionId,
      phase: 'gain',
      windowMs: dto.windowMs,
      avgRmsDb: dto.avgRmsDb,
      stdRmsDb: dto.stdRmsDb,
      clipRate: dto.clipRate,
      snrDb: dto.snrDb ?? null, // ✅ SNR calculado si está disponible
      baseLatencyMs: null, // Gain no mide latencia
      noiseFloorDbfs: null, // ✅ No aplica en gain
      result: 'OK',
    };
    await this.prisma.calibrationMetric.create({ data: gainData });
  }

  async metricsTick(dto: MetricsTickDto) {
    const metricsData: any = {
      sessionId: dto.sessionId,
      phase: 'metrics',
      windowMs: dto.windowMs,
      avgRmsDb: dto.avgRmsDb, // ✅ RMS final de la señal
      stdRmsDb: dto.stdRmsDb,
      clipRate: dto.clipRate,
      snrDb: dto.snrDb, // ✅ SNR calculado por el frontend
      baseLatencyMs: dto.baseLatencyMs,
      noiseFloorDbfs: dto.noiseFloorDbfs ?? null, // ✅ Noise floor consolidado
      result: dto.result,
    };
    await this.prisma.calibrationMetric.create({ data: metricsData });
  }

  async finish(dto: FinishCalibrationDto) {
    await this.prisma.calibrationSession.update({
      where: { id: dto.sessionId },
      data: { status: 'completed', finishedAt: new Date() },
    });

    const profile = await this.prisma.calibrationProfile.create({
      data: {
        sessionId: dto.sessionId,
        noiseFloorDbfs: dto.room.noiseFloorDbfs,
        rmsTargetMin: THRESHOLDS.rms_target_range_db[0],
        rmsTargetMax: THRESHOLDS.rms_target_range_db[1],
        clipTolerance: THRESHOLDS.clip_tolerance,
        latencyMs: dto.latencyMs,
        tunerOffsetCents: dto.tunerOffsetCents ?? null,
      },
    });

    return { profile };
  }

  async latest(deviceIdHash: string) {
    const session = await this.prisma.calibrationSession.findFirst({
      where: { deviceIdHash },
      orderBy: { startedAt: 'desc' },
      include: { profile: true },
    });
    return session?.profile ?? null;
  }

  async metrics(sessionId: string) {
    return this.prisma.calibrationMetric.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });
  }
}
