MICROSOFT AGENT FRAMEWORK
IT INCIDENT ROUTING SYSTEM
Authentication: Azure Foundry API Key
============================================================

Azure Foundry configuration loaded.
Endpoint: https://ey-hobhav-foundry.services.ai.azure.com/openai/v1
Deployment: gpt-5.4-mini

Total incidents loaded: 4

Azure Foundry client initialized.
Graph workflow built successfully.


Processing Incident: INC101
Description: The corporate email service is unavailable for every employee across the company.
============================================================

[Triage Agent] Analyzing incident...
[Triage Agent] Severity: HIGH

[Escalation Agent] Handling HIGH-severity incident...

------------------------------------------------------------
FINAL INCIDENT RESPONSE
------------------------------------------------------------

Incident ID: INC101
Severity: HIGH
Assigned Agent: EscalationAgent

1. **Incident summary**  
   - **INC101:** Corporate email service is unavailable for all employees company-wide. This is a **HIGH-severity major outage** impacting business communication.

2. **Responsible support team**  
   - **Primary:** Messaging/Email Operations team  
   - **Secondary:** Infrastructure/Network team  
   - **Escalation owner:** Major Incident Manager / IT Service Desk lead

3. **Immediate containment actions**  
   - Confirm scope: verify outage affects all users, not just a site or group.  
   - Check for recent changes, service health alerts, and authentication/mail flow issues.  
   - Initiate failover or recovery procedures if available.  
   - Pause nonessential changes to email, identity, DNS, or network systems.  
   - Provide a temporary workaround if possible (e.g., alternate messaging channel).

4. **Escalation procedure**  
   - Open a **major incident bridge** and assign a single incident commander.  
   - Escalate immediately to email platform engineers, infrastructure, DNS, and identity teams as needed.  
   - If third-party email service is used, contact the vendor support page/SEV line with incident ID **INC101**.  
   - Update management and service desk with current status, impact, and ETA every agreed interval.

5. **Communication recommendations**  
   - Send a short company-wide notice acknowledging a full email outage and the active investigation.  
   - Share an approved alternate contact method for urgent business communication.  
   - Communicate updates on a fixed schedule, even if no new information is available.  
   - Avoid speculation on root cause until confirmed.
------------------------------------------------------------

Processing Incident: INC102
Description: One employee's wireless mouse stopped working.
============================================================

[Triage Agent] Analyzing incident...
[Triage Agent] Severity: LOW

[Resolution Agent] Handling LOW-severity incident...

------------------------------------------------------------
FINAL INCIDENT RESPONSE
------------------------------------------------------------

Incident ID: INC102
Severity: LOW
Assigned Agent: ResolutionAgent

Here are a few simple troubleshooting steps for a wireless mouse that stopped working:

1. **Check the power**
   - Make sure the mouse is turned on, if it has a power switch.
   - Replace or recharge the batteries if needed.

2. **Reconnect the receiver or Bluetooth**
   - If it uses a USB receiver, unplug it and plug it back in.
   - If it connects by Bluetooth, turn Bluetooth off and back on, then reconnect the mouse.

3. **Try a different USB port**
   - If the mouse uses a wireless dongle, plug it into another USB port on the computer.

4. **Restart the computer**
   - A restart can help the system detect the mouse again.

5. **Test the mouse on another device**
   - If possible, try the mouse on another computer to see whether the mouse itself is working.

**Escalate to the help desk if:**
- The mouse still does not work after these steps.
- The USB receiver is missing or damaged.
- The mouse works on another device but not on the employee’s computer.
- There may be a hardware issue with the mouse or the computer’s USB/Bluetooth connection.
------------------------------------------------------------


Processing Incident: INC103
Description: The company-wide payment processing system is down and transactions are failing.
============================================================

[Triage Agent] Analyzing incident...
[Triage Agent] Severity: HIGH

[Escalation Agent] Handling HIGH-severity incident...

------------------------------------------------------------
FINAL INCIDENT RESPONSE
------------------------------------------------------------

Incident ID: INC103
Severity: HIGH
Assigned Agent: EscalationAgent

1. **Incident summary**  
   **INC103:** Company-wide payment processing is down; transactions are failing across the business. This is a high-severity service outage with direct revenue impact.

2. **Responsible support team**  
   - **Primary:** Payments/Application Support team  
   - **Secondary:** Infrastructure/Network team  
   - **Escalation owner:** Major Incident Manager / Incident Commander  
   - **If third-party processor is involved:** Vendor Management / External Provider Support

3. **Immediate containment actions**  
   - Declare a **major incident** and open a bridge/call.  
   - Stop any nonessential changes to the payment environment.  
   - Check for scope: all channels, specific regions, specific payment types, or a single processor.  
   - Validate recent changes, deployments, certificates, firewall rules, and connectivity to gateways.  
   - Enable business fallback options if available: manual order capture, delayed settlement, or alternate payment route.  
   - Start log collection and monitor error rates, latency, and dependency health.

4. **Escalation procedure**  
   - Notify the **Incident Commander** and **Payments Support Lead** immediately.  
   - Escalate to **Infrastructure/Network**, **Database**, and **Security** teams as needed based on findings.  
   - Engage the **payment gateway/vendor** if external dependency failure is suspected.  
   - Provide frequent status updates every 15–30 minutes until service is restored.  
   - If recovery is not rapid, escalate to **IT leadership** and **business operations leadership**.

5. **Communication recommendations**  
   - Send a short all-stakeholder outage notice: impact, scope, time started, and next update time.  
   - Use clear business language: “payments are currently failing” and avoid speculation.  
   - Give customer-facing teams approved messaging and workaround guidance.  
   - Keep executives informed with concise updates on cause, mitigation, and ETA when known.
------------------------------------------------------------


Processing Incident: INC104
Description: One employee cannot print to the nearby office printer.
============================================================

[Triage Agent] Analyzing incident...
[Triage Agent] Severity: LOW

[Resolution Agent] Handling LOW-severity incident...

------------------------------------------------------------
FINAL INCIDENT RESPONSE
------------------------------------------------------------

Incident ID: INC104
Severity: LOW
Assigned Agent: ResolutionAgent

Here are simple troubleshooting steps for **INC104: One employee cannot print to the nearby office printer**.

### Troubleshooting steps
1. **Check the printer is powered on**
   - Make sure the printer is turned on and not showing any error lights or messages.
   - Confirm the printer has paper and is not jammed.

2. **Confirm the correct printer is selected**
   - On the employee’s computer, open the print window and make sure the nearby office printer is chosen.
   - If there are multiple printers listed, try selecting the correct one again.

3. **Check the connection**
   - If it is a network printer, make sure the computer is connected to the office network.
   - If it is connected by USB, check that the cable is plugged in securely.

4. **Clear the print queue and try again**
   - Cancel any stuck print jobs in the printer queue.
   - Send one small test document to print.

5. **Restart the printer and computer**
   - Turn the printer off and back on.
   - Restart the employee’s computer and try printing again.

### Escalate to the help desk if:
- The printer still does not print after these steps
- The printer shows an error code or repeated paper jam
- The printer is not visible on the computer
- Other employees also cannot print to the same printer
------------------------------------------------------------

ALL INCIDENTS PROCESSED
============================================================