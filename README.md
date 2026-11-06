# CyberShield: Case Desk V3

[Play CyberShield: Case Desk V3](https://kichiya999x.github.io/CyberShield-Case-Desk-Demo/)

An interactive cybersecurity investigation simulator for the CyberShield academic exhibit. Six investigations use fictional training records to teach security, accountability and evidence review.

## Core Investigations

| Case | Investigation | Principle |
| --- | --- | --- |
| 01 — The Double Assignment | Compare an existing issuance with a conflicting attempt. | Data integrity |
| 02 — The Missing Logbook Clue | Follow a recorded custody trail. | Traceability and accountability |
| 03 — The Restricted Record | Compare reference and maintenance access. | Least privilege / role-based access control |

Case 02 is recommended first. Choose a case, read its briefing and select **Begin Investigation**. Examine the records, follow the guide and make your decision. **Free Exploration** and the optional **Security Analyst Challenge** are also available.

## Optional Advanced Investigations

| Case | Investigation | Principle |
| --- | --- | --- |
| 04 — The Questioned Authorization | Compare supporting authority and a receipt against trusted Case Facts. | Authorization evidence and record integrity |
| 05 — Follow the Approval Trail | Capture the application actors, roles and timestamps for Submitted and Approved events. | Actor-level accountability and traceability |
| 06 — The Physical Observation | Compare prepared photographs, submit a simulated inspection and generate a training report. | Evidence integrity and physical verification |

Select **Optional Advanced Investigations** on the case-selection screen. These independent chapters use a separate fictional ADV dataset. A receipt does not independently authorize an issuance, a recipient is distinct from the users performing actions, and a model photograph does not establish an observed serial number. Findings warrant review; they do not establish guilt.

Inspection drafts, saved submissions, actor notebooks and generated reports exist only for the current browser session. Case 06 provides an accessible HTML report preview and a downloadable text-only PDF. PDF remarks support up to 5,000 Latin characters and Western punctuation. The provided observation photograph is referenced in the report; the text-only PDF does not embed photographs.

## New visitor and offline use

Use **New visitor → Reset Mission** to clear the session, or **NEW VISITOR — RESET MISSION** after completion. Reset clears investigation progress, the actor notebook, inspection drafts and submissions, generated report entries and session Blob URLs. It cannot delete files already downloaded to a device. Refreshing also starts fresh.

To use Case Desk offline, download the repository source ZIP, extract it and open `index.html` in a current browser. Keep the `src` and `public` folders beside it. The application requires no installation, sign-in, backend, external font, CDN or runtime package. Its scripts, styles, images and prepared documents are local. A static HTTP server may also serve the same files.

## Training and asset information

This is a fictional educational reconstruction with no connection to an operational firearm-record system. It does not issue, approve, return, maintain or transfer real records, grant account permissions or verify the Advanced workflows against an operational backend. No visitor progress is persistently stored, and the application adds no analytics or telemetry. Use only fictional details in the training form.

This website and its demonstration source are public. Copyright and branding rights remain with their respective holders; no unrestricted open-source license is assigned. See [NOTICE.md](NOTICE.md) and [firearm photograph credits and licenses](public/firearms/NOTICE.md).
