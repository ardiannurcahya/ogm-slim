import { CodebaseRepository } from '../db/repositories/codebase.repo.js';
import { CodebaseIndexer, IndexingStats } from '../codebase/resolver.js';
import {
  CallGraphResult,
  CodeSymbol,
  FileSummary,
  ImpactAnalysis,
  SymbolKind,
} from '../types/domain.js';

export class CodebaseService {
  private indexer = new CodebaseIndexer();

  constructor(private codebaseRepo: CodebaseRepository) {}

  public indexDirectory(
    rootDir: string,
    projectId: string = 'default',
    ignorePatterns?: string[]
  ): IndexingStats {
    const { symbols, edges, stats } = this.indexer.indexDirectory(rootDir, projectId, ignorePatterns);
    this.codebaseRepo.saveSymbolsBatch(projectId, symbols, edges);
    return stats;
  }

  public findSymbols(
    projectId: string,
    query?: string,
    kind?: SymbolKind,
    file?: string,
    limit?: number
  ): CodeSymbol[] {
    return this.codebaseRepo.findSymbols(projectId, query, kind, file, limit);
  }

  public getCallGraph(
    projectId: string,
    symbolKey: string,
    direction: 'callers' | 'callees' | 'both' = 'both',
    depth: number = 1
  ): CallGraphResult | null {
    return this.codebaseRepo.getCallGraph(projectId, symbolKey, direction, depth);
  }

  public getImpactAnalysis(projectId: string, symbolKey: string): ImpactAnalysis {
    return this.codebaseRepo.getImpactAnalysis(projectId, symbolKey);
  }

  public getFileSummary(projectId: string, filePath: string): FileSummary {
    return this.codebaseRepo.getFileSummary(projectId, filePath);
  }

  public getGraphData(projectId: string) {
    return this.codebaseRepo.getAllGraphData(projectId);
  }
}
