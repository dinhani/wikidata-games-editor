let app = angular.module('app', ['ngSanitize', 'ngTagsInput', 'cfp.hotkeys', 'ui-notification']);

// =============================================================================
// CONFIGURE
// =============================================================================
app.config(function (NotificationProvider) {
    NotificationProvider.setOptions({
        delay: 3000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'top'
    });
});

// =============================================================================
// JS
// =============================================================================
app.controller('AppCtrl', function ($rootScope, $scope, client) {
    // =========================================================================
    // DATA
    // =========================================================================
    $scope.data = {
        entities: [], // loaded entities
        entitiesCount: null, // total number of entities that matches the query
        propertyToLoad: {}  // active relationship
    }
})