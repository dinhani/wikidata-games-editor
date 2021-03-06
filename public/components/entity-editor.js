// =============================================================================
// JS
// =============================================================================
app.controller('EntityEditorCtrl', function ($scope, $q, Notification, client) {
    // =========================================================================
    // DATA
    // =========================================================================
    $scope.data = {
        sourceEntities: [],
        isSaving: false
    }

    // =========================================================================
    // METHODS
    // =========================================================================
    $scope.copySourceEntities = function (properties) {
        $scope.data.sourceEntities.forEach(entity => {
            let notContains = _.filter(properties, p => p.id === entity.id).length === 0;
            if (notContains) {
                let copiedEntity = angular.copy(entity);
                properties.push(copiedEntity);
            }
        })
    }

    $scope.save = function () {
        // requests being saved
        $scope.data.isSaving = true;
        let requests = [];

        // check which entities needs saving
        $scope.$ctrl.entities.forEach(entity => {
            // check if entities has properties to save
            let propertiesToSave = entity.properties.filter(prop => !prop.existing);

            // do save if necessary
            if (propertiesToSave) {
                propertiesToSave.forEach(property => {
                    let body = { entity: { id: entity.id, name: entity.name }, property: { id: property.id, name: property.name, type: property.type } }
                    let url = "/add-relationship";

                    let request =  client.post(url, body);
                    requests.push(request);

                    request.then(
                        success => {
                            property.existing = true;
                            Notification.success(entity.name);
                        },
                        error => {
                            Notification.error(entity.name);
                        });
                });
            }
        });

        // await all requests to stop loading
        $q.all(requests).finally(() => {
            $scope.data.isSaving = false;
        })
    }
})

// =============================================================================
// HTML
// =============================================================================
app.component('entityEditor', {
    template: `
        <div class="ui top attached inverted segment">
                <h2 class="ui medium header">
                    <i class="edit icon"></i>
                    <div class="content">Editor <span ng-if="$ctrl.entitiesCount"> - {{$ctrl.entitiesCount}} entities</span></div>
                </h2>
            </div>
        </div>

        <div class="ui attached segment">
            <label>{{$ctrl.property.name}}:</label>
            <entity-selector entities="data.sourceEntities" property="$ctrl.property"></entity-selector>
            Click "Copy {{$ctrl.property.name}}" in each row to add the {{$ctrl.property.name.toLowerCase()}} from this field to the selected row
        </div>

        <table class="ui attached very compact striped table">
            <thead>
                <th class="three wide">Entity</td>
                <th class="ten wide">{{$ctrl.property.name}}</th>
                <th class="three wide">Links</th>
            </thead>
            <tbody style="max-height:400px; overflow:scroll">
                <tr ng-repeat="entity in $ctrl.entities">
                    <td class="left aligned">
                        {{entity.name}}
                    </td>
                    <td>
                        <entity-selector entities="entity.properties" property="$ctrl.property" style="width:80%"></entity-selector>
                        <a href="#" ng-click="copySourceEntities(entity.properties)">Copy {{$ctrl.property.name}}</a>
                    </td>
                    <td>
                        <a ng-href="{{entity.link}}" target="_blank">Wikipedia</a> |
                        <a ng-href="https://www.wikidata.org/wiki/{{entity.id}}" target="_blank">Wikidata</a>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="ui bottom attached segment">
            <div class="ui two column grid">
                <div class="column">
                    <button class="ui primary right labeled icon {{data.isSaving ? 'loading' : ''}} button" ng-click="save()" ng-disabled="data.isSaving">
                        Save Modications
                        <i class="save icon"></i>
                    </button>
                </div>
                <div class="right aligned column">
                    <a href="https://www.wikidata.org/wiki/Special:NewItem" class="ui primary right labeled icon button" target="_blank">
                        New Item
                        <i class="add icon"></i>
                    </a>
                </div>
            </div>
        </div>
        `,
    controller: 'EntityEditorCtrl',
    bindings: {
        entities: "=",
        entitiesCount: "=",
        property: "="
    }
})
