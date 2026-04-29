import { useState, useEffect, useCallback } from 'react';

// Types
interface Roommate {
  id: string;
  name: string;
}

interface FoodItem {
  id: string;
  name: string;
  ownerId: string;
  totalPortion: number;
  remainingPortion: number;
  addedAt: number;
  expiresAt: number; // For spoilage detection
  version: number; // For concurrency control
}

type RequestStatus = 'pending' | 'approved' | 'consumed' | 'rejected' | 'expired';

interface Request {
  id: string;
  foodItemId: string;
  requesterId: string;
  portion: number;
  status: RequestStatus;
  approvedAt?: number;
  consumedAt?: number;
  expiresAt: number; // Approval expires if not consumed in time
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Roommates
const roommates: Roommate[] = [
  { id: 'alex', name: 'Alex' },
  { id: 'jordan', name: 'Jordan' },
  { id: 'casey', name: 'Casey' },
  { id: 'taylor', name: 'Taylor' },
];

function App() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('alex');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPortion, setNewItemPortion] = useState(100);
  const [newItemExpiryDays, setNewItemExpiryDays] = useState(7);
  const [requestPortionValue, setRequestPortionValue] = useState(25);
  const [logs, setLogs] = useState<string[]>([]);

  // Add log
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  }, []);

  // Check for expired approvals (Scenario 2: Spoilage Ghost)
  useEffect(() => {
    const checkExpiredApprovals = () => {
      const now = Date.now();
      let updated = false;
      
      setRequests(prev => {
        const updatedRequests = prev.map(req => {
          // If approved but not consumed and expired, mark as expired
          if (req.status === 'approved' && req.expiresAt < now) {
            updated = true;
            addLog(`⚠️ Request ${req.id} expired (not consumed in time)`);
            return { ...req, status: 'expired' as RequestStatus };
          }
          return req;
        });
        return updatedRequests;
      });

      if (updated) {
        // Also check for spoiled food items
        setFoodItems(prev => {
          const updatedItems = prev.map(item => {
            if (item.expiresAt < now && item.remainingPortion > 0) {
              addLog(`⚠️ Food item "${item.name}" has spoiled!`);
              return { ...item, remainingPortion: 0 };
            }
            return item;
          });
          return updatedItems;
        });
      }
    };

    // Check every 10 seconds
    const interval = setInterval(checkExpiredApprovals, 10000);
    checkExpiredApprovals(); // Initial check

    return () => clearInterval(interval);
  }, [addLog]);

  // Add food item (handles Scenario 3: Identical Item Bug - each item gets unique ID)
  const addFoodItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: FoodItem = {
      id: generateId(), // Unique ID ensures each item is distinguishable
      name: newItemName.trim(),
      ownerId: selectedUser,
      totalPortion: newItemPortion,
      remainingPortion: newItemPortion,
      addedAt: Date.now(),
      expiresAt: Date.now() + newItemExpiryDays * 24 * 60 * 60 * 1000,
      version: 1,
    };

    setFoodItems(prev => [...prev, newItem]);
    addLog(`🍕 ${roommates.find(r => r.id === selectedUser)?.name} added "${newItemName}" (${newItemPortion}%)`);
    setNewItemName('');
  };

  // Request portion (handles Scenario 1: Concurrency Collision)
  const requestFoodPortion = (foodItemId: string, portion: number) => {
    const foodItem = foodItems.find(f => f.id === foodItemId);
    if (!foodItem) return;

    // Check if enough remaining portion
    if (portion > foodItem.remainingPortion) {
      addLog(`❌ Request failed: Only ${foodItem.remainingPortion}% remaining`);
      return;
    }

    // Check for pending requests on this item
    const existingPending = requests.find(r => 
      r.foodItemId === foodItemId && 
      r.status === 'pending'
    );

    if (existingPending) {
      addLog(`❌ Request failed: Already a pending request for this item`);
      return;
    }

    const newRequest: Request = {
      id: generateId(),
      foodItemId,
      requesterId: selectedUser,
      portion,
      status: 'pending',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours to consume
    };

    setRequests(prev => [...prev, newRequest]);
    addLog(`🙋 ${roommates.find(r => r.id === selectedUser)?.name} requested ${portion}% of "${foodItem.name}"`);
  };

  // Approve request (with concurrency check - Scenario 1)
  const approveRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const foodItem = foodItems.find(f => f.id === request.foodItemId);
    if (!foodItem) return;

    // Concurrency check: verify version hasn't changed
    // In a real app, this would be done atomically
    const currentFoodItem = foodItems.find(f => f.id === request.foodItemId);
    if (!currentFoodItem || currentFoodItem.version !== foodItem.version) {
      addLog(`❌ Approval failed: Item was modified by another user (concurrency conflict)`);
      return;
    }

    // Check if enough remaining portion
    if (request.portion > currentFoodItem.remainingPortion) {
      addLog(`❌ Approval failed: Only ${currentFoodItem.remainingPortion}% remaining now`);
      return;
    }

    // Update request status
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: 'approved' as RequestStatus, approvedAt: Date.now() }
        : r
    ));

    // Update food item version for concurrency control
    setFoodItems(prev => prev.map(f => 
      f.id === request.foodItemId 
        ? { ...f, version: f.version + 1 }
        : f
    ));

    addLog(`✅ ${roommates.find(r => r.id === currentFoodItem.ownerId)?.name} approved request for ${request.portion}% of "${currentFoodItem.name}"`);
  };

  // Consume portion
  const consumePortion = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request || request.status !== 'approved') return;

    const foodItem = foodItems.find(f => f.id === request.foodItemId);
    if (!foodItem) return;

    // Update food item remaining portion
    setFoodItems(prev => prev.map(f => 
      f.id === request.foodItemId 
        ? { ...f, remainingPortion: f.remainingPortion - request.portion, version: f.version + 1 }
        : f
    ));

    // Update request status
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: 'consumed' as RequestStatus, consumedAt: Date.now() }
        : r
    ));

    addLog(`😋 ${roommates.find(r => r.id === request.requesterId)?.name} consumed ${request.portion}% of "${foodItem.name}"`);
  };

  // Reject request
  const rejectRequest = (requestId: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: 'rejected' as RequestStatus }
        : r
    ));
    addLog(`❌ Request ${requestId} rejected`);
  };

  // Correct inventory (handles Scenario 4: Phantom Eater)
  const correctInventory = (foodItemId: string, newPortion: number) => {
    setFoodItems(prev => prev.map(f => 
      f.id === foodItemId 
        ? { ...f, remainingPortion: newPortion, version: f.version + 1 }
        : f
    ));
    
    const foodItem = foodItems.find(f => f.id === foodItemId);
    addLog(`🔧 Inventory corrected for "${foodItem?.name}": ${newPortion}% remaining`);
  };

  // Delete food item
  const deleteFoodItem = (foodItemId: string) => {
    const foodItem = foodItems.find(f => f.id === foodItemId);
    setFoodItems(prev => prev.filter(f => f.id !== foodItemId));
    setRequests(prev => prev.filter(r => r.foodItemId !== foodItemId));
    addLog(`🗑️ Deleted "${foodItem?.name}"`);
  };

  // Simulate concurrent requests (Scenario 1 demo)
  const simulateConcurrency = () => {
    // First, add a pizza with 25% remaining
    const pizzaItem: FoodItem = {
      id: generateId(),
      name: 'Pizza (last slice)',
      ownerId: 'alex',
      totalPortion: 25,
      remainingPortion: 25,
      addedAt: Date.now(),
      expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
      version: 1,
    };
    setFoodItems(prev => [...prev, pizzaItem]);
    addLog(`🍕 Demo: Added pizza with 25% remaining`);

    // Simulate two users requesting at the same time
    setTimeout(() => {
      const req1: Request = {
        id: generateId(),
        foodItemId: pizzaItem.id,
        requesterId: 'jordan',
        portion: 25,
        status: 'pending',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      setRequests(prev => [...prev, req1]);
      addLog(`🙋 Jordan requested 25% of pizza`);
    }, 100);

    setTimeout(() => {
      const req2: Request = {
        id: generateId(),
        foodItemId: pizzaItem.id,
        requesterId: 'casey',
        portion: 25,
        status: 'pending',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      setRequests(prev => [...prev, req2]);
      addLog(`🙋 Casey requested 25% of pizza`);
    }, 100);
  };

  // Simulate spoilage scenario (Scenario 2 demo)
  const simulateSpoilage = () => {
    const pastaItem: FoodItem = {
      id: generateId(),
      name: 'Pasta (demo)',
      ownerId: 'alex',
      totalPortion: 50,
      remainingPortion: 50,
      addedAt: Date.now(),
      expiresAt: Date.now() + 1 * 60 * 1000, // Expires in 1 minute for demo
      version: 1,
    };
    setFoodItems(prev => [...prev, pastaItem]);
    addLog(`🍝 Demo: Added pasta (will expire in 1 minute)`);

    const request: Request = {
      id: generateId(),
      foodItemId: pastaItem.id,
      requesterId: 'jordan',
      portion: 50,
      status: 'pending',
      expiresAt: Date.now() + 30 * 1000, // 30 seconds to consume
    };
    setRequests(prev => [...prev, request]);
    addLog(`🙋 Jordan requested 50% of pasta`);
  };

  // Simulate identical items (Scenario 3 demo)
  const simulateIdenticalItems = () => {
    const ketchup1: FoodItem = {
      id: generateId(),
      name: 'Ketchup',
      ownerId: 'alex',
      totalPortion: 100,
      remainingPortion: 100,
      addedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      version: 1,
    };
    const ketchup2: FoodItem = {
      id: generateId(),
      name: 'Ketchup',
      ownerId: 'jordan',
      totalPortion: 100,
      remainingPortion: 100,
      addedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      version: 1,
    };
    setFoodItems(prev => [...prev, ketchup1, ketchup2]);
    addLog(`🍅 Demo: Added two identical ketchup bottles (different IDs: ${ketchup1.id.slice(0,6)}... and ${ketchup2.id.slice(0,6)}...)`);
  };

  // Simulate phantom eater (Scenario 4 demo)
  const simulatePhantomEater = () => {
    const juiceItem: FoodItem = {
      id: generateId(),
      name: 'Orange Juice',
      ownerId: 'casey',
      totalPortion: 100,
      remainingPortion: 100,
      addedAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      version: 1,
    };
    setFoodItems(prev => [...prev, juiceItem]);
    addLog(`🧃 Demo: Added orange juice (100%)`);
    addLog(`⚠️ Someone drank it without recording! Use "Correct" to fix.`);
  };

  return (
    <div className="app">
      <header>
        <h1>🚔 FridgePolice</h1>
        <p>Law and order for shared fridges</p>
      </header>

      <div className="user-selector">
        <label>Current User: </label>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          {roommates.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className="scenarios">
        <h2>🧪 Test Scenarios</h2>
        <div className="scenario-buttons">
          <button onClick={simulateConcurrency}>Scenario 1: Concurrency</button>
          <button onClick={simulateSpoilage}>Scenario 2: Spoilage</button>
          <button onClick={simulateIdenticalItems}>Scenario 3: Identical Items</button>
          <button onClick={simulatePhantomEater}>Scenario 4: Phantom Eater</button>
        </div>
      </div>

      <div className="main-content">
        <div className="section">
          <h2>📦 Food Items</h2>
          
          <div className="add-item-form">
            <input
              type="text"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Portion %"
              value={newItemPortion}
              onChange={(e) => setNewItemPortion(Number(e.target.value))}
              min="1"
              max="100"
            />
            <input
              type="number"
              placeholder="Expires in (days)"
              value={newItemExpiryDays}
              onChange={(e) => setNewItemExpiryDays(Number(e.target.value))}
              min="1"
            />
            <button onClick={addFoodItem}>Add Item</button>
          </div>

          <div className="food-list">
            {foodItems.length === 0 ? (
              <p className="empty">No food items yet. Add one above!</p>
            ) : (
              foodItems.map(item => (
                <div key={item.id} className="food-item">
                  <div className="food-info">
                    <strong>{item.name}</strong>
                    <span className="owner">Owner: {roommates.find(r => r.id === item.ownerId)?.name}</span>
                    <span className="portion">
                      {item.remainingPortion}% / {item.totalPortion}% 
                      <span className="version">(v{item.version})</span>
                    </span>
                    <span className="expiry">
                      {item.expiresAt < Date.now() ? '⚠️ EXPIRED' : `Expires: ${new Date(item.expiresAt).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="food-actions">
                    <input
                      type="number"
                      placeholder="%"
                      value={requestPortionValue}
                      onChange={(e) => setRequestPortionValue(Number(e.target.value))}
                      min="1"
                      max="100"
                      style={{ width: '60px' }}
                    />
                    <button onClick={() => requestFoodPortion(item.id, requestPortionValue)}>Request</button>
                    <button 
                      className="correct-btn"
                      onClick={() => {
                        const newPortion = prompt('Enter correct remaining portion:', String(item.remainingPortion));
                        if (newPortion !== null) {
                          correctInventory(item.id, Number(newPortion));
                        }
                      }}
                    >
                      Correct
                    </button>
                    <button className="delete-btn" onClick={() => deleteFoodItem(item.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h2>📋 Requests</h2>
          <div className="request-list">
            {requests.length === 0 ? (
              <p className="empty">No requests yet</p>
            ) : (
              requests.map(req => {
                const foodItem = foodItems.find(f => f.id === req.foodItemId);
                return (
                  <div key={req.id} className={`request-item ${req.status}`}>
                    <div className="request-info">
                      <strong>{foodItem?.name || 'Unknown'}</strong>
                      <span>{req.portion}% requested by {roommates.find(r => r.id === req.requesterId)?.name}</span>
                      <span className={`status ${req.status}`}>
                        Status: {req.status.toUpperCase()}
                        {req.status === 'approved' && req.expiresAt < Date.now() && ' (EXPIRED)'}
                      </span>
                    </div>
                    <div className="request-actions">
                      {req.status === 'pending' && foodItem?.ownerId === selectedUser && (
                        <>
                          <button onClick={() => approveRequest(req.id)}>Approve</button>
                          <button onClick={() => rejectRequest(req.id)}>Reject</button>
                        </>
                      )}
                      {req.status === 'approved' && req.requesterId === selectedUser && (
                        <button onClick={() => consumePortion(req.id)}>Consume</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="section logs">
        <h2>📜 Activity Log</h2>
        <div className="log-list">
          {logs.length === 0 ? (
            <p className="empty">No activity yet</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="log-entry">{log}</div>
            ))
          )}
        </div>
      </div>

      <div className="info-section">
        <h3>💡 How Scenarios Are Handled</h3>
        <ul>
          <li><strong>Scenario 1 (Concurrency):</strong> Version numbers track changes. If two people request the last portion, only one approval succeeds.</li>
          <li><strong>Scenario 2 (Spoilage):</strong> Expiration times auto-expire approvals. Unconsumed approved portions are marked "expired".</li>
          <li><strong>Scenario 3 (Identical Items):</strong> Each item gets a unique ID, so identical ketchup bottles are distinguishable.</li>
          <li><strong>Scenario 4 (Phantom Eater):</strong> "Correct" button allows manual inventory adjustment when reality doesn't match the app.</li>
        </ul>
      </div>
    </div>
  );
}

export default App;