export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          amount: number
          category: string
          date: string
          notes?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          amount: number
          category: string
          date: string
          notes?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          amount?: number
          category?: string
          date?: string
          notes?: string
        }
      }
    }
  }
}