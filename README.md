# Scrap Management SaaS

A React/Vite client and Express/MongoDB API for tracking organisational scrap through sale, recycling, donation, or disposal.

## Requirements

- Node.js 20.19 or newer
- MongoDB running locally, or a MongoDB connection string

## Start the API

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env` and set a private `JWT_SECRET_KEY`. Set `MONGO_URI` to your MongoDB connection string if you are not using the local default. Then start the API:

```powershell
npm start
```

The API listens on `http://localhost:5000` by default.

## Start the client

In another terminal:

```powershell
cd client
npm install
```

Set `client/.env` to:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Then start Vite:

```powershell
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Restart Vite after changing `.env` values.

## Client API paths

The client uses the API paths from the project contract: organisation registration, auth login/logout/session restore, staff creation, category list/create/delete, scrap list/detail/create/update/delete/dispose, transactions, and dashboard stats. There is no staff-list request because the API does not expose one yet.
