public with sharing class RelatedListController {
    public static final String FIELDS_PARAM = 'fields';
    public static final String NUMBER_OF_RECORDS_PARAM = 'numberOfRecords';
    public static final String CURRENT_NUMBER_OF_RECORDS_PARAM = 'currentNumberOfRecords';
    public static final String OFFSET_RECORDS_PARAM = 'offsetRecords';
    public static final String RECORD_ID_PARAM = 'recordId';
    public static final String SEARCH_FIELDS_PARAM = 'searchFields';
    public static final String SEARCH_TERM_PARAM = 'searchTerm';
    public static final String SOBJECT_API_NAME_PARAM = 'sobjectApiName';
    public static final String SOBJECT_LABEL_PARAM = 'sobjectLabel';
    public static final String SOBJECT_LABEL_PLURAL_PARAM = 'sobjectLabelPlural';
    public static final String PARENT_RELATIONSHIP_API_NAME_PARAM = 'parentRelationshipApiName';
    public static final String RELATED_FIELD_API_NAME_PARAM = 'relatedFieldApiName';
    public static final String SORTED_DIRECTION_PARAM = 'sortedDirection';
    public static final String SORTED_BY_PARAM = 'sortedBy';
    public static final String RECORDS_PARAM = 'records';
    public static final String RECORD_COUNT_PARAM = 'recordCount';
    public static final String ICON_NAME_PARAM = 'iconName';
    public static final String FILTER_FIELD_PARAM = 'filterField';
    public static final String FILTER_OPERATOR_PARAM = 'filterOperator';
    public static final String FILTER_VALUE_PARAM = 'filterValue';
    public static final String FILTER_TYPE_PARAM = 'filterType';
    public static final String FIELD_TYPES_PARAM = 'fieldTypes';
    public static final String FIELD_LABEL = 'label';
    public static final String FIELD_NAME = 'fieldName';
    public static final String FIELD_API_NAME = 'fieldApiName';
    public static final String FIELD_TYPE = 'type';
    public static final String FIELD_SCALE = 'scale';

    @AuraEnabled
    public static String initData(String jsonData) {
    try {
        system.debug(jsonData);
        Map<String, Object> requestMap = (Map<String, Object>)JSON.deserializeUntyped(jsonData);  
        Map<String, Object> responseMap = new Map<String, Object>();
        
        String sobjectApiName = (String)requestMap.get(SOBJECT_API_NAME_PARAM);
        responseMap.put(ICON_NAME_PARAM, getIconName(sobjectApiName));
        String recordId = (String)requestMap.get(RECORD_ID_PARAM);
        String relatedFieldApiName = (String)requestMap.get(RELATED_FIELD_API_NAME_PARAM);
        if ((recordId != null) && (relatedFieldApiName != null))
            responseMap.put(PARENT_RELATIONSHIP_API_NAME_PARAM, getParentRelationshipName(recordId, sobjectApiName, relatedFieldApiName));

        Schema.SObjectType sobjectType = Schema.getGlobalDescribe().get(sobjectApiName);
        Schema.DescribeSObjectResult sobjectDescribe = sobjectType.getDescribe();
        responseMap.put(SOBJECT_LABEL_PARAM, sobjectDescribe.getLabel());
        responseMap.put(SOBJECT_LABEL_PLURAL_PARAM, sobjectDescribe.getLabelPlural());
        responseMap.put(FIELD_TYPES_PARAM, getFieldTypeMap(sobjectDescribe, (String)requestMap.get(FIELDS_PARAM)));
        
        getQueries(jsonData, responseMap);
system.debug(responseMap.get(RECORDS_PARAM));
system.debug(responseMap.get(RECORD_COUNT_PARAM));
system.debug(JSON.serialize(responseMap));
        return JSON.serialize(responseMap);
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
    }
    
    public static List<Map<String, String>> getFieldTypeMap(Schema.DescribeSObjectResult sobjectDescribe, String fieldsList) {
        Map<String, Schema.SObjectField> sobjectFieldMap = sobjectDescribe.fields.getMap();
        List<Map<String, String>> fieldMapList = new List<Map<String, String>>();
        for (String fieldName: fieldsList.split(',')) {
            fieldName = fieldName.trim();
            List<String> fieldNameSplit = fieldName.split('\\.');
            String lookupFieldName = fieldNameSplit[0];
            if (fieldNameSplit.size() > 1) {
                if (lookupFieldName.endsWith('__r')) {
                    lookupFieldName = lookupFieldName.replace('__r', '__c');
                } else {
                    lookupFieldName = lookupFieldName + 'Id';
                }
            }
            Schema.SObjectField sobjectField = sobjectFieldMap.get(lookupFieldName);
            if (sobjectField != null) {
                Schema.DescribeFieldResult fieldResult = sobjectField.getDescribe();
system.debug(fieldResult);
                Map<String, String> fieldMap = new Map<String, String>();
                fieldMap.put(FIELD_NAME, fieldName);
                fieldMap.put(FIELD_API_NAME, lookupFieldName);
                fieldMap.put(FIELD_LABEL, fieldResult.getLabel());
                String fieldType = 'text';
                if (fieldResult.getType() == Schema.DisplayType.BOOLEAN) fieldType = 'boolean';
                if (fieldResult.getType() == Schema.DisplayType.CURRENCY) fieldType = 'currency';
                if (fieldResult.getType() == Schema.DisplayType.DATE) fieldType = 'date';
                if (fieldResult.getType() == Schema.DisplayType.DATETIME) fieldType = 'datetime';
                if (fieldResult.getType() == Schema.DisplayType.EMAIL) fieldType = 'email';
                if (fieldResult.getType() == Schema.DisplayType.DOUBLE) fieldType = 'double';
                if (fieldResult.getType() == Schema.DisplayType.INTEGER) fieldType = 'integer';
                if (fieldResult.getType() == Schema.DisplayType.PERCENT) fieldType = 'percent';            
                if (fieldResult.getType() == Schema.DisplayType.PHONE) fieldType = 'phone';
                if (fieldResult.getType() == Schema.DisplayType.URL) fieldType = 'url';
                if (fieldResult.getType() == Schema.DisplayType.REFERENCE) fieldType = 'url';
                fieldMap.put(FIELD_TYPE, fieldType);
                fieldMap.put(FIELD_SCALE, fieldResult.getScale()+'');
                fieldMapList.add(fieldMap);
            }
        }
system.debug(fieldMapList);
        return fieldMapList;
    }
    
    public static Map<String,String> getQueries(String jsonData, Map<String, Object> responseMap) {
        Map<String, Object> root = (Map<String, Object>)JSON.deserializeUntyped(jsonData);  
        String fields = (String)root.get(FIELDS_PARAM);
        Integer numberOfRecords = (Integer)root.get(NUMBER_OF_RECORDS_PARAM);
        Integer currentNumberOfRecords = (Integer)root.get(CURRENT_NUMBER_OF_RECORDS_PARAM);
        Integer offsetRecords = (Integer)root.get(OFFSET_RECORDS_PARAM);
        String recordId = (String)root.get(RECORD_ID_PARAM);
        String searchFields = (String)root.get(SEARCH_FIELDS_PARAM);
        String searchTerm = (String)root.get(SEARCH_TERM_PARAM);
        
        String relatedFieldApiName = (String)root.get(RELATED_FIELD_API_NAME_PARAM);
        String sobjectApiName = (String)root.get(SOBJECT_API_NAME_PARAM);        
        String orderBy = (String)root.get(SORTED_BY_PARAM) + ' ' + (String)root.get(SORTED_DIRECTION_PARAM);
        String filterField = (String)root.get(FILTER_FIELD_PARAM);
        String filterOperator = (String)root.get(FILTER_OPERATOR_PARAM);
        String filterValue = (String)root.get(FILTER_VALUE_PARAM);
        String filterType = (String)root.get(FILTER_TYPE_PARAM);
        
        String query = 'SELECT :fields FROM '+sobjectApiName;
        if (relatedFieldApiName != null) query += ' WHERE ' + relatedFieldApiName+ '= :recordId ';
        if (filterType != null) {
            if (relatedFieldApiName != null) {
                query += ' AND ';
            } else {
                query += ' WHERE ';
            }
            if (filterType == 'String')     
                query += filterField + ' = "' + filterValue + '"'; 
            else if (filterType == 'Boolean')
                query += filterField + ' = ' + filterValue; 
            else 
                query += filterField + ' ' + filterOperator + ' ' + filterValue;
        }
        if ((searchFields != null) && (searchTerm != null) && (searchTerm.length() > 0)) {
            if ((relatedFieldApiName != null) || (filterField != null)) {
                query += ' AND (';
            } else {
                query += ' WHERE (';
            }
            searchTerm = '%' + searchTerm.trim() + '%';
            String[] searchFieldsList = searchFields.split(',');
            for (Integer i = 0; i < searchFieldsList.size(); i++) {
                query += ' (' + searchFieldsList[i] + ' LIKE :searchTerm' + ')';
                if ((searchFieldsList.size() > 1) && (i < (searchFieldsList.size() - 1))) {
                    query += ' OR';
                }
            }
            query += ')';
        }
        String countQuery = query.replace(':fields', 'COUNT()');
        countQuery = String.escapeSingleQuotes(countQuery);
        countQuery = countQuery.replace('"','\'');
system.debug(countQuery);        
        //Integer countResult = Database.countQuery(countQuery);
//system.debug(countResult);
        Map<String,String> queryMap = new Map<String,String>();
        queryMap.put('countQuery', countQuery);

        query = query.replace(':fields', fields);
        query += ' WITH SECURITY_ENFORCED ';
        query += ' ORDER BY ' +orderBy;
        query += ' LIMIT :numberOfRecords';
        if (offsetRecords != null) query += ' OFFSET :offsetRecords';
        query = String.escapeSingleQuotes(query);
        query = query.replace('"','\'');
system.debug(query);
        //return Database.query(String.escapeSingleQuotes(query));
        //return Database.query(query);
        queryMap.put('query', query);

        //Integer numberOfRecords = (Integer)requestMap.get(NUMBER_OF_RECORDS_PARAM);
        //Integer currentNumberOfRecords = (Integer)requestMap.get(CURRENT_NUMBER_OF_RECORDS_PARAM);
        //String searchTerm = (String)requestMap.get(SEARCH_TERM_PARAM);
        //if ((searchTerm != null) && (searchTerm.length() > 0)) searchTerm = '%' + searchTerm.trim() + '%';
        //Map<String,String> queryMap = getQueries(jsonData);
        //responseMap.put(RECORDS_PARAM, getRecords(jsonData));
        responseMap.put(RECORDS_PARAM, Database.query(queryMap.get('query')));
        responseMap.put(RECORD_COUNT_PARAM, Database.countQuery(queryMap.get('countQuery')));
system.debug(responseMap.get(RECORDS_PARAM));
system.debug(responseMap.get(RECORD_COUNT_PARAM));

        return queryMap;
    }
        
    private static String getParentRelationshipName(Id recordId, String childSobjectApiName, String relatedFieldApiName){
        Schema.DescribeSObjectResult descrRes = recordId.getSObjectType().getDescribe();
        String name;
        for (Schema.ChildRelationship cr: descrRes.getChildRelationships()){ 
            if(cr.getChildSObject().getDescribe().getName() == childSobjectApiName
            && cr.getField().getDescribe().getName() == relatedFieldApiName){
                name = cr.getRelationshipName();
                break;
            }
        }     
        return name;
    }      
    
    @AuraEnabled
    public static String getIconName(String sobjectApiName){
        String iconName = 'custom:custom1';
        if (sobjectApiName == 'Asset') iconName = 'standard:asset_object';
        List<Schema.DescribeTabSetResult> tabSetDesc = Schema.DescribeTabs();
        List<Schema.DescribeTabResult> tabDesc = new List<Schema.DescribeTabResult>();
        List<Schema.DescribeIconResult> iconDesc = new List<Schema.DescribeIconResult>();

        for(Schema.DescribeTabSetResult tsr : tabSetDesc) { 
            tabDesc.addAll(tsr.getTabs()); 
        }

        for(Schema.DescribeTabResult tr : tabDesc) {
            if( sobjectApiName == tr.getSobjectName() ) {
                if( tr.isCustom() ) {
                    iconDesc.addAll(tr.getIcons());
                } else {
                    iconName = 'standard:' + sobjectApiName.toLowerCase();
                }
            }
        }
        for (Schema.DescribeIconResult ir : iconDesc) {
            if (ir.getContentType() == 'image/svg+xml'){
                iconName = 'custom:' + ir.getUrl().substringBetween('custom/','.svg').substringBefore('_');
                break;
            }
        }
        return iconName;
    }    

}