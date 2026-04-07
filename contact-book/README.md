# Full-Stack MERN Contact Book

A modern, highly interactive personal contact management application built on the MERN stack (MongoDB, Express, React, Node.js). 

## Features
- **User Authentication:** Secure JWT-based login and registration.
- **Data Isolation:** Contacts are scoped and protected per user.
- **Smart Merge:** Auto-merge contacts with identical names/emails (concatenating phone numbers and addresses), or manually resolve conflicts via UI modal.
- **Rich Aesthetics:** Modern Glassmorphic UI with vibrant gradients utilizing vanilla CSS.
- **CRUD Operations:** Create, Read (with real-time debounced search), Update, and Delete contacts.

## Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally on default port `27017` (or provide `MONGODB_URI` via `.env`)

---

## Instructions to Run the Application

### 1. Database Setup
Ensure that **MongoDB** is installed and running on your local machine.

### 2. Backend Setup
Open a terminal and navigate to the `backend` directory:
```bash
cd contact-book/backend
```
Install the node dependencies:
```bash
npm install
```
Start the backend Express API server:
```bash
# This will run on port 5000 by default and connect to MongoDB
node server.js
```
*Note: If you have a custom MongoDB URI or wish to change the JWT secret, create a `.env` file in the `backend` folder containing `MONGODB_URI=...` and `JWT_SECRET=...`.*

### 3. Frontend Setup
Open a **new** terminal window and navigate to the `frontend` directory:
```bash
cd contact-book/frontend
```
Install the React dependencies:
```bash
npm install
```
Start the Vite development server:
```bash
npm run dev
```

### 4. Usage
Open your web browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).
- **Create an Account:** Use the sign-up form.
- **Add Contacts:** Use the 'Add Contact' button. 
- **Merge Contacts:** Enable 'Merge Mode', select two contacts, and hit merge. If they differ significantly, the UI will prompt you to resolve the conflict.
- **Edit/Delete:** Hover over contact cards to see Edit and Delete icons.
