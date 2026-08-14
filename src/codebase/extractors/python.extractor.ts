import Parser from 'web-tree-sitter';
import path from 'node:path';
import { CodeSymbol, SymbolKind } from '../../types/domain.js';
import {
  ExtractedLanguageResult,
  extractCalls,
  extractDocstring,
  ILanguageExtractor,
  RawCall,
} from './base.extractor.js';

export class PythonExtractor implements ILanguageExtractor {
  public extract(
    tree: Parser.Tree,
    content: string,
    relativePath: string,
    projectId: string
  ): ExtractedLanguageResult {
    const symbols: CodeSymbol[] = [];
    const rawCalls: RawCall[] = [];
    const lines = content.split('\n');
    const pkgName = path.dirname(relativePath).replace(/\\/g, '/');

    const walk = (node: Parser.SyntaxNode) => {
      let kind: SymbolKind | null = null;
      let nameNode: Parser.SyntaxNode | null = null;

      switch (node.type) {
        case 'function_definition':
          kind = node.parent?.type === 'class_definition' ? 'method' : 'function';
          nameNode = node.childForFieldName('name');
          break;
        case 'class_definition':
          kind = 'class';
          nameNode = node.childForFieldName('name');
          break;
      }

      if (kind && nameNode) {
        const name = nameNode.text;
        const key = `${relativePath}:${name}`;
        const startLine = node.startPosition.row + 1;
        const endLine = node.endPosition.row + 1;
        const docstring = extractDocstring(lines, node.startPosition.row);

        const sigLine = lines[node.startPosition.row]?.trim() || name;
        const signature = sigLine.length > 120 ? sigLine.slice(0, 120) + '...' : sigLine;

        const callsData = extractCalls(key, node);
        rawCalls.push(...callsData.rawCalls);

        symbols.push({
          key,
          project_id: projectId,
          name,
          kind,
          package_name: pkgName,
          file_path: relativePath,
          start_line: startLine,
          end_line: endLine,
          signature,
          docstring,
          calls: callsData.calleeList,
        });
      }

      for (let i = 0; i < node.childCount; i++) {
        walk(node.child(i)!);
      }
    };

    walk(tree.rootNode);
    return { symbols, rawCalls };
  }
}
