from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    TowerViewSet,
    NetworkMetricViewSet,
    CustomerReportViewSet,
    IncidentViewSet,
    ussd_callback,
)


router = DefaultRouter()

router.register("towers", TowerViewSet)
router.register("metrics", NetworkMetricViewSet)
router.register("reports", CustomerReportViewSet)
router.register("incidents", IncidentViewSet)


urlpatterns = router.urls

urlpatterns += [
    path("ussd/", ussd_callback, name="ussd_callback"),
]