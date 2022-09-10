import { LightningElement, track, api, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

export default class AccountPage extends NavigationMixin(LightningElement) {
/*
    @track contactColumns = [
        { label: 'CONTACT NAME', fieldName: 'LinkName', type: 'url', typeAttributes: { label: { fieldName: 'Name' }, target: '_top' } },
        { label: 'Link', fieldName: 'LinkName', type: 'url', typeAttributes: { label: { fieldName: 'IndentNameLinkTest__c' }, target: '_top' } },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: "phone" }
    ]

    @track contactColumns = [
        { label: 'Link', fieldName: 'LinkName', type: 'url', 
            typeAttributes: { label: { fieldName: 'IndentNameLinkTest__c' }, target: '_top' }, 
            cellAttributes: { class: { fieldName: 'CellClassTest__c' } } },
        { label: 'Emailx', fieldName: 'Email', type: 'email', cellAttributes: { class: { fieldName: 'CellClassTest__c' } } },
        { label: 'CellClassTest', fieldName: 'CellClassTest__c', type: "text" }, 
        { label: 'Phone', fieldName: 'Phone', type: "phone" }
    ] 

    @track opptyColumns = [
        { label: 'OPPORTUNITY  Name', fieldName: 'LinkName', type: 'url', typeAttributes: {label: { fieldName: 'Name' }, target: '_top'} },
        { label: 'Stage', fieldName: 'StageName', type: 'text' },
        { label: 'Amount', fieldName: 'Amount', type: 'currency', cellAttributes: { alignment: 'left' } },
        { label: 'Close Date', fieldName: 'CloseDate', type:"date-local", typeAttributes:{month:"2-digit", day:"2-digit"} }
    ]
    
    @track caseColumns = [
        { label: 'Case', fieldName: 'LinkName', type: 'url', typeAttributes: {label: { fieldName: 'CaseNumber' }, target: '_top'} },
        { label: 'Contact Name', fieldName: 'Contact_LinkName', type: 'url', typeAttributes: {label: { fieldName: "Contact_Name" }, target: '_top'}},
        { label: 'Subject', fieldName: 'Subject', type:"text"},
        { label: 'Priority', fieldName: 'Priority', type: 'text' }
    ]
*/
@api cpo = '[{"label":"Custom Label 1"},{"label":"Custom Label 2"},{},{},{},{"label":"Custom Label 6","type":"date","typeAttributes":{"weekday": "long","year": "numeric","month": "long","day": "2-digit"}}]';

flowParams = [{
        name: 'recordId',
        type: 'String',
        value: '0015000000GZXE3AAP'
    }, {
        name: 'param1',
        type: 'Number',
        value: 11
    }];
		
    get flowParamsJSON() {
        return '[{"name":"recordId","type":"String","value":"0015000000GZXE3AAP"},{"name":"param1","type":"Number","value":11}]';//JSON.stringify(this.flowParams);
    }
		
    accountId
    customActions = [{ label: 'Custom action', name: 'custom_action' }]

currentPageReference;
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
console.log('currentPageReference',currentPageReference.state.c__state);
//this.accountId = currentPageReference.state.c__state;
    }

    @api
    customHandler() {
        alert("It's a custom action!")
    }

    handleAccountIdChange(event) {
        this.accountId = event.detail.value[0]
    }

    handleGotoAccountIdChange(event) {
        if (event.detail.value[0]) {
            this[NavigationMixin.Navigate]({
                type: "standard__recordPage",
                attributes: {
                    recordId: event.detail.value[0],
                    actionName: "view",
                    objectApiName: "Account"
                }
            });
        }
    }

}