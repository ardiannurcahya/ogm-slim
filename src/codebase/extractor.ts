import Parser from 'web-tree-sitter';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CodeSymbol } from '../types/domain.js';
import { ILanguageExtractor, RawCall } from './extractors/base.extractor.js';
import { TypeScriptExtractor } from './extractors/typescript.extractor.js';
import { GolangExtractor } from './extractors/golang.extractor.js';
import { PythonExtractor } from './extractors/python.extractor.js';
import { RustExtractor } from './extractors/rust.extractor.js';

export interface ExtractedFile {
  filePath: string;
  relativePath: string;
  language: string;
  symbols: CodeSymbol[];
  rawCalls: RawCall[];
}

export class AstExtractor {
  private isInitialized = false;
  private parsers = new Map<string, Parser>();
  private extractors = new Map<string, ILanguageExtractor>();

  constructor() {
    // Register specialized modular extractors
    const tsExtractor = new TypeScriptExtractor();
    this.extractors.set('ts', tsExtractor);
    this.extractors.set('tsx', tsExtractor);
    this.extractors.set('js', tsExtractor);
    this.extractors.set('jsx', tsExtractor);

    this.extractors.set('go', new GolangExtractor());
    this.extractors.set('py', new PythonExtractor());
    this.extractors.set('rs', new RustExtractor());
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    await Parser.init();

    // Resolve tree-sitter-wasms directory
    let wasmDir = path.resolve('node_modules/tree-sitter-wasms/out');
    if (!fs.existsSync(wasmDir)) {
      try {
        const pkgPath = fileURLToPath(import.meta.url);
        wasmDir = path.resolve(path.dirname(pkgPath), '../../node_modules/tree-sitter-wasms/out');
      } catch {
        // Fallback
      }
    }

    const wasmFiles: Record<string, string> = {
      ts: 'tree-sitter-typescript.wasm',
      tsx: 'tree-sitter-tsx.wasm',
      js: 'tree-sitter-javascript.wasm',
      jsx: 'tree-sitter-javascript.wasm',
      go: 'tree-sitter-go.wasm',
      py: 'tree-sitter-python.wasm',
      rs: 'tree-sitter-rust.wasm',
    };

    for (const [ext, wasmFile] of Object.entries(wasmFiles)) {
      const wasmPath = path.join(wasmDir, wasmFile);
      if (fs.existsSync(wasmPath)) {
        try {
          const lang = await Parser.Language.load(wasmPath);
          const p = new Parser();
          p.setLanguage(lang);
          this.parsers.set(ext, p);
        } catch (e) {
          console.warn(`[OGM-Slim] Warning loading tree-sitter wasm for ${ext}:`, e);
        }
      }
    }

    this.isInitialized = true;
  }

  public async extractFileAsync(
    filePath: string,
    rootDir: string,
    projectId: string = 'default'
  ): Promise<ExtractedFile | null> {
    await this.ensureInitialized();
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const ext = path.extname(filePath).toLowerCase().replace('.', '');

    const parser = this.parsers.get(ext);
    const extractor = this.extractors.get(ext);
    if (!parser || !extractor) return null;

    const tree = parser.parse(content);
    const result = extractor.extract(tree, content, relativePath, projectId);

    return {
      filePath,
      relativePath,
      language: ext,
      symbols: result.symbols,
      rawCalls: result.rawCalls,
    };
  }
}

export * from './extractors/base.extractor.js';
