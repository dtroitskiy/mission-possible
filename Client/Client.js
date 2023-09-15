'use strict';

function Client()
{
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

	this.app = null;
	this.map = {};

	this.pixiLoader = PIXI.Loader.shared;
	this.resources = this.pixiLoader.resources;
	this.ticker = PIXI.Ticker.shared;

	this.facilitySizeInRooms = 0;
	this.roomSizeInTiles = Config.ROOM_TILE_SIZE_IN_TILES;
	this.halfRoomSizeInTiles = this.roomSizeInTiles * 0.5;
	this.tileSizeInPixels = Config.TILE_SIZE_PIXELS;
	this.halfTileSizeInPixels = this.tileSizeInPixels * 0.5;
	this.roomSizeInPixels = this.tileSizeInPixels * this.roomSizeInTiles;
	this.halfRoomSizeInPixels = this.roomSizeInPixels * 0.5;

	this.gameType = null;
	this.role = null;
	this.playerName = this.otherPlayerName = null;
	this.whosTurn = null;
	this.isVaccineStolen = false;
	this.winner = null;
	this.isGameStarted = this.isGameEnded = false;
}

Client.prototype.run = function()
{
	this.app = new PIXI.Application();
	document.body.appendChild(this.app.view);
	this.app.view.sortableChildren = true;

	this.app.stage.interactive = true;
	this.app.stage.on('pointerdown', () =>
	{
		document.querySelectorAll('input').forEach((elem) =>
		{
			elem.blur();
		});
	});

	window.addEventListener('resize', this.onResize.bind(this));
	this.onResize();

	this.pixiLoader.baseUrl = 'Assets';
	this.pixiLoader
		.add('MenuBackground', 'Sprites/MenuBackground.png')
		.add('PublicGame', 'Sprites/PublicGame.png')
		.add('PrivateGame', 'Sprites/PrivateGame.png')
		.add('HowToPlay', 'Sprites/HowToPlay.png')
		.add('Connect', 'Sprites/Connect.png')
		.add('Waiting', 'Sprites/Waiting.png')
		.add('HowToPlayPopup', 'Sprites/HowToPlayPopup.png')
		.add('PopupCloseButton', 'Sprites/PopupCloseButton.png')
		.add('ScreenSpy', 'Sprites/ScreenSpy.png')
		.add('ScreenSpyMask', 'Sprites/ScreenSpyMask.png')
		.add('ScreenGuard', 'Sprites/ScreenGuard.png')
		.add('RestartButton', 'Sprites/RestartButton.png')
		.add('WaitSign', 'Sprites/WaitSign.png')
		.add('YourTurnSign', 'Sprites/YourTurnSign.png')
		.add('PlayAgainSign', 'Sprites/PlayAgainSign.png')
		.add('FloorCarpet', 'Sprites/Floors/Carpet.png')
		.add('FloorChessboard', 'Sprites/Floors/Chessboard.png')
		.add('FloorParquet', 'Sprites/Floors/Parquet.png')
		.add('FloorPlanks', 'Sprites/Floors/Planks.png')
		.add('FloorTiles', 'Sprites/Floors/Tiles.png')
		.add('FloorCrocks0', 'Sprites/Floors/Crocks0.png')
		.add('FloorCrocks1', 'Sprites/Floors/Crocks1.png')
		.add('FloorCrocks2', 'Sprites/Floors/Crocks2.png')
		.add('FloorCrocks3', 'Sprites/Floors/Crocks3.png')
		.add('FloorCrocks4', 'Sprites/Floors/Crocks4.png')
		.add('FloorCrocks5', 'Sprites/Floors/Crocks5.png')
		.add('FloorCrocks6', 'Sprites/Floors/Crocks6.png')
		.add('FloorCrocks7', 'Sprites/Floors/Crocks7.png')
		.add('FloorCrocks8', 'Sprites/Floors/Crocks8.png')
		.add('LaboratoryLeft0', 'Sprites/Decorations/Left/Laboratory/0.png')
		.add('LaboratoryLeft1', 'Sprites/Decorations/Left/Laboratory/1.png')
		.add('LaboratoryLeft2', 'Sprites/Decorations/Left/Laboratory/2.png')
		.add('LaboratoryCenter0', 'Sprites/Decorations/Center/Laboratory/0.png')
		.add('LaboratoryCenter1', 'Sprites/Decorations/Center/Laboratory/1.png')
		.add('LaboratoryRight0', 'Sprites/Decorations/Right/Laboratory/0.png')
		.add('LaboratoryRight1', 'Sprites/Decorations/Right/Laboratory/1.png')
		.add('LaboratoryRight2', 'Sprites/Decorations/Right/Laboratory/2.png')
		.add('LibraryLeft0', 'Sprites/Decorations/Left/Library/0.png')
		.add('LibraryRight0', 'Sprites/Decorations/Right/Library/0.png')
		.add('RelaxLeft0', 'Sprites/Decorations/Left/Relax/0.png')
		.add('RelaxRight0', 'Sprites/Decorations/Right/Relax/0.png')
		.add('WarehouseLeft0', 'Sprites/Decorations/Left/Warehouse/0.png')
		.add('WarehouseRight0', 'Sprites/Decorations/Right/Warehouse/0.png')
		.add('GolfCenter0', 'Sprites/Decorations/Center/Golf/0.png')
		.add('GolfCenter1', 'Sprites/Decorations/Center/Golf/1.png')
		.add('GolfCenter2', 'Sprites/Decorations/Center/Golf/2.png')
		.add('PanelsCenter0', 'Sprites/Decorations/Center/Panels/0.png')
		.add('PanelsCenter1', 'Sprites/Decorations/Center/Panels/1.png')
		.add('Walls', 'Sprites/Walls.png')
		.add('Vaccine', 'Sprites/Vaccine.json')
		.add('Arrow', 'Sprites/Arrow.json')
		.add('DoorTimer', 'Sprites/DoorTimer.json')
		.add('DoorAnimations', 'Animations/doors.json')
		.add('SpyAnimation', 'Animations/character.json')
		.add('Notifications', 'Animations/signs.json')
		.add('HighlightShader', 'Shaders/Highlight.frag')
		.add('MusicLoop', 'Audio/Music/MusicLoop.ogg')
		.add('Click', 'Audio/Sounds/Click.ogg')
		.add('Dash', 'Audio/Sounds/Dash.wav')
		.add('DoorOpen', 'Audio/Sounds/DoorOpen.wav')
		.add('DoorClose', 'Audio/Sounds/DoorClose.wav')
		.add('DoorJammed', 'Audio/Sounds/DoorJammed.wav')
		.add('VaccineFoundSpy', 'Audio/Sounds/VaccineFoundSpy.wav')
		.add('VaccineFoundGuard', 'Audio/Sounds/VaccineFoundGuard.wav')
		.add('Win', 'Audio/Sounds/Win.wav')
		.add('Lose', 'Audio/Sounds/Lose.wav')
		.add('FontReSquare', 'Fonts/ReSquare.woff2')
		.load(this.onLoaded.bind(this));

	this.ticker.add(this.update.bind(this));
};

Client.prototype.update = function()
{
	TWEEN.update();
};

Client.prototype.onResize = function()
{
	this.app.renderer.resize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
	const canvasStyle = this.app.view.style;
	canvasStyle.transformOrigin = '0 0';
	canvasStyle.transform = `scale(${1 / window.devicePixelRatio})`;
}

Client.prototype.onLoaded = function()
{
	const music = this.resources['MusicLoop'].sound;
	music.volume = 0.5;
	music.loop = true;
	music.play();

	this.buildMenuUI();
};

Client.prototype.connect = async function(options)
{
	const serverAddress = location.host.indexOf('localhost') != -1 ? 'ws://' + location.host : Config.SERVER_ADDRESS;
	let client = new Colyseus.Client(serverAddress);
	this.colyseusRoom = await client.joinOrCreate('game', options);
	this.colyseusRoom.onStateChange(this.onStateChange.bind(this));
	this.colyseusRoom.onMessage('ready', this.onReady.bind(this));
	this.colyseusRoom.onMessage('winner', this.onWinnerDetected.bind(this));
	this.colyseusRoom.onMessage('opponentDisconnected', this.onOpponentDisconneted.bind(this));
	this.colyseusRoom.onLeave(this.onDisconnected.bind(this));
};

Client.prototype.disconnect = function()
{
	if (this.colyseusRoom) this.colyseusRoom.leave();
};

Client.prototype.onStateChange = function(state)
{
	if (!this.map.rooms) return;

	if (this.whosTurn != state.whosTurn)
	{
		this.whosTurn = state.whosTurn;
		if (this.role == this.whosTurn)
		{
			this.gameUI.waitSign.visible = false;
			this.gameUI.yourTurnSign.visible = true;
		}
		else
		{
			this.gameUI.yourTurnSign.visible = false;
			this.gameUI.waitSign.visible = true;
		}
	}
	if (this.isVaccineStolen != state.isVaccineStolen)
	{
		this.isVaccineStolen = state.isVaccineStolen;
		if (this.role == 'spy')
		{
			this.map.spy.isVaccinePickUpAnimQueued = true;
		}
		else
		{
			this.map.spy.view.state.setAnimation(0, 'getitem', false);
			this.runVaccinePickedUpTween();
		}
	}

	const spy = this.map.spy;
	if (spy.roomNumber != state.spyRoomNumber)
	{
		spy.roomNumber = state.spyRoomNumber;
		const rvc = this.map.rooms[spy.roomNumber].viewCenter;
		const spyViewCenter = { 'x': rvc.x, 'y': rvc.y };
		if (this.role == 'spy')
		{
			this.runSpyMoveTween(spyViewCenter);
		}
		else
		{
			spy.viewCenter = spyViewCenter;
			spy.view.position.set(spyViewCenter.x, spyViewCenter.y);
		}
	}
};

Client.prototype.onDoorIsOpenedChange = function(door, isOpenedCurrent, isOpenedPrevious)
{
	if (!door.view) return;

	if (isOpenedCurrent != isOpenedPrevious)
	{
		let viewAnimPostfix = isOpenedCurrent ? 'open' : 'close';
		if (door.schema.lockedForTurns > 0)
		{
			viewAnimPostfix = 'jam_in';
		}
		door.view.state.setAnimation(0, `${door.viewAnimPrefix}_${viewAnimPostfix}`, false);
		this.updateSpyArrowsVisibility();
		this.playDoorSound(door);
	}
};

Client.prototype.onDoorLockedForTurnsChange = function(door, lockedForTurns)
{
	if (!door.view) return;

	door.view.timer.visible = true;
	door.view.timer.gotoAndStop(lockedForTurns - 1);
	if (lockedForTurns <= 0)
	{
		door.view.state.setAnimation(0, `${door.viewAnimPrefix}_jam_out`, false);
		door.view.timer.visible = false;
	}
};

Client.prototype.onReady = function(message)
{
	this.isGameStarted = true;
	this.role = message.role;

	message.names.forEach((name) =>
	{
		if (name != this.playerName)
		{
			this.otherPlayerName = name;
		}
	});
	
	this.menuUI.visible = false;

	this.buildGameUI();
	this.buildMap();
	this.buildMapView();
	this.updateSpyArrowsVisibility();
	this.updateViewport();
	this.configureInput();

	this.onStateChange(this.colyseusRoom.state);
};

Client.prototype.onWinnerDetected = function(winner)
{
	this.winner = winner;
	this.isGameEnded = true;
	
	this.map.view.spyLayer.visible = true;
	this.updateSpyArrowsVisibility();

	if (winner == this.role)
	{
		this.gameUI.notifications.state.setAnimation(0, 'win', false);
		const sound = this.resources['Win'].sound;
		sound.play();
	}
	else
	{
		this.gameUI.notifications.state.setAnimation(0, 'lost', false);
		const sound = this.resources['Lose'].sound;
		sound.play();
	}
};

Client.prototype.onOpponentDisconneted = function()
{
	if (!this.isGameStarted || this.isGameEnded) return;

	const msg = 'Your opponent disconnected, press OK to restart.';
	if (navigator.notification)
	{
		navigator.notification.alert(msg, () =>
		{
			location.reload();
		}, 'Disconnect');
	}
	else
	{
		alert(msg);
		location.reload();
	}
};

Client.prototype.onDisconnected = function()
{
	if (!this.isGameStarted || this.isGameEnded) return;

	const msg = 'You lost connection, press OK to restart.';
	if (navigator.notification)
	{
		navigator.notification.alert(msg, () =>
		{
			location.reload();
		}, 'Disconnect');
	}
	else
	{
		alert(msg);
		location.reload();
	}
};

Client.prototype.buildMenuUI = function()
{
	const menuUI = new PIXI.Sprite(this.resources['MenuBackground'].texture);
	this.menuUI = menuUI;
	this.app.stage.addChild(menuUI);
	menuUI.anchor.set(0.5);
	menuUI.position.set(this.app.renderer.width * 0.5, this.app.renderer.height * 0.5);
	const scale = Math.max(this.app.renderer.width / menuUI.texture.width, this.app.renderer.height / menuUI.texture.height);
	menuUI.scale.set(scale);

	const menuItemsContainer = new PIXI.Container();
	menuUI.menuItemsContainer = menuItemsContainer;
	menuUI.addChild(menuItemsContainer);
	menuItemsContainer.scale.set(Config.UI_MENU_ITEMS_CONTAINER_SCALE);
	menuItemsContainer.position.y = menuUI.texture.height * Config.UI_MENU_ITEMS_CENTER_Y_FACTOR;
	
	const menuButtonsResourceNames = ['PublicGame', 'PrivateGame', 'HowToPlay'];
	let menuItem = null, menuItemOffsetY = 0;
	menuButtonsResourceNames.forEach((resourceName) =>
	{
		menuItem = new PIXI.Sprite(this.resources[resourceName].texture);
		menuItemsContainer.addChild(menuItem);
		menuItem.anchor.x = 0.5;
		menuItem.y = menuItemOffsetY;
		menuItemOffsetY += menuItem.height * (1 + Config.UI_MENU_ITEMS_SPACING_FACTOR);

		menuItem.filters = [new PIXI.Filter(null, this.resources['HighlightShader'].data,
		                   { 'uHighlight': false, 'uHighlightAmount': Config.UI_MENU_ITEMS_HIGHLIGHT_AMOUNT })];

		menuItem.interactive = menuItem.buttonMode = true;
		
		menuItem.on('pointerdown', this.onMenuItemPointerDownOrOver.bind(this, menuItem));
		menuItem.on('pointerover', this.onMenuItemPointerDownOrOver.bind(this, menuItem));
		menuItem.on('pointerup', this.onMenuItemPointerUpOrOut.bind(this, menuItem));
		menuItem.on('pointerout', this.onMenuItemPointerUpOrOut.bind(this, menuItem));
		menuItem.on('pointerup', this.onMenuItemPointerUp.bind(this, resourceName));
	});
	menuItemOffsetY -= menuItem.height * Config.UI_MENU_ITEMS_SPACING_FACTOR;
	menuItemsContainer.pivot.y = menuItemOffsetY / 2;

	const connectContainer = new PIXI.Container();
	menuUI.connectContainer = connectContainer;
	menuUI.addChild(connectContainer);
	connectContainer.visible = false;
	connectContainer.scale.set(Config.UI_MENU_ITEMS_CONTAINER_SCALE);
	connectContainer.position.y = menuUI.texture.height * Config.UI_MENU_ITEMS_CENTER_Y_FACTOR;

	menuItemOffsetY = 0;
	const textInputWidth = (menuItem.width - Config.UI_TEXT_INPUT_PADDING * 2 - Config.UI_TEXT_INPUT_BORDER_WIDTH);
	const textInputConfig = {
		'input': {
			'fontFamily': Config.UI_TEXT_INPUT_FONT_FAMILY,
			'fontSize': Config.UI_TEXT_INPUT_FONT_SIZE + 'px',
			'padding': Config.UI_TEXT_INPUT_PADDING + 'px',
			'width': textInputWidth + 'px',
			'color': '#FFFFFF',
			'maxlength': 10
		},
		'box': {
			'default': { 'fill': 0x000000, 'stroke': { 'color': 0x333333, 'width': Config.UI_TEXT_INPUT_BORDER_WIDTH }},
			'focused': { 'fill': 0x000000, 'stroke': { 'color': 0x666666, 'width': Config.UI_TEXT_INPUT_BORDER_WIDTH }}
		}
	};

	const playerNameInput = new PIXI.TextInput(textInputConfig);
	connectContainer.playerNameInput = playerNameInput;
	connectContainer.addChild(playerNameInput);
	if (localStorage['playerName'])
	{
		playerNameInput.text = localStorage['playerName'];
	}
	playerNameInput.placeholder = 'NICKNAME...';
	playerNameInput.maxLength = Config.UI_NICKNAME_INPUT_MAX_LENGTH;
	playerNameInput.pivot.x = playerNameInput.width * Config.UI_TEXT_INPUT_PIVOT_CENTER_X_FACTOR;

	playerNameInput.on('keydown', (keyCode) =>
	{
		if (keyCode ==  13)
		{
			playerNameInput.blur();
			this.onConnectButtonPointerUp();
		}
	});

	const passwordInput = new PIXI.TextInput(textInputConfig);
	connectContainer.passwordInput = passwordInput;
	connectContainer.addChild(passwordInput);
	passwordInput.placeholder = 'PASSWORD...';
	passwordInput.maxLength = Config.UI_PASSWORD_INPUT_MAX_LENGTH;
	passwordInput.pivot.x = passwordInput.width * Config.UI_TEXT_INPUT_PIVOT_CENTER_X_FACTOR;

	passwordInput.on('keydown', (keyCode) =>
	{
		if (keyCode ==  13)
		{
			playerNameInput.blur();
			this.onConnectButtonPointerUp();
		}
	});
	
	const connectButton = new PIXI.Sprite(this.resources['Connect'].texture);
	connectContainer.addChild(connectButton);
	connectButton.anchor.x = 0.5;

	connectButton.filters = [new PIXI.Filter(null, this.resources['HighlightShader'].data,
	                        { 'uHighlight': false, 'uHighlightAmount': Config.UI_MENU_ITEMS_HIGHLIGHT_AMOUNT })];
	
	connectButton.interactive = connectButton.buttonMode = true;
	connectButton.on('pointerdown', this.onMenuItemPointerDownOrOver.bind(this, connectButton));
	connectButton.on('pointerover', this.onMenuItemPointerDownOrOver.bind(this, connectButton));
	connectButton.on('pointerup', this.onMenuItemPointerUpOrOut.bind(this, connectButton));
	connectButton.on('pointerout', this.onMenuItemPointerUpOrOut.bind(this, connectButton));
	connectButton.on('pointerup', this.onConnectButtonPointerUp.bind(this));

	const waitingButton = new PIXI.Sprite(this.resources['Waiting'].texture);
	menuUI.waitingButton = waitingButton;
	menuUI.addChild(waitingButton);
	waitingButton.visible = false;
	waitingButton.anchor.set(0.5);
	waitingButton.position.y = menuUI.texture.height * Config.UI_MENU_ITEMS_CENTER_Y_FACTOR;
	waitingButton.scale.set(Config.UI_MENU_ITEMS_CONTAINER_SCALE);
	
	waitingButton.filters = [new PIXI.Filter(null, this.resources['HighlightShader'].data,
	                        { 'uHighlight': false, 'uHighlightAmount': Config.UI_MENU_ITEMS_HIGHLIGHT_AMOUNT })];
	
	waitingButton.interactive = waitingButton.buttonMode = true;
	waitingButton.on('pointerdown', this.onMenuItemPointerDownOrOver.bind(this, waitingButton));
	waitingButton.on('pointerover', this.onMenuItemPointerDownOrOver.bind(this, waitingButton));
	waitingButton.on('pointerup', this.onMenuItemPointerUpOrOut.bind(this, waitingButton));
	waitingButton.on('pointerout', this.onMenuItemPointerUpOrOut.bind(this, waitingButton));
	waitingButton.on('pointerup', this.onWaitingButtonPointerUp.bind(this));

	const howToPlayTexture = this.resources['HowToPlayPopup'].texture;
	howToPlayTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
	const howToPlayPopup = new PIXI.Sprite(howToPlayTexture);
	this.menuUI.howToPlayPopup = howToPlayPopup;
	menuUI.addChild(howToPlayPopup);
	howToPlayPopup.visible = false;
	howToPlayPopup.scale.set(Config.UI_HOW_TO_PLAY_SCALE);
	howToPlayPopup.anchor.set(0.5);

	const popupCloseButtonTexture = this.resources['PopupCloseButton'].texture;
	popupCloseButtonTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
	const popupCloseButton = new PIXI.Sprite(popupCloseButtonTexture);
	howToPlayPopup.addChild(popupCloseButton);
	popupCloseButton.anchor.set(0.5);
	popupCloseButton.x = Config.UI_HOW_TO_PLAY_CLOSE_BUTTON_POS.x;
	popupCloseButton.y = Config.UI_HOW_TO_PLAY_CLOSE_BUTTON_POS.y;

	popupCloseButton.interactive = popupCloseButton.buttonMode = true;
	popupCloseButton.on('pointerup', this.onHowToPlayPopupCloseButtonUp.bind(this));
};

Client.prototype.showConnectToPublicGameUI = function()
{
	this.menuUI.menuItemsContainer.visible = false;

	const connectContainer = this.menuUI.connectContainer;

	let item = null, itemOffsetY = 0;
	connectContainer.children.forEach((child) =>
	{
		if (this.gameType == 'public' && child == connectContainer.passwordInput)
		{
			child.visible = false;
			return;
		}
		item = child;
		item.y = itemOffsetY;
		itemOffsetY += item.height * (1 + Config.UI_MENU_ITEMS_SPACING_FACTOR);
	});
	itemOffsetY -= item.height * Config.UI_MENU_ITEMS_SPACING_FACTOR;
	connectContainer.pivot.y = itemOffsetY / 2;

	connectContainer.visible = true;
};

Client.prototype.buildGameUI = function()
{
	const gameUI = new PIXI.Container();
	this.gameUI = gameUI;
	this.app.stage.addChild(gameUI);
	gameUI.zIndex = 10;
	gameUI.interactive = false;

	const playAgainSign = new PIXI.Sprite(this.resources['PlayAgainSign'].texture);
	gameUI.playAgainSign = playAgainSign;
	playAgainSign.visible = false;
	gameUI.addChild(playAgainSign);
	playAgainSign.anchor.set(0.5);
	
	playAgainSign.filters = [new PIXI.Filter(null, this.resources['HighlightShader'].data,
	                        { 'uHighlight': false, 'uHighlightAmount': Config.UI_MENU_ITEMS_HIGHLIGHT_AMOUNT })];

	const waitSign = new PIXI.Sprite(this.resources['WaitSign'].texture);
	gameUI.waitSign = waitSign;
	gameUI.addChild(waitSign);
	waitSign.visible = false;
	
	const yourTurnSign = new PIXI.Sprite(this.resources['YourTurnSign'].texture);
	gameUI.yourTurnSign = yourTurnSign;
	gameUI.addChild(yourTurnSign);
	yourTurnSign.visible = false;

	const playerNamesBG = new PIXI.Graphics();
	gameUI.addChild(playerNamesBG);
	playerNamesBG.alpha = Config.UI_PLAYER_NAMES_BG_ALPHA;

	const textStyle = new PIXI.TextStyle({
		'fontFamily': Config.UI_PLAYER_NAMES_FONT_FAMILY,
		'fontSize': Config.UI_PLAYER_NAMES_FONT_SIZE,
		'fill': '#FFFFFF'
	});
	
	const player1NameText = new PIXI.Text(this.playerName, textStyle);
	gameUI.player1NameText = player1NameText;
	gameUI.addChild(player1NameText);
	player1NameText.anchor.set(0.5);
	
	const player2NameText = new PIXI.Text(this.otherPlayerName, textStyle);
	gameUI.player2NameText = player2NameText;
	gameUI.addChild(player2NameText);
	player2NameText.anchor.set(0.5);
		
	let screen = null;
	if (this.role == 'spy')
	{
		screen = new PIXI.Sprite(this.resources['ScreenSpy'].texture);
		screen.maskSprite = new PIXI.Sprite(this.resources['ScreenSpyMask'].texture);
		screen.addChild(screen.maskSprite);
	}
	else
	{
		screen = new PIXI.Sprite(this.resources['ScreenGuard'].texture);
	}
	gameUI.screen = screen;
	gameUI.addChild(screen);

	const restartButton = new PIXI.Sprite(this.resources['RestartButton'].texture);
	gameUI.restartButton = restartButton;
	screen.addChild(restartButton);
	restartButton.anchor.set(0.5);
	restartButton.position.set(Config.UI_RESTART_BUTTON_POS.x, Config.UI_RESTART_BUTTON_POS.y);

	restartButton.filters = [new PIXI.Filter(null, this.resources['HighlightShader'].data,
	                        { 'uHighlight': false, 'uHighlightAmount': Config.UI_MENU_ITEMS_HIGHLIGHT_AMOUNT })];

	playerNamesBG.beginFill(0x000000);
	playerNamesBG.drawRect(0, 0, screen.width * Config.UI_PLAYER_NAMES_BG_WIDTH_FACTOR, screen.height * Config.UI_PLAYER_NAMES_BG_HEIGHT_FACTOR);
	playerNamesBG.endFill();

	playerNamesBG.beginFill(0x000000);
	playerNamesBG.drawRect(screen.width * (1 - Config.UI_PLAYER_NAMES_BG_WIDTH_FACTOR), 0,
	                       screen.width * Config.UI_PLAYER_NAMES_BG_WIDTH_FACTOR, screen.height * Config.UI_PLAYER_NAMES_BG_HEIGHT_FACTOR);
	playerNamesBG.endFill();

	player1NameText.position.set(screen.width * Config.UI_PLAYER_NAMES_X_FACTOR, screen.height * Config.UI_PLAYER_NAMES_Y_FACTOR);

	player2NameText.position.set(screen.width * (1 - Config.UI_PLAYER_NAMES_X_FACTOR), screen.height * Config.UI_PLAYER_NAMES_Y_FACTOR);

	gameUI.position.set(this.app.renderer.width * 0.5, this.app.renderer.height * 0.5);
	const scale = Math.min(this.app.renderer.width / screen.width, this.app.renderer.height / screen.height);
	gameUI.scale.set(scale);
	gameUI.pivot.set(screen.width * 0.5, screen.height * 0.5);

	playAgainSign.position.set(screen.width * 0.5, screen.height * Config.UI_PLAY_AGAIN_SIGN_START_Y_FACTOR);
	playAgainSign.targetY = screen.height * Config.UI_PLAY_AGAIN_SIGN_END_Y_FACTOR;

	const notifications = new PIXI.spine.Spine(this.resources['Notifications'].spineData);
	gameUI.notifications = notifications;
	gameUI.addChild(notifications);
	notifications.scale.set(Config.UI_NOTIFICATIONS_SCALE);
	notifications.position.set(screen.width * 0.5, screen.height * Config.UI_NOTIFICATIONS_OFFSET_Y_FACTOR);
};

Client.prototype.buildMap = function()
{
	const state = this.colyseusRoom.state;

	this.facilitySizeInRooms = state.facilitySize;
	
	const mapRooms = [];
	this.map.rooms = mapRooms;

	const mapDoors = [];
	this.map.doors = mapDoors;

	for (let i = 0; i < state.doors.length; ++i)
	{
		this.map.doors.push(null);
	}
	
	let processedDoorIndices = new Set();
	state.rooms.forEach((room) =>
	{
		const roomWrapper = { 'roomNumber': room.roomNumber, 'schema': room };
		const roomX = room.roomNumber % this.facilitySizeInRooms, roomY = Math.floor(room.roomNumber / this.facilitySizeInRooms);
		roomWrapper.viewCenter = {
			'x': (roomX + 0.5) * this.roomSizeInPixels + this.halfTileSizeInPixels,
			'y': (roomY + 0.5) * this.roomSizeInPixels + this.halfTileSizeInPixels
		};
		mapRooms.push(roomWrapper);

		roomWrapper.doors = new Map();
		room.doors.forEach((door, dir) =>
		{
			let doorWrapper = this.map.doors[door.index];
			if (!doorWrapper)
			{
				doorWrapper = { 'index': door.index, 'schema': door };
				this.map.doors[door.index] = doorWrapper;
			}
			roomWrapper.doors.set(dir, doorWrapper);
			switch (dir)
			{
				case 'left':
					doorWrapper.viewCenter = { 'x': roomWrapper.viewCenter.x - this.halfRoomSizeInPixels, 'y': roomWrapper.viewCenter.y };
				break;
				case 'top':
					doorWrapper.viewCenter = { 'x': roomWrapper.viewCenter.x, 'y': roomWrapper.viewCenter.y - this.halfRoomSizeInPixels };
				break;
				case 'right':
					doorWrapper.viewCenter = { 'x': roomWrapper.viewCenter.x + this.halfRoomSizeInPixels, 'y': roomWrapper.viewCenter.y };
				break;
				case 'bottom':
					doorWrapper.viewCenter = { 'x': roomWrapper.viewCenter.x, 'y': roomWrapper.viewCenter.y + this.halfRoomSizeInPixels };
				break;
			}

			if (!processedDoorIndices.has(door.index))
			{			
				door.listen('isOpened', this.onDoorIsOpenedChange.bind(this, doorWrapper));
				door.listen('lockedForTurns', this.onDoorLockedForTurnsChange.bind(this, doorWrapper));
				
				processedDoorIndices.add(door.index);
			}
		});
	});

	const vaccine = { 'roomNumber': state.vaccineRoomNumber };
	let rvc = mapRooms[vaccine.roomNumber].viewCenter;
	vaccine.viewCenter = { 'x': rvc.x, 'y': rvc.y };
	this.map.vaccine = vaccine;

	const spy = { 'roomNumber': state.spyRoomNumber, 'isMoving': false, 'lastMoveDir': null, 'isVaccinePickUpAnimQueued': false };
	rvc = mapRooms[spy.roomNumber].viewCenter;
	spy.viewCenter = { 'x': rvc.x, 'y': rvc.y };
	this.map.spy = spy;
};

Client.prototype.buildMapView = function()
{
	const mapView = new PIXI.Container();
	this.map.view = mapView;
	if (this.gameUI.screen.maskSprite)
	{
		mapView.mask = this.gameUI.screen.maskSprite;
	}
	this.app.stage.addChild(mapView);
	
	const floorsLayer = new PIXI.Container();
	this.map.view.floorsLayer = floorsLayer;
	mapView.addChild(floorsLayer);
	
	const wallsLayer = new PIXI.Sprite(this.resources['Walls'].texture);
	mapView.addChild(wallsLayer);
	
	const doorsLayer = new PIXI.Container();
	mapView.addChild(doorsLayer);
	
	const decorationsLayer = new PIXI.Container();
	mapView.addChild(decorationsLayer);
	
	mapView.pivot.set(wallsLayer.width * 0.5, wallsLayer.height * 0.5);
	mapView.scale.set(this.gameUI.height / wallsLayer.height * (this.role == 'spy' ? Config.UI_SPY_MAP_SCALE_FACTOR : Config.UI_GUARD_MAP_SCALE_FACTOR));
	mapView.position.set(this.app.renderer.width * 0.5, this.app.renderer.height * Config.MAP_OFFSET_Y_FACTOR);

	const doorTimerSpritesheet = this.resources['DoorTimer'].spritesheet;
	this.map.rooms.forEach((room) =>
	{
		const floor = new PIXI.Sprite(this.resources[room.schema.floor].texture);
		floorsLayer.addChild(floor);
		floor.anchor.set(0.5);
		floor.position.set(room.viewCenter.x, room.viewCenter.y);

		if (room.schema.decoration)
		{
			const decoration = new PIXI.Sprite(this.resources[room.schema.decoration].texture);
			decorationsLayer.addChild(decoration);
			decoration.anchor.set(0.5);
			decoration.position.set(room.viewCenter.x, room.viewCenter.y);
		}

		const roomX = room.roomNumber % this.facilitySizeInRooms;
		room.doors.forEach((door, dir) =>
		{
			if (door.view) return;
			
			door.view = new PIXI.spine.Spine(this.resources['DoorAnimations'].spineData);
			door.viewAnimPrefix = 'door_h';
			if (dir == 'left' || dir == 'right')
			{
				door.viewAnimPrefix = 'door_v';
				if (roomX >= Math.floor(this.facilitySizeInRooms * 0.5))
				{
					door.view.scale.x = -1;
				}
			}
			const viewAnimPostfix = door.schema.isOpened ? 'open_idle' : 'close_idle';
			door.view.state.setAnimation(0, `${door.viewAnimPrefix}_${viewAnimPostfix}`, false);
			door.view.position.set(door.viewCenter.x, door.viewCenter.y);
			doorsLayer.addChild(door.view);

			const doorTimer = new PIXI.AnimatedSprite(doorTimerSpritesheet.animations['DoorTimer']);
			door.view.addChild(doorTimer);
			door.view.timer = doorTimer;
			doorTimer.scale.x = door.view.scale.x;
			doorTimer.anchor.set(0.5);
			doorTimer.visible = false;
		});
	});

	const spyLayer = new PIXI.Container();
	mapView.spyLayer = spyLayer;
	mapView.addChild(spyLayer);
	
	const spy = this.map.spy;
	spy.view = new PIXI.spine.Spine(this.resources['SpyAnimation'].spineData);
	spyLayer.addChild(spy.view);
	spy.view.position.set(spy.viewCenter.x, spy.viewCenter.y);
	spy.view.state.addListener({ 'complete': this.onSpyAnimCompleted.bind(this) });
	spy.view.state.setAnimation(0, 'spawn', false);

	// for spy spawn
	const sound = this.resources['Dash'].sound;
	sound.play();
	
	spy.moveArrows = {};
	const arrowSpritesheet = this.resources['Arrow'].spritesheet;
	
	const moveLeftButton = new PIXI.AnimatedSprite(arrowSpritesheet.animations['Arrow']);
	spy.view.addChild(moveLeftButton);
	moveLeftButton.anchor.set(0.5);
	moveLeftButton.rotation = Math.PI;
	moveLeftButton.x = -this.tileSizeInPixels * 2;
	spy.moveArrows.left = moveLeftButton;

	moveLeftButton.filters = [new PIXI.Filter(null, this.resources['HighlightShader'].data,
	                          { 'uHighlight': false, 'uHighlightAmount': Config.SPY_ARROW_HIGHLIGHT_AMOUNT })];

	const moveTopButton = new PIXI.AnimatedSprite(arrowSpritesheet.animations['Arrow']);
	spy.view.addChild(moveTopButton);
	moveTopButton.anchor.set(0.5);
	moveTopButton.rotation = -Math.PI / 2;
	moveTopButton.y = -this.tileSizeInPixels * 2;
	spy.moveArrows.top = moveTopButton;

	moveTopButton.filters = [new PIXI.Filter(null, this.resources['HighlightShader'].data,
	                        { 'uHighlight': false, 'uHighlightAmount': Config.SPY_ARROW_HIGHLIGHT_AMOUNT })];

	const moveRightButton = new PIXI.AnimatedSprite(arrowSpritesheet.animations['Arrow']);
	spy.view.addChild(moveRightButton);
	moveRightButton.anchor.set(0.5);
	moveRightButton.x = this.tileSizeInPixels * 2;
	spy.moveArrows.right = moveRightButton;

	moveRightButton.filters = [new PIXI.Filter(null, this.resources['HighlightShader'].data,
	                          { 'uHighlight': false, 'uHighlightAmount': Config.SPY_ARROW_HIGHLIGHT_AMOUNT })];

	const moveBottomButton = new PIXI.AnimatedSprite(arrowSpritesheet.animations['Arrow']);
	spy.view.addChild(moveBottomButton);
	moveBottomButton.anchor.set(0.5);
	moveBottomButton.rotation = Math.PI / 2;
	moveBottomButton.y = this.tileSizeInPixels * 2;
	spy.moveArrows.bottom = moveBottomButton;

	moveBottomButton.filters = [new PIXI.Filter(null, this.resources['HighlightShader'].data,
	                           { 'uHighlight': false, 'uHighlightAmount': Config.SPY_ARROW_HIGHLIGHT_AMOUNT })];

	const vaccineLayer = new PIXI.Container();
	mapView.vaccineLayer = vaccineLayer;
	mapView.addChild(vaccineLayer);
	
	const vaccine = this.map.vaccine;
	vaccine.view = new PIXI.Sprite(this.resources['Vaccine'].texture);
	const vaccineSpritesheet = this.resources['Vaccine'].spritesheet;
	vaccine.view = new PIXI.AnimatedSprite(vaccineSpritesheet.animations['Vaccine']);
	vaccineLayer.addChild(vaccine.view);
	vaccine.view.anchor.set(0.5);
	vaccine.view.position.set(vaccine.viewCenter.x, vaccine.viewCenter.y);
	vaccine.view.animationSpeed = Config.VACCINE_ANIM_SPEED;
	vaccine.view.play();
	
	if (this.role == 'guard')
	{
		spyLayer.visible = false;
	}

	this.app.stage.sortChildren();
};

Client.prototype.onMenuItemPointerDownOrOver = function(menuItem)
{
	menuItem.filters[0].uniforms.uHighlight = true;
};

Client.prototype.onMenuItemPointerUpOrOut = function(menuItem)
{
	menuItem.filters[0].uniforms.uHighlight = false;
};

Client.prototype.onMenuItemPointerUp = function(menuItemName)
{
	if (this.menuUI.howToPlayPopup.visible) return;

	switch (menuItemName)
	{
		case 'PublicGame':
			this.gameType = 'public';
			this.showConnectToPublicGameUI();
		break;
		case 'PrivateGame':
			this.gameType = 'private';
			this.showConnectToPublicGameUI();
		break;
		case 'HowToPlay':
			this.menuUI.howToPlayPopup.visible = true;
		break;
	}

	this.playClickSound();
};

Client.prototype.onConnectButtonPointerUp = function()
{
	const connectContainer = this.menuUI.connectContainer;
	const playerNameText = connectContainer.playerNameInput.text.toUpperCase();
	const passwordText = connectContainer.passwordInput.text.toUpperCase();
	if (this.gameType == 'public' && playerNameText.length > 0)
	{
		connectContainer.visible = false;
		this.menuUI.waitingButton.visible = true;
		this.playerName = this.otherPlayerName = playerNameText;
		localStorage['playerName'] = this.playerName;
		this.connect({ 'playerName': playerNameText, 'password': 'none' });
	}
	else if (this.gameType == 'private' && playerNameText.length > 0 && passwordText.length > 0)
	{
		connectContainer.visible = false;
		this.menuUI.waitingButton.visible = true;
		this.playerName = this.otherPlayerName = playerNameText;
		localStorage['playerName'] = this.playerName;
		this.connect({ 'playerName': playerNameText, 'password': passwordText });
	}

	this.playClickSound();
};

Client.prototype.onWaitingButtonPointerUp = function()
{
	this.disconnect();
	this.menuUI.waitingButton.visible = false;
	this.menuUI.menuItemsContainer.visible = true;
	this.playClickSound();
};

Client.prototype.onHowToPlayPopupCloseButtonUp = function()
{
	this.menuUI.howToPlayPopup.visible = false;
	this.playClickSound();
};

Client.prototype.configureInput = function()
{
	function onPointerDownOrOver(button)
	{
		button.filters[0].uniforms.uHighlight = true;
	}
	function onPointerUpOrOut(button)
	{
		button.filters[0].uniforms.uHighlight = false;
	}

	this.map.doors.forEach((door) =>
	{
		const view = door.view;
		door.view.interactive = door.view.buttonMode = true;
		door.view.on('pointerup', this.onDoorOpenCloseRequested.bind(this, door));
	});

	function onSpyMoveArrowPointerUp(arrow, dir)
	{
		if (arrow.isUnlock)
		{
			const room = this.map.rooms[this.map.spy.roomNumber];
			this.onDoorOpenCloseRequested(room.doors.get(dir));
		}
		else
		{
			this.onSpyMoveRequested(dir);
		}
	}

	const spyMoveArrows = this.map.spy.moveArrows;
	for (let dir in spyMoveArrows)
	{
		const arrow = spyMoveArrows[dir];
		arrow.interactive = arrow.buttonMode = true;
		arrow.on('pointerover', onPointerDownOrOver.bind(this, arrow));
		arrow.on('pointerout', onPointerUpOrOut.bind(this, arrow));
		arrow.on('pointerdown', onPointerDownOrOver.bind(this, arrow));
		arrow.on('pointerup', onPointerUpOrOut.bind(this, arrow));
		arrow.on('pointerup', onSpyMoveArrowPointerUp.bind(this, arrow, dir));
	}

	function restart()
	{
		this.playClickSound();
		setTimeout(() =>
		{
			location.reload();
		}, 100);
	}

	const restartButton = this.gameUI.restartButton;
	restartButton.interactive = restartButton.buttonMode = true;
	restartButton.on('pointerdown', this.onMenuItemPointerDownOrOver.bind(this, restartButton));
	restartButton.on('pointerover', this.onMenuItemPointerDownOrOver.bind(this, restartButton));
	restartButton.on('pointerup', this.onMenuItemPointerUpOrOut.bind(this, restartButton));
	restartButton.on('pointerout', this.onMenuItemPointerUpOrOut.bind(this, restartButton));
	restartButton.on('pointerup', restart.bind(this));

	const playAgainSign = this.gameUI.playAgainSign;
	playAgainSign.interactive = playAgainSign.buttonMode = true;
	playAgainSign.on('pointerdown', this.onMenuItemPointerDownOrOver.bind(this, playAgainSign));
	playAgainSign.on('pointerover', this.onMenuItemPointerDownOrOver.bind(this, playAgainSign));
	playAgainSign.on('pointerup', this.onMenuItemPointerUpOrOut.bind(this, playAgainSign));
	playAgainSign.on('pointerout', this.onMenuItemPointerUpOrOut.bind(this, playAgainSign));
	playAgainSign.on('pointerup', restart.bind(this));
};

Client.prototype.updateViewport = function()
{
	if (this.role == 'spy')
	{
		const spyPos = this.map.spy.viewCenter;
		this.map.view.pivot.set(spyPos.x, spyPos.y);
	}
};

Client.prototype.updateSpyArrowsVisibility = function()
{
	const spy = this.map.spy;
	const room = this.map.rooms[spy.roomNumber];
	const spyMoveArrows = spy.moveArrows;
	for (let dir in spyMoveArrows)
	{
		const arrow = spyMoveArrows[dir];
		if (this.role == 'guard' || this.isGameEnded || spy.isMoving)
		{
			arrow.visible = false;
		}
		else
		{
			arrow.visible = false;
			if (room.doors.has(dir))
			{
				const door = room.doors.get(dir);
				arrow.visible = true;
				arrow.isUnlock = !door.schema.isOpened;
				arrow.gotoAndStop(arrow.isUnlock ? 1 : 0);
			}
		}
	}
};

Client.prototype.runSpyMoveTween = function(targetPos)
{
	const spy = this.map.spy;
	spy.isMoving = true;
	
	let anim = null, scaleX = 1;
	switch (this.map.spy.lastMoveDir)
	{
		case 'left':
			scaleX = -1;
		case 'right':
			anim = 'move_side';
		break;
		case 'top':
			anim = 'move_up';
		break;
		case 'bottom':
			anim = 'move_down';
		break;
	}
	spy.view.scale.x = scaleX;
	spy.view.state.setAnimation(0, anim, true);
	
	new TWEEN.Tween(spy.viewCenter)
		.to(targetPos, Config.SPY_MOVE_TIME)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() =>
		{
			spy.view.position.set(spy.viewCenter.x, spy.viewCenter.y);
			this.updateViewport();
			this.updateSpyArrowsVisibility();
		})
		.onComplete(() =>
		{
			spy.isMoving = false;
			spy.view.scale.x = 1;
			if (spy.isVaccinePickUpAnimQueued)
			{
				spy.view.state.setAnimation(0, 'getitem', false);
				this.runVaccinePickedUpTween();
				spy.isVaccinePickUpAnimQueued = false;
			}
			else
			{
				spy.view.state.setAnimation(0, 'idle', true);
			}
			this.updateSpyArrowsVisibility();
		}).start();

	const sound = this.resources['Dash'].sound;
	sound.play();
};

Client.prototype.runVaccinePickedUpTween = function()
{
	this.map.view.spyLayer.visible = true;

	const vaccineView = this.map.vaccine.view;
	new TWEEN.Tween(vaccineView.position)
		.to({ 'x': vaccineView.x, 'y': vaccineView.y - this.tileSizeInPixels }, Config.VACCINE_PICK_UP_TIME)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onComplete(() =>
		{
			this.map.vaccine.view.visible = false;
			if (this.role == 'guard')
			{
				this.map.view.spyLayer.visible = false;
			}
		}).start();

	this.gameUI.notifications.state.setAnimation(0, 'vaccine_found', false);

	const sound = this.resources[this.role == 'spy' ? 'VaccineFoundSpy' : 'VaccineFoundGuard'].sound;
	sound.play();
};

Client.prototype.onDoorOpenCloseRequested = function(door)
{
	if (this.role == 'spy' && this.whosTurn == 'spy')
	{
		if (!door.schema.isOpened)
		{
			this.colyseusRoom.send('openDoor', door.index);
		}
	}
	else if (this.role == 'guard' && this.whosTurn == 'guard')
	{
		if (door.schema.lockedForTurns)
		{
			const sound = this.resources['DoorJammed'].sound;
			sound.play();
		}
		else
		{
			this.colyseusRoom.send(door.schema.isOpened ? 'closeDoor' : 'openDoor', door.index);
		}
	}
};

Client.prototype.onSpyMoveRequested = function(dir)
{
	if (this.role != 'spy' || this.whosTurn != 'spy') return;
	this.map.spy.lastMoveDir = dir;
	this.colyseusRoom.send('moveSpy', dir);
};

Client.prototype.onSpyAnimCompleted = function(entry)
{
	const spyAnimState = this.map.spy.view.state;
	if (this.isGameEnded)
	{
		if (this.map.spy.isLastAnimation)
		{
			if (this.winner == 'spy')
			{
				this.map.view.spyLayer.visible = false;
			}
			spyAnimState.clearListeners();
			this.showPlayAgainSign();
		}
		else
		{
			this.map.spy.isLastAnimation = true;
			spyAnimState.setAnimation(0, this.winner == 'spy' ? 'win' : 'lose', false);
		}
	}
	else
	{
		spyAnimState.setAnimation(0, 'idle', true);
	}
};

Client.prototype.showPlayAgainSign = function()
{
	const playAgainSign = this.gameUI.playAgainSign;
	playAgainSign.visible = true;
	new TWEEN.Tween(playAgainSign).to({ 'y': playAgainSign.targetY }, Config.UI_PLAY_AGAIN_SIGN_SHOW_TIME).easing(TWEEN.Easing.Quadratic.Out).start();
};

Client.prototype.playClickSound = function(door)
{
	this.resources['Click'].sound.play();
};

Client.prototype.playDoorSound = function(door)
{
	const playSound = () =>
	{
		const sound = this.resources[door.schema.isOpened ? 'DoorOpen' : 'DoorClose'].sound;
		sound.play();
	};

	if (this.role == 'spy')
	{
		const room = this.map.rooms[this.map.spy.roomNumber];
		room.doors.forEach((d) =>
		{
			if (d == door) playSound();
		});
	}
	else
	{
		playSound();
	}
};

function onFullyLoaded()
{
	const client = new Client();
	client.run();
}

document.addEventListener('DOMContentLoaded', () =>
{
	if (window.process && window.process.__nwjs)
	{
		window.moveTo((window.screen.availWidth - window.outerWidth) / 2, (window.screen.availHeight - window.outerHeight) / 2);
	}

	// cordova handlers
	document.addEventListener('deviceready', () =>
	{
		if (window.StatusBar)
		{
			StatusBar.hide();
		}

		document.addEventListener('pause', () =>
		{
			PIXI.sound.pauseAll();
		}, false);

		document.addEventListener('resume', () =>
		{
			PIXI.sound.resumeAll();
		}, false);
	}, false);

	// forcefully loading ReSquare font
	const font = new FontFace('ReSquare', "url('Assets/Fonts/ReSquare.woff2') format('woff2')", {
		'style': 'normal', 'weight': 'normal'
	});
	font.load().then(() =>
	{
		document.fonts.add(font);
		onFullyLoaded();
	});
});
