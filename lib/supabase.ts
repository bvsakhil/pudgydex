import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserCard {
  id: number;
  user_address: string;
  card_id: string;
  regular: boolean;
  foil: boolean;
  sketch: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_cards: {
        Row: UserCard;
        Insert: Omit<UserCard, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserCard, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

export const getUserCards = async (address: string) => {
  console.log("Getting user cards for address:", address);
  const { data, error } = await supabase
    .from('user_cards')
    .select('*')
    .eq('user_address', address.toLowerCase());

  if (error) throw error;
  return data;
};

export const upsertUserCard = async (
  address: string,
  cardId: string,
  checkType: 'regular' | 'foil' | 'sketch',
  value: boolean
) => {
  console.log("upsertUserCard", address, cardId, checkType, value);
  const { error } = await supabase
    .from('user_cards')
    .upsert(
      {
        user_address: address.toLowerCase(),
        card_id: cardId,
        [checkType]: value,
      },
      {
        onConflict: 'user_address,card_id',
      }
    );

  if (error) throw error;
}; 