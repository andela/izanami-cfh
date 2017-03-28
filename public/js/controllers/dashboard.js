angular.module('mean.system')
  .controller('dashboard', ['$scope', '$rootScope', '$http', 'gameLogs', '$window',
    ($scope, rootScope, $http, gameLogs, $window) => {
      $scope.allGameData = null;
      $scope.allFriends = null;
      $scope.gameRanking = null;
      $scope.friendsCount = 0;

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
      $scope.showRanking = true;

      angular.element(document).ready(() => {
        $scope.showGames = false;
        $scope.showRanking = true;
        $scope.showFriends = false;
        if ($scope.userID !== null) {
          gameLogs.getRanking()
            .then((gameRanking) => {
              $scope.gameRanking = gameRanking;
            });
        }
      });


      if (!$scope.user.avatar) {
        $scope.user.avatar = '/img/anonymous.png';
      }
      /** * Method consume game history api and get user's donations
      * @return{undefined}
      */
      $scope.allGameRecords = () => {
        $scope.showGames = true;
        $scope.showFriends = false;
        $scope.showRanking = false;
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
          });
        }
      };

      $scope.leaderBoard = () => {
        $scope.showGames = false;
        $scope.showRanking = true;
        $scope.showFriends = false;
        if ($scope.userID !== null) {
          gameLogs.getRanking()
            .then((gameRanking) => {
              $scope.gameRanking = gameRanking;
            });
        }
      };

      $scope.getFriends = () => {
        $scope.showGames = false;
        $scope.showRanking = false;
        $scope.showFriends = true;
        if ($scope.userID !== null) {
          gameLogs.getFriends($scope.userID)
            .then((friends) => {
              friends.forEach((friend) => {
                delete friend._id;
              });
              $scope.allFriends = friends[0];
              $scope.friendsCount = Object.keys($scope.allFriends).length;
            });
        }
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

