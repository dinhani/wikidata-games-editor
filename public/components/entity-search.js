// =============================================================================
// JS
// =============================================================================
app.controller('EntitySearchCtrl', function ($scope, hotkeys, client) {
    // =========================================================================
    // CONSTANTS
    // =========================================================================
    $scope.availableSearches = [
        {
            id: "Q7889",
            name: "Games",
            properties: [
                {
                    name: "Characters",
                    id: "P674"
                },
                {
                    name: "Developers",
                    id: "P178"
                },
                {
                    name: "Distributions",
                    id: "P437"
                },
                {
                    name: "Engines",
                    id: "P408"
                },
                {
                    name: "Game Modes",
                    id: "P404"
                },
                {
                    name: "Genres",
                    id: "P136"
                },
                {
                    name: "Input Devices",
                    id: "P479"
                },
                {
                    name: "Locations",
                    id: "P840"
                },
				{
                    name: "Mechanics",
                    id: "P2283"
                },
                {
                    name: "Platforms",
                    id: "P400"
                },
                {
                    name: "Periods",
                    id: "P2408"
                },
                {
                    name: "Publishers",
                    id: "P123"
                },
                {
                    name: "Series",
                    id: "P179"
                },
                {
                    name: "Themes",
                    id: "P921"
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
        additionalSearchProperties: [],
        additionalSearchPropertiesValues: [],
        search: "",
        onlyWithRelatedEntities: false,
        onlyWithoutRelatedEntities: false,
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
    $scope.onlyWithoutRelatedEntitiesChanged = function () {
        if ($scope.data.onlyWithoutRelatedEntities) {
            $scope.data.onlyWithRelatedEntities = false;
        }
    }
    $scope.onlyWithRelatedEntitiesChanged = function () {
        if ($scope.data.onlyWithRelatedEntities) {
            $scope.data.onlyWithoutRelatedEntities = false;
        }
    }

    // SEARCH
    $scope.search = function () {
        // update bindings
        $scope.$ctrl.property = $scope.data.selectedSearchProperty;
        $scope.$ctrl.entitiesCount = null;

        // query entities
        queryEntities();

        // query count
        queryCount();
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

    // =========================================================================
    // QUERY
    // =========================================================================
    function queryEntities() {
        // prepare request
        let url = "https://query.wikidata.org/sparql";
        let selectClause = "SELECT DISTINCT ?item ?itemLabel ?siteLink";
        let query = generateBaseQuery(selectClause);
        let params = { format: "json", query: query }

        // do query
        $scope.data.isSearching = true;
        client.get(url, params)
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

    function queryCount() {
        // prepare request
        let url = "https://query.wikidata.org/sparql";
        let selectClause = "SELECT (count(DISTINCT ?item) as ?count)";
        let query = generateBaseQuery(selectClause);
        let params = { format: "json", query: query }

        client.get(url, params)
            .then(success => {
                $scope.$ctrl.entitiesCount = success.data.results.bindings[0].count.value;
            });
    }

    function generateBaseQuery(selectClause) {
        // prepare entities search
        let query = selectClause + `
                WHERE {
                    ?item wdt:P31 wd:` + $scope.data.selectedSearch.id + ` .
                  	?item rdfs:label ?itemLabel .
                    ?siteLink schema:about ?item .
                    FILTER (SUBSTR(str(?siteLink), 1, 25) = "https://en.wikipedia.org/")`
        if ($scope.data.additionalSearchProperties.length === $scope.data.additionalSearchPropertiesValues.length) {
            for (var i = 0; i < $scope.data.additionalSearchProperties.length; i++) {
                let property = $scope.data.additionalSearchProperties[i];
                let value = $scope.data.additionalSearchPropertiesValues[i];
                query += `
                    FILTER EXISTS { ?item wdt:` + property.id + " wd:" + value.id + `  } . `;
            }
        }
        if ($scope.data.onlyWithRelatedEntities) {
            query += `
                FILTER EXISTS { ?item wdt:` + $scope.data.selectedSearchProperty.id + ` ?any } . `;
        }
        if ($scope.data.onlyWithoutRelatedEntities) {
            query += `
                FILTER NOT EXISTS { ?item wdt:` + $scope.data.selectedSearchProperty.id + ` ?any } . `;
        }

        query += `
                FILTER(REGEX(?itemLabel, '.*` + $scope.data.search + `.*', 'i')) .
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en"
                }
            }
            LIMIT 20`.trim();

        return query;
    }

    // =========================================================================
    // SHORTCUTS
    // =========================================================================
    hotkeys.add({
        combo: 'ctrl+enter',
        description: 'Execute search',
        callback: $scope.search,
        allowIn: ["INPUT", "SELECT", "TEXTAREA"]
    });

    // =========================================================================
    // INIT
    // =========================================================================
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
            <div class="ui top attached inverted segment">
                <h2 class="ui medium header">
                    <i class="search icon"></i>
                    <div class="content">Search</div>
                </h2>
            </div>

            <div class="ui attached segment">
                <div class="two fields">
                    <div class="field">
                        <label>Search for:</label>
                        <select class="ui dropdown" ng-model="data.selectedSearch" ng-options="search.name for search in availableSearches" ng-change="selectedSearchChanged()">
                        </select>
                    </div>

                    <div class="field">
                        <label>To edit:</label>
                        <select class="ui dropdown" ng-model="data.selectedSearchProperty" ng-options="property.name for property in data.selectedSearch.properties" ng-change="selectedSearchPropertyChanged()">
                        </select>
                    </div>
                </div>

                <div class="field">
                    <label>Name:</label>
                    <input type="text" ng-model="data.search" ng-keypress="($event.which === 13) ? search() : null" autofocus >
                </div>

                <div class="inline field">
                    <div class="ui checkbox">
                        <input id="field.withProperty" type="checkbox" ng-model="data.onlyWithRelatedEntities" ng-change="onlyWithRelatedEntitiesChanged()">
                        <label for="field.withProperty">Only with {{$ctrl.property.name.toLowerCase()}}</label>
                    </div>
                </div>

                <div class="inline field">
                    <div class="ui checkbox">
                        <input id="field.withoutProperty" type="checkbox" ng-model="data.onlyWithoutRelatedEntities" ng-change="onlyWithoutRelatedEntitiesChanged()">
                        <label for="field.withoutProperty">Only without {{$ctrl.property.name.toLowerCase()}}</label>
                    </div>
                </div>
            </div>

            <div class="ui attached segment">
                <div class="ui top attached label">Additional conditions</div>
                <div class="two fields">
                    <div class="field">
                        <label>Property:</label>
                        <property-selector properties="data.additionalSearchProperties"></property-selector>
                    </div>
                    <div class="field">
                        <label>Value:</label>
                        <entity-selector entities="data.additionalSearchPropertiesValues"></entity-selector>
                    </div>
                </div>
            </div>
            <div class="ui bottom attached segment">
                <button class="ui primary right labeled icon {{data.isSearching ? 'loading' : ''}} button" ng-click="search()" ng-disabled="data.isSearching">
                    Search
                    <i class="search icon"></i>
                </button>
            </div>
        </div>
        `,
    controller: 'EntitySearchCtrl',
    bindings: {
        entities: '=',
        entitiesCount: "=",
        property: "="
    }
})
