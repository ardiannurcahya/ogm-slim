import Parser from 'web-tree-sitter';
import path from 'node:path';

async function testAll() {
  await Parser.init();
  const wasmDir = path.resolve('node_modules/tree-sitter-wasms/out');

  const languages = [
    { lang: 'typescript', file: 'tree-sitter-typescript.wasm' },
    { lang: 'javascript', file: 'tree-sitter-javascript.wasm' },
    { lang: 'go', file: 'tree-sitter-go.wasm' },
    { lang: 'python', file: 'tree-sitter-python.wasm' },
    { lang: 'rust', file: 'tree-sitter-rust.wasm' },
  ];

  for (const item of languages) {
    const wasmPath = path.join(wasmDir, item.file);
    const lang = await Parser.Language.load(wasmPath);
    const parser = new Parser();
    parser.setLanguage(lang);
    console.log(`✅ Loaded Tree-sitter grammar: ${item.lang}`);
  }
}

testAll().catch(console.error);
