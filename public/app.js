let app = angular.module('app', ['ngSanitize', 'ngTagsInput']);

app.controller('AppCtrl', function ($rootScope, $scope, client) {
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
                name: "Series",
                id: "P179"
            },
            {
                name: "Genres",
                id: "P136"
            },
            {
                name: "Characters",
                id: "P674"
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
                name: "Engines",
                id: "P408"
            },
            {
                name: "Game Modes",
                id: "P404"
            }
        ]
    }
    $scope.data.property = $scope.data.menu[0];

    // methods
    $scope.setProperty = function (property) {
        $scope.data.property = property;
        $scope.data.games = [];
        $rootScope.$broadcast("search")
    }
})