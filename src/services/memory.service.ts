import { MemoryRepository } from '../db/repositories/memory.repo.js';
import {
  Episode,
  EpisodeKind,
  EpisodeMetadata,
  EpisodeReference,
  Memory,
  MemoryCapsule,
  MemoryDetail,
  MemoryStatus,
  MemoryType,
  RecallQuery,
} from '../types/domain.js';

export class MemoryService {
  constructor(private memoryRepo: MemoryRepository) {}

  public observe(
    projectId: string,
    kind: EpisodeKind,
    observation: unknown,
    metadata?: EpisodeMetadata,
    observedAt?: string,
    idempotencyKey?: string
  ): { episode: Episode; replayed: boolean } {
    return this.memoryRepo.createEpisode(projectId, kind, observation, metadata, observedAt, idempotencyKey);
  }

  public commit(
    projectId: string,
    type: MemoryType,
    content: Record<string, unknown>,
    confidence: number = 1.0,
    references: EpisodeReference[] = [],
    idempotencyKey?: string
  ): { memory: Memory; replayed: boolean } {
    return this.memoryRepo.commitMemory(projectId, type, content, confidence, references, idempotencyKey);
  }

  public recall(query: RecallQuery): MemoryCapsule[] {
    return this.memoryRepo.recall(query);
  }

  public inspect(projectId: string, memoryId: string): MemoryDetail | null {
    return this.memoryRepo.getDetail(projectId, memoryId);
  }

  public feedback(
    projectId: string,
    memoryId: string,
    kind: string,
    detail: unknown = {}
  ): boolean {
    return this.memoryRepo.addFeedback(projectId, memoryId, kind, detail);
  }

  public forget(projectId: string, memoryId: string, mode: 'archive' | 'invalidate' | 'hard_delete' = 'archive'): boolean {
    if (mode === 'hard_delete') {
      return this.memoryRepo.hardDelete(projectId, memoryId);
    }
    const status: MemoryStatus = mode === 'invalidate' ? 'invalidated' : 'archived';
    return this.memoryRepo.setStatus(projectId, memoryId, status);
  }

  public getStats(projectId: string) {
    return this.memoryRepo.getStats(projectId);
  }

  public getMemoryGraph(projectId: string) {
    return this.memoryRepo.getMemoryGraphData(projectId);
  }
}
