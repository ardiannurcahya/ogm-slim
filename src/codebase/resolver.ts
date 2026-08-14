import fs from 'node:fs';
import path from 'node:path';
import { AstExtractor, ExtractedFile } from './extractor.js';
import { computeGraphAnalytics, GraphEdge } from '../ranking/centrality.js';
import { CodeSymbol } from '../types/domain.js';

export interface IndexingStats {
  datasetId: string;
  datasetName: string;
  filesIndexed: number;
  symbolsCount: number;
  edgesCount: number;
  durationMs: number;
}

export class CodebaseIndexer {
  private extractor = new AstExtractor();

  public async indexDirectoryAsync(
    rootDir: string,
    projectId: string = 'default',
    datasetId: string = 'default',
    datasetName: string = 'default',
    ignorePatterns: string[] = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache', 'generated']
  ): Promise<{ symbols: CodeSymbol[]; edges: GraphEdge[]; stats: IndexingStats }> {
    const startTime = Date.now();
    const files = this.walkFiles(rootDir, ignorePatterns);

    const extractedFiles: ExtractedFile[] = [];
    for (const f of files) {
      const res = await this.extractor.extractFileAsync(f, rootDir, projectId);
      if (res && res.symbols.length > 0) {
        extractedFiles.push(res);
      }
    }

    // Build Global Symbol Resolution Table
    const symbolMapByName = new Map<string, CodeSymbol[]>();
    const allSymbols: CodeSymbol[] = [];

    for (const ef of extractedFiles) {
      for (const sym of ef.symbols) {
        sym.dataset_id = datasetId;
        allSymbols.push(sym);
        if (!symbolMapByName.has(sym.name)) {
          symbolMapByName.set(sym.name, []);
        }
        symbolMapByName.get(sym.name)!.push(sym);
      }
    }

    // Resolve Cross-File Edges
    const edges: GraphEdge[] = [];
    const edgeSet = new Set<string>();

    for (const ef of extractedFiles) {
      for (const call of ef.rawCalls) {
        const candidates = symbolMapByName.get(call.calleeToken);
        if (candidates && candidates.length > 0) {
          const target =
            candidates.find((c) => c.package_name === path.dirname(ef.relativePath)) || candidates[0];

          if (target.key !== call.callerKey) {
            const edgeKey = `${call.callerKey}->${target.key}`;
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              edges.push({ source: call.callerKey, target: target.key });
            }
          }
        }
      }
    }

    // Compute centrality and Louvain ranking
    computeGraphAnalytics(allSymbols, edges);

    const durationMs = Date.now() - startTime;
    return {
      symbols: allSymbols,
      edges,
      stats: {
        datasetId,
        datasetName,
        filesIndexed: extractedFiles.length,
        symbolsCount: allSymbols.length,
        edgesCount: edges.length,
        durationMs,
      },
    };
  }

  private walkFiles(dir: string, ignorePatterns: string[]): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      if (ignorePatterns.some((pattern) => item.name === pattern || item.name.includes(pattern))) {
        continue;
      }
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        results.push(...this.walkFiles(fullPath, ignorePatterns));
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (['.ts', '.tsx', '.js', '.jsx', '.go', '.py', '.rs'].includes(ext)) {
          results.push(fullPath);
        }
      }
    }

    return results;
  }
}
