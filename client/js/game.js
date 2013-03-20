var pi2 = Math.PI * 2;



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
		// when the sprites are loaded, create the world
		function() {
			// document.getElementById("loader").style.display = "none";
			// gs.addEntity(new World());
			CreateWorld(gs);
		}
	);
}

function CreateWorld(gs)
{
	var worldAABB = new b2AABB();
	worldAABB.lowerBound.Set(-10000.0, -10000.0);
	worldAABB.upperBound.Set(10000.0, 10000.0);

	var gravity = new b2Vec2(0, 0);

	w = new World(gs, new b2World(worldAABB, gravity, true));

	gs.addEntity(w);

	gs.addEntity(new Player(w));

	gs.addEntity(new Barrel(w, {x: 100, y:400}));
	gs.addEntity(new Barrel(w, {x: 200, y:100}));
	gs.addEntity(new Barrel(w, {x: 300, y:400}));
	gs.addEntity(new Barrel(w, {x: 400, y:100}));

	gs.addEntity(new Rock(w, {x: 241, y:350}));
	gs.addEntity(new Rock(w, {x: 654, y:120}));
	
	/** Bounding box for small world **/

	gs.addEntity(new Asteroid(w, {
		"angle": 0, 
		"x": 0,
		"y": 0,
		"points": [[0,0],[800,0],[800,10],[10,10]]
	}, 0.0001))

	gs.addEntity(new Asteroid(w, {
		"angle": 0, 
		"x": 0,
		"y": 0,
		"points": [[0,0],[10,0],[10,600],[0,600]]
	}, 0.0001))

	gs.addEntity(new Asteroid(w, {
		"angle": 0, 
		"x": 0,
		"y": 0,
		"points": [[0,590],[800,590],[800,600],[0,600]]
	}, 0.0001))

	gs.addEntity(new Asteroid(w, {
		"angle": 0, 
		"x": 0,
		"y": 0,
		"points": [[790,0],[800,0],[800,600],[790,600]]
	}, 0.0001))
}
