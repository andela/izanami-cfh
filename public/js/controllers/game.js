angular.module('mean.system')
.controller('GameController', ['$scope', 'game', '$timeout', '$location', 'MakeAWishFactsService', '$dialog', function ($scope, game, $timeout, $location, MakeAWishFactsService, $dialog) {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.game = game;
    $scope.pickedCards = [];
    var makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();

    $scope.pickCard = function(card) {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (game.curQuestion.numAnswers === 2 &&
            $scope.pickedCards.length === 2) {
            //delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.pointerCursorStyle = function() {
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return {'cursor': 'pointer'};
      } else {
        return {};
      }
    };

    $scope.sendPickedCards = function() {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };

    $scope.cardIsFirstSelected = function(card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      } else {
        return false;
      }
    };

    $scope.cardIsSecondSelected = function(card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      } else {
        return false;
      }
    };

    $scope.firstAnswer = function($index){
      if($index % 2 === 0 && game.curQuestion.numAnswers > 1){
        return true;
      } else{
        return false;
      }
    };

    $scope.secondAnswer = function($index){
      if($index % 2 === 1 && game.curQuestion.numAnswers > 1){
        return true;
      } else{
        return false;
      }
    };

    $scope.showFirst = function(card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;
    };

    $scope.showSecond = function(card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;
    };

    $scope.isCzar = function() {
      return game.czar === game.playerIndex;
    };

    $scope.isPlayer = function($index) {
      return $index === game.playerIndex;
    };

    $scope.isCustomGame = function() {
      return !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';
    };

    $scope.isPremium = function($index) {
      return game.players[$index].premium;
    };

    $scope.currentCzar = function($index) {
      return $index === game.czar;
    };

    $scope.winningColor = function($index) {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      } else {
        return '#f9f9f9';
      }
    };

    $scope.pickWinning = function(winningSet) {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = function() {
      return game.winningCard !== -1;
    };

    $scope.startGame = function() {
      game.startGame();
    };

    $scope.abandonGame = function() {
      game.leaveGame();
      $location.path('/');
    };

    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)
    $scope.$watch('game.round', function() {
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
    $scope.$watch('game.state', function() {
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }
    });

    $scope.$watch('game.gameID', function() {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
          $location.search({game: game.gameID});
          if(!$scope.modalShown){
            setTimeout(function(){
              var link = document.URL;
              var txt = 'Give the following link to your friends so they can join your game: ';
              $('#lobby-how-to-play').text(txt);
              $('#oh-el').css({'text-align': 'center', 'font-size':'22px', 'background': 'white', 'color': 'black'}).text(link);
            }, 200);
            $scope.modalShown = true;
          }
        }
      }
    });

    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      console.log('joining custom game');
      game.joinGame('joinGame',$location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame',null,true);
    } else {
      game.joinGame();
    }

  $scope.startTour = () => {
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
    tour.addStep('Step 7', {
      title: 'Abandon Game',
      text: `Click this button to Leave the game.`,
      attachTo: '#abandon-game-button bottom',
      showCancelLink: true,
      buttons: [
        {
          text: 'Skip',
          action: tour.cancel,
        },
        {
          text: 'Back',
          action: tour.back,
        },
        {
          text: 'Done',
          action: tour.complete,
        }
      ]
    });
    tour.start();
  };
  
}]);

