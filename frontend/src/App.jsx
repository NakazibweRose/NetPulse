import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Users,
  Sparkles,
  Settings,
} from "lucide-react";

import Overview from "./pages/Overview";
import Network from "./pages/Network";
import Incidents from "./pages/Incidents";
import Customers from "./pages/Customers";
import AIInsights from "./pages/AIInsights";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">

        <aside className="sidebar">
          <div className="logo">
            NETPULSE
            <span>Turning network signals into action.</span>
          </div>

          <nav>
            <NavLink to="/">
              <LayoutDashboard size={16} />
              <span>Overview</span>
            </NavLink>

            <NavLink to="/network">
              <Activity size={16} />
              <span>Network</span>
            </NavLink>

            <NavLink to="/incidents">
              <AlertTriangle size={16} />
              <span>Incidents</span>
            </NavLink>

            <NavLink to="/customers">
              <Users size={16} />
              <span>Customers</span>
            </NavLink>

            <NavLink to="/ai-insights">
              <Sparkles size={16} />
              <span>AI Insights</span>
            </NavLink>
          </nav>

          <div className="sidebar-bottom">
            <Settings size={15} />
            <span>Settings</span>
          </div>
        </aside>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/network" element={<Network />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/ai-insights" element={<AIInsights />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;