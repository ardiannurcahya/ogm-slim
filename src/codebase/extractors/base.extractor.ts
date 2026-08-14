import Parser from 'web-tree-sitter';
import { CodeSymbol } from '../../types/domain.js';

export interface RawCall {
  callerKey: string;
  calleeToken: string;
}

export interface ExtractedLanguageResult {
  symbols: CodeSymbol[];
  rawCalls: RawCall[];
}

export interface ILanguageExtractor {
  extract(
    tree: Parser.Tree,
    content: string,
    relativePath: string,
    projectId: string
  ): ExtractedLanguageResult;
}

export function extractDocstring(lines: string[], startRow: number): string {
  let doc = '';
  for (let r = startRow - 1; r >= 0; r--) {
    const line = lines[r].trim();
    if (
      line.startsWith('//') ||
      line.startsWith('#') ||
      line.startsWith('*') ||
      line.startsWith('/*')
    ) {
      doc = line.replace(/^\/\/\s*|^#\s*|^\/\*\*\s*|^\*\s*|\*\/$/g, '') + ' ' + doc;
    } else if (line === '') {
      continue;
    } else {
      break;
    }
  }
  return doc.trim();
}

export function extractCalls(
  callerKey: string,
  node: Parser.SyntaxNode
): { calleeList: string[]; rawCalls: RawCall[] } {
  const found = new Set<string>();
  const rawCalls: RawCall[] = [];

  const ignored = new Set([
    'if', 'for', 'while', 'switch', 'catch', 'require', 'import',
    'return', 'make', 'len', 'append', 'new', 'delete', 'panic',
  ]);

  const walk = (n: Parser.SyntaxNode) => {
    if (n.type === 'call_expression' || n.type === 'call') {
      const fnChild = n.childForFieldName('function') || n.child(0);
      if (fnChild) {
        let callee = fnChild.text;
        if (callee.includes('.')) {
          const parts = callee.split('.');
          callee = parts[parts.length - 1];
        }
        if (callee && !ignored.has(callee) && !callee.startsWith('_')) {
          found.add(callee);
          rawCalls.push({ callerKey, calleeToken: callee });
        }
      }
    }
    for (let i = 0; i < n.childCount; i++) {
      walk(n.child(i)!);
    }
  };

  walk(node);
  return { calleeList: Array.from(found), rawCalls };
}
