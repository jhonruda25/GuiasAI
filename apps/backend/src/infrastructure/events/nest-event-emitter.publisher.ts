import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { IEventPublisher } from '../../core/domain/ports';

@Injectable()
export class NestEventEmitterPublisher implements IEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publishGuideUpdated(guideId: string, payload: unknown): void {
    this.eventEmitter.emit(`guide.updated.${guideId}`, payload);
  }
}
