export interface Card {
  id: string;
  name: string;
  checks: {
    nonfoil: boolean;
    foil: boolean;
    sketch: boolean;
  };
}

export type CheckType = 'nonfoil' | 'foil' | 'sketch';

