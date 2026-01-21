import React, { useState, useEffect, useMemo } from 'react';
import useMemories from './hooks/useMemories';

function App() {
  const { memories, loading, error, addMemory, updateMemory, deleteMemory } = useMemories();

  // If there's a critical error, show error message
  if (error) {
    console.error("Critical error in App:", error);
    return (
      <div className="app-container" style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Gajni Memory</h1>
        <div className="error-state">
          <p>There was an error loading the application:</p>
          <p style={{ color: 'red', fontWeight: 'bold' }}>{error.message || error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  const recognition = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      return recognitionInstance;
    }
    return null;
  }, []);

  const [newMemory, setNewMemory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [voices, setVoices] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setNewMemory(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 10 + 5);
      }, 200);

      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }

  }, [recognition, isListening]);

  const handleListen = () => {
    if (!recognition) {
      alert("Sorry, your browser does not support voice recognition.");
      return;
    }
    recognition.lang = language;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (newMemory.trim() === '') {
      alert("Please enter a memory!");
      return;
    }
    const memoryData = {
      text: newMemory,
      timestamp: Date.now(),
      completed: false,
    };

    await addMemory(memoryData);
    setNewMemory('');
  };

  const handleDeleteMemory = async (idToDelete) => {
    await deleteMemory(idToDelete);
  };

  const toggleMemoryCompletion = async (idToToggle) => {
    const memoryToToggle = memories.find(memory => memory.id === idToToggle);
    if (memoryToToggle) {
      await updateMemory(idToToggle, { completed: !memoryToToggle.completed });
    }
  };

  const handleSpeak = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const selectedVoice = voices.find(voice => voice.lang.startsWith(language));

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.warn(`No voice found for language: ${language}. Using default.`);
      }

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <h1>Gajni Memory</h1>
        <div className="loading-state">
          <p>Loading memories...</p>
        </div>
      </div>
    );
  }

  const filteredMemories = memories.filter(memory =>
    memory.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const VoiceVisualization = () => (
    <div className="voice-visualization">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="voice-bar"
          style={{
            height: isListening ? `${Math.max(10, audioLevel + Math.random() * 10)}px` : '10px',
            opacity: isListening ? 0.7 + Math.random() * 0.3 : 0.3
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="app-container">
      <h1>Gajni Memory</h1>

      <div className="form-container">
        <form onSubmit={handleAddMemory}>
          <div className="language-selector">
            <label htmlFor="language">Voice Language: </label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en-US">English</option>
              <option value="ur-PK">Urdu</option>
            </select>
          </div>

          <div className="input-container">
            <input
              type="text"
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="What do you want to remember?"
            />
            <button
              type="button"
              onClick={handleListen}
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              title={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          </div>

          {isListening && <VoiceVisualization />}

          <button type="submit">Add Memory</button>
        </form>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search your memories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ul className="memory-list">
        {filteredMemories.length > 0 ? (
          filteredMemories.map(memory => (
            <li
              key={memory.id}
              className={`memory-item ${memory.completed ? 'completed' : ''}`}
              style={{
                opacity: memory.completed ? 0.6 : 1,
                textDecoration: memory.completed ? 'line-through' : 'none'
              }}
            >
              <div className="memory-content">
                <input
                  type="checkbox"
                  checked={memory.completed}
                  onChange={() => toggleMemoryCompletion(memory.id)}
                  className="completion-checkbox"
                />
                <p style={{
                  textDecoration: memory.completed ? 'line-through' : 'none',
                  opacity: memory.completed ? 0.6 : 1
                }}>{memory.text}</p>
              </div>
              <div className="memory-item-footer">
                <span className="timestamp">
                  {new Date(memory.timestamp).toLocaleString()}
                </span>
                <div className="footer-buttons">
                  <button
                    onClick={() => handleSpeak(memory.text)}
                    className="speak-btn"
                    title="Listen to this memory"
                  >
                    🔊 Speak
                  </button>
                  <button
                    onClick={() => handleDeleteMemory(memory.id)}
                    className="delete-btn"
                    title="Delete this memory"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <div className="no-memories">
            {searchTerm ? (
              <p className="no-results">No memories found for "{searchTerm}"</p>
            ) : (
              <p className="empty-state">No memories yet. Add your first memory above!</p>
            )}
          </div>
        )}
      </ul>

      <footer className="app-footer">
        <p>Created by : WA.SIDDIQUI ®</p>
      </footer>
    </div>
  );
}

export default App;