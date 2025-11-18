import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalibrationsService } from './calibrations.service';
import { CreateCalibrationDto } from './dto/create-calibration.dto';

@ApiTags('Calibration')
@Controller('calibrations')
export class CalibrationsController {
  constructor(private readonly svc: CalibrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva calibración' })
  @ApiResponse({ status: 201, description: 'Calibración creada exitosamente' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiResponse({ status: 409, description: 'El sessionId ya existe' })
  async create(@Body() dto: CreateCalibrationDto) {
    return this.svc.create(dto);
  }

  @Get('current/:profileId')
  @ApiOperation({ summary: 'Obtener calibración actual de un perfil' })
  @ApiResponse({ status: 200, description: 'Calibración actual' })
  @ApiResponse({ status: 404, description: 'No hay calibración actual' })
  async getCurrent(@Param('profileId') profileId: string) {
    return this.svc.getCurrent(profileId);
  }

  @Get('profile/:profileId')
  @ApiOperation({ summary: 'Obtener todas las calibraciones de un perfil' })
  @ApiResponse({ status: 200, description: 'Lista de calibraciones' })
  async getAllByProfile(@Param('profileId') profileId: string) {
    return this.svc.getAllByProfile(profileId);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Obtener calibración por sessionId' })
  @ApiResponse({ status: 200, description: 'Calibración encontrada' })
  @ApiResponse({ status: 404, description: 'Calibración no encontrada' })
  async getBySessionId(@Param('sessionId') sessionId: string) {
    return this.svc.getBySessionId(sessionId);
  }

  @Put(':sessionId/set-current')
  @ApiOperation({ summary: 'Marcar una calibración como actual' })
  @ApiResponse({ status: 200, description: 'Calibración marcada como actual' })
  @ApiResponse({ status: 404, description: 'Calibración no encontrada' })
  async setAsCurrent(@Param('sessionId') sessionId: string) {
    return this.svc.setAsCurrent(sessionId);
  }
}
