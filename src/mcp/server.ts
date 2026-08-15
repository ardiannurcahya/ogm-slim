import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { MemoryService } from '../services/memory.service.js';
import { CodebaseService } from '../services/codebase.service.js';
import {
  MemoryRecallSchema,
  MemoryObserveSchema,
  MemoryCommitSchema,
  MemoryFeedbackSchema,
  MemoryForgetSchema,
  MemoryInspectSchema,
  CodebaseListDatasetsSchema,
  CodebaseIndexSchema,
  CodebaseFindSymbolSchema,
  CodebaseCallGraphSchema,
  CodebaseImpactAnalysisSchema,
  CodebaseFileSummarySchema,
} from './catalog.js';

export function createMcpServer(
  memoryService: MemoryService,
  codebaseService: CodebaseService,
  defaultProjectId: string = 'default'
): Server {
  const server = new Server(
    {
      name: 'ogm-slim',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'memory_recall',
          description: 'Recall bounded, explainable memory capsules for the current project using text/exact matching.',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string', description: 'Natural language search text' },
              exact: { type: 'object', description: 'Exact key-value matches' },
              entity_key: { type: 'string', description: 'Entity or symbol key' },
              as_of: { type: 'string', description: 'Temporal cutoff timestamp' },
              limit: { type: 'integer', default: 10, description: 'Max results limit' },
            },
          },
        },
        {
          name: 'memory_observe',
          description: 'Persist one immutable, redacted evidence episode (e.g. error log, command output, diff).',
          inputSchema: {
            type: 'object',
            required: ['kind', 'observation'],
            properties: {
              kind: {
                type: 'string',
                enum: [
                  'observation',
                  'message',
                  'command',
                  'command_output',
                  'file',
                  'code',
                  'tool_call',
                  'tool_result',
                  'error',
                  'event',
                ],
              },
              observation: { description: 'Raw observation payload or JSON object' },
              metadata: { type: 'object', description: 'Metadata (repository, branch, file, symbol, session)' },
              observed_at: { type: 'string', description: 'ISO timestamp' },
              idempotency_key: { type: 'string', description: 'Unique operation key' },
            },
          },
        },
        {
          name: 'memory_commit',
          description: 'Commit a typed durable memory supported by episode evidence (bugfix, decision, procedure, etc.).',
          inputSchema: {
            type: 'object',
            required: ['type', 'content'],
            properties: {
              type: {
                type: 'string',
                enum: ['bugfix', 'decision', 'preference', 'procedure', 'research', 'trading', 'learning', 'fact', 'custom'],
              },
              content: { type: 'object', description: 'Structured conclusion (e.g. { summary, root_cause, fix, verification })' },
              confidence: { type: 'number', minimum: 0, maximum: 1, default: 1.0 },
              episodes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    episode_id: { type: 'string' },
                    purpose: { type: 'string', enum: ['source', 'evidence', 'verification'] },
                  },
                },
              },
              idempotency_key: { type: 'string' },
            },
          },
        },
        {
          name: 'memory_feedback',
          description: 'Record feedback on a memory (useful, incorrect, outdated, etc.).',
          inputSchema: {
            type: 'object',
            required: ['memory_id', 'kind'],
            properties: {
              memory_id: { type: 'string' },
              kind: { type: 'string', enum: ['confirm', 'reject', 'correct', 'supersede', 'merge', 'stale', 'verified'] },
              detail: { type: 'object' },
            },
          },
        },
        {
          name: 'memory_forget',
          description: 'Archive or invalidate a memory by ID.',
          inputSchema: {
            type: 'object',
            required: ['memory_id'],
            properties: {
              memory_id: { type: 'string' },
              mode: { type: 'string', enum: ['archive', 'invalidate', 'hard_delete'], default: 'archive' },
            },
          },
        },
        {
          name: 'memory_inspect',
          description: 'Inspect full memory details including supporting episodes, evidence, feedback, and history.',
          inputSchema: {
            type: 'object',
            required: ['memory_id'],
            properties: {
              memory_id: { type: 'string' },
            },
          },
        },
        {
          name: 'codebase_list_datasets',
          description: 'List all indexed codebase datasets, their file counts, symbols, and relation metrics.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'codebase_index',
          description: 'Scan and index a local codebase directory into a dedicated dataset knowledge graph in seconds.',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', default: '.', description: 'Directory path to index' },
              dataset: { type: 'string', description: 'Optional custom dataset name (e.g. "frontend", "backend")' },
              incremental: { type: 'boolean', default: true },
            },
          },
        },
        {
          name: 'codebase_find_symbol',
          description: 'Find symbols (functions, structs, interfaces, methods) by name, kind, or file within a dataset.',
          inputSchema: {
            type: 'object',
            properties: {
              dataset: { type: 'string', description: 'Dataset name or ID filter' },
              query: { type: 'string' },
              kind: { type: 'string', enum: ['function', 'method', 'struct', 'interface', 'type', 'class', 'variable', 'package'] },
              file: { type: 'string' },
              limit: { type: 'integer', default: 20 },
            },
          },
        },
        {
          name: 'codebase_call_graph',
          description: 'Trace callers and callees for a symbol up to 2-3 hops within a dataset.',
          inputSchema: {
            type: 'object',
            required: ['symbol_key'],
            properties: {
              symbol_key: { type: 'string' },
              dataset: { type: 'string', description: 'Dataset name or ID filter' },
              direction: { type: 'string', enum: ['callers', 'callees', 'both'], default: 'both' },
              depth: { type: 'integer', default: 1, minimum: 1, maximum: 3 },
            },
          },
        },
        {
          name: 'codebase_impact_analysis',
          description: 'Analyze downstream blast radius, affected files, and past linked incidents for a symbol.',
          inputSchema: {
            type: 'object',
            required: ['symbol_key'],
            properties: {
              symbol_key: { type: 'string' },
              dataset: { type: 'string', description: 'Dataset name or ID filter' },
            },
          },
        },
        {
          name: 'codebase_file_summary',
          description: 'Get high-density architectural summary of a file within a dataset.',
          inputSchema: {
            type: 'object',
            required: ['file'],
            properties: {
              file: { type: 'string' },
              dataset: { type: 'string', description: 'Dataset name or ID filter' },
            },
          },
        },
      ],
    };
  });

  // Handle Tool Calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const projectId = defaultProjectId;

    try {
      switch (name) {
        case 'memory_recall': {
          const parsed = MemoryRecallSchema.parse(args || {});
          const results = memoryService.recall({
            project_id: projectId,
            query: parsed.text,
            exact: parsed.exact,
            entity_key: parsed.entity_key,
            target_symbol_key: parsed.target_symbol_key,
            as_of: parsed.as_of,
            limit: parsed.limit,
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
          };
        }

        case 'memory_observe': {
          const parsed = MemoryObserveSchema.parse(args || {});
          const result = memoryService.observe(
            projectId,
            parsed.kind,
            parsed.observation,
            parsed.metadata,
            parsed.observed_at,
            parsed.idempotency_key
          );
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        case 'memory_commit': {
          const parsed = MemoryCommitSchema.parse(args || {});
          const result = memoryService.commit(
            projectId,
            parsed.type,
            parsed.content,
            parsed.confidence,
            parsed.episodes as any,
            parsed.idempotency_key,
            parsed.target_symbol_key
          );
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        case 'memory_feedback': {
          const parsed = MemoryFeedbackSchema.parse(args || {});
          const success = memoryService.feedback(projectId, parsed.memory_id, parsed.kind, parsed.detail);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success, memory_id: parsed.memory_id, kind: parsed.kind }, null, 2) }],
          };
        }

        case 'memory_forget': {
          const parsed = MemoryForgetSchema.parse(args || {});
          const success = memoryService.forget(projectId, parsed.memory_id, parsed.mode);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success, memory_id: parsed.memory_id, mode: parsed.mode }, null, 2) }],
          };
        }

        case 'memory_inspect': {
          const parsed = MemoryInspectSchema.parse(args || {});
          const detail = memoryService.inspect(projectId, parsed.memory_id);
          if (!detail) {
            throw new McpError(ErrorCode.InvalidParams, `Memory not found: ${parsed.memory_id}`);
          }
          return {
            content: [{ type: 'text', text: JSON.stringify(detail, null, 2) }],
          };
        }

        case 'codebase_list_datasets': {
          const datasets = codebaseService.listDatasets(projectId);
          return {
            content: [{ type: 'text', text: JSON.stringify(datasets, null, 2) }],
          };
        }

        case 'codebase_index': {
          const parsed = CodebaseIndexSchema.parse(args || {});
          const stats = await codebaseService.indexDirectory(parsed.path, projectId, parsed.dataset);
          return {
            content: [{ type: 'text', text: JSON.stringify({ status: 'indexed', stats }, null, 2) }],
          };
        }

        case 'codebase_find_symbol': {
          const parsed = CodebaseFindSymbolSchema.parse(args || {});
          const symbols = codebaseService.findSymbols(projectId, parsed.dataset, parsed.query, parsed.kind as any, parsed.file, parsed.limit);
          return {
            content: [{ type: 'text', text: JSON.stringify(symbols, null, 2) }],
          };
        }

        case 'codebase_call_graph': {
          const parsed = CodebaseCallGraphSchema.parse(args || {});
          const result = codebaseService.getCallGraph(projectId, parsed.symbol_key, parsed.dataset, parsed.direction, parsed.depth);
          if (!result) {
            throw new McpError(ErrorCode.InvalidParams, `Symbol not found: ${parsed.symbol_key}`);
          }
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        case 'codebase_impact_analysis': {
          const parsed = CodebaseImpactAnalysisSchema.parse(args || {});
          const impact = codebaseService.getImpactAnalysis(projectId, parsed.symbol_key, parsed.dataset);
          return {
            content: [{ type: 'text', text: JSON.stringify(impact, null, 2) }],
          };
        }

        case 'codebase_file_summary': {
          const parsed = CodebaseFileSummarySchema.parse(args || {});
          const summary = codebaseService.getFileSummary(projectId, parsed.file, parsed.dataset);
          return {
            content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
          };
        }

        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (err: any) {
      if (err instanceof McpError) throw err;
      return {
        isError: true,
        content: [{ type: 'text', text: `Error: ${err.message || String(err)}` }],
      };
    }
  });

  return server;
}
