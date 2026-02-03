
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
  date: string; // Full date string (e.g., "June 15, 2020")
  event: string;
  significance: string;
  details?: string;
  category: OriginCategory;
  impact: number; // 1-10 priority
}

export interface Relationship {
  id: string;
  type: 'SPOUSE' | 'CHILD' | 'GRANDCHILD' | 'PET' | 'PARENT' | 'OTHER';
  name: string;
  birthDate?: string;
  marriageDate?: string;
  place?: string;
  memories?: string;
  details?: string;
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
    music: string[];
    authors: string[];
    movies: string[];
    foods: string[];
    philosophy: string[];
    other: string[];
  };
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
