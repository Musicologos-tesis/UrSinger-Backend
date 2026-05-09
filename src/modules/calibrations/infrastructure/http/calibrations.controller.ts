import { Body, Controller, Get, Param, Post, Put, NotFoundException, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCalibrationDto } from './dto/create-calibration.dto';
import { CreateCalibrationUseCase, CreateCalibrationCommand } from '../../application/use-cases/create-calibration.use-case';
import { GetCurrentCalibrationUseCase } from '../../application/use-cases/get-current-calibration.use-case';
import { GetAllCalibrationsUseCase } from '../../application/use-cases/get-all-calibrations.use-case';
import { GetCalibrationBySessionUseCase } from '../../application/use-cases/get-calibration-by-session.use-case';
import { SetCurrentCalibrationUseCase } from '../../application/use-cases/set-current-calibration.use-case';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';
import { SessionIdAlreadyExistsException } from '../../domain/exceptions/session-id-exists.exception';
import { CalibrationNotFoundException } from '../../domain/exceptions/calibration-not-found.exception';

@ApiTags('Calibration')
@Controller('calibrations')
export class CalibrationsController {
  constructor(
    private readonly createUseCase: CreateCalibrationUseCase,
    private readonly getCurrentUseCase: GetCurrentCalibrationUseCase,
    private readonly getAllUseCase: GetAllCalibrationsUseCase,
    private readonly getBySessionUseCase: GetCalibrationBySessionUseCase,
    private readonly setCurrentUseCase: SetCurrentCalibrationUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva calibración' })
  @ApiResponse({ status: 201, description: 'Calibración creada exitosamente' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiResponse({ status: 409, description: 'El sessionId ya existe' })
  async create(@Body() dto: CreateCalibrationDto) {
    try {
      return await this.createUseCase.execute(
        new CreateCalibrationCommand(dto.profileId, dto.sessionId, dto.deviceIdHash, dto.sampleRate, dto.noiseFloorDbfs, dto.snrDb),
      );
    } catch (e) {
      if (e instanceof ProfileNotFoundException) throw new NotFoundException(e.message);
      if (e instanceof SessionIdAlreadyExistsException) throw new ConflictException(e.message);
      throw e;
    }
  }

  @Get('current/:profileId')
  @ApiOperation({ summary: 'Obtener calibración actual de un perfil' })
  @ApiResponse({ status: 200, description: 'Calibración actual' })
  @ApiResponse({ status: 404, description: 'No hay calibración actual' })
  async getCurrent(@Param('profileId') profileId: string) {
    try {
      return await this.getCurrentUseCase.execute(profileId);
    } catch (e) {
      if (e instanceof CalibrationNotFoundException) throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Get('profile/:profileId')
  @ApiOperation({ summary: 'Obtener todas las calibraciones de un perfil' })
  @ApiResponse({ status: 200, description: 'Lista de calibraciones' })
  async getAllByProfile(@Param('profileId') profileId: string) {
    return this.getAllUseCase.execute(profileId);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Obtener calibración por sessionId' })
  @ApiResponse({ status: 200, description: 'Calibración encontrada' })
  @ApiResponse({ status: 404, description: 'Calibración no encontrada' })
  async getBySessionId(@Param('sessionId') sessionId: string) {
    try {
      return await this.getBySessionUseCase.execute(sessionId);
    } catch (e) {
      if (e instanceof CalibrationNotFoundException) throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Put(':sessionId/set-current')
  @ApiOperation({ summary: 'Marcar una calibración como actual' })
  @ApiResponse({ status: 200, description: 'Calibración marcada como actual' })
  @ApiResponse({ status: 404, description: 'Calibración no encontrada' })
  async setAsCurrent(@Param('sessionId') sessionId: string) {
    try {
      return await this.setCurrentUseCase.execute(sessionId);
    } catch (e) {
      if (e instanceof CalibrationNotFoundException) throw new NotFoundException(e.message);
      throw e;
    }
  }
}
