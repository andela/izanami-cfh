angular.module('mean.system')
  .factory('game', ['$rootScope', 'socket', '$timeout', 'chat', 'gameTour', 'gameTourService', 'invitePlayer',
    ($rootScope, socket, $timeout, chat, gameTour, gameTourService, invitePlayer) => {
      const game = {
        id: null, // This player's socket ID, so we know who this player is
        gameID: null,
        players: [],
        playerIndex: 0,
        winningCard: -1,
        winningCardPlayer: -1,
        gameWinner: -1,
        table: [],
        czar: null,
        playerMinLimit: 3,
        playerMaxLimit: 12,
        pointLimit: null,
        state: null,
        round: 0,
        time: 0,
        curQuestion: null,
        notification: null,
        timeLimits: {},
        joinOverride: false,
        gameChat: chat,
        tour: gameTour
      };

      const notificationQueue = [];
      let timeout = false;
      const self = this;
      let joinOverrideTimeout = 0;
      const invitedPlayers = [];

      const addToNotificationQueue = function (msg) {
        notificationQueue.push(msg);
        if (!timeout) { // Start a cycle if there isn't one
          setNotification();
        }
      };

      const setNotification = () => {
        if (notificationQueue.length === 0) { // If notificationQueue is empty, stop
          clearInterval(timeout);
          timeout = false;
          game.notification = '';
        } else {
          game.notification = notificationQueue.shift();
           // Show a notification and check again in a bit
          timeout = $timeout(setNotification, 3000);
        }
      };

      let timeSetViaUpdate = false;
      const decrementTime = function () {
        if (game.time > 0 && !timeSetViaUpdate) {
          game.time--;
        } else {
          timeSetViaUpdate = false;
        }
        $timeout(decrementTime, 950);
      };

      socket.on('id', (data) => {
        game.id = data.id;
      });

      socket.on('prepareGame', (data) => {
        game.playerMinLimit = data.playerMinLimit;
        game.playerMaxLimit = data.playerMaxLimit;
        game.pointLimit = data.pointLimit;
        game.timeLimits = data.timeLimits;
      });

      socket.on('gameUpdate', (data) => {
      // Update gameID field only if it changed.
      // That way, we don't trigger the $scope.$watch too often
        if (game.gameID !== data.gameID) {
          game.gameID = data.gameID;
        }

        game.joinOverride = false;
        clearTimeout(game.joinOverrideTimeout);

        let i;
      // Cache the index of the player in the players array
        for (i = 0; i < data.players.length; i++) {
          if (game.id === data.players[i].socketID) {
            game.playerIndex = i;
          }
        }

        const newState = (data.state !== game.state);

        //  update our chat service properties
        if (data.players[game.playerIndex] !== undefined) {
          if (data.players[game.playerIndex].username !== undefined) {
            game.gameChat.setChatUsername(data.players[game.playerIndex].username);
            game.gameChat.setChatGroup(data.gameID);
            game.gameChat.listenForMessages();
            game.gameChat.clearMessageHistory();
          }
        }

      // Handle updating game.time
        if (data.round !== game.round && data.state !== 'awaiting players' &&
        data.state !== 'game ended' && data.state !== 'game dissolved') {
          game.time = game.timeLimits.stateChoosing - 1;
          timeSetViaUpdate = true;
        } else if (newState && data.state === 'waiting for czar to draw cards') {
          game.time = game.timeLimits.stateDrawCards - 1;
          timeSetViaUpdate = true;
        } else if (newState && data.state === 'waiting for czar to decide') {
          game.time = game.timeLimits.stateJudging - 1;
          timeSetViaUpdate = true;
        } else if (newState && data.state === 'winner has been chosen') {
          game.time = game.timeLimits.stateResults - 1;
          timeSetViaUpdate = true;
        }

      // Set these properties on each update
        game.round = data.round;
        game.winningCard = data.winningCard;
        game.winningCardPlayer = data.winningCardPlayer;
        game.winnerAutopicked = data.winnerAutopicked;
        game.gameWinner = data.gameWinner;
        game.pointLimit = data.pointLimit;

      // Handle updating game.table
        if (data.table.length === 0) {
          game.table = [];
        } else {
          const added = _.difference(_.pluck(data.table, 'player'), _.pluck(game.table, 'player'));
          const removed = _.difference(_.pluck(game.table, 'player'), _.pluck(data.table, 'player'));
          for (i = 0; i < added.length; i++) {
            for (let j = 0; j < data.table.length; j++) {
              if (added[i] === data.table[j].player) {
                game.table.push(data.table[j], 1);
              }
            }
          }
          for (i = 0; i < removed.length; i++) {
            for (let k = 0; k < game.table.length; k++) {
              if (removed[i] === game.table[k].player) {
                game.table.splice(k, 1);
              }
            }
          }
        }

        if (game.state !== 'waiting for players to pick' || game.players.length !== data.players.length) {
          game.players = data.players;
        }

        if (newState || game.curQuestion !== data.curQuestion) {
          game.state = data.state;
        }

        if (data.state === 'waiting for players to pick') {
          game.czar = data.czar;
          game.curQuestion = data.curQuestion;
        // Extending the underscore within the question
          game.curQuestion.text = data.curQuestion.text.replace(/_/g, '<u></u>');

        // Set notifications only when entering state
          if (newState) {
            if (game.czar === game.playerIndex) {
              addToNotificationQueue('You\'re the Card Czar! Please wait!');
            } else if (game.curQuestion.numAnswers === 1) {
              addToNotificationQueue('Select an answer!');
            } else {
              addToNotificationQueue('Select TWO answers!');
            }
          }
        } else if (data.state === 'waiting for czar to decide') {
          if (game.czar === game.playerIndex) {
            addToNotificationQueue("Everyone's done. Choose the winner!");
          } else {
            addToNotificationQueue('The czar is contemplating...');
          }

        // Czar to draw card feature
        } else if (data.state === 'waiting for czar to draw cards') {
          if (game.czar === game.playerIndex) {
            addToNotificationQueue('Click to Draw the Cards!');
          } else {
            addToNotificationQueue('The czar is drawing the cards...');
          }
        } else if (data.state === 'winner has been chosen' &&
                game.curQuestion.text.indexOf('<u></u>') > -1) {
          game.curQuestion = data.curQuestion;
        } else if (data.state === 'awaiting players') {
          joinOverrideTimeout = $timeout(() => {
            game.joinOverride = true;
          }, 15000);
        } else if (data.state === 'game dissolved' || data.state === 'game ended') {
          game.players[game.playerIndex].hand = [];
          game.time = 0;
        }
      });

      socket.on('notification', (data) => {
        addToNotificationQueue(data.notification);
      });

      game.joinGame = function (mode, room, createPrivate) {
        mode = mode || 'joinGame';
        room = room || '';
        createPrivate = createPrivate || false;
        const userID = window.user ? user.id : 'unauthenticated';
        socket.emit(mode, { userID, room, createPrivate });
      };

      game.startGame = function () {
        socket.emit('startGame');
      };

      game.leaveGame = function () {
        game.players = [];
        game.time = 0;
        game.tour.cancelTour();
        socket.emit('leaveGame');
      };

      game.pickCards = function (cards) {
        socket.emit('pickCards', { cards });
      };

      game.pickWinning = function (card) {
        socket.emit('pickWinning', { card: card.id });
      };

      game.drawCard = () => {
        socket.emit('drawCard');
      };

      socket.on('tooLate', () => {
        angular.element('#gameStartedAlert').modal('show');
      });

      const takeTour = () => {
        angular.element(document.getElementsByClassName('tour-button')).hide();
        game.tour.startTour();
      };

      socket.on('startTour', () => {
        const userID = window.user ? user.id : 'unauthenticated';
        if (userID === 'unauthenticated') {
          takeTour();
        } else {
          gameTourService.checkTourTaken(userID).then((data) => {
            if (data.message === 0) {
              takeTour();
              gameTourService.saveTourTaken(userID);
            }
          });
        }
      });

      socket.on('endTour', () => {
        game.tour.cancelTour();
      });

      socket.on('sendCustomInvite', (params) => {
        params.invitedFriends.forEach((friend) => {
          socket.emit('sendInvite', {
            user: friend.id,
            sender: window.user.name,
            link: document.URL
          }, () => {
            invitePlayer.sendMail(friend.email, document.URL).then((data) => {
              if (data === 'Accepted') {
                $rootScope.$$childHead.$$childHead.invitedPlayers
                .push(friend.id);
              }
            });
          });
        });
      });

      decrementTime();

      return game;
    }]);
