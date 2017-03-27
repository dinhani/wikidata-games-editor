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
        let url = "https://www.wikidata.org/w/api.php";
        let params = { action: "wbsearchentities", format: "json", language: "en", limit: 10, type: "property", search: searchTerm }

        return client.get(url, params)
            .then(
            success => {
                let properties = success.data.search.map(p => { return { id: p.id, name: p.label } });
                return properties;
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
        <tags-input ng-model="$ctrl.properties" key-property="id" display-property="name" max-tags="1" add-from-autocomplete-only="true"
            replace-spaces-with-dashes="false">
            <auto-complete source="search($query)" debounce-delay="200"></auto-complete>
        </tags-input>
        `,
    controller: 'PropertySelectorCtrl',
    bindings: {
        properties: "="
    }
})
