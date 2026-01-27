
export interface MemoryShard {
  id: string;
  category: 'chronos' | 'axiom' | 'echo';
  title: string;
  content: string;
  active: boolean;
  sourceUrl?: string;
  lastSynced?: Date;
}

export interface CloudSource {
  id: string;
  accountEmail: string;
  provider: 'drive' | 'github' | 'notion' | 'linkedin';
  status: 'connected' | 'syncing' | 'error';
  linkedFolders: string[];
  lastSynced?: Date;
}

export interface Persona {
  name: string;
  profession: string;
  tone: string;
  coreValues: string[];
  bio: string;
  knowledgeBase: string;
  ragSource?: string;
  agentLogic?: string;
  memoryShards: MemoryShard[];
  voiceSignature: string;
  cloudSources: CloudSource[];
}

export enum TabType {
  ARCHITECTURE = 'architecture',
  BUILDER = 'builder',
  MEMORY = 'memory',
  NEXUS = 'nexus',
  CHAT = 'chat'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingSource?: string;
}
