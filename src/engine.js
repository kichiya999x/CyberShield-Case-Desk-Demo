'use strict';
(() => {
  const fresh = () => ({ stage: 'home', selectedCase: '02', activeCase: null, mode: 'guided', page: 'registry', role: 'Logistics Officer', clues: [], hintCount: 0, analyst: false, answer: null, feedback: '', challengeAnswer: null, challengeFeedback: '', challengePassed: false, filters: {}, selectedRecord: null, dialogue: 0, navCollapsed: false, missionOpen: false, groups: {records:true,transactions:true,reference:true,tools:true}, custodyView:'list', lastDiscovery:null, discoveryVisible:false, viewpointNotice:'', guidance:null, reviewContext:null, lastEvidenceTarget:null });
  const guidanceTargets = {
    record:{page:'registry',target:'search-record',text:'Search for DEMO-FRM-002, then open its view-details action.'},
    return:{page:'custody',target:'event-002-4',text:'Open the Return / Confirmed details for DEMO-FRM-002.'},
    latest:{page:'custody',target:'event-002-6',text:'Open the latest Issuance / Approved details for DEMO-FRM-002.'},
    conflict:{page:'attempts',target:'conflict-DEMO-FRM-001',text:'Open the eye action for the DEMO-FRM-001 conflict.'},
    custodian:{page:'issuance',target:'issuance-detail-001-2',text:'Open the active DEMO-FRM-001 issuance details.'},
    inspector:{page:'inventory',target:'record-DEMO-FRM-003',text:'Open DEMO-FRM-003 in the Inspector reference.'},
    logistics:{page:'registry',target:'form-preview',text:'In this training Logistics viewpoint, open Add Firearm Record to compare the non-submitting preview.'}
  };
  const caseFor = state => CaseDesk.cases[state.activeCase];
  const filtersFor = (state, page = state.page) => state.filters[page] || { search: '', status: '', workflow: '', action: '', unit: '' };
  const searchMatch = (record, query, extra = '') => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    // A complete normalized identifier matches identity; partial serials do not.
    const serial = record.serial.toLowerCase();
    return q === serial || [record.model, record.description, record.article, record.unit, extra].filter(Boolean).some(value => value.toLowerCase().includes(q));
  };
  const reduce = (state, action) => {
    const active = caseFor(state);
    switch (action.type) {
      case 'RESET': return fresh();
      case 'SELECT': return { ...state, selectedCase: action.id };
      case 'ANALYST': return { ...state, analyst: action.value };
      case 'BRIEF': { const selected=CaseDesk.cases[state.selectedCase]; return { ...fresh(), selectedCase: state.selectedCase, analyst: state.analyst, activeCase: state.selectedCase, page:selected.page, role:selected.role, stage: 'briefing', navCollapsed:true, missionOpen:false }; }
      case 'START': {
        if (state.stage !== 'briefing') return state;
        const group = active.role === 'Accountable Officer' ? 'transactions' : active.role === 'Inspector' ? 'reference' : 'records';
        return { ...state, stage:'workspace', page:active.page, role:active.role, feedback:'', navCollapsed:false, missionOpen:true, groups:{...state.groups,[group]:true} };
      }
      case 'EXPLORE': return { ...fresh(), stage: 'workspace', mode: 'explore' };
      case 'NAV': { const role=action.page==='inventory'?'Inspector':['attempts','issuance'].includes(action.page)?'Accountable Officer':action.page==='registry'?'Logistics Officer':state.role; return { ...state, page:action.page,role,stage:'workspace',selectedRecord:null,guidance:null,viewpointNotice:role!==state.role?`Training viewpoint changed to ${role}. No real account privileges changed.`:state.viewpointNotice }; }
      case 'GUIDE': {
        if (!active?.objectives.some(o=>o.key===action.key)) return state;
        const target=guidanceTargets[action.key],next=reduce(state,{type:'NAV',page:target.page});
        const serial=active.serial;
        return {...next,guidance:{...target,objective:action.key,source:action.source||'objective'},filters:{...state.filters,[target.page]:{search:action.key==='record'?'':serial,status:'',workflow:'',action:'',unit:''}}};
      }
      case 'CLEAR_GUIDANCE': return {...state,guidance:null};
      case 'INSPECT': return {...state,lastEvidenceTarget:action.target};
      case 'REVIEW': return state.stage==='decision'?{...state,stage:'workspace',guidance:null}:state;
      case 'VIEWPOINT': return {...state,role:action.role,page:action.role==='Inspector'?'inventory':action.role==='Accountable Officer'?'issuance':'registry',stage:'workspace',selectedRecord:null,guidance:null,viewpointNotice:`Training viewpoint: ${action.role}. This is a comparison, not a real account privilege change.`};
      case 'TOGGLE_NAV': return {...state,navCollapsed:!state.navCollapsed};
      case 'TOGGLE_MISSION': return {...state,missionOpen:!state.missionOpen};
      case 'TOGGLE_GROUP': return {...state,navCollapsed:false,groups:{...state.groups,[action.id]:state.navCollapsed?true:!state.groups[action.id]}};
      case 'CUSTODY_VIEW': return {...state,custodyView:action.view};
      case 'DISMISS_DISCOVERY': return {...state,discoveryVisible:false};
      case 'RETURN': return { ...state, stage: 'workspace', page: active.page, role: active.role, selectedRecord: null, guidance:null };
      case 'FILTER': {
        const guidance=state.guidance?.target==='search-record'&&action.key==='search'&&action.value.trim().toUpperCase()===active?.serial?{...state.guidance,target:'record-'+active.serial,text:'Open the eye action for '+active.serial+'.'}:null;
        return { ...state,guidance, filters: { ...state.filters, [state.page]: { ...filtersFor(state), [action.key]: action.value } } };
      }
      case 'CLEAR_FILTERS': return { ...state,guidance:null, filters: { ...state.filters, [state.page]: filtersFor(fresh()) } };
      case 'DISCOVER': return active && active.objectives.some(objective => objective.key === action.key) && !state.clues.includes(action.key) ? { ...state, clues: [...state.clues, action.key],lastDiscovery:action.key,discoveryVisible:true,dialogue:state.dialogue+1,guidance:state.guidance?.objective===action.key?null:state.guidance } : state;
      case 'HINT': return { ...state, hintCount: Math.min(state.hintCount + 1, active.hints.length), dialogue: state.dialogue + 1 };
      case 'DECIDE': return active?.objectives.every(objective => state.clues.includes(objective.key)) ? { ...state, stage: 'decision',guidance:null,discoveryVisible:false,reviewContext:action.context||state.reviewContext } : state;
      case 'ANSWER': return { ...state, answer: action.index, feedback: action.index === active.correct ? '' : active.wrong[action.index], stage: action.index === active.correct ? 'insight' : 'decision' };
      case 'CHALLENGE': return { ...state, challengeAnswer: action.index, challengePassed: action.index === active.challenge.correct, challengeFeedback: action.index === active.challenge.correct ? active.challenge.explanation : 'Take another look. ' + active.challenge.explanation };
      case 'COMPLETE': return { ...state, stage: 'complete' };
      default: return state;
    }
  };
  CaseDesk.engine = { fresh, caseFor, filtersFor, searchMatch, reduce, guidanceTargets };
  CaseDesk.state = fresh();
})();
