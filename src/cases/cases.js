'use strict';
(() => {
  CaseDesk.cases['02'] = {
    id: '02', title: 'The Missing Logbook Clue', short: 'Follow the custody trail.', principle: 'Traceability & Accountability', role: 'Logistics Officer', page: 'registry', serial: 'DEMO-FRM-002', duration: '90–120 seconds', icon: 'history', recommended: true,
    teaser: 'One missing paper clue. Six digital events. Find the latest documented recipient.',
    briefing: 'A physical logbook clue cannot be located. Fortunately, this firearm already has a digital record. Follow its recorded custody history to find the latest approved recipient and understand what happened to the earlier assignment.',
    guide: 'Start with the full serial number. Then follow the Chain of Custody. A request and a completed action tell different stories.',
    objectives: [
      { key: 'record', text: 'Locate and inspect the firearm record.', detail: 'Search DEMO-FRM-002 in Firearm Registry, then open its details.', page: 'registry' },
      { key: 'return', text: 'Check how the earlier assignment ended.', detail: 'Open Alex’s Return / Confirmed event in Chain of Custody.', page: 'custody' },
      { key: 'latest', text: 'Find the latest approved issuance.', detail: 'Open the newest Issuance / Approved event for DEMO-FRM-002.', page: 'custody' }
    ],
    hints: ['Enter the complete identifier: DEMO-FRM-002. Partial serials do not match the verified identity search.', 'Open Chain of Custody. The newest events appear first. Compare Submitted with Approved or Confirmed.', 'Check the officer in the latest Issuance / Approved detail and the status of Alex’s return.'],
    question: 'Who received the firearm’s latest approved issuance?', answers: ['Alex Cruz', 'Mika Santos', 'No one'], correct: 1,
    wrong: ['Alex appears in the earlier assignment. Follow the events after his return and check the newest approved issuance.', '', 'An approved issuance exists after the confirmed return. Open its details to identify the recipient.'],
    outcome: 'TRACED', resolution: 'Mika Santos is the latest documented recipient.',
    explanation: 'Alex Cruz’s earlier assignment ended after a confirmed return. A later approved issuance names Mika Santos. The recorded events explain the change.',
    insight: 'A reliable history lets investigators connect recorded actions, responsible people, and transaction status. A submitted return is still waiting; a confirmed return closes the earlier assignment.',
    technical: 'The verification exercised the canonical Chain of Custody history, newest first. Six events retain the earlier request and approval, return submission and confirmation, and later request and approval. This is recorded history, not live GPS tracking or recovery of information never entered. The Logistics master-record drawer did not show the holder; the custody-event details did.',
    challenge: { question: 'Why distinguish a submitted return from a confirmed return?', answers: ['They mean the same thing.', 'Confirmation validates the custody transition.', 'Submission erases the earlier history.'], correct: 1, explanation: 'Submission records a request. Confirmation completes the validated return transition; earlier history remains available.' },
    evidence: ['case02-registry-details.png', 'case02-history.png', 'case02-latest-issuance.png']
  };
  CaseDesk.cases['01'] = {
    id: '01', title: 'The Double Assignment', short: 'One firearm. Two names. Who has custody?', principle: 'Data Integrity', role: 'Accountable Officer', page: 'attempts', serial: 'DEMO-FRM-001', duration: '60–90 seconds', icon: 'alert',
    teaser: 'An existing assignment meets a second attempt. Check which record controls custody.',
    briefing: 'DEMO-FRM-001 already has an active assignment. A recorded attempt names another officer for the same firearm. Investigate the current issuance and the open conflict to determine whether that attempt changed custody.',
    guide: 'An attempted assignment is not an approved issuance. Compare the current custody record with the recorded conflict.',
    objectives: [
      { key: 'custodian', text: 'Inspect the active issuance.', detail: 'Open Issuance Records and view DEMO-FRM-001’s approved issuance to identify its custodian.', page: 'issuance' },
      { key: 'conflict', text: 'Examine the recorded conflict.', detail: 'In Multi-Issuance Attempts, open the DEMO-FRM-001 conflict evidence. Compare Current Custodian and Attempted Officer.', page: 'attempts' }
    ],
    hints: ['The Multi-Issuance Attempts table names a Current Custodian and an Attempted Officer. These are different roles in this event.', 'Open Issuance Records and inspect DEMO-FRM-001’s approved issuance. Then review the conflict evidence.', 'Successful recording of an attempt does not create another issuance or transfer custody.'],
    question: 'Who currently holds the firearm?', answers: ['Mika Santos', 'Alex Cruz', 'Both officers'], correct: 1,
    wrong: ['Mika is the attempted recipient. Check the current custodian and the active approved issuance.', '', 'A conflicting attempt was recorded, but no second active issuance occurred. Examine the current custody record.'],
    outcome: 'BLOCKED', resolution: 'Alex Cruz remains the recorded custodian.',
    explanation: 'The attempt involving Mika Santos was recorded as an open conflict. No second active issuance occurred and custody did not transfer.',
    insight: 'Reliable records must not contradict each other. CyberShield preserves the authoritative assignment while recording the conflicting attempt for review.',
    technical: 'Verification exercised atomic workflow handling, row locks, eligibility checks, and an actual PostgreSQL uniqueness safeguard for open firearm issuances. An active-custody conflict records an attempt without another issuance or ARE. Successful recording or reuse feedback means the conflict was logged, not that issuance succeeded. This is a same-firearm custody conflict, separate from additional-handgun authorization rules.',
    challenge: { question: 'What is the main cybersecurity concern in conflicting custody assignments?', answers: ['Data integrity', 'Screen brightness', 'Internet speed'], correct: 0, explanation: 'Data integrity means the authoritative record stays accurate and consistent, even when a conflicting assignment is attempted.' },
    evidence: ['case01-existing-conflict.png', 'case01-attempt-result.png']
  };
  CaseDesk.cases['03'] = {
    id: '03', title: 'The Restricted Record', short: 'You can see it. May you change it?', principle: 'Least Privilege / RBAC', role: 'Inspector', page: 'inventory', serial: 'DEMO-FRM-003', duration: '60–90 seconds', icon: 'lock',
    teaser: 'A record needs attention. Compare the roles before choosing who may maintain it.',
    briefing: 'An Inspector notices a possible problem in DEMO-FRM-003. The Inspector can inspect inventory information, but viewing a record does not automatically permit registry maintenance. Compare the Inspector reference with the Logistics workspace.',
    guide: 'Open the Inspector’s record, then compare the Logistics registry controls. You are changing training viewpoints, not a real account’s privileges.',
    objectives: [
      { key: 'inspector', text: 'Inspect the read-only reference.', detail: 'In Inspector Inventory Lookup, open DEMO-FRM-003. Check the available view-only actions.', page: 'inventory' },
      { key: 'logistics', text: 'Compare registry maintenance access.', detail: 'Switch to the Logistics Firearm Registry and open Add Firearm Record. The training form is a non-submitting preview.', page: 'registry' }
    ],
    hints: ['Inspect DEMO-FRM-003 in Inventory Lookup. Notice that the Inspector workspace offers viewing rather than Add/Edit controls.', 'Use the training role comparison to open Logistics Firearm Registry. Open Add Firearm Record to inspect its maintenance form.', 'The real backend checks permissions independently. A visible record or a successful sign-in does not authorize every action.'],
    question: 'Which role can maintain the firearm master record in this comparison?', answers: ['Inspector', 'Logistics Officer', 'Any logged-in user'], correct: 1,
    wrong: ['The Inspector can view the reference, but that does not authorize master-record maintenance.', '', 'Authentication identifies a user. Authorization separately determines which operations the role may perform.'],
    outcome: 'BLOCKED FOR INSPECTOR MAINTENANCE', resolution: 'Logistics Officer is the maintenance role in this comparison.',
    explanation: 'Inspector reference access is read-only. An authorized Logistics Officer may maintain registry records, subject to department scope and validation.',
    insight: 'Least privilege gives each role the access needed for its responsibilities. Being allowed to inspect a record does not mean being allowed to change it.',
    technical: 'The verified Inspector UI had no master-record creation or edit control. Restricted Logistics navigation redirected to the Inspector dashboard. A controlled, session-authenticated Inspector firearm-creation request returned HTTP 403; the backend enforced permission independently. The normal UI did not display a red HTTP 403 popup. Universal denied-action Audit Trail logging was not established. Role comparison here does not change a real account’s privileges.',
    challenge: { question: 'Why is hiding a restricted button insufficient?', answers: ['Every user should see every button.', 'The backend must independently check authorization.', 'A hidden button changes the database permissions.'], correct: 1, explanation: 'Requests can be made outside normal UI controls. The server must independently validate authorization for the requested operation.' },
    evidence: ['case03-inspector-read-only.png', 'case03-authorized-create.png']
  };
})();
