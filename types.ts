
export enum TabType {
  STRATEGY = 'STRATEGY',
  DOCUMENTATION = 'DOCUMENTATION',
  ORIGIN = 'ORIGIN',
  MOSAIC = 'MOSAIC',
  DNA = 'DNA',
  MANDATES = 'MANDATES',
  SELF = 'SELF',
  DASHBOARD = 'DASHBOARD'
}

export type MemoryCategory = 'axiom' | 'chronos' | 'echo' | 'logos' | 'ethos';
export type SensitivityLevel = 'PRIVATE' | 'PUBLIC';
export type AccessLevel = 'CORE' | 'AMBASSADOR';
export type OriginCategory = 'CAREER' | 'MILESTONE' | 'PERSONAL' | 'RELATIONAL';

export interface MemoryShard {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  active: boolean;
  sensitivity: SensitivityLevel;
  audioData?: string; // Base64 raw audio
  attachmentUrl?: string; // Secure Proxy URL to GCS
  attachmentType?: string; // MIME type
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  sensors: string[];
  tools: string[];
  status: 'idle' | 'executing' | 'waiting';
}

export interface Mandate {
  id: string;
  title: string;
  objective: string;
  priority: 'CRITICAL' | 'STRATEGIC' | 'OPERATIONAL';
  status: 'active' | 'pending' | 'completed';
  agents: Agent[];
}

export interface OriginFact {
  id: string;
  date: string; // ISO or human readable
  day?: string;
  month?: string;
  year: string;
  event: string;
  significance: string;
  details?: string;
  category: OriginCategory;
  impact: number;
}

export interface Relationship {
  id: string;
  type: 'SPOUSE' | 'CHILD' | 'FRIEND' | 'PET' | 'PARENT' | 'OTHER';
  name: string;
  birthDate?: string;
  marriageDate?: string;
  place?: string;
  memories?: string;
  details?: string;
}

export interface InterestItem {
  id: string;
  name: string;
  notes?: string;
  meta?: string; // e.g. "Favorite Albums: X, Y" or "Why: Reason"
}

export interface Persona {
  name: string;
  profession: string;
  tone: string;
  coreValues: string[];
  bio: string;
  reasoningLogic: string;
  memoryShards: MemoryShard[];
  mandates: Mandate[];
  originFacts: OriginFact[];
  relationships: Relationship[];
  interests: {
    hobbies: string[];
    bands: InterestItem[];
    authors: InterestItem[];
    movies: InterestItem[];
    philosophy: string[];
  };
  vocalSignature?: string[]; 
  accessLevel: AccessLevel;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
