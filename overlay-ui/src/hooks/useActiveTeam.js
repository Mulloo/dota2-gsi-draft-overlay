import { useMemo } from 'react';

const useActiveTeam = (draft, nextSlot) => {
  return useMemo(() => {
    if (nextSlot?.team) {
      return nextSlot.team;
    }
    return draft.activeteam === 2 ? 'Radiant' : 'Dire';
  }, [draft.activeteam, nextSlot]);
};

export default useActiveTeam;