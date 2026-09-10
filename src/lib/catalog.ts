import type {MetricDefinition} from './types';
export const chapters = [
 {group:'Context',items:[['/','Overview','01'],['/research-design/','Research design','02'],['/operator-profiles/','Operator profiles','03'],['/market-position/','Market position','04']]},
 {group:'Service promise',items:[['/7ps/commercial/','The commercial promise','05'],['/7ps/delivery/','The delivery system','06'],['/7ps/controls/','Control matrix','07']]},
 {group:'Experience evidence',items:[['/servqual/','SERVQUAL audit','08'],['/network-evidence/','Network evidence','09']]},
 {group:'Service system',items:[['/gap-model/','The five gaps','10'],['/journeys/mobile/','The mobile journey','11'],['/journeys/billing-and-home/','Billing & home journeys','12'],['/service-recovery/','Service recovery','13']]},
 {group:'Action',items:[['/roadmap/','Strategic roadmap','14'],['/conclusion/','Conclusion','15']]},
];
export const reportPages=chapters.flatMap(c=>c.items);
export const studioPages=[['/studio/','Overview'],['/studio/ratings/','Service ratings'],['/studio/recovery/','Support & recovery'],['/studio/retention/','Retention'],['/studio/relationships/','Relationships'],['/studio/text/','Text explorer'],['/studio/quality/','Data quality']];
export const evidencePages=[['/methodology/','Methodology'],['/sources/','Source library']];
export const metrics:MetricDefinition[] = [
 {id:'reliability',label:'Overall reliability',question:'How would you rate the overall reliability of your telecom service?',dimension:'Reliability',population:'all',column:'I'},
 {id:'coverage',label:'Network coverage',question:'How would you rate the network coverage in the places where you normally use the service?',dimension:'Reliability',population:'all',column:'J'},
 {id:'speed',label:'Speed consistency',question:'How would you rate the consistency of your internet/data speed?',dimension:'Reliability',population:'all',column:'K'},
 {id:'promise',label:'Promise delivery',question:'How accurately does the provider deliver what was promised in your plan/service?',dimension:'Reliability',population:'all',column:'L'},
 {id:'access',label:'Support accessibility',question:'If yes, how easy was it to reach customer support?',dimension:'Responsiveness',population:'support',column:'N'},
 {id:'response',label:'Response speed',question:'How satisfied were you with the speed of response?',dimension:'Responsiveness',population:'support',column:'O'},
 {id:'resolution',label:'Final resolution',question:'How satisfied were you with the final resolution of your problem?',dimension:'Responsiveness',population:'support',column:'P'},
 {id:'assurance',label:'Representative competence',question:'How knowledgeable and competent did the customer-service representative appear?',dimension:'Assurance',population:'support',column:'Q'},
 {id:'empathy',label:'Understanding your problem',question:'How well did the company understand your specific problem?',dimension:'Empathy',population:'support',column:'R'},
 {id:'digital',label:'Digital self-service',question:'How would you rate the Airtel/Jio app or digital self-service experience?',dimension:'Tangibles · digital proxy',population:'all',column:'S'},
 {id:'recovery',label:'Recovery effectiveness',question:'How effectively did the company recover from or resolve the service failure?',population:'failure',column:'W'},
 {id:'fairness',label:'Complaint fairness',question:'How fairly do you feel the complaint was handled?',population:'failure',column:'Y'},
 {id:'continue',label:'Continuation likelihood',question:'How likely are you to continue using your current provider?',population:'all',column:'AC'},
 {id:'recommend',label:'Recommendation likelihood',question:'How likely are you to recommend your current provider to others?',population:'all',column:'AD'},
];
export const proxies=['reliability','response','assurance','empathy','digital'];
export const sources = [
 {id:'airtel-q1',title:'Bharti Airtel · Q1 FY27 results',type:'Operator-reported',period:'Quarter ended 30 June 2026',published:'4 August 2026',url:'https://assets.airtel.in/static-assets/cms/investor/docs/quarterly_results/2026-27/Q1/Press-Release.pdf',definition:'India mobile ARPU ₹264. Global customer base and Homes connections are separately defined measures.',status:'Verified against official release'},
 {id:'jio-q1',title:'Reliance Industries · Q1 FY27 results',type:'Operator-reported',period:'Quarter ended 30 June 2026',published:'17 July 2026',url:'https://www.ril.com/investors/events-presentations',definition:'Jio ARPU ₹215.6; operator-reported connectivity customers 533.3 million.',status:'Verified against official presentation'},
 {id:'trai-july',title:'TRAI · Telecom subscriptions, July 2026',type:'Regulatory evidence',period:'31 July 2026',published:'28 August 2026',url:'https://www.trai.gov.in/sites/default/files/2026-08/PR_No116of2026_0.pdf',definition:'Total broadband subscriptions, wired + wireless, including M2M: 1,094.48m. Jio 535.12m; Airtel 384.23m.',status:'Verified against official release'},
 {id:'opensignal-feb',title:'Opensignal · India Mobile Network Experience',type:'Independent measurement',period:'1 October–29 December 2025',published:'February 2026',url:'https://insights.opensignal.com/reports/2026/02/india/mobile-network-experience',definition:'National measured mobile experience. Reliability uses a 100–1000 point scale. National values are not local guarantees.',status:'Dated snapshot; no newer report verified'},
 {id:'survey',title:'Customer Service & Experience Survey',type:'Workbook calculation',period:'Collection dates not supplied',published:'Supplied for this academic study',url:'/methodology/',definition:'946 records; 433 Airtel and 513 Jio. Customer-response origin confirmed by the project owner. Higher 1–5 ratings indicate more positive responses.',status:'Calculations checked; recruitment not independently verified'},
 {id:'source-deck',title:'Services Marketing & Experience Standards Audit',type:'Presentation reconstruction',period:'4 September 2026',published:'Information base refreshed 9 September 2026',url:'/methodology/',definition:'15-slide reconstruction. Original PowerPoint was not supplied. Framework diagnoses and roadmap actions are managerial interpretations or recommendations.',status:'Source claims reconciled separately'},
];
export const network = [
 {id:'reliability',label:'Reliability experience',unit:'points · 100–1000',a:814,j:864,low:100,max:1000,note:'Jio’s reported national score is higher. This telemetry measure is distinct from customer-rated reliability.'},
 {id:'consistency',label:'Consistent quality',unit:'%',a:62.7,j:68.9,low:0,max:100,note:'Jio records a higher proportion of tests meeting the report’s consistent-quality thresholds.'},
 {id:'download',label:'Download speed',unit:'Mbps',a:58.2,j:107.3,low:0,max:120,note:'Jio leads this national average. Peak speed and a particular customer’s local experience may differ.'},
 {id:'upload',label:'Upload speed',unit:'Mbps',a:8.4,j:8.0,low:0,max:10,note:'Airtel has a modest numerical edge. Read this with the source’s uncertainty and collection period.'},
 {id:'games',label:'Games experience',unit:'points · 0–100',a:70.6,j:65.9,low:0,max:100,note:'Airtel’s reported real-time gaming experience is stronger; download speed alone does not explain all uses.'},
 {id:'voice',label:'Voice app experience',unit:'points · 0–100',a:79.5,j:78.2,low:0,max:100,note:'The displayed numerical difference is small. This is app-based voice experience, not a call-drop rate.'},
 {id:'video',label:'Video experience',unit:'points · 0–100',a:64.9,j:65.0,low:0,max:100,note:'The source reports a statistical tie; the 0.1-point displayed difference is not evidence of superiority.'},
 {id:'5g-download',label:'5G download speed',unit:'Mbps',a:185.9,j:198.9,low:0,max:220,note:'Jio’s measured 5G download average is higher in this report’s population and period.'},
 {id:'5g-upload',label:'5G upload speed',unit:'Mbps',a:19.3,j:13.0,low:0,max:22,note:'Airtel leads on 5G uploads, illustrating why the comparison depends on the customer’s task.'},
];
