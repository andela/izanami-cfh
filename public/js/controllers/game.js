angular.module('mean.system')
  .controller('GameController', ['$scope', 'game', '$timeout', '$location', 'MakeAWishFactsService',
    '$dialog', 'playerSearch', 'invitePlayer', 'gameTour', '$window',
    ($scope, game, $timeout, $location, MakeAWishFactsService, $dialog, playerSearch,
     invitePlayer, gameTour, $window) => {
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
              }, 10);
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
          invitePlayer.sendMail($scope.inviteeUserEmail, document.URL).then((data) => {
            if (data === 'Accepted') {
              $scope.invitedPlayers.push($scope.inviteeUserEmail);
              $scope.invitedPlayerName = $scope.inviteeUserName;
              $scope.searchResults = [];
              $scope.inviteeUserEmail = '';
              $scope.inviteeUserName = '';
            }
          });
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
            $scope.searchUserResults = data;
          });
        } else {
          $scope.searchUserResults = [];
        }
      };

      $scope.selectUser = (selectedUser) => {
        $scope.inviteeUserEmail = selectedUser.email;
        $scope.inviteeUserName = selectedUser.name;
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

      //  czar should draw cards
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

      $scope.startTour = () => {
        angular.element(document.getElementsByClassName('tour-button')).hide();
        const tour = new Shepherd.Tour({
          defaults: {
            classes: 'shepherd-theme-default',
            scrollTo: true
          }
        });
        tour.addStep('Step 1', {
          title: 'Start the game',
          text: `This button starts the game but a minimum of 3 players
      is required to start the game`,
          attachTo: '#start-game-container bottom',
          classes: 'shepherd-theme-default',
          showCancelLink: true,
          buttons: [
            {
              text: 'Skip',
              action: tour.cancel,
              classes: 'close-tour'
            },
            {
              text: 'Next',
              action: tour.next
            }
          ]
        });
        tour.addStep('Step 2', {
          title: 'Number of players',
          text: `Here is an indicator of how many players have
     joined the game out of 12 maximum players allowed.`,
          attachTo: '#player-count-container bottom',
          showCancelLink: true,
          buttons: [
            {
              text: 'Skip',
              action: tour.cancel,
              classes: 'close-tour'
            },
            {
              text: 'Back',
              action: tour.back,
            },
            {
              text: 'Next',
              action: tour.next,
            }
          ]
        });
        tour.addStep('Step 3', {
          title: 'Game Timer',
          text: `This is a countdown timer that shows how much
       time is remaining for you to choose a card.`,
          attachTo: '#timer-container left',
          showCancelLink: true,
          buttons: [
            {
              text: 'Skip',
              action: tour.cancel,
              classes: 'close-tour'
            },
            {
              text: 'Back',
              action: tour.back,
            },
            {
              text: 'Next',
              action: tour.next,
            }
          ]
        });
        tour.addStep('Step 4', {
          title: 'Abandon Game',
          text: 'Click this button to Leave the game.',
          attachTo: '#abandon-game-button bottom',
          showCancelLink: true,
          buttons: [
            {
              text: 'Back',
              action: tour.back,
            },
            {
              text: 'Done',
              action: tour.complete,
              classes: 'close-tour'
            }
          ]
        });
        tour.start();
      };
    }]);

$(document).ready(() => {
  $(document).on('click', '.close-tour', () => {
    $('.tour-button').show();
  });
  $(document).on('click', '.shepherd-cancel-link', () => {
    $('.tour-button').show();
  });
});

