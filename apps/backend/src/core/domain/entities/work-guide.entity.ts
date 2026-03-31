import { WorkGuide } from '@repo/schemas';

export type { WorkGuide, Activity, ConceptItem } from '@repo/schemas';

export interface WorkGuideEntity {
  id: string;
  userId: string;
  topic: string;
  targetAudience: string;
  language: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  content: WorkGuide | null;
  globalScore: number | null;
  errorMessage: string | null;
  reviewed: boolean;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  hasCover: boolean;
  coverImageDataUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
