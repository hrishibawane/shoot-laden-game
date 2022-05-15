document.addEventListener("DOMContentLoaded", HandleDOMContentLoadedEvent);

const socket = io();
var totalRounds = 10;

function HandleDOMContentLoadedEvent()
{
	document.getElementById("enter").addEventListener("click", HandleClickEvent);
	document.getElementById("startGame").addEventListener("click", HandleClickEvent);

	socket.on("NEW_USER", (userName) => {
		console.log("sUserName = " + userName, "\nsocketId = " + socket.id);
		document.getElementById("userStatus").innerHTML = userName + " joined";
	});

	socket.on("START_GAME", (data) => {
		document.getElementById("userStatus").innerHTML = "Game started";
		document.getElementById("liveScore").innerHTML = data.scores;
		PlayRound(data.nextRow, data.nextCol);
	});

	socket.on("PLAYER_SHOOTED", (data) => {
		var player = data.player;
		var scores = data.scores;
		var row = data.nextRow;
		var col = data.nextCol;
		console.log(player);
		document.getElementById("userStatus").innerHTML = "Round " + (10 - totalRounds) + " winner is " + player.userName;
		document.getElementById("liveScore").innerHTML = scores;
		
		var objToShoot = document.getElementById("objToShoot");
		objToShoot.parentNode.removeChild(objToShoot);

		if (totalRounds > 0)
		{
			PlayRound(row, col);
		}
		else
		{
			alert("Game over!!!");
		}
	});
}

function HandleClickEvent(event)
{
	var elemId = event.target.id;
	if (elemId == "enter")
	{
		const userName = document.getElementById("userName").value;
		document.getElementById("userName").value = "";
		socket.emit("NEW_USER", userName);
	}
	else if (elemId == "startGame")
	{
		socket.emit("START_GAME_INIT", socket.id);
	}
	else if (elemId == "objToShoot")
	{
		socket.emit("PLAYER_SHOOTED_INIT", {socketId: socket.id, round: (10 - totalRounds)});
	}
}

function sleep(ms)
{
	return new Promise(function(resolve) {
		setTimeout(resolve, ms);
	});
}

async function PlayRound(row, col)
{
	const imgTag = document.createElement("img");
    imgTag.id = "objToShoot";
	imgTag.className = "objToShoot";
    imgTag.src = "obj_to_shoot.jpeg";
    console.log(imgTag);
	await sleep(5000);
	document.getElementById("col" + row + col).appendChild(imgTag);
	document.getElementById("objToShoot").addEventListener("click", HandleClickEvent);
	totalRounds--;
}




