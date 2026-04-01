# DomiHive Mobile App Frontend Architecture (User App Only)

**Version:** 1.0  
**Date:** 01 April 2026  
**Owner:** Product / Frontend Team  
**Target App:** React Native user app only (no admin app)

---

## 1. Purpose of this Document

This document is the complete frontend architecture handoff for the DomiHive **mobile user app**.

It is written so another developer can start implementation immediately while web development continues.

The mobile app must mirror the website user logic, states, and flow already implemented in this repo.

---

## 2. Product Scope

### 2.1 In Scope

- User auth and onboarding
- Rent dashboard experience (only rent active now)
- Browse units, filters, advanced filters, list/grid
- Property details with media/reviews/location
- Inspection booking and inspection status flow
- Application flow (3 steps)
- Track application and verdict
- My Properties and tenancy management
- Maintenance
- Payments
- Messages
- Settings
- Notification drawer flow
- Theme switching and dark modes

### 2.2 Out of Scope

- Admin mobile app
- Backend implementation in this phase
- Buy / Commercial / Shortlet full modules (show as coming soon where needed)

---

## 3. Core Business Rule

Users browse and apply for **UNITS**.

Not buildings directly.

Everything in mobile listings, details, booking, and applications must use **unit data**.

---

## 4. Source of Truth in Current Web Codebase

Use these areas as reference while building mobile:

- `src/components/dashboard/rent/**`
- `src/components/home/properties/**`
- `src/components/shared/services/adminListings.js`
- `src/components/shared/utils/**`
- `src/context/AuthContext.jsx`
- `src/context/DashboardContext.jsx`
- `src/components/dashboard/pages/SettingsPage.jsx`
- `src/index.css` (theme tokens + visual rules)

---

## 5. Required User Journey (End-to-End)

1. Splash screen
2. Onboarding slide 1
3. Onboarding slide 2
4. Onboarding slide 3
5. Login / Sign up
6. OTP verification
7. Profile setup (nickname + profile upload)
8. Home / Overview
9. Browse units (search, filter, advanced filter, list/grid)
10. Open unit details
11. Use media/reviews/location floating actions
12. Proceed to Book Inspection
13. Select date, time, attendees, note
14. Agree terms and book
15. Success modal
16. Open My Applications
17. Handle inspection outcome path
18. Start application (step 1)
19. Upload docs (step 2)
20. Payment (step 3)
21. Track application
22. Wait for verdict
23. If approved -> management unlocks
24. Move-in checklist submit
25. Access property management pages

---

## 6. App Navigation Architecture

## 6.1 High-level Navigators

- **Root Navigator**
  - Auth Stack
  - App Shell

- **Auth Stack**
  - Splash
  - Onboarding 1/2/3
  - Login
  - Signup
  - OTP
  - Profile Setup

- **App Shell**
  - Header (avatar/name/nickname, bell, dashboard switcher)
  - Main tabs/sections
  - Screen stack per section

## 6.2 Main User Sections (same logic as web)

### Main

- Overview
- Browse Properties
- Favorites

### Applications

- My Applications

### Management (locked until eligible)

- My Properties
- Maintenance
- Payments
- Messages
- Rental Timeline (standalone page moved from overview)

### Utility

- Settings

---

## 7. Header Behavior (Mobile)

Header must include:

- Left: profile avatar + full name + nickname
- Right: notification bell (with unread count)
- Dashboard switcher dropdown
  - For Rent active
  - Other dashboards shown as coming soon

Dark mode icon in header must behave like web:

- if current theme is `light` -> switch to last selected dark theme
- if current theme is dark -> switch back to `light`

---

## 8. Dashboard Switcher Rules

Use dashboard config parity with web (`DashboardContext.jsx`):

- rent: enabled
- buy: disabled
- commercial: disabled
- shortlet: disabled

When switching dashboard:

- save choice as last dashboard
- route to dashboard overview for that dashboard

---

## 9. Management Unlock Rule

Management section shows only when either condition is true:

- at least one application is `APPROVED`, or
- at least one property is `PENDING_MOVE_IN` or `ACTIVE`

If locked:

- show locked helper copy (mobile equivalent)
- no management routes exposed

---

## 10. Auth Flows (Parity)

## 10.1 Signup Flow

Step 1
- full name
- phone
- password
- agree terms

Step 2
- 4-digit OTP

Step 3
- nickname (username)
- profile photo upload (optional)

On success:
- create user
- persist auth token and user
- route to last dashboard or rent overview

## 10.2 Login Flow

- phone + password
- remember me
- if success -> route to last dashboard

---

## 11. Persistent State Model

Current web is localStorage-based simulation. Mobile should use AsyncStorage with the same logical keys/contracts.

## 11.1 Core Keys

- `domihive_user`
- `domihive_auth_token`
- `domihive_last_dashboard`
- `domihive_theme`
- `domihive_dark_theme`

## 11.2 User-scoped keys

- `domihive_applications_state_${userKey}`
- `domihive_dashboard_notifications_${userKey}`
- `domihive_properties_${userKey}`
- `domihive_favorites_${userKey}`
- `domihive_payments_${userKey}`
- `domihive_message_threads_${userKey}`
- `domihive_maintenance_tickets_${userKey}`

## 11.3 Global booking keys

- `domihive_inspection_bookings`
- `domihive_current_booking`

---

## 12. Browse Units Module

## 12.1 Required UI Controls

- Search bar
- Filter panel
- Advanced filter panel
- Grid/List switch (list default if following current user preference)
- Property type dropdown

## 12.2 Filter rules

Must support these filter fields:

- `searchQuery`
- `state`
- `area`
- `location`
- `propertyType`
- `bedrooms`
- `bathroomsCount`
- `managementType`
- `sortBy`
- `priceMin`
- `priceMax`
- `furnishing`
- `propertyAge`
- `petsAllowed`
- `amenities[]`

## 12.3 Filter/Advanced mutual exclusivity

Only one can be open at a time:

- opening advanced closes basic filter
- opening basic closes advanced

## 12.4 Listing source

Use published unit listings only from shared listing mapper logic equivalent to:

- `getPublishedUnitListings()`

Listing must include merged property + unit data:

- pricing from unit
- location from property
- media merged (property slides + unit slides)
- availability based on tenant status + publish status

---

## 13. Unit Details Module

## 13.1 Content requirements

Show:

- title
- location full format
- price and price words
- bed/bath/size/type
- description from unit
- specs from property+unit feature mapping

## 13.2 Floating action controls

Need three floating controls:

- Media
- Reviews
- Location

On mobile:

- drawer-based interaction recommended
- switching between these should not break context

## 13.3 Book inspection entry

CTA routes to Book Inspection screen.

---

## 14. Inspection Booking Module

## 14.1 Form fields

- inspection date
- inspection time
- number of people attending
- additional notes
- terms agreement checkbox

## 14.2 Max attendees logic

Use property slot config (from admin-controlled inspection slots):

- default max = 3
- mobile should honor backend/admin max when available

## 14.3 Submit result

On successful booking:

- create booking record
- create or update corresponding application shell
- set inspection status to `Pending Confirmation`
- show success modal
- CTA to My Applications

---

## 15. Inspection Status Model

Exact names from shared util:

- `Pending Confirmation`
- `Scheduled`
- `No-show`
- `Inspection Completed`

Final statuses:

- No-show
- Inspection Completed

---

## 16. My Applications Module

## 16.1 Structure

- stats row
- filter/search/sort row
- active applications list
- archived requests list

## 16.2 Active card behavior

Must support:

- pending confirmation view
- scheduled + countdown
- blurred/locked states where required
- map/location drawer helper block
- confirm inspection action conditions

## 16.3 Overlays

### No-show overlay

Show message and 2 actions:

- Reschedule Inspection
- Not Interested Anymore

### Inspection Completed overlay

Show 2 actions:

- Continue with this property
- Not interested anymore

Continue -> application step flow starts.

## 16.4 Archived requests

Archived cards should still show concise details:

- small image
- price + price words
- title
- location
- bed/bath/size
- short description
- canceled/rejected/approved badge

---

## 17. Application Status Model

Use exact web statuses:

- `INSPECTION_SCHEDULED`
- `INSPECTION_VERIFIED`
- `APPLICATION_STARTED`
- `APPLICATION_SUBMITTED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

## 17.1 Route guards parity

- canStart: `INSPECTION_VERIFIED`, `APPLICATION_STARTED`
- canPay: `APPLICATION_STARTED`
- canTrack: `APPLICATION_SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `CANCELLED`

---

## 18. 3-Step Application Flow

## Step 1: Form

Fields include required personal and tenancy info (as in web) plus:

- marital status dropdown
- number of occupants dropdown

## Step 2: Documents

MVP requirement:

- Government ID upload only
- accepted: NIN, passport, driver’s license, gov ID
- show upload feedback (file name + done state)

## Step 3: Payment

Include:

- rent amount
- caution fee (must pick from unit/admin data)
- service charge
- total

Currency symbol must be **₦**, not NGN text.

After payment + submit:

- create submitted application
- route to Track Application
- push notifications

---

## 19. Track Application Page

Must show full progress timeline:

- Inspection Scheduled
- Inspection Verified
- Application Started
- Application Submitted
- Under Review (72 hours)
- Verdict

Expected UX:

- animate from top to current stage
- mark completed steps
- show under-review helper text
- verdict surfaces here and via notifications

---

## 20. Verdict Handling

## 20.1 Approved

- success UX with loading transition
- unlock management section
- create tenancy property record
- route hint to My Properties

## 20.2 Rejected

- rejection UX with reason
- refund status + ETA shown
- return-to-browse CTA

Both decisions must push notifications with CTA deep links.

---

## 21. My Properties Module

## 21.1 List page

- stats section
- filters section
- property cards

Card actions:

- Property Overview
- Payment History
- Lease Management

## 21.2 Move-in checklist

For pending move-in:

- key number input
- move-in date input
- submit

After submit:

- tenancy status becomes active
- admin tenant status should reflect active when integrated

---

## 22. Property Overview Page

Use web-aligned structure:

- tenancy summary block
- active lease details block
- updates block

Keep status colors visible in all themes.

---

## 23. Property Payment History Page

Show:

- next payment block
- payment table/list with:
  - Date
  - Description
  - Amount
  - Status
  - Receipt

Status colors must remain readable in dark themes.

---

## 24. Lease Management Page

Should include:

- lease actions
  - Renew Lease (navigate)
  - End Lease (navigate)

- standalone lease documents section:
  - Tenant Agreement
  - Tenant House Rules
  - Maintenance Agreement

---

## 25. Renewal and End Lease Pages

Need consistent layout with property pages.

## 25.1 Renewal

- duration
- preferred start date
- note
- submit request

## 25.2 End Lease/Vacate

- vacate notice fields
- move-out inspection scheduling

---

## 26. Maintenance Module

Tabs:

- New Request
- Active Requests
- Tracking
- History

New request form includes:

- property selector
- issue details
- urgency
- contact details
- policy agreement gate

Draft persistence required so form is not lost on navigation.

---

## 27. Payments Module (Global)

Tabs:

- Pay Now
- Receipts
- History

Pay Now sub-tabs:

- Rent
- Bills

Payment methods:

- Card
- Bank Transfer

Bank transfer includes:

- account details
- reference copy
- transfer proof upload

---

## 28. Messages Module

Features:

- message thread list
- thread details
- compose new message
- thread open/resolved status
- send new message
- optional property linkage

---

## 29. Settings Module

Sections:

- Profile
- Security
- Notifications
- Appearance
- Account

## 29.1 Appearance themes

- Blue Dark
- Gold Dark
- True Black

(light is system default)

## 29.2 Theme behavior

- persist selected theme
- persist last dark theme
- header toggle must switch between light and last-dark

---

## 30. Design System Tokens

## 30.1 Typography

- Font family: `Manrope`
- Weights: 300, 400, 500, 600, 700, 800

## 30.2 Core tokens

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

## 30.3 Theme presets

- light
- dark-gray (Blue Dark)
- gold-dark
- true-black

---

## 31. Iconography

Web uses Font Awesome + Lucide.

Mobile recommendation:

- `react-native-vector-icons/FontAwesome6`
- `lucide-react-native`

Core nav icons:

- Overview: chart-pie
- Browse: search
- Favorites: heart
- Applications: file-alt
- My Properties: home
- Maintenance: tools
- Payments: credit-card
- Messages: comments
- Settings: cog

---

## 32. Date and Time Formatting

Standard formats:

- Date: `dd/mm/yy`
- DateTime: `dd/mm/yy HH:mm`

Maintain consistency across all modules.

---

## 33. Shared Data Contracts

## 33.1 User

```ts
interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  phone: string;
  countryCode: string;
  profilePhoto?: string | null;
  dashboards: {
    rent: boolean;
    buy: boolean;
    commercial: boolean;
    shortlet: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
```

## 33.2 Listing (Unit)

```ts
interface UnitListing {
  id: string;
  listingId: string;
  propertyId: string;
  unitId: string;
  unitCode: string;
  title: string;
  description: string;
  price: number;
  cautionFee: number;
  bedrooms: number;
  bathrooms: number;
  size: string;
  state: string;
  area: string;
  locationName: string;
  location: string;
  address: string;
  postalCode: string;
  propertyType: string;
  propertyTypeLabel: string;
  buildingType: string;
  buildingTypeLabel: string;
  managementType: 'estate_property' | 'non_estate';
  isEstate: boolean;
  propertyAge: string;
  petsAllowed: boolean;
  furnishing: 'furnished' | 'semi_furnished' | 'unfurnished';
  amenityIds: string[];
  images: string[];
  image: string;
  dateAdded: string;
  isVerified: boolean;
  tenantStatus: string;
  canBook: boolean;
}
```

## 33.3 Application

```ts
type ApplicationStatus =
  | 'INSPECTION_SCHEDULED'
  | 'INSPECTION_VERIFIED'
  | 'APPLICATION_STARTED'
  | 'APPLICATION_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

type InspectionStatus =
  | 'Pending Confirmation'
  | 'Scheduled'
  | 'No-show'
  | 'Inspection Completed';

interface Application {
  id: string;
  status: ApplicationStatus;
  inspectionStatus?: InspectionStatus;
  applicantName: string;
  bookingId: string;
  inspectionDate: string;
  inspectionDateISO: string;
  inspectionTime?: string;
  attendees?: number;
  property: UnitListing;
  applicantDocs?: {
    governmentIdName?: string;
    governmentIdUrl?: string;
  };
  payment?: {
    method: 'card' | 'bank_transfer';
    amount: number;
    paidAt: string;
    status: string;
  };
  rejectionReason?: string;
  refundStatus?: string;
  refundETA?: string;
  createdAtISO: string;
  updatedAtISO: string;
}
```

## 33.4 Notification

```ts
interface AppNotification {
  id: string;
  type: 'inspection' | 'application' | 'verdict' | 'system' | 'property' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  cta?: {
    label: string;
    path: string;
  };
}
```

---

## 34. Recommended React Native Stack

- React Native (Expo recommended)
- React Navigation
- Zustand (or Redux Toolkit)
- TanStack Query
- React Hook Form + Zod
- AsyncStorage
- Reanimated + Gesture Handler
- Day.js
- Expo Image Picker / Document Picker

---

## 35. Suggested RN Folder Structure

```txt
src/
  app/
    navigation/
      RootNavigator.tsx
      AuthNavigator.tsx
      AppNavigator.tsx
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
    timeline/
  shared/
    ui/
    components/
    hooks/
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

---

## 36. Module Build Order

## Phase 1: Foundation

- app shell
- navigation
- auth
- theme system

## Phase 2: Discovery

- overview
- browse units
- filters and advanced filters
- details + floating actions

## Phase 3: Inspection + Applications

- book inspection
- my applications
- overlays
- 3-step application
- track page

## Phase 4: Management

- my properties
- move-in checklist
- property overview
- payment history
- lease management + renewal + vacate

## Phase 5: Operations

- maintenance
- payments
- messages
- settings
- rental timeline

## Phase 6: Hardening

- dark mode audit
- regression QA
- performance + offline polish

---

## 37. QA Checklist (Must Pass)

- [ ] Management section remains locked until approved/move-in pending/active
- [ ] Inspection status names exactly match required values
- [ ] Route guards enforce application stage rules
- [ ] Filter and advanced filter cannot stay open together
- [ ] Date format everywhere is `dd/mm/yy`
- [ ] Currency symbol shown as `₦`
- [ ] Caution fee pulls correct value
- [ ] Verdict triggers notifications and correct redirects
- [ ] Approved flow unlocks management and my properties
- [ ] Move-in submission updates tenancy status
- [ ] All 4 themes visually consistent
- [ ] Notification drawer CTA deep links work

---

## 38. Implementation Notes for Developer

1. Build with parity-first mindset: logic and statuses first, then polish.
2. Keep repository layer abstraction from day one.
3. Avoid storing large base64 file blobs in persistent storage.
4. Keep data shape compatible with web contracts to ease future shared backend.
5. Use mobile-native layouts, but preserve all business transitions and labels.

---

## 39. Final Product Decisions

- Mobile app is React Native only.
- User app only in this phase.
- Rent dashboard active; others shown as coming soon.
- Rental Timeline moved to Management as standalone page.
- Unit-first browsing and application flow.
- Theme, color, font, and status consistency with web are mandatory.

---

## 40. Appendix: Key Web Files for Exact Behavior Reference

- `src/App.jsx`
- `src/main.jsx`
- `src/context/AuthContext.jsx`
- `src/context/DashboardContext.jsx`
- `src/components/dashboard/layout/Header.jsx`
- `src/components/dashboard/layout/Sidebar.jsx`
- `src/components/dashboard/layout/DashboardLayout.jsx`
- `src/components/dashboard/pages/SettingsPage.jsx`
- `src/components/dashboard/rent/contexts/ApplicationsContext.jsx`
- `src/components/dashboard/rent/contexts/PropertiesContext.jsx`
- `src/components/dashboard/rent/contexts/JourneyContext.jsx`
- `src/components/dashboard/rent/contexts/MaintenanceContext.jsx`
- `src/components/dashboard/rent/contexts/PaymentsContext.jsx`
- `src/components/dashboard/rent/contexts/MessagesContext.jsx`
- `src/components/dashboard/rent/pages/RentOverview.jsx`
- `src/components/dashboard/rent/pages/RentBrowse.jsx`
- `src/components/dashboard/rent/pages/RentApplications.jsx`
- `src/components/dashboard/rent/pages/MyProperties.jsx`
- `src/components/dashboard/rent/pages/PropertyDashboard.jsx`
- `src/components/dashboard/rent/pages/PropertyPayments.jsx`
- `src/components/dashboard/rent/pages/PropertyLeaseManagement.jsx`
- `src/components/dashboard/rent/pages/PropertyRenewal.jsx`
- `src/components/dashboard/rent/pages/PropertyVacate.jsx`
- `src/components/dashboard/rent/pages/MaintenancePage.jsx`
- `src/components/dashboard/rent/pages/PaymentsPage.jsx`
- `src/components/dashboard/rent/pages/MessagesPage.jsx`
- `src/components/dashboard/rent/components/book-inspection/BookInspectionPage.jsx`
- `src/components/shared/services/adminListings.js`
- `src/components/shared/utils/inspectionBookings.js`
- `src/components/shared/utils/dateFormat.js`
- `src/index.css`

---

**End of Document**
