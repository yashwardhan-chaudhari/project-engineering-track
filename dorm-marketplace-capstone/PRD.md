# Product Requirements Document (PRD): Dorm Marketplace

## 1. Scope Cut
To keep this day 1 prototype simple and focused on the core problem (in-person item claims), we are intentionally NOT building:

1. **In-App Payments:** Processing transactions requires complex gateways, security, and refund handling, which is unnecessary since students can hand over cash or use Venmo in person.
2. **In-App Chat / Messaging:** Building real-time messaging adds significant infrastructure overhead; for the MVP, displaying contact info (or dorm room numbers) is sufficient for users to coordinate.
3. **User Authentication:** Proper auth (email verification, password resets) slows down MVP testing; we will simulate users with simple identifiers (e.g., hardcoded mock user sessions) to test the core flows immediately.

## 2. MVP Features
The core functionality required to make Dorm Marketplace work:

1. **Listing an Item:** A seller can add an item to the marketplace, providing a title, description, and status (available).
2. **Marketplace Feed:** A buyer can view a real-time list of all available items on campus.
3. **Claiming an Item:** A buyer can click "Claim" on an item to reserve it, temporarily locking it so no one else can claim it.

## 3. Acceptance Criteria
The following Given/When/Then criteria define the behaviour for the "Claim Item" flow.

**Scenario 1: Successful Claim**
- **Given** an item is listed as "available" in the marketplace
- **When** a user clicks "Claim Item"
- **Then** the item's status immediately updates to "claimed" and no other user can claim it.

**Scenario 2: Concurrency Collision (Item already claimed)**
- **Given** an item is listed as "available"
- **When** two users attempt to click "Claim Item" at the exact same moment
- **Then** the system grants the claim to the first request, and displays an "Item no longer available" error to the second user.

**Scenario 3: Ghost Buyer (Claim Expiration)**
- **Given** an item is currently "claimed" by a buyer
- **When** the buyer does not complete the handoff confirmation within the expiration window (e.g. 10 seconds for this prototype)
- **Then** the claim automatically expires and the item returns to the "available" state in the marketplace.
