import random

from .models import Tower, NetworkMetric
from .detection import analyze_metric


def generate_metric(tower):
    latency = random.uniform(30, 80)
    packet_loss = random.uniform(0, 3)
    dropped_calls = random.randint(0, 5)
    signal_strength = random.uniform(-80, -60)

    metric = NetworkMetric.objects.create(
        tower=tower,
        latency=latency,
        packet_loss=packet_loss,
        dropped_calls=dropped_calls,
        signal_strength=signal_strength,
    )

    analyze_metric(metric)

    return metric


def simulate_incident(tower, severity="CRITICAL"):
    if severity == "HIGH":
        latency = 230
        packet_loss = 12
        dropped_calls = 8
        signal_strength = -80
    else:
        latency = 240
        packet_loss = 18.4
        dropped_calls = 27
        signal_strength = -105

    metric = NetworkMetric.objects.create(
        tower=tower,
        latency=latency,
        packet_loss=packet_loss,
        dropped_calls=dropped_calls,
        signal_strength=signal_strength,
    )

    incident = analyze_metric(metric)

    if incident:
        if incident.severity == "CRITICAL":
            tower.status = "CRITICAL"
        elif incident.severity == "HIGH":
            tower.status = "WARNING"
        else:
            tower.status = "WARNING"

        tower.save()

        return metric, incident

def restore_network(tower):
    latency = random.uniform(30, 80)
    packet_loss = random.uniform(0, 3)
    dropped_calls = random.randint(0, 5)
    signal_strength = random.uniform(-80, -60)

    metric = NetworkMetric.objects.create(
        tower=tower,
        latency=latency,
        packet_loss=packet_loss,
        dropped_calls=dropped_calls,
        signal_strength=signal_strength,
    )

    tower.status = "HEALTHY"
    tower.save()

    return metric