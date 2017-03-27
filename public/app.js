let app = angular.module('app', ['ngSanitize', 'ngTagsInput']);

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