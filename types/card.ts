export type CheckType = 'nonfoil' | 'foil' | 'sketch'

export interface Card {
  id: string
  name: string
  checks: {
    [key in CheckType]: boolean
  }
}

