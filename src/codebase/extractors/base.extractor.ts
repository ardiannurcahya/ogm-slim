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
    'console', 'log', 'error', 'warn', 'info', 'debug', 'trace',
    'String', 'Number', 'Boolean', 'Array', 'Object', 'Promise',
    'JSON', 'Math', 'Date', 'RegExp', 'Map', 'Set', 'Error',
    'null', 'undefined', 'true', 'false', 'this', 'super',
    'toString', 'valueOf', 'slice', 'push', 'pop', 'shift', 'unshift',
    'split', 'join', 'replace', 'trim', 'toLowerCase', 'toUpperCase',
    'includes', 'indexOf', 'filter', 'map', 'forEach', 'reduce',
    'find', 'some', 'every', 'sort', 'concat', 'entries', 'keys', 'values'
  ]);

  const cleanToken = (raw: string): string => {
    let t = raw;
    if (t.includes('.')) {
      const parts = t.split('.');
      t = parts[parts.length - 1];
    }
    if (t.includes('::')) {
      const parts = t.split('::');
      t = parts[parts.length - 1];
    }
    return t.replace(/[^a-zA-Z0-9_$]/g, '');
  };

  const addCallee = (token: string) => {
    const cleaned = cleanToken(token);
    if (cleaned && cleaned.length > 1 && !ignored.has(cleaned) && !cleaned.startsWith('_') && isNaN(Number(cleaned))) {
      found.add(cleaned);
      rawCalls.push({ callerKey, calleeToken: cleaned });
    }
  };

  const walk = (n: Parser.SyntaxNode) => {
    // 1. Function / Method Calls
    if (n.type === 'call_expression' || n.type === 'call') {
      const fnChild = n.childForFieldName('function') || n.child(0);
      if (fnChild) {
        addCallee(fnChild.text);
      }

      // Check arguments for callbacks/handler references e.g. router.get('/', handleLogin)
      const argsNode = n.childForFieldName('arguments');
      if (argsNode) {
        for (let i = 0; i < argsNode.childCount; i++) {
          const arg = argsNode.child(i)!;
          if (arg.type === 'identifier' || arg.type === 'type_identifier') {
            addCallee(arg.text);
          }
        }
      }
    }

    // 2. Class Instantiations (new MyService())
    if (n.type === 'new_expression') {
      const ctorChild = n.childForFieldName('constructor') || n.child(1);
      if (ctorChild) {
        addCallee(ctorChild.text);
      }
    }

    // 3. React JSX Element Usage (<MyComponent />, <UserCard>)
    if (n.type === 'jsx_opening_element' || n.type === 'jsx_self_closing_element') {
      const nameChild = n.childForFieldName('name') || n.child(1);
      if (nameChild) {
        const componentName = nameChild.text;
        // In React, custom components start with Uppercase
        if (componentName && /^[A-Z]/.test(componentName)) {
          addCallee(componentName);
        }
      }
    }

    // 4. Class Inheritance & Interfaces (extends BaseClass, implements IService)
    if (n.type === 'class_heritage' || n.type === 'extends_clause' || n.type === 'implements_clause') {
      for (let i = 0; i < n.childCount; i++) {
        const c = n.child(i)!;
        if (c.type === 'identifier' || c.type === 'type_identifier') {
          addCallee(c.text);
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
