import chance from 'chance';
import { Room, Client } from 'colyseus';
import { Config } from './Config';
import { DoorSchema, RoomSchema, GameSchema } from './GameSchema';

class Player
{
	client: Client = null;
	name: string = null;
	role: string = null;
}

export class GameRoom extends Room
{
	players: Array <Player>;
	playersByID: Map <string, Player>;

	roomsRandomizationConfig: object;

	chance: any;

	onCreate(options: any)
	{
		console.log(`${this.constructor.name} created!`);

		this.chance = chance();

		this.setPatchRate(null);
		this.setSimulationInterval(() => {});
		
		const state = new GameSchema();
		
		this.buildMap(state);
		this.randomizeRoomsInterior(state);

		this.setState(state);
		this.broadcastPatch();

		this.players = new Array <Player> ();
		this.playersByID = new Map <string, Player> ();

		this.onMessage('closeDoor', this.onCloseDoorMessage.bind(this));
		this.onMessage('openDoor', this.onOpenDoorMessage.bind(this));
		this.onMessage('moveSpy', this.onMoveSpyMessage.bind(this));
	}

	onJoin(client: Client, options: any)
	{
		console.log(`Client ${client.sessionId} joined ${this.constructor.name}.`);
		
		const player = new Player();
		player.client = client;
		player.name = options.playerName;
		this.players.push(player);
		this.playersByID.set(client.sessionId, player);

		if (this.players.length == 1)
		{
			player.role = 'spy';
		}
		else
		{
			player.role = 'guard';
			this.lock();
			
			this.players.forEach((player) =>
			{
				const names: Array <string> = [];
				this.players.forEach((player) =>
				{
					names.push(player.name);
				});
				player.client.send('ready', { 'role': player.role, 'names': names });

				this.state.whosTurn = 'guard';
				this.broadcastPatch();
			});
		}
	}

	onLeave(client: Client, consented: boolean)
	{
		console.log(`Client ${client.sessionId} left ${this.constructor.name}.`);

		for (let i = 0; i < this.players.length; ++i)
		{
			if (this.players[i].client.sessionId == client.sessionId)
			{
				this.players.splice(i, 1);
				break;
			}
		}
		this.playersByID.delete(client.sessionId);
		this.broadcast('opponentDisconnected');
	}

	buildMap(state: GameSchema)
	{
		state.facilitySize = Config.FACILITY_SIZE;

		const door0 = new DoorSchema();
		door0.connectsRooms = [0, 1];
		state.doors.push(door0);
		door0.index = state.doors.length - 1;

		const door1 = new DoorSchema();
		door1.connectsRooms = [1, 2];
		state.doors.push(door1);
		door1.index = state.doors.length - 1;

		const door2 = new DoorSchema();
		door2.connectsRooms = [0, 3];
		state.doors.push(door2);
		door2.index = state.doors.length - 1;

		const door3 = new DoorSchema();
		door3.connectsRooms = [1, 4];
		state.doors.push(door3);
		door3.index = state.doors.length - 1;

		const door4 = new DoorSchema();
		door4.connectsRooms = [2, 5];
		state.doors.push(door4);
		door4.index = state.doors.length - 1;

		const door5 = new DoorSchema();
		door5.connectsRooms = [3, 4];
		state.doors.push(door5);
		door5.index = state.doors.length - 1;

		const door6 = new DoorSchema();
		door6.connectsRooms = [4, 5];
		state.doors.push(door6);
		door6.index = state.doors.length - 1;

		const door7 = new DoorSchema();
		door7.connectsRooms = [3, 6];
		state.doors.push(door7);
		door7.index = state.doors.length - 1;

		const door8 = new DoorSchema();
		door8.connectsRooms = [4, 7];
		state.doors.push(door8);
		door8.index = state.doors.length - 1;

		const door9 = new DoorSchema();
		door9.connectsRooms = [5, 8];
		state.doors.push(door9);
		door9.index = state.doors.length - 1;

		const door10 = new DoorSchema();
		door10.connectsRooms = [6, 7];
		state.doors.push(door10);
		door10.index = state.doors.length - 1;

		const door11 = new DoorSchema();
		door11.connectsRooms = [7, 8];
		state.doors.push(door11);
		door11.index = state.doors.length - 1;

		const room0 = new RoomSchema();
		room0.roomNumber = 0;
		room0.doors.set('right', door0);
		room0.doors.set('bottom', door2);
		state.rooms.push(room0);

		const room1 = new RoomSchema();
		room1.roomNumber = 1;
		room1.doors.set('left', door0);
		room1.doors.set('right', door1);
		room1.doors.set('bottom', door3);
		state.rooms.push(room1);

		const room2 = new RoomSchema();
		room2.roomNumber = 2;
		room2.doors.set('left', door1);
		room2.doors.set('bottom', door4);
		state.rooms.push(room2);

		const room3 = new RoomSchema();
		room3.roomNumber = 3;
		room3.doors.set('top', door2);
		room3.doors.set('right', door5);
		room3.doors.set('bottom', door7);
		state.rooms.push(room3);

		const room4 = new RoomSchema();
		room4.roomNumber = 4;
		room4.doors.set('left', door5);
		room4.doors.set('top', door3);
		room4.doors.set('right', door6);
		room4.doors.set('bottom', door8);
		state.rooms.push(room4);

		const room5 = new RoomSchema();
		room5.roomNumber = 5;
		room5.doors.set('left', door6);
		room5.doors.set('top', door4);
		room5.doors.set('bottom', door9);
		state.rooms.push(room5);

		const room6 = new RoomSchema();
		room6.roomNumber = 6;
		room6.doors.set('top', door7);
		room6.doors.set('right', door10);
		state.rooms.push(room6);

		const room7 = new RoomSchema();
		room7.roomNumber = 7;
		room7.doors.set('left', door10);
		room7.doors.set('top', door8);
		room7.doors.set('right', door11);
		state.rooms.push(room7);

		const room8 = new RoomSchema();
		room8.roomNumber = 8;
		room8.doors.set('left', door11);
		room8.doors.set('top', door9);
		state.rooms.push(room8);

		state.vaccineRoomNumber = this.chance.natural({ 'max': 8, 'exclude': [4] });
		// minimum distance between vaccine room and spy room must be 3 steps
		// and fof 3x3 facility it's easier to map spy spawn room variants directly instead of perform path traces
		const spySpawnRoomVariants = new Map <number, Array <number>> ();
		spySpawnRoomVariants.set(0, [5, 7, 8]);
		spySpawnRoomVariants.set(1, [6, 8]);
		spySpawnRoomVariants.set(2, [3, 6, 7]);
		spySpawnRoomVariants.set(3, [2, 8])
		spySpawnRoomVariants.set(5, [0, 6]);
		spySpawnRoomVariants.set(6, [1, 2, 5]);
		spySpawnRoomVariants.set(7, [0, 2]);
		spySpawnRoomVariants.set(8, [0, 1, 3]);
		state.spyRoomNumber = state.spySpawnRoomNumber =  this.chance.pickone(spySpawnRoomVariants.get(state.vaccineRoomNumber));
	}

	randomizeRoomsInterior(state: GameSchema)
	{
		const roomTypesCount: any = { 'Laboratory': 0, 'Library': 0, 'Relax': 0, 'Warehouse': 0, 'Golf': 0, 'Panels': 0, 'Crocks': 0 };
		const roomTypesMaxCount: any = { 'Laboratory': 1, 'Library': 2, 'Relax': 2, 'Warehouse': 2, 'Golf': 2, 'Panels': 2, 'Crocks': 2 };

		const roomsRandomizationConfig: any = {};

		roomsRandomizationConfig[0] = [
			{ 'type': 'Laboratory', 'decoration': 'LaboratoryLeft0', 'floor': 'FloorTiles' },
			{ 'type': 'Laboratory', 'decoration': 'LaboratoryLeft1', 'floor': 'FloorTiles' },
			{ 'type': 'Laboratory', 'decoration': 'LaboratoryLeft2', 'floor': 'FloorTiles' },
			{ 'type': 'Library', 'decoration': 'LibraryLeft0', 'floor': 'FloorChessboard' },
			{ 'type': 'Relax', 'decoration': 'RelaxLeft0', 'floor': 'FloorParquet' },
			{ 'type': 'Warehouse', 'decoration': 'WarehouseLeft0', 'floor': 'FloorPlanks' }
		];
		roomsRandomizationConfig[3] = [...roomsRandomizationConfig[0]];
		roomsRandomizationConfig[6] = [...roomsRandomizationConfig[0]];
		roomsRandomizationConfig[2] = [
			{ 'type': 'Laboratory', 'decoration': 'LaboratoryRight0', 'floor': 'FloorTiles' },
			{ 'type': 'Laboratory', 'decoration': 'LaboratoryRight1', 'floor': 'FloorTiles' },
			{ 'type': 'Laboratory', 'decoration': 'LaboratoryRight2', 'floor': 'FloorTiles' },
			{ 'type': 'Library', 'decoration': 'LibraryRight0', 'floor': 'FloorChessboard' },
			{ 'type': 'Relax', 'decoration': 'RelaxRight0', 'floor': 'FloorParquet' },
			{ 'type': 'Warehouse', 'decoration': 'WarehouseRight0', 'floor': 'FloorPlanks' }
		];
		roomsRandomizationConfig[5] = [...roomsRandomizationConfig[2]];
		roomsRandomizationConfig[8] = [...roomsRandomizationConfig[2]];
		roomsRandomizationConfig[1] = [
			{ 'type': 'Laboratory', 'decoration': 'LaboratoryCenter0', 'floor': 'FloorTiles' },
			{ 'type': 'Golf', 'decoration': 'GolfCenter0', 'floor': 'FloorCarpet' },
			{ 'type': 'Golf', 'decoration': 'GolfCenter1', 'floor': 'FloorCarpet' },
			{ 'type': 'Golf', 'decoration': 'GolfCenter2', 'floor': 'FloorCarpet' },
			{ 'type': 'Panels', 'decoration': 'PanelsCenter0', 'floor': 'FloorTiles' }
		];
		roomsRandomizationConfig[4] = [
			{ 'type': 'Golf', 'decoration': 'GolfCenter0', 'floor': 'FloorCarpet' },
			{ 'type': 'Golf', 'decoration': 'GolfCenter1', 'floor': 'FloorCarpet' },
			{ 'type': 'Golf', 'decoration': 'GolfCenter2', 'floor': 'FloorCarpet' },
			{ 'type': 'Panels', 'decoration': 'PanelsCenter0', 'floor': 'FloorTiles' },
		];
		roomsRandomizationConfig[7] = [
			{ 'type': 'Laboratory', 'decoration': 'LaboratoryCenter1', 'floor': 'FloorTiles' },
			{ 'type': 'Golf', 'decoration': 'GolfCenter0', 'floor': 'FloorCarpet' },
			{ 'type': 'Golf', 'decoration': 'GolfCenter1', 'floor': 'FloorCarpet' },
			{ 'type': 'Golf', 'decoration': 'GolfCenter2', 'floor': 'FloorCarpet' },
			{ 'type': 'Panels', 'decoration': 'PanelsCenter0', 'floor': 'FloorTiles' },
			{ 'type': 'Panels', 'decoration': 'PanelsCenter1', 'floor': 'FloorTiles' }
		];
		const roomsCount = Config.FACILITY_SIZE * Config.FACILITY_SIZE;
		for (let i = 0; i < roomsCount; ++i)
		{
			roomsRandomizationConfig[i].push(	{ 'type': 'Crocks', 'decoration': null, 'floor': 'FloorCrocks' + i });

			const room = state.rooms[i];
			const variants = roomsRandomizationConfig[i];
			if (i == state.vaccineRoomNumber)
			{
				while (true)
				{
					const index = this.chance.natural({ 'max': variants.length - 1 });
					const variant = variants[index];
					if (variant.type == 'Laboratory')
					{
						room.floor = variant.floor;
						room.decoration = variant.decoration;
						++roomTypesCount['Laboratory'];
						break;
					}
				}
			}
			else
			{
				while (true)
				{
					const index = this.chance.natural({ 'max': variants.length - 1 });
					const variant = variants[index];
					if (roomTypesCount[variant.type] < roomTypesMaxCount[variant.type])
					{
						room.floor = variant.floor;
						room.decoration = variant.decoration;
						++roomTypesCount[variant.type];
						break;
					}
				}
			}
		}
	}

	onAnySpyTurn()
	{
		this.state.doors.forEach((door: DoorSchema) =>
		{
			--door.lockedForTurns;
			if (door.lockedForTurns < 0) door.lockedForTurns = 0;
		});
	}

	onCloseDoorMessage(client: Client, doorIndex: number)
	{
		const state = this.state;
		const player = this.playersByID.get(client.sessionId);
		if (player.role != 'guard' || state.whosTurn != 'guard') return;
		if (doorIndex < 0 || doorIndex > state.doors.length - 1) return;
	
		const door = state.doors[doorIndex];
		if (!door.isOpened || door.lockedForTurns > 0) return;

		door.isOpened = false;

		// checking whether spy is locked in room
		const room = state.rooms[state.spyRoomNumber];
		let hasOpenedDoor = false;
		room.doors.forEach((door: DoorSchema, dir: string) =>
		{
			if (door.isOpened)
			{
				hasOpenedDoor = true;
				return true;
			}
		});
		if (!hasOpenedDoor)
		{
			this.broadcast('winner', 'guard');
			this.clock.setTimeout(() =>
			{
				this.disconnect();
			}, 1000);
		}

		state.whosTurn = 'spy';

		this.broadcastPatch();
	}

	onOpenDoorMessage(client: Client, doorIndex: number)
	{
		const state = this.state;
		const player = this.playersByID.get(client.sessionId);
		if (player.role != state.whosTurn) return;
		if (doorIndex < 0 || doorIndex > this.state.doors.length - 1) return;
		
		const door = this.state.doors[doorIndex];
		if (door.isOpened) return;

		door.isOpened = true;

		if (player.role == 'spy')
		{
			door.lockedForTurns = Config.LOCK_OPENED_DOOR_FOR_TURNS;
			this.onAnySpyTurn();
			state.whosTurn = 'guard';
		}
		else
		{
			state.whosTurn = 'spy';
		}

		this.broadcastPatch();
	}

	onMoveSpyMessage(client: Client, dir: string)
	{
		const state = this.state;
		const player = this.playersByID.get(client.sessionId);
		if (player.role != 'spy' || state.whosTurn != 'spy') return;

		const currentSpyRoom = state.rooms[state.spyRoomNumber];
		if (currentSpyRoom.doors.has(dir))
		{
			const door = currentSpyRoom.doors.get(dir);
			if (door.isOpened)
			{
				door.connectsRooms.some((roomNumber: number) =>
				{
					if (roomNumber != state.spyRoomNumber)
					{
						this.state.whosTurn = 'guard';
						
						this.onAnySpyTurn();
						
						state.spyRoomNumber = roomNumber;
						if (!state.isVaccineStolen && state.spyRoomNumber == state.vaccineRoomNumber)
						{
							state.isVaccineStolen = true;
						}
						else if (state.isVaccineStolen && state.spyRoomNumber == state.spySpawnRoomNumber)
						{
							this.broadcast('winner', 'spy');
							this.clock.setTimeout(() =>
							{
								this.disconnect();
							}, 1000);
						}
						return true;
					}
				});
			}
		}

		this.broadcastPatch();
	}
}
