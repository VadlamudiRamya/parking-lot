# 🚗 TaxSafar Parking Lot System

A full-stack parking lot management system built with **Node.js + Express**, **React**, and **PostgreSQL**.

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
| Backend | Node.js, Express, pg, dotenv, cors |
| Frontend | React, Vite |
| Database | PostgreSQL |

---

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (for local development)

---

## Setup Instructions

### 1. Clone / extract the project

```bash
cd parking_lot
```

### 2. Database setup (local)

```bash
createdb parking_db
psql parking_db < backend/schema.sql
```

### 3. Configure environment variables

```bash
cd backend
copy .env.example .env
```

Edit `.env` with your PostgreSQL connection string:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/parking_db
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

This app deploys as a **Render Blueprint** — one click provisions both the web service and a free PostgreSQL database.

### One-Click Deploy

1. Push this repo to GitHub.
2. Go to **https://dashboard.render.com**
3. Click **New → Blueprint** and select your GitHub repo.
4. Render auto-detects `render.yaml` and provisions:
   - A **free PostgreSQL database** (`parking-lot-db`)
   - A **free web service** (`parking-lot`) with `DATABASE_URL` wired automatically
5. Click **Apply** — done! The database table is created automatically during the build step.

> No external MySQL needed. Render provisions everything from the `render.yaml`.

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
├── render.yaml               # Render Blueprint — provisions DB + service
├── backend/
│   ├── .env.example           # Copy to .env and fill credentials
│   ├── package.json
│   ├── schema.sql             # PostgreSQL table definition
│   ├── init-db.js             # Auto-creates table on deploy
│   ├── server.js              # Express entry point
│   ├── db.js                  # PostgreSQL connection pool
│   └── routes/
│       └── api.js             # All 4 API endpoints
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
