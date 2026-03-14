# AdVista: Engineering Decisions

This document provides an extended evaluation of the core technical philosophies, compromises, and frameworks selected during the engineering lifecycle of **AdVista**.

## 1. Frontend: Next.js (App Router) & React 19
**Context:** Digital billboards require robust client-side rendering capabilities that can quickly react to WebSockets, but also benefit from strongly organized file routing and build-time optimizations (like Font and Image loading mechanisms).

**Decision:** We adopted Next.js utilizing the new App Router structure (`/app`). 
- **Component Strategy**: Because the entire digital billboard interface depends on `socket.io-client` streams and `window` objects, we strictly designated the components as Client Components (`"use client"`). 
- **Scalability**: While SSR (Server-Side Rendering) is not aggressively utilized for the live billboard view, building upon Next.js guarantees that future administrative panels (`/admin`) can safely use SSR for secure dashboard authentication without exposing secrets.

## 2. Backend: Node.js with Express 5.x
**Context:** We required a backend that can seamlessly ingest static multipart forms (images/videos) and act as a WebSocket server contemporaneously.

**Decision:** Express.js paired with Node's native HTTP server provides the cleanest bridge for wrapping a `Socket.io` instance onto the same operational port. 
- **File Ingest**: We utilized `multer` for direct-to-disk local fast uploading. In physical deployment, this avoids choking main memory during large 4K video uploads.

## 3. Real-time Pub-Sub: Socket.io
**Context:** A digital billboard display screen usually operates unattended without a user to trigger "refreshes".

**Decision:** Using `socket.io`, the backend pushes a `NEW_AD_AVAILABLE` broadcast immediately upon successfully mutating the database.
- **Failover**: Socket.io was chosen over raw WebSockets due to its automatic polling fallbacks and aggressive internal connection retry logic, ensuring screens survive intermittent Wi-Fi or network failures gracefully.

## 4. Current Database: PouchDB (Temporary NoSQL)
**Context:** In the early bootstrapping phases of AdVista, standing up a relational schema with rigid SQL migrations would throttle rapid prototyping velocity.

**Decision:** **PouchDB** was integrated as an embedded document database. It successfully mimics asynchronous database retrieval and allows the API contracts (`GET /api/ads`) to be fully solidified against a local NoSQL store.

## 5. Future Data Architecture: PostgreSQL Transition
**Context:** As AdVista graduates into a Multi-Tenant environment capable of supporting hundreds of distinct advertising agencies managing thousands of remote screens chronologically, PouchDB acts as a bottleneck.

**Decision:** A hard roadmap pivot to **PostgreSQL** is documented and planned.
- **Reasoning**: A SQL schema will strictly map slots to displays via Foreign Keys. It will implement ACID compliant transactions to ensure no overlapping ad-bids can corrupt the active state, and will provide advanced timeline analytics using relational joins. 
- **Impact**: Because the Express router perfectly encapsulates database operations inside of `db.js`, the eventual swap to `pg` (PostgreSQL client) will not cascade regressions into the frontend views.
