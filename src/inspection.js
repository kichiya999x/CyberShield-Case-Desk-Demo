'use strict';
(() => {
  const draft = () => ({department:'',serial:'',badge:'',inspectionDate:'',reportDetail:'',remarks:'',photoId:null,areChoice:''});
  const fresh = () => ({recapChoice:null,actorNotebook:{},expectedViewed:false,physicalComparison:null,comparisonFeedback:'',inspection:{draft:draft(),errors:{},submitted:[],reports:[],tab:'new'}});
  const today = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const validDate = value => {if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [y,m,d]=value.split('-').map(Number),date=new Date(y,m-1,d);return date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d&&value<=today();};
  const validate = (draft,state) => {
    const errors={};
    if(draft.department!==CaseDesk.data.advanced.unit)errors.department='Choose the fictional unit.';
    if(draft.serial!=='ADV-FRM-102')errors.serial='Choose the assigned training serial ADV-FRM-102.';
    if(draft.badge.trim()!=='EXH-101')errors.badge='Enter the fictional badge EXH-101.';
    if(!validDate(draft.inspectionDate))errors.inspectionDate='Enter a valid date that is not in the future.';
    if(draft.reportDetail!=='Routine physical inspection')errors.reportDetail='Choose Routine physical inspection.';
    if(!draft.remarks.trim())errors.remarks='Record your observation in Remarks. Exact wording is not graded.';
    else if(draft.remarks.length>5000)errors.remarks='Use at most 5,000 characters.';
    else if(!CaseDesk.pdf.supported(draft.remarks))errors.remarks='For this text-only PDF, use Latin characters and Western punctuation. No text is silently replaced.';
    if(!CaseDesk.advanced.photosReady()||draft.photoId!=='observation')errors.photoId='Attach the provided, approved observation photograph. Assets are currently required.';
    if(!['ADV-ARE-102','none'].includes(draft.areChoice))errors.areChoice='Choose the matching prepared receipt or No ARE presented.';
    if(state.advanced.physicalComparison!=='different')errors.comparison='Complete the explicit photograph comparison first.';
    if(state.advanced.inspection.submitted.length)errors.submission='This visit already has a saved inspection. Reset for another visitor.';
    return errors;
  };
  const snapshot = draft => Object.freeze({...structuredClone(draft),id:'ADV-INSP-001',recipient:'Alex Cruz',model:'Glock 17',observedModel:'CZ model reference',observedSerial:'Unknown - not established',custodyAssessment:'Verified entered custody fields',physicalObservation:'Different model/photo; observed serial not established; further verification required',photoFilename:CaseDesk.advanced.photos.observation?.path.split('/').pop()||'',training:true});
  const lines = s => ['CyberShield: Case Desk - Case 06 / ADV-INSP-001','Contains educational annotations beyond the current production export.','No operational record or custody is changed.','',`Unit: ${s.department}`,`Recipient: ${s.recipient}`,`Entered registry serial: ${s.serial}`,`Expected registered model: ${s.model}`,`Observed model reference: ${s.observedModel}`,`Observed serial: ${s.observedSerial}`,`Badge: ${s.badge}`,`Inspection date: ${s.inspectionDate}`,`Detail: ${s.reportDetail}`,`Custody assessment: ${s.custodyAssessment}`,`Physical observation: ${s.physicalObservation}`,`ARE: ${s.areChoice==='none'?'No ARE presented':s.areChoice}`,`Prepared evidence filename: ${s.photoFilename}`,'','Saved Remarks:',s.remarks,'','Human observation and entered custody are separate checks.','Downloaded files cannot be deleted from your device by resetting Case Desk.'];
  CaseDesk.inspection={draft,fresh,today,validDate,validate,snapshot,lines};
})();
