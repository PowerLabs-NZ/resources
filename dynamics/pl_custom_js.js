//Copyright PowerLabs

$(function(){
    "use strict";
    $('button[data-dismiss="modal"]').on('click', function() {
        $(this).closest('.modal').hide();
    });
});

function pl_custom_loaded() {
    console.log("PL Custom JS Loaded")
    return true;
}

function pl_getentity_guid(primaryControl) {
    var entityid = primaryControl.entityReference.id;
    entityid = entityid.replace("{", "");
    entityid = entityid.replace("}", "");
    return entityid;
}

function pl_getentity_uri(primaryControl) {
    var entityid = pl_getentity_guid(primaryControl);
    var entitytype = primaryControl.entityReference.entityType;
    return entitytype + "('" + entityid + "')"
}

function pl_formatDate(date) {
    "use strict";
    var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    return [year, month, day].join('-');
}
function pl_createData(organizationURI, url, data, callback) {
    "use strict";
    $.ajax({
        type: "POST",
        contentType: 'application/json',
        dataType: 'json',
        url: organizationURI + "/api/data/v9.0/" + url,
        data: JSON.stringify(data),
        headers: {
            "Accept": "application/json; odata.metadata=full",
            "Content-Type": "application/json; charset=utf-8",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Prefer": "return=representation"
        },
        success: function(data) {
            callback(data);
        }
    });
}
function pl_updateData(organizationURI, url, data, callback) {
    "use strict";
    $.ajax({
        type: "PATCH",
        contentType: 'application/json',
        dataType: 'json',
        url: organizationURI + "/api/data/v9.1/" + url,
        data: JSON.stringify(data),
        headers: {
            "Accept": "application/json; odata.metadata=full",
            "Content-Type": "application/json; charset=utf-8",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "If-Match": "*",
            "Prefer": "return=representation"
        },
        success: function(data) {
            callback(data);
        }
    });
}
function pl_retrieveData(organizationURI, url, callback) {
    "use strict";
    $.ajax({
        type: "GET",
        url: organizationURI + "/api/data/v9.1/" + url,
        headers: {
            "Accept": "application/json; odata.metadata=full",
            "Content-Type": "application/json; charset=utf-8",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        },
        success: function(data) {
            callback(data);
        }
    });
}
function pl_deleteData(organizationURI, url, callback) {
    "use strict";
    $.ajax({
        type: "DELETE",
        url: organizationURI + "/api/data/v9.1/" + url,
        headers: {
            "Accept": "application/json; odata.metadata=full",
            "Content-Type": "application/json; charset=utf-8",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        },
        success: function() {
            callback();
        }
    });
}
function pl_getOptionSet(organizationURI, entity, attributeID, callback) {
    "use strict";
    var url = "EntityDefinitions(LogicalName='"+entity+"')/Attributes("+attributeID+")/Microsoft.Dynamics.CRM.PicklistAttributeMetadata/OptionSet";
    var optionset = {
        isGlobal: null,
        name: null,
        metadataid: null,
        options: []
    };

    pl_retrieveData(organizationURI, url, function(data) {
        if(data) {
            optionset.isGlobal = data.IsGlobal;
            optionset.name = data.Name;
            optionset.metadataid = data.MetadataId;
            for (var i = 0; i < data.Options.length; i++) {
                var option = data.Options[i];
                var object = {
                    value: option.Value,
                    name: option.Label.LocalizedLabels[0].Label
                };
                optionset.options.push(object);
            }
            callback(optionset);
        }
        else {
            callback(false);
        }
    });
}

function pl_getMultiOptionSet(organizationURI, entity, attributeID, callback) {
    "use strict";
    var url = "EntityDefinitions(LogicalName='"+entity+"')/Attributes("+attributeID+")/Microsoft.Dynamics.CRM.MultiSelectPicklistAttributeMetadata/OptionSet";
    var optionset = {
        isGlobal: null,
        name: null,
        metadataid: null,
        options: []
    };

    pl_retrieveData(organizationURI, url, function(data) {
        if(data) {
            optionset.isGlobal = data.IsGlobal;
            optionset.name = data.Name;
            optionset.metadataid = data.MetadataId;
            for (var i = 0; i < data.Options.length; i++) {
                var option = data.Options[i];
                var object = {
                    value: option.Value,
                    name: option.Label.LocalizedLabels[0].Label
                };
                optionset.options.push(object);
            }
            callback(optionset);
        }
        else {
            callback(false);
        }
    });
}
