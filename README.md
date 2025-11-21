
 Live Demo:https://expensetacker-one.vercel.app/

Smart Expense Tracker

A lightweight, mobile-first, offline-ready expense tracking application built with HTML, CSS, and Vanilla JavaScript.
Designed for clarity, accuracy, and real-world usability. Includes category filtering, editing, deleting, LocalStorage persistence, and responsive UI components.
Features
Core Features

Add income and expenses with category and timestamps

Edit transactions (with preserved creation date + updated edited date)

Delete transactions

Real-time balance summary (Income, Expense, Net Balance)

Category filter dropdown

Persistent data using LocalStorage

Professional UI with responsive layout

Enhanced UX:

Toast notifications for Add / Edit / Delete actions

Timestamp tracking (createdAt + editedAt)

Smooth user-friendly form states (Add vs Edit mode)

UI/UX Enhancements

Mobile-first design

Professional SVG icons

Clean typography & accessible color palette

Hover states, animations, modern cards layout

Error validation for clean data quality

Folder Structure

expense-tracker/
│
├── index.html # Main UI structure
├── style.css # Full visual design + responsive layout
├── script.js # All business logic, filtering, and LocalStorage

How It Works

1. Transactions Array is the Source of Truth

Every transaction is an object like:
{
"id": 173209010,
"text": "Groceries",
"amount": -450,
"category": "Food",
"type": "expense",
"createdAt": "11/20/2025, 2:31 PM",
"editedAt": "11/21/2025, 1:22 PM"
}

2. LocalStorage Persistence

Whenever you add, edit, or delete a transaction, the full array is saved using:

localStorage.setItem("transactions", JSON.stringify(transactions));

3. Filtering

renderTransactions(filter) accepts "all" or a category (e.g., "Food").
The UI reflects only the matching items.

4. Edit Mode Management

The app maintains two edit-state variables:

let isEditing = false;
let editingId = null;

Switching modes updates the form and button states.

How to Use

1. Open the application

Just open index.html in any browser.

2. Add transactions

Enter description

Enter amount (positive = income, negative = expense)

Choose category

Click Add Transaction

3. Edit transactions

Click the edit button

Form is populated

Make changes

Click Update Transaction

Toast notification confirms changes

4. Delete transactions

Click the trash button

Item is removed

LocalStorage updates automatically

5. Filter by category

Use the dropdown above the list to view only:

Food

Transportation

Salary

Entertainment

All categories

6. Refresh anytime

Your data persists automatically thanks to LocalStorage.

Technology Stack

HTML5 — semantic structure

CSS3 — custom design system, responsive layout

JavaScript (ES6+) — no frameworks

LocalStorage — offline persistence

Future Enhancements (Optional)

If you want to expand this project:

Dark mode toggle

Chart.js analytics dashboard

Monthly/weekly filtering

Export CSV

Login + Cloud Sync

Code Documentation Templates (copy these into your code)

Below are polished, professional comments you can paste into your files.
This is how engineers document maintainable production code.

JS Documentation Template for script.js

At the top of your JS file:

/\*\*

- Smart Expense Tracker
- ***
- Handles all transaction logic including:
- - Adding, editing, deleting
- - Filtering by category
- - LocalStorage persistence
- - Re-rendering UI on state changes
- - Summary calculations
- - Toast notifications and form state handling
-
- Architecture principle:
- transactions[] = single source of truth. \*

  Example Function Header Comments

/\*\*

- Renders all transactions to the UI.
- @param {string} filter - Category name or "all"
  \*/
  function renderTransactions(filter = "all") { ... }

/\*\*

- Updates summary: income, expense, net balance.
  \*/
  function updateSummary() { ... }

/\*\*

- Saves transactions[] to LocalStorage.
  \*/
  function saveToLocalStorage() { ... }

/\*\*

- Loads transactions[] from LocalStorage on app init.
  \*/
  function loadFromLocalStorage() { ... }

/\*\*

- Enables edit mode: populates form and tracks editingId.
  \*/
  function enterEditMode(id) { ... }

  CSS Documentation Template for style.css

At the top:
/\*===================================================
Smart Expense Tracker UI Stylesheet

---

Contains:

- Global reset + variables
- Layout and card styling
- Form components
- Buttons (edit/delete/cancel)
- Toast notification design
- Responsive breakpoints
  ====================================================\*/
  Section Comments Example

  /_ ============================= _/
  /_ Transaction Cards _/
  /_ ============================= _/

  /_ ============================= _/
  /_ Toast Notification _/
  /_ ============================= _/
