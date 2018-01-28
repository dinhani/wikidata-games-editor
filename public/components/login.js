// =============================================================================
// JS
// =============================================================================
app.controller('LoginCtrl', function ($scope, Notification, client) {
    // =========================================================================
    // DATA
    // =========================================================================
    $scope.data = {
        username: "",
        password: "",
        loggedIn: false,
        isLoginIn: false
    }

    // =========================================================================
    // METHODS
    // =========================================================================
    $scope.login = function () {
        let body = { username: $scope.data.username, password: $scope.data.password };

        $scope.data.isLoginIn = true;
        client.post('/login', body).then(
            success => {
                $scope.data.loggedIn = true;
                $scope.data.isLoginIn = false;
                Notification.success($scope.data.username + " logged in")
            },
            error => {
                $scope.data.isLoginIn = false;
                Notification.error("Error login in");
            }
        )
    }

    $scope.logout = function () {
        $scope.data.isLoginIn = true;
        client.post('/logout').then(
            success => {
                $scope.data.isLoginIn = false;
                $scope.data.loggedIn = false
                Notification.success("Logged out");
            },
            error => {
                $scope.data.isLoginIn = false;
                $scope.data.loggedIn = false
                Notification.error("Error login out");
            }
        )
    }

    $scope.init = function () {
        client.get('login').then(
            success => {
                $scope.data.username = success.data.username;
                $scope.data.loggedIn = success.data.logged_in;
            }
        )
    }
})

// =============================================================================
// HTML
// =============================================================================
app.component('login', {
    template: `
        <div class="ui top attached inverted segment" ng-init="init()">
            <h2 class="ui medium header">
                <i class="sign in icon"></i>
                <div class="content">Login</div>
            </h2>
        </div>
        <div class="ui attached segment" ng-if="!data.loggedIn">
            <div class="ui {{data.isLoginIn ? 'loading' : ''}} form">
                <div class="field">
                    <label>Username:</label>
                    <input type="text" ng-model="data.username" ng-keypress="($event.which === 13) ? login() : null"/>
                </div>
                <div class="field">
                    <label>Password:</label>
                    <input type="password" ng-model="data.password" ng-keypress="($event.which === 13) ? login() : null"/>
                </div>
            </div>
        </div>
        <div class="ui attached segment" ng-if="data.loggedIn">
            Logged in as "{{data.username}}"
        </div>
        <div class="ui bottom attached segment">
            <button ng-if="!data.loggedIn" class="ui primary icon {{data.isLoginIn ? 'loading' : ''}} button" ng-click="login()" ng-disabled="data.isLoginIn">
                Login
                <i class="sign in icon"></i>
            </button>
            <button ng-if="data.loggedIn" class="ui primary right labeled icon {{data.isLoginIn ? 'loading' : ''}}  button" ng-click="logout()" ng-disabled="data.isLoginIn">
                Logout
                <i class="sign out icon"></i>
            </button>
        </div>
        `,
    controller: 'LoginCtrl',
    bindings: {
        properties: "="
    }
})
