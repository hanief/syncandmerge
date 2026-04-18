# Portier Integration Sync Panel

A Web App Integration Sync Panel for a B2B SaaS platform that connects to multiple external services (Salesforce, HubSpot, Stripe, Slack, Zendesk, and Intercom).

This application provides a comprehensive interface for managing bidirectional data synchronization, handling conflicts safely, and maintaining detailed version history.

## Features

### 1. Integrations List
- Overview of all integrations with status indicators
- Filter by status (All, Synced, Conflicts, Errors)
- Visual status badges showing:
  - Synced - Successfully synchronized
  - Syncing - Currently synchronizing
  - Conflict - Requires manual conflict resolution
  - Error - Synchronization failed

### 2. Integration Sync Detail
- Detailed integration information
- **Sync Now** button - triggers real API call to fetch sync data
- Preview of incoming changes before applying
- Status tracking and metadata display

### 3. Sync History & Versioning
- Complete history of sync events
- Version tracking for each sync
- Detailed statistics:
  - Changes applied
  - Conflicts resolved
  - User who performed the sync
  - Timestamp and status

### 4. Conflict Resolution
- Field-level conflict detection
- Side-by-side comparison of current (local) vs external values
- Three resolution options:
  - Keep current value
  - Accept external value
  - Enter custom value
- Clear visual indication of resolved conflicts
- Ability to apply all changes once conflicts are resolved

## Technology Stack

- **React 19** - UI framework
- **TypeScript 6** - Type safety
- **Vite 8** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Zustand** - State management
- **React Query (TanStack Query)** - Data fetching and caching
- **Framer Motion** - Animations
- **CSS3** - Styling with dark mode support

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── StatusBadge.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   ├── SyncPreview.tsx
│   ├── ConflictResolution.tsx
│   ├── SyncHistory.tsx
│   └── Toast.tsx
├── pages/              # Page-level components
│   ├── IntegrationsList.tsx
│   └── IntegrationDetail.tsx
├── services/           # API service layer
│   └── api.ts
├── hooks/              # Custom React hooks
│   ├── useSync.ts
│   ├── useSyncMutation.ts
│   └── useToast.ts
├── stores/             # Zustand state stores
│   ├── integrationStore.ts
│   └── syncStore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── format.ts
├── data/               # Mock data
│   └── mockData.ts
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## API Integration

The application integrates with the Portier Sync API:

**Endpoint:**
```
https://portier-takehometest.onrender.com/api/v1/data/sync?application_id={application_id}
```

**Supported Application IDs:**
- `salesforce`
- `hubspot`
- `stripe`
- `slack`
- `zendesk`
- `intercom`

**Error Handling:**
- 4xx errors - Client configuration issues
- 500 errors - Internal server errors
- 502/503/504 errors - Gateway/service unavailability

All errors are handled gracefully with user-friendly messages and retry options.

## Quick Start

### Using Docker (Easiest)

```bash
# Development with hot reload
docker-compose up dev
```

Visit `http://localhost:5173`

### Using npm

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker (optional, for containerized deployment)
- Docker Compose (optional, for easier Docker workflows)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Docker Deployment

The application is fully containerized and can be run with Docker. Two Dockerfiles are provided for different use cases.

### Which Docker Setup to Use?

| Use Case | Dockerfile | Port | Command |
|----------|-----------|------|---------|
| **Local Development** | `Dockerfile.dev` | 5173 | `docker-compose up dev` |
| **Production Deployment** | `Dockerfile` | 8080 | `docker-compose up prod` |

**Choose Development when:**
- You want to make code changes and see them instantly
- You're actively developing features
- You need access to full error messages and dev tools

**Choose Production when:**
- You want to test the final optimized build
- You're deploying to a server
- You want the smallest image size and best performance

### Development Docker (with Hot Reload)

For local development with hot reloading capabilities:

**Build development image:**
```bash
docker build -f Dockerfile.dev -t portier-dev .
```

**Run development container:**
```bash
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules portier-dev
```

The application will be available at `http://localhost:5173` with hot reload enabled.

**Notes:**
- The `-v $(pwd):/app` mount enables hot reloading of your local changes
- The `-v /app/node_modules` prevents overwriting the container's node_modules
- File changes are automatically reflected in the browser

### Production Docker (Optimized)

For production deployment with nginx:

**Build production image:**
```bash
docker build -t portier-sync-panel .
```

**Run production container:**
```bash
docker run -p 8080:80 portier-sync-panel
```

The application will be available at `http://localhost:8080`

**Production features:**
- Multi-stage build for minimal image size
- Nginx for efficient static file serving
- Optimized and minified assets

### Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose:

**Development mode:**
```bash
docker-compose up dev
```

**Production mode:**
```bash
docker-compose up prod
```

**Build and run (if changes were made):**
```bash
docker-compose up --build dev
```

**Stop containers:**
```bash
docker-compose down
```

### Quick Start Commands (Alternative)

**Development (one command):**
```bash
docker build -f Dockerfile.dev -t portier-dev . && docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules portier-dev
```

**Production (one command):**
```bash
docker build -t portier-sync-panel . && docker run -p 8080:80 portier-sync-panel
```

## Architecture Highlights

### Separation of Concerns

1. **Components Layer** - Presentational components with clear props interfaces
2. **Services Layer** - API communication abstracted into service classes
3. **Hooks Layer** - Business logic encapsulated in custom hooks
4. **Types Layer** - Comprehensive TypeScript types for type safety

### State Management

- **Zustand** for global state management (integrations and sync state)
- **React Query** for server state and caching
- Custom hooks (`useSyncMutation`, `useToast`) for business logic
- React Router for navigation state

### Error Handling

- Comprehensive error type system
- API errors mapped to user-friendly messages
- Retry mechanisms for failed operations
- Loading states for all async operations

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Consistent code style throughout
- Component-level CSS for maintainability
- Responsive design for mobile/tablet support

## Key Design Decisions

1. **Mock Data Strategy**: All integrations and history data are mocked except for the actual Sync Now API call, allowing the UI to function independently while demonstrating real API integration.

2. **Conflict Detection**: UPDATE operations are automatically flagged as conflicts requiring manual resolution, ensuring data integrity.

3. **Three-Option Resolution**: Users can keep current, accept new, or enter custom values for maximum flexibility.

4. **Progressive Disclosure**: Complex workflows are broken into stages (overview → preview → resolve → apply) for better UX.

5. **Dark Mode Support**: CSS variables enable automatic dark mode based on user system preferences.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project was created as part of a technical assessment for Portier.

---

## Development Notes

### Data Models

The application models three main entity types based on the specification:

- **User** - User accounts with roles and status
- **Door** - Physical access points with device status
- **Key** - Access permissions linking users to doors

### Future Enhancements

Potential areas for expansion:

- Real-time sync status via WebSockets
- Bulk conflict resolution
- Sync scheduling and automation
- Advanced filtering and search
- Export sync history to CSV/JSON
- Integration configuration management
- Webhook support for external notifications
