/* eslint-disable guard-for-in */
/* eslint-disable no-console */
import initDataMethod from "@salesforce/apex/RelatedListController.initData";

export default class RelatedListHelper {

    fetchData(state) {
        let jsonData = Object.assign({}, state);
        jsonData.numberOfRecords = state.numberOfRecords + 1;
        jsonData = JSON.stringify(jsonData);
        return initDataMethod({ jsonData })
            .then(response => {
                const data = JSON.parse(response)
                return this.processData(data, state)
            })
            .catch(error => {
                console.error(error);
								throw new Error(error.body.message);
            });
    }

    fetchMoreData(state) {
        let jsonData = Object.assign({}, state);
				jsonData.records = null;
				jsonData.fieldTypes = null;
        jsonData = JSON.stringify(jsonData);
        return initDataMethod({ jsonData })
            .then(response => {
                const data = JSON.parse(response);
                //return this.processData(data, state);
								const records = data.records;
								this.generateLinks(records);
								return data;
            })
            .catch(error => {
                console.error(error);
								throw new Error(error.body.message);
            });
    }

    processData(data, state){
        const records = data.records;
        this.generateLinks(records);
        data.title = data.sobjectLabelPlural;
        if (state.listTitle) data.title = state.listTitle;
        if (records.length > state.numberOfRecords) {
            records.pop()
            data.title = `${data.title} (${state.numberOfRecords}+)`
        } else {
            data.title = `${data.title} (${Math.min(state.numberOfRecords, records.length)})`
        }
				if (state.listIconName) data.iconName = state.listIconName;
        return data;
    }


    initColumnsWithActions(columns, customActions) {
        if (!customActions.length) {
            customActions = [
                { label: 'Edit', name: 'edit' },
                { label: 'Delete', name: 'delete' }/*,
                { label: 'Flow', name: 'flow' }*/
            ]
        }
        return [...columns, { type: 'action', typeAttributes: { rowActions: customActions } }]
    }

    generateColumnLinks(columns, state) {
        columns.forEach(column => {
            for (const propertyName in column) {
                const propertyValue = column[propertyName];
                column[propertyName] = propertyValue;
                if ((propertyName === 'type') && ((propertyValue === 'double') || (propertyValue === 'integer'))) {
                    column['type'] = 'number';
                    column['typeAttributes'] = {minimumFractionDigits: column['scale'], maximumFractionDigits: column['scale']};
                }
                if ((propertyName === 'type') && (propertyValue === 'date')) {
                    //column['type'] = 'date-local'; 
                    column['typeAttributes'] = {year: "numeric", month: "numeric", day: "numeric"};
                }
                if ((propertyName === 'type') && (propertyValue === 'datetime')) {
                    column['type'] = 'date'; 
                    column['typeAttributes'] = {year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"};
                }
                if ((propertyName === 'fieldName') && (propertyValue === state.sortedBy)) {
                    column['iconName'] = 'utility:arrowup';
                    if (state.sortedDirection === 'DESC') column['iconName'] = 'utility:arrowdown';
                    //column['sortable'] = true;
                }
                if ((propertyName === 'fieldName') && (propertyValue === state.filterField)) {
                    column['iconName'] = 'utility:filterList';
                }
                if ((propertyName === 'type') && (propertyValue === 'url')) {
                    column['typeAttributes'] = {label: { fieldName: (column['fieldName']+'').replace('.', '_') }, target: '_top'};
                    //column['label'] = (column['fieldName']+'').replace('.', ' ');
                    column['label'] = column['label'];
                    column['fieldName'] = (column['fieldName']+'').replace('.', '_Link');
                    break;
                }
                if ((propertyName === 'fieldName') && ((propertyValue === 'Name') || (propertyValue === 'CaseNumber') || (propertyValue === 'Subject'))) {
                    column['typeAttributes'] = {label: { fieldName: propertyValue }, target: '_top'};
                    column['label'] = column['label'];
                    if (column['fieldName'] === state.sortedBy) {
                        column['iconName'] = 'utility:arrowup';
                        if (state.sortedDirection === 'DESC') column['iconName'] = 'utility:arrowdown';
                    }
                    column['fieldName'] = 'LinkName';
                    column['type'] = 'url';
                    break;
                }
            }
        });
        return columns;
    }

    generateLinks(records) {
console.log("generateLinks",records);				
        records.forEach(record => {
            record.LinkName = '/' + record.Id;
						if (record.attributes.type === 'Case') record.Name = record.CaseNumber;
            for (const propertyName in record) {
                const propertyValue = record[propertyName];
                if ((propertyValue != null) && (typeof propertyValue === 'object')) {
                    const newValue = propertyValue.Id ? ('/' + propertyValue.Id) : null;
                    this.flattenStructure(record, propertyName + '_', propertyValue);
                    if (newValue !== null) {
                        record[propertyName + '_LinkName'] = newValue;
                    }
                }
            }
        });

    }

    flattenStructure(topObject, prefix, toBeFlattened) {
        for (const propertyName in toBeFlattened) {
            const propertyValue = toBeFlattened[propertyName];
            if (typeof propertyValue === 'object') {
                this.flattenStructure(topObject, prefix + propertyName + '_', propertyValue);
            } else {
                topObject[prefix + propertyName] = propertyValue;
            }
        }
    }

}