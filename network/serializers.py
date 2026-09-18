from rest_framework import serializers
from .models import Tower, NetworkMetric, CustomerReport, Incident


class TowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tower
        fields = "__all__"


class NetworkMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkMetric
        fields = "__all__"


class CustomerReportSerializer(serializers.ModelSerializer):
    tower_code = serializers.CharField(
        source="tower.tower_code",
        read_only=True
    )

    tower_location = serializers.CharField(
        source="tower.location",
        read_only=True
    )

    class Meta:
        model = CustomerReport
        fields = [
            "id",
            "tower",
            "tower_code",
            "tower_location",
            "problem_type",
            "phone_number",
            "timestamp",
        ]


class IncidentSerializer(serializers.ModelSerializer):
    tower_code = serializers.CharField(
        source="tower.tower_code",
        read_only=True
    )

    tower_location = serializers.CharField(
        source="tower.location",
        read_only=True
    )

    class Meta:
        model = Incident
        fields = [
            "id",
            "tower",
            "tower_code",
            "tower_location",
            "severity",
            "status",
            "reason",
            "notification_sent",
            "created_at",
        ]