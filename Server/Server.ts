import http from 'http';
import cors from 'cors';
import express from 'express';
import { Server } from 'colyseus';
import { GameRoom } from './GameRoom';

// creating express app
const app = express();

app.use(cors());

app.use(express.static('Client'));
app.use(express.static('node_modules/pixi.js/dist'));
app.use(express.static('node_modules/pixi-spine/dist'));
app.use(express.static('node_modules/pixi-text-input'));
app.use(express.static('node_modules/pixi-sound/dist'));
app.use(express.static('node_modules/@tweenjs/tween.js/dist'));
app.use(express.static('node_modules/colyseus.js/dist'));

const gameServer = new Server({ 'server': http.createServer(app) });
gameServer.define('game', GameRoom).filterBy(['password']);

const port = Number(process.env.PORT || 8000);
gameServer.listen(port);
console.log(`Listening to http://localhost:${port}`);
