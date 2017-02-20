

angular.module('mean.system')
.controller('IndexController', ['$scope', '$http','Global','$location', 'socket', 'game', 'AvatarService', function ($scope, $http, Global, $location, socket, game, AvatarService) {
    $scope.global = Global;
    console.log(window.user)
    $scope.login_data = {};
    
    $scope.processData = () => {
      console.log('Processing...');
      let email = $scope.login_data.email;
      let password = $scope.login_data.password;
      let data = JSON.stringify({email: email, password: password});
      $http.post('/api/users/session', data)
                .success((data, status, headers, config) => {
                  
                  $http.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
//                  console.log($http.defaults.headers.common);
                  console.log(window.user);
                  const token = data.token;
                  console.log(token)
                  localStorage.setItem('myToken', token);
                  console.log('token saved succefully')
                  //sessionStorage.IndexController['token'] = token;

                 
      })
      .error(() => {
        console.log('Error occured');
      });
    }
  
    $scope.playAsGuest = function() {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = function() {
      if ($location.search().error) {
        return $location.search().error;
      } else {
        return false;
      }
    };

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function(data) {
        $scope.avatars = data;
      });

}]);