set OUTDIR=Cordova\www\
xcopy /S /Y Client\* %OUTDIR%
copy node_modules\pixi.js\dist\pixi.min.js %OUTDIR%
copy node_modules\pixi-spine\dist\pixi-spine.js %OUTDIR%
copy node_modules\pixi-text-input\PIXI.TextInput.js %OUTDIR%
copy node_modules\pixi-sound\dist\pixi-sound.js %OUTDIR%
copy node_modules\@tweenjs\tween.js\dist\tween.umd.js %OUTDIR%
copy node_modules\colyseus.js\dist\colyseus.js %OUTDIR%
