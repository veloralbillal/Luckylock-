# Live Customer Support System — Installation & Deployment Guide

## Architecture Overview
This project ships a complete, production-ready Live Customer Support System integrated alongside the existing application without modifying or overwriting existing features:

1. **Customer Floating Widget**: Responsive desktop/mobile floating support button & chat window embedded across customer pages. Collects Name, Phone, and Department before starting a chat, supports real-time messaging, image/file attachments, live typing indicators, delivery/read receipts, waiting queue position tracking, conversation history, closing conversations, and post-chat 1–5 star ratings.
2. **Separate Representative Portal (`/support/rep`)**: Dedicated representative sign-in and workspace with separate session authentication (`lw_support_rep` HttpOnly cookie / `support_rep` Laravel guard), Online/Offline/Busy availability controls, single-chat enforcement (**max 1 active chat per representative**), live incoming chat alerts, customer info sidebar, assignment audit trail, peer transfers, chat history, and ratings view.
3. **Admin Support Management (`Admin Panel → Live Support`)**: Create/edit/suspend/delete representatives, assign credentials, monitor all waiting/active/closed conversations in real time, manually assign or transfer chats, inspect performance & ratings, and configure queue/auto-assignment & file upload limits/formats.

## Seeded Representative Accounts (Live Runtime)
- **Sara Rahman** (`General Support`): Username `rep_sara`, Password `Support123`
- **Rafiul Karim** (`Payments & Wallet`): Username `rep_rafi`, Password `Support123`
- **Representative Portal URL**: `/support/rep`

## Laravel 11 + Reverb Deployment Steps
1. Copy `.env.example` to `.env` and configure database + Reverb variables (`REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`).
2. Add the `support_rep` guard & provider in `config/auth.php` pointing to `App\Models\Support\SupportRepresentative`.
3. Run database migrations for all 9 support tables:
   ```bash
   php artisan migrate
   ```
4. Start Laravel Reverb WebSocket server and queue worker:
   ```bash
   php artisan reverb:start --host=0.0.0.0 --port=8080
   php artisan queue:work --tries=3
   ```
5. Run automated concurrency & permission tests:
   ```bash
   php artisan test tests/Feature/LiveSupportSystemTest.php
   ```

## Node / Express Live Preview Runtime
The live preview runtime runs on port `3000` with Express API routes (`/api/support/*`, `/api/admin/support/*`) and a private-channel WebSocket hub (`/ws/support`) enforcing identical single-chat atomic assignment, FIFO waiting queue, MIME/extension attachment validation, and role-isolated channel access.
