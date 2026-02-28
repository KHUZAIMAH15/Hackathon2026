# Hospital Management System - Project Structure

## Suggested Full Folder Structure

```
front-end/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin layout wrapper
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   ├── doctors/
│   │   │   │   └── page.tsx
│   │   │   ├── patients/
│   │   │   │   └── page.tsx
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   ├── doctor/
│   │   │   ├── layout.tsx        # Doctor layout wrapper
│   │   │   ├── page.tsx          # Doctor dashboard
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx
│   │   │   └── diagnosis/
│   │   │       └── page.tsx
│   │   ├── patient/
│   │   │   ├── layout.tsx        # Patient layout wrapper
│   │   │   ├── page.tsx          # Patient dashboard
│   │   │   ├── book-appointment/
│   │   │   │   └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   └── receptionist/
│   │       ├── layout.tsx        # Receptionist layout wrapper
│   │       ├── page.tsx          # Receptionist dashboard
│   │       ├── register/
│   │       │   └── page.tsx
│   │       └── schedule/
│   │           └── page.tsx
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   └── Badge.tsx
│   ├── layout/                   # Layout components
│   │   ├── RoleLayout.tsx
│   │   └── Header.tsx
│   ├── Admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── ManageDoctors.tsx
│   │   ├── ManagePatients.tsx
│   │   └── ViewReports.tsx
│   ├── Doctor/
│   │   ├── DoctorDashboard.tsx
│   │   ├── DoctorSidebar.tsx
│   │   ├── ViewAppointments.tsx
│   │   └── UpdateDiagnosis.tsx
│   ├── Patient/
│   │   ├── PatientDashboard.tsx
│   │   ├── PatientSidebar.tsx
│   │   ├── BookAppointment.tsx
│   │   └── ViewHistory.tsx
│   └── Receptionist/
│       ├── ReceptionistDashboard.tsx
│       ├── ReceptionistSidebar.tsx
│       ├── RegisterPatient.tsx
│       └── ScheduleAppointment.tsx
├── context/
│   └── AuthContext.tsx
├── types/
│   ├── index.ts                  # All type exports
│   ├── user.ts                   # User-related types
│   ├── appointment.ts            # Appointment types
│   ├── medical.ts                # Medical record types
│   └── common.ts                 # Common types
├── data/
│   └── dummy.ts                  # Dummy data for development
├── lib/
│   └── utils.ts                  # Utility functions
└── tailwind.config.ts
```

## Role-Based Layout System

Each role has its own layout wrapper that provides:
- Role-specific sidebar navigation
- Consistent header with user info
- Protected route access
- Shared state management

### Layout Hierarchy

```
Root Layout (app/layout.tsx)
├── AuthProvider
└── Dashboard Layout (app/(dashboard)/[role]/layout.tsx)
    ├── RoleSidebar
    ├── Header
    └── Page Content
```

## Clear Separation of Concerns

### Types Layer (`/types`)
- All TypeScript interfaces and types
- Shared across the entire application

### Data Layer (`/data`)
- Dummy data for development
- Easy to replace with API calls later

### UI Components (`/components/ui`)
- Reusable, role-agnostic components
- Button, Card, Table, Input, etc.

### Layout Components (`/components/layout`)
- Shared layout structures
- RoleLayout wrapper

### Feature Components (`/components/[Role]`)
- Role-specific functionality
- Dashboard, Sidebar, Feature components

### Pages (`/app/(dashboard)/[role]`)
- Route definitions
- Minimal logic, compose components

## Component Naming Convention

- **Layout wrappers**: `[Role]Layout.tsx`
- **Dashboards**: `[Role]Dashboard.tsx`
- **Sidebars**: `[Role]Sidebar.tsx`
- **Feature components**: PascalCase descriptive names (e.g., `ManageDoctors.tsx`)
