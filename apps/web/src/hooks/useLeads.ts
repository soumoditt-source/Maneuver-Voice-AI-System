import { useState, useCallback, useMemo } from 'react';
import type { LeadData } from '@/lib/types';

export function useLeads() {
  const [leadData, setLeadData] = useState<LeadData>({
    name: null,
    company: null,
    role: null,
    email: null,
    phone: null,
    problem: null,
    timeline: null,
    budget: null,
    authority: null,
    next_action: null,
    sentiment: null,
  });

  const updateLeadField = useCallback((field: string, value: string) => {
    setLeadData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const progress = useMemo(() => {
    const fields = Object.keys(leadData) as (keyof LeadData)[];
    const targetFields = fields.filter(f => f !== 'sentiment' && f !== 'next_action');
    const filled = targetFields.filter(f => leadData[f] !== null).length;
    return Math.round((filled / targetFields.length) * 100);
  }, [leadData]);

  return {
    leadData,
    updateLeadField,
    progress
  };
}
