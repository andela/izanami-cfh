angular.module('mean.system')
  .controller('dashboard', ['$scope','$http', ($scope, $http) => {
    
    /** * Method consume game history api and get user's donations
    * @return{undefined}
    */
    $scope.allGameRecords = () => {
      $http.post('/api/games/history').then((games) => {
        $scope.allGameData = games.data;
        console.log(Object.keys($scope.allGameData));
        // $scope.fetchAllUsers($scope.allGameData[0].players);
      });
      const donations = JSON.parse(atob(window.localStorage.getItem('token').split('.')[1])).existingUser.donations;
      //console.log();
      $scope.donations = donations;
    };

    // $scope.fetchAllUsers = (users) => {
    // users.forEach((user) => {
    //   $http.get(`/api/search/getUser/${user}`)
    //     .success((response) => {
    //       console.log(response);	
    //     });
    // });
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

