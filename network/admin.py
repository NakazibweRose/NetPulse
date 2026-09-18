from django.contrib import admin
from .models import Tower, NetworkMetric, CustomerReport, Incident


admin.site.register(Tower)
admin.site.register(NetworkMetric)
admin.site.register(CustomerReport)
admin.site.register(Incident)