'use strict';
(() => {
  const app = document.getElementById('app');
  const overlay = document.getElementById('overlay');
  const { icon, escape: e, button, field } = CaseDesk.ui;
  let returnFocus = null;
  let pendingDiscovery = null;
  const headerObserver = new ResizeObserver(entries => {
    const header=entries[0]?.target;
    if(header?.isConnected)app.style.setProperty('--workspace-header-height',header.getBoundingClientRect().height+'px');
  });
  function announce(message) { document.getElementById('announcer').textContent = message; }
  function render(focusHeading = false) {
    const guideScroll=app.querySelector('.mission-body')?.scrollTop||0;
    const focused = document.activeElement;
    const focusId = focused?.id;
    const focusAction = focused?.dataset?.action;
    const focusActionId = focused?.dataset?.id;
    const caret = focused instanceof HTMLInputElement ? focused.selectionStart : null;
    app.innerHTML = CaseDesk.ui.frame(CaseDesk.screens[CaseDesk.state.stage](CaseDesk.state), CaseDesk.state);
    const guideBody=app.querySelector('.mission-body');if(guideBody)guideBody.scrollTop=guideScroll;
    headerObserver.disconnect();const header=app.querySelector('.topbar');
    if(header){app.style.setProperty('--workspace-header-height',header.getBoundingClientRect().height+'px');headerObserver.observe(header);}
    const target=guidanceElement();
    if(target){target.classList.add('guidance-target');target.setAttribute('aria-describedby','guidance-instruction');}
    app.querySelectorAll('table').forEach(table => {
      const labels = Array.from(table.querySelectorAll('thead th')).map(th=>th.textContent);
      table.querySelectorAll('tbody tr').forEach(row => Array.from(row.cells).forEach((cell,i)=>{cell.dataset.label=labels[i] || ''; }));
    });
    if (focusHeading) { (matchMedia('(max-width:760px)').matches&&CaseDesk.state.stage==='workspace'&&CaseDesk.state.missionOpen?app.querySelector('.mission-panel-header h2'):document.getElementById('page-title'))?.focus({ preventScroll: true }); window.scrollTo(0, 0);if(guideBody)guideBody.scrollTop=0; }
    else if (focusId && !overlay.open) {
      const restored = document.getElementById(focusId);
      restored?.focus({ preventScroll: true });
      if (caret !== null && restored instanceof HTMLInputElement && restored.type !== 'checkbox') {
        try { restored.setSelectionRange(caret, caret); } catch { /* Some native input types have no selection range. */ }
      }
    }
    else if (focusAction && !overlay.open) {
      Array.from(app.querySelectorAll('[data-action]')).find(element=>element.dataset.action===focusAction && element.dataset.id===focusActionId)?.focus({preventScroll:true});
    }
  }
  function guidanceElement(){return Array.from(app.querySelectorAll('[data-guidance-id]')).find(el=>el.dataset.guidanceId===CaseDesk.state.guidance?.target);}
  function guideTo(key,source='objective'){
    closeDialog();dispatch({type:'GUIDE',key,source},true);
    guidanceElement()?.scrollIntoView({block:'center',behavior:'auto'});
    if(CaseDesk.state.guidance)announce(CaseDesk.state.guidance.text);
  }
  function dispatch(action, focusHeading = false) {
    const before = CaseDesk.state.clues.length;
    CaseDesk.state = CaseDesk.engine.reduce(CaseDesk.state, action);
    render(focusHeading);
    if (CaseDesk.state.clues.length > before) announce(`Evidence Logged — ${CaseDesk.ui.clueCatalog[CaseDesk.state.lastDiscovery].title}. ${CaseDesk.state.clues.length} of ${CaseDesk.engine.caseFor(CaseDesk.state).objectives.length} objectives complete.`);
  }
  function closeDialog() {
    if (overlay.open) overlay.close();
    CaseDesk.state.selectedRecord = null;
    if(CaseDesk.state.discoveryVisible)dispatch({type:'DISMISS_DISCOVERY'});
  }
  overlay.addEventListener('close', () => {
    if (overlay.open) return;
    document.body.classList.remove('dialog-open');
    if(matchMedia('(max-width:760px)').matches)app.querySelector('[data-action="toggle-nav"]')?.setAttribute('aria-expanded','false');
    CaseDesk.state.selectedRecord = null;
    if(CaseDesk.state.discoveryVisible)dispatch({type:'DISMISS_DISCOVERY'});
    const currentOpener = returnFocus?.isConnected ? returnFocus : Array.from(app.querySelectorAll('[data-action]')).find(element => returnFocus?.dataset?.action && element.dataset.action === returnFocus.dataset.action && element.dataset.id === returnFocus.dataset.id);
    if (currentOpener) currentOpener.focus({ preventScroll: true });
    else document.getElementById('page-title')?.focus({ preventScroll: true });
  });
  overlay.addEventListener('click', event => { if (event.target === overlay) closeDialog(); });
  overlay.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(overlay.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),summary,[tabindex="0"]')).filter(el=>el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  function showDialog({ title, subtitle = '', body, footer = '' }, kind = 'drawer') {
    if (!overlay.open) returnFocus = document.activeElement;
    else overlay.close();
    const discovered = pendingDiscovery; pendingDiscovery = null;
    if (discovered) body = CaseDesk.ui.evidenceNotice(discovered,CaseDesk.state) + body;
    overlay.className = kind;
    overlay.innerHTML = `<div class="dialog-header"><div><span class="eyebrow">Fictional training evidence</span><h2 tabindex="-1" id="dialog-title">${e(title)}</h2>${subtitle ? `<p>${e(subtitle)}</p>` : ''}</div><button class="icon-button" data-action="close" aria-label="Close ${e(title)}">${icon('close')}</button></div><div class="dialog-body">${body}</div>${footer ? `<div class="dialog-footer">${footer}</div>` : ''}`;
    overlay.showModal();
    if(kind==='navigation-modal')app.querySelector('[data-action="toggle-nav"]')?.setAttribute('aria-expanded','true');
    document.body.classList.add('dialog-open');
    overlay.scrollTop = 0;
    overlay.querySelector('.dialog-body').scrollTop = 0;
    document.getElementById('dialog-title').focus({ preventScroll: true });
  }
  function discover(key) {
    const opener = document.activeElement;
    const alreadyLogged=CaseDesk.state.clues.includes(key);
    dispatch({ type: 'DISCOVER', key });
    if(!alreadyLogged&&CaseDesk.state.clues.includes(key))pendingDiscovery=key;
    if (opener?.dataset?.action) returnFocus = document.querySelector(`[data-action="${opener.dataset.action}"][data-id="${opener.dataset.id}"]`);
  }
  function openRecord(serial) {
    const record = CaseDesk.data.records.find(r => r.serial === serial);
    if (!record) return;
    dispatch({type:'INSPECT',target:'record-'+serial});
    const s = CaseDesk.state;
    if (s.activeCase === '02' && serial === 'DEMO-FRM-002') discover('record');
    if (s.activeCase === '03' && s.page === 'inventory' && serial === 'DEMO-FRM-003') discover('inspector');
    CaseDesk.state.selectedRecord = serial;
    showDialog(CaseDesk.details.record(record, CaseDesk.state));
  }
  function openEvent(id) {
    const event = CaseDesk.data.history.find(r => r.id === id);
    if (!event) return;
    dispatch({type:'INSPECT',target:'event-'+id});
    if (CaseDesk.state.activeCase === '02') {
      if (id === '002-4') discover('return');
      if (id === '002-6') discover('latest');
    }
    if (CaseDesk.state.activeCase === '01' && id === '001-2') discover('custodian');
    CaseDesk.state.selectedRecord = id;
    showDialog(CaseDesk.details.event(event));
  }
  function reset() {
    closeDialog();
    overlay.innerHTML='';
    returnFocus = null; pendingDiscovery = null;
    dispatch({ type: 'RESET' }, true);
    announce('Ready for a new visitor. All mission progress has been cleared.');
  }
  const actions = {
    'select-case': id => dispatch({ type: 'SELECT', id }),
    brief: () => dispatch({ type: 'BRIEF' }, true),
    start: () => dispatch({ type: 'START' }, true),
    explore: () => dispatch({ type: 'EXPLORE' }, true),
    nav: page => { closeDialog(); dispatch({ type: 'NAV', page }, true); },
    return: () => { closeDialog(); dispatch({ type: 'RETURN' }, true); },
    review: () => {
      closeDialog();dispatch({type:'REVIEW'},true);
      const context=CaseDesk.state.reviewContext;
      if(!context)return;
      const guideBody=app.querySelector('.mission-body');if(guideBody)guideBody.scrollTop=context.guideScroll||0;
      const target=Array.from(app.querySelectorAll('[data-guidance-id]')).find(el=>el.dataset.guidanceId===context.focusTarget)||app.querySelector('#record-search')||app.querySelector('#page-title');
      target?.focus({preventScroll:true});window.scrollTo(0,context.scrollY||0);
    },
    home: () => { if (CaseDesk.state.activeCase) actions['reset-request'](); else reset(); },
    'back-cases': reset,
    'reset-now': reset,
    'reset-request': () => showDialog({ title: 'Prepare for a new visitor?', body: '<p>End this investigation and prepare for a new visitor?</p><p>Clues, answers, hints, filters, and challenge progress will be cleared.</p>', footer: button('Cancel', 'close') + button('Reset Mission', 'reset-now', { primary: true, icon: 'reset' }) }, 'modal'),
    close: closeDialog,
    record: openRecord,
    event: openEvent,
    'issuance-detail': id => {
      const event=CaseDesk.data.history.find(item=>item.id===id);
      if (!event) return;
      dispatch({type:'INSPECT',target:'issuance-detail-'+id});
      if (CaseDesk.state.activeCase==='01' && id==='001-2') discover('custodian');
      const returned=id==='002-2';
      showDialog({title:'Issuance Details',subtitle:event.serial,body:`<dl class="detail-grid">${field('Firearm serial',event.serial)}${field('Officer',event.officer)}${field('Current issuance state',returned?'Returned':'Issued')}${field('Approval action','Approved')}</dl><div class="summary-box"><p>${returned?'This earlier issuance to Alex Cruz ended after a confirmed return. Its original approval remains recorded in history.':'This approved issuance is recorded as Issued. Compare its officer with the attempted assignment.'}</p></div><p class="training-note">This is read-only training evidence. No issuance, approval or return is submitted.</p>`,footer:button('Open original approval event','event',{id,icon:'history'})});
    },
    conflict: () => {
      dispatch({type:'INSPECT',target:'conflict-DEMO-FRM-001'});
      if (CaseDesk.state.activeCase==='01') discover('conflict');
      const c=CaseDesk.data.conflict;
      showDialog({title:'Recorded custody conflict',subtitle:c.serial,body:`<div class="training-note">Prepared conflict evidence. No request or database write is submitted here.</div><div class="custody-comparison"><section><span class="eyebrow">Current authoritative custody</span><strong>${e(c.custodian)}</strong><p>${e(c.serial)}</p>${CaseDesk.ui.statusBadge('Issued','record')}</section><span class="comparison-connector">${icon('compare')}</span><section><span class="eyebrow">Attempted assignment</span><strong>${e(c.attempted)}</strong><p>Recorded conflict</p>${CaseDesk.ui.statusBadge(c.status,'conflict')}</section></div><dl class="detail-grid">${field('Attempt date',c.date)}${field('Conflict status',c.status)}</dl><p>Compare these observations with the active issuance before drawing your conclusion.</p>`,footer:button('Inspect active issuance','nav',{id:'issuance',primary:true,icon:'record'})});
    },
    'toggle-nav': () => { if(matchMedia('(max-width:760px)').matches) showDialog({title:'Workspace navigation',body:CaseDesk.ui.sidebar(CaseDesk.state).replace('id="workspace-navigation"','id="mobile-workspace-navigation"')},'navigation-modal');else dispatch({type:'TOGGLE_NAV'}); },
    'toggle-group': id => dispatch({type:'TOGGLE_GROUP',id}),
    'toggle-mission': () => { dispatch({type:'TOGGLE_MISSION'});if(!CaseDesk.state.missionOpen)app.querySelector('.investigation-toggle')?.focus({preventScroll:true}); },
    'custody-view': view => dispatch({type:'CUSTODY_VIEW',view}),
    'dismiss-discovery': () => {dispatch({type:'DISMISS_DISCOVERY'});document.getElementById('evidence-notification')?.remove();if(overlay.open)document.getElementById('dialog-title')?.focus({preventScroll:true});},
    'clear-guidance': () => dispatch({type:'CLEAR_GUIDANCE'}),
    'guide-next': key => guideTo(key,'next-action'),
    viewpoints: () => showDialog({title:'Switch training viewpoint',body:'<p>Compare prepared fictional role workspaces. This does not grant privileges to a real account.</p><div class="viewpoint-options">'+['Logistics Officer','Accountable Officer','Inspector'].map(role=>button(role,'viewpoint',{id:role,icon:'shield'})).join('')+'</div>'},'modal'),
    viewpoint: role => { if(!['Logistics Officer','Accountable Officer','Inspector'].includes(role))return;closeDialog();dispatch({type:'VIEWPOINT',role},true); },
    'history-for': serial => { closeDialog(); dispatch({ type: 'NAV', page: 'custody' }); dispatch({ type: 'FILTER', key: 'search', value: serial }, true); },
    'clear-filters': () => dispatch({ type: 'CLEAR_FILTERS' }),
    hint: () => {
      const c = CaseDesk.engine.caseFor(CaseDesk.state);
      if (CaseDesk.state.hintCount < c.hints.length) dispatch({ type: 'HINT' });
      else {
        const next=(c.id==='01'?['conflict','custodian']:c.objectives.map(o=>o.key)).find(key=>!CaseDesk.state.clues.includes(key));
        showDialog({ title: 'Investigation hints', body: `<ol class="hint-list">${c.hints.map(h=>`<li>${e(h)}</li>`).join('')}</ol>`,footer:next?button('Show next action','guide-next',{id:next,icon:'arrow'}):'' }, 'modal');
      }
    },
    objective: key => {
      const c = CaseDesk.engine.caseFor(CaseDesk.state);
      const o = c.objectives.find(item => item.key === key);
      if (!o) return;
      const summaries = Object.fromEntries(Object.entries(CaseDesk.ui.clueCatalog).map(([key,value])=>[key,value.observation]));
      showDialog({ title: CaseDesk.state.clues.includes(key) ? 'Discovered evidence' : 'Objective guidance', subtitle: o.text, body: `<p>${e(CaseDesk.state.clues.includes(key) ? summaries[key] : o.detail)}</p><div class="training-note">You can investigate in any order. Progress is kept while navigating.</div>`, footer: button('Open relevant workspace', 'objective-nav', { id: key, primary: true, icon: 'arrow' }) }, 'modal');
    },
    'objective-nav': key => guideTo(key),
    decide: () => {closeDialog();dispatch({type:'DECIDE',context:{scrollY:window.scrollY,guideScroll:app.querySelector('.mission-body')?.scrollTop||0,focusTarget:CaseDesk.state.lastEvidenceTarget}},true);},
    answer: index => dispatch({ type: 'ANSWER', index: Number(index) }, true),
    challenge: index => dispatch({ type: 'CHALLENGE', index: Number(index) }),
    complete: () => dispatch({ type: 'COMPLETE' }, true),
    'form-preview': () => {
      if (CaseDesk.state.role !== 'Logistics Officer') return;
      dispatch({type:'INSPECT',target:'form-preview'});
      if (CaseDesk.state.activeCase === '03') discover('logistics');
      showDialog({ title: 'Add firearm record', subtitle: 'Logistics Officer · registry maintenance form preview', body: `<div class="training-note">Training preview only. The verified original Logistics workspace can create records within its authorized scope. This simulator cannot submit or save a record.</div><fieldset disabled class="preview-fields"><legend>Original form controls · preview</legend>${['Article','Description / Make','Model','Serial Number','Caliber','Date of Acquisition','Current Firearm Condition','Firearm Status','Firearm Image (optional)'].map(label=>`<label>${label}<input value="${label === 'Article' ? 'Pistol / Revolver' : label === 'Current Firearm Condition' ? 'Serviceable' : label === 'Firearm Status' ? 'Available' : ''}" aria-label="${label}"></label>`).join('')}</fieldset><p>Creation remains subject to permission, department scope, and validation in the real system.</p>`, footer: button('Close preview', 'close', { primary: true }) }, 'modal');
    },
    fullscreen: async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        else throw new Error('unsupported');
      } catch {
        showDialog({ title: 'Full-screen help', body: '<p>Your browser did not allow full screen. Use the browser’s full-screen control or press F11 on Windows.</p>' }, 'modal');
      }
    },
    evidence: name => {
      const allowed = Object.values(CaseDesk.cases).some(c => c.evidence.includes(name));
      if (!allowed) return;
      showDialog({ title: 'Original verification screenshot', subtitle: name, body: `<p class="training-note">Captured in a disposable fictional CyberShield environment on November 6, 2026. This is reference evidence, not a live system.</p><img class="evidence-image" src="public/evidence/${e(name)}" alt="${e(name.replaceAll('-', ' ').replace('.png',''))}">` }, 'viewer');
    }
  };
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target || target.disabled) return;
    event.preventDefault();
    if(target.dataset.guidanceId&&target.dataset.guidanceId===CaseDesk.state.guidance?.target&&target.tagName!=='INPUT')dispatch({type:'CLEAR_GUIDANCE'});
    const handler = actions[target.dataset.action];
    if (handler) handler(target.dataset.id);
    else if (CaseDesk.extraActions?.[target.dataset.action]) CaseDesk.extraActions[target.dataset.action](target.dataset.id);
  });
  document.addEventListener('input', event => {
    if (event.target.dataset.filter) dispatch({ type: 'FILTER', key: event.target.dataset.filter, value: event.target.value });
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'analyst-toggle') dispatch({ type: 'ANALYST', value: event.target.checked });
  });
  document.addEventListener('fullscreenchange', () => render());
  matchMedia('(max-width:760px)').addEventListener('change', () => render());
  CaseDesk.app = { dispatch, render, showDialog, discover, openRecord, openEvent, closeDialog, announce };
  render();
})();
