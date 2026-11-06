'use strict';
(() => {
  const base=CaseDesk.engine,A=CaseDesk.advanced;
  const fresh=()=>({...base.fresh(),track:'core',advanced:CaseDesk.inspection.fresh()});
  const normal = s => s.advanced?s:{...s,track:'core',advanced:CaseDesk.inspection.fresh()};
  const clue = (s,key) => base.reduce(s,{type:'DISCOVER',key});
  const reduce=(state,action)=>{
    const s=normal(state),active=base.caseFor(s),advanced=A.is(s),a=s.advanced;
    if(action.type==='RESET'||action.type==='EXPLORE')return normal(base.reduce(s,action));
    if(action.type==='SELECT_TRACK')return s.stage==='home'&&['core','advanced'].includes(action.track)?{...fresh(),track:action.track,selectedCase:action.track==='core'?'02':'04',analyst:s.analyst}:s;
    if(action.type==='SELECT')return CaseDesk.cases[action.id]&&((CaseDesk.cases[action.id].track||'core')===s.track)?base.reduce(s,action):s;
    if(action.type==='BRIEF')return {...normal(base.reduce(s,action)),track:s.track,advanced:CaseDesk.inspection.fresh()};
    if(action.type==='DISCOVER'&&advanced)return s;
    if(action.type==='NAV'&&advanced){
      if(!['adv-inventory','adv-issuance','adv-custody','adv-documents','adv-inspection'].includes(action.page))return s;
      const role=action.page==='adv-inspection'?'Inspector':active.role;
      return {...s,page:action.page,role,stage:'workspace',selectedRecord:null,guidance:null};
    }
    if(action.type==='VIEWPOINT'&&advanced)return s;
    if(action.type==='GUIDE'&&advanced){
      const o=active.objectives.find(x=>x.key===action.key);if(!o)return s;
      const inspection=o.key==='a-report'?{...a.inspection,tab:'generated'}:o.key==='a-inspection'?{...a.inspection,tab:'new'}:a.inspection;
      return {...reduce(s,{type:'NAV',page:o.page}),advanced:{...a,inspection},guidance:{page:o.page,target:o.target,objective:o.key,text:o.detail},filters:{...s.filters,[o.page]:{search:'',unit:'',status:'',workflow:'',action:''}}};
    }
    if(action.type.startsWith('ADV_')){
      if(!advanced||s.stage!=='workspace')return s;
      if(action.type==='ADV_RECAP'&&active.id==='05'&&['review','skip'].includes(action.choice))return {...s,advanced:{...a,recapChoice:action.choice},page:action.choice==='review'?'adv-issuance':'adv-custody',guidance:null};
      if(action.type==='ADV_INSPECT'){
        let key=null;
        if(active.id==='04')key=action.kind==='assignments'&&action.id==='Alex Cruz'?'a-assignments':action.kind==='issuance'&&action.id==='ADV-ISS-102'?'a-authority':action.kind==='document'&&action.id==='ADV-AUTH-009'?'a-support':action.kind==='document'&&action.id==='ADV-ARE-102'?'a-are':null;
        if(active.id==='05'&&action.kind==='issuance'&&action.id==='ADV-ISS-102')key='a-context';
        let next={...s,lastEvidenceTarget:action.target||s.lastEvidenceTarget};
        if(active.id==='06'&&action.kind==='record'&&action.id==='ADV-FRM-102'&&base.filtersFor(s).unit===CaseDesk.data.advanced.unit)next={...next,advanced:{...a,expectedViewed:true}};
        return key?clue(next,key):next;
      }
      if(action.type==='ADV_CAPTURE'&&active.id==='05'){
        const e=CaseDesk.data.advanced.history.find(x=>x.id===action.id&&x.issuance==='ADV-ISS-102');
        if(!e||s.lastEvidenceTarget!=='a-event-'+e.id)return s;const key=e.action==='Submitted'?'a-submitted':'a-approved';
        return clue({...s,advanced:{...a,actorNotebook:{...a.actorNotebook,[e.action]:{eventId:e.id,issuance:e.issuance,name:e.name,username:e.username,role:e.role,timestamp:e.timestamp,recipient:e.recipient}}},lastEvidenceTarget:'a-event-'+e.id},key);
      }
      if(active.id!=='06')return s;
      if(action.type==='ADV_COMPARE'){
        if(!a.expectedViewed||!A.photosReady())return s;
        if(action.value!=='different')return {...s,advanced:{...a,comparisonFeedback:'Compare the prepared model photographs again. A model never establishes a serial.'}};
        return clue({...s,advanced:{...a,physicalComparison:'different',comparisonFeedback:''},lastEvidenceTarget:'a-record-ADV-FRM-102'},'a-comparison');
      }
      if(action.type==='ADV_FIELD'&&Object.hasOwn(a.inspection.draft,action.field)&&!['photoId'].includes(action.field)&&typeof action.value==='string'&&action.value.length<=5000)return {...s,advanced:{...a,inspection:{...a.inspection,draft:{...a.inspection.draft,[action.field]:action.value},errors:{}}}};
      if(action.type==='ADV_ATTACH'&&A.photosReady()&&action.id==='observation')return {...s,advanced:{...a,inspection:{...a.inspection,draft:{...a.inspection.draft,photoId:'observation'}}}};
      if(action.type==='ADV_TAB'&&['new','submitted','generated'].includes(action.tab))return {...s,advanced:{...a,inspection:{...a.inspection,tab:action.tab}},guidance:null};
      if(action.type==='ADV_SUBMIT'){
        const errors=CaseDesk.inspection.validate(a.inspection.draft,s);
        if(Object.keys(errors).length)return {...s,advanced:{...a,inspection:{...a.inspection,errors}}};
        const saved=CaseDesk.inspection.snapshot(a.inspection.draft);
        return clue({...s,advanced:{...a,inspection:{...a.inspection,errors:{},submitted:[saved],tab:'submitted'}},lastEvidenceTarget:'a-inspection'},'a-inspection');
      }
      if(action.type==='ADV_REPORT_CREATE'&&a.inspection.submitted.some(x=>x.id===action.id)&&!a.inspection.reports.includes(action.id))return {...s,advanced:{...a,inspection:{...a.inspection,reports:[...a.inspection.reports,action.id]}}};
      if(action.type==='ADV_REPORT_OPEN'&&a.inspection.reports.includes(action.id))return clue({...s,lastEvidenceTarget:'a-generated'},'a-report');
      return s;
    }
    return normal(base.reduce(s,action));
  };
  CaseDesk.engine={...base,fresh,reduce,dataFor:A.dataFor};CaseDesk.state=fresh();
})();
