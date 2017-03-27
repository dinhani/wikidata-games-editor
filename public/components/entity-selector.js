// =============================================================================
// JS
// =============================================================================
app.controller('EntitySelectorCtrl', function ($scope, client) {
    // =========================================================================
    // METHODS
    // =========================================================================
    $scope.search = function (searchTerm) {
        let url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=10&search=" + searchTerm;

        return client.get(url)
            .then(
            success => {
                let entities = success.data.search
                    .map(e => {
                        return { id: e.id, name: e.label, name: e.label, existing: false }
                    })
                    .map(e => {
                        if ($scope.$ctrl.property) {
                            e.type = $scope.$ctrl.property.id;
                        }
                        return e;
                    });
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
        <tags-input ng-model="$ctrl.entities" key-property="id" display-property="name" add-from-autocomplete-only="true" placeholder="Add {{$ctrl.property.name.toLowerCase()}}">
            <auto-complete source="search($query)" debounce-delay="200"></auto-complete>
        </tags-input>
        `,
    controller: 'EntitySelectorCtrl',
    bindings: {
        entities: "=",
        property: "=?"
    }
})
