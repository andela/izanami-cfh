angular.module('mean.system')
  .controller('dashboard', ['$scope', '$rootScope', '$http', 'gameLogs', ($scope, rootScope, $http, gameLogs) => {
    $scope.allGameData = null;

    $scope.user = (window.user) ? window.user : 'undauthorized';
    if (window.user) {
      $scope.user = window.user;
      $scope.userID = window.user.id;
    } else {
      $scope.user = 'undauthorized';
      $scope.userID = null;
    }
    $scope.showGames = false;
    $scope.showFriends = false;

    console.log(window.user);

    if (!$scope.user.avatar) {
      $scope.user.avatar = '/img/anonymous.png';
    }
    /** * Method consume game history api and get user's donations
    * @return{undefined}
    */
    $scope.allGameRecords = () => {
      $scope.showGames = true;
      $scope.showFriends = false;
      if ($scope.userID !== null) {
        gameLogs.getGames($scope.userID)
        .then((games) => {
          const allGamesData = games;
          return allGamesData;
        })
        .then((allGamesData) => {
          allGamesData.forEach((game) => {
            let sum = 0;
            game.players.forEach((player) => {
              sum += player.points;
            });
            game.rounds = sum;
            game.created_on = moment(game.created_on).format('LLLL');
          });
          $scope.allGameData = allGamesData;
          console.log($scope.allGameData);
        });
      }
    };


    // $http.get(`/api/search/getUser/${window.user.id}`)
    //   .success((response) => {
    //     $scope.user.push(response);
    //   });


    $scope.leaderBoard = () => {

    };

    $scope.getFriends = () => {

    };
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

