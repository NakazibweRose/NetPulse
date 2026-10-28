import { useEffect, useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  Users,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function getRecommendation(incident, reportCount) {
  const reason = incident.reason.toLowerCase();
  const actions = [];

  if (
    reason.includes("high latency") &&
    reason.includes("high packet loss")
  ) {
    actions.push(
      "Investigate the tower's backhaul connection and check for congestion or transport-link problems."
    );
  }

  if (
    reason.includes("dropped calls") &&
    reason.includes("weak signal strength")
  ) {
    actions.push(
      "Inspect radio equipment, antenna performance, coverage and tower power."
    );
  }

  if (reportCount >= 2) {
    actions.push(
      "Prioritize the affected area because multiple customer reports support the network anomaly."
    );
  }

  if (incident.severity === "CRITICAL") {
    actions.push(
      "Escalate the incident for immediate technical investigation."
    );
  }

  if (actions.length === 0) {
    actions.push(
      "Investigate the affected tower, verify network equipment and continue monitoring the network metrics."
    );
  }

  return actions;
}


function AIInsights() {
  const [incidents, setIncidents] = useState([]);
  const [reports, setReports] = useState([]);
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/incidents`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/api/reports`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/api/towers`).then((res) =>
        res.json()
      ),
    ])
      .then(([incidentData, reportData, towerData]) => {
        setIncidents(incidentData);
        setReports(reportData);
        setTowers(towerData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading AI insights:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading AI insights...</p>;
  }

  // Match each tower ID with its tower information
  const towerLookup = {};

  towers.forEach((tower) => {
    towerLookup[tower.id] = tower;
  });

  // Keep only the latest incident for each tower
  const latestIncidents = {};

  incidents.forEach((incident) => {
    const towerId = incident.tower;

    if (
      !latestIncidents[towerId] ||
      new Date(incident.created_at) >
        new Date(latestIncidents[towerId].created_at)
    ) {
      latestIncidents[towerId] = incident;
    }
  });

  const currentIncidents = Object.values(latestIncidents);

  const criticalIncidents = currentIncidents.filter(
    (incident) => incident.severity === "CRITICAL"
  );

  const openIncidents = currentIncidents.filter(
    (incident) => incident.status === "OPEN"
  );

  return (
    <div className="ai-page">

      {/* Page Header */}
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-header-icon">
            <Sparkles size={19} />
          </div>

          <div>
            <h1>AI Insights</h1>
            <p>
              Network intelligence and operational recommendations
            </p>
          </div>
        </div>

        <div className="ai-status">
          <span className="ai-status-dot"></span>
          AI MONITORING ACTIVE
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Network Towers</h3>
          <strong>{towers.length}</strong>
        </div>

        <div className="stat-card">
          <h3>Active Incidents</h3>
          <strong>{openIncidents.length}</strong>
        </div>

        <div className="stat-card">
          <h3>Critical Towers</h3>
          <strong>{criticalIncidents.length}</strong>
        </div>

        <div className="stat-card">
          <h3>Customer Reports</h3>
          <strong>{reports.length}</strong>
        </div>

      </div>

      {/* Network Analysis */}
      <section className="insight-section">

        <div className="ai-section-heading">
          <Sparkles size={16} />
          <div>
            <h2>Current Network Analysis</h2>
            <p>
              AI-assisted analysis of active network conditions
            </p>
          </div>
        </div>

        {currentIncidents.length === 0 ? (
          <div className="empty-state">
            <Sparkles size={20} />
            <p>
              No network incidents detected. NetPulse is monitoring
              the network.
            </p>
          </div>
        ) : (
          <div className="insight-list">

            {currentIncidents.map((incident) => {
               const tower = towerLookup[incident.tower];

  const towerReports = reports.filter(
    (report) => report.tower === incident.tower
  );

  const observations = getAIInterpretation(
    incident,
    towerReports.length
  );

  const recommendations = getRecommendation(
    incident,
    towerReports.length
  );

  return (
                <div className="insight-card" key={incident.id}>

                  {/* Incident Header */}
                  <div className="ai-card-header">

                    <div className="ai-card-location">
                      <AlertTriangle size={16} />

                      <div>
                        <h3>
                          {tower
                            ? tower.tower_code
                            : `Tower ${incident.tower}`}
                        </h3>

                        <span>
                          {tower
                            ? tower.location
                            : "Unknown location"}
                        </span>
                      </div>
                    </div>

                    <span className="ai-severity">
                      {incident.severity}
                    </span>

                  </div>

                  {/* Incident Details */}
                  <div className="ai-analysis-block">

                    <div className="ai-info-block">
                      <div className="ai-info-block-label">
                        Customer Reports
                      </div>

                      <div className="ai-info-block-value">
                        {towerReports.length}{" "}
                        {towerReports.length === 1
                          ? "report"
                          : "reports"}
                      </div>
                    </div>

                    <div className="ai-info-block">
                      <div className="ai-info-block-label">
                        Incident Status
                      </div>

                      <div className="ai-info-block-value">
                        {incident.status}
                      </div>
                    </div>

                  </div>

                  {/* Detected Problems */}
                  <div className="ai-info-block ai-problems">
                    <div className="ai-info-block-label">
                      Detected Network Problems
                    </div>

                    <div className="ai-info-block-value">
                      {incident.reason}
                    </div>
                  </div>

                  {/* AI Interpretation */}
                 <div className="ai-recommendation">
  <div className="ai-recommendation-label">
    AI-Assisted Interpretation
  </div>

  <ul>
    {observations.map((observation, index) => (
      <li key={index}>{observation}</li>
    ))}
  </ul>
</div>

                  {/* Operator Action */}
                  <div className="ai-recommendation">
  <div className="ai-recommendation-label">
    Recommended Operator Action
  </div>

  <ul>
    {recommendations.map((recommendation, index) => (
      <li key={index}>{recommendation}</li>
    ))}
  </ul>
</div>
                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* Customer Correlation */}
      <section className="insight-section">

        <div className="ai-section-heading">
          <Users size={16} />

          <div>
            <h2>Customer Signal Correlation</h2>
            <p>
              Customer reports supporting network anomaly detection
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">
            <Users size={20} />
            <p>
              No customer reports have been received.
            </p>
          </div>
        ) : (
          <div className="customer-correlation">

            <strong>{reports.length}</strong>

            <div>
              <h3>Customer reports received</h3>
              <p>
                These reports provide additional evidence that can
                be correlated with network anomalies.
              </p>
            </div>

          </div>
        )}

      </section>

    </div>
  );
}

export default AIInsights;

function getAIInterpretation(incident, reportCount) {
  const reason = incident.reason.toLowerCase();
  const observations = [];

  if (reason.includes("high latency")) {
    observations.push(
      "High latency indicates that network responses are taking longer than expected."
    );
  }

  if (reason.includes("high packet loss")) {
    observations.push(
      "High packet loss indicates unstable data transmission and may affect internet reliability."
    );
  }

  if (reason.includes("dropped calls")) {
    observations.push(
      "The increase in dropped calls suggests degraded voice-service performance."
    );
  }

  if (reason.includes("weak signal strength")) {
    observations.push(
      "Weak signal strength may indicate a radio coverage, antenna, or equipment issue."
    );
  }

  if (reportCount >= 2) {
    observations.push(
      `Customer reports from the same tower provide additional evidence that users are experiencing the problem.`
    );
  }

  return observations;
}





