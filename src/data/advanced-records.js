'use strict';
(() => {
  const unit = 'Fictional Exhibit Training Unit';
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  const records = [
    {serial:'ADV-FRM-101',model:'Beretta 92FS',holder:'Alex Cruz',badge:'EXH-101',status:'Issued',issuance:'ADV-ISS-101'},
    {serial:'ADV-FRM-102',model:'Glock 17',holder:'Alex Cruz',badge:'EXH-101',status:'Issued',issuance:'ADV-ISS-102'},
    {serial:'ADV-FRM-103',model:'CZ 75 B',holder:null,badge:null,status:'Available',issuance:null}
  ].map(r=>({...r,unit,article:'Pistol',description:'Fictional advanced training reference',condition:'Serviceable'}));
  const history = [
    {id:'ADV-EVT-1',order:1,serial:'ADV-FRM-101',issuance:'ADV-ISS-101',action:'Submitted',name:'Demo Submitter',username:'training.accountable',role:'Accountable Officer',timestamp:'2026-11-05T09:00:00+08:00'},
    {id:'ADV-EVT-2',order:2,serial:'ADV-FRM-101',issuance:'ADV-ISS-101',action:'Approved',name:'Demo Approver',username:'training.logistics',role:'Logistics Officer',timestamp:'2026-11-05T09:15:00+08:00'},
    {id:'ADV-EVT-3',order:3,serial:'ADV-FRM-102',issuance:'ADV-ISS-102',action:'Submitted',name:'Demo Submitter',username:'training.accountable',role:'Accountable Officer',timestamp:'2026-11-06T10:00:00+08:00'},
    {id:'ADV-EVT-4',order:4,serial:'ADV-FRM-102',issuance:'ADV-ISS-102',action:'Approved',name:'Demo Approver',username:'training.logistics',role:'Logistics Officer',timestamp:'2026-11-06T10:20:00+08:00'}
  ].map(e=>({...e,workflow:'Issuance',recipient:'Alex Cruz',after:e.action==='Approved'?'Issued':'Available'}));
  const documents = [
    {id:'ADV-AUTH-009',type:'Supporting authority',name:'Mika Santos',badge:'EXH-102',serial:'ADV-FRM-103',filename:'adv-auth-009.pdf',note:'Prepared fictional document as recorded in the secondary issuance. No real signature or approval.'},
    {id:'ADV-ARE-102',type:'Acknowledgement Receipt for Equipment',name:'Alex Cruz',badge:'EXH-101',serial:'ADV-FRM-102',filename:'adv-are-102.pdf',note:'Receipt of documented equipment. A matching receipt does not independently authorize an issuance.'}
  ];
  const data = freeze({unit,records,history,documents,trustedAuthority:'ADV-AUTH-002',recordedAuthority:'ADV-AUTH-009'});
  CaseDesk.data.advanced = data;
  CaseDesk.advanced = {
    is: state => CaseDesk.cases[state.activeCase]?.track === 'advanced',
    dataFor: state => CaseDesk.cases[state.activeCase]?.track === 'advanced' ? data : CaseDesk.data,
    // User-supplied local references. Local use does not imply publication clearance; see firearm NOTICE.
    photos: freeze({beretta:{path:'public/firearms/beretta-92fs.jpg',localUse:true,publication:'User-owned IMG_9408.jpeg; authorship confirmed; rights retained'},glock:{path:'public/firearms/glock-17.jpg',localUse:true,publication:'US DOJ public-domain source reviewed'},observation:{path:'public/firearms/cz-75-b.jpg',localUse:true,publication:'Rama - CC BY-SA 2.0 France; attribution required'}}),
    photosReady() { return ['glock','observation'].every(k=>this.photos[k]?.localUse===true && /^public\/firearms\/[a-z0-9-]+\.(jpg|png|webp)$/.test(this.photos[k].path)); }
  };
})();
