import React, { useState, useEffect } from 'react';
import * as api from './api';
import './index.css';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Current simulated user
  const currentUser = 'currentUser'; 

  // Polling to keep UI up to date with the "backend" state (especially for ghost buyer timeouts)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await api.getItems();
        setItems(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch items");
      }
    };

    fetchItems();
    const interval = setInterval(fetchItems, 2000); // Poll every 2 seconds for demo
    return () => clearInterval(interval);
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem = await api.addItem({ title: newTitle, description: newDesc });
    setItems([...items, newItem]);
    setNewTitle('');
    setNewDesc('');
  };

  const handleClaim = async (itemId) => {
    try {
      // Optimistic update can be tricky with concurrency collisions, so we wait for server
      const updatedItem = await api.claimItem(itemId, currentUser);
      setItems(items.map(i => i.id === itemId ? updatedItem : i));
    } catch (err) {
      showError(err.message);
    }
  };

  const handleForceRemove = async (itemId) => {
    await api.forceRemove(itemId);
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleConfirmHandoff = async (itemId) => {
    await api.confirmHandoff(itemId);
    setItems(items.map(i => i.id === itemId ? { ...i, state: 'sold' } : i));
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // Helper for simulation
  const simulateConcurrencyCollision = async (itemId) => {
    // Fire two claim requests simultaneously!
    showError("Firing two simultaneous claim requests...");
    try {
      await Promise.all([
        api.claimItem(itemId, 'user1'),
        api.claimItem(itemId, 'user2')
      ]);
    } catch (err) {
      showError(`Collision detected: ${err.message}`);
    }
  };

  if (loading) return <div className="app-container">Loading Marketplace...</div>;

  return (
    <div className="app-container">
      <header className="header">
        <h1>Dorm Marketplace 🎓</h1>
        <p>Logged in as: <strong>{currentUser}</strong></p>
      </header>

      <form className="seller-form" onSubmit={handleAddItem}>
        <input 
          placeholder="What are you selling?" 
          value={newTitle} 
          onChange={e => setNewTitle(e.target.value)}
        />
        <input 
          placeholder="Description" 
          value={newDesc} 
          onChange={e => setNewDesc(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">List Item</button>
      </form>

      <div className="grid">
        {items.map(item => (
          <div key={item.id} className="card">
            <h2 className="card-title">{item.title}</h2>
            <div className={`badge ${item.state}`}>{item.state}</div>
            <p className="card-desc">{item.description}</p>
            
            {/* Action Buttons based on state */}
            {item.state === 'available' && (
              <>
                <button className="btn btn-primary" onClick={() => handleClaim(item.id)}>
                  Claim Item
                </button>
                <button 
                  className="btn" 
                  style={{marginTop: '0.5rem', background: '#e5e7eb'}}
                  onClick={() => simulateConcurrencyCollision(item.id)}
                  title="Simulate two users clicking at the exact same time"
                >
                  Test Collision
                </button>
              </>
            )}

            {item.state === 'claimed' && item.claimedBy === currentUser && (
              <button className="btn btn-success" onClick={() => handleConfirmHandoff(item.id)}>
                Confirm Handoff
              </button>
            )}
            
            {item.state === 'claimed' && item.claimedBy !== currentUser && (
              <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                Claimed by another student. Might expire soon...
              </p>
            )}

            {/* Seller Controls (Scenario 3: Hallway Sale Override) */}
            {item.sellerId === currentUser && item.state !== 'sold' && (
              <button className="btn btn-danger" onClick={() => handleForceRemove(item.id)}>
                Seller Override: Force Remove
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && <p>No items available right now.</p>}
      </div>

      {error && <div className="error-toast">{error}</div>}
    </div>
  );
}

export default App;
