const mongoose = require('mongoose');

const GameModel = mongoose.model('Game');

/**
* get all the games a player has played
* @param {String} player - player's id to get data for
* @param {Array} games - list of all games
* @return {Integer} number of games played
*/
function gamesPlayed(player, games) {
  let played = 0;
  games.forEach((game) => {
    if (game.players.includes(player)) {
      played += 1;
    }
  });
  return played;
}

exports.calculateRanking = (req, res) => {
  if (req.params.id === 'all') {
    GameModel.find({}, (err, games) => {
      const rankings = {};
      games.forEach((game) => {
        game.players.forEach((player) => {
          if (typeof player === 'object') {
            Object.keys(player).forEach((playerID) => {
              if (playerID !== 'unauthenticated') {
                if (rankings[playerID]) {
                  rankings[playerID] = player[playerID] + rankings[playerID];
                } else {
                  rankings[playerID] = player[playerID];
                }
              }
            });
          }
        });
      });
      const sortObject = [];
      Object.keys(rankings).forEach((rank) => {
        sortObject.push([rank, rankings[rank]]);
      });

      const sortedRankings = sortObject.sort((a, b) => {
        return a[1] - b[1];
      }).reverse().map((player, index) => {
        const played = gamesPlayed(player[0], games);
        const data = { id: player[0], points: player[1], rank: index + 1, games_played: played };
        return (data);
      });
      res.json(sortedRankings);
    });
  }
};
