# LiveFlight | Professional Air Traffic Radar

LiveFlight is a high-performance, premium flight tracking dashboard built with Next.js 15. It provides real-time situational awareness for air traffic worldwide, utilizing a high-precision, keyless architecture.

![LiveFlight Demo](public/demo-placeholder.png)

## 🚀 Key Features

- **Live Global Radar:** Real-time ADS-B flight tracking with sub-30s latency.
- **Kinematic Trajectory Projection:** Advanced mathematical modeling to project future flight paths for 30 minutes based on current velocity and heading.
- **Mission Intelligence:** Instant identification of flight origin, destination, and radar-verified ETA.
- **Meteorological Overlay:** Live precipitation radar integration (RainViewer) to visualize weather impacts on flight routes.
- **Target Isolation Mode:** Search for specific flights or aircraft (ICAO24/Callsign) to focus exclusively on their mission.
- **Premium Glassmorphism UI:** A sophisticated, high-density dashboard aesthetic designed for professionals and luxury enthusiasts.

## 🛠 Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Mapping:** [Leaflet](https://leafletjs.com/) with [React-Leaflet](https://react-leaflet.js.org/)
- **Tiles:** [CartoDB Dark Matter](https://carto.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **API Architecture:** Robust Next.js Proxy system for keyless, CORS-free data fetching.

## 📡 Intelligence Sources

LiveFlight utilizes a multi-source intelligence network to aggregate data without requiring individual API keys:
- **OpenSky Network:** Live state vectors and flight telemetry.
- **ADSBDB:** Global flight route and airline schedules.
- **HexDB.io / ADSB.lol:** Aircraft metadata and operator databases.
- **RainViewer:** Meteorological radar data.

## 🏁 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/liveflight.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚖️ License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built for the future of professional air traffic monitoring.*
