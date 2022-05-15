const express = require("express");
const socket = require("socket.io");

const PORT = 3000;
const app = express();
const server = app.listen(PORT, () => {
	console.log("Listening on port " + PORT);
});

app.use(express.static("public"));

const io = socket(server);
var clientCount = 0;
var playersGameStatus = 0;
var roundMap = new Map();

class Player {
	constructor(userName, socketId, bStartGame)
	{
		this.userName = userName;
		this.socketId = socketId;
		this.bStartGame = bStartGame;
		this.score = 0;
	}
}

var activePlayers = new Map();

io.on("connection", (socket) => {
	clientCount++;
	playersGameStatus = 0;
	console.log("Client " + clientCount + " connected");

	socket.on("NEW_USER", (userName) => {
		var newPlayer = new Player(userName, socket.id, false);
		activePlayers.set(socket.id, newPlayer);
		console.log("New Player: " + newPlayer.userName + "\nSocket ID: " + newPlayer.socketId);
		io.emit("NEW_USER", userName);
	});

	socket.on("START_GAME_INIT", (socketId) => {
		var currPlayer = activePlayers.get(socketId);
		currPlayer.bStartGame = true;
		console.log(currPlayer);
		activePlayers.set(socketId, currPlayer);
		playersGameStatus++;
		if (playersGameStatus == activePlayers.size)
		{
			console.log("Game starts now");
			var randomRow = Math.floor(Math.random() * 3 + 1);
			var randomCol = Math.floor(Math.random() * 3 + 1);
			var scores = GetPlayersScore();
			console.log(randomRow, randomCol, scores);
			io.emit("START_GAME", {nextRow: randomRow, nextCol: randomCol, scores: scores});
		}
	});

	socket.on("PLAYER_SHOOTED_INIT", (data) => {
		var socketId = data.socketId;
		var round = data.round;
		var currPlayer = activePlayers.get(socketId);
		var randomRow = Math.floor(Math.random() * 3 + 1);
		var randomCol = Math.floor(Math.random() * 3 + 1);
		console.log(randomRow, randomCol);
		if (!roundMap.has(round))
		{
			currPlayer.score++;
			roundMap.set(round, currPlayer.userName);
		}
		console.log("Round " + round + ": " + currPlayer.userName, "\nScore: " + currPlayer.score);
		var scores = GetPlayersScore();
		io.emit("PLAYER_SHOOTED", {player: currPlayer, nextRow: randomRow, nextCol: randomCol, scores: scores, roundMap: roundMap});
	});

	socket.on("disconnect", () => {
		io.emit("PLAYER_DISCONNECTED");
	});


});

function GetPlayersScore()
{
    var scores = "";
    for (const [key, value] of activePlayers.entries())
	{
		console.log(key, value);
		scores += "" + value.userName + ": " + value.score;
		scores += "\n";
    }
	return scores;
}

