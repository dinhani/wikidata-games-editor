let app = angular.module('app', ['ngSanitize', 'ngTagsInput', 'cfp.hotkeys']);

// =============================================================================
// JS
// =============================================================================
app.controller('AppCtrl', function ($rootScope, $scope, client) {
    // =========================================================================
    // DATA
    // =========================================================================
    $scope.data = {
        entities: [], // loaded entities
        property: {}  // active relationship
    }
})