import { useState, useCallback } from 'react';
import type { VisualState } from '@/lib/types';

export function useVisuals() {
  const [visualState, setVisualState] = useState<VisualState>('none');
  const [currentService, setCurrentService] = useState<string | null>(null);

  const showServices = useCallback(() => setVisualState('services_slide'), []);
  const showClients = useCallback(() => setVisualState('clients_slide'), []);
  const showAbout = useCallback(() => setVisualState('about_us'), []);
  
  const showServiceDetail = useCallback((name: string) => {
    setCurrentService(name);
    setVisualState('service_detail');
  }, []);
  
  const showProcess = useCallback(() => setVisualState('process_diagram'), []);
  
  const hideVisuals = useCallback(() => {
    setVisualState('none');
    setCurrentService(null);
  }, []);

  return {
    visualState,
    currentService,
    showServices,
    showClients,
    showAbout,
    showServiceDetail,
    showProcess,
    hideVisuals
  };
}
