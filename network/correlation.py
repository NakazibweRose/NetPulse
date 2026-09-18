from datetime import timedelta

from django.utils import timezone

from .models import Incident


def correlate_customer_reports(tower):
    incident = (
        Incident.objects
        .filter(tower=tower, status="OPEN")
        .order_by("-created_at")
        .first()
    )

    if not incident:
        return None

    recent_time = timezone.now() - timedelta(minutes=30)

    report_count = tower.customer_reports.filter(
        timestamp__gte=recent_time
    ).count()

    if report_count >= 2:
        incident.reason += (
            f". {report_count} customer reports received "
            "from this tower in the last 30 minutes."
        )
        incident.save()

    return incident