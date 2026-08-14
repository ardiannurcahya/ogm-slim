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

export class TypeScriptExtractor implements ILanguageExtractor {
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
      let bodyNode: Parser.SyntaxNode | null = null;

      switch (node.type) {
        case 'function_declaration':
          kind = 'function';
          nameNode = node.childForFieldName('name');
          bodyNode = node.childForFieldName('body') || node;
          break;

        case 'method_definition':
          kind = 'method';
          nameNode = node.childForFieldName('name');
          bodyNode = node.childForFieldName('body') || node;
          break;

        case 'class_declaration':
          kind = 'class';
          nameNode = node.childForFieldName('name');
          bodyNode = node.childForFieldName('body') || node;
          break;

        case 'interface_declaration':
          kind = 'interface';
          nameNode = node.childForFieldName('name');
          bodyNode = node.childForFieldName('body') || node;
          break;

        case 'type_alias_declaration':
          kind = 'type';
          nameNode = node.childForFieldName('name');
          bodyNode = node.childForFieldName('value') || node;
          break;

        // Modern Arrow Functions & Function Expressions: const myFunc = () => { ... }
        case 'variable_declarator': {
          const idChild = node.childForFieldName('name');
          const valueChild = node.childForFieldName('value');
          if (idChild && valueChild) {
            if (
              valueChild.type === 'arrow_function' ||
              valueChild.type === 'function_expression' ||
              valueChild.type === 'function'
            ) {
              kind = 'function';
              nameNode = idChild;
              bodyNode = valueChild.childForFieldName('body') || valueChild;
            }
          }
          break;
        }
      }

      if (kind && nameNode) {
        const name = nameNode.text;
        const key = `${relativePath}:${name}`;
        const startLine = node.startPosition.row + 1;
        const endLine = node.endPosition.row + 1;
        const docstring = extractDocstring(lines, node.startPosition.row);

        const sigLine = lines[node.startPosition.row]?.trim() || name;
        const signature = sigLine.length > 120 ? sigLine.slice(0, 120) + '...' : sigLine;

        const callsData = extractCalls(key, bodyNode || node);
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

    // If file has top-level calls outside functions and we have symbols, attribute top-level calls to the first symbol
    if (symbols.length > 0) {
      const topLevelCalls = extractCalls(symbols[0].key, tree.rootNode);
      for (const call of topLevelCalls.rawCalls) {
        if (!rawCalls.some(r => r.callerKey === call.callerKey && r.calleeToken === call.calleeToken)) {
          rawCalls.push(call);
        }
      }
    }

    return { symbols, rawCalls };
  }
}
