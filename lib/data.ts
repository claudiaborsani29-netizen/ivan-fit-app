export type Exercise = {
  id: number;
  name: string;
  sets: number;
  targetReps: string;
  last: string;
  suggested: string;
};

export const todayWorkout: Exercise[] = [
  { id: 1, name: 'Squat', sets: 3, targetReps: '8', last: '80 kg × 8', suggested: '82,5 kg' },
  { id: 2, name: 'Affondi', sets: 3, targetReps: '10', last: '16 kg × 10', suggested: '18 kg' },
  { id: 3, name: 'Leg Press', sets: 4, targetReps: '10', last: '120 kg × 10', suggested: '125 kg' },
  { id: 4, name: 'Adductor', sets: 3, targetReps: '12', last: '45 kg × 12', suggested: '47,5 kg' },
];

export const athletes = [
  { id: 1, name: 'Claudia', plan: 'Premium 90', adherence: '92%', nextCheck: '24 settembre' },
  { id: 2, name: 'Marco', plan: 'Autonomy 90', adherence: '84%', nextCheck: '29 settembre' },
  { id: 3, name: 'Giulia', plan: 'Duo 90', adherence: '96%', nextCheck: '2 ottobre' },
];
