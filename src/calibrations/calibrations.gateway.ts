import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { CalibrationsService } from './calibrations.service';
import { RoomCheckTickDto, GainTickDto, MetricsTickDto } from './dto/ws-ticks.dto';

@WebSocketGateway({ namespace: 'calibration', cors: true })
export class CalibrationsGateway {
  constructor(private readonly svc: CalibrationsService) {}

  @SubscribeMessage('device:selected')
  async deviceSelected(@MessageBody() payload: { sessionId: string; deviceIdHash: string; sampleRate: number }) {
    await this.svc.deviceSelected(payload);
    return { ack: true };
  }

  @SubscribeMessage('room_check')
  async roomCheck(@MessageBody() dto: RoomCheckTickDto) {
    await this.svc.roomCheck(dto);
    return { ack: true };
  }

  @SubscribeMessage('gain_tick')
  async gainTick(@MessageBody() dto: GainTickDto) {
    await this.svc.gainTick(dto);
    return { ack: true };
  }

  @SubscribeMessage('metrics_tick')
  async metricsTick(@MessageBody() dto: MetricsTickDto) {
    await this.svc.metricsTick(dto);
    return { ack: true };
  }
}
