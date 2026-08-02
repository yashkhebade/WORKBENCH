# Architecture & Backend Strategy

This document clarifies the architectural layout and backend strategy for the WORKBENCH (HW Team Hub) repository.

## The Canonical Backend (`server/`)
The **Express.js** service located in the `server/` directory is the **canonical production backend** for this application. It is responsible for:
- Authentication (JWT + bcrypt)
- Database interactions (PostgreSQL / Supabase data layer)
- Core workflow APIs (Projects, Tasks, Activity Logs)
- Real-time presence and updates (Socket.io)
- File uploads and Telegram notification bridging

All new UI features in the React `client/` should communicate with this Express backend.

## The Experimental Backend (`fastapi-backend/`)
The **FastAPI** service located in the `fastapi-backend/` directory is an **experimental microservice**. 
It currently duplicates some models (Projects, Tasks) and real-time logic for testing purposes, but it is **not** the source of truth. 

**Future Vision for FastAPI:**
Rather than running as a parallel monolith, the FastAPI service will eventually be scoped down to handle specialized hardware/EDA workloads (e.g., PCB board analysis, ML-assisted part matching, or parsing Gerber files) where Python's ecosystem provides a distinct advantage. Once that migration begins, duplicated auth and task logic in `fastapi-backend/` will be removed in favor of strict microservice boundaries calling the canonical Express API.

## Frontend (`client/`)
The web frontend is a React 19 / Vite SPA using `@dnd-kit/core`, Tailwind CSS, and shadcn/ui.
It communicates exclusively with the Express backend via HTTP REST and Socket.io.

## Mobile (`mobile_app/`)
An Expo/React Native mobile client for on-the-go viewing. It connects to the same Express API. Note that it currently uses React 18.2, while the web client uses React 19.

## Contributing
When adding a new model or feature, define it in the PostgreSQL database and write the Express routes in `server/`. Do not duplicate the schema into `fastapi-backend/`.
