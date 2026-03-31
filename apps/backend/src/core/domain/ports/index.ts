import { WorkGuideEntity } from '../entities/work-guide.entity';

export const WORK_GUIDE_REPOSITORY = 'WORK_GUIDE_REPOSITORY';
export const QUEUE_PRODUCER = 'QUEUE_PRODUCER';
export const EVENT_PUBLISHER = 'EVENT_PUBLISHER';
export const AI_GENERATOR_SERVICE = 'AI_GENERATOR_SERVICE';

export interface CreateWorkGuideDto {
  topic: string;
  targetAudience: string;
  language: 'es' | 'en';
  activities?: string[];
}

export interface IWorkGuideRepository {
  create(data: CreateWorkGuideDto, userId: string): Promise<WorkGuideEntity>;
  findById(id: string): Promise<WorkGuideEntity | null>;
  findByIdForUser(id: string, userId: string): Promise<WorkGuideEntity | null>;
  findCoverByIdForUser(id: string, userId: string): Promise<string | null>;
  findAllForUser(userId: string): Promise<WorkGuideEntity[]>;
  updateStatus(
    id: string,
    status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED',
    content?: unknown,
    globalScore?: number,
    errorMessage?: string,
    coverImageDataUrl?: string | null,
  ): Promise<WorkGuideEntity>;
  markAsReviewed(id: string, reviewerName: string): Promise<WorkGuideEntity>;
}

export interface IQueueProducer {
  enqueueGeneration(
    guideId: string,
    topic: string,
    targetAudience: string,
    language: string,
    activities?: string[],
  ): Promise<void>;
}

export interface IEventPublisher {
  publishGuideUpdated(guideId: string, payload: unknown): void;
}

export interface IAiGeneratorService {
  generateWorkGuide(
    topic: string,
    targetAudience: string,
    language: string,
    activities?: string[],
  ): Promise<unknown>;
}
