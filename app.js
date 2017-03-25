let app = angular.module('app', ['ngSanitize', 'ngTagsInput']);

app.controller('AppCtrl', function ($scope, client) {
    // data
    $scope.data = {
        games: [],
        property: {},
        menu: [
            {
                name: "Platforms",
                id: "P400"
            },
            {
                name: "Genres",
                id: "P136"
            },
            {
                name: "Developers",
                id: "P178"
            },
            {
                name: "Publishers",
                id: "P123"
            },
            {
                name: "Series",
                id: "P179"
            }
        ]
    }
    $scope.data.property = $scope.data.menu[0];

    // methods
    $scope.setProperty = function (property) {
        $scope.data.property = property;
        $scope.data.games = [];
    }
})