// =============================================================================
// JS
// =============================================================================
app.controller('EntityEditorCtrl', function ($scope, client) {
    // =========================================================================
    //
    // =========================================================================
    $scope.save = function () {
        // check which entities needs saving
        $scope.$ctrl.entities.forEach(entity => {
            // check if entities has properties to save
            let propertiesToSave = entity.properties.filter(prop => !prop.existing);

            // do save if necessary
            if (propertiesToSave) {
                propertiesToSave.forEach(property => {
                    let body = { entity: { id: entity.id, name: entity.name }, property: { id: property.id, name: property.name, type: property.type } }
                    let url = "/add-relationship";
                    client.post(url, body)
                        .then(success => property.existing = true);
                })
            }
        })
    }
})

// =============================================================================
// HTML
// =============================================================================
app.component('entityEditor', {
    template: `
        <h2 class="ui top attached header">Results</h2>
        <table class="ui attached very compact striped table">
            <thead>
                <th class="three wide">Entity</td>
                <th class="ten wide">{{$ctrl.property.name}}</th>
                <th class="three wide">References</th>
            </thead>
            <tbody>
                <tr ng-repeat="entity in $ctrl.entities">
                    <td>
                        {{entity.name}}
                    </td>
                    <td>
                        <entity-selector entities="entity.properties" property="$ctrl.property"></entity-selector>
                    </td>
                    <td>
                        <a ng-href="https://www.wikidata.org/wiki/{{entity.id}}" target="_blank">Wikidata</a> |
                        <a ng-href="{{entity.link}}" target="_blank">Wikipedia</a>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="ui bottom attached segment">
            <button class="ui primary button" ng-click="save()">Save</button>
        </div>
        `,
    controller: 'EntityEditorCtrl',
    bindings: {
        entities: "=",
        property: "="
    }
})
