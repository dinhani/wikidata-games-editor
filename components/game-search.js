// =============================================================================
// JS
// =============================================================================
app.controller('GameSearchCtrl', function ($scope, client) {
    // data
    $scope.data = {
        searchTerm: "",
        searching: false
    }

    // methods
    $scope.search = function () {
        // prepare games search
        let query = `
            SELECT DISTINCT ?item ?itemLabel ?siteLink
                WHERE {
                    ?item wdt:P31 wd:Q7889 .
                  	?item rdfs:label ?itemLabel .
                    ?siteLink schema:about ?item .
                    FILTER (SUBSTR(str(?siteLink), 1, 25) = "https://en.wikipedia.org/")
                  	FILTER(REGEX(?itemLabel, '.*` + $scope.data.searchTerm + `.*', 'i')) .
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en"
                }
            }
            LIMIT 10`.trim();
        let url = "https://query.wikidata.org/sparql?format=json&query=" + query;

        // query games
        $scope.data.searching = true;
        return client.get(url)
            .then(success => {
                // games loaded
                let games = success.data.results.bindings.map(e => {
                    return { id: _.last(e.item.value.split('/')), name: e.itemLabel.value, properties: [], link: e.siteLink.value }
                })
                $scope.$ctrl.games = games;

                // query properties async
                _.forEach(games, game => {
                    loadProperties(game, $scope.$ctrl.property)
                })

                // disable loading
                $scope.data.searching = false
            },
            error => $scope.data.searching = false);
    }

    // additional loads
    function loadProperties(game, property) {
        let url = "https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&entity=" + game.id + "&property=" + property.id;
        client.get(url)
            .then(success => {
                let properties = success.data.claims[property.id];
                if (properties) {
                    game.properties = properties.map(prop => {
                        return { id: prop.mainsnak.datavalue.value.id, name: prop.mainsnak.datavalue.value.id, property: property.id, existing: true }
                    })
                    game.properties.forEach(prop => loadEntityLabel(prop))
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
})

// =============================================================================
// HTML
// =============================================================================
app.component('gameSearch', {
    template: `
        <div class="ui {{data.searching ? 'loading' : ''}} form">
            <h2 class="ui dividing header">Games & {{$ctrl.property.name}}</h2>
            <div class="fields">
                <div class="fourteen wide field">
                    <label>Game:</label>
                    <input type="text" ng-model="data.searchTerm" ng-keypress="($event.which === 13) ? search() : null">
                </div>
                <div class="two wide field">
                    <label>Property:</label>
                    <a ng-href="https://www.wikidata.org/wiki/Property:{{$ctrl.property.id}}" target="_blank">{{$ctrl.property.id}}</a>
                </div>
            </div>
        </div>
        `,
    controller: 'GameSearchCtrl',
    bindings: {
        games: '=',
        property: "="
    }
})
