
function startGame(gs)
{
	CreateWorld(gs)
}

function CreateWorld(gs)
{
	var worldAABB = new b2AABB()
	worldAABB.lowerBound.Set(-10000.0, -10000.0)
	worldAABB.upperBound.Set(10000.0, 10000.0)
	var gravity = new b2Vec2(0, 0)
	world = new World(gs)
	gs.box2d = new b2World(worldAABB, gravity, false)
	gs.addEntity(world)

	ws = new WebSocket("ws://" + window.location.host + "/" + window.location.pathname)
	gs.websocket = ws

	ws.onmessage = function (msg) 
	{ 
		message = JSON.parse(msg.data)
		switch (message.command) {
			case "create":
				world.create(message.data)
			case "reciveSpriteUrls":
				// downloadFiles(message.urls)
				break
		}
	}
}
