import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

// Check if we're in development mode with mock Supabase
const isDevelopment = import.meta.env.VITE_SUPABASE_URL === 'https://example.supabase.co';

type Expense = Database['public']['Tables']['expenses']['Row'];

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (isDevelopment) {
      // In development mode, use mock data
      console.log('Development mode: Using mock expense data');
      const mockExpenses: Expense[] = [
        {
          id: '1',
          created_at: new Date().toISOString(),
          user_id: user.id,
          name: 'Internet',
          amount: 800,
          category: 'Utilities',
          date: new Date().toISOString().split('T')[0],
          notes: 'Monthly internet bill'
        },
        {
          id: '2',
          created_at: new Date().toISOString(),
          user_id: user.id,
          name: 'Netflix',
          amount: 260,
          category: 'Entertainment',
          date: new Date().toISOString().split('T')[0],
          notes: 'Subscription'
        },
        {
          id: '3',
          created_at: new Date().toISOString(),
          user_id: user.id,
          name: 'Groceries',
          amount: 1500,
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
          notes: 'Weekly shopping'
        }
      ];
      setExpenses(mockExpenses);
      setLoading(false);
    } else {
      // In production, use Supabase
      // Initial fetch
      const fetchExpenses = async () => {
        try {
          const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) throw error;
          setExpenses(data || []);
        } catch (error) {
          console.error('Error fetching expenses:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchExpenses();

      // Set up real-time subscription
      const subscription = supabase
        .channel('expenses_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expenses',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setExpenses((current) => [payload.new as Expense, ...current]);
            } else if (payload.eventType === 'DELETE') {
              setExpenses((current) =>
                current.filter((expense) => expense.id !== payload.old.id)
              );
            } else if (payload.eventType === 'UPDATE') {
              setExpenses((current) =>
                current.map((expense) =>
                  expense.id === payload.new.id ? (payload.new as Expense) : expense
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    if (isDevelopment) {
      // In development mode, simulate adding an expense
      console.log('Development mode: Adding mock expense', newExpense);
      const mockExpense: Expense = {
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        user_id: user.id,
        ...newExpense
      };
      setExpenses(prev => [mockExpense, ...prev]);
      return mockExpense;
    } else {
      // In production, use Supabase
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            ...newExpense,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    if (!user) return;

    if (isDevelopment) {
      // In development mode, simulate updating an expense
      console.log('Development mode: Updating mock expense', id, updates);
      const updatedExpense = expenses.find(e => e.id === id);
      if (updatedExpense) {
        const updated = { ...updatedExpense, ...updates };
        setExpenses(prev => prev.map(e => e.id === id ? updated : e));
        return updated;
      }
      return null;
    } else {
      // In production, use Supabase
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;

    if (isDevelopment) {
      // In development mode, simulate deleting an expense
      console.log('Development mode: Deleting mock expense', id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } else {
      // In production, use Supabase
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    }
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}