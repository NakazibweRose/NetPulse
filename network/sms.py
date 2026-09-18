import os

import africastalking


username = os.getenv("AFRICASTALKING_USERNAME")
api_key = os.getenv("AFRICASTALKING_API_KEY")

africastalking.initialize(username, api_key)

sms = africastalking.SMS


def send_sms(phone_number, message):
    response = sms.send(
        message,
        [phone_number]
    )

    return response

def send_incident_alert(incident):
    message = (
        f"NETPULSE ALERT: {incident.severity} incident detected "
        f"at {incident.tower.tower_code}, "
        f"{incident.tower.location}. "
        f"{incident.reason}."
    )

    operator_number = os.getenv("NETPULSE_OPERATOR_NUMBER")

    return send_sms(operator_number, message)