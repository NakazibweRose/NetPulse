from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Tower, NetworkMetric, CustomerReport, Incident
from .serializers import (
    TowerSerializer,
    NetworkMetricSerializer,
    CustomerReportSerializer,
    IncidentSerializer,
)
from .detection import analyze_metric
from .simulator import simulate_incident, restore_network, generate_metric
from .correlation import correlate_customer_reports


class TowerViewSet(viewsets.ModelViewSet):
    queryset = Tower.objects.all()
    serializer_class = TowerSerializer

@action(detail=True, methods=["post"])
def simulate_incident(self, request, pk=None):
    tower = self.get_object()

    severity = request.data.get("severity", "CRITICAL")

    metric, incident = simulate_incident(
        tower,
        severity
    )

    return Response({
        "message": "Network incident simulated successfully",
        "tower": tower.tower_code,
        "metric_id": metric.id,
        "incident_id": incident.id,
        "severity": incident.severity,
        "reason": incident.reason,
    })

@action(detail=True, methods=["post"])
def restore_network(self, request, pk=None):
        tower = self.get_object()
        metric = restore_network(tower)

        return Response({
            "message": "Network restored successfully",
            "tower": tower.tower_code,
            "metric_id": metric.id,
            "status": tower.status,
        })

@action(detail=True, methods=["post"])
def generate_data(self, request, pk=None):
        tower = self.get_object()

        metrics = []

        for _ in range(5):
            metric = generate_metric(tower)
            metrics.append(metric)

        return Response({
            "message": "Network data generated successfully",
            "tower": tower.tower_code,
            "measurements": len(metrics),
        })


class NetworkMetricViewSet(viewsets.ModelViewSet):
    queryset = NetworkMetric.objects.all()
    serializer_class = NetworkMetricSerializer

    def perform_create(self, serializer):
        metric = serializer.save()
        analyze_metric(metric)


class CustomerReportViewSet(viewsets.ModelViewSet):
    queryset = CustomerReport.objects.all()
    serializer_class = CustomerReportSerializer

    def perform_create(self, serializer):
        report = serializer.save()
        correlate_customer_reports(report.tower)


class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer

from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse


@csrf_exempt
def ussd_callback(request):
    if request.method == "POST":

        session_id = request.POST.get("sessionId")
        phone_number = request.POST.get("phoneNumber")
        text = request.POST.get("text", "")

        print("USSD SESSION:", session_id)
        print("PHONE:", phone_number)
        print("TEXT:", text)

        # First menu
        if text == "":
            response = (
                "CON Welcome to NetPulse\n"
                "1. Report Problem\n"
                "2. Check Network\n"
                "3. Help"
            )

        # Customer chose Report Problem
        elif text == "1":
            response = (
                "CON Report a Problem\n"
                "1. No Network\n"
                "2. Slow Internet\n"
                "3. Calls Dropping\n"
                "4. SMS Problem"
            )

        # Customer selected a problem
        elif text in ["1*1", "1*2", "1*3", "1*4"]:

            response = (
                "CON Select your area\n"
                "1. KLA-001 - Kampala Central\n"
                "2. KLA-002 - Ntinda\n"
                "3. KLA-003 - Kampala Central\n"
                "4. KLA-004 - Nakawa\n"
                "5. KLA-005 - Rubaga"
            )

        # Customer selected an area
        elif text.startswith("1*") and text.count("*") == 2:

            parts = text.split("*")

            problem_choice = parts[1]
            tower_choice = parts[2]

            problem_types = {
                "1": "NO_NETWORK",
                "2": "SLOW_INTERNET",
                "3": "DROPPED_CALLS",
                "4": "SMS_PROBLEM",
            }

            tower_codes = {
                "1": "KLA-001",
                "2": "KLA-002",
                "3": "KLA-003",
                "4": "KLA-004",
                "5": "KLA-005",
            }

            problem_type = problem_types.get(problem_choice)
            tower_code = tower_codes.get(tower_choice)

            if problem_type and tower_code:

                tower = Tower.objects.get(
                    tower_code=tower_code
                )

                report = CustomerReport.objects.create(
                    tower=tower,
                    problem_type=problem_type,
                    phone_number=phone_number,
                )

                correlate_customer_reports(tower)

                response = (
                    "END Thank you. Your network report "
                    "has been received by NetPulse."
                )

            else:
                response = "END Invalid selection."

        # Check Network
        elif text == "2":
            response = (
                "END NetPulse Network Status\n"
                "Network monitoring is active."
            )

        # Help
        elif text == "3":
            response = (
                "END NetPulse helps customers report network "
                "problems and helps operators detect network incidents."
            )

        else:
            response = "END Invalid option. Please try again."

        return HttpResponse(response)

    return HttpResponse("Method not allowed", status=405)