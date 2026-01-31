
export enum TabType {
  ARCHITECTURE = 'ARCHITECTURE',
  BUILDER = 'BUILDER',
  MEMORY = 'MEMORY',
  NEXUS = 'NEXUS',
  CHAT = 'CHAT',
  STAGING = 'STAGING'
}

export type MemoryCategory = 'axiom' | 'chronos' | 'echo' | 'logos' | 'ethos';
export type NeuralCoreType = 'local' | 'vector_mesh';
export type SensitivityLevel = 'PRIVATE' | 'PUBLIC';
export type AccessLevel = 'CORE' | 'AMBASSADOR';

export interface MemoryShard {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  active: boolean;
  sensitivity: SensitivityLevel;
  lastSynced?: Date;
  vectorId?: string;
}

export interface CloudSource {
  id: string;
  accountEmail: string;
  provider: 'drive' | 'dropbox' | 'notion' | 'github' | 'linkedin' | 'gmail' | 'calendar';
  status: 'connected' | 'disconnected' | 'syncing';
  linkedFolders: string[];
  lastSynced: Date;
}

export interface Persona {
  name: string;
  profession: string;
  tone: string;
  coreValues: string[];
  bio: string;
  knowledgeBase: string;
  ragSource: string;
  agentLogic: string;
  memoryShards: MemoryShard[];
  voiceSignature: string;
  cloudSources: CloudSource[];
  targetComplexity: number;
  neuralCoreType: NeuralCoreType;
  vectorEnabled: boolean;
  accessLevel: AccessLevel;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingSource?: string;
  nexusSources?: string[];
  isPrivate?: boolean;
}

export interface CloudSyncStatus {
  lastUplink?: Date;
  repoUrl?: string;
  isHosted: boolean;
}
