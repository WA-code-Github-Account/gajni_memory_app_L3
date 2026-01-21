import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

// Simplified hook for managing memories with Supabase and localStorage
const useMemories = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load memories from localStorage on initial render
  useEffect(() => {
    try {
      const savedMemories = localStorage.getItem('gajni-memories');
      if (savedMemories) {
        const parsedMemories = JSON.parse(savedMemories);
        setMemories(parsedMemories);
      }
    } catch (error) {
      console.error("Failed to load memories from local storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save memories to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('gajni-memories', JSON.stringify(memories));
    } catch (error) {
      console.error("Failed to save memories to local storage", error);
    }
  }, [memories]);

  // Test basic Supabase connection if client is available
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not available. Using local storage only.');
      return;
    }

    const testConnection = async () => {
      try {
        // Simple test query to verify connection
        const { count, error } = await supabase
          .from('memories')
          .select('*', { count: 'exact' }); // Removed head: true option

        if (error && error.code !== '42P01') { // 42P01 means table doesn't exist
          console.error('Supabase connection test failed:', error);
        } else if (error && error.code === '42P01') {
          console.warn('Memories table does not exist in Supabase. Please create it using the SQL provided in the setup instructions.');
        } else {
          console.log('Supabase connection OK');
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };

    testConnection();
  }, []);

  const addMemory = async (memoryData) => {
    const newMemory = {
      id: memoryData.id || Date.now().toString(),
      text: memoryData.text,
      timestamp: memoryData.timestamp || Date.now(),
      completed: memoryData.completed || false
    };

    setMemories(prevMemories => [newMemory, ...prevMemories]);

    // Try to save to Supabase if client is available (but don't block on failure)
    if (supabase) {
      try {
        // Using upsert to avoid potential returning clause issues
        const { error } = await supabase
          .from('memories')
          .upsert([{
            id: newMemory.id,
            title: newMemory.text,
            content: newMemory.text,
            created_at: newMemory.timestamp,
            is_favorite: false
          }], { onConflict: 'id' }); // Specify conflict resolution

        if (error) {
          if (error.code === '42P01') {
            console.warn('Memories table does not exist in Supabase. Please create it using the SQL provided in the setup instructions.');
          } else {
            console.error('Error saving to Supabase:', error);
          }
        }
      } catch (err) {
        console.error('Network error saving to Supabase:', err);
      }
    }
  };

  const updateMemory = async (id, updates) => {
    setMemories(prevMemories =>
      prevMemories.map(memory =>
        memory.id === id
          ? { ...memory, ...updates }
          : memory
      )
    );

    // Try to update in Supabase if client is available (but don't block on failure)
    if (supabase) {
      try {
        const { error } = await supabase
          .from('memories')
          .update({
            title: updates.text,
            content: updates.text,
            is_favorite: updates.is_favorite || false
          }, { count: null }) // Explicitly avoid count/returning
          .eq('id', id);

        if (error) {
          if (error.code === '42P01') {
            console.warn('Memories table does not exist in Supabase. Please create it using the SQL provided in the setup instructions.');
          } else {
            console.error('Error updating in Supabase:', error);
          }
        }
      } catch (err) {
        console.error('Network error updating in Supabase:', err);
      }
    }
  };

  const deleteMemory = async (id) => {
    setMemories(prevMemories =>
      prevMemories.filter(memory => memory.id !== id)
    );

    // Try to delete from Supabase if client is available (but don't block on failure)
    if (supabase) {
      try {
        const { error } = await supabase
          .from('memories')
          .delete({ count: null }) // Explicitly avoid count/returning
          .eq('id', id);

        if (error) {
          if (error.code === '42P01') {
            console.warn('Memories table does not exist in Supabase. Please create it using the SQL provided in the setup instructions.');
          } else {
            console.error('Error deleting from Supabase:', error);
          }
        }
      } catch (err) {
        console.error('Network error deleting from Supabase:', err);
      }
    }
  };

  return {
    memories,
    loading,
    error,
    addMemory,
    updateMemory,
    deleteMemory
  };
};

export default useMemories;