import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

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

function Network() {
  const [searchParams] = useSearchParams();

  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [metric, setMetric] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [incident, setIncident] = useState(null);

  const loadTowers = () => {
    fetch(`${API_URL}/api/towers/`)
      .then((response) => response.json())
      .then((data) => {
        setTowers(data);

        const towerFromUrl = searchParams.get("tower");

        if (towerFromUrl) {
  const tower = data.find(
    (item) => item.id === Number(towerFromUrl)
  );

  if (tower) {
    setSelectedTower(tower);
    return;
  }
}

if (selectedTower) {
  const updatedTower = data.find(
    (item) => item.id === selectedTower.id
  );

  if (updatedTower) {
    setSelectedTower(updatedTower);
    return;
  }
}

if (data.length > 0) {
  setSelectedTower(data[0]);
}

        if (data.length > 0 && !selectedTower) {
          setSelectedTower(data[0]);
        }
      })
      .catch((error) => {
        console.error("Error fetching towers:", error);
      });
  };

  const loadLatestMetric = (towerId) => {
   fetch(`${API_URL}/api/metrics/`)
      .then((response) => response.json())
      .then((data) => {
        const towerMetrics = data.filter(
          (item) => item.tower === towerId
        );

        setMetrics(towerMetrics.slice(-10));

        if (towerMetrics.length > 0) {
          setMetric(towerMetrics[towerMetrics.length - 1]);
        } else {
          setMetric(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching metrics:", error);
      });
  };

  useEffect(() => {
    loadTowers();
  }, []);

  useEffect(() => {
    if (selectedTower) {
      loadLatestMetric(selectedTower.id);
    }
  }, [selectedTower]);

  const generateData = () => {
    if (!selectedTower) {
      return;
    }

    fetch(
      `${API_URL}/api/towers/${selectedTower.id}/generate_data/`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then(() => {
        loadLatestMetric(selectedTower.id);
        loadTowers();
      })
      .catch((error) => {
        console.error("Error generating network data:", error);
      });
  };

  const simulateIncident = () => {
    if (!selectedTower) {
      return;
    }

    fetch(
      `${API_URL}/api/towers/${selectedTower.id}/simulate_incident/`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setIncident(data);
        loadLatestMetric(selectedTower.id);
        loadTowers();
      })
      .catch((error) => {
        console.error("Error simulating incident:", error);
      });
  };

  const restoreNetwork = () => {
    if (!selectedTower) {
      return;
    }

    fetch(
      `${API_URL}/api/towers/${selectedTower.id}/restore_network/`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then(() => {
        setIncident(null);
        loadLatestMetric(selectedTower.id);
        loadTowers();
      })
      .catch((error) => {
        console.error("Error restoring network:", error);
      });
  };

  const chartData = metrics.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    latency: item.latency,
  }));

  return (
    <div className="network-page">

      <div className="page-header">
        <div>
          <p className="section-label">NETWORK OPERATIONS</p>

          <h1>Network Monitoring</h1>

          <p>
            Monitor tower performance and investigate network anomalies.
          </p>
        </div>

        <div className="live-indicator">
          <span></span>
          LIVE MONITORING
        </div>
      </div>


      <section className="network-towers">

        <div className="section-heading">
          <div>
            <p className="section-label">SELECT SITE</p>
            <h2>Network Towers</h2>
          </div>
        </div>

        <div className="network-tower-buttons">

          {towers.map((tower) => (
            <button
              key={tower.id}
              className={
                selectedTower?.id === tower.id
                  ? "tower-button selected"
                  : "tower-button"
              }
              onClick={() => {
                setSelectedTower(tower);
                setIncident(null);
              }}
            >
              <strong>{tower.tower_code}</strong>
              <span>{tower.location}</span>
            </button>
          ))}

        </div>

      </section>


      {selectedTower && (

        <section className="selected-network">

          <div className="selected-network-header">

            <div>
              <p className="section-label">SELECTED TOWER</p>

              <h2>{selectedTower.tower_code}</h2>

              <p>{selectedTower.location}</p>
            </div>

            <div
              className={`tower-status ${
                selectedTower.status === "CRITICAL"
                  ? "tower-critical"
                  : "tower-healthy"
              }`}
            >
              <span></span>
              {selectedTower.status}
            </div>

          </div>


          <div className="network-metrics">

            <div className="network-metric">
              <p>LATENCY</p>

              <strong>
                {metric ? metric.latency.toFixed(1) : "--"}
              </strong>

              <span>ms</span>
            </div>


            <div className="network-metric">
              <p>PACKET LOSS</p>

              <strong>
                {metric ? metric.packet_loss.toFixed(1) : "--"}
              </strong>

              <span>%</span>
            </div>


            <div className="network-metric">
              <p>DROPPED CALLS</p>

              <strong>
                {metric ? metric.dropped_calls : "--"}
              </strong>

              <span>calls</span>
            </div>


            <div className="network-metric">
              <p>SIGNAL STRENGTH</p>

              <strong>
                {metric
                  ? metric.signal_strength.toFixed(1)
                  : "--"}
              </strong>

              <span>dBm</span>
            </div>

          </div>


          <div className="network-chart">

            <div className="section-heading">

              <div>
                <p className="section-label">PERFORMANCE</p>

                <h2>Latency Over Time</h2>
              </div>

              <span>Last 10 measurements</span>

            </div>


            <div className="chart-container">

              {chartData.length > 0 ? (

                <ResponsiveContainer width="100%" height={300}>

                  <LineChart data={chartData}>

                    <CartesianGrid stroke="#303842" />

                    <XAxis
                      dataKey="time"
                      stroke="#8f99a5"
                    />

                    <YAxis
                      stroke="#8f99a5"
                      unit=" ms"
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="latency"
                      stroke="#ffffff"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <p>
                  No network measurements available yet.
                  Generate network data to see the graph.
                </p>

              )}

            </div>

          </div>


          <div className="network-actions">

            <div>

              <p className="section-label">DEMO CONTROL</p>

              <h3>Test network response</h3>

              <p>
                Generate network history, simulate a network
                failure, and watch NetPulse detect the anomaly.
              </p>

            </div>


            <div className="action-buttons">

              <button onClick={generateData}>
                Generate Network Data
              </button>

              <button onClick={simulateIncident}>
                Simulate Network Incident
              </button>

              <button
                className="restore-button"
                onClick={restoreNetwork}
              >
                Restore Network
              </button>

            </div>

          </div>


          {incident && (

            <div className="network-incident">

              <div className="incident-header">

                <div>

                  <p className="section-label">
                    ACTIVE INCIDENT
                  </p>

                  <h2>Network anomaly detected</h2>

                </div>

                <div className="severity">
                  {incident.severity}
                </div>

              </div>


              <p className="reason">
                {incident.reason}
              </p>


              <div className="incident-info">

                <div>
                  <span>TOWER</span>
                  <strong>{incident.tower}</strong>
                </div>

                <div>
                  <span>INCIDENT ID</span>
                  <strong>#{incident.incident_id}</strong>
                </div>

              </div>

            </div>

          )}

        </section>

      )}

    </div>
  );
}

export default Network;



