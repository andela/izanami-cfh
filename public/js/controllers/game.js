angular.module('mean.system')
  .controller('GameController', ['$scope', 'game','socket', '$timeout', '$location', 'MakeAWishFactsService', '$dialog', 'playerSearch', 'invitePlayer', function ($scope, game, socket, $timeout, $location, MakeAWishFactsService, $dialog, playerSearch, invitePlayer) {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.game = game;
    $scope.pickedCards = [];
    let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();

    $scope.searchUserResults = [];
    $scope.inviteeUserName = '';
    $scope.inviteeUserEmail = '';
    $scope.invitedPlayerName = '';
    $scope.invitedPlayers = [];
    $scope.firstPlayer = false;

    $scope.pickCard = (card) => {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (game.curQuestion.numAnswers === 2 &&
            $scope.pickedCards.length === 2) {
            // delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.pointerCursorStyle = () => {
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return { cursor: 'pointer' };
      }
      return {};
    };
    $scope.sendPickedCards = () => {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };
    $scope.cardIsFirstSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      }
      return false;
    };
    $scope.cardIsSecondSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      }
      return false;
    };
    $scope.firstAnswer = ($index) => {
      if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };
    $scope.secondAnswer = ($index) => {
      if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };

    $scope.showFirst = card => game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;

    $scope.showSecond = card => game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;

    $scope.isCzar = () => game.czar === game.playerIndex;

    $scope.isPlayer = $index => $index === game.playerIndex;

    $scope.isCustomGame = () => !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';

    $scope.isPremium = $index => game.players[$index].premium;

    $scope.currentCzar = $index => $index === game.czar;

    $scope.winningColor = ($index) => {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      }
      return '#f9f9f9';
    };

    $scope.pickWinning = (winningSet) => {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = () => game.winningCard !== -1;

    $scope.startGame = () => {
      if (game.players.length >= game.playerMinLimit) {
        game.startGame();
      } else {
        $('#playerMinimumAlert').modal('show');
      }
    };

    $scope.abandonGame = () => {
      game.leaveGame();
      $location.path('/');
    };

    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)
    $scope.$watch('game.round', () => {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });

    // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', () => {
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }
    });

    $scope.$watch('game.gameID', () => {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
          $location.search({game: game.gameID});
          if (!$scope.modalShown) {
            setTimeout(() => {
              $('#searchContainer').show();
            }, 70);
            $scope.modalShown = true;
          }
        }
      }
    });

    $scope.sendInvite = () => {
      if (!$scope.invitedPlayers.includes($scope.inviteeUserEmail)) {
        if ($scope.invitedPlayers.length > game.playerMaxLimit - 1) {
          $('#playerMaximumAlert').modal('show');
        }
        socket.emit('sendInvite', {
          user: $scope.inviteeUserID,
          sender: window.user.name
        }, function() {
          $scope.invitedPlayers.push($scope.inviteeUserEmail);
          $scope.invitedPlayerName = $scope.inviteeUserName;
          $scope.searchResults = [];
          $scope.inviteeUserEmail = '';
          $scope.inviteeUserName = '';
          $scope.notifications = {};
          // socket.emit('refreshNotification',{user: #scope.invi} () => {
          //   console.log('Notifications are refreshing');
          // });
        });

        // invitePlayer.sendMail($scope.inviteeUserEmail, document.URL).then((data) => {
        //   if (data === 'Accepted') {
        //     $scope.invitedPlayers.push($scope.inviteeUserEmail);
        //     $scope.invitedPlayerName = $scope.inviteeUserName;
        //     $scope.searchResults = [];
        //     $scope.inviteeUserEmail = '';
        //     $scope.inviteeUserName = '';
        //   }
        //});
      } else {
        $('#playerAlreadyInvited').modal('show');

        $scope.searchResults = [];
        $scope.inviteeUserEmail = '';
        $scope.inviteeUserName = '';
      }
    };

    $scope.playerSearch = () => {
      if ($scope.inviteeUserName !== '') {
        playerSearch.getPlayers($scope.inviteeUserName).then((data) => {
          $scope.searchUserResults = data.filter((user) => {
            console.log(window.user);
            if (user._id !== window.user.id ) {
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
      $scope.searchUserResults = [];
    };

    $scope.isInvited = selectedUserEmail => $scope.invitedPlayers.includes(selectedUserEmail);

    $scope.clickInvitee = (selectedUserEmail) => {
      if ($scope.invitedPlayers.includes(selectedUserEmail)) {
        return {
          'search-result': true,
          'invitee-invited': true
        };
      }
      return {
        'search-result': true,
        'invitee-invited': false
      };
    };

    //    czar should draw cards
    $scope.drawCard = () => {
      const card = angular.element(document.getElementsByClassName('card-mem'));
      card.addClass('slide');
      $timeout(() => {
        game.drawCard();
        card.removeClass('slide');
      }, 1500);
    };

    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      console.log('joining custom game');
      game.joinGame('joinGame', $location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame', null, true);
    } else {
      game.joinGame();
    }
  }]);
