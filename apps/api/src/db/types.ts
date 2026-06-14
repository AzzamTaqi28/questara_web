export interface Profile {
  id: string;
  auth_id: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  home_city: string | null;
  role: 'user' | 'admin';
  xp: number;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  province: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Place {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  category: string;
  address: string | null;
  lat: number;
  lng: number;
  opening_hours: Record<string, string> | null;
  ticket_price_min: number | null;
  ticket_price_max: number | null;
  image_url: string | null;
  source_url: string | null;
  verification_status: 'draft' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  city_id: string;
  title: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_duration_minutes: number | null;
  estimated_budget_min: number | null;
  estimated_budget_max: number | null;
  cover_image_url: string | null;
  is_published: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface QuestStop {
  id: string;
  quest_id: string;
  place_id: string;
  position: number;
  required: boolean;
  hint: string | null;
  recommended_duration_minutes: number | null;
  created_at: string;
}

export interface Stamp {
  id: string;
  place_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  place_id: string;
  quest_id: string | null;
  lat: number | null;
  lng: number | null;
  method: 'gps' | 'qr' | 'manual_admin';
  is_valid: boolean;
  distance_meters: number | null;
  created_at: string;
}

export interface UserStamp {
  id: string;
  user_id: string;
  stamp_id: string;
  place_id: string;
  quest_id: string | null;
  earned_at: string;
}

export interface Itinerary {
  id: string;
  user_id: string;
  quest_id: string | null;
  title: string | null;
  input_preferences: Record<string, unknown>;
  plan: Record<string, unknown>;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string | null;
  city_id: string | null;
  type: 'event' | 'place';
  title: string;
  location_text: string | null;
  date_text: string | null;
  source_url: string | null;
  notes: string | null;
  extracted_data: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  created_at: string;
  reviewed_at: string | null;
}

export interface Event {
  id: string;
  city_id: string;
  place_id: string | null;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  price_min: number | null;
  price_max: number | null;
  source_url: string | null;
  image_url: string | null;
  tags: string[];
  status: 'draft' | 'published' | 'expired' | 'rejected';
  created_at: string;
  updated_at: string;
}