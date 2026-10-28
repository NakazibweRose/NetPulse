import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Users,
  Sparkles,
  Zap,
  RefreshCw,
  Radio,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

function Overview() {
  const navigate = useNavigate();

  const [towers, setTowers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    Promise.all([
      fetch(`${API_URL}/api/towers`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/api/incidents`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/api/reports`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/api/metrics`).then((res) =>
        res.json()
      ),
    ])
      .then(([towerData, incidentData, reportData, metricData]) => {
        setTowers(towerData);
        setIncidents(incidentData);
        setReports(reportData);
        setMetrics(metricData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Activity size={20} />
        Loading network dashboard...
      </div>
    );
  }

  /* -----------------------------
     Network statistics
  ----------------------------- */

  const healthyTowers = towers.filter(
    (tower) => tower.status === "HEALTHY"
  );

  const warningTowers = towers.filter(
    (tower) => tower.status === "WARNING"
  );

  const criticalTowers = towers.filter(
    (tower) => tower.status === "CRITICAL"
  );

  const activeIncidents = incidents.filter(
    (incident) => incident.status !== "RESOLVED"
  );

  /*
    Calculate a simple operational health score.

    Healthy tower = 100
    Warning tower = 60
    Critical tower = 20
  */

  let healthScore = 0;

  if (towers.length > 0) {
    const totalScore =
      healthyTowers.length * 100 +
      warningTowers.length * 60 +
      criticalTowers.length * 20;

    healthScore = Math.round(totalScore / towers.length);
  }

  /* -----------------------------
     Health trend
  ----------------------------- */

  const recentMetrics = [...metrics]
    .sort(
      (a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    )
    .slice(-10);

  const healthTrend = recentMetrics.map((metric, index) => {
    let score = 100;

    if (metric.latency > 200) {
      score -= 25;
    }

    if (metric.packet_loss > 10) {
      score -= 25;
    }

    if (metric.dropped_calls > 20) {
      score -= 25;
    }

    if (metric.signal_strength < -100) {
      score -= 25;
    }

    return {
      name: `M${index + 1}`,
      health: Math.max(score, 0),
    };
  });

  /* -----------------------------
     Customer signal
  ----------------------------- */

  const noNetworkReports = reports.filter(
    (report) => report.problem_type === "NO_NETWORK"
  ).length;

  const slowInternetReports = reports.filter(
    (report) => report.problem_type === "SLOW_INTERNET"
  ).length;

  const droppedCallReports = reports.filter(
    (report) => report.problem_type === "DROPPED_CALLS"
  ).length;

  const smsReports = reports.filter(
    (report) => report.problem_type === "SMS_PROBLEM"
  ).length;

  /* -----------------------------
     Recent incidents
  ----------------------------- */

  const recentIncidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    )
    .slice(0, 4);

  const getTower = (towerId) =>
    towers.find((tower) => tower.id === towerId);

  /* -----------------------------
     Quick actions
  ----------------------------- */

  const simulateIncident = async () => {
    const tower =
      towers.find((item) => item.status === "HEALTHY") ||
      towers[0];

    if (!tower) return;

    setActionLoading(true);

    try {
      await fetch(
        `${API_URL}/api/towers/${tower.id}/simulate_incident/`,
        {
          method: "POST",
        }
      );

      await loadDashboardData();
    } catch (error) {
      console.error("Error simulating incident:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const generateData = async () => {
    const tower = towers[0];

    if (!tower) return;

    setActionLoading(true);

    try {
      await fetch(
        `${API_URL}/api/towers/${tower.id}/generate_data/`,
        {
          method: "POST",
        }
      );

      await loadDashboardData();
    } catch (error) {
      console.error("Error generating data:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const restoreNetwork = async () => {
    const tower =
      towers.find((item) => item.status === "CRITICAL") ||
      towers.find((item) => item.status === "WARNING");

    if (!tower) return;

    setActionLoading(true);

    try {
      await fetch(
        `${API_URL}/api/towers/${tower.id}/restore_network/`,
        {
          method: "POST",
        }
      );

      await loadDashboardData();
    } catch (error) {
      console.error("Error restoring network:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="overview-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <p className="section-label">
            NETWORK OPERATIONS
          </p>

          <h1>Network Command Center</h1>

          <p>
            Real-time visibility into network health,
            incidents and customer signals.
          </p>
        </div>

        <div className="live-indicator">
          <span></span>
          LIVE MONITORING
        </div>

      </div>


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <section className="overview-stats">

        <div className="stat-card health-stat">
          <div className="stat-icon">
            <Activity size={18} />
          </div>

          <p>NETWORK HEALTH</p>

          <strong>{healthScore}%</strong>

          <span>
            {healthyTowers.length} of {towers.length} towers
            healthy
          </span>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            <Radio size={18} />
          </div>

          <p>NETWORK TOWERS</p>

          <strong>{towers.length}</strong>

          <span>
            {warningTowers.length} warning ·{" "}
            {criticalTowers.length} critical
          </span>
        </div>


        <div
          className="stat-card clickable"
          onClick={() => navigate("/incidents")}
        >
          <div className="stat-icon">
            <AlertTriangle size={18} />
          </div>

          <p>ACTIVE INCIDENTS</p>

          <strong>{activeIncidents.length}</strong>

          <span>Currently requiring attention</span>
        </div>


        <div
          className="stat-card clickable"
          onClick={() => navigate("/customers")}
        >
          <div className="stat-icon">
            <Users size={18} />
          </div>

          <p>CUSTOMER SIGNAL</p>

          <strong>{reports.length}</strong>

          <span>Reports received</span>
        </div>

      </section>


      {/* =========================
          MAIN MONITORING AREA
      ========================= */}

      <section className="dashboard-grid">

        {/* HEALTH TREND */}

        <div className="dashboard-panel health-chart-panel">

          <div className="panel-header">

            <div>
              <p className="section-label">
                NETWORK PERFORMANCE
              </p>

              <h2>Health Trend</h2>
            </div>

            <span className="panel-live">
              <span></span>
              LIVE
            </span>

          </div>

          <div className="health-chart">

            {healthTrend.length === 0 ? (
              <div className="chart-empty">
                <Activity size={24} />
                <p>No network metrics available yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={healthTrend}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#23434b"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#71969b"
                    fontSize={12}
                  />

                  <YAxis
                    domain={[0, 100]}
                    stroke="#71969b"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="health"
                    stroke="#72b7b2"
                    strokeWidth={3}
                    dot={false}
                  />

                </LineChart>
              </ResponsiveContainer>
            )}

          </div>

        </div>


        {/* LIVE TOWERS */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <p className="section-label">
                INFRASTRUCTURE
              </p>

              <h2>Live Network Status</h2>
            </div>

            <span>{towers.length} sites</span>

          </div>

          <div className="live-tower-list">

            {towers.map((tower) => (

              <div
                className="live-tower"
                key={tower.id}
                onClick={() =>
                  navigate(`/network?tower=${tower.id}`)
                }
              >

                <div className="tower-info">

                  <div className="tower-status-icon">
                    {tower.status === "CRITICAL" ? (
                      <AlertTriangle size={16} />
                    ) : tower.status === "WARNING" ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                  </div>

                  <div>
                    <strong>{tower.tower_code}</strong>
                    <span>{tower.location}</span>
                  </div>

                </div>

                <div
                  className={`tower-status ${
                    tower.status === "CRITICAL"
                      ? "tower-critical"
                      : tower.status === "WARNING"
                      ? "tower-warning"
                      : "tower-healthy"
                  }`}
                >
                  <span></span>
                  {tower.status}
                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =========================
          INCIDENTS + CUSTOMER SIGNAL
      ========================= */}

      <section className="dashboard-grid">

        {/* ACTIVE INCIDENTS */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <p className="section-label">
                RESPONSE
              </p>

              <h2>Active Incidents</h2>
            </div>

            <button
              className="panel-link"
              onClick={() => navigate("/incidents")}
            >
              View all
            </button>

          </div>

          {recentIncidents.length === 0 ? (
            <div className="chart-empty">
              <CheckCircle size={24} />
              <p>No incidents detected.</p>
            </div>
          ) : (
            <div className="incident-list">

              {recentIncidents.map((incident) => {

                const tower = getTower(incident.tower);

                return (
                  <div
                    className="dashboard-incident"
                    key={incident.id}
                  >

                    <div className="incident-icon">
                      <AlertTriangle size={16} />
                    </div>

                    <div className="incident-content">

                      <div>
                        <strong>
                          {tower
                            ? tower.tower_code
                            : `Tower ${incident.tower}`}
                        </strong>

                        <span>
                          {tower
                            ? tower.location
                            : "Unknown location"}
                        </span>
                      </div>

                      <p>{incident.reason}</p>

                    </div>

                    <span
                      className={`incident-severity severity-${incident.severity.toLowerCase()}`}
                    >
                      {incident.severity}
                    </span>

                  </div>
                );

              })}

            </div>
          )}

        </div>


        {/* CUSTOMER SIGNAL */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <p className="section-label">
                CUSTOMER SIGNAL
              </p>

              <h2>Reported Problems</h2>
            </div>

            <button
              className="panel-link"
              onClick={() => navigate("/customers")}
            >
              View all
            </button>

          </div>

          <div className="customer-signals">

            <div className="signal-row">

              <div>
                <span>No Network</span>
                <strong>{noNetworkReports}</strong>
              </div>

              <div className="signal-bar">
                <span
                  style={{
                    width: `${
                      reports.length
                        ? (noNetworkReports / reports.length) * 100
                        : 0
                    }%`,
                  }}
                ></span>
              </div>

            </div>


            <div className="signal-row">

              <div>
                <span>Slow Internet</span>
                <strong>{slowInternetReports}</strong>
              </div>

              <div className="signal-bar">
                <span
                  style={{
                    width: `${
                      reports.length
                        ? (slowInternetReports / reports.length) * 100
                        : 0
                    }%`,
                  }}
                ></span>
              </div>

            </div>


            <div className="signal-row">

              <div>
                <span>Dropped Calls</span>
                <strong>{droppedCallReports}</strong>
              </div>

              <div className="signal-bar">
                <span
                  style={{
                    width: `${
                      reports.length
                        ? (droppedCallReports / reports.length) * 100
                        : 0
                    }%`,
                  }}
                ></span>
              </div>

            </div>


            <div className="signal-row">

              <div>
                <span>SMS Problem</span>
                <strong>{smsReports}</strong>
              </div>

              <div className="signal-bar">
                <span
                  style={{
                    width: `${
                      reports.length
                        ? (smsReports / reports.length) * 100
                        : 0
                    }%`,
                  }}
                ></span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          AI + RECENT ACTIVITY
      ========================= */}

      <section className="dashboard-grid">

        {/* AI DETECTION */}

        <div className="dashboard-panel ai-detection-panel">

          <div className="panel-header">

            <div className="ai-panel-title">

              <div className="ai-small-icon">
                <Sparkles size={16} />
              </div>

              <div>
                <p className="section-label">
                  INTELLIGENCE
                </p>

                <h2>AI Detection</h2>
              </div>

            </div>

            <span className="ai-active">
              ACTIVE
            </span>

          </div>

          {criticalTowers.length > 0 ? (

            <div className="ai-alert">

              <div className="ai-alert-icon">
                <AlertTriangle size={20} />
              </div>

              <div>
                <strong>
                  Network anomaly detected
                </strong>

                <p>
                  {criticalTowers.length} tower
                  {criticalTowers.length !== 1
                    ? "s are"
                    : " is"}{" "}
                  currently showing critical network
                  conditions.
                </p>

                <button
                  onClick={() => navigate("/ai-insights")}
                >
                  View AI Insights →
                </button>
              </div>

            </div>

          ) : (

            <div className="ai-alert ai-alert-healthy">

              <div className="ai-alert-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <strong>
                  Network operating normally
                </strong>

                <p>
                  NetPulse is monitoring network
                  indicators for abnormal behaviour.
                </p>
              </div>

            </div>

          )}

        </div>


        {/* RECENT ACTIVITY */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <p className="section-label">
                ACTIVITY
              </p>

              <h2>Recent Events</h2>
            </div>

          </div>

          {recentIncidents.length === 0 ? (

            <div className="chart-empty">
              <Activity size={24} />
              <p>No recent network events.</p>
            </div>

          ) : (

            <div className="activity-list">

              {recentIncidents.map((incident) => {

                const tower = getTower(incident.tower);

                return (
                  <div
                    className="activity-item"
                    key={incident.id}
                  >

                    <div className="activity-dot"></div>

                    <div>

                      <strong>
                        {incident.severity} incident detected
                      </strong>

                      <p>
                        {tower
                          ? tower.tower_code
                          : `Tower ${incident.tower}`}
                        {" · "}
                        {tower
                          ? tower.location
                          : "Unknown location"}
                      </p>

                    </div>

                  </div>
                );

              })}

            </div>

          )}

        </div>

      </section>


      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <section className="quick-actions">

        <div>
          <p className="section-label">
            OPERATIONS
          </p>

          <h2>Quick Actions</h2>

          <p>
            Test and control network events from the
            command center.
          </p>
        </div>

        <div className="quick-action-buttons">

          <button
            onClick={simulateIncident}
            disabled={actionLoading}
          >
            <AlertTriangle size={17} />
            Simulate Incident
          </button>

          <button
            onClick={generateData}
            disabled={actionLoading}
          >
            <Zap size={17} />
            Generate Data
          </button>

          <button
            onClick={restoreNetwork}
            disabled={actionLoading}
          >
            <RefreshCw size={17} />
            Restore Network
          </button>

        </div>

      </section>

    </div>
  );
}

export default Overview;



