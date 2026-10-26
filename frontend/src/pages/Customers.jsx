import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Customers() {
  const [reports, setReports] = useState([]);

  const loadReports = () => {
    fetch("${API_URL}/api/reports/")
      .then((response) => response.json())
      .then((data) => {
        setReports(data);
      })
      .catch((error) => {
        console.error("Error fetching customer reports:", error);
      });
  };

  useEffect(() => {
    loadReports();
  }, []);

  const deleteReport = (reportId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer report?"
    );

    if (!confirmed) {
      return;
    }

    fetch(`${API_URL}/api/reports/${reportId}/`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete report");
        }

        setReports((currentReports) =>
          currentReports.filter((report) => report.id !== reportId)
        );
      })
      .catch((error) => {
        console.error("Error deleting customer report:", error);
      });
  };

  const noNetwork = reports.filter(
    (report) => report.problem_type === "NO_NETWORK"
  );

  const slowInternet = reports.filter(
    (report) => report.problem_type === "SLOW_INTERNET"
  );

  const droppedCalls = reports.filter(
    (report) => report.problem_type === "DROPPED_CALLS"
  );

  const smsProblems = reports.filter(
    (report) => report.problem_type === "SMS_PROBLEM"
  );

  const getProblemLabel = (problemType) => {
    const labels = {
      NO_NETWORK: "No Network",
      SLOW_INTERNET: "Slow Internet",
      DROPPED_CALLS: "Calls Dropping",
      SMS_PROBLEM: "SMS Problem",
    };

    return labels[problemType] || problemType;
  };

  return (
    <div className="customers-page">

      {/* PAGE HEADER */}
      <div className="page-header">

        <div>
          <p className="section-label">CUSTOMER SIGNALS</p>

          <h1>Customer Reports</h1>

          <p>
            Monitor network problems reported by customers
            through USSD and SMS.
          </p>
        </div>

        <div className="live-indicator">
          <span></span>
          LIVE MONITORING
        </div>

      </div>


      {/* SUMMARY CARDS */}
      <section className="customer-summary">

        <div className="stat-card">
          <p>TOTAL REPORTS</p>
          <strong>{reports.length}</strong>
          <span>Customer signals received</span>
        </div>

        <div className="stat-card">
          <p>NO NETWORK</p>
          <strong>{noNetwork.length}</strong>
          <span>Customers without service</span>
        </div>

        <div className="stat-card">
          <p>SLOW INTERNET</p>
          <strong>{slowInternet.length}</strong>
          <span>Internet complaints</span>
        </div>

        <div className="stat-card">
          <p>DROPPED CALLS</p>
          <strong>{droppedCalls.length}</strong>
          <span>Call complaints</span>
        </div>

      </section>


      {/* CUSTOMER REPORTS */}
      <section className="customer-reports">

        <div className="section-heading">

          <div>
            <p className="section-label">CUSTOMER SIGNALS</p>
            <h2>Recent Reports</h2>
          </div>

          <span>{reports.length} reports</span>

        </div>


        {reports.length === 0 ? (

          <div className="empty-state">

            <h3>No customer reports</h3>

            <p>
              Customer reports received through USSD or SMS
              will appear here.
            </p>

          </div>

        ) : (

          reports.map((report) => (

            <div
              className="customer-report-row"
              key={report.id}
            >

              {/* TOWER + PROBLEM */}
              <div className="customer-report-main">

                <div>
                  <strong>
                    {report.tower_code || `Tower ${report.tower}`}
                  </strong>

                  {report.tower_location && (
                    <span className="customer-report-location">
                      {report.tower_location}
                    </span>
                  )}
                </div>

                <span className="problem-type">
                  {getProblemLabel(report.problem_type)}
                </span>

              </div>


              {/* REPORT DETAILS */}
              <div className="customer-report-details">

                <div>
                  <span>PHONE</span>
                  <strong>{report.phone_number}</strong>
                </div>

                <div>
                  <span>REPORT ID</span>
                  <strong>#{report.id}</strong>
                </div>

                <button
                  className="delete-report-button"
                  onClick={() => deleteReport(report.id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))

        )}

      </section>


      {/* CUSTOMER CHANNEL */}
      <section className="customer-channel">

        <div>

          <p className="section-label">CUSTOMER CHANNEL</p>

          <h2>Report a network problem</h2>

          <p>
            Customers can report network problems using a
            simple USSD menu without needing internet access.
          </p>

        </div>


        {/* USSD PREVIEW */}
        <div className="ussd-preview">

          <div className="ussd-header">
            NETPULSE
          </div>

          <p>Welcome to NetPulse</p>

          <p>1. Report Problem</p>
          <p>2. Check Network</p>
          <p>3. Help</p>

        </div>

      </section>

    </div>
  );
}

export default Customers;
