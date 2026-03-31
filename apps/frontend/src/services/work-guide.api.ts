import type { WorkGuide } from '@repo/schemas';
import { apiClient } from './api-client';
import { API_BASE_URL } from '@/lib/api-config';

export type WorkGuideStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface WorkGuideListItem {
  id: string;
  topic: string;
  targetAudience: string;
  language: string;
  status: WorkGuideStatus;
  hasCover: boolean;
  globalScore: number | null;
  errorMessage: string | null;
  reviewed: boolean;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkGuideRecord extends WorkGuideListItem {
  content: WorkGuide | null;
}

export interface CreateWorkGuideResponse {
  guideId: string;
  status: Extract<WorkGuideStatus, 'GENERATING'>;
}

interface WorkGuideCoverResponse {
  coverImageDataUrl: string;
}

export async function getAllWorkGuides(): Promise<WorkGuideListItem[]> {
  const { data } = await apiClient.get<WorkGuideListItem[]>('/api/v1/work-guides');
  return data;
}

export async function getWorkGuideById(id: string): Promise<WorkGuideRecord> {
  const { data } = await apiClient.get<WorkGuideRecord>(`/api/v1/work-guides/${id}`);
  return data;
}

export async function getWorkGuideCover(id: string): Promise<string> {
  const { data } = await apiClient.get<WorkGuideCoverResponse>(
    `/api/v1/work-guides/${id}/cover`,
  );
  return data.coverImageDataUrl;
}

export async function createWorkGuide(
  topic: string,
  targetAudience: string,
  language: string,
  activities: string[],
): Promise<CreateWorkGuideResponse> {
  const { data } = await apiClient.post<CreateWorkGuideResponse>('/api/v1/work-guides', {
    topic,
    targetAudience,
    language,
    activities,
  });
  return data;
}

export async function retryWorkGuide(id: string) {
  const { data } = await apiClient.post<CreateWorkGuideResponse>(`/api/v1/work-guides/${id}/retry`);
  return data;
}

export async function markAsReviewed(id: string, reviewerName: string) {
  const { data } = await apiClient.post<WorkGuideRecord>(`/api/v1/work-guides/${id}/review`, {
    reviewerName,
  });
  return data;
}

export function getWorkGuideEventsUrl(id: string) {
  return `${API_BASE_URL}/api/v1/work-guides/${id}/events`;
}

// Compatibility object for the SSE hook
export const workGuideApi = {
  create: createWorkGuide,
  getStatus: getWorkGuideById,
};
