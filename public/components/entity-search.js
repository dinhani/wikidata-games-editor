// =============================================================================
// JS
// =============================================================================
app.controller('EntitySearchCtrl', function ($scope, client) {
    // =========================================================================
    // CONSTANTS
    // =========================================================================
    $scope.availableSearches = [
        {
            id: "Q7889",
            name: "Games",
            properties: [{
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
            }]
        },
        {
            id: "Q95074",
            name: "Characters",
            properties: [{
                name: "Present in work",
                id: "P1441"
            }]
        }
    ];

    // =========================================================================
    // DATA
    // =========================================================================
    $scope.data = {
        selectedSearch: $scope.availableSearches[0],
        selectedSearchProperty: $scope.availableSearches[0].properties[0],
        search: "",
        onlyEntitiesWithoutRelatedEntities: false,
        isSearching: false
    }


    // =========================================================================
    // METHODS
    // =========================================================================
    $scope.selectedSearchChanged = function () {
        $scope.data.selectedSearchProperty = $scope.data.selectedSearch.properties[0];
        $scope.search();
    }
    $scope.selectedSearchPropertyChanged = function () {
        $scope.search();
    }

    // SEARCH
    $scope.search = function () {
        // update bindings
        $scope.$ctrl.property = $scope.data.selectedSearchProperty;

        // prepare entities search
        let query = `
            SELECT DISTINCT ?item ?itemLabel ?siteLink
                WHERE {
                    ?item wdt:P31 wd:` + $scope.data.selectedSearch.id + ` .
                  	?item rdfs:label ?itemLabel .
                    ?siteLink schema:about ?item .
                    FILTER (SUBSTR(str(?siteLink), 1, 25) = "https://en.wikipedia.org/")`
        if ($scope.data.onlyEntitiesWithoutRelatedEntities) {
            query += `
                FILTER NOT EXISTS { ?item wdt:` + $scope.data.selectedSearchProperty.id + ` ?any } . `;
        }

        query += `
            FILTER(REGEX(?itemLabel, '.*` + $scope.data.search + `.*', 'i')) .
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en"
                }
            }
            LIMIT 10`.trim();
        let url = "https://query.wikidata.org/sparql?format=json&query=" + query;

        // query entities
        $scope.data.isSearching = true;
        return client.get(url)
            .then(success => {
                // entities loaded
                let entities = success.data.results.bindings.map(e => {
                    return { id: _.last(e.item.value.split('/')), name: e.itemLabel.value, properties: [], link: e.siteLink.value }
                })
                entities = _.sortBy(entities, e => e.name);
                $scope.$ctrl.entities = entities;

                // query properties async
                _.forEach(entities, entity => {
                    loadRelatedEntities(entity, $scope.data.selectedSearchProperty)
                })

                // disable loading
                $scope.data.isSearching = false
            },
            error => $scope.data.isSearching = false);
    }

    // SEARCH - ADDITIONAL LOADS
    function loadRelatedEntities(entity, property) {
        let url = "https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&entity=" + entity.id + "&property=" + property.id;
        client.get(url)
            .then(success => {
                let properties = success.data.claims[property.id];
                if (properties) {
                    entity.properties = properties.map(prop => {
                        return { id: prop.mainsnak.datavalue.value.id, name: prop.mainsnak.datavalue.value.id, type: property.id, existing: true }
                    })
                    entity.properties.forEach(prop => loadEntityLabel(prop))
                }
            });
    }

    let labelCache = {}
    function loadEntityLabel(entity) {
        // try to get the label from cache first
        // if not avaiable, do request
        let cachedLabel = labelCache[entity.id];
        if (cachedLabel) {
            entity.name = cachedLabel;
        } else {
            let url = "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&languages=en&ids=" + entity.id
            client.get(url)
                .then(
                success => {
                    entity.name = success.data.entities[entity.id].labels.en.value;
                    labelCache[entity.id] = entity.name
                });
        }
    }


    $scope.init = function () {
        $scope.search();
    };
})

// =============================================================================
// HTML
// =============================================================================
app.component('entitySearch', {
    template: `
        <div class="ui {{data.isSearching ? 'loading' : ''}} form" ng-init="init()">
            <h2 class="ui top attached header">Search</h2>

            <div class="ui bottom attached segment">

                <div class="field">
                    <label>Search:</label>
                    <select class="ui dropdown" ng-model="data.selectedSearch" ng-options="search.name for search in availableSearches" ng-change="selectedSearchChanged()">
                    </select>
                </div>

                <div class="field">
                    <label>Relationship:</label>
                    <select class="ui dropdown" ng-model="data.selectedSearchProperty" ng-options="property.name for property in data.selectedSearch.properties" ng-change="selectedSearchPropertyChanged()">
                    </select>
                </div>

                <div class="field">
                    <label>Name:</label>
                    <input type="text" ng-model="data.search" ng-keypress="($event.which === 13) ? search() : null" autofocus >
                </div>

                <div class="inline field">
                    <div class="ui checkbox">
                        <input type="checkbox" ng-model="data.onlyEntitiesWithoutRelatedEntities">
                        <label>Include only entities without properties</label>
                    </div>
                </div>

                <button class="ui primary button" ng-click="search()">Search</button>
            </div>
        </div>
        `,
    controller: 'EntitySearchCtrl',
    bindings: {
        entities: '=',
        property: "="
    }
})