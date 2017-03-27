app.service('client', function ($sce, $http) {

    // =========================================================================
    // DATA
    // =========================================================================
    let baseUrl = "http://127.0.0.1:4000/"

    // =========================================================================
    // METHODS
    // =========================================================================
    this.get = function (url, params) {
        let requestUrl = generateUrl(url);
        let trustedRequestUrl = $sce.trustAsResourceUrl(requestUrl)

        let method = "GET";
        if (url.indexOf("api.php") != -1) {
            method = "JSONP";
        }

        return $http({
            method: method,
            url: trustedRequestUrl,
            params: params
        })

    }

    this.post = function (url, body) {
        let requestUrl = generateUrl(url);
        let trustedRequestUrl = $sce.trustAsResourceUrl(requestUrl)

        return $http.post(trustedRequestUrl, body);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================
    let generateUrl = function (url) {
        return url;
    }
})