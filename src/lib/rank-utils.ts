import { User } from '@/types';

// Define rank hierarchy (higher number = higher rank)
const getRankPriority = (rank: string): number => {
  if (!rank) return 0;
  
  const lowerRank = rank.toLowerCase();
  
  // Chief/Head positions (highest)
  if (lowerRank.includes('chief') || lowerRank.includes('head')) return 100;
  
  // Captain level
  if (lowerRank.includes('captain')) return 90;
  
  // Lieutenant level  
  if (lowerRank.includes('lieutenant')) return 80;
  
  // Doctor level
  if (lowerRank.includes('doctor') || lowerRank.includes('physician')) return 70;
  
  // Specialist/Senior levels
  if (lowerRank.includes('specialist') || lowerRank.includes('sr.') || lowerRank.includes('senior')) return 60;
  
  // Attending/Paramedic level
  if (lowerRank.includes('attending') || lowerRank.includes('paramedic')) return 50;
  
  // EMT level
  if (lowerRank.includes('emt') && !lowerRank.includes('sr.')) return 40;
  
  // Intern/Trainee (lowest)
  if (lowerRank.includes('intern') || lowerRank.includes('trainee')) return 10;
  
  // Default for unknown ranks
  return 30;
};

export function sortUsersByRank(users: User[]): User[] {
  return [...users].sort((a, b) => {
    const priorityA = getRankPriority(a.rank || '');
    const priorityB = getRankPriority(b.rank || '');
    
    // Primary sort by rank priority (descending)
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    // Secondary sort by username (ascending) for same rank
    return (a.username || '').localeCompare(b.username || '');
  });
} 