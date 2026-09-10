export type Provider = 'Airtel'|'Jio';
export type SurveyRecord = {id:string;provider:Provider;services:string[];tenure:string;selectionReason:string;support:boolean;failure:boolean;switching:boolean;failureTypes:string[];remedy:string;trust:string;switchReasons:string[];ratings:Record<string,number|null>};
export type MetricDefinition = {id:string;label:string;question:string;dimension?:string;population:'all'|'support'|'failure';column:string};
export type Filters = {provider:string;tenure:string[];services:string[];support:string;failure:string;switching:string};
export type TextRecord = {id:string;provider:Provider;field:'incident'|'best'|'improvement';text:string;themes:string[];sentiment:string;compound:number|null;aspects?:unknown};
