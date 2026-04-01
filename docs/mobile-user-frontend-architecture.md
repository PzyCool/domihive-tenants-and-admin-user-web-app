# DomiHive User Mobile App Frontend Architecture (React Native)

## 1) Goal and Scope
Build a React Native mobile app for **users only** (no admin mobile app) that mirrors the current website user journey and business logic.

This document is based on the current web codebase in `src/components/dashboard/rent`, `src/components/home/properties`, auth flows, shared utilities, and theme tokens.

### In Scope
- User auth and onboarding
- Rent dashboard flows (overview, browse units, favorites, applications, management)
- My Properties and tenancy lifecycle
- Maintenance, Payments, Messages
- Settings (profile, security, notifications, appearance, account)
- Notification drawer behavior and CTA deep links
- Full dark/light theme consistency (including Blue Dark, Gold Dark, True Black)

### Out of Scope
- Admin mobile app
- Backend implementation (mobile should integrate with API contracts; current web uses local storage simulation)

---

## 2) Product Principle
Mobile app should be **feature-parity in logic** with web user side. UI layout should be mobile-native, but statuses, guards, transitions, and data behavior must match.

Key business rule:
- Users browse and apply for **Units** (not buildings directly).

---

## 3) Main User Journey (End-to-End)
1. Splash
2. Onboarding slide 1 -> 2 -> 3
3. Sign Up / Login
4. OTP verification
5. Nickname + profile photo setup
6. Enter app Home/Overview
7. Browse units -> View details -> Book inspection
8. Inspection booked -> My Applications
9. Inspection result path:
   - No-show -> reschedule or not interested
   - Inspection completed -> continue to application
10. Application flow (3 steps):
   - Step 1 Form
   - Step 2 Government ID upload
   - Step 3 Payment
11. Track application progress
12. Verdict:
   - Approved -> unlock Management section and My Properties
   - Rejected -> show reason + refund info + continue browsing
13. Move-in checklist submission
14. Tenancy management pages:
   - Property Overview
   - Payment History
   - Lease Management
   - Renewal / End Lease

---

## 4) Mobile Information Architecture

## 4.1 Auth Stack
- `SplashScreen`
- `Onboarding1`
- `Onboarding2`
- `Onboarding3`
- `LoginScreen`
- `SignupScreen`
- `OtpVerificationScreen`
- `ProfileSetupScreen` (nickname + avatar)

## 4.2 App Shell (Post-auth)
Top-level shell:
- Header: avatar + full name + nickname, notification bell, dashboard switcher (For Rent active)
- Main sections:
  - `Overview`
  - `BrowseProperties`
  - `Favorites`
  - `MyApplications`
  - Management (locked until approved):
    - `MyProperties`
    - `Maintenance`
    - `Payments`
    - `Messages`
    - `RentalTimeline` (new standalone page requested)
  - `Settings`

Note:
- Management section unlock condition follows web:
  - any application `APPROVED` OR any property with `PENDING_MOVE_IN`/`ACTIVE`.

---

## 5) Screen-Level Functional Requirements

## 5.1 Overview
Include equivalent web overview content, except:
- Move "Rental Timeline" out of overview into standalone `RentalTimeline` page under Management.

## 5.2 Browse Properties (Units)
Must support:
- Search header
- Filters
- Advanced filters
- Grid/List view toggle
- Property-type dropdown
- Pagination/infinite list (mobile can use infinite scroll)
- Pull-to-refresh

Filter logic parity (from `RentBrowse.jsx`):
- `searchQuery`
- `state`
- `area`
- `location`
- `propertyType`
- `bedrooms`
- `bathroomsCount`
- `managementType`
- `sortBy`
- `priceMin`, `priceMax`
- `furnishing`
- `propertyAge`
- `petsAllowed`
- `amenities[]`

Important:
- Filter and advanced filter cannot both be open at same time.

## 5.3 Property Details
Must show:
- Unit details, full media, location, reviews
- 3 floating action icons (Media, Reviews, Location) in mobile form
- Proceed to Book Inspection CTA

Behavior parity:
- Use drawer-like behavior for Media/Review/Location sections where applicable
- Return/back behavior should be clean and contextual

## 5.4 Book Inspection
Fields:
- date
- time
- number of attendees (max controlled by admin slots; default 3)
- additional notes
- terms agreement

On submit:
- create inspection booking
- show success modal
- CTA to "View Application" -> My Applications

## 5.5 My Applications
- list active applications as compact list-view card
- archived section
- overlays:
  - no-show overlay (reschedule / not interested)
  - inspection completed overlay (continue to application)
- countdown behavior for scheduled inspection
- map/instructions drawer on locked card

Application flow (3-step):
1. Form
2. Government ID upload only
3. Payment

Track page:
- animated progress through stages
- under review state
- verdict handling + notification

## 5.6 My Properties
- stats row
- filters
- property cards with 3 action buttons:
  - Property Overview
  - Payment History
  - Lease Management

Move-in flow:
- key number
- move-in date
- submit

## 5.7 Property Overview
Use current web structure and statuses:
- tenancy summary
- active lease details
- updates section

## 5.8 Property Payments
- next payment block
- table/list: Date, Description, Amount, Status, Receipt
- filters/tabs and status colors

## 5.9 Lease Management
- standalone lease docs section (3 docs):
  - Tenant Agreement
  - Tenant House Rules
  - Maintenance Agreement
- lease actions:
  - Renew Lease -> Renewal page
  - End Lease -> Vacate page

## 5.10 Maintenance
Tabs:
- new request
- active requests
- tracking
- history

Includes:
- policy acknowledgment gate
- draft persistence

## 5.11 Payments (Global)
Tabs:
- Pay Now (rent/bills)
- Receipts
- History

Supports:
- Card
- Bank Transfer upload flow
- status updates and receipts

## 5.12 Messages
- thread list
- thread detail
- compose new
- status open/resolved
- attachment action placeholder

## 5.13 Settings
Sections:
- Profile
- Security
- Notifications
- Appearance
- Account

Appearance themes:
- Light (default)
- Blue Dark (`dark-gray` internal id)
- Gold Dark (`gold-dark`)
- True Black (`true-black`)

Header darkmode toggle behavior:
- If current theme is light -> switch to last dark theme
- If current theme is dark -> switch to light

---

## 6) State Machine (Critical)

## 6.1 Inspection Booking Status
From `inspectionBookings.js`:
- `Pending Confirmation`
- `Scheduled`
- `No-show`
- `Inspection Completed`

Final statuses:
- No-show
- Inspection Completed

## 6.2 Application Status
From rent app contexts:
- `INSPECTION_SCHEDULED`
- `INSPECTION_VERIFIED`
- `APPLICATION_STARTED`
- `APPLICATION_SUBMITTED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

Guard rules (match web `applicationStageGuards`):
- canStart: `INSPECTION_VERIFIED`, `APPLICATION_STARTED`
- canPay: `APPLICATION_STARTED`
- canTrack: `APPLICATION_SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `CANCELLED`

## 6.3 Property Tenancy Status
- `PENDING_MOVE_IN`
- `ACTIVE`
- `ENDED`

---

## 7) Shared Data Models (Mobile Contract)

## 7.1 Auth User
```ts
User {
  id: string
  name: string
  username?: string
  email?: string
  phone: string
  countryCode: string
  profilePhoto?: string
  dashboards: { rent: boolean; buy: boolean; commercial: boolean; shortlet: boolean }
  createdAt: string
  updatedAt: string
}
```

## 7.2 Unit Listing (Browse Card)
Based on `adminListings.js`:
```ts
Listing {
  id: string
  listingId: string
  propertyId: string
  unitId: string
  unitCode: string
  title: string
  description: string
  price: number
  cautionFee: number
  bedrooms: number
  bathrooms: number
  size: string
  state: string
  area: string
  locationName: string
  location: string
  address: string
  postalCode: string
  propertyType: string
  propertyTypeLabel: string
  buildingType: string
  buildingTypeLabel: string
  managementType: 'estate_property' | 'non_estate'
  isEstate: boolean
  propertyAge: string
  petsAllowed: boolean
  furnishing: 'furnished' | 'semi_furnished' | 'unfurnished'
  amenityIds: string[]
  images: string[]
  image: string
  dateAdded: string
  isVerified: boolean
  tenantStatus: 'vacant' | 'reserved' | 'occupied' | string
  canBook: boolean
}
```

## 7.3 Application
```ts
Application {
  id: string
  status: ApplicationStatus
  inspectionStatus?: InspectionBookingStatus
  applicantName: string
  bookingId: string
  inspectionDate: string
  inspectionDateISO: string
  inspectionTime?: string
  attendees?: number
  property: ListingLike
  applicantDocs?: {
    governmentIdName?: string
    governmentIdUrl?: string
    // avoid storing large base64 in persistent storage
  }
  payment?: {
    method: 'card' | 'bank_transfer'
    amount: number
    paidAt: string
    status: string
  }
  rejectionReason?: string
  refundStatus?: string
  refundETA?: string
  createdAtISO: string
  updatedAtISO: string
}
```

## 7.4 Notification
```ts
Notification {
  id: string
  type: 'inspection' | 'application' | 'verdict' | 'system' | 'property' | 'reminder'
  title: string
  message: string
  read: boolean
  createdAt: string
  cta?: { label: string; path: string }
}
```

---

## 8) Persistence and Sync Strategy
Current web is local-storage based. For mobile, mirror this with AsyncStorage first, then replace with API.

Web key patterns to mirror (for compatibility):
- `domihive_user`
- `domihive_auth_token`
- `domihive_last_dashboard`
- `domihive_theme`
- `domihive_dark_theme`
- `domihive_applications_state_${userKey}`
- `domihive_dashboard_notifications_${userKey}`
- `domihive_properties_${userKey}`
- `domihive_favorites_${userKey}`
- `domihive_payments_${userKey}`
- `domihive_message_threads_${userKey}`
- `domihive_maintenance_tickets_${userKey}`
- `domihive_inspection_bookings`

Recommendation:
- Keep a repository layer so storage can swap from AsyncStorage -> backend API without rewriting screens.

---

## 9) Design System and Visual Consistency

## 9.1 Typography
- Font family: **Manrope**
- Weights used: 300, 400, 500, 600, 700, 800

## 9.2 Core Tokens (from `:root`)
- `--primary-color: #0E1F42`
- `--accent-color: #9F7539`
- `--accent-light: #B58A4A`
- `--page-bg: #F8F9FA`
- `--card-bg: #FFFFFF`
- `--text-color: #0E1F42`
- `--text-muted: #6C757D`
- `--gray-light: #E2E8F0`
- `--success: #10B981`
- `--error: #DC2626`

## 9.3 Theme Presets
- Light
- Blue Dark (`dark-gray` id)
- Gold Dark (`gold-dark` id)
- True Black (`true-black` id)

## 9.4 Status Colors
- success text: `#10B981`
- danger text: `#EF4444`
- warning text: `#F59E0B`
- accent text: `#9F7539`

## 9.5 Date Format
Global UI format: `dd/mm/yy` (and `dd/mm/yy HH:mm` for date-time).

---

## 10) Icons
Current web uses:
- Font Awesome (solid icons, many places)
- Lucide React (selected screens)

Mobile recommendation for consistency:
- `react-native-vector-icons/FontAwesome6`
- `lucide-react-native`

Map core icons:
- Overview: `chart-pie`
- Browse: `search`
- Favorites: `heart`
- Applications: `file-alt`
- My Properties: `home`
- Maintenance: `tools`
- Payments: `credit-card`
- Messages: `comments`
- Notifications: `bell`
- Settings: `cog`

---

## 11) React Native Technical Architecture

## 11.1 Recommended Stack
- React Native (Expo recommended for speed)
- Navigation: React Navigation (Native Stack + Bottom Tabs + Drawer/Modal stacks)
- State: Zustand or Redux Toolkit
- Server cache: TanStack Query
- Forms: React Hook Form + Zod
- Async persistence: AsyncStorage
- Date/time: dayjs
- File upload: expo-document-picker / expo-image-picker
- Animations: Reanimated + Gesture Handler

## 11.2 Suggested Folder Structure
```txt
src/
  app/
    navigation/
      RootNavigator.tsx
      AuthNavigator.tsx
      MainNavigator.tsx
  modules/
    auth/
    overview/
    browse/
    property-details/
    inspection/
    applications/
    my-properties/
    maintenance/
    payments/
    messages/
    settings/
    notifications/
  shared/
    components/
    ui/
    theme/
      tokens.ts
      themes.ts
    utils/
      date.ts
      money.ts
      validation.ts
    types/
  data/
    repositories/
    storage/
    mappers/
```

## 11.3 State Layers
- `authStore`
- `dashboardStore` (current dashboard + feature flags)
- `themeStore`
- `browseStore` (filters, view type, paging)
- `applicationsStore` (status machine + overlays)
- `propertiesStore`
- `paymentsStore`
- `maintenanceStore`
- `messagesStore`
- `notificationsStore`

---

## 12) API-Ready Endpoints (for backend phase)
Define now so mobile and web align later:
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/verify-otp`
- `GET /listings?filters...`
- `GET /listings/:listingId`
- `POST /inspections/book`
- `GET /inspections/my-bookings`
- `PATCH /inspections/:id/reschedule`
- `POST /applications`
- `GET /applications/my`
- `GET /applications/:id`
- `POST /applications/:id/upload-government-id`
- `POST /applications/:id/pay`
- `GET /properties/my`
- `PATCH /properties/:id/move-in`
- `GET /payments/my`
- `GET /maintenance/my`
- `POST /maintenance`
- `GET /messages/threads`
- `POST /messages/threads`
- `POST /messages/threads/:id/messages`
- `GET /notifications`
- `PATCH /notifications/read`

---

## 13) Reusable Mobile Components Checklist
Build these first for speed:
- `AppHeader`
- `NotificationDrawer`
- `DashboardSwitcher`
- `StatCard`
- `FilterBar`
- `UnitCardGrid`
- `UnitCardList`
- `StatusBadge`
- `ThemeAwareButton`
- `BottomSheetDrawer`
- `FormSectionCard`
- `StepProgress` (application 1/2/3)
- `CountdownChip`

---

## 14) Delivery Plan (Recommended)

## Phase 1 (Foundation)
- Project setup, theme engine, auth flow, navigation shell

## Phase 2 (Discovery + Inspection)
- Overview, Browse, Property Details, Book Inspection

## Phase 3 (Applications)
- My Applications, overlays, 3-step flow, track page, verdict UX

## Phase 4 (Management)
- My Properties, move-in checklist, Property Overview, Payment History, Lease Management, Renewal, End Lease

## Phase 5 (Ops)
- Maintenance, Payments, Messages, Settings, Rental Timeline

## Phase 6 (Hardening)
- QA regression + dark theme audit + performance + offline behavior

---

## 15) QA Acceptance Checklist
- All date fields display `dd/mm/yy`
- Management section remains locked until approved/move-in pending/active
- Inspection statuses sync and gate application correctly
- No-show flow works with archive behavior
- Inspection-completed flow shows continue overlay
- 3-step application flow cannot skip required validations
- Verdict drives notifications + correct page redirection
- My Properties appears only after approval
- Move-in submission flips tenancy to active
- Theme toggle works exactly as web behavior
- All major pages pass Light/Blue Dark/Gold Dark/True Black checks

---

## 16) Notes to Mobile Developer
- Use this web repo as visual and behavior reference, especially:
  - `src/components/dashboard/rent/**`
  - `src/components/shared/utils/**`
  - `src/components/shared/services/adminListings.js`
  - `src/context/AuthContext.jsx`, `DashboardContext.jsx`
- Preserve current status names exactly to avoid mapping bugs.
- Keep a repository abstraction so replacing local persistence with backend is low-risk.

---

## 17) Final Decision Record
- Mobile app is **React Native only**
- User app only (admin excluded)
- Feature and logic parity with current user web flows
- Rental Timeline moved into Management as a standalone page
- Same colors, font family, icon style, statuses, and date formatting

