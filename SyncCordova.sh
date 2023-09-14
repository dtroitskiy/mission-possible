OUTDIR=Cordova/www/
mkdir -p $OUTDIR
cp -r Client/* $OUTDIR
cp node_modules/pixi.js/dist/pixi.min.js $OUTDIR
cp node_modules/pixi-spine/dist/pixi-spine.js $OUTDIR
cp node_modules/pixi-text-input/PIXI.TextInput.js $OUTDIR
cp node_modules/pixi-sound/dist/pixi-sound.js $OUTDIR
cp node_modules/@tweenjs/tween.js/dist/tween.umd.js $OUTDIR
cp node_modules/colyseus.js/dist/colyseus.js $OUTDIR

