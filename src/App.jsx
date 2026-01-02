import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "🏠" },
  { key: "itineraries", label: "Itineraries", icon: "🧾" },
  { key: "tsa", label: "TSAInfo", icon: "🕒" },
  { key: "directions", label: "Directions", icon: "🧭" },
];

const demoFlight = {
  airportName: "Logan International Airport",
  code: "BOS",
  flightNumber: "AA246",
  etaMinutes: 23,
  tsaWaitMinutes: 23,
  suggestedArrival: "6:00 PM",
  terminal: "B",
  gate: "B29",
};

const demoTsaSeries = [
  { t: "5:59", v: 12 },
  { t: "6:25", v: 20 },
  { t: "7:03", v: 8 },
  { t: "7:58", v: 32 },
  { t: "8:55", v: 18 },
  { t: "9:09", v: 4 },
  { t: "10:00", v: 28 },
  { t: "10:23", v: 19 },
];

function TopBar({ title }) {
  return (
    <div style={styles.topBar}>
      <button style={styles.iconBtn} aria-label="Back">
        ←
      </button>
      <div style={styles.topBarTitle}>{title}</div>
      <button style={styles.iconBtn} aria-label="Menu">
        ⋯
      </button>
    </div>
  );
}

function BottomNav({ active, onChange }) {
  return (
    <div style={styles.bottomNav}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            style={{
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            }}
            onClick={() => onChange(t.key)}
          >
            <div style={{ fontSize: 18 }}>{t.icon}</div>
            <div style={styles.navLabel}>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}

function Card({ children }) {
  return <div style={styles.card}>{children}</div>;
}

function LabelRow({ label, value }) {
  return (
    <div style={styles.rowBetween}>
      <div style={styles.muted}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

function AirportMapPanel() {
  const bos = [42.3656, -71.0096];
  const terminals = [
    { name: "Terminal A", pos: [42.3669, -71.0202] },
    { name: "Terminal B", pos: [42.3652, -71.0137] },
    { name: "Terminal C", pos: [42.366, -71.0056] },
    { name: "Terminal E", pos: [42.369, -71.0209] },
  ];

  return (
    <div style={styles.mapWrap}>
      <div style={styles.mapHeader}>
        <div style={styles.mapTitle}>
          {demoFlight.airportName} ({demoFlight.code})
        </div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          Map tiles: OpenStreetMap
        </div>
      </div>

      {/*  Mobile: shorter map height */}
      <div style={{ height: 320 }}>
        <MapContainer
          center={bos}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {terminals.map((t) => (
            <Marker key={t.name} position={t.pos}>
              <Popup>{t.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

function DashboardPage() {
  const data = useMemo(() => demoTsaSeries, []);

  return (
    <div style={styles.page}>
      <TopBar title={demoFlight.airportName} />

      <div style={styles.content}>
        {/* Mobile: 1-column layout */}
        <div style={styles.grid}>
          <div style={styles.leftCol}>
            <AirportMapPanel />
          </div>

          <div style={styles.rightCol}>
            <div style={{ padding: "0 2px" }}>
              <div style={styles.flightTitle}>Flight {demoFlight.flightNumber}</div>
              <div style={styles.subtle}>{demoFlight.etaMinutes} min</div>
            </div>

            <Card>
              <LabelRow
                label="Estimated TSA Wait Time (Demo)"
                value={`${demoFlight.tsaWaitMinutes} min`}
              />
              <div style={styles.divider} />
              <LabelRow
                label="Suggested Arrival Airport Time (Demo)"
                value={demoFlight.suggestedArrival}
              />
              <div style={styles.divider} />
              <LabelRow
                label="Terminal / Gate"
                value={`${demoFlight.terminal} / ${demoFlight.gate}`}
              />
              <div style={{ marginTop: 10, fontSize: 12, color: "#6B7280" }}>
                Prototype uses sample estimates; not an official TSA feed.
              </div>
            </Card>

            <Card>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span style={styles.dot} />
                <div style={{ fontWeight: 700 }}>
                  Estimated TSA Wait Time (Demo)
                </div>
              </div>

              {/* Avoid ResponsiveContainer: fixed-size chart inside scrollable area */}
              <div style={{ overflowX: "auto" }}>
                <LineChart width={360} height={220} data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={30} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" strokeWidth={3} dot={false} />
                </LineChart>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItinerariesPage() {
  const trips = [
    { id: 1, title: "BOS → DFW", date: "Mar 12, 2024", flight: "AA246", status: "On time" },
    { id: 2, title: "DFW → BOS", date: "Mar 17, 2024", flight: "AA112", status: "Check-in opens 24h" },
  ];

  return (
    <div style={styles.page}>
      <TopBar title="Itineraries" />
      <div style={styles.content}>
        <div style={{ display: "grid", gap: 12 }}>
          {trips.map((t) => (
            <Card key={t.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{t.title}</div>
                  <div style={styles.muted}>{t.date} • {t.flight}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{t.status}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function TSAInfoPage() {
  const checkpoints = [
    { name: "Terminal B – Main", wait: 23, open: true },
    { name: "Terminal A – North", wait: 18, open: true },
    { name: "Terminal C – South", wait: 35, open: true },
    { name: "Terminal E – Intl", wait: 12, open: true },
  ];

  return (
    <div style={styles.page}>
      <TopBar title="TSAInfo" />
      <div style={styles.content}>
        <Card>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Checkpoints (Demo)</div>
          <div style={{ display: "grid", gap: 10 }}>
            {checkpoints.map((c) => (
              <div key={c.name} style={styles.rowBetween}>
                <div>
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <div style={styles.muted}>{c.open ? "Open" : "Closed"}</div>
                </div>
                <div style={{ fontWeight: 800 }}>{c.wait} min</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#6B7280" }}>
            Prototype uses sample estimates; not an official TSA feed.
          </div>
        </Card>
      </div>
    </div>
  );
}

function DirectionsPage() {
  return (
    <div style={styles.page}>
      <TopBar title="Directions" />
      <div style={styles.content}>
        <Card>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>To Terminal B</div>
          <ol style={{ margin: 0, paddingLeft: 18, color: "#374151" }}>
            <li>Follow airport signs toward Departures.</li>
            <li>Keep right to Terminal B drop-off.</li>
            <li>Park at Central Parking or Terminal B garage.</li>
            <li>Walk to Checkpoint B (Main) for security.</li>
          </ol>
        </Card>

        <Card>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Quick Actions</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              style={styles.pill}
              href="https://www.google.com/maps/search/?api=1&query=Logan+International+Airport"
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
          <div style={{ marginTop: 10, color: "#6B7280", fontSize: 13 }}>
            (Some buttons can be wired up later.)
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("dashboard");

  let page = null;
  if (active === "dashboard") page = <DashboardPage />;
  if (active === "itineraries") page = <ItinerariesPage />;
  if (active === "tsa") page = <TSAInfoPage />;
  if (active === "directions") page = <DirectionsPage />;

  return (
    <div style={styles.shell}>
      <div style={styles.shellInner}>
        <div style={styles.pageWrap}>{page}</div>
        <BottomNav active={active} onChange={setActive} />
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#0B1220",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },

  shellInner: {
    width: "420px",
    maxWidth: "100%",
    height: "min(860px, calc(100vh - 36px))",
    background: "#F8FAFC",
    borderRadius: 22,
    overflow: "hidden",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    position: "relative",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  pageWrap: {
    height: "100%",
    overflowY: "auto",
    paddingBottom: 92,
    background: "#F8FAFC",
  },

  page: { minHeight: 640, background: "#F8FAFC" },

  topBar: {
    height: 62,
    background: "#4B5563",
    color: "#F9FAFB",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
  },
  topBarTitle: { fontWeight: 800, fontSize: 16, flex: 1, textAlign: "center" },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },

  content: { padding: 14 },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  leftCol: { minHeight: 0 },
  rightCol: { display: "grid", gap: 12, alignContent: "start" },

  mapWrap: {
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid #E5E7EB",
    background: "#fff",
  },
  mapHeader: {
    padding: "12px 14px",
    borderBottom: "1px solid #E5E7EB",
    background: "#F3F4F6",
  },
  mapTitle: { fontWeight: 800, color: "#111827" },

  flightTitle: { fontSize: 28, fontWeight: 900, color: "#111827", lineHeight: 1.1 },
  subtle: { color: "#6B7280", marginTop: 4 },

  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 18,
    padding: 14,
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
  },
  muted: { color: "#6B7280", fontSize: 13 },
  value: { fontWeight: 800, color: "#111827" },
  divider: { height: 1, background: "#E5E7EB", margin: "10px 0" },
  dot: { width: 10, height: 10, borderRadius: 999, background: "#111827", display: "inline-block" },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 82,
    background: "#F9FAFB",
    borderTop: "1px solid #E5E7EB",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
  },
  navItem: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    padding: 10,
    color: "#374151",
  },
  navItemActive: { color: "#111827", fontWeight: 900 },
  navLabel: { fontSize: 12, marginTop: 6 },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid #E5E7EB",
    background: "#fff",
    textDecoration: "none",
    color: "#111827",
    fontWeight: 700,
  },
};

