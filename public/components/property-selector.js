// =============================================================================
// JS
// =============================================================================
app.controller('PropertySelectorCtrl', function ($scope, client) {
    // =========================================================================
    // DATA
    // =========================================================================

    // =========================================================================
    // METHODS
    // =========================================================================
    $scope.search = function (searchTerm) {
        let url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=property&limit=10&search=" + searchTerm;

        return client.get(url)
            .then(
            success => {
                let properties = success.data.search.map(p => { return { id: p.id, name: p.label } });
                let uniqueProperties = _.uniqBy(properties, e => e.name)
                return uniqueProperties;
            },
            error => {
                return [];
            });
    }
})

// =============================================================================
// HTML
// =============================================================================
app.component('propertySelector', {
    template: `
        <tags-input ng-model="$ctrl.properties" key-property="id" display-property="name" max-tags="1" add-from-autocomplete-only="true">
            <auto-complete source="search($query)" debounce-delay="200"></auto-complete>
        </tags-input>
        `,
    controller: 'PropertySelectorCtrl',
    bindings: {
        properties: "="
    }
})
