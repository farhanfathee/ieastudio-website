# IEA Studio Website

Official website for **IEA Studio** — a Creative Technology Studio.

**Live site:** [helloieastudio.com](http://helloieastudio.com/)

## Tech Stack

- **React 18** with React Router v6
- **Vite** — fast dev server and build tool
- **Three.js** — 3D ballpit physics animation
- **Spline** — 3D interactive elements
- Deployed on **Vercel**

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
git clone https://github.com/farhanfathee/ieastudio-website.git
cd ieastudio-website
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173)

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/    # Reusable components (Navbar, Footer, Ballpit, etc.)
├── hooks/         # Custom React hooks
├── pages/         # Route pages (Home, Services, Project, Contact)
├── App.jsx        # Root component with routing
└── main.jsx       # Entry point
public/
├── logos/         # Client logos
├── models/        # 3D models (.glb)
└── videos/        # Project videos
```

## Deployment

The site is deployed on **Vercel** and auto-deploys on push to the `main` branch. SPA routing is handled via `vercel.json` rewrites.
