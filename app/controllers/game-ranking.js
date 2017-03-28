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
    game.players.forEach((p) => {
      if (p.name === player) {
        played += 1;
      }
    });
  });
  return played;
}

exports.calculateRanking = (req, res) => {
  GameModel.find({}, (err, games) => {
    const rankings = {};
    games.forEach((game) => {
      game.players.forEach((player) => {
        if (typeof player === 'object') {
          if (player.id !== 'unauthenticated') {
            if (rankings[player.name]) {
              rankings[player.name] = player.points + rankings[player.name];
            } else {
              rankings[player.name] = player.points;
            }
          }
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
      const data = { name: player[0], points: player[1], rank: index + 1, games_played: played };
      return (data);
    });
    res.json(sortedRankings);
  });
};
