import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";

export class DoorSchema extends Schema
{
	@type('uint8')
	index: number = 0;

	@type('boolean')
	isOpened: boolean = true;

	@type(['int8'])
	connectsRooms: Array <number> = null;

	@type('int8')
	lockedForTurns: number = 0;
}

export class RoomSchema extends Schema
{
	@type('int8')
	roomNumber: number = 0;

	@type({ 'map': DoorSchema })
	doors: MapSchema <DoorSchema> = null;

	@type('string')
	floor: string = null;

	@type('string')
	decoration: string = null;

	constructor()
	{
		super();
		this.doors = new MapSchema <DoorSchema> ();
	}
}

export class GameSchema extends Schema
{
	@type('uint8')
	facilitySize: number = 0;

	@type([RoomSchema])
	rooms: ArraySchema <RoomSchema> = null;

	@type([DoorSchema])
	doors: Array <DoorSchema> = null;

	@type('int8')
	vaccineRoomNumber: number = 0;

	@type('boolean')
	isVaccineStolen: boolean = false;

	// not synchronized
	spySpawnRoomNumber: number = 0;

	@type('int8')
	spyRoomNumber: number = 0;

	@type('string')
	whosTurn: string = null;

	constructor()
	{
		super();
		this.rooms = new ArraySchema <RoomSchema> ();
		this.doors = new ArraySchema <DoorSchema> ();
	}
}
