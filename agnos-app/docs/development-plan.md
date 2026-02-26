# Development Planning Document

## 1) Project Structure

```text
src/
  app/
    page.tsx                # Landing page with links to both interfaces
    patient/page.tsx        # Patient entry page
    staff/page.tsx          # Staff monitoring page
  components/
    Header.tsx              # Patient page top bar
    PatientForm.tsx         # Full realtime patient intake form
    StaffDashboard.tsx      # Realtime field-by-field staff view + status
    StaffMetrics.tsx        # Staff KPI cards
    ActiveQueue.tsx         # Queue panel UI
    StaffSidebar.tsx        # Staff navigation sidebar (responsive)
  hooks/
    useSocket.ts            # Shared Socket.IO client hook
  types/
    patient.ts              # Patient data model interface
  utils/
    validators.ts           # Zod schema validation rules
server.js                  # Custom Next + Socket.IO realtime server
```

## 2) UI/UX Design Decisions (Responsive)

### Patient interface
- Uses a clear form hierarchy with grouped sections:
  - Identity
  - Demographics
  - Contact and address
  - Optional emergency and religion fields
- Inline validation feedback appears per field.
- Status chip at top communicates current form state (`Idle`, `Filling form`, `Submitted`).
- Mobile-first layout with `grid-cols-1`, upgraded to two-column layout on medium screens.

### Staff interface
- Keeps live status visible in header badge.
- Prioritizes readability of incoming fields using two-column label/value rows.
- Uses stacked layout on mobile and split columns on larger displays.
- Sidebar converts from fixed desktop navigation to full-width top section on small screens.

## 3) Component Architecture

- **PatientForm**
  - Holds local form state
  - Builds payload for realtime emission
  - Runs Zod validation in realtime and on submit
  - Emits `patient:update`, `patient:status`, and `patient:submit`

- **StaffDashboard**
  - Subscribes to patient socket events
  - Maintains staff-side session state and inactivity fallback
  - Renders all patient fields and timestamp updates

- **useSocket hook**
  - Centralized socket initialization and lifecycle cleanup
  - Shared by both patient and staff interfaces

- **server.js**
  - Broadcast hub for realtime events to connected clients
  - Adds `lastUpdated` timestamp for update and submit snapshots

## 4) Realtime Synchronization Flow

1. Patient types in form.
2. `PatientForm` debounces and emits `patient:update` with current payload.
3. `PatientForm` emits `patient:status` as `typing`.
4. Server broadcasts to all connected clients.
5. `StaffDashboard` updates visible field values instantly.
6. If no activity for a timeout window, status becomes `idle`.
7. On submit, `PatientForm` emits `patient:submit` and `patient:status= submitted`.
8. Staff view switches to submitted state badge.

## 5) Notes for Deployment

- Current implementation relies on a custom Node server (`server.js`) for Socket.IO.
- Best deployment targets: Render / Railway / Heroku (persistent Node runtime).
- If deploying to serverless-first platforms, move realtime backend to a dedicated service.
