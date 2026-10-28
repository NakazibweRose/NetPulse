import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadIncidents = () => {
    fetch(`${API_URL}/api/incidents`)
      .then((response) => response.json())
      .then((data) => {
        setIncidents(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching incidents:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const deleteIncident = (incidentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this incident?"
    );

    if (!confirmed) {
      return;
    }

    fetch(`${API_URL}/api/incidents/${incidentId}/`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete incident");
        }

        setIncidents((currentIncidents) =>
          currentIncidents.filter(
            (incident) => incident.id !== incidentId
          )
        );
      })
      .catch((error) => {
        console.error("Error deleting incident:", error);
      });
  };

  const getSeverityClass = (severity) => {
    if (severity === "CRITICAL") {
      return "incident-critical";
    }

    if (severity === "HIGH") {
      return "incident-high";
    }

    if (severity === "MEDIUM") {
      return "incident-medium";
    }

    return "incident-low";
  };

  if (loading) {
    return (
      <div className="incidents-page">
        <p>Loading incidents...</p>
      </div>
    );
  }

  return (
    <div className="incidents-page">

      <div className="page-header">
        <div>
          <p className="section-label">NETWORK OPERATIONS</p>

          <h1>Incidents</h1>

          <p>
            Monitor network incidents detected across the network.
          </p>
        </div>

        <div className="live-indicator">
          <span></span>
          LIVE MONITORING
        </div>
      </div>

      <section className="incident-summary">

        <div className="stat-card">
          <p>TOTAL INCIDENTS</p>
          <strong>{incidents.length}</strong>
          <span>Detected incidents</span>
        </div>

        <div className="stat-card">
          <p>CRITICAL</p>
          <strong>
            {
              incidents.filter(
                (incident) => incident.severity === "CRITICAL"
              ).length
            }
          </strong>
          <span>Require immediate attention</span>
        </div>

        <div className="stat-card">
          <p>HIGH</p>
          <strong>
            {
              incidents.filter(
                (incident) => incident.severity === "HIGH"
              ).length
            }
          </strong>
          <span>Require investigation</span>
        </div>

        <div className="stat-card">
          <p>OPEN</p>
          <strong>
            {
              incidents.filter(
                (incident) => incident.status === "OPEN"
              ).length
            }
          </strong>
          <span>Active incidents</span>
        </div>

      </section>

      <section className="incident-list">

        <div className="section-heading">
          <div>
            <p className="section-label">INCIDENT LOG</p>
            <h2>Network Incidents</h2>
          </div>

          <span>{incidents.length} incidents</span>
        </div>

        {incidents.length === 0 ? (
          <div className="empty-state">
            <h3>No incidents detected</h3>

            <p>
              NetPulse is currently monitoring the network.
            </p>
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              className="incident-row"
              key={incident.id}
            >

              <div className="incident-main">

                <div className="incident-title">
                  <strong>
                    {incident.tower_code ||
                      `Tower ${incident.tower}`}
                  </strong>

                  <span
                    className={`incident-severity ${getSeverityClass(
                      incident.severity
                    )}`}
                  >
                    {incident.severity}
                  </span>
                </div>

                <p className="incident-location">
                  {incident.tower_location ||
                    "Unknown location"}
                </p>

                <p className="incident-reason">
                  {incident.reason}
                </p>

              </div>

              <div className="incident-details">

                <div>
                  <span>STATUS</span>

                  <strong>
                    {incident.status}
                  </strong>
                </div>

                <div>
                  <span>INCIDENT ID</span>

                  <strong>
                    #{incident.id}
                  </strong>
                </div>

                <div>
                  <span>TIME</span>

                  <strong>
                    {new Date(
                      incident.created_at
                    ).toLocaleString()}
                  </strong>
                </div>

                <button
                  className="delete-report-button"
                  onClick={() =>
                    deleteIncident(incident.id)
                  }
                >
                  Delete
                </button>

              </div>

            </div>
          ))
        )}

      </section>

    </div>
  );
}

export default Incidents;



