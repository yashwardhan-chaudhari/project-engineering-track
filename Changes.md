# FridgePolice - Implementation Changes

## Overview

FridgePolice is a React-based prototype application that helps roommates track shared food items in a refrigerator. The app handles the typical workflow of adding food, requesting portions, approving consumption, and splitting costs fairly.

## What the App Does

The application provides:
- **Food Item Management**: Roommates can add food items with name, portion size, and expiration date
- **Request System**: Anyone can request a portion of a shared item
- **Approval Workflow**: The owner must approve requests before consumption
- **Consumption Tracking**: Once approved, the requester can mark the food as consumed
- **Activity Logging**: All actions are logged for transparency

## How Each Scenario Is Handled

### Scenario 1: The Concurrency Collision

**Problem**: Two roommates both try to request the last 25% of pizza at the same time. Both get approved, leading to 50% allocation when only 25% exists.

**Solution**: 
- Each food item has a `version` number that increments on every modification
- Before approving a request, the system checks if the version matches what was expected
- If version changed (meaning another approval happened), the second approval fails with a concurrency conflict error
- Additionally, there's a check to ensure enough portion remains before approval

**Implementation**:
```typescript
// Version check before approval
const currentFoodItem = foodItems.find(f => f.id === request.foodItemId);
if (!currentFoodItem || currentFoodItem.version !== foodItem.version) {
  addLog(`❌ Approval failed: Item was modified by another user (concurrency conflict)`);
  return;
}
```

### Scenario 2: The Spoilage Ghost

**Problem**: A request is approved but the food spoils before being consumed. The app shows it as "approved and pending" indefinitely.

**Solution**:
- Each food item has an `expiresAt` timestamp
- Each request has an `expiresAt` timestamp (24 hours from approval)
- A background check runs every 10 seconds to:
  - Mark expired food items as spoiled (remaining portion = 0)
  - Mark approved but unconsumed requests as "expired" after their deadline

**Implementation**:
```typescript
useEffect(() => {
  const checkExpiredApprovals = () => {
    const now = Date.now();
    // Check requests - mark approved but unconsumed as expired
    // Check food items - mark spoiled items as 0 remaining
  };
  const interval = setInterval(checkExpiredApprovals, 10000);
  return () => clearInterval(interval);
}, []);
```

### Scenario 3: The Identical Item Bug

**Problem**: Two roommates buy identical ketchup bottles. The system can't distinguish between them when someone uses ketchup.

**Solution**:
- Every food item gets a unique generated ID (`generateId()` function)
- Even if two items have the same name, they are tracked separately by their unique ID
- The UI shows the unique ID (truncated) to demonstrate distinguishability

**Implementation**:
```typescript
const newItem: FoodItem = {
  id: generateId(), // Unique ID ensures each item is distinguishable
  name: newItemName.trim(),
  // ... other properties
};
```

### Scenario 4: The Phantom Eater

**Problem**: Someone drinks orange juice without recording it in the app. The app shows 100% juice exists when the fridge is empty.

**Solution**:
- A "Correct" button on each food item allows manual inventory adjustment
- Users can enter the actual remaining portion to sync the digital state with reality
- This updates the version number to maintain consistency

**Implementation**:
```typescript
const correctInventory = (foodItemId: string, newPortion: number) => {
  setFoodItems(prev => prev.map(f => 
    f.id === foodItemId 
      ? { ...f, remainingPortion: newPortion, version: f.version + 1 }
      : f
  ));
};
```

## Engineering Decisions

1. **In-Memory State**: Used React useState for simplicity. In production, this would be replaced with a database.

2. **Version Numbers**: Implemented optimistic locking via version numbers to handle concurrency. Real systems would use database transactions or distributed locks.

3. **Automatic Expiration**: Background interval checks for expired items and approvals. In production, this would be handled by a job scheduler.

4. **Unique IDs**: Each item gets a UUID-style ID to ensure identity even for identical items.

5. **User Selection**: A dropdown allows switching between roommate users to demonstrate the full workflow.

## Demo Features

The app includes "Test Scenario" buttons that automatically set up each failure scenario for demonstration:
- **Scenario 1**: Creates a pizza with 25% and simulates two concurrent requests
- **Scenario 2**: Creates pasta that expires in 1 minute with an approved request
- **Scenario 3**: Creates two identical ketchup bottles from different owners
- **Scenario 4**: Creates orange juice and simulates someone drinking it without recording

## Running the App

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.