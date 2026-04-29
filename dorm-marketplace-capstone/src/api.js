let items = [
  { id: '1', title: 'Mini Fridge', description: 'Used for 1 year, works great.', state: 'available', sellerId: 'user-a' },
  { id: '2', title: 'Calculus Textbook', description: 'Some highlights, good condition.', state: 'available', sellerId: 'user-b' }
];

// Helper to simulate network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getItems = async () => {
  await delay(300);
  // Only return items that aren't removed
  return items.filter(i => i.state !== 'removed');
};

export const addItem = async (item) => {
  await delay(300);
  const newItem = { ...item, id: Date.now().toString(), state: 'available', sellerId: 'currentUser' };
  items.push(newItem);
  return newItem;
};

export const claimItem = async (itemId, buyerId) => {
  // Random network delay between 200ms and 700ms to simulate real world conditions
  // and make concurrency collisions more likely if two requests are sent at once.
  await delay(Math.random() * 500 + 200);
  
  const item = items.find(i => i.id === itemId);
  if (!item) throw new Error('Item not found');
  
  // SCENARIO 1: Concurrency Collision
  // If the item was already claimed by the time this request processes, reject it.
  if (item.state !== 'available') {
    throw new Error('Item no longer available');
  }

  // Claim is successful
  item.state = 'claimed';
  item.claimedBy = buyerId;
  
  // SCENARIO 2: Ghost Buyer
  // We set a short timeout (10 seconds) for prototype purposes. 
  // If the buyer doesn't finalize the handoff, the item returns to available.
  setTimeout(() => {
    const currentItem = items.find(i => i.id === itemId);
    if (currentItem && currentItem.state === 'claimed' && currentItem.claimedBy === buyerId) {
      console.log(`[Ghost Buyer] Time expired for item ${itemId}. Reverting to available.`);
      currentItem.state = 'available';
      currentItem.claimedBy = null;
    }
  }, 10000);

  return { ...item };
};

// SCENARIO 3: Hallway Sale / Seller Override
// Seller can force remove an item anytime, even if it is currently claimed.
export const forceRemove = async (itemId) => {
  await delay(200);
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.state = 'removed';
  }
};

// Buyer/Seller confirms successful handoff
export const confirmHandoff = async (itemId) => {
  await delay(200);
  const item = items.find(i => i.id === itemId);
  if (item && item.state === 'claimed') {
    item.state = 'sold';
  }
};
