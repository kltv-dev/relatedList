import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import relatedListResource from '@salesforce/resourceUrl/relatedListResource';

export default class RelatedListFlowPopup extends LightningElement {
    showModal = false
    @api sobjectLabel
    @api sobjectApiName    
    @api recordId
    @api recordName
		@api flowName
		@api flowParamsJSON

    connectedCallback() {
console.log("RelatedListFlowPopup connectedCallback");
        document.addEventListener("flowstatuschange", (event) => {
console.log("RelatedListFlowPopup flowstatuschange",event,JSON.stringify(event.detail));//.detail.flowStatus,JSON.stringify(detail.data.flowParams),event.detail.name,event.detail.flowName);
						if (event.detail.flowStatus === "FINISHED") this.handleClose();
        });
    }

    @api show() {
        this.showModal = true;
    }

    @api hide() {
        this.showModal = false;
    }
    handleClose() {
				const evt2 = new CustomEvent("refreshdata");
console.log(evt2);
        this.dispatchEvent(evt2);                  

        this.showModal = false;     
    }
    handleDialogClose(){
        this.handleClose()
    }

    isNew(){
        return this.recordId == null
    }
    get header(){
        return `${this.flowName}`;//this.isNew() ? `New ${this.sobjectLabel}` : `Edit ${this.recordName}`
    }

    handleSave(){
        //this.template.querySelector('lightning-record-form').submit();
       
    }    
    handleSuccess(event){
        this.hide()
        let name = this.recordName
        if(this.isNew()){
            if(event.detail.fields.Name){
                name = event.detail.fields.Name.value
            }else if(event.detail.fields.LastName){
                name = [event.detail.fields.FirstName.value, event.detail.fields.LastName.value].filter(Boolean).join(" ")
            }
        } 
        name = name ? `"${name}"` : ''
        
        const message = `${this.sobjectLabel} ${name} was ${(this.isNew() ? "created" : "saved")}.`
        const evt = new ShowToastEvent({
            title: message,
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.dispatchEvent(new CustomEvent("refreshdata"));                  
    }    

    renderedCallback() {
        //loadStyle(this, relatedListResource + '/relatedListFlowPopup.css')
    }         
}