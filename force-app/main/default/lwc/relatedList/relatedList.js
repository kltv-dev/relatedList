import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

import RelatedListHelper from "./relatedListHelper";
import { loadStyle } from 'lightning/platformResourceLoader';
import relatedListResource from '@salesforce/resourceUrl/relatedListResource';

export default class RelatedList extends NavigationMixin(LightningElement) {
/*
    @track contactColumns = [
        { label: 'Link', fieldName: 'LinkName', type: 'url', 
            typeAttributes: { label: { fieldName: 'IndentNameLinkTest__c' }, target: '_top' }, 
            cellAttributes: { class: { fieldName: 'CellClassTest__c' } } },
        { label: 'Emailx', fieldName: 'Email', type: 'email', cellAttributes: { class: { fieldName: 'CellClassTest__c' } } },
        { label: 'CellClassTest', fieldName: 'CellClassTest__c', type: "text" }, 
        { label: 'Phone', fieldName: 'Phone', type: "phone" }
    ] 
*/
    @track state = {};
    @api sobjectApiName;
    @api relatedFieldApiName;
    @api numberOfRecords = 6;
    @api sortedBy;
    @api sortedDirection = "ASC";
    @api filterField;
    @api filterOperator;
    @api filterValue;
    @api filterType;
    @api rowActionHandler;
    @api fields;
    @api columns = [];//this.contactColumns;
    @api customActions = [];
    @api listTitle;
		@api listIconName;
		@api listDisplayType = "List";
		@api searchFields = null;
		@api columnPropertyOverrides;
		@api fieldsFormColumn1 = [];
		@api fieldsFormColumn2 = [];
		loaded = false;
		currentPageReference = null;
		//loadMoreStatus;
		loadMoreStatusDivider;// = ' | ';
    MAX_NUMBER_OF_RECORDS = 99;

    helper = new RelatedListHelper();
		
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
				if (currentPageReference.state.c__state != null) {
						this.loaded = false;
console.log('currentPageReference',currentPageReference.state.c__state);
						const relatedListState = JSON.parse(currentPageReference.state.c__state);
						this.fields = relatedListState.fields;
						this.relatedFieldApiName = relatedListState.relatedFieldApiName;
						this.numberOfRecords = relatedListState.numberOfRecords;
						this.sobjectApiName = relatedListState.sobjectApiName;
						this.sortedBy = relatedListState.sortedBy;
						this.sortedDirection = relatedListState.sortedDirection;
						this.filterField = relatedListState.filterField;
						this.filterOperator = relatedListState.filterOperator;
						this.filterValue = relatedListState.filterValue;
						this.filterType = relatedListState.filterType;
						this.listTitle = relatedListState.listTitle;
						this.listIconName = relatedListState.listIconName;
						this.listDisplayType = relatedListState.listDisplayType;
						this.searchFields = relatedListState.searchFields;
						this.state = {};
						this.recordId = relatedListState.recordId;
				}
    }

    renderedCallback() {
        loadStyle(this, relatedListResource + '/relatedList.css')
    }

		/*constructor() {
console.log("constructor");
				super();

		}*/
    connectedCallback() {
console.log("connectedCallback",this.recordId,this.sobjectApiName,this.relatedFieldApiName);
				if (
						(this.recordId && this.sobjectApiName && this.relatedFieldApiName) || 
						((this.recordId == null) && this.sobjectApiName && (this.relatedFieldApiName == null))
					 ) this.init();

				document.addEventListener("lwc://refreshView", () => {this.testMessage("addEventListener","lwc://refreshView")});
				document.addEventListener("refreshdata", () => {this.testMessage("addEventListener","refreshdata")});

        /*document.addEventListener("flowstatuschange", (event) => {
console.log("relatedList flowstatuschange",event,JSON.stringify(event.detail));//.detail.flowStatus,JSON.stringify(detail.data.flowParams),event.detail.name,event.detail.flowName);
        });*/
    }
		disconnectedCallback() {
console.log("disconnectedCallback");
				document.removeEventListener("lwc://refreshView", () => {this.testMessage("removeEventListener","lwc://refreshView")});
		}
		refreshViews() {
console.log("refreshViews");
				document.dispatchEvent(new CustomEvent("aura://refreshView"));
		}
		testMessage(title, message) {
				this.showToast(title, message, "info");
		}

    @api
    get recordId() {
        return this.state.recordId;				
    }
		
    set recordId(value) {
console.log("recordId",value,this.sobjectApiName,this.relatedFieldApiName);
        this.state.recordId = value;
        this.state.showRelatedList = false;
        if (
						(this.recordId && this.sobjectApiName && this.relatedFieldApiName) ||
            (this.currentPageReference !== null)
					 ) this.init();
    }

    get hasRecords() {
        return this.state.records != null && this.state.records.length;
    }

    get statusItemPlural() {
        return (this.state.recordCount == 1) ? "" : "s";
    }

    get searchPlaceholder() {
        return "Search " + this.state.searchFields;
    }

    get hasSearchFields() {
      return (this.searchFields !== null && this.searchFields !== '');
    }

    get isDisplayTypeList() {
        return this.state.listDisplayType === 'List';
    }
    get isDisplayTypeCard1Col() {
        return this.state.listDisplayType === 'Card1Col';
    }
    get isDisplayTypeCard2Col() {
        return this.state.listDisplayType === 'Card2Col';
    }

    setLoadMoreStatus() {
				if (this.state.records.length < this.state.recordCount) {
						this.loadMoreStatus = 'View More';//(' + this.state.numberOfRecords + ') More';
						this.loadMoreStatusDivider = ' | ';
            if (this.state.recordCount < this.MAX_NUMBER_OF_RECORDS) {
              this.loadAllStatus = 'View All (' + this.state.recordCount + ')';
            } else {
              this.loadMoreStatusDivider = '';
              this.loadAllStatus = '';  
            }
				} else {
						this.loadMoreStatus = '';
						this.loadMoreStatusDivider = '';
            this.loadAllStatus = '';
				}
    }

    async init() {
		try {
console.log("init",this.recordId,this.sobjectApiName,this.relatedFieldApiName);
						
        //this.state.showRelatedList = this.recordId != null;
				this.state.showRelatedList = true;
        if (! (
						//this.recordId && 
						this.sobjectApiName
            //&& this.relatedFieldApiName
            && this.fields
            //&& this.columns
						)) {
            this.state.records = [];
            return;
        }

        this.state.fields = this.fields;
        this.state.relatedFieldApiName = this.relatedFieldApiName;
        this.state.recordId = this.recordId;
        this.state.numberOfRecords = parseInt(this.numberOfRecords);
				/*if ((this.state.currentNumberOfRecords != null) && (this.state.searchTerm != null)) {
				  this.state.numberOfRecords = this.state.currentNumberOfRecords;
					this.state.currentNumberOfRecords = null;
				}*/
        if (this.state.currentNumberOfRecords > this.state.numberOfRecords) {
          this.state.numberOfRecords = this.state.currentNumberOfRecords;
        }
        //this.state.currentNumberOfRecords = this.state.records.length;
        this.state.offsetRecords = 0;
        this.state.sobjectApiName = this.sobjectApiName;
        this.state.sortedBy= this.sortedBy;
        this.state.sortedDirection = this.sortedDirection;
        this.state.sortedStatus = "";
        if (this.sortedBy) this.state.sortedStatus = "Sorted by " + this.sortedBy + " (" + this.sortedDirection.toLowerCase() + ") • ";
        this.state.filterField = this.filterField;
        this.state.filterOperator = this.filterOperator;
        this.state.filterValue = this.filterValue;
        this.state.filterType= this.filterType;
        this.state.filteredStatus = "";
        if (this.filterField) this.state.filteredStatus = "Filtered by " + this.filterField + " (" + this.filterOperator + " " + this.filterValue + ") • ";
        this.state.listTitle = this.listTitle;
				this.state.listIconName = this.listIconName;
				this.state.listDisplayType = this.listDisplayType;
				this.state.searchFields = this.searchFields;
        this.state.customActions= this.customActions;		
console.log("state",JSON.stringify(this.state));

        const data = await this.helper.fetchData(this.state);
console.log("data",data);
				
				this.state.numberOfRecords = parseInt(this.numberOfRecords);
        this.state.dataFetchTime = new Date().toLocaleTimeString();
        this.state.records = data.records;
				this.state.currentNumberOfRecords = this.state.records.length;
				this.state.recordCount = data.recordCount;
				this.setLoadMoreStatus();
        this.state.iconName = data.iconName;
        this.state.fieldTypes = data.fieldTypes;
console.log("fieldTypes",data.fieldTypes);
				this.fieldsFormColumn1 = [];
				this.fieldsFormColumn2 = [];
				for (let i=0;i<data.fieldTypes.length;i++) {
						if ((this.listDisplayType === 'Card2Col') && (i % 2)) {
								this.fieldsFormColumn2.push(data.fieldTypes[i].fieldApiName);
						} else {
								this.fieldsFormColumn1.push(data.fieldTypes[i].fieldApiName);
						}
				}
console.log("fieldsFormColumn1",this.fieldsFormColumn1,"fieldsFormColumn2",this.fieldsFormColumn2);
				
        this.state.sobjectLabel = data.sobjectLabel;
        this.state.sobjectLabelPlural = data.sobjectLabelPlural;
        this.state.title = data.title;
        this.state.parentRelationshipApiName = data.parentRelationshipApiName;
        this.state.columns = this.helper.generateColumnLinks(this.state.fieldTypes, this.state);
console.log('columns', JSON.stringify(this.state.columns));
				const mergedColumns = [];
//console.log('columnPropertyOverrides',this.columnPropertyOverrides);
				if (this.columnPropertyOverrides) {
						const columnPropertyOverrides = JSON.parse(this.columnPropertyOverrides);
console.log('columnPropertyOverrides',columnPropertyOverrides);
						this.state.columns.forEach(function (column, index) {
console.log('column',column);
console.log('columnPropertyOverrides[]'+index,columnPropertyOverrides[index]);
							let mergedColumn = {...column, ...columnPropertyOverrides[index], typeAttributes: {...column.typeAttributes, ...columnPropertyOverrides[index].typeAttributes}, cellAttributes: {...column.cellAttributes, ...columnPropertyOverrides[index].cellAttributes},}
							mergedColumns[index] = mergedColumn;										 
console.log('mergedColumn',mergedColumn);
						});
						this.state.columns = mergedColumns;
console.log('columnsOverrides',JSON.stringify(this.state.columns));
				}
        this.state.columns = this.helper.initColumnsWithActions(this.state.columns, this.customActions);
		} catch (error) {
console.log("error",error);
        this.showToast("Something went wrong", error+"", "error");
    }
				this.loaded = true;
		
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (this.rowActionHandler) {
            this.rowActionHandler.call()
        } else {
            switch (actionName) {
                case "delete":
                    this.handleDeleteRecord(row);
                    break;
                case "edit":
                    this.handleEditRecord(row);
                    break;
                case "flow":
                    this.handleFlowRecord(row);
                    break;
                default:
            }
        }
    }

    handleGotoRelatedList() {				
/*
        this[NavigationMixin.Navigate]({
            type: "standard__recordRelationshipPage",
            attributes: {
                recordId: this.recordId,
                relationshipApiName: this.state.parentRelationshipApiName,
                actionName: "view",
                objectApiName: this.sobjectApiName
            }
        });
*/
				const relatedListState = {};
        relatedListState.fields = this.state.fields;
        relatedListState.relatedFieldApiName = this.state.relatedFieldApiName;
        relatedListState.recordId = this.state.recordId;
        //relatedListState.numberOfRecords = this.state.numberOfRecords;
				relatedListState.numberOfRecords = this.MAX_NUMBER_OF_RECORDS;
        relatedListState.sobjectApiName = this.state.sobjectApiName;
        relatedListState.sortedBy = this.state.sortedBy;
        relatedListState.sortedDirection = this.state.sortedDirection;
        relatedListState.filterField = this.state.filterField;
        relatedListState.filterOperator = this.state.filterOperator;
        relatedListState.filterValue = this.state.filterValue;
        relatedListState.filterType = this.state.filterType;
        relatedListState.listTitle = this.state.listTitle;
				relatedListState.listIconName = this.state.listIconName;
				relatedListState.listDisplayType = this.state.listDisplayType;
				relatedListState.searchFields = this.state.searchFields;
console.log("handleGotoRelatedList",JSON.stringify(relatedListState));
        this[NavigationMixin.Navigate]({
            type: "standard__navItemPage",
            attributes: {
                apiName: "Related_List"
            },
            state: { c__state: JSON.stringify(relatedListState) }
        });
/*
        this[NavigationMixin.Navigate]({
        type: 'standard__component',
        attributes: {
            componentName: 'relatedList'
        },
        state: {
            c__id: this.state.recordId
        }
        });
*/
    }

    handleCreateRecord() {
        const newEditPopup = this.template.querySelector("c-related-list-new-edit-popup");
        newEditPopup.recordId = null
        newEditPopup.recordName = null        
        newEditPopup.sobjectApiName = this.sobjectApiName;
        newEditPopup.sobjectLabel = this.state.sobjectLabel;
				newEditPopup.parentId = this.recordId;
        newEditPopup.show();
				/*
				this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'new'
            }
						//,
            //state: {
            //    defaultFieldValues: defaultValues
            //}
        });
				*/

    }

    handleEditRecord(row) {
        
				const newEditPopup = this.template.querySelector("c-related-list-new-edit-popup");
        newEditPopup.recordId = row.Id;
        newEditPopup.recordName = row.Name;
        newEditPopup.sobjectApiName = this.sobjectApiName;
        newEditPopup.sobjectLabel = this.state.sobjectLabel;
        newEditPopup.show();
				/*
				this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                //objectApiName: 'Account', // objectApiName is optional
                actionName: 'edit'
            }
        });
				*/
    }

    handleDeleteRecord(row) {
        const newEditPopup = this.template.querySelector("c-related-list-delete-popup");
        newEditPopup.recordId = row.Id;
        newEditPopup.recordName = row.Name;
        newEditPopup.sobjectLabel = this.state.sobjectLabel;
        newEditPopup.show();
    }

    handleFlowRecord(row) {
        const flowPopup = this.template.querySelector("c-related-list-flow-popup");
        flowPopup.recordId = row.Id;
        flowPopup.recordName = row.Name;
        flowPopup.sobjectApiName = this.sobjectApiName;
				flowPopup.sobjectLabel = this.state.sobjectLabel;
				flowPopup.flowName = "a";//this.state.flowName;
				flowPopup.flowParamsJSON = '[{"name":"recordId","type":"String","value":"'+row.Id+'"},{"name":"param1","type":"Number","value":11.22}]';//this.state.flowParams;
        flowPopup.show();
    }

    handleRefreshData() {
console.log("handleRefreshData");
				this.loaded = false;
				//this.state.currentNumberOfRecords = null;
        this.state.offsetRecords = null;
        this.init();				
    }

    handleCommit(event) {
//console.log("handleCommit",event.target.value);
        //const isEnterKey = event.keyCode === 13;
        //if (isEnterKey) {
				this.loaded = false;
				this.state.searchTerm = event.target.value;
				this.init();
        //}
    }

		async loadMoreData() {
//console.log("loadMoreData",JSON.stringify(event));
        //event.target.isLoading = true;
        this.loadMoreStatus = 'Loading...';
				this.state.currentNumberOfRecords = this.state.records.length;
				if (this.state.currentNumberOfRecords < this.state.recordCount) {
            this.state.offsetRecords = this.state.currentNumberOfRecords;
        		const moreData = await this.helper.fetchMoreData(this.state);
console.log("moreData",moreData);
						this.state.records = this.state.records.concat(moreData.records);
						this.state.currentNumberOfRecords = this.state.records.length;
        		this.state.dataFetchTime = new Date().toLocaleTimeString();
						//event.target.isLoading = false;
				} else {
						//event.target.isLoading = false;
						//event.target.enableInfiniteLoading = false;
				}
				this.setLoadMoreStatus();
    }
		
		showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

}