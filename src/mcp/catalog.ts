import { z } from 'zod';

export const MemoryRecallSchema = z.object({
  text: z.string().max(4096).optional().describe('Natural language search text for memories'),
  exact: z.record(z.string()).optional().describe('Exact key-value metadata matches'),
  entity_key: z.string().optional().describe('Specific symbol or entity key to filter'),
  as_of: z.string().optional().describe('Temporal ISO timestamp cutoff filter'),
  limit: z.number().int().min(1).max(50).default(10).describe('Maximum number of memories to return'),
});

export const MemoryObserveSchema = z.object({
  kind: z.enum([
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
  ]).describe('Type of evidence observation'),
  observation: z.any().describe('Raw observation JSON object or text'),
  metadata: z.record(z.any()).optional().default({}).describe('Metadata such as repository, branch, commit, file, symbol'),
  observed_at: z.string().optional().describe('ISO timestamp when observation occurred'),
  idempotency_key: z.string().max(200).optional().describe('Unique key to prevent duplicate evidence insertion'),
});

export const MemoryCommitSchema = z.object({
  type: z.enum([
    'bugfix',
    'decision',
    'preference',
    'procedure',
    'research',
    'trading',
    'learning',
    'fact',
    'custom',
  ]).describe('Semantic category of durable memory'),
  content: z.record(z.any()).describe('Durable structured conclusion (e.g. { summary, root_cause, fix, verification })'),
  confidence: z.number().min(0).max(1).default(1.0).describe('Confidence score between 0.0 and 1.0'),
  episodes: z.array(
    z.object({
      episode_id: z.string().describe('ID of supporting episode'),
      purpose: z.enum(['source', 'evidence', 'verification']).describe('Role of supporting episode'),
    })
  ).optional().default([]).describe('Array of supporting episode IDs'),
  idempotency_key: z.string().max(200).optional().describe('Unique key to prevent duplicate memory commit'),
});

export const MemoryFeedbackSchema = z.object({
  memory_id: z.string().describe('Target Memory ID'),
  kind: z.enum(['confirm', 'reject', 'correct', 'supersede', 'merge', 'stale', 'verified']).describe('Feedback action type'),
  detail: z.record(z.any()).optional().default({}).describe('Optional feedback detail explanation'),
});

export const MemoryForgetSchema = z.object({
  memory_id: z.string().describe('Memory ID to archive or invalidate'),
  mode: z.enum(['archive', 'invalidate', 'hard_delete']).default('archive').describe('Deletion mode: archive, invalidate, or hard_delete'),
});

export const MemoryInspectSchema = z.object({
  memory_id: z.string().describe('Memory ID to inspect with full provenance and history'),
});

export const CodebaseListDatasetsSchema = z.object({}).describe('List all indexed codebase datasets');

export const CodebaseIndexSchema = z.object({
  path: z.string().default('.').describe('Root directory path of the codebase to index'),
  dataset: z.string().optional().describe('Optional custom dataset name (e.g. "frontend", "backend", "auth-service")'),
  incremental: z.boolean().default(true).describe('Whether to run incrementally'),
});

export const CodebaseFindSymbolSchema = z.object({
  dataset: z.string().optional().describe('Filter by specific codebase dataset name or ID'),
  query: z.string().optional().describe('Symbol name, keyword, or pattern search'),
  kind: z.enum(['function', 'method', 'struct', 'interface', 'type', 'class', 'variable', 'package']).optional().describe('Symbol kind filter'),
  file: z.string().optional().describe('File path substring filter'),
  limit: z.number().int().min(1).max(50).default(20).describe('Max results limit'),
});

export const CodebaseCallGraphSchema = z.object({
  symbol_key: z.string().describe('Symbol key or name to trace call graph for'),
  dataset: z.string().optional().describe('Optional codebase dataset name or ID'),
  direction: z.enum(['callers', 'callees', 'both']).default('both').describe('Call graph direction'),
  depth: z.number().int().min(1).max(3).default(1).describe('Call graph traversal depth'),
});

export const CodebaseImpactAnalysisSchema = z.object({
  symbol_key: z.string().describe('Symbol key or name to analyze downstream impact and blast radius for'),
  dataset: z.string().optional().describe('Optional codebase dataset name or ID'),
});

export const CodebaseFileSummarySchema = z.object({
  file: z.string().describe('Relative file path to get architectural summary for'),
  dataset: z.string().optional().describe('Optional codebase dataset name or ID'),
});
