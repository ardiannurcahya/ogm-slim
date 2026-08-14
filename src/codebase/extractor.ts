import fs from 'node:fs';
import path from 'node:path';
import { CodeSymbol, SymbolKind } from '../types/domain.js';

export interface ExtractedFile {
  filePath: string;
  relativePath: string;
  language: string;
  symbols: CodeSymbol[];
  rawCalls: Array<{ callerKey: string; calleeToken: string }>;
}

export class AstExtractor {
  public extractFile(filePath: string, rootDir: string, projectId: string = 'default'): ExtractedFile | null {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const ext = path.extname(filePath).toLowerCase();

    const symbols: CodeSymbol[] = [];
    const rawCalls: Array<{ callerKey: string; calleeToken: string }> = [];

    switch (ext) {
      case '.ts':
      case '.tsx':
      case '.js':
      case '.jsx':
      case '.mjs':
        this.extractTypeScript(content, relativePath, projectId, symbols, rawCalls);
        break;
      case '.go':
        this.extractGo(content, relativePath, projectId, symbols, rawCalls);
        break;
      case '.py':
        this.extractPython(content, relativePath, projectId, symbols, rawCalls);
        break;
      case '.rs':
        this.extractRust(content, relativePath, projectId, symbols, rawCalls);
        break;
      default:
        return null;
    }

    return {
      filePath,
      relativePath,
      language: ext.slice(1),
      symbols,
      rawCalls,
    };
  }

  private extractTypeScript(
    content: string,
    file: string,
    projectId: string,
    symbols: CodeSymbol[],
    rawCalls: Array<{ callerKey: string; calleeToken: string }>
  ) {
    const lines = content.split('\n');

    // Regex matchers for TS/JS constructs
    const fnRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/g;
    const constFnRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/g;
    const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+([a-zA-Z0-9_$]+)(?:\s+extends\s+([a-zA-Z0-9_$]+))?/g;
    const ifaceRegex = /(?:export\s+)?interface\s+([a-zA-Z0-9_$]+)/g;
    const typeRegex = /(?:export\s+)?type\s+([a-zA-Z0-9_$]+)\s*=/g;
    const methodRegex = /^\s*(?:public|private|protected|async|static|\s)*([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{/g;

    const findDoc = (lineIdx: number): string => {
      let doc = '';
      for (let i = lineIdx - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) {
          doc = line.replace(/^\/\/\s*|^\/\*\*\s*|^\*\s*|\*\/$/g, '') + ' ' + doc;
        } else if (line === '') {
          continue;
        } else {
          break;
        }
      }
      return doc.trim();
    };

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;

      // Functions
      let match;
      fnRegex.lastIndex = 0;
      while ((match = fnRegex.exec(line)) !== null) {
        const name = match[1];
        const key = `${file}:${name}`;
        const doc = findDoc(idx);
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: 'function',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 15,
          signature: match[0],
          docstring: doc,
          calls: [],
        });
      }

      // Const arrow functions
      constFnRegex.lastIndex = 0;
      while ((match = constFnRegex.exec(line)) !== null) {
        const name = match[1];
        const key = `${file}:${name}`;
        const doc = findDoc(idx);
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: 'function',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 15,
          signature: match[0],
          docstring: doc,
          calls: [],
        });
      }

      // Classes
      classRegex.lastIndex = 0;
      while ((match = classRegex.exec(line)) !== null) {
        const name = match[1];
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: 'class',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 30,
          signature: match[0],
          docstring: findDoc(idx),
          calls: [],
        });
      }

      // Interfaces
      ifaceRegex.lastIndex = 0;
      while ((match = ifaceRegex.exec(line)) !== null) {
        const name = match[1];
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: 'interface',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 10,
          signature: match[0],
          docstring: findDoc(idx),
          calls: [],
        });
      }

      // Types
      typeRegex.lastIndex = 0;
      while ((match = typeRegex.exec(line)) !== null) {
        const name = match[1];
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: 'type',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 5,
          signature: match[0],
          docstring: findDoc(idx),
          calls: [],
        });
      }
    });

    // Extract function call tokens within each symbol body
    const callTokenRegex = /\b([a-zA-Z0-9_$]+)\s*\(/g;
    for (const sym of symbols) {
      const slice = lines.slice(sym.start_line - 1, Math.min(lines.length, sym.end_line)).join('\n');
      let callMatch;
      callTokenRegex.lastIndex = 0;
      const foundCalls = new Set<string>();
      while ((callMatch = callTokenRegex.exec(slice)) !== null) {
        const callee = callMatch[1];
        if (callee !== sym.name && !['if', 'for', 'while', 'switch', 'catch', 'require', 'import'].includes(callee)) {
          foundCalls.add(callee);
          rawCalls.push({ callerKey: sym.key, calleeToken: callee });
        }
      }
      sym.calls = Array.from(foundCalls);
    }
  }

  private extractGo(
    content: string,
    file: string,
    projectId: string,
    symbols: CodeSymbol[],
    rawCalls: Array<{ callerKey: string; calleeToken: string }>
  ) {
    const lines = content.split('\n');
    const fnRegex = /^func\s+(?:\((?:[^)]+)\)\s+)?([A-Za-z0-9_]+)\s*\(([^)]*)\)/;
    const typeRegex = /^type\s+([A-Za-z0-9_]+)\s+(struct|interface)/;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const fnMatch = fnRegex.exec(line.trim());
      if (fnMatch) {
        const name = fnMatch[1];
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: line.includes('(') && line.indexOf('(') < line.indexOf(name) ? 'method' : 'function',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 20,
          signature: fnMatch[0],
          docstring: '',
          calls: [],
        });
      }

      const typeMatch = typeRegex.exec(line.trim());
      if (typeMatch) {
        const name = typeMatch[1];
        const kind = typeMatch[2] === 'interface' ? 'interface' : 'struct';
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind,
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 15,
          signature: typeMatch[0],
          docstring: '',
          calls: [],
        });
      }
    });

    const callTokenRegex = /\b([a-zA-Z0-9_]+)\s*\(/g;
    for (const sym of symbols) {
      const slice = lines.slice(sym.start_line - 1, Math.min(lines.length, sym.end_line)).join('\n');
      let callMatch;
      callTokenRegex.lastIndex = 0;
      const foundCalls = new Set<string>();
      while ((callMatch = callTokenRegex.exec(slice)) !== null) {
        const callee = callMatch[1];
        if (callee !== sym.name && !['if', 'for', 'switch', 'return', 'make', 'new', 'append', 'len'].includes(callee)) {
          foundCalls.add(callee);
          rawCalls.push({ callerKey: sym.key, calleeToken: callee });
        }
      }
      sym.calls = Array.from(foundCalls);
    }
  }

  private extractPython(
    content: string,
    file: string,
    projectId: string,
    symbols: CodeSymbol[],
    rawCalls: Array<{ callerKey: string; calleeToken: string }>
  ) {
    const lines = content.split('\n');
    const fnRegex = /^(\s*)def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/;
    const classRegex = /^(\s*)class\s+([a-zA-Z0-9_]+)(?:\(([^)]*)\))?:/;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const fnMatch = fnRegex.exec(line);
      if (fnMatch) {
        const isMethod = fnMatch[1].length > 0;
        const name = fnMatch[2];
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: isMethod ? 'method' : 'function',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 15,
          signature: fnMatch[0],
          docstring: '',
          calls: [],
        });
      }

      const classMatch = classRegex.exec(line);
      if (classMatch) {
        const name = classMatch[2];
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: 'class',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 25,
          signature: classMatch[0],
          docstring: '',
          calls: [],
        });
      }
    });

    const callTokenRegex = /\b([a-zA-Z0-9_]+)\s*\(/g;
    for (const sym of symbols) {
      const slice = lines.slice(sym.start_line - 1, Math.min(lines.length, sym.end_line)).join('\n');
      let callMatch;
      callTokenRegex.lastIndex = 0;
      const foundCalls = new Set<string>();
      while ((callMatch = callTokenRegex.exec(slice)) !== null) {
        const callee = callMatch[1];
        if (callee !== sym.name && !['if', 'for', 'while', 'def', 'class', 'print', 'super', 'len', 'range'].includes(callee)) {
          foundCalls.add(callee);
          rawCalls.push({ callerKey: sym.key, calleeToken: callee });
        }
      }
      sym.calls = Array.from(foundCalls);
    }
  }

  private extractRust(
    content: string,
    file: string,
    projectId: string,
    symbols: CodeSymbol[],
    rawCalls: Array<{ callerKey: string; calleeToken: string }>
  ) {
    const lines = content.split('\n');
    const fnRegex = /(?:pub\s+)?(?:async\s+)?fn\s+([a-zA-Z0-9_]+)\s*\(/;
    const structRegex = /(?:pub\s+)?struct\s+([a-zA-Z0-9_]+)/;
    const traitRegex = /(?:pub\s+)?trait\s+([a-zA-Z0-9_]+)/;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const fnMatch = fnRegex.exec(line);
      if (fnMatch) {
        const name = fnMatch[1];
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: 'function',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 15,
          signature: fnMatch[0],
          docstring: '',
          calls: [],
        });
      }

      const structMatch = structRegex.exec(line);
      if (structMatch) {
        const name = structMatch[1];
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: 'struct',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 10,
          signature: structMatch[0],
          docstring: '',
          calls: [],
        });
      }

      const traitMatch = traitRegex.exec(line);
      if (traitMatch) {
        const name = traitMatch[1];
        const key = `${file}:${name}`;
        symbols.push({
          key,
          project_id: projectId,
          name,
          kind: 'interface',
          package_name: path.dirname(file),
          file_path: file,
          start_line: lineNum,
          end_line: lineNum + 10,
          signature: traitMatch[0],
          docstring: '',
          calls: [],
        });
      }
    });
  }
}
