angular.module('mean.system')
  .controller('dashboard', ['$scope', '$rootScope', '$http', 'gameLogs', ($scope, rootScope, $http, gameLogs) => {
    $scope.allGameData = null;

    $scope.user = (window.user) ? window.user : 'undauthorized';
    if (window.user) {
      $scope.user = window.user;
      $scope.userID = window.user._id;
    } else {
      $scope.user = 'undauthorized';
      $scope.userID = null;
    }
    console.log(window.user);

    if (!$scope.user.avatar) {
      $scope.user.avatar = '/img/anonymous.png';
    }
    /** * Method consume game history api and get user's donations
    * @return{undefined}
    */
    $scope.allGameRecords = () => {
      if ($scope.userID !== null) {
        gameLogs.getGames($scope.userID).then((games) => {
          $scope.allGameData = games;
          $scope.gamesInfo = [];
          $scope.allGameData.forEach((game) => {
            if (!game.hasOwnProperty('winner')) {
              game.winner = null;
              game.playersInfo = [];
              game.players.forEach((player) => {
                gameLogs.getPlayersInGames(player).then((response) => {
                  game.playersInfo.push(response.data);
                  $scope.gamesInfo.push(game);
                });
              });
            }
          });
          // $scope.$apply( () => {
          //   $scope.allGameData = games;
          // });
          // $scope.allGameData = games;
          // console.log($scope.allGameData);
          console.log($scope.gamesInfo);
        });
        // const donations = JSON.parse(atob(window.localStorage.getItem('token').split('.')[1])).existingUser.donations;
        // console.log();
        // $scope.donations = donations;
      }
    };


    // $http.get(`/api/search/getUser/${window.user.id}`)
    //   .success((response) => {
    //     $scope.user.push(response);
    //   });


    $scope.leaderBoard = () => {

    }

    $scope.games = () => {

    }
    
    $scope.friends = () => {

    }

    $scope.donations = () => {

    }


  }]);


$(document).ready(() => {
  $(document).on('click', '#menu-toggle', () => {
    $('#wrapper').toggleClass('toggled');
  });
});

function removeToggled() {
  if ($(window).width() > 800) {
    $('#wrapper').removeClass('toggled');
  }
}

