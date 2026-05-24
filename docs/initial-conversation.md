# SYSTEM CONTEXT & PROJECT BRIEF
**Project Name:** 50 Drones Command Center (Code name: DroneWatch)
**Objective:** Build a real-time, hardware-agnostic drone fleet command center. 
**Immediate Goal:** Deliver an on-premise operational UI to livestream 50 drones simultaneously on a large command center "video tron" for an air police/law enforcement client.
**Long-term Goal:** Evolve the codebase into a tiered SaaS product (PLG motion: Free -> Pro -> Enterprise).

## 1. TECH STACK & ARCHITECTURE
* **Video Backbone:** LiveKit (Self-hosted WebRTC), LiveKit Ingress (RTSP to WebRTC via FFmpeg), LiveKit Egress (Recording).
* **Frontend (Current Focus):** React + React Router (SPA, no Next.js).
* **UI Framework:** shadcn/ui + Tailwind CSS. 
* **Mapping:** MapLibre GL / Deck.gl (for tactical map and telemetry overlays).
* **Backend (Future Phase):** NestJS, PostgreSQL, TimescaleDB (telemetry), Redis, MQTT, WebSocket Gateway.
* **Hardware / Infra Context:** Hosted on OVHcloud Bare Metal. Client rendering PC has 64GB RAM & high-VRAM GPU to handle 50 concurrent WebRTC streams.

## 2. DESIGN AESTHETIC
* **Vibe:** Dark mode default, military-grade command center, dense, operational, zero fluff. Similar to DJI FlightHub 2 and FlytBase, but strictly optimized for real-time live ops.
* **Typography/Visuals:** Monospace fonts for telemetry (e.g., Share Tech Mono), condensed headers. Scanline effects, glowing status dots, minimal padding to maximize data density.

## 3. PRODUCT ROADMAP (SaaS Strategy)
Keep the frontend architecture scalable to support these future tiers:
* **Phase 1 / Custom Project (Building NOW):** 50 live streams, on-prem deploy, basic telemetry, multi-feed video wall.
* **Free Tier (Future):** Max 3 drones, 1 operator, basic map, 30-min recording limits.
* **Pro Tier (Future):** 20 drones, team sharing, click-to-fly map navigation, 7-day recording.
* **Enterprise Tier (Future):** 50+ drones, AI detection (YOLOv8), full remote control (joystick/mouselook bridging MAVLink/DJI SDK), audit logs, full API.

## 4. IMMEDIATE TASK: FRONTEND UI DEVELOPMENT
We are currently building the pure React UI prototype (HTML/CSS/JS or React components). We need 3 core views using hash routing (`#login`, `#dashboard`, `#streaming`):

1.  `/login`: Clean, branded, secure authentication screen.
2.  `/dashboard`: High-level operational overview suitable for a passive "tron" display.
    * Operation map showing all 50 drones.
    * KPI strip (active drones, battery alerts, asset readiness).
    * Thumbnail strip of active feeds.
3.  `/streaming` (PRIMARY FOCUS): The heavy-duty operator view.
    * **Featured Feed:** Large 2/3 width video feed with telemetry overlay.
    * **Drone Grid:** 50-drone thumbnail grid (searchable/filterable).
    * **Mini Nav Map:** Drone position and flight path.
    * **Summary Panel:** Hardware specs, operator info, uptime, logs.
    * **Controls:** Record, snapshot, feature, full-screen.

**Your Role:** Acknowledge you have read and understood this project context. Then, ask me which of the 3 UI pages we should begin writing the React/shadcn code for first.
