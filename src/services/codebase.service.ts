import { CodebaseRepository } from '../db/repositories/codebase.repo.js';
import { CodebaseIndexer, IndexingStats } from '../codebase/resolver.js';
import {
  CallGraphResult,
  CodeSymbol,
  Dataset,
  FileSummary,
  ImpactAnalysis,
  SymbolKind,
} from '../types/domain.js';
import path from 'node:path';

export class CodebaseService {
  private indexer = new CodebaseIndexer();

  constructor(private codebaseRepo: CodebaseRepository) {}

  public listDatasets(projectId: string): Dataset[] {
    return this.codebaseRepo.listDatasets(projectId);
  }

  public async indexDirectory(
    rootDir: string,
    projectId: string = 'default',
    datasetName?: string,
    ignorePatterns?: string[]
  ): Promise<IndexingStats> {
    const resolvedPath = path.resolve(rootDir);
    const derivedName = datasetName || path.basename(resolvedPath) || 'default';
    const dataset = this.codebaseRepo.getOrCreateDataset(projectId, derivedName, resolvedPath);

    const { symbols, edges, stats } = await this.indexer.indexDirectoryAsync(
      rootDir,
      projectId,
      dataset.id,
      dataset.name,
      ignorePatterns
    );

    this.codebaseRepo.saveSymbolsBatch(projectId, dataset.id, symbols, edges, stats.filesIndexed);
    return stats;
  }

  public findSymbols(
    projectId: string,
    dataset?: string,
    query?: string,
    kind?: SymbolKind,
    file?: string,
    limit?: number
  ): CodeSymbol[] {
    return this.codebaseRepo.findSymbols(projectId, dataset, query, kind, file, limit);
  }

  public getCallGraph(
    projectId: string,
    symbolKey: string,
    dataset?: string,
    direction: 'callers' | 'callees' | 'both' = 'both',
    depth: number = 1
  ): CallGraphResult | null {
    return this.codebaseRepo.getCallGraph(projectId, symbolKey, dataset, direction, depth);
  }

  public getImpactAnalysis(projectId: string, symbolKey: string, dataset?: string): ImpactAnalysis {
    return this.codebaseRepo.getImpactAnalysis(projectId, symbolKey, dataset);
  }

  public getFileSummary(projectId: string, filePath: string, dataset?: string): FileSummary {
    return this.codebaseRepo.getFileSummary(projectId, filePath, dataset);
  }

  public getGraphData(projectId: string, dataset?: string) {
    return this.codebaseRepo.getAllGraphData(projectId, dataset);
  }
}
