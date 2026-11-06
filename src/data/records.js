'use strict';
window.CaseDesk = { data: {}, cases: {} };
(() => {
  const unit = 'Fictional Exhibit Training Unit';
  const records = [
    { serial: 'DEMO-FRM-001', model: 'Training Model A', description: 'Fictional exhibit pistol one', holder: 'Alex Cruz', status: 'Issued' },
    { serial: 'DEMO-FRM-002', model: 'Training Model B', description: 'Fictional exhibit pistol two', holder: 'Mika Santos', status: 'Issued' },
    { serial: 'DEMO-FRM-003', model: 'Training Model C', description: 'Fictional exhibit pistol three', holder: null, status: 'Available' }
  ].map(record => Object.freeze({ ...record, unit, article: 'Pistol', condition: 'Serviceable', caliber: '9mm', acquired: 'November 6, 2026' }));
  const history = [
    { id: '002-1', serial: 'DEMO-FRM-002', order: 1, workflow: 'Issuance', action: 'Submitted', officer: 'Alex Cruz', before: 'Available', after: 'Available', meaning: 'A request was submitted. Submission did not assign the firearm.' },
    { id: '002-2', serial: 'DEMO-FRM-002', order: 2, workflow: 'Issuance', action: 'Approved', officer: 'Alex Cruz', before: 'Available', after: 'Issued', meaning: 'The approved issuance assigned the firearm to Alex Cruz.' },
    { id: '002-3', serial: 'DEMO-FRM-002', order: 3, workflow: 'Return', action: 'Submitted', officer: 'Alex Cruz', before: 'Issued', after: 'Issued', meaning: 'Alex submitted a return. Custody remained active while confirmation was pending.' },
    { id: '002-4', serial: 'DEMO-FRM-002', order: 4, workflow: 'Return', action: 'Confirmed', officer: 'Alex Cruz', before: 'Issued', after: 'Available', meaning: 'Logistics confirmed the serviceable return. Alex’s earlier assignment ended.' },
    { id: '002-5', serial: 'DEMO-FRM-002', order: 5, workflow: 'Issuance', action: 'Submitted', officer: 'Mika Santos', before: 'Available', after: 'Available', meaning: 'A later request named Mika Santos. It still required approval.' },
    { id: '002-6', serial: 'DEMO-FRM-002', order: 6, workflow: 'Issuance', action: 'Approved', officer: 'Mika Santos', before: 'Available', after: 'Issued', meaning: 'This is the latest approved issuance for this firearm.' },
    { id: '001-1', serial: 'DEMO-FRM-001', order: 7, workflow: 'Issuance', action: 'Submitted', officer: 'Alex Cruz', before: 'Available', after: 'Available', meaning: 'The initial request named Alex Cruz; submission alone did not assign custody.' },
    { id: '001-2', serial: 'DEMO-FRM-001', order: 8, workflow: 'Issuance', action: 'Approved', officer: 'Alex Cruz', before: 'Available', after: 'Issued', meaning: 'Alex Cruz became the authoritative custodian. The later conflict attempt did not change this.' }
  ].map(event => Object.freeze({ ...event, date: 'Nov 6, 2026 · 4:28 AM', actor: event.action === 'Submitted' ? 'Demo Accountable · Accountable Officer' : 'Demo Logistics · Logistics Officer' }));
  Object.assign(CaseDesk.data, { unit, records: Object.freeze(records), history: Object.freeze(history), conflict: Object.freeze({ serial: 'DEMO-FRM-001', custodian: 'Alex Cruz', attempted: 'Mika Santos', status: 'Open', date: 'November 6, 2026' }) });
})();
