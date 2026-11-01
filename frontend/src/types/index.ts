export interface User {
  id: string
  display_name: string
  username: string
  email: string
  email_verified: boolean
  avatar: string | null
  preferences: UserPreferences
  privacy_settings: PrivacySettings
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  default_view: 'grid' | 'list'
  favorite_genres: string[]
  preferred_languages: string[]
}

export interface PrivacySettings {
  profile_public: boolean
  library_public: boolean
}

export interface Media {
  id: string
  provider: string
  provider_id: number
  provider_ids?: { tmdb_id?: number; anilist_id?: number }
  media_type: 'movie' | 'tv' | 'anime'
  title: string
  original_title?: string
  synopsis?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  genres: string[]
  languages?: string[]
  countries?: string[]
  rating?: number
  runtime?: number
  season_count?: number
  episode_count?: number
  status?: string
  trailer_url?: string
  cast?: any[]
  crew?: any[]
}

export interface LibraryEntry {
  id: string
  user_id: string
  media_id: string
  status: 'plan_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped'
  personal_rating?: number
  notes?: string
  started_at?: string
  completed_at?: string
  added_at: string
  updated_at: string
  media?: Media
}

export interface EpisodeProgress {
  id: string
  user_id: string
  media_id: string
  season_number: number
  episode_number: number
  watched_at: string
  updated_at: string
}

export interface LibraryStats {
  total_titles: number
  plan_to_watch: number
  watching: number
  completed: number
  on_hold: number
  dropped: number
  completed_movies: number
  completed_anime: number
  completed_series: number
  episodes_watched: number
  total_hours: number
}

export interface Statistics {
  total_titles: number
  plan_to_watch: number
  watching: number
  completed: number
  on_hold: number
  dropped: number
  completed_movies: number
  completed_anime: number
  completed_series: number
  episodes_watched: number
  total_hours: number
  recently_completed: any[]
  currently_watching: any[]
  favorite_genres: Array<{ genre: string; count: number }>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}



