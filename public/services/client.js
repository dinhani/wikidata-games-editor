app.service('client', function ($sce, $http) {

    // =========================================================================
    // DATA
    // =========================================================================
    let baseUrl = "http://127.0.0.1:4000/"

    // =========================================================================
    // METHODS
    // =========================================================================
    this.get = function (url) {
        let requestUrl = generateUrl(url);
        let trustedRequestUrl = $sce.trustAsResourceUrl(requestUrl)

        if (url.indexOf("api.php") != -1) {
            return $http.jsonp(trustedRequestUrl);
        } else {
            return $http.get(trustedRequestUrl);
        }

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