angular.module('mean.system')
.controller('IndexController', ['$http', '$scope', 'Global', '$location', 'socket', 'game', 'AvatarService', 'playerSearch', function ($http, $scope, Global, $location, socket, game, AvatarService, playerSearch) {
    $scope.global = Global;
    $scope.searchUserResults = [];
    $scope.inviteeUserName = '';
    $scope.allSearchResults = {};

    $scope.playAsGuest = function() {
      game.joinGame();
      $location.path('/app');
    };

    $scope.getNotifications = () => {
      console.log("Getting notifications");
      $scope.notifications = {};
      $http.get(`/api/notification/${window.user._id}`)
        .success((response) => {
          if (response.length) {
            $scope.notifications.unread = 0;
            $scope.notifications.details = response.map(res => {
              if (!res.read) {
                $scope.notifications.unread += 1;
              }
              return {id: res._id, sender: res.sender, read: res.read, message: res.message, link:res.link, type: res.type};
            });
          } else {
            $scope.notifications = null;
          }
        });
    }

    $scope.getFriends = () => {
      $http.get(`/api/friends/${window.user._id}`)
        .success((response) => {
          if (response.length) {
            $scope.friendsNum = Object.keys(response[0]).length - 1;
            $scope.friends = Object.keys(response[0]).map((friend) => {
              console.log(friend);
              if (friend !== '_id') {
                console.log(response[0][friend].name);
                const friendData = { name: response[0][friend].name, avatar:response[0][friend].avatar, id: friend };
                console.log(friendData);
                return friendData;
              }
            });
          } else {
            $scope.friendsNum = 0;
            $scope.friends = null;
          }
          console.log($scope.friends);
        });
    }

    $scope.ajax = {
      get(endpoint, callback) {
        $http.get(endpoint)
          .success((response) => {
            console.log(response);
            callback(response);
          });
      }
    }

    socket.on('refreshNotification', (params, cb) => {
      console.log(params.user);
      if (params.user === window.user._id) {
        console.log('Socket is refreshing your notifications');
        $scope.getNotifications();
        $scope.getFriends();
      } else {
        console.log('someone called a refresh');
      }
    });

    socket.on('friendshipAccepted', (params, cb) => {
      $scope.populatingFriendship = true;
      $scope.acceptReq(params.sender);
    });

    $scope.showError = function() {
      if ($location.search().error) {
        return $location.search().error;
      } else {
        return false;
      }
    };

    $scope.updateRead = (user) => {
      socket.emit('readUpdate', { user }, () => {
        // This happens when there is an error updating read field
      });
    };

    $scope.reqStatus = (user) => {
      $scope.searchedUserID = $scope.inviteeUserID;
      $scope.searchedUserName = $scope.inviteeUserName;
      $scope.inviteeUserID = null;
      $scope.inviteeUserName = null;
      $scope.friendshipStatus = null;
      $http.get(`/api/friends/status/${user}/${window.user.id}`)
        .success((response) => {
          console.log("Fetched status of frienship");
          console.log(response);
          $scope.friendshipStatus = (response.status === "none") ? false : true;
          $scope.friendshipStatusMessage = response.message;
        });
    }

    $scope.sendRequest = (user) => {
      console.log("Sneding request from", window.user);
      $http.post('/api/friends/request', { id: user, sender: window.user },
        { headers: { 'Content-Type': 'application/json' } })
        .success((response) => {
          socket.emit('makeBroadcast', { message: 'refreshNotification', param: { user: response.user } });
        });
    };

    $scope.acceptReq = (sender) => {
      console.log("Accepting friend request");
      console.log(sender);
      $http.post('/api/friends/request/accept', {user: window.user._id, sender},
      { headers: { 'Content-Type': 'application/json' }})
      .success((response) => {
        $scope.getNotifications();
        $scope.getFriends();
        console.log(response);
        if (!$scope.populatingFriendship) {
          socket.emit('makeBroadcast', { message: 'friendshipAccepted', param: { sender: window.user } });
        } else {
          $scope.populatingFriendship = false;
        }
        console.log("REQUEST ACCEPTED");
      });
    }

    $scope.rejectReq = (sender) => {
      console.log('rejecting friend request');
      $http.post('/api/friends/request/reject', {user: window.user._id, sender},
      { headers: { 'Content-Type': 'application/json' }})
      .success((response) => {
        $scope.getNotifications();
        console.log(response);
      });
    }

    $scope.playerSearch = () => {
      if ($scope.inviteeUserName !== '') {
        playerSearch.getPlayers($scope.inviteeUserName).then((data) => {
          $scope.searchUserResults = data.filter((user) => {
            console.log(window.user);
            if (user._id !== window.user._id ) {
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
      $scope.allSearchResults[selectedUser.name] = $scope.searchUserResults;
      $scope.searchUserResults = [];
      console.log($scope.allSearchResults);
    };

    $scope.isRead = (read, val) => {
      if (read === "read") {
        if (val === true) {
          return true;
        }
      }
      return false;
    }

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function(data) {
        $scope.avatars = data;
      });
}]);
