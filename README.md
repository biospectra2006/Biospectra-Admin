# BIOSPECTRA Admin Dashboard

React (Vite) admin panel for managing journal content.

## Setup

```bash
npm install
cp .env.example .env   # edit with your API URL
npm run dev            # → http://localhost:5173
```

## Production Build

```bash
npm run build          # → dist/
```

Serve `dist/` with any static server (Nginx, Vercel, Netlify).

## Features

- Article CRUD with PDF upload
- Year / Issue / Category hierarchy management
- Gallery image management
- Editorial board editor
- About page editor
- Admin session audit & management
- MFA setup & step-up verification
