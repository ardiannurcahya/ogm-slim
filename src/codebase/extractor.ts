import Parser from 'web-tree-sitter';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CodeSymbol, SymbolKind } from '../types/domain.js';

export interface ExtractedFile {
  filePath: string;
  relativePath: string;
  language: string;
  symbols: CodeSymbol[];
  rawCalls: Array<{ callerKey: string; calleeToken: string }>;
}

export class AstExtractor {
  private isInitialized = false;
  private parsers = new Map<string, Parser>();
  private languages = new Map<string, Parser.Language>();

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    await Parser.init();

    // Resolve tree-sitter-wasms directory
    let wasmDir = path.resolve('node_modules/tree-sitter-wasms/out');
    if (!fs.existsSync(wasmDir)) {
      // Try from package root
      try {
        const pkgPath = fileURLToPath(import.meta.url);
        wasmDir = path.resolve(path.dirname(pkgPath), '../../node_modules/tree-sitter-wasms/out');
      } catch {
        // Fallback
      }
    }

    const map: Record<string, string> = {
      ts: 'tree-sitter-typescript.wasm',
      tsx: 'tree-sitter-tsx.wasm',
      js: 'tree-sitter-javascript.wasm',
      jsx: 'tree-sitter-javascript.wasm',
      go: 'tree-sitter-go.wasm',
      py: 'tree-sitter-python.wasm',
      rs: 'tree-sitter-rust.wasm',
    };

    for (const [ext, wasmFile] of Object.entries(map)) {
      const wasmPath = path.join(wasmDir, wasmFile);
      if (fs.existsSync(wasmPath)) {
        try {
          const lang = await Parser.Language.load(wasmPath);
          const p = new Parser();
          p.setLanguage(lang);
          this.languages.set(ext, lang);
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
    if (!parser) return null;

    const tree = parser.parse(content);
    const symbols: CodeSymbol[] = [];
    const rawCalls: Array<{ callerKey: string; calleeToken: string }> = [];

    const lines = content.split('\n');

    const findDocstring = (startRow: number): string => {
      let doc = '';
      for (let r = startRow - 1; r >= 0; r--) {
        const line = lines[r].trim();
        if (line.startsWith('//') || line.startsWith('#') || line.startsWith('*') || line.startsWith('/*')) {
          doc = line.replace(/^\/\/\s*|^#\s*|^\/\*\*\s*|^\*\s*|\*\/$/g, '') + ' ' + doc;
        } else if (line === '') {
          continue;
        } else {
          break;
        }
      }
      return doc.trim();
    };

    const extractCallsFromNode = (callerKey: string, node: Parser.SyntaxNode) => {
      const found = new Set<string>();
      const walkCalls = (n: Parser.SyntaxNode) => {
        if (n.type === 'call_expression' || n.type === 'call') {
          // Identify callee
          const fnChild = n.childForFieldName('function') || n.child(0);
          if (fnChild) {
            let calleeName = fnChild.text;
            if (calleeName.includes('.')) {
              const parts = calleeName.split('.');
              calleeName = parts[parts.length - 1];
            }
            if (
              calleeName &&
              !['if', 'for', 'while', 'switch', 'catch', 'require', 'import', 'return', 'make', 'len', 'append'].includes(
                calleeName
              )
            ) {
              found.add(calleeName);
              rawCalls.push({ callerKey, calleeToken: calleeName });
            }
          }
        }
        for (let i = 0; i < n.childCount; i++) {
          walkCalls(n.child(i)!);
        }
      };
      walkCalls(node);
      return Array.from(found);
    };

    // Traverse Tree-sitter AST nodes
    const walkNode = (node: Parser.SyntaxNode) => {
      let kind: SymbolKind | null = null;
      let nameNode: Parser.SyntaxNode | null = null;
      let signature = '';

      switch (node.type) {
        // TypeScript / JavaScript / Go / Rust / Python
        case 'function_declaration':
        case 'function_definition':
        case 'function_item':
          kind = node.parent?.type === 'class_definition' || node.parent?.type === 'impl_item' ? 'method' : 'function';
          nameNode = node.childForFieldName('name');
          break;
        case 'method_definition':
        case 'method_declaration':
          kind = 'method';
          nameNode = node.childForFieldName('name');
          break;
        case 'class_declaration':
        case 'class_definition':
          kind = 'class';
          nameNode = node.childForFieldName('name');
          break;
        case 'interface_declaration':
        case 'trait_item':
          kind = 'interface';
          nameNode = node.childForFieldName('name');
          break;
        case 'type_alias_declaration':
          kind = 'type';
          nameNode = node.childForFieldName('name');
          break;
        case 'struct_item':
          kind = 'struct';
          nameNode = node.childForFieldName('name');
          break;
        case 'type_spec': {
          nameNode = node.childForFieldName('name');
          const typeChild = node.childForFieldName('type');
          if (typeChild?.type === 'struct_type') kind = 'struct';
          else if (typeChild?.type === 'interface_type') kind = 'interface';
          else kind = 'type';
          break;
        }
      }

      if (kind && nameNode) {
        const name = nameNode.text;
        const key = `${relativePath}:${name}`;
        const startLine = node.startPosition.row + 1;
        const endLine = node.endPosition.row + 1;
        const docstring = findDocstring(node.startPosition.row);

        // First line or signature header
        const sigLine = lines[node.startPosition.row]?.trim() || name;
        signature = sigLine.length > 120 ? sigLine.slice(0, 120) + '...' : sigLine;

        const calls = extractCallsFromNode(key, node);

        symbols.push({
          key,
          project_id: projectId,
          name,
          kind,
          package_name: path.dirname(relativePath),
          file_path: relativePath,
          start_line: startLine,
          end_line: endLine,
          signature,
          docstring,
          calls,
        });
      }

      for (let i = 0; i < node.childCount; i++) {
        walkNode(node.child(i)!);
      }
    };

    walkNode(tree.rootNode);

    return {
      filePath,
      relativePath,
      language: ext,
      symbols,
      rawCalls,
    };
  }

  // Synchronous fallback / proxy
  public extractFile(filePath: string, rootDir: string, projectId: string = 'default'): ExtractedFile | null {
    // For sync calls, run regex-free or use cache
    return null;
  }
}
