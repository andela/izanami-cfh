angular.module('mean.system')
.controller('IndexController', ['$http', '$scope', 'Global', '$location', 'socket', 'game', 'AvatarService', 'playerSearch', function ($http, $scope, Global, $location, socket, game, AvatarService, playerSearch) {
  $scope.global = Global;
  $scope.searchUserResults = [];
  $scope.inviteeUserName = '';
  $scope.allSearchResults = {};

  $scope.playAsGuest = () => {
    game.joinGame();
    $location.path('/app');
  };

  $scope.getNotifications = () => {
    $scope.notifications = {};
    $http.get(`/api/notification/${window.user.id}`)
      .success((response) => {
        if (response.length) {
          $scope.notifications.unread = 0;
          $scope.notifications.details = response.map((res) => {
            if (!res.read) {
              $scope.notifications.unread += 1;
            }
            return {
              id: res._id,
              sender: res.sender,
              read: res.read,
              message: res.message,
              link: res.link,
              type: res.type,
              created_on: moment(res.created_on).startOf('minute').fromNow() };
          });
        } else {
          $scope.notifications = null;
        }
      });
  };

  $scope.readAll = () => {
    socket.emit('updateAll', { user: window.user.id }, () => {
      $scope.getNotifications();
      // This happens when there is an error updating read field
    });
  };

  $scope.getFriends = () => {
    $http.get(`/api/friends/${window.user.id}`)
      .success((response) => {
        if (response.length) {
          $scope.friendsNum = Object.keys(response[0]).length - 1;
          $scope.friends = Object.keys(response[0]).map((friend) => {
            if (friend !== '_id') {
              const friendData = {
                name: response[0][friend].name,
                avatar: response[0][friend].avatar,
                id: friend };
              return friendData;
            }
            return null;
          });
        } else {
          $scope.friendsNum = 0;
          $scope.friends = null;
        }
      });
  };

  $scope.ajax = {
    get(endpoint, callback) {
      $http.get(endpoint)
        .success((response) => {
          callback(response);
        });
    }
  };

  socket.on('refreshNotification', (params) => {
    if (params.user === window.user.id) {
      $scope.getNotifications();
      $scope.getFriends();
    }
  });

  socket.on('friendshipAccepted', (params) => {
    if (params.sender.id === window.user.id) {
      $scope.populatingFriendship = true;
      $scope.acceptReq(params.user);
    }
  });

  $scope.showError = () => {
    if ($location.search().error) {
      return $location.search().error;
    }
    return false;
  };

  $scope.updateRead = (user) => {
    socket.emit('readUpdate', { user }, () => {
      // This happens when there is an error updating read field
    });
  };

  $scope.reqStatus = (user) => {
    $scope.friendshipStatus = null;
    $http.get(`/api/friends/status/${user}/${window.user.id}`)
      .success((response) => {
        $scope.friendshipStatus = (response.status !== 'none');
        $scope.friendshipStatusMessage = response.message;
      });
  };

  $scope.sendRequest = (user) => {
    $http.post('/api/friends/request', { id: user, sender: window.user },
      { headers: { 'Content-Type': 'application/json' } })
      .success((response) => {
        $scope.friendshipStatus = true;
        $scope.friendshipStatusMessage = 'You have sent a request';
        socket.emit('makeBroadcast', { message: 'refreshNotification', user: response.user });
      });
  };

  $scope.acceptReq = (sender) => {
    $http.post('/api/friends/request/accept', { user: window.user.id, sender },
    { headers: { 'Content-Type': 'application/json' } })
    .success(() => {
      $scope.getNotifications();
      $scope.getFriends();
      const params = { sender, user: window.user };
      params.message = 'friendshipAccepted';
      if (!$scope.populatingFriendship) {
        socket.emit('makeBroadcast', params);
      } else {
        $scope.populatingFriendship = false;
      }
    });
  };

  $scope.rejectReq = (sender) => {
    $http.post('/api/friends/request/reject', { user: window.user.id, sender },
    { headers: { 'Content-Type': 'application/json' } })
    .success(() => {
      $scope.getNotifications();
    });
  };

  $scope.playerSearch = () => {
    if ($scope.inviteeUserName !== '') {
      playerSearch.getPlayers($scope.inviteeUserName).then((data) => {
        $scope.searchUserResults = data.filter((user) => {
          if (user._id !== window.user.id) {
            return user;
          }
        });
      });
    } else {
      $scope.searchUserResults = [];
    }
  };

  $scope.selectUser = (selectedUser) => {
    $scope.inviteeUserEmail = selectedUser.email;
    $scope.inviteeUserName = selectedUser.name;
    $scope.inviteeUserID = selectedUser._id;
    $scope.allSearchResults[selectedUser.name] = $scope.searchUserResults.filter((result) => {
      if (result.name === $scope.inviteeUserName) {
        return result;
      }
    });
    $scope.searchUserResults = [];
  };

  $scope.isRead = (read, val) => {
    if (read === 'read') {
      if (val === true) {
        return true;
      }
    }
    return false;
  };

  $scope.avatars = [];
  AvatarService.getAvatars()
    .then((data) => {
      $scope.avatars = data;
    });
}]);
