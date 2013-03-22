window.socket = io.connect('http://localhost:8000');

gameObjects = [];

socket.on('update', function (data) {
		for (var i=0;i<data.length;i++){		
			if (gameObjects[data[i].id]){
				gameObjects[data[i].id].reciveData(data[i]);
			}
			else{
				gameObjects[data[i].id] = createGameObject(data[i]);
			}
		}
});

function createGameObject(data){
	switch(data.type){
		case "player":
			return registryObject(new Player(socket),data);
		case "barrel":
			return registryObject(new Barrel(),data);
	}
}

function registryObject(object,data){
	this.gs.addEntity(object);
	//object.reciveData(data);
	return object;
}

function startGame(gs) {
	Sprite.preload([
			"images/ground.png",
			"images/barrel.png",
			"images/rock.png",
			"images/player/player_left-1.png",
			"images/player/player_left-2.png",
			"images/player/player_left-3.png",
			"images/player/player_right-1.png",
			"images/player/player_right-2.png",
			"images/player/player_right-3.png",
			"images/player/player_up-1.png",
			"images/player/player_up-2.png",
			"images/player/player_up-3.png",
			"images/player/player_down-1.png",
			"images/player/player_down-2.png",
			"images/player/player_down-3.png",
		],
		function() {
			this.gs = gs;
			//createWorld()
		}
	);
}