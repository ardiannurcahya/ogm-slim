import Parser from 'web-tree-sitter';
import path from 'node:path';

async function test() {
  await Parser.init();
  const parser = new Parser();
  
  const wasmPath = path.resolve('node_modules/tree-sitter-wasms/out/tree-sitter-typescript.wasm');
  const TS = await Parser.Language.load(wasmPath);
  parser.setLanguage(TS);

  const code = `
    // User service class
    export class UserService {
      private token: string;

      constructor(token: string) {
        this.token = token;
      }

      public async fetchUser(id: string): Promise<User> {
        validateId(id);
        return apiClient.get('/users/' + id);
      }
    }

    export function validateId(id: string): boolean {
      return id.length > 0;
    }
  `;

  const tree = parser.parse(code);
  console.log('Root node type:', tree.rootNode.type);

  function walk(node, depth = 0) {
    if (['class_declaration', 'method_definition', 'function_declaration', 'interface_declaration', 'type_alias_declaration'].includes(node.type)) {
      const nameNode = node.childForFieldName('name') || node.children.find(c => c.type === 'property_identifier' || c.type === 'identifier' || c.type === 'type_identifier');
      console.log('  '.repeat(depth) + `[${node.type}] name: ${nameNode?.text} (lines ${node.startPosition.row + 1}-${node.endPosition.row + 1})`);
    }
    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i), depth + 1);
    }
  }

  walk(tree.rootNode);
}

test().catch(console.error);
