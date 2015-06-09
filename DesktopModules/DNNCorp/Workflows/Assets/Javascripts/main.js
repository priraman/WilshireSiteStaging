$(function () {
    var workflowsDOM, moduleId, utilAdapter, workflowsManager, localizationOptions;
    var getLocalization200Callback;

    workflowsDOM = $('#workflowIndexTemplate');
    moduleId = workflowsDOM.data('module-id');

    utilAdapter = new dnn.utils.UtilAdapter(moduleId);

    // Get Localization
    utilAdapter.sf.moduleRoot = 'Workflows';
    utilAdapter.sf.controller = 'Workflows';

    getLocalization200Callback = function (data) {
        utilAdapter.setAdaptedResx(data.localization);
        // Start workflows
        workflowsManager = new dnn.modules.workflows.WorkflowsManager(utilAdapter, workflowsDOM, false /*mobile*/, data);
    };

    getLocalizationErrorCallback = function (data) {
        alert(JSON.parse(data.responseText).Message);
    };

    localizationOptions = {
        service: 'Workflows',
        controller: 'Workflows',
        resxName: 'WorkflowsResx',
        resourceSettings: {
            method: 'GetResourcesSettings',
            paramNames: {
                culture: 'culture',
                resxTimeStamp: 'resxTimeStamp'
            }
        },
        resources: {
            method: 'Localization',
            paramName: 'Localization',
            callback200: getLocalization200Callback,
            callbackError: getLocalizationErrorCallback
        }
    };

    new dnn.utils.Localization(localizationOptions);
});
