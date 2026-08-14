/**
 * Domain types for OGM-Slim (OpenGraphMemory Slim)
 */

export type EpisodeKind =
  | 'observation'
  | 'message'
  | 'command'
  | 'command_output'
  | 'file'
  | 'code'
  | 'tool_call'
  | 'tool_result'
  | 'error'
  | 'event';

export interface EpisodeMetadata {
  repository?: string;
  branch?: string;
  commit?: string;
  file?: string;
  symbol?: string;
  command?: string;
  runtime?: string;
  dependency?: string;
  tool?: string;
  session?: string;
  [key: string]: unknown;
}

export interface Episode {
  id: string;
  project_id: string;
  kind: EpisodeKind;
  observation: unknown;
  metadata: EpisodeMetadata;
  observed_at: string;
  created_at: string;
  idempotency_key: string;
}

export type MemoryType =
  | 'bugfix'
  | 'decision'
  | 'preference'
  | 'procedure'
  | 'research'
  | 'trading'
  | 'learning'
  | 'fact'
  | 'custom';

export type MemoryStatus = 'active' | 'archived' | 'invalidated';

export interface EpisodeReference {
  episode_id: string;
  purpose: 'source' | 'evidence' | 'verification';
}

export interface Memory {
  id: string;
  project_id: string;
  type: MemoryType;
  content: Record<string, unknown>;
  confidence: number;
  status: MemoryStatus;
  origin_ids: string[];
  created_at: string;
  updated_at: string;
  idempotency_key: string;
}

export interface MemoryDetail {
  memory: Memory;
  episodes: Episode[];
  evidence: Episode[];
  feedback: Array<{ kind: string; detail: unknown; created_at: string }>;
  history: Array<{ action: string; occurred_at: string; actor: string }>;
}

export interface RecallQuery {
  project_id: string;
  text?: string;
  exact?: Record<string, string>;
  entity_key?: string;
  as_of?: string;
  limit?: number;
}

export interface MemoryCapsule {
  id: string;
  type: MemoryType;
  confidence: number;
  status: MemoryStatus;
  content: Record<string, unknown>;
  score: number;
  created_at: string;
  citations: string[];
}

export type SymbolKind = 'function' | 'method' | 'struct' | 'interface' | 'type' | 'class' | 'variable' | 'package';

export interface CodeSymbol {
  key: string;
  project_id: string;
  name: string;
  kind: SymbolKind;
  package_name: string;
  file_path: string;
  start_line: number;
  end_line: number;
  signature: string;
  docstring: string;
  calls: string[];
  pagerank?: number;
  community_id?: number;
  degree?: number;
}

export interface CallGraphNode {
  key: string;
  name: string;
  kind: SymbolKind;
  file: string;
  line: number;
  signature: string;
}

export interface CallGraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface CallGraphResult {
  symbol: CodeSymbol;
  nodes: CallGraphNode[];
  edges: CallGraphEdge[];
  callers: string[];
  callees: string[];
}

export interface FileSummary {
  file_path: string;
  language: string;
  loc: number;
  symbols: Array<{
    name: string;
    kind: SymbolKind;
    line: number;
    signature: string;
  }>;
  imports: string[];
  linked_memories: MemoryCapsule[];
}

export interface ImpactAnalysis {
  symbol_key: string;
  symbol: CodeSymbol | null;
  direct_callers: string[];
  transitive_callers: string[];
  affected_files: string[];
  blast_radius_score: number;
  related_memories: MemoryCapsule[];
}
