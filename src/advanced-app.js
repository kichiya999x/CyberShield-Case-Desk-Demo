'use strict';
(() => {
  const A=CaseDesk.advanced,D=CaseDesk.data.advanced,{escape:e,button:b,field}=CaseDesk.ui,app=CaseDesk.app;
  const reports=new Map();
  A.cleanup=()=>{reports.forEach(x=>URL.revokeObjectURL(x.url));reports.clear();};
  window.addEventListener('pagehide',A.cleanup);
  const s=()=>CaseDesk.state;
  const present=(action,details)=>{
    const before=s().clues.length;if(action)app.dispatch(action);
    const notice=s().clues.length>before?CaseDesk.ui.evidenceNotice(s().lastDiscovery,s()):'';
    app.showDialog({...details,body:notice+(typeof details.body==='function'?details.body():details.body)});
    if(notice)app.announce(`Evidence Logged. ${s().clues.length} of ${CaseDesk.engine.caseFor(s()).objectives.length} objectives complete.`);
  };
  const facts=()=>app.showDialog({title:'Case Facts',subtitle:'Separate advanced fictional scenario',body:A.facts()},'modal');
  const record=id=>{
    const r=CaseDesk.engine.dataFor(s()).records.find(x=>x.serial===id);if(!r||!A.is(s()))return;
    const image=id==='ADV-FRM-101'?'beretta':id==='ADV-FRM-102'?'glock':'observation';
    present({type:'ADV_INSPECT',kind:'record',id,target:'a-record-'+id},{title:'Advanced inventory details',subtitle:id,body:`<dl class="detail-grid">${field('Registry serial',r.serial)}${field('Registered model',r.model)}${field('Recipient',r.holder||'No assignment')}${field('Unit',r.unit)}${field('Status',r.status)}</dl>${A.photo(image,`Registry model reference: ${r.model}`)}<p class="training-note">A model photograph is not proof of a physical firearm’s serial. No master record can be changed here.</p>${s().activeCase==='06'&&id==='ADV-FRM-102'?b('Compare provided observation','a-compare-open',{primary:true}):''}`});
  };
  const compare=()=>{
    if(s().activeCase!=='06')return;
    const ready=A.photosReady()&&s().advanced.expectedViewed;
    app.showDialog({title:'Compare model photographs',subtitle:'Human observation · observed serial unknown',body:`<div class="advanced-photos">${A.photo('glock','Expected registry model: Glock 17 / ADV-FRM-102')}${A.photo('observation','Provided observation: CZ 75 B model reference / serial unknown')}</div><p>Do these model photographs agree? This is a human comparison, not automatic image recognition. Do not infer ADV-FRM-103 or any observed serial from the CZ photograph.</p>${!ready?'<p class="feedback" role="alert">Filter Inventory Lookup by the fictional unit and inspect ADV-FRM-102 first. The provided comparison photos must be available.</p>':''}${s().advanced.comparisonFeedback?`<p role="alert">${e(s().advanced.comparisonFeedback)}</p>`:''}`,footer:b('They show the same model','a-compare',{id:'same',disabled:!ready})+b('They show different models','a-compare',{id:'different',primary:true,disabled:!ready})},'modal');
  };
  const issuance=id=>{
    const r=D.records.find(x=>x.issuance===id);if(!r||!A.is(s()))return;
    present({type:'ADV_INSPECT',kind:'issuance',id,target:'a-issuance-'+id},{title:'Advanced issuance details',subtitle:id,body:`<dl class="detail-grid">${field('Issuance',id)}${field('Serial / model',r.serial+' / '+r.model)}${field('Recipient / badge',r.holder+' / '+r.badge)}${field('Current state','Approved / Issued')}${field('Recorded authority reference',id==='ADV-ISS-102'?D.recordedAuthority:'ADV-AUTH-001')}</dl><p class="training-note">Recorded supporting evidence is not necessarily sufficient authority. Compare with Case Facts. No record is approved or changed here.</p>`,footer:b('Case Facts','a-facts')+b('Open prepared documents','nav',{id:'adv-documents'})});
  };
  const doc=id=>{
    const d=D.documents.find(x=>x.id===id);if(!d||!A.is(s()))return;
    present({type:'ADV_INSPECT',kind:'document',id,target:'a-document-'+id},{title:d.type,subtitle:id,body:`<p class="training-note">FICTIONAL TRAINING DOCUMENT. Local HTML viewer is a simulator convenience, not an exact production screen.</p><dl class="detail-grid">${field('Reference',d.id)}${field('Named recipient',d.name)}${field('Badge',d.badge)}${field('Firearm serial',d.serial)}</dl><p>${e(d.note)}</p><p><a class="btn" href="public/documents/${e(d.filename)}" target="_blank" rel="noopener">Open bundled training PDF</a></p>`,footer:b('Case Facts','a-facts')});
  };
  const event=id=>{
    const x=D.history.find(x=>x.id===id);if(!x||!A.is(s()))return;
    app.dispatch({type:'INSPECT',target:'a-event-'+id});
    app.showDialog({title:'Advanced custody event',subtitle:id,body:`<dl class="detail-grid">${[['Transaction',x.issuance],['Serial',x.serial],['Workflow / action',x.workflow+' / '+x.action],['Recipient (not application actor)',x.recipient],['Application actor',x.name],['Username',x.username],['Actor role',x.role],['Timestamp',x.timestamp],['Resulting status',x.after]].map(([k,v])=>field(k,v)).join('')}</dl><p class="training-note">Submission is a request; approval is a separate action. An actor entry identifies logged responsibility, not guilt.</p>`,footer:s().activeCase==='05'&&x.issuance==='ADV-ISS-102'?b('Capture '+x.action+' actor','a-capture',{id,primary:true}):''});
  };
  const reportOpen=id=>{
    const item=reports.get(id),snapshot=s().advanced.inspection.submitted.find(x=>x.id===id);
    if(!item||!snapshot||!s().advanced.inspection.reports.includes(id))return;
    present({type:'ADV_REPORT_OPEN',id},{title:'Fictional training report',subtitle:id,body:`<p class="training-note">FICTIONAL TRAINING REPORT / TRAINING ADAPTATION. Educational annotations exceed the current production export.</p><pre class="advanced-report">${e(CaseDesk.inspection.lines(snapshot).join('\n'))}</pre><p><a class="btn primary" href="${e(item.url)}" download="${e(id)}-training.pdf">Download training PDF</a></p>`});
  };
  CaseDesk.extraActions={...(CaseDesk.extraActions||{}),
    'a-track':track=>app.dispatch({type:'SELECT_TRACK',track},true),
    'a-facts':facts,
    'a-record':record,
    'a-assignments':id=>{if(!A.is(s()))return;present({type:'ADV_INSPECT',kind:'assignments',id,target:'a-assignments'},{title:'Two active assignments',subtitle:'Alex Cruz / EXH-101',body:`<div class="advanced-photos">${A.photo('beretta','Original assignment: ADV-FRM-101 / Beretta 92FS')}${A.photo('glock','Secondary assignment: ADV-FRM-102 / Glock 17')}</div><p>Both assignments are already Approved / Issued in this fictional scenario. A second assignment alone does not prove authority or misconduct.</p>`,footer:b('Inspect secondary issuance','nav',{id:'adv-issuance',primary:true})});},
    'a-issuance':issuance,
    'a-document':doc,
    'a-event':event,
    'a-capture':id=>{
      if(s().activeCase!=='05')return;
      present({type:'ADV_CAPTURE',id},{title:'Actor notebook',body:()=>A.actorNotebook(s())||'<p>No matching actor captured.</p>'});
    },
    'a-recap':choice=>{app.closeDialog();app.dispatch({type:'ADV_RECAP',choice},true);},
    'a-compare-open':compare,
    'a-compare':value=>{const before=s().clues.length;app.dispatch({type:'ADV_COMPARE',value});if(s().clues.length>before)app.showDialog({title:'Physical comparison recorded',body:CaseDesk.ui.evidenceNotice('a-comparison',s())+'<p>Different model/photo. Observed serial unknown; further verification required.</p>',footer:b('Open New Inspection','nav',{id:'adv-inspection',primary:true})});else compare();},
    'a-inspection-tab':tab=>app.dispatch({type:'ADV_TAB',tab}),
    'a-attach':id=>app.dispatch({type:'ADV_ATTACH',id}),
    'a-photo':()=>app.showDialog({title:'Prepared observation attachment',body:A.photo('observation','CZ model reference; observed serial unknown')},'viewer'),
    'a-submit':()=>{
      const before=s().clues.length;app.dispatch({type:'ADV_SUBMIT'},true);
      if(Object.keys(s().advanced.inspection.errors).length){document.getElementById('inspection-errors')?.focus();return;}
      if(s().clues.length>before)app.showDialog({title:'Training inspection saved',body:CaseDesk.ui.evidenceNotice('a-inspection',s())+'<p>Saved in Submitted Reports. Entered custody verified; human physical observation requires further verification. No operational record changed.</p>'});
    },
    'a-report-create':id=>{
      const snapshot=s().advanced.inspection.submitted.find(x=>x.id===id);if(!snapshot||reports.has(id))return;
      try{const bytes=CaseDesk.pdf.bytes(CaseDesk.inspection.lines(snapshot));reports.set(id,{url:URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}))});app.dispatch({type:'ADV_REPORT_CREATE',id});}
      catch(error){app.showDialog({title:'Training report could not be generated',body:`<p>${e(error.message)}</p>`},'modal');}
    },
    'a-report-open':reportOpen
  };
  document.addEventListener('input',event=>{
    const field=event.target.dataset.inspection;if(!field||event.target.tagName==='SELECT'||!event.target.isConnected)return;
    app.dispatch({type:'ADV_FIELD',field,value:event.target.value});
  });
  document.addEventListener('change',event=>{
    const field=event.target.dataset.inspection;if(!field||event.target.tagName!=='SELECT'||!event.target.isConnected)return;
    app.dispatch({type:'ADV_FIELD',field,value:event.target.value});
  });
  document.addEventListener('submit',event=>{if(event.target.id==='training-inspection'){event.preventDefault();CaseDesk.extraActions['a-submit']();}});
})();
