// =============================================================================
// JS
// =============================================================================
app.controller('EntityEditorCtrl', function ($scope, client) {
    // =========================================================================
    // DATA
    // =========================================================================
    $scope.data = {
        sourceEntities: []
    }

    // =========================================================================
    // METHODS
    // =========================================================================
    $scope.copySourceEntities = function (properties) {
        $scope.data.sourceEntities.forEach(entity => {
            let notContains = _.filter(properties, p => p.id === entity.id).length === 0;
            if (notContains) {
                properties.push(angular.copy(entity));
            }
        })
    }

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

        <div class="ui attached segment">
            <entity-selector entities="data.sourceEntities" property="$ctrl.property"></entity-selector>
            Click "Copy" in each row to add the {{$ctrl.property.name.toLowerCase()}} from this field to the selected row
        </div>

        <table class="ui attached very compact striped center aligned table">
            <thead>
                <th class="two wide">Entity</td>
                <th class="nine wide">{{$ctrl.property.name}}</th>
                <th class="one wide">Actions</th>
                <th class="three wide">References</th>
            </thead>
            <tbody>
                <tr ng-repeat="entity in $ctrl.entities">
                    <td class="left aligned">
                        {{entity.name}}
                    </td>
                    <td>
                        <entity-selector entities="entity.properties" property="$ctrl.property"></entity-selector>
                    </td>
                    <td>
                        <a href="#" ng-click="copySourceEntities(entity.properties)">Copy</a></td>
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
