// =============================================================================
// JS
// =============================================================================
app.controller('EntitySelectorCtrl', function ($scope, client) {
    // methods
    $scope.search = function (searchTerm) {
        let url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=10&search=" + searchTerm;


        return client.get(url)
            .then(
            success => {
                let entities = success.data.search.map(e => { return { id: e.id, name: e.label, name: e.label, existing: false, property: $scope.$ctrl.property.id } });
                let uniqueEntities = _.uniqBy(entities, e => e.name)
                return uniqueEntities;
            },
            error => {
                return [];
            });
    }
})

// =============================================================================
// HTML
// =============================================================================
app.component('entitySelector', {
    template: `
        <tags-input ng-model="$ctrl.entities" key-property="id" display-property="name">
            <auto-complete source="search($query)"></auto-complete>
        </tags-input>
        `,
    controller: 'EntitySelectorCtrl',
    bindings: {
        entities: "=",
        property: "="
    }
})
