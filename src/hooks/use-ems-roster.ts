import { useQuery } from '@tanstack/react-query';

interface EMSRosterUser {
  name: string;
  rank: string;
  callsign: string;
  assignment: string;
  activity: string;
  status: string;
  fto: boolean;
  soloCleared: boolean;
  waterRescue: boolean;
  coPilot: boolean;
  aviation: boolean;
  psychNeuro: boolean;
  ftoCert: boolean;
}

interface EMSRosterResponse {
  users: EMSRosterUser[];
  total: number;
}

async function fetchEMSRoster(): Promise<EMSRosterResponse> {
  const response = await fetch('/api/ems/roster');
  
  if (!response.ok) {
    throw new Error('Failed to fetch EMS roster');
  }
  
  const data = await response.json();
  return data;
}

export function useEMSRoster() {
  return useQuery({
    queryKey: ['ems-roster'],
    queryFn: fetchEMSRoster,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 