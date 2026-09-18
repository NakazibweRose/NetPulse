from django.db import models


class Tower(models.Model):
    tower_code = models.CharField(max_length=20, unique=True)
    location = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()

    STATUS_CHOICES = [
        ("HEALTHY", "Healthy"),
        ("WARNING", "Warning"),
        ("CRITICAL", "Critical"),
    ]

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="HEALTHY"
    )

    def __str__(self):
        return self.tower_code


class NetworkMetric(models.Model):
    tower = models.ForeignKey(
        Tower,
        on_delete=models.CASCADE,
        related_name="metrics"
    )
    latency = models.FloatField()
    packet_loss = models.FloatField()
    dropped_calls = models.IntegerField()
    signal_strength = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tower.tower_code} - {self.timestamp}"


class CustomerReport(models.Model):
    tower = models.ForeignKey(
        Tower,
        on_delete=models.CASCADE,
        related_name="customer_reports"
    )

    PROBLEM_CHOICES = [
        ("NO_NETWORK", "No Network"),
        ("SLOW_INTERNET", "Slow Internet"),
        ("DROPPED_CALLS", "Calls Dropping"),
        ("SMS_PROBLEM", "SMS Problem"),
    ]

    problem_type = models.CharField(
        max_length=20,
        choices=PROBLEM_CHOICES
    )

    phone_number = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tower.tower_code} - {self.problem_type}"


class Incident(models.Model):
    tower = models.ForeignKey(
        Tower,
        on_delete=models.CASCADE,
        related_name="incidents"
    )

    notification_sent = models.BooleanField(default=False)

    SEVERITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critical"),
    ]

    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("INVESTIGATING", "Investigating"),
        ("RESOLVED", "Resolved"),
    ]

    severity = models.CharField(
        max_length=10,
        choices=SEVERITY_CHOICES
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default="OPEN"
    )

    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tower.tower_code} - {self.severity}"