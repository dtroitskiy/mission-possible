precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform bool uHighlight;
uniform float uHighlightAmount;

void main(void)
{
	vec2 uvs = vTextureCoord.xy;
	vec4 fg = texture2D(uSampler, vTextureCoord);
	if (uHighlight)
	{
		fg *= uHighlightAmount;
	}
	gl_FragColor = fg;
}
