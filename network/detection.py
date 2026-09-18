from .models import NetworkMetric, Incident
from .sms import send_incident_alert


def analyze_metric(metric):
    problems = []

    if metric.latency > 200:
        problems.append("High latency")

    if metric.packet_loss > 10:
        problems.append("High packet loss")

    if metric.dropped_calls > 20:
        problems.append("High number of dropped calls")

    if metric.signal_strength < -100:
        problems.append("Weak signal strength")

    if not problems:
        return None

    if len(problems) >= 3:
        severity = "CRITICAL"
    elif len(problems) == 2:
        severity = "HIGH"
    else:
        severity = "MEDIUM"

    reason = ", ".join(problems)

    incident = Incident.objects.create(
        tower=metric.tower,
        severity=severity,
        reason=reason
    )

    if incident.severity == "CRITICAL":
        send_incident_alert(incident)
        incident.notification_sent = True
        incident.save()

    return incident