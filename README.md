# 🚗 TaxSafar Parking Lot System

A full-stack parking lot management system built with **Node.js + Express**, **React**, and **MySQL**.

---

## Features

- 🅿️ **Park a vehicle** — enter a number plate and type; receive a ticket instantly
- 🚪 **Exit a vehicle** — look up by ticket ID or vehicle number; pay the fare
- 📊 **Live slot availability** — colour-coded cards for Bike / Car / Truck
- 🎫 **Ticket history** — all parked vehicles shown in a live table
- ⚠️ **Parking Full** — graceful 409 when a slot type is completely occupied
- 💰 **Auto fare calculation** — rounded-up hours, server-side only

### Pricing

| Duration | Fare |
|----------|------|
| ≤ 3 hours | ₹30 |
| 4 – 6 hours | ₹85 |
| > 6 hours | ₹120 |

### Slot Limits

| Type | Slots |
|------|-------|
| Bike | 5 |
| Car | 5 |
| Truck | 2 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, mysql2, dotenv, cors |
| Frontend | React, Vite |
| Database | MySQL |

---

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+

---

## Setup Instructions

### 1. Clone / extract the project

```bash
cd parking_lot
```

### 2. Database setup

Open MySQL shell and run:

```sql
CREATE DATABASE parking_db;
USE parking_db;
SOURCE backend/schema.sql;
```

Or using the MySQL CLI:

```bash
mysql -u root -p -e "CREATE DATABASE parking_db;"
mysql -u root -p parking_db < backend/schema.sql
```

### 3. Configure environment variables

```bash
cd backend
copy .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=parking_db
PORT=5000
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Start the backend server

```bash
npm run dev     # with nodemon (auto-restart)
# or
npm start       # plain node
```

Server runs on **http://localhost:5000**

### 6. Install and start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000** and proxies all `/api/*` calls to port 5000.

## Deploying on Render

This app can be deployed as a single Render web service from the `backend/` folder. The backend serves the React production build from `frontend/dist`.

1. Create a new Render web service and connect your GitHub repository.
2. Use the following service settings:
   - Environment: `Node`
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
3. Configure Render environment variables for your MySQL database:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`
4. Render will provide `PORT` automatically.

> Note: Render does not offer a managed MySQL database. Use an external MySQL server (ClearDB, PlanetScale, AWS RDS, etc.) and point the app at it with the environment variables above.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slots` | Current availability per vehicle type |
| POST | `/api/park` | Park a vehicle; returns ticket |
| POST | `/api/exit` | Exit a vehicle; returns fare receipt |
| GET | `/api/parked` | List all currently parked vehicles |

### POST /api/park

```json
// Request
{ "vehicleNumber": "KA01AB1234", "vehicleType": "car" }

// Response 201
{
  "success": true,
  "ticket": {
    "ticketId": "TKT-1001",
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "car",
    "entryTime": "2026-07-07T10:30:00.000Z"
  }
}

// Response 409 — full
{ "success": false, "message": "Parking Full" }
```

### POST /api/exit

```json
// Request (use either field)
{ "ticketId": "TKT-1001" }
{ "vehicleNumber": "KA01AB1234" }

// Response 200
{
  "success": true,
  "receipt": {
    "ticketId": "TKT-1001",
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "car",
    "entryTime": "2026-07-07T10:30:00.000Z",
    "exitTime": "2026-07-07T14:45:00.000Z",
    "durationHours": 5,
    "amount": 85
  }
}
```

---

## Project Structure

```
parking_lot/
├── backend/
│   ├── .env.example        # Copy to .env and fill credentials
│   ├── package.json
│   ├── schema.sql          # MySQL table definition
│   ├── server.js           # Express entry point
│   ├── db.js               # MySQL connection pool
│   └── routes/
│       └── api.js          # All 4 API endpoints
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        └── components/
            ├── SlotCards.jsx
            ├── ParkForm.jsx
            ├── ExitForm.jsx
            ├── TicketDisplay.jsx
            └── ParkedList.jsx
```

---

## Error Handling

| Scenario | HTTP Status |
|----------|-------------|
| Missing / invalid request body | 400 |
| Vehicle already parked | 400 |
| Slot type fully occupied | 409 |
| Ticket not found / already exited | 404 |
| Server error | 500 |
