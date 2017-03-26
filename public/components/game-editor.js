// =============================================================================
// JS
// =============================================================================
app.controller('GameEditorCtrl', function ($scope, client) {
    $scope.save = function () {
        // check which games needs saving
        $scope.$ctrl.games.forEach(game => {
            // check if games has properties to save
            let propertiesToSave = game.properties.filter(prop => !prop.existing);

            // do save if necessary
            if (propertiesToSave) {
                propertiesToSave.forEach(prop => {
                    let body = { entity: game.id, propertyType: prop.property, propertyValue: prop.id }
                    let url = "/add-relationship";
                    client.post(url, body)
                        .then(success => prop.existing = true);
                })
            }
        })
    }
})

// =============================================================================
// HTML
// =============================================================================
app.component('gameTable', {
    template: `
        <table class="ui top attached very compact striped table">
            <thead>
                <th>Game</td>
                <th>{{$ctrl.property.name}}</th>
                <th>Links</th>
            </thead>
            <tbody>
                <tr ng-repeat="game in $ctrl.games">
                    <td>
                        {{game.name}}
                    </td>
                    <td>
                        <entity-selector entities="game.properties" property="$ctrl.property"></entity-selector>
                    </td>
                    <td>
                        <a ng-href="https://www.wikidata.org/wiki/{{game.id}}" target="_blank">Wikidata</a> |
                        <a ng-href="{{game.link}}" target="_blank">Wikipedia</a>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="ui bottom attached segment">
            <button class="ui primary button" ng-click="save()">Save</button>
        </div>
        `,
    controller: 'GameEditorCtrl',
    bindings: {
        games: "=",
        property: "="
    }
})
