
import React, { useState, useMemo } from 'react';
import { Persona, OriginFact, OriginCategory, Relationship, AccessLevel, InterestItem } from '../types';

interface OriginStoryViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

type SubTab = 'timeline' | 'kinship' | 'favorites';

const OriginStoryView: React.FC<OriginStoryViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('timeline');
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [editingRelationId, setEditingRelationId] = useState<string | null>(null);
  const [activeInterestCategory, setActiveInterestCategory] = useState<keyof Persona['interests'] | null>(null);

  const [newFact, setNewFact] = useState<Partial<OriginFact>>({ month: '', day: '', year: '', event: '', significance: '', details: '', category: 'PERSONAL', impact: 5 });
  const [newRelation, setNewRelation] = useState<Partial<Relationship>>({ type: 'FRIEND', name: '', birthDate: '', marriageDate: '', memories: '', details: '' });
  const [newInterest, setNewInterest] = useState({ name: '', meta: '' });

  const isLocked = accessLevel !== 'CORE';

  // --- TIMELINE LOGIC ---
  const handleSaveFact = () => {
    if (!newFact