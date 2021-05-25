//global variables
var canvas=null;
var gl=null;
var glx=null;
var bFullscreen=false;
var canvas_original_width;
var canvas_original_height;

var ctx=null;
var msd_pos_AMCX=0.0;
var msd_pos_AMCY=0.0;
var msd_pos_KIIX=0.0;
var msd_pos_KIIY=0.0;
var msd_pos_KIIZ=-110.0;
var msd_pos_KIIZ_IS=-110.0;
var msd_pos_KIIZ_IN=-110.0;
var blend_counter=0.0;
var blend_counterS=0.0;
var flagA=0;
var flagS=0;
var flagT=0;
var flagR=0;
var flagO=0;
var flagM=0;
var flagE=0;
var flagD=0;
var flagI=0;
var flagC=0;
var flagO1=0;
var flagM1=0;
var flagP=0;

///for fire
//var msd_nParticles = 0;
var msd_msd_timeUniform;
var msd_resolutionUniform;
//var msd_mouseUniform;
var msd_samplerUniform;
var msd_uvAlphamsd_msd_timeUniform;
var msd_time = -100.0;

//Attributes Macro
const WebGlMacros=
{
	AMC_ATTRIBUTE_POSITION:0,
	AMC_ATTRIBUTE_COLOR:1,
	AMC_ATTRIBUTE_NORMAL:2,
	AMC_ATTRIBUTE_TEXTURE:3
};

var msd_vertexShaderObject;
var msd_fragmentShaderObject;
var msd_shaderProgramObject;

var msd_vao;
var msd_vbo;
var msd_vbo_color;
var msd_vbo_texture;
var msd_mvpUniform;
var msd_msd_samplerUniform;
var msd_blendUniform;
var msd_rectangle_texture;
var msd_rectangle_texture1;
var msd_angle_A=90.0;
var msd_angle_S=90.0;
var msd_angle_T=90.0;
var msd_angle_R=90.0;
var msd_angle_O=90.0;
var msd_angle_M=90.0;
var msd_angle_E=90.0;
var msd_angle_D=90.0;
var msd_angle_I=90.0;
var msd_angle_C=90.0;
var msd_angle_O1=90.0;
var msd_angle_M1=90.0;
var msd_angle_P=90.0;

var msd_perspectiveProjectionMatrix;

//to start Animation 
var requestAnimationFrame=window.requestAnimationFrame||
						  window.webkitRequestAnimationFrame ||
						  window.mozRequestAnimationFrame ||
						  window.oRequestAnimationFrame ||
						  window.msRequestAnimationFrame;
						  
var cancelAnimationFrame=window.cancelAnimationFrame||
						  window.webkitCancelRequestAnimationFrame ||window.webkitCancelAnimationFrame ||
						  window.mozCancelRequestAnimationFrame || window.mozCancelAnimationFrame ||
						  window.oCancelRequestAnimationFrame ||window.oCancelAnimationFrame ||
						  window.msCancelRequestAnimationFrame ||window.msCancelAnimationFrame;

//onload Function
function main()
{
	//get <canvas> element
	canvas=document.getElementById("AMC");
	if(!canvas)
		console.log("Obtaining canvas failed !!!");
	else
		console.log("Obtaining canvas succeded !!!\n");
	canvas_original_width=canvas.width;	
	canvas_original_height=canvas.height;
	//print canvas width and height on console
	console.log("Canvas width :"+canvas.width+"\tCanvas Height:"+canvas.height);
	
	//register keyboard's keydown event handler
	window.addEventListener("keydown",keyDown,false);
	window.addEventListener("click",mouseDown,false);
	window.addEventListener("resize",resize,false);
	
	//initialize WebGL
	init();
	
	//start drawing here  as warming up
	resize();
	draw();
}

function toggleFullScreen()
{
		
		var fullscreen_element=document.fullscreenElement || document.webkitFullscreenElement || 
		document.mozFullScreenElement || document.msFullscreenElement || null;
		
		//if not fullscreen
		if(!fullscreen_element)
		{
				if(canvas.requestFullscreen)
					canvas.requestFullscreen();
				else if(canvas.webkitRequestFullscreen)
					canvas.webkitRequestFullscreen();
				else if(canvas.mozRequestFullScreen)
					canvas.mozRequestFullScreen();
				else if(canvas.msRequestFullscreen)
					canvas.msRequestFullscreen();
		}
		else
		{
				if(document.exitFullscreen)
					document.exitFullscreen();
				else if(document.webkitExitFullscreen)
					document.webkitExitFullscreen();
				else if(document.mozCancelFullScreen)
					document.mozCancelFullScreen();
				else if(document.msExitFullscreen)
					document.msExitFullscreen();
		}
		if(bFullscreen==false)
			bFullscreen=true;
		else
			bFullscreen=false;
}
function init()
{
	
	//glx=canvas.getContext("2d");
	//glx.fillStyle = "#333333"; 	// This determines the text colour, it can take a hex value or rgba value (e.g. rgba(255,0,0,0.5))
	//glx.textAlign = "center";	// This determines the alignment of text, e.g. left, center, right
	//glx.textBaseline = "middle";	// This determines the baseline of the text, e.g. top, middle, bottom
	//glx.font = "12px monospace";	// This determines the size of the text and the font family used
	//glx.fillText("HTML5 Rocks!", canvas.width/2, canvas.height/2);
	
	//get WebGL 2.0 context
	gl=canvas.getContext("webgl2");
	if(gl==null)
	{
			console.log("Failed to get the rendering context of webGL");
			return;
	}
	gl.viewportWidth=canvas.width;
	gl.viewportHeight=canvas.height;
	var msd_vertexShaderSourceCode = "#version 300 es"+
						"\n"+
						"in vec4 vPosition;"+
						"in vec3 vColor;"+
						"in vec2 vTexCoord;"+
						"out vec3 out_vColor;"+
						"out vec2 out_TexCoord;"+
						"uniform mat4 u_mvp_matrix;"+
						"void main(void)"+
						"{"+
						"gl_Position=u_mvp_matrix * vPosition;"+
						"out_vColor=vColor;"+
						"out_TexCoord=vTexCoord;"+
						"}";
			
	msd_vertexShaderObject=gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(msd_vertexShaderObject,msd_vertexShaderSourceCode);
	gl.compileShader(msd_vertexShaderObject);
	if(gl.getShaderParameter(msd_vertexShaderObject,gl.COMPILE_STATUS)==false)
	{
		var error=gl.getShaderInfoLog(msd_vertexShaderObject);
		if(error.length>0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	var msd_fragmentShaderSourceCode=
							"#version 300 es"+
							"\n"+
							"precision highp float;"+
							"in vec3 out_vColor;"+
							"in vec2 out_TexCoord;"+
							"uniform sampler2D u_sampler;"+
							"uniform float u_blend;"+
							" uniform vec2 u_resolution;"+
							" uniform float msd_time;"+
							"uniform sampler2D sampler;"+
							"uniform vec4 uvAlphamsd_time;"+
							"out vec4 FragColor;"+
							"void main(void)"+
							"{"+
							/*"FragColor=out_vColor+texture(u_sampler,out_TexCoord);"+*/
							"vec2 uv = gl_FragCoord.yx / u_resolution.yx;"+
							"float umsd_time = uvAlphamsd_time.w;"+
							"vec2 n0Uv = vec2(uv.x*1.4 + 0.01, uv.y + msd_time*0.69);"+
							"vec2 n1Uv = vec2(uv.x*0.5 - 0.033, uv.y*2.0 + msd_time*0.12);"+
							"vec2 n2Uv = vec2(uv.x*0.94 + 0.02, uv.y*3.0 + msd_time*0.61);"+
							"float n0 = (texture(sampler, n0Uv).w-0.5)*2.0;"+
							"float n1 = (texture(sampler, n1Uv).w-0.5)*2.0;"+
							"float n2 = (texture(sampler, n2Uv).w-0.5)*2.0;"+
							"float noiseA = clamp(n0 + n1 + n2, -1.0, 1.0);"+
							"vec2 n0UvB = vec2(uv.x*0.7 - 0.01, uv.y + msd_time*0.27);"+
							"vec2 n1UvB = vec2(uv.x*0.45 + 0.033, uv.y*1.9 + msd_time*0.61);"+
							"vec2 n2UvB = vec2(uv.x*0.8 - 0.02, uv.y*2.5 + msd_time*0.51);"+
							"float n0B = (texture(sampler, n0UvB).w-0.5)*2.0;"+
							"float n1B = (texture(sampler, n1UvB).w-0.5)*2.0;"+
							"float n2B = (texture(sampler, n2UvB).w-0.5)*2.0;"+
							"float noiseB = clamp(n0B + n1B + n2B, -1.0, 1.0);"+
							"vec2 finalNoise = vec2(noiseA, noiseB);"+
							"float perturb = (1.0 - uv.y) * 0.35 + 0.02;"+
							"finalNoise = (finalNoise * perturb) + uv - 0.02;"+
							"vec4 color = texture(sampler, finalNoise);"+
							"color = vec4(color.x*2.0, color.y*0.9, (color.y/color.x)*0.2, 1.0);"+
							"finalNoise = clamp(finalNoise, 0.05, 1.0);"+
							"color.w = texture(sampler, finalNoise).z*2.0;"+
							"color.w = color.w*texture(sampler, uv).z;"+
							/*"FragColor=vec4(texture(u_sampler,out_TexCoord).xyz,u_blend);"+*/
							/*"FragColor=vec4(out_vColor,u_blend);"+*/
							"FragColor=color+texture(u_sampler,out_TexCoord);"+
							/*"FragColor=color;"+*/
							"}";
	msd_fragmentShaderObject=gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(msd_fragmentShaderObject,msd_fragmentShaderSourceCode);
	gl.compileShader(msd_fragmentShaderObject);
	if(gl.getShaderParameter(msd_fragmentShaderObject,gl.COMPILE_STATUS)==false)
	{
		var error=gl.getShaderInfoLog(msd_fragmentShaderObject);
		if(error.length>0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	//shader program
	msd_shaderProgramObject=gl.createProgram();
	gl.attachShader(msd_shaderProgramObject,msd_vertexShaderObject);
	gl.attachShader(msd_shaderProgramObject,msd_fragmentShaderObject);
	//prelink binding attribute
	gl.bindAttribLocation(msd_shaderProgramObject,WebGlMacros.AMC_ATTRIBUTE_POSITION,"vPosition");
	gl.bindAttribLocation(msd_shaderProgramObject,WebGlMacros.AMC_ATTRIBUTE_COLOR,"vColor");
	gl.bindAttribLocation(msd_shaderProgramObject,WebGlMacros.AMC_ATTRIBUTE_TEXTURE,"vTexCoord");
	//link the program
	gl.linkProgram(msd_shaderProgramObject);
	if(!gl.getProgramParameter(msd_shaderProgramObject,gl.LINK_STATUS))
	{
		var error=gl.getProgramInfoLog(msd_shaderProgramObject);
		if(error.length>0)
		{
			alert(error);
			uninitialize();
		}
	}
	msd_mvpUniform=gl.getUniformLocation(msd_shaderProgramObject,"u_mvp_matrix");
	msd_msd_samplerUniform=gl.getUniformLocation(msd_shaderProgramObject,"u_sampler");
	msd_blendUniform=gl.getUniformLocation(msd_shaderProgramObject,"u_blend");
	msd_msd_timeUniform=gl.getUniformLocation(msd_shaderProgramObject,"msd_time");
	msd_resolutionUniform=gl.getUniformLocation(msd_shaderProgramObject,"u_resolution");
	msd_uvAlphamsd_msd_timeUniform=gl.getUniformLocation(msd_shaderProgramObject,"uvAlphamsd_time");
	msd_samplerUniform=gl.getUniformLocation(msd_shaderProgramObject,"sampler");
	//for texture
	msd_rectangle_texture=gl.createTexture();
	msd_rectangle_texture.image=new Image();
	msd_rectangle_texture.image.src="marble.bmp";
	//msd_rectangle_texture.image.src="black.jpg";
	//msd_rectangle_texture.image.src="stone.png";
	msd_rectangle_texture.image.onload=function(){
		gl.bindTexture(gl.TEXTURE_2D,msd_rectangle_texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,msd_rectangle_texture.image);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D,null);
	}
	
	//rectangle
	msd_vao=gl.createVertexArray();
	gl.bindVertexArray(msd_vao);
	msd_vbo=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,msd_vbo);
	gl.bufferData(gl.ARRAY_BUFFER,0,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//color
	msd_vbo_color=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,msd_vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,0,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//for texture
	msd_vbo_texture=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,msd_vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,0,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindVertexArray(null);
	
	//fire
		msd_rectangle_texture = gl.createTexture();
		//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		
		//gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
		gl.bindTexture(gl.TEXTURE_2D, msd_rectangle_texture);
		
		//using clamp to edge for TEXTURE_WRAP_T it te pakdun thevlya sarkha dista
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		
		//using nearest shows line patches
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
			gl.UNSIGNED_BYTE,
			document.getElementById('ground')
		);
		gl.bindTexture(gl.TEXTURE_2D, null);
	gl.enable(gl.DEPTH_TEST);
	
	 gl.depthFunc(gl.LEQUAL);
	//set Clear Color
	gl.clearColor(0.0,0.0,0.0,1.0);//blue
	
	//initialize projection Matrix
	msd_perspectiveProjectionMatrix=mat4.create();
	//toggleFullScreen();
}
function resize()
{
	if(bFullscreen==true)
	{
		canvas.height=window.innerHeight;
		canvas.width=window.innerWidth;
	}
	else
	{
		canvas.width=canvas_original_width;
		canvas.height=canvas_original_height;
	}
	gl.viewport(0,0,canvas.width,canvas.height);
	mat4.perspective(msd_perspectiveProjectionMatrix,45.0,
		parseFloat(canvas.width) / parseFloat(canvas.height),
		0.1,
		100.0);
}
function draw()
{
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.useProgram(msd_shaderProgramObject);
	msd_pos_KIIX=-1.3;
	msd_pos_KIIY=0.7;
	var spacing=0.07;
	var msd_modelViewMatrix=mat4.create();
	var msd_modelViewProjectionMatrix=mat4.create();
	
	////////////////////////   KNOWLEDGE IS INTER-RELATED   ////////////////////////////
	gl.disable(gl.BLEND);
	//draw K
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-3.0+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawK(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw N
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-2.65+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	if(msd_time < 100)
		{
			msd_time = msd_time + 0.01;
			
		}else
		{
			msd_time = -100.0;
		}
		
		//it decides speed of fire
		gl.uniform1f(msd_msd_timeUniform, msd_time);
		
		//standard 800 * 600 worked first msd_time
		gl.uniform2fv(msd_resolutionUniform, [600, 800]);
		gl.uniform4fv(msd_uvAlphamsd_msd_timeUniform, [1.0, 1.0, 2.0, 0.5 ]);
		
	msdDrawN(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw O
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-2.3+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawO(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw W
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.95+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawW(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw L
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.6+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawL(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.45+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw D
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.1+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawD(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw G
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-0.8+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawG(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-0.5+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw I
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[0.4+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IS]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawI(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw S
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[0.7+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IS]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawS(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw I
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[1.5+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawI(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw N
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[1.8+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawN(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw T
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[2.2+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawT(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[2.4+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw R
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[2.75+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawR(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	spacing=-0.09;
	//draw Dash
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.3+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawDash(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw R
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.6+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawR(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.9+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw L
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[4.2+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawL(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw A
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[4.6+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.2,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawA(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw T
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[4.9+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawT(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[5.1+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw D
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[5.5+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawD(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	///////////////////////////////// ASTROMEDICOMP ////////////////////////////////
	
	msd_pos_AMCX=-1.1;
	msd_pos_AMCY=-0.5;
	gl.enable(gl.BLEND);
	//draw A
	if(msd_pos_KIIZ_IN==-5.0)
	{
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-3.0+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.4,0.5,0.0]);
		if(flagA==2 || flagA==1)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_A));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
		}
		mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		gl.uniform1f(msd_blendUniform,blend_counter);
		msdDrawA(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);	
		
	//draw S
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-2.3+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
		if(flagA==1)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_S));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
		}
		
		mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
		gl.uniform1f(msd_blendUniform,blend_counter);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		msdDrawS(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
		
	//draw T
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.6+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
		if(flagS==2)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_T));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
		}
		mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		msdDrawT(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw R
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.1+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
		if(flagT==3)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_R));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
		}
		mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		msdDrawR(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw O
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-0.4+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
		if(flagR==4)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_O));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
		}
		mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		msdDrawO(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw M
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[0.3+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	if(flagO==5)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_M));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawM(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[1.0+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	if(flagM==6)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_E));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw D
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[1.8+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	if(flagE==7)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_D));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawD(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw I
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[2.6+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	if(flagD==8)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_I));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawI(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw C
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.2+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	if(flagI==9)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_C));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawC(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw O
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.8+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	if(flagC==10)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_O1));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawO(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw M
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[4.5+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	if(flagO1==11)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_M1));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawM(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw P
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[5.2+msd_pos_AMCX,-1.5+msd_pos_AMCY,-5.0]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	if(flagM1==12)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(msd_angle_P));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,degToRadian(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,msd_perspectiveProjectionMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawP(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	}
	
	gl.useProgram(null);
	
	//knowledge is interrelated animation
	if(msd_pos_KIIZ<-5.0)
		msd_pos_KIIZ+=0.5;
	if(msd_pos_KIIZ_IS<-5.0 && msd_pos_KIIZ==-5.0)
		msd_pos_KIIZ_IS+=0.5;
	if(msd_pos_KIIZ_IN<-5.0 && msd_pos_KIIZ_IS==-5.0)
		msd_pos_KIIZ_IN+=0.5;

	if(msd_pos_KIIZ_IN==-5.0)
	{
		if(blend_counter<1.0)
		{
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
			blend_counter+=0.008;
		}
		else
		{
			flagA=2;
		}
	}
	if(blend_counter>=1.0)
	{
		console.log("blend_counter="+blend_counter);

		if(msd_angle_A>0.0)
		{	
			msd_angle_A-=0.5;
			console.log("msd_angle_A"+msd_angle_A);
		}
		else
			flagA=1;
	}
	
	if(flagA==1)
	{
		if(msd_angle_S>0.0)
		   msd_angle_S-=0.5;
	    else	
			flagS=2;	
	}

	if(flagS==2)
	{
		if(msd_angle_T>0.0)
			msd_angle_T=msd_angle_T-0.5;
		else 
			flagT=3;
	}
	
	if(flagT==3)
	{   
        if(msd_angle_R>0.0)
			msd_angle_R-=0.5;
		else
			flagR=4;	
	}		
	
	if(flagR==4)
	{
		if(msd_angle_O>0.0)
			msd_angle_O-=0.5;
		else
			flagO=5;	
	}	
	
	if(flagO==5)
	{
		if(msd_angle_M>0.0)	
			msd_angle_M-=0.5;
		else
			flagM=6;
	}
		
	if(flagM==6)
	{
		if(msd_angle_E>0.0)
			msd_angle_E-=0.5;
		else
			flagE=7;
	}
	
	if(flagE==7)
	{
		if(msd_angle_D>0.0)
			msd_angle_D-=0.5;
		else
			flagD=8;
	}
	if(flagD==8)
	{
		if(msd_angle_I>0.0)
			msd_angle_I-=0.5;
		else
			flagI=9;
	}
		
	if(flagI==9)
	{
		if(msd_angle_C>0.0)
			msd_angle_C-=0.5;
		else
			flagC=10;	
	}
	if(flagC==10)
	{
		if(msd_angle_O1>0.0)
			msd_angle_O1-=0.5;
		else
			flagO1=11;
	}
	
	if(flagO1==11)
	{
		if(msd_angle_M1>0.0)
			msd_angle_M1-=0.5;
		else
			flagM1=12;
	}	
	if(flagM1==12)
	{
		if(msd_angle_P>0.0)
			msd_angle_P-=0.5;
		else
			flagP=13;
	}
	
	//animation loop
	requestAnimationFrame(draw,canvas);
}



/*
function msdDrawU(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var UCoordinates=new Float32Array([
									  
										0.4,-0.8, 0.0,//front bottom 2
									   -0.1,-0.8, 0.0,//front bottom
									   -0.1,-1.0, 0.0,//front bottom
										0.4,-1.0, 0.0,//front bottom
									    0.6, 1.0, 0.0,//front right 3
										0.4, 1.0, 0.0,//front right
										0.4,-1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.1, 1.0, 0.0,//front left 4
									   -0.1, 1.0, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.4,-0.8, 0.1,//front bottom 6
									   -0.1,-0.8, 0.1,//front bottom
									   -0.1,-1.0, 0.1,//front bottom
										0.4,-1.0, 0.1,//front bottom
									    0.6, 1.0, 0.1,//front right 7
										0.4, 1.0, 0.1,//front right 
										0.4,-1.0, 0.1,//front right 
										0.6,-1.0, 0.1,//front right 
										0.1, 1.0, 0.1,//front left 8
									   -0.1, 1.0, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.6, 1.0, 0.1,//right right 9
										0.6, 1.0, 0.0,//right right
										0.6,-1.0, 0.0,//right right
										0.6,-1.0, 0.1,//right right
										0.4, 1.0, 0.1,//right left 10
										0.4, 1.0, 0.0,//right left 
										0.4,-0.8, 0.0,//right left 
										0.4,-0.8, 0.1,//right left 
										0.1, 1.0, 0.1,//left right 11
										0.1, 1.0, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 1.0, 0.1,//left left 12
									   -0.1, 1.0, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.1, 1.0, 0.1,//top top 13
									   -0.1, 1.0, 0.0,//top top 
									    0.1, 1.0, 0.0,//top top 
									    0.1, 1.0, 0.1,//top top 
									    0.6, 1.0, 0.1,//top bottom 14
									    0.6, 1.0, 0.0,//top bottom
									    0.4, 1.0, 0.0,//top bottom
										0.4, 1.0, 0.1,//top bottom
									   -0.1,-0.8, 0.1,//bottom top 15
									   -0.1,-0.8, 0.0,//bottom top
									    0.4,-0.8, 0.0,//bottom top
										0.4,-0.8, 0.1,//bottom top
									   -0.1,-1.0, 0.1,//bottom bottom 16
									   -0.1,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.1, 1.0, 0.1,//top left 17
									   -0.1, 1.0, 0.0,//top left
									   -0.1, 0.8, 0.0,//top left
									   -0.1, 0.8, 0.1,//top left
									   -0.1,-0.8, 0.1,//bottom left 18
									   -0.1,-0.8, 0.0,//bottom left
									   -0.1,-1.0, 0.0,//bottom left
									   -0.1,-1.0, 0.1 //bottom left
									    
										   ]);
	var UcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//front left 4
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 0.0, 1.0,//front top 5
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										1.0, 0.0, 0.0,//front bottom 6
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										0.0, 1.0, 1.0,//front right 7
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front left 8
 										0.0, 1.0, 1.0,//front left
	                                    0.0, 1.0, 1.0,//front left
										0.0, 1.0, 1.0,//front left
										1.0, 1.0, 0.0,//right right 9
 										1.0, 1.0, 0.0,//right right
	                                    1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right left 10
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 1.0,//left right 11
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left left 12
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 0.0, 1.0,//top top 13
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 1.0, 0.0,//top bottom 14
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 15
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										0.0, 0.6, 1.0,//bottom bottom 16
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//top left 17
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.6, 0.6, 1.0,//bottom left 18
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										
								
										]);
	var UTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front left 4
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 5
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 6
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 7
											1.0,0.0,//front right 
											1.0,1.0,//front right 
											0.0,1.0,//front right 
											0.0,0.0,//front left 8
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//right right 9
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 10
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//left right 11
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 12
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 13
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 14
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 15
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 16
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top left 17
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom left 18
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
										
									
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,UCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,UcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,UTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
		
	gl.bindVertexArray(null);
}



function msdDrawY(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var YCoordinates=new Float32Array([
										0.0, 0.8, 0.0,//front middle 1
										0.0, 0.4, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.0,//front middle
										0.0, 0.8, 0.1,//back middle 2
										0.0, 0.4, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.3, 0.2, 0.1,//back middle
										0.0, 0.8, 0.1,//middle up 3
										0.0, 0.8, 0.0,//middle up
										0.3, 0.2, 0.0,//middle up
										0.3, 0.2, 0.1,//middle up
										0.0, 0.4, 0.1,//middle down 4
										0.0, 0.4, 0.0,//middle down
										0.3,-0.2, 0.0,//middle down
										0.3,-0.2, 0.1,//middle down
										0.6, 0.8, 0.0,//front middle 5
										0.6, 0.4, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.0,//front middle
										0.6, 0.8, 0.1,//back middle 6
										0.6, 0.4, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.3, 0.2, 0.1,//back middle
										0.6, 0.8, 0.1,//middle up 7
										0.6, 0.8, 0.0,//middle up
										0.3, 0.2, 0.0,//middle up
										0.3, 0.2, 0.1,//middle up
										0.6, 0.4, 0.1,//middle down 8
										0.6, 0.4, 0.0,//middle down
										0.3,-0.2, 0.0,//middle down
										0.3,-0.2, 0.1,//middle down
									   0.35, 0.0, 0.0,//middle left half front 9
										0.3,-0.2, 0.0,//middle left half front
										0.3,-1.0, 0.0,//middle left half front
									   0.35,-1.0, 0.0,//middle left half front
									   0.35, 0.0, 0.1,//middle left half back 10
										0.3,-0.2, 0.1,//middle left half back
										0.3,-1.0, 0.1,//middle left half back
									   0.35,-1.0, 0.1,//middle left half back
									   0.25, 0.0, 0.0,//middle right half front 11
										0.3,-0.2, 0.0,//middle right half front
										0.3,-1.0, 0.0,//middle right half front
									   0.25,-1.0, 0.0,//middle right half front
									   0.25, 0.0, 0.1,//middle right half back 12
										0.3,-0.2, 0.1,//middle right half back
										0.3,-1.0, 0.1,//middle right half back
									   0.25,-1.0, 0.1,//middle right half back
									   0.35, 0.0, 0.1,//middle right half right 13
									   0.35, 0.0, 0.0,//middle right half right
									   0.35,-1.0, 0.0,//middle right half right
									   0.35,-1.0, 0.1,//middle right half right
									   0.25, 0.0, 0.1,//middle right half left 14
									   0.25, 0.0, 0.0,//middle right half left
									   0.25,-1.0, 0.0,//middle right half left
									   0.25,-1.0, 0.1,//middle right half left
									   0.25,-1.0, 0.1,//middle bottom 15
									   0.25,-1.0, 0.0,//middle bottom 
									   0.35,-1.0, 0.0,//middle bottom 
									   0.35,-1.0, 0.1,//middle bottom 
									    0.6, 0.8, 0.1,//top right 16
										0.6, 0.8, 0.0,//top right
										0.6, 0.4, 0.0,//top right
										0.6, 0.4, 0.1,//top right
									   -0.0, 0.8, 0.1,//top left 17
									   -0.0, 0.8, 0.0,//top left
									   -0.0, 0.4, 0.0,//top left
									   -0.0, 0.4, 0.1,//top left
									   
										   ]);
	var YcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front middle 1
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										0.0, 0.0, 1.0,//back middle 2
										0.0, 0.0, 1.0,//back middle
										0.0, 0.0, 1.0,//back middle
										0.0, 0.0, 1.0,//back middle
										1.0, 0.0, 0.0,//middle up 3
										1.0, 0.0, 0.0,//middle up
										1.0, 0.0, 0.0,//middle up
										1.0, 0.0, 0.0,//middle up
										0.0, 1.0, 0.0,//middle down 4
										0.0, 1.0, 0.0,//middle down
										0.0, 1.0, 0.0,//middle down
										0.0, 1.0, 0.0,//middle down
										0.0, 0.0, 1.0,//front middle 5
										0.0, 0.0, 1.0,//front middle
										0.0, 0.0, 1.0,//front middle
										0.0, 0.0, 1.0,//front middle
										1.0, 0.0, 0.0,//back middle 6
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										0.0, 1.0, 1.0,//middle up 7
										0.0, 1.0, 1.0,//middle up
										0.0, 1.0, 1.0,//middle up
										0.0, 1.0, 1.0,//middle up
										0.0, 1.0, 1.0,//middle down 8
 										0.0, 1.0, 1.0,//middle down
	                                    0.0, 1.0, 1.0,//middle down
										0.0, 1.0, 1.0,//middle down
										1.0, 1.0, 0.0,//middle left half front 9
 										1.0, 1.0, 0.0,//middle left half front
	                                    1.0, 1.0, 0.0,//middle left half front
										1.0, 1.0, 0.0,//middle left half front
										1.0, 1.0, 0.0,//middle left half back 10
										1.0, 1.0, 0.0,//middle left half back
										1.0, 1.0, 0.0,//middle left half back
										1.0, 1.0, 0.0,//middle left half back
										1.0, 1.0, 1.0,//middle right half front 11
										1.0, 1.0, 1.0,//middle right half front
										1.0, 1.0, 1.0,//middle right half front
										1.0, 1.0, 1.0,//middle right half front
										1.0, 1.0, 1.0,//middle right half back 12
										1.0, 1.0, 1.0,//middle right half back
										1.0, 1.0, 1.0,//middle right half back
										1.0, 1.0, 1.0,//middle right half back
										1.0, 0.0, 1.0,//middle right half right 13
										1.0, 0.0, 1.0,//middle right half right
										1.0, 0.0, 1.0,//middle right half right
										1.0, 0.0, 1.0,//middle right half right
										1.0, 1.0, 0.0,//middle right half left 14
										1.0, 1.0, 0.0,//middle right half left
										1.0, 1.0, 0.0,//middle right half left
										1.0, 1.0, 0.0,//middle right half left
										1.0, 1.0, 0.0,//middle bottom 15
										1.0, 1.0, 0.0,//middle bottom 
										1.0, 1.0, 0.0,//middle bottom 
										1.0, 1.0, 0.0,//middle bottom 
										0.0, 0.6, 1.0,//top right 16
										0.0, 0.6, 1.0,//top right
										0.0, 0.6, 1.0,//top right
										0.0, 0.6, 1.0,//top right
										1.0, 1.0, 0.0,//top left 17
										1.0, 1.0, 0.0,//top left
										1.0, 1.0, 0.0,//top left
										1.0, 1.0, 0.0,//top left
										
										]);
	var YTexture=new Float32Array([
											0.0,0.0,//front middle 1
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back middle 2
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//middle up 3
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 4
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//front middle 5
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back middle 6
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//middle up 7
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 8
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//middle left half front 9
											1.0,0.0,//middle left half front
											1.0,1.0,//middle left half front
											0.0,1.0,//middle left half front
											0.0,0.0,//middle left half back 10
											1.0,0.0,//middle left half back
											1.0,1.0,//middle left half back
											0.0,1.0,//middle left half back
											0.0,0.0,//middle right half front 11
											1.0,0.0,//middle right half front
											1.0,1.0,//middle right half front
											0.0,1.0,//middle right half front
											0.0,0.0,//middle right half back 12
											1.0,0.0,//middle right half back
											1.0,1.0,//middle right half back
											0.0,1.0,//middle right half back
											0.0,0.0,//middle right half right 13
											1.0,0.0,//middle right half right
											1.0,1.0,//middle right half right
											0.0,1.0,//middle right half right
											0.0,0.0,//middle right half left 14
											1.0,0.0,//middle right half left
											1.0,1.0,//middle right half left
											0.0,1.0,//middle right half left
											0.0,0.0,//middle bottom 15
											1.0,0.0,//middle bottom 
											1.0,1.0,//middle bottom 
											0.0,1.0,//middle bottom 
											0.0,0.0,//top right 16
											1.0,0.0,//top right
											1.0,1.0,//top right
											0.0,1.0,//top right
											0.0,0.0,//top left 17
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,YCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,YcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,YTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
		
	gl.bindVertexArray(null);
}


function msdDrawDash(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var DashCoordinates=new Float32Array([
										    0.2, 0.1, 0.0,//front 1
										   -0.2, 0.1, 0.0,//front
										   -0.2,-0.1, 0.0,//front
										    0.2,-0.1, 0.0,//front
											0.2, 0.1, 0.1,//back 2
										   -0.2, 0.1, 0.1,//back
										   -0.2,-0.1, 0.1,//back
										    0.2,-0.1, 0.1,//back
											0.2, 0.1, 0.1,//right 3
											0.2, 0.1, 0.0,//right
											0.2,-0.1, 0.0,//right
											0.2,-0.1, 0.1,//right
										   -0.2, 0.1, 0.1,//left 4
										   -0.2, 0.1, 0.0,//left
										   -0.2,-0.1, 0.0,//left
										   -0.2,-0.1, 0.1,//left
										   -0.2, 0.1, 0.1,//top 5
										   -0.2, 0.1, 0.0,//top
										    0.2, 0.1, 0.0,//top
											0.2, 0.1, 0.1,//top
										   -0.2,-0.1, 0.1,//bottom 5
										   -0.2,-0.1, 0.0,//bottom
										    0.2,-0.1, 0.0,//bottom
											0.2,-0.1, 0.1,//bottom
											
										   ]);
	var DashcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front left 3
										1.0, 0.0, 0.0,//front left 
										1.0, 0.0, 0.0,//front left 
										1.0, 0.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front top 4
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 0.0, 1.0,//front bottom 5
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front left 6
										1.0, 0.0, 0.0,//front left
										1.0, 0.0, 0.0,//front left
										1.0, 0.0, 0.0,//front left
										
										]);
	var DashTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front left 3
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 4
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 5
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front left 6
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
																																
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,DashCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,DashcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,DashTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	
	gl.bindVertexArray(null);
}


function msdDrawG(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var GCoordinates=new Float32Array([
									    0.6, 1.0, 0.0,//front top 1
									   -0.1, 1.0, 0.0,//front top
									   -0.1, 0.8, 0.0,//front top
									    0.6, 0.8, 0.0,//front top
										0.6,-0.8, 0.0,//front bottom 2
									   -0.1,-0.8, 0.0,//front bottom
									   -0.1,-1.0, 0.0,//front bottom
										0.6,-1.0, 0.0,//front bottom
										0.1, 0.8, 0.0,//front left 3
									   -0.1, 0.8, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.6, 1.0, 0.1,//front top 4
									   -0.1, 1.0, 0.1,//front top 
									   -0.1, 0.8, 0.1,//front top 
									    0.6, 0.8, 0.1,//front top 
										0.6,-0.8, 0.1,//front bottom 5
									   -0.1,-0.8, 0.1,//front bottom
									   -0.1,-1.0, 0.1,//front bottom
										0.6,-1.0, 0.1,//front bottom
									    0.1, 0.8, 0.1,//front left 6
									   -0.1, 0.8, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.1, 0.8, 0.1,//left right 7
										0.1, 0.8, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 0.8, 0.1,//left left 8
									   -0.1, 0.8, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.1, 1.0, 0.1,//top top 9
									   -0.1, 1.0, 0.0,//top top 
									    0.6, 1.0, 0.0,//top top 
										0.6, 1.0, 0.1,//top top 
									   -0.1, 0.8, 0.1,//top bottom 10
									   -0.1, 0.8, 0.0,//top bottom
									    0.6, 0.8, 0.0,//top bottom
										0.6, 0.8, 0.1,//top bottom
									   -0.1,-0.8, 0.1,//bottom top 11
									   -0.1,-0.8, 0.0,//bottom top
									    0.6,-0.8, 0.0,//bottom top
										0.6,-0.8, 0.1,//bottom top
									   -0.1,-1.0, 0.1,//bottom bottom 12
									   -0.1,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.1, 1.0, 0.1,//top left 13
									   -0.1, 1.0, 0.0,//top left
									   -0.1, 0.8, 0.0,//top left
									   -0.1, 0.8, 0.1,//top left
									   -0.1,-0.8, 0.1,//bottom left 14
									   -0.1,-0.8, 0.0,//bottom left
									   -0.1,-1.0, 0.0,//bottom left
									   -0.1,-1.0, 0.1,//bottom left
									    0.6, 1.0, 0.1,//top right 15
									    0.6, 1.0, 0.0,//top right
										0.6, 0.8, 0.0,//top right
										0.6, 0.8, 0.1,//top right
										0.6,-0.8, 0.1,//bottom right 16
									    0.6,-0.8, 0.0,//bottom right
										0.6,-1.0, 0.0,//bottom right
										0.6,-1.0, 0.1,//bottom right
										0.6,-0.2, 0.0,//front right bar 17
										0.4,-0.2, 0.0,//front right bar
										0.4,-0.8, 0.0,//front right bar
										0.6,-0.8, 0.0,//front right bar
										0.6,-0.2, 0.1,//back right bar 18
										0.4,-0.2, 0.1,//back right bar
										0.4,-0.8, 0.1,//back right bar
										0.6,-0.8, 0.1,//back right bar
										0.6,-0.2, 0.1,//right bar right 19
										0.6,-0.2, 0.0,//right bar right 
										0.6,-0.8, 0.0,//right bar right 
										0.6,-0.8, 0.1,//right bar right 
										0.4,-0.2, 0.1,//right bar left 20
										0.4,-0.2, 0.0,//right bar left 
										0.4,-0.8, 0.0,//right bar left 
										0.4,-0.8, 0.1,//right bar left 
										0.4,-0.2, 0.1,//right bar top 21
										0.4,-0.2, 0.0,//right bar top 
										0.6,-0.2, 0.0,//right bar top 
										0.6,-0.2, 0.1,//right bar top 
										
										   ]);
	var GcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front left 3
										1.0, 0.0, 0.0,//front left 
										1.0, 0.0, 0.0,//front left 
										1.0, 0.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front top 4
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 0.0, 1.0,//front bottom 5
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front left 6
										1.0, 0.0, 0.0,//front left
										1.0, 0.0, 0.0,//front left
										1.0, 0.0, 0.0,//front left
										0.0, 1.0, 1.0,//left right 7
										0.0, 1.0, 1.0,//left right 
										0.0, 1.0, 1.0,//left right 
										0.0, 1.0, 1.0,//left right 
										0.0, 1.0, 1.0,//left left 8
 										0.0, 1.0, 1.0,//left left
	                                    0.0, 1.0, 1.0,//left left
										0.0, 1.0, 1.0,//left left
										1.0, 1.0, 0.0,//top top 9
 										1.0, 1.0, 0.0,//top top 
	                                    1.0, 1.0, 0.0,//top top 
										1.0, 1.0, 0.0,//top top 
										1.0, 1.0, 0.0,//top bottom 10
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 1.0,//bottom top 11
										1.0, 1.0, 1.0,//bottom top
										1.0, 1.0, 1.0,//bottom top
										1.0, 1.0, 1.0,//bottom top
										1.0, 1.0, 1.0,//bottom bottom 12
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 0.0, 1.0,//top left 13
										1.0, 0.0, 1.0,//top left
										1.0, 0.0, 1.0,//top left
										1.0, 0.0, 1.0,//top left
										1.0, 1.0, 0.0,//bottom left 14
										1.0, 1.0, 0.0,//bottom left
										1.0, 1.0, 0.0,//bottom left
										1.0, 1.0, 0.0,//bottom left
										1.0, 1.0, 0.0,//top right 15
										1.0, 1.0, 0.0,//top right
										1.0, 1.0, 0.0,//top right
										1.0, 1.0, 0.0,//top right
										0.0, 0.6, 1.0,//bottom right 16
										0.0, 0.6, 1.0,//bottom right
										0.0, 0.6, 1.0,//bottom right
										0.0, 0.6, 1.0,//bottom right
										0.6, 0.6, 1.0,//front right bar 17
										0.6, 0.6, 1.0,//front right bar
										0.6, 0.6, 1.0,//front right bar
										0.6, 0.6, 1.0,//front right bar
										1.0, 0.0, 1.0,//back right bar 18
										1.0, 0.0, 1.0,//back right bar
										1.0, 0.0, 1.0,//back right bar
										1.0, 0.0, 1.0,//back right bar
										1.0, 0.3, 0.2,//right bar right 19
										1.0, 0.3, 0.2,//right bar right 
										1.0, 0.3, 0.2,//right bar right 
										1.0, 0.3, 0.2,//right bar right 
										0.8, 0.0, 1.0,//right bar left 20
										0.8, 0.0, 1.0,//right bar left 
										0.8, 0.0, 1.0,//right bar left 
										0.8, 0.0, 1.0,//right bar left 
										1.0, 0.1, 0.7,//right bar top 21
										1.0, 0.1, 0.7,//right bar top 
										1.0, 0.1, 0.7,//right bar top 
										1.0, 0.1, 0.7,//right bar top 
										
										]);
	var GTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front left 3
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 4
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 5
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front left 6
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//left right 7
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 8
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 9
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 10
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 11
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 12
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top left 13
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom left 14
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
											0.0,0.0,//top right 15
											1.0,0.0,//top right
											1.0,1.0,//top right
											0.0,1.0,//top right
											0.0,0.0,//bottom right 16
											1.0,0.0,//bottom right
											1.0,1.0,//bottom right
											0.0,1.0,//bottom right
											0.0,0.0,//front right bar 17
											1.0,0.0,//front right bar
											1.0,1.0,//front right bar
											0.0,1.0,//front right bar
											0.0,0.0,//back right bar 18
											1.0,0.0,//back right bar
											1.0,1.0,//back right bar
											0.0,1.0,//back right bar
											0.0,0.0,//right bar right 19
											1.0,0.0,//right bar right 
											1.0,1.0,//right bar right 
											0.0,1.0,//right bar right 
											0.0,0.0,//right bar left 20
											1.0,0.0,//right bar left 
											1.0,1.0,//right bar left 
											0.0,1.0,//right bar left 
											0.0,0.0,//right bar top 21
											1.0,0.0,//right bar top 
											1.0,1.0,//right bar top 
											0.0,1.0,//right bar top 
																																
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,GCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,GcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,GTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
	gl.drawArrays(gl.TRIANGLE_FAN,80,4);//21
	
	gl.bindVertexArray(null);
}

function msdDrawK(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var KCoordinates=new Float32Array([
									   	0.0, 1.0, 0.0,//front left 1
									   -0.2, 1.0, 0.0,//front left
									   -0.2,-1.0, 0.0,//front left
										0.0,-1.0, 0.0,//front left
										0.0, 1.0, 0.1,//back left 2
									   -0.2, 1.0, 0.1,//back left
									   -0.2,-1.0, 0.1,//back left
										0.0,-1.0, 0.1,//back left
										0.0, 1.0, 0.1,//left right 3
										0.0, 1.0, 0.0,//left right
										0.0,-1.0, 0.0,//left right
										0.0,-1.0, 0.1,//left right
									   -0.2, 1.0, 0.1,//left left 4
									   -0.2, 1.0, 0.0,//left left
									   -0.2,-1.0, 0.0,//left left
									   -0.2,-1.0, 0.1,//left left
									   -0.2, 1.0, 0.1,//left top 5
									   -0.2, 1.0, 0.0,//left top
										0.0, 1.0, 0.0,//left top
										0.0, 1.0, 0.1,//left top
									   -0.2,-1.0, 0.1,//left bottom 6
									   -0.2,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.1,//left bottom
										0.6, 1.0, 0.0,//front upper / 7
										0.0, 0.2, 0.0,//front upper /
										0.0,-0.2, 0.0,//front upper /
										0.6, 0.6, 0.0,//front upper /
										0.6, 1.0, 0.1,//back upper / 8
										0.0, 0.2, 0.1,//back upper /
										0.0,-0.2, 0.1,//back upper /
										0.6, 0.6, 0.1,//back upper /
										0.6, 1.0, 0.1,//right / 9
										0.6, 1.0, 0.0,//right / 
										0.6, 0.6, 0.0,//right / 
										0.6, 0.6, 0.1,//right / 
										0.6, 0.6, 0.1,//bottom  / 10
										0.6, 0.6, 0.0,//bottom  /
										0.0,-0.2, 0.0,//bottom  /
										0.0,-0.2, 0.1,//bottom  /
										0.6, 1.0, 0.1,//top  / 11
										0.6, 1.0, 0.0,//top  /
										0.0, 0.2, 0.0,//top  /
										0.0, 0.2, 0.1,//top  /
										0.16,0.02,0.0,// front \. 12
										0.0,-0.2, 0.0,// front \.
										0.6,-1.0, 0.0,// front \.
										0.6,-0.6, 0.0,// front \.
										0.16,0.02,0.1,// back \. 13
										0.0,-0.2, 0.1,// back \.
										0.6,-1.0, 0.1,// back \.
										0.6,-0.6, 0.1,// back \.
										0.16,0.02,0.1,// top \. 14
										0.16,0.02,0.0,// top \.
										0.6,-0.6, 0.0,// top \.
										0.6,-0.6, 0.1,// top \.
										0.0,-0.2, 0.1,// bottom \. 15
										0.0,-0.2, 0.0,// bottom \.
										0.6,-1.0, 0.0,// bottom \.
										0.6,-1.0, 0.1,// bottom \.
										0.6,-0.6, 0.1,//right \. 16
										0.6,-0.6, 0.0,//right \.
										0.6,-1.0, 0.0,//right \.
										0.6,-1.0, 0.1,//right \.
										   ]);
	var KcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front left 1
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 0.0, 1.0,//back left 2
										0.0, 0.0, 1.0,//back left
										0.0, 0.0, 1.0,//back left
										0.0, 0.0, 1.0,//back left
										1.0, 0.0, 0.0,//left right 3
										1.0, 0.0, 0.0,//left right
										1.0, 0.0, 0.0,//left right
										1.0, 0.0, 0.0,//left right
										0.0, 1.0, 0.0,//left left 4
										0.0, 1.0, 0.0,//left left
										0.0, 1.0, 0.0,//left left
										0.0, 1.0, 0.0,//left left
										0.0, 0.0, 1.0,//left top 5
										0.0, 0.0, 1.0,//left top
										0.0, 0.0, 1.0,//left top
										0.0, 0.0, 1.0,//left top
										1.0, 0.0, 0.0,//left bottom 6
										1.0, 0.0, 0.0,//left bottom
										1.0, 0.0, 0.0,//left bottom
										1.0, 0.0, 0.0,//left bottom
										0.0, 1.0, 1.0,//front upper / 7
										0.0, 1.0, 1.0,//front upper /
										0.0, 1.0, 1.0,//front upper /
										0.0, 1.0, 1.0,//front upper /
										0.0, 1.0, 1.0,//back upper / 8
 										0.0, 1.0, 1.0,//back upper /
	                                    0.0, 1.0, 1.0,//back upper /
										0.0, 1.0, 1.0,//back upper /
										1.0, 1.0, 0.0,//right / 9
 										1.0, 1.0, 0.0,//right / 
	                                    1.0, 1.0, 0.0,//right / 
										1.0, 1.0, 0.0,//right / 
										1.0, 0.0, 1.0,//bottom  / 10
										1.0, 0.0, 1.0,//bottom  /
										1.0, 0.0, 1.0,//bottom  /
										1.0, 0.0, 1.0,//bottom  /
										1.0, 1.0, 0.0,//top  / 11
										1.0, 1.0, 0.0,//top  /
										1.0, 1.0, 0.0,//top  /
										1.0, 1.0, 0.0,//top  /
										1.0, 1.0, 0.0,// front \. 12
										1.0, 1.0, 0.0,// front \.
										1.0, 1.0, 0.0,// front \.
										1.0, 1.0, 0.0,// front \.
										0.0, 0.6, 1.0,// back \. 13
										0.0, 0.6, 1.0,// back \.
										0.0, 0.6, 1.0,// back \.
										0.0, 0.6, 1.0,// back \.
										1.0, 1.0, 0.0,// top \. 14
										1.0, 1.0, 0.0,// top \.
										1.0, 1.0, 0.0,// top \.
										1.0, 1.0, 0.0,// top \.
										1.0, 0.0, 0.5,// bottom \. 15
										1.0, 0.0, 0.5,// bottom \.
										1.0, 0.0, 0.5,// bottom \.
										1.0, 0.0, 0.5,// bottom \.
										0.5, 1.0, 0.0,//right \. 16
										0.5, 1.0, 0.0,//right \.
										0.5, 1.0, 0.0,//right \.
										0.5, 1.0, 0.0,//right \.

										]);
	var KTexture=new Float32Array([
											0.0,0.0,//front left 1
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//back left 2
											1.0,0.0,//back left
											1.0,1.0,//back left
											0.0,1.0,//back left
											0.0,0.0,//left right 3
											1.0,0.0,//left right
											1.0,1.0,//left right
											0.0,1.0,//left right
											0.0,0.0,//left left 4
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//left top 5
											1.0,0.0,//left top
											1.0,1.0,//left top
											0.0,1.0,//left top
											0.0,0.0,//left bottom 6
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//front upper / 7
											1.0,0.0,//front upper /
											1.0,1.0,//front upper /
											0.0,1.0,//front upper /
											0.0,0.0,//back upper / 8
											1.0,0.0,//back upper /
											1.0,1.0,//back upper /
											0.0,1.0,//back upper /
											0.0,0.0,//right / 9
											1.0,0.0,//right / 
											1.0,1.0,//right / 
											0.0,1.0,//right / 
											0.0,0.0,//bottom  / 10
											1.0,0.0,//bottom  /
											1.0,1.0,//bottom  /
											0.0,1.0,//bottom  /
											0.0,0.0,//top  / 11
											1.0,0.0,//top  /
											1.0,1.0,//top  /
											0.0,1.0,//top  /
											0.0,0.0,// front \. 12
											1.0,0.0,// front \.
											1.0,1.0,// front \.
											0.0,1.0,// front \.
											0.0,0.0,// back \. 13
											1.0,0.0,// back \.
											1.0,1.0,// back \.
											0.0,1.0,// back \.
											0.0,0.0,// top \. 14
											1.0,0.0,// top \.
											1.0,1.0,// top \.
											0.0,1.0,// top \.
											0.0,0.0,// bottom \. 15
											1.0,0.0,// bottom \.
											1.0,1.0,// bottom \.
											0.0,1.0,// bottom \.
											0.0,0.0,//right \. 16
											1.0,0.0,//right \.
											1.0,1.0,//right \.
											0.0,1.0,//right \.
											
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,KCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,KcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,KTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
			
	gl.bindVertexArray(null);
}

function msdDrawW(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var WCoordinates=new Float32Array([
									   	0.0, 1.0, 0.0,//front left 1
									   -0.2, 1.0, 0.0,//front left
									   -0.2,-1.0, 0.0,//front left
										0.0,-1.0, 0.0,//front left
										0.8, 1.0, 0.0,//front right 2
										0.6, 1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.8,-1.0, 0.0,//front right
										0.3, 0.2, 0.0,//front middle 3
										0.0,-0.4, 0.0,//front middle
										0.0,-0.8, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.0, 1.0, 0.1,//back left 4
									   -0.2, 1.0, 0.1,//back left
									   -0.2,-1.0, 0.1,//back left
										0.0,-1.0, 0.1,//back left
										0.8, 1.0, 0.1,//back right 5
										0.6, 1.0, 0.1,//back right
										0.6,-1.0, 0.1,//back right
										0.8,-1.0, 0.1,//back right
										0.3, 0.2, 0.1,//back middle 6
										0.0,-0.4, 0.1,//back middle
										0.0,-0.8, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.8, 1.0, 0.1,//right right 7
										0.8, 1.0, 0.0,//right right
										0.8,-1.0, 0.0,//right right
										0.8,-1.0, 0.1,//right right
										0.6, 1.0, 0.1,//right left 8
										0.6, 1.0, 0.0,//right left
										0.6,-1.0, 0.0,//right left
										0.6,-1.0, 0.1,//right left
										0.0, 1.0, 0.1,//left right 9
										0.0, 1.0, 0.0,//left right
										0.0,-1.0, 0.0,//left right
										0.0,-1.0, 0.1,//left right
									   -0.2, 1.0, 0.1,//left left 10
									   -0.2, 1.0, 0.0,//left left
									   -0.2,-1.0, 0.0,//left left
									   -0.2,-1.0, 0.1,//left left
									    0.0,-0.8, 0.1,//middle up 11
										0.0,-0.8, 0.0,//middle up
										0.3,-0.2, 0.0,//middle up
										0.3,-0.2, 0.1,//middle up
										0.0,-0.4, 0.1,//middle down 12
										0.0,-0.4, 0.0,//middle down
										0.3, 0.2, 0.0,//middle down
										0.3, 0.2, 0.1,//middle down
										0.6, 1.0, 0.1,//right top 13
										0.6, 1.0, 0.0,//right top
										0.8, 1.0, 0.0,//right top
										0.8, 1.0, 0.1,//right top
										0.6,-1.0, 0.1,//right bottom 14
										0.6,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.1,//right bottom
									   -0.2, 1.0, 0.1,//left top 15
									   -0.2, 1.0, 0.0,//left top
										0.0, 1.0, 0.0,//left top
										0.0, 1.0, 0.1,//left top
									   -0.2,-1.0, 0.1,//left bottom 16
									   -0.2,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.1,//left bottom
										0.3, 0.2, 0.0,//front middle 17
										0.6,-0.4, 0.0,//front middle
										0.6,-0.8, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.1,//back middle 18
										0.6,-0.4, 0.1,//back middle
										0.6,-0.8, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.6,-0.8, 0.1,//middle up 19
										0.6,-0.8, 0.0,//middle up
										0.3,-0.2, 0.0,//middle up
										0.3,-0.2, 0.1,//middle up
										0.6,-0.4, 0.1,//middle down 20
										0.6,-0.4, 0.0,//middle down
										0.3, 0.2, 0.0,//middle down
										0.3, 0.2, 0.1,//middle down
										
										   ]);
	var WcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front left 1
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 0.0, 1.0,//front right 2
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										1.0, 0.0, 0.0,//front middle 3
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 0.0,//back left 4
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 0.0, 1.0,//back right 5
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										1.0, 0.0, 0.0,//back middle 6
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										0.0, 1.0, 1.0,//right right 7
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right left 8
 										0.0, 1.0, 1.0,//right left
	                                    0.0, 1.0, 1.0,//right left
										0.0, 1.0, 1.0,//right left
										1.0, 1.0, 0.0,//left right 9
 										1.0, 1.0, 0.0,//left right
	                                    1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left left 10
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//right top 13
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 1.0, 0.0,//right bottom 14
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//left top 15
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										0.0, 0.6, 1.0,//left bottom 16
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										1.0, 1.0, 0.0,//left top 17
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 0.0, 0.5,//left top 18
										1.0, 0.0, 0.5,//left top
										1.0, 0.0, 0.5,//left top
										1.0, 0.0, 0.5,//left top
										0.5, 1.0, 0.0,//left top 19
										0.5, 1.0, 0.0,//left top
										0.5, 1.0, 0.0,//left top
										0.5, 1.0, 0.0,//left top
										1.0, 0.2, 0.2,//left top 20
										1.0, 0.2, 0.2,//left top
										1.0, 0.2, 0.2,//left top
										1.0, 0.2, 0.2,//left top
										
										]);
	var WTexture=new Float32Array([
											0.0,0.0,//front left 1
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//front right 2
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front middle 3
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back left 4
											1.0,0.0,//back left
											1.0,1.0,//back left
											0.0,1.0,//back left
											0.0,0.0,//back right 5
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 6
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//right right 7
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 8
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0,//right left
											0.0,0.0,//left right 9
											1.0,0.0,//left right
											1.0,1.0,//left right
											0.0,1.0,//left right
											0.0,0.0,//left left 10
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//right top 13
											1.0,0.0,//right top
											1.0,1.0,//right top
											0.0,1.0,//right top
											0.0,0.0,//right bottom 14
											1.0,0.0,//right bottom
											1.0,1.0,//right bottom
											0.0,1.0,//right bottom
											0.0,0.0,//left top 15
											1.0,0.0,//left top
											1.0,1.0,//left top
											0.0,1.0,//left top
											0.0,0.0,//left bottom 16
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 17
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom	
											0.0,0.0,//left bottom 18
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 19
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 20
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,WCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,WcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,WTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
		
	gl.bindVertexArray(null);
}
function msdDrawS(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var SCoordinates=new Float32Array([
									   0.6, 1.0, 0.0,//front top 1
									  -0.2, 1.0, 0.0,//front top 
									  -0.2, 0.8, 0.0,//front top 
									   0.6, 0.8, 0.0,//front top 
									  -0.2, 1.0, 0.0,//front left mid 2
									  -0.4, 1.0, 0.0,//front left mid
									  -0.4, 0.1, 0.0,//front left mid
									  -0.2, 0.1, 0.0,//front left mid
									   0.6,-0.1, 0.0,//front mid 3
									  -0.4,-0.1, 0.0,//front mid 
									  -0.4, 0.1, 0.0,//front mid 
									   0.6, 0.1, 0.0,//front mid 
									   0.6,-0.1, 0.0,//front right 4
									   0.4,-0.1, 0.0,//front right
									   0.4,-1.0, 0.0,//front right
									   0.6,-1.0, 0.0,//front right
									   0.4,-0.8, 0.0,//front bottom 5
									  -0.4,-0.8, 0.0,//front bottom
									  -0.4,-1.0, 0.0,//front bottom
									   0.4,-1.0, 0.0,//front bottom
									   0.6, 1.0, 0.1,//back top 6
									  -0.2, 1.0, 0.1,//back top 
									  -0.2, 0.8, 0.1,//back top 
									   0.6, 0.8, 0.1,//back top 
									  -0.2, 1.0, 0.1,//back left mid 7
									  -0.4, 1.0, 0.1,//back left mid
									  -0.4, 0.1, 0.1,//back left mid
									  -0.2, 0.1, 0.1,//back left mid
									   0.6,-0.1, 0.1,//back mid 8
									  -0.4,-0.1, 0.1,//back mid 
									  -0.4, 0.1, 0.1,//back mid 
									   0.6, 0.1, 0.1,//back mid 
									   0.6,-0.1, 0.1,//back right 9
									   0.4,-0.1, 0.1,//back right
									   0.4,-1.0, 0.1,//back right
									   0.6,-1.0, 0.1,//back right
									   0.4,-0.8, 0.1,//back bottom 10
									  -0.4,-0.8, 0.1,//back bottom
									  -0.4,-1.0, 0.1,//back bottom
									   0.4,-1.0, 0.1,//back bottom
									  -0.4, 1.0, 0.1,//top top 11
									  -0.4, 1.0, 0.0,//top top
									   0.6, 1.0, 0.0,//top top
									   0.6, 1.0, 0.1,//top top
									  -0.4,-1.0, 0.1,//bottom bottom 12
									  -0.4,-1.0, 0.0,//bottom bottom
									   0.6,-1.0, 0.0,//bottom bottom
									   0.6,-1.0, 0.1,//bottom bottom
									  -0.2, 0.8, 0.1,//top bottom 13
									  -0.2, 0.8, 0.0,//top bottom
									   0.6, 0.8, 0.0,//top bottom
									   0.6, 0.8, 0.1,//top bottom
									  -0.2, 0.1, 0.1,//middle top 14
									  -0.2, 0.1, 0.0,//middle top 
									   0.6, 0.1, 0.0,//middle top 
									   0.6, 0.1, 0.1,//middle top 
									  -0.4,-0.1, 0.1,//middle bottom 15
									  -0.4,-0.1, 0.0,//middle bottom
									   0.4,-0.1, 0.0,//middle bottom
									   0.4,-0.1, 0.1,//middle bottom
									  -0.4,-0.8, 0.1,//bottom top 16
									  -0.4,-0.8, 0.0,//bottom top 
									   0.4,-0.8, 0.0,//bottom top 
									   0.4,-0.8, 0.1,//bottom top 
									  -0.4, 1.0, 0.1,//left left 17
									  -0.4, 1.0, 0.0,//left left 
									  -0.4,-0.1, 0.0,//left left 
									  -0.4,-0.1, 0.1,//left left 
									  -0.2, 0.8, 0.1,//left right 18
									  -0.2, 0.8, 0.0,//left right 
									  -0.2, 0.1, 0.0,//left right 
									  -0.2, 0.1, 0.1,//left right 
									   0.6, 0.1, 0.1,//right right 19
									   0.6, 0.1, 0.0,//right right 
									   0.6,-1.0, 0.0,//right right 
									   0.6,-1.0, 0.1,//right right 
									   0.4,-0.1, 0.1,//right left 20
									   0.4,-0.1, 0.0,//right left 
									   0.4,-1.0, 0.0,//right left 
									   0.4,-1.0, 0.1,//right left 
									  -0.4,-0.8, 0.1,//bottom left 21
									  -0.4,-0.8, 0.0,//bottom left
									  -0.4,-1.0, 0.0,//bottom left
									  -0.4,-1.0, 0.1,//bottom left
									   0.6, 0.8, 0.1,//top right 22
									   0.6, 0.8, 0.0,//top right
									   0.6, 1.0, 0.0,//top right
									   0.6, 1.0, 0.1,//top right
										   ]);
	var ScolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 0.0, 1.0,//front left mid 2
										0.0, 0.0, 1.0,//front left mid
										0.0, 0.0, 1.0,//front left mid
										0.0, 0.0, 1.0,//front left mid
										1.0, 0.0, 0.0,//front mid 3
										1.0, 0.0, 0.0,//front mid 
										1.0, 0.0, 0.0,//front mid 
										1.0, 0.0, 0.0,//front mid 
										0.0, 1.0, 0.0,//front right 4
										0.0, 1.0, 0.0,//front right
										0.0, 1.0, 0.0,//front right
										0.0, 1.0, 0.0,//front right
										0.0, 0.0, 1.0,//front bottom 5
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//back top 6
										1.0, 0.0, 0.0,//back top 
										1.0, 0.0, 0.0,//back top 
										1.0, 0.0, 0.0,//back top 
										0.0, 1.0, 1.0,//back left mid 7
										0.0, 1.0, 1.0,//back left mid
										0.0, 1.0, 1.0,//back left mid
										0.0, 1.0, 1.0,//back left mid
										0.0, 1.0, 1.0,//back mid 8
 										0.0, 1.0, 1.0,//back mid 
	                                    0.0, 1.0, 1.0,//back mid 
										0.0, 1.0, 1.0,//back mid 
										1.0, 1.0, 0.0,//back right 9
 										1.0, 1.0, 0.0,//back right
	                                    1.0, 1.0, 0.0,//back right
										1.0, 1.0, 0.0,//back right
										1.0, 1.0, 0.0,//back bottom 10
										1.0, 1.0, 0.0,//back bottom
										1.0, 1.0, 0.0,//back bottom
										1.0, 1.0, 0.0,//back bottom
										1.0, 1.0, 1.0,//top top 11
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//bottom bottom 12
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 0.0, 1.0,//top bottom 13
										1.0, 0.0, 1.0,//top bottom
										1.0, 0.0, 1.0,//top bottom
										1.0, 0.0, 1.0,//top bottom
										1.0, 1.0, 0.0,//middle top 14
										1.0, 1.0, 0.0,//middle top 
										1.0, 1.0, 0.0,//middle top 
										1.0, 1.0, 0.0,//middle top 
										1.0, 1.0, 0.0,//middle bottom 15
										1.0, 1.0, 0.0,//middle bottom
										1.0, 1.0, 0.0,//middle bottom
										1.0, 1.0, 0.0,//middle bottom
										0.0, 0.6, 1.0,//bottom top 16
										0.0, 0.6, 1.0,//bottom top 
										0.0, 0.6, 1.0,//bottom top 
										0.0, 0.6, 1.0,//bottom top 
										1.0, 1.0, 0.0,//left left 17
										1.0, 1.0, 0.0,//left left 
										1.0, 1.0, 0.0,//left left 
										1.0, 1.0, 0.0,//left left 
										1.0, 0.0, 0.5,//left right 18
										1.0, 0.0, 0.5,//left right 
										1.0, 0.0, 0.5,//left right 
										1.0, 0.0, 0.5,//left right 
										0.5, 1.0, 0.0,//right right 19
										0.5, 1.0, 0.0,//right right 
										0.5, 1.0, 0.0,//right right 
										0.5, 1.0, 0.0,//right right 
										1.0, 0.2, 0.2,//right left 20
										1.0, 0.2, 0.2,//right left 
										1.0, 0.2, 0.2,//right left 
										1.0, 0.2, 0.2,//right left 
										0.8, 0.2, 0.2,//bottom left 21
										0.8, 0.2, 0.2,//bottom left
										0.8, 0.2, 0.2,//bottom left
										0.8, 0.2, 0.2,//bottom left
										0.3, 0.8, 0.1,//top right 22
										0.3, 0.8, 0.1,//top right
										0.3, 0.8, 0.1,//top right
										0.3, 0.8, 0.1,//top right
										
										]);
	var STexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front left mid 2
											1.0,0.0,//front left mid
											1.0,1.0,//front left mid
											0.0,1.0,//front left mid
											0.0,0.0,//front mid 3
											1.0,0.0,//front mid 
											1.0,1.0,//front mid 
											0.0,1.0,//front mid 
											0.0,0.0,//front right 4
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front bottom 5
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//back top 6
											1.0,0.0,//back top 
											1.0,1.0,//back top 
											0.0,1.0,//back top 
											0.0,0.0,//back left mid 7
											1.0,0.0,//back left mid
											1.0,1.0,//back left mid
											0.0,1.0,//back left mid
											0.0,0.0,//back mid 8
											1.0,0.0,//back mid 
											1.0,1.0,//back mid 
											0.0,1.0,//back mid 
											0.0,0.0,//back right 9
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back bottom 10
											1.0,0.0,//back bottom
											1.0,1.0,//back bottom
											0.0,1.0,//back bottom
											0.0,0.0,//top top 11
											1.0,0.0,//top top
											1.0,1.0,//top top
											0.0,1.0,//top top
											0.0,0.0,//bottom bottom 12
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top bottom 13
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//middle top 14
											1.0,0.0,//middle top 
											1.0,1.0,//middle top 
											0.0,1.0,//middle top 
											0.0,0.0,//middle bottom 15
											1.0,0.0,//middle bottom
											1.0,1.0,//middle bottom
											0.0,1.0,//middle bottom
											0.0,0.0,//bottom top 16
											1.0,0.0,//bottom top 
											1.0,1.0,//bottom top 
											0.0,1.0,//bottom top 
											0.0,0.0,//left left 17
											1.0,0.0,//left left 
											1.0,1.0,//left left 
											0.0,1.0,//left left 
											0.0,0.0,//left right 18
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//right right 19
											1.0,0.0,//right right 
											1.0,1.0,//right right 
											0.0,1.0,//right right 
											0.0,0.0,//right left 20
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//bottom left 21
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
											0.0,0.0,//top right 22
											1.0,0.0,//top right
											1.0,1.0,//top right
											0.0,1.0,//top right
											
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,SCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,ScolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,STexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
	gl.drawArrays(gl.TRIANGLE_FAN,80,4);//21
	gl.drawArrays(gl.TRIANGLE_FAN,84,4);//22
			
	gl.bindVertexArray(null);
}
function msdDrawM(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var MCoordinates=new Float32Array([
									   	0.0, 1.0, 0.0,//front left 1
									   -0.2, 1.0, 0.0,//front left
									   -0.2,-1.0, 0.0,//front left
										0.0,-1.0, 0.0,//front left
										0.8, 1.0, 0.0,//front right 2
										0.6, 1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.8,-1.0, 0.0,//front right
										0.0, 0.8, 0.0,//front middle 3
										0.0, 0.4, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.0,//front middle
										0.0, 1.0, 0.1,//back left 4
									   -0.2, 1.0, 0.1,//back left
									   -0.2,-1.0, 0.1,//back left
										0.0,-1.0, 0.1,//back left
										0.8, 1.0, 0.1,//back right 5
										0.6, 1.0, 0.1,//back right
										0.6,-1.0, 0.1,//back right
										0.8,-1.0, 0.1,//back right
										0.0, 0.8, 0.1,//back middle 6
										0.0, 0.4, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.3, 0.2, 0.1,//back middle
										0.8, 1.0, 0.1,//right right 7
										0.8, 1.0, 0.0,//right right
										0.8,-1.0, 0.0,//right right
										0.8,-1.0, 0.1,//right right
										0.6, 1.0, 0.1,//right left 8
										0.6, 1.0, 0.0,//right left
										0.6,-1.0, 0.0,//right left
										0.6,-1.0, 0.1,//right left
										0.0, 1.0, 0.1,//left right 9
										0.0, 1.0, 0.0,//left right
										0.0,-1.0, 0.0,//left right
										0.0,-1.0, 0.1,//left right
									   -0.2, 1.0, 0.1,//left left 10
									   -0.2, 1.0, 0.0,//left left
									   -0.2,-1.0, 0.0,//left left
									   -0.2,-1.0, 0.1,//left left
									    0.0, 0.8, 0.1,//middle up 11
										0.0, 0.8, 0.0,//middle up
										0.3, 0.2, 0.0,//middle up
										0.3, 0.2, 0.1,//middle up
										0.0, 0.4, 0.1,//middle down 12
										0.0, 0.4, 0.0,//middle down
										0.3,-0.2, 0.0,//middle down
										0.3,-0.2, 0.1,//middle down
										0.6, 1.0, 0.1,//right top 13
										0.6, 1.0, 0.0,//right top
										0.8, 1.0, 0.0,//right top
										0.8, 1.0, 0.1,//right top
										0.6,-1.0, 0.1,//right bottom 14
										0.6,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.1,//right bottom
									   -0.2, 1.0, 0.1,//left top 15
									   -0.2, 1.0, 0.0,//left top
										0.0, 1.0, 0.0,//left top
										0.0, 1.0, 0.1,//left top
									   -0.2,-1.0, 0.1,//left bottom 16
									   -0.2,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.1,//left bottom
										0.6, 0.8, 0.0,//front middle 17
										0.6, 0.4, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.0,//front middle
										0.6, 0.8, 0.1,//back middle 18
										0.6, 0.4, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.3, 0.2, 0.1,//back middle
										0.6, 0.8, 0.1,//middle up 19
										0.6, 0.8, 0.0,//middle up
										0.3, 0.2, 0.0,//middle up
										0.3, 0.2, 0.1,//middle up
										0.6, 0.4, 0.1,//middle down 20
										0.6, 0.4, 0.0,//middle down
										0.3,-0.2, 0.0,//middle down
										0.3,-0.2, 0.1,//middle down
										   ]);
	var McolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front left 1
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 0.0, 1.0,//front right 2
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										1.0, 0.0, 0.0,//front middle 3
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 0.0,//back left 4
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 0.0, 1.0,//back right 5
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										1.0, 0.0, 0.0,//back middle 6
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										0.0, 1.0, 1.0,//right right 7
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right left 8
 										0.0, 1.0, 1.0,//right left
	                                    0.0, 1.0, 1.0,//right left
										0.0, 1.0, 1.0,//right left
										1.0, 1.0, 0.0,//left right 9
 										1.0, 1.0, 0.0,//left right
	                                    1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left left 10
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//right top 13
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 1.0, 0.0,//right bottom 14
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//left top 15
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										0.0, 0.6, 1.0,//left bottom 16
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										1.0, 1.0, 0.0,//left top 17
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 0.0, 0.5,//left top 18
										1.0, 0.0, 0.5,//left top
										1.0, 0.0, 0.5,//left top
										1.0, 0.0, 0.5,//left top
										0.5, 1.0, 0.0,//left top 19
										0.5, 1.0, 0.0,//left top
										0.5, 1.0, 0.0,//left top
										0.5, 1.0, 0.0,//left top
										1.0, 0.2, 0.2,//left top 20
										1.0, 0.2, 0.2,//left top
										1.0, 0.2, 0.2,//left top
										1.0, 0.2, 0.2,//left top
										
										]);
	var MTexture=new Float32Array([
											0.0,0.0,//front left 1
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//front right 2
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front middle 3
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back left 4
											1.0,0.0,//back left
											1.0,1.0,//back left
											0.0,1.0,//back left
											0.0,0.0,//back right 5
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 6
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//right right 7
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 8
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0,//right left
											0.0,0.0,//left right 9
											1.0,0.0,//left right
											1.0,1.0,//left right
											0.0,1.0,//left right
											0.0,0.0,//left left 10
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//right top 13
											1.0,0.0,//right top
											1.0,1.0,//right top
											0.0,1.0,//right top
											0.0,0.0,//right bottom 14
											1.0,0.0,//right bottom
											1.0,1.0,//right bottom
											0.0,1.0,//right bottom
											0.0,0.0,//left top 15
											1.0,0.0,//left top
											1.0,1.0,//left top
											0.0,1.0,//left top
											0.0,0.0,//left bottom 16
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 17
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom	
											0.0,0.0,//left bottom 18
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 19
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 20
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,MCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,McolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,MTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
		
	gl.bindVertexArray(null);
}
function msdDrawN(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var NCoordinates=new Float32Array([
									   	0.0, 1.0, 0.0,//front left 1
									   -0.2, 1.0, 0.0,//front left
									   -0.2,-1.0, 0.0,//front left
										0.0,-1.0, 0.0,//front left
										0.8, 1.0, 0.0,//front right 2
										0.6, 1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.8,-1.0, 0.0,//front right
										0.0, 0.8, 0.0,//front middle 3
										0.0, 0.4, 0.0,//front middle
										0.6,-0.8, 0.0,//front middle
										0.6,-0.4, 0.0,//front middle
										0.0, 1.0, 0.1,//back left 4
									   -0.2, 1.0, 0.1,//back left
									   -0.2,-1.0, 0.1,//back left
										0.0,-1.0, 0.1,//back left
										0.8, 1.0, 0.1,//back right 5
										0.6, 1.0, 0.1,//back right
										0.6,-1.0, 0.1,//back right
										0.8,-1.0, 0.1,//back right
										0.0, 0.8, 0.1,//back middle 6
										0.0, 0.4, 0.1,//back middle
										0.6,-0.8, 0.1,//back middle
										0.6,-0.4, 0.1,//back middle
										0.8, 1.0, 0.1,//right right 7
										0.8, 1.0, 0.0,//right right
										0.8,-1.0, 0.0,//right right
										0.8,-1.0, 0.1,//right right
										0.6, 1.0, 0.1,//right left 8
										0.6, 1.0, 0.0,//right left
										0.6,-1.0, 0.0,//right left
										0.6,-1.0, 0.1,//right left
										0.0, 1.0, 0.1,//left right 9
										0.0, 1.0, 0.0,//left right
										0.0,-1.0, 0.0,//left right
										0.0,-1.0, 0.1,//left right
									   -0.2, 1.0, 0.1,//left left 10
									   -0.2, 1.0, 0.0,//left left
									   -0.2,-1.0, 0.0,//left left
									   -0.2,-1.0, 0.1,//left left
									    0.0, 0.8, 0.1,//middle up 11
										0.0, 0.8, 0.0,//middle up
										0.6,-0.4, 0.0,//middle up
										0.6,-0.4, 0.1,//middle up
										0.0, 0.4, 0.1,//middle down 12
										0.0, 0.4, 0.0,//middle down
										0.6,-0.8, 0.0,//middle down
										0.6,-0.8, 0.1,//middle down
										0.6, 1.0, 0.1,//right top 13
										0.6, 1.0, 0.0,//right top
										0.8, 1.0, 0.0,//right top
										0.8, 1.0, 0.1,//right top
										0.6,-1.0, 0.1,//right bottom 14
										0.6,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.1,//right bottom
									   -0.2, 1.0, 0.1,//left top 15
									   -0.2, 1.0, 0.0,//left top
										0.0, 1.0, 0.0,//left top
										0.0, 1.0, 0.1,//left top
									   -0.2,-1.0, 0.1,//left bottom 16
									   -0.2,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.1,//left bottom
										   ]);
	var NcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front left 1
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 0.0, 1.0,//front right 2
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										1.0, 0.0, 0.0,//front middle 3
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 0.0,//back left 4
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 0.0, 1.0,//back right 5
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										1.0, 0.0, 0.0,//back middle 6
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										0.0, 1.0, 1.0,//right right 7
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right left 8
 										0.0, 1.0, 1.0,//right left
	                                    0.0, 1.0, 1.0,//right left
										0.0, 1.0, 1.0,//right left
										1.0, 1.0, 0.0,//left right 9
 										1.0, 1.0, 0.0,//left right
	                                    1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left left 10
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//right top 13
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 1.0, 0.0,//right bottom 14
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//left top 15
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										0.0, 0.6, 1.0,//left bottom 16
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
								
										]);
	var NTexture=new Float32Array([
											0.0,0.0,//front left 1
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//front right 2
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front middle 3
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back left 4
											1.0,0.0,//back left
											1.0,1.0,//back left
											0.0,1.0,//back left
											0.0,0.0,//back right 5
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 6
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//right right 7
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 8
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0,//right left
											0.0,0.0,//left right 9
											1.0,0.0,//left right
											1.0,1.0,//left right
											0.0,1.0,//left right
											0.0,0.0,//left left 10
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//right top 13
											1.0,0.0,//right top
											1.0,1.0,//right top
											0.0,1.0,//right top
											0.0,0.0,//right bottom 14
											1.0,0.0,//right bottom
											1.0,1.0,//right bottom
											0.0,1.0,//right bottom
											0.0,0.0,//left top 15
											1.0,0.0,//left top
											1.0,1.0,//left top
											0.0,1.0,//left top
											0.0,0.0,//left bottom 16
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,NCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,NcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,NTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
		
	gl.bindVertexArray(null);
}
function msdDrawC(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var CCoordinates=new Float32Array([
									    0.6, 1.0, 0.0,//front top 1
									   -0.1, 1.0, 0.0,//front top
									   -0.1, 0.8, 0.0,//front top
									    0.6, 0.8, 0.0,//front top
										0.6,-0.8, 0.0,//front bottom 2
									   -0.1,-0.8, 0.0,//front bottom
									   -0.1,-1.0, 0.0,//front bottom
										0.6,-1.0, 0.0,//front bottom
										0.1, 0.8, 0.0,//front left 3
									   -0.1, 0.8, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.6, 1.0, 0.1,//front top 4
									   -0.1, 1.0, 0.1,//front top 
									   -0.1, 0.8, 0.1,//front top 
									    0.6, 0.8, 0.1,//front top 
										0.6,-0.8, 0.1,//front bottom 5
									   -0.1,-0.8, 0.1,//front bottom
									   -0.1,-1.0, 0.1,//front bottom
										0.6,-1.0, 0.1,//front bottom
									    0.1, 0.8, 0.1,//front left 6
									   -0.1, 0.8, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.1, 0.8, 0.1,//left right 7
										0.1, 0.8, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 0.8, 0.1,//left left 8
									   -0.1, 0.8, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.1, 1.0, 0.1,//top top 9
									   -0.1, 1.0, 0.0,//top top 
									    0.6, 1.0, 0.0,//top top 
										0.6, 1.0, 0.1,//top top 
									   -0.1, 0.8, 0.1,//top bottom 10
									   -0.1, 0.8, 0.0,//top bottom
									    0.6, 0.8, 0.0,//top bottom
										0.6, 0.8, 0.1,//top bottom
									   -0.1,-0.8, 0.1,//bottom top 11
									   -0.1,-0.8, 0.0,//bottom top
									    0.6,-0.8, 0.0,//bottom top
										0.6,-0.8, 0.1,//bottom top
									   -0.1,-1.0, 0.1,//bottom bottom 12
									   -0.1,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.1, 1.0, 0.1,//top left 13
									   -0.1, 1.0, 0.0,//top left
									   -0.1, 0.8, 0.0,//top left
									   -0.1, 0.8, 0.1,//top left
									   -0.1,-0.8, 0.1,//bottom left 14
									   -0.1,-0.8, 0.0,//bottom left
									   -0.1,-1.0, 0.0,//bottom left
									   -0.1,-1.0, 0.1,//bottom left
									    0.6, 1.0, 0.1,//top right 15
									    0.6, 1.0, 0.0,//top right
										0.6, 0.8, 0.0,//top right
										0.6, 0.8, 0.1,//top right
										0.6,-0.8, 0.1,//bottom right 16
									    0.6,-0.8, 0.0,//bottom right
										0.6,-1.0, 0.0,//bottom right
										0.6,-1.0, 0.1,//bottom right
										   ]);
	var CcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//front left 4
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 0.0, 1.0,//front top 5
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										1.0, 0.0, 0.0,//front bottom 6
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										0.0, 1.0, 1.0,//front right 7
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front left 8
 										0.0, 1.0, 1.0,//front left
	                                    0.0, 1.0, 1.0,//front left
										0.0, 1.0, 1.0,//front left
										1.0, 1.0, 0.0,//right right 9
 										1.0, 1.0, 0.0,//right right
	                                    1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right left 10
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 1.0,//left right 11
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left left 12
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 0.0, 1.0,//top top 13
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 1.0, 0.0,//top bottom 14
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 15
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										0.0, 0.6, 1.0,//bottom bottom 16
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
								
										]);
	var CTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front left 4
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 5
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 6
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 7
											1.0,0.0,//front right 
											1.0,1.0,//front right 
											0.0,1.0,//front right 
											0.0,0.0,//front left 8
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//right right 9
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 10
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//left right 11
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 12
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 13
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 14
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 15
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 16
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,CCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,CcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,CTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
		
	gl.bindVertexArray(null);
}
function msdDrawO(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var OCoordinates=new Float32Array([
									    0.4, 1.0, 0.0,//front top 1
									   -0.1, 1.0, 0.0,//front top
									   -0.1, 0.8, 0.0,//front top
									    0.4, 0.8, 0.0,//front top
										0.4,-0.8, 0.0,//front bottom 2
									   -0.1,-0.8, 0.0,//front bottom
									   -0.1,-1.0, 0.0,//front bottom
										0.4,-1.0, 0.0,//front bottom
									    0.6, 1.0, 0.0,//front right 3
										0.4, 1.0, 0.0,//front right
										0.4,-1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.1, 0.8, 0.0,//front left 4
									   -0.1, 0.8, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.4, 1.0, 0.1,//front top 5
									   -0.1, 1.0, 0.1,//front top 
									   -0.1, 0.8, 0.1,//front top 
									    0.4, 0.8, 0.1,//front top 
										0.4,-0.8, 0.1,//front bottom 6
									   -0.1,-0.8, 0.1,//front bottom
									   -0.1,-1.0, 0.1,//front bottom
										0.4,-1.0, 0.1,//front bottom
									    0.6, 1.0, 0.1,//front right 7
										0.4, 1.0, 0.1,//front right 
										0.4,-1.0, 0.1,//front right 
										0.6,-1.0, 0.1,//front right 
										0.1, 0.8, 0.1,//front left 8
									   -0.1, 0.8, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.6, 1.0, 0.1,//right right 9
										0.6, 1.0, 0.0,//right right
										0.6,-1.0, 0.0,//right right
										0.6,-1.0, 0.1,//right right
										0.4, 0.8, 0.1,//right left 10
										0.4, 0.8, 0.0,//right left 
										0.4,-0.8, 0.0,//right left 
										0.4,-0.8, 0.1,//right left 
										0.1, 0.8, 0.1,//left right 11
										0.1, 0.8, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 0.8, 0.1,//left left 12
									   -0.1, 0.8, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.1, 1.0, 0.1,//top top 13
									   -0.1, 1.0, 0.0,//top top 
									    0.6, 1.0, 0.0,//top top 
										0.6, 1.0, 0.1,//top top 
									   -0.1, 0.8, 0.1,//top bottom 14
									   -0.1, 0.8, 0.0,//top bottom
									    0.4, 0.8, 0.0,//top bottom
										0.4, 0.8, 0.1,//top bottom
									   -0.1,-0.8, 0.1,//bottom top 15
									   -0.1,-0.8, 0.0,//bottom top
									    0.4,-0.8, 0.0,//bottom top
										0.4,-0.8, 0.1,//bottom top
									   -0.1,-1.0, 0.1,//bottom bottom 16
									   -0.1,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.1, 1.0, 0.1,//top left 17
									   -0.1, 1.0, 0.0,//top left
									   -0.1, 0.8, 0.0,//top left
									   -0.1, 0.8, 0.1,//top left
									   -0.1,-0.8, 0.1,//bottom left 18
									   -0.1,-0.8, 0.0,//bottom left
									   -0.1,-1.0, 0.0,//bottom left
									   -0.1,-1.0, 0.1 //bottom left
									    
										   ]);
	var OcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//front left 4
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 0.0, 1.0,//front top 5
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										1.0, 0.0, 0.0,//front bottom 6
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										0.0, 1.0, 1.0,//front right 7
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front left 8
 										0.0, 1.0, 1.0,//front left
	                                    0.0, 1.0, 1.0,//front left
										0.0, 1.0, 1.0,//front left
										1.0, 1.0, 0.0,//right right 9
 										1.0, 1.0, 0.0,//right right
	                                    1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right left 10
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 1.0,//left right 11
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left left 12
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 0.0, 1.0,//top top 13
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 1.0, 0.0,//top bottom 14
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 15
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										0.0, 0.6, 1.0,//bottom bottom 16
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//top left 17
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.6, 0.6, 1.0,//bottom left 18
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										
								
										]);
	var OTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front left 4
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 5
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 6
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 7
											1.0,0.0,//front right 
											1.0,1.0,//front right 
											0.0,1.0,//front right 
											0.0,0.0,//front left 8
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//right right 9
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 10
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//left right 11
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 12
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 13
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 14
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 15
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 16
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top left 17
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom left 18
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
										
									
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,OCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,OcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,OTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
		
	gl.bindVertexArray(null);
}
function msdDrawD(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var DCoordinates=new Float32Array([
									    0.4, 1.0, 0.0,//front top 1
									   -0.3, 1.0, 0.0,//front top
									   -0.3, 0.8, 0.0,//front top
									    0.4, 0.8, 0.0,//front top
										0.4,-0.8, 0.0,//front bottom 2
									   -0.3,-0.8, 0.0,//front bottom
									   -0.3,-1.0, 0.0,//front bottom
										0.4,-1.0, 0.0,//front bottom
									    0.6, 1.0, 0.0,//front right 3
										0.4, 1.0, 0.0,//front right
										0.4,-1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.1, 0.8, 0.0,//front left 4
									   -0.1, 0.8, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.4, 1.0, 0.1,//front top 5
									   -0.3, 1.0, 0.1,//front top 
									   -0.3, 0.8, 0.1,//front top 
									    0.4, 0.8, 0.1,//front top 
										0.4,-0.8, 0.1,//front bottom 6
									   -0.3,-0.8, 0.1,//front bottom
									   -0.3,-1.0, 0.1,//front bottom
										0.4,-1.0, 0.1,//front bottom
									    0.6, 1.0, 0.1,//front right 7
										0.4, 1.0, 0.1,//front right 
										0.4,-1.0, 0.1,//front right 
										0.6,-1.0, 0.1,//front right 
										0.1, 0.8, 0.1,//front left 8
									   -0.1, 0.8, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.6, 1.0, 0.1,//right right 9
										0.6, 1.0, 0.0,//right right
										0.6,-1.0, 0.0,//right right
										0.6,-1.0, 0.1,//right right
										0.4, 0.8, 0.1,//right left 10
										0.4, 0.8, 0.0,//right left 
										0.4,-0.8, 0.0,//right left 
										0.4,-0.8, 0.1,//right left 
										0.1, 0.8, 0.1,//left right 11
										0.1, 0.8, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 0.8, 0.1,//left left 12
									   -0.1, 0.8, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.3, 1.0, 0.1,//top top 13
									   -0.3, 1.0, 0.0,//top top 
									    0.6, 1.0, 0.0,//top top 
										0.6, 1.0, 0.1,//top top 
									   -0.3, 0.8, 0.1,//top bottom 14
									   -0.3, 0.8, 0.0,//top bottom
									    0.4, 0.8, 0.0,//top bottom
										0.4, 0.8, 0.1,//top bottom
									   -0.3,-0.8, 0.1,//bottom top 15
									   -0.3,-0.8, 0.0,//bottom top
									    0.4,-0.8, 0.0,//bottom top
										0.4,-0.8, 0.1,//bottom top
									   -0.3,-1.0, 0.1,//bottom bottom 16
									   -0.3,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.3, 1.0, 0.1,//top left 17
									   -0.3, 1.0, 0.0,//top left
									   -0.3, 0.8, 0.0,//top left
									   -0.3, 0.8, 0.1,//top left
									   -0.3,-0.8, 0.1,//bottom left 18
									   -0.3,-0.8, 0.0,//bottom left
									   -0.3,-1.0, 0.0,//bottom left
									   -0.3,-1.0, 0.1 //bottom left
									    
										   ]);
	var DcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//front left 4
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 0.0, 1.0,//front top 5
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										1.0, 0.0, 0.0,//front bottom 6
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										0.0, 1.0, 1.0,//front right 7
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front left 8
 										0.0, 1.0, 1.0,//front left
	                                    0.0, 1.0, 1.0,//front left
										0.0, 1.0, 1.0,//front left
										1.0, 1.0, 0.0,//right right 9
 										1.0, 1.0, 0.0,//right right
	                                    1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right left 10
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 1.0,//left right 11
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left left 12
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 0.0, 1.0,//top top 13
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 1.0, 0.0,//top bottom 14
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 15
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										0.0, 0.6, 1.0,//bottom bottom 16
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//top left 17
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.6, 0.6, 1.0,//bottom left 18
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										
								
										]);
	var DTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front left 4
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 5
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 6
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 7
											1.0,0.0,//front right 
											1.0,1.0,//front right 
											0.0,1.0,//front right 
											0.0,0.0,//front left 8
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//right right 9
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 10
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//left right 11
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 12
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 13
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 14
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 15
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 16
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top left 17
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom left 18
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
										
									
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,DCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,DcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,DTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
		
	gl.bindVertexArray(null);
}
function msdDrawR(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var RCoordinates=new Float32Array([
									    0.1, 1.0, 0.0,//front straight 1
									   -0.1, 1.0, 0.0,//front straight
									   -0.1,-1.0, 0.0,//front straight
									    0.1,-1.0, 0.0,//front straight
										0.7, 1.0, 0.0,//front top 2
									    0.1, 1.0, 0.0,//front top
									    0.1, 0.8, 0.0,//front top 
									    0.7, 0.8, 0.0,//front top
									    0.7, 0.8, 0.0,//front right 3
									    0.5, 0.8, 0.0,//front right
									    0.5,-0.1, 0.0,//front right
									    0.7,-0.1, 0.0,//front right
									    0.5, 0.1, 0.0,//middle 4
									    0.1, 0.1, 0.0,//middle
									    0.1,-0.1, 0.0,//middle 
									    0.5,-0.1, 0.0,//middle
									    0.1, 1.0, 0.1,//back straight 5
									   -0.1, 1.0, 0.1,//back straight
									   -0.1,-1.0, 0.1,//back straight
									    0.1,-1.0, 0.1,//back straight
										0.7, 1.0, 0.1,//back top 6
									    0.1, 1.0, 0.1,//back top
									    0.1, 0.8, 0.1,//back top 
									    0.7, 0.8, 0.1,//back top
									    0.7, 0.8, 0.1,//back right 7
									    0.5, 0.8, 0.1,//back right
									    0.5,-0.1, 0.1,//back right
									    0.7,-0.1, 0.1,//back right
									    0.5, 0.1, 0.1,//back middle 8
									    0.1, 0.1, 0.1,//back middle
									    0.1,-0.1, 0.1,//back middle 
									    0.5,-0.1, 0.1,//back middle
									   -0.1, 1.0, 0.1,//top top 9	
									   -0.1, 1.0, 0.0,//top top
									    0.7, 1.0, 0.0,//top top
										0.7, 1.0, 0.1,//top top
									    0.1, 0.8, 0.1,//top bottom 10	
									    0.1, 0.8, 0.0,//top bottom
									    0.5, 0.8, 0.0,//top bottom
										0.5, 0.8, 0.1,//top bottom
									    0.1, 0.1, 0.1,//middle up 11
									    0.1, 0.1, 0.0,//middle up
									    0.5, 0.1, 0.0,//middle up
									    0.5, 0.1, 0.1,//middle up
										0.1,-0.1, 0.1,//middle down 12
									    0.1,-0.1, 0.0,//middle down
									    0.7,-0.1, 0.0,//middle down
									    0.7,-0.1, 0.1,//middle down
									   -0.1,-1.0, 0.1,//bottom 13
									   -0.1,-1.0, 0.0,//bottom
									    0.1,-1.0, 0.0,//bottom
										0.1,-1.0, 0.1,//bottom
									   -0.1, 1.0, 0.1,//straight left 14
									   -0.1, 1.0, 0.0,//straight left
									   -0.1,-1.0, 0.0,//straight left
									   -0.1,-1.0, 0.1,//straight left
									    0.1, 1.0, 0.1,//straight right 15
									    0.1, 1.0, 0.0,//straight right
									    0.1,-1.0, 0.0,//straight right
									    0.1,-1.0, 0.1,//straight right
										0.7, 1.0, 0.1,//right right 16
										0.7, 1.0, 0.0,//right right
										0.7,-0.1, 0.0,//right right
										0.7,-0.1, 0.1,//right right
										0.5, 0.8, 0.1,//right left 17
										0.5, 0.8, 0.0,//right left
										0.5, 0.1, 0.0,//right left
										0.5, 0.1, 0.1,//right left
										0.3,-0.1, 0.0,//right front \.18
										0.1,-0.1, 0.0,//right front \.
										0.5,-1.0, 0.0,//right front \.
										0.7,-1.0, 0.0,//right front \.
										0.3,-0.1, 0.1,//right back \.19
										0.1,-0.1, 0.1,//right back \.
										0.5,-1.0, 0.1,//right back \.
										0.7,-1.0, 0.1,//right back \.
										0.3,-0.1, 0.1,//right right \.20
										0.3,-0.1, 0.0,//right right \.
										0.7,-1.0, 0.0,//right right \.
										0.7,-1.0, 0.1,//right right \.
										0.1,-0.1, 0.1,//right left \.21
										0.1,-0.1, 0.0,//right left \.
										0.5,-1.0, 0.0,//right left \.
										0.5,-1.0, 0.1,//right left \.
										0.5,-1.0, 0.1,//right bottom \.22
										0.5,-1.0, 0.0,//right bottom \.
										0.7,-1.0, 0.0,//right bottom \.
										0.7,-1.0, 0.1//right bottom \.
										   ]);
	var RcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front straight 1
										0.0, 1.0, 0.0,//front straight
										0.0, 1.0, 0.0,//front straight
										0.0, 1.0, 0.0,//front straight
										0.0, 0.0, 1.0,//front top 2
										0.0, 0.0, 1.0,//front top
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//middle 4
										0.0, 1.0, 0.0,//middle
										0.0, 1.0, 0.0,//middle 
										0.0, 1.0, 0.0,//middle
										0.0, 0.0, 1.0,//back straight 5
										0.0, 0.0, 1.0,//back straight
										0.0, 0.0, 1.0,//back straight
										0.0, 0.0, 1.0,//back straight
										1.0, 0.0, 0.0,//back top 6
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top 
										1.0, 0.0, 0.0,//back top
										0.0, 1.0, 1.0,//back right 7
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back middle 8
 										0.0, 1.0, 1.0,//back middle
	                                    0.0, 1.0, 1.0,//back middle 
										0.0, 1.0, 1.0,//back middle
										1.0, 1.0, 0.0,//top top 9	
 										1.0, 1.0, 0.0,//top top
	                                    1.0, 1.0, 0.0,//top top
										1.0, 1.0, 0.0,//top top
										1.0, 1.0, 0.0,//top bottom 10	
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//bottom 13
										1.0, 0.0, 1.0,//bottom
										1.0, 0.0, 1.0,//bottom
										1.0, 0.0, 1.0,//bottom
										1.0, 1.0, 0.0,//straight left 14
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight right 15
										1.0, 1.0, 0.0,//straight right
										1.0, 1.0, 0.0,//straight right
										1.0, 1.0, 0.0,//straight right
										0.0, 0.6, 1.0,//right right 16
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right left 17
										0.0, 0.6, 1.0,//right left
										0.0, 0.6, 1.0,//right left
										0.0, 0.6, 1.0,//right left
										0.6, 0.6, 1.0,//right front \.18
										0.6, 0.6, 1.0,//right front \.
										0.6, 0.6, 1.0,//right front \.
										0.6, 0.6, 1.0,//right front \.
										0.6, 0.1, 0.3,//right back \.19
										0.6, 0.1, 0.3,//right back \.
										0.6, 0.1, 0.3,//right back \.
										0.6, 0.1, 0.3,//right back \.
										0.3, 0.3, 0.3,//right right \.20
										0.3, 0.3, 0.3,//right right \.
										0.3, 0.3, 0.3,//right right \.
										0.3, 0.3, 0.3,//right right \.
										0.3, 0.1, 0.3,//right left \.21
										0.3, 0.1, 0.3,//right left \.
										0.3, 0.1, 0.3,//right left \.
										0.3, 0.1, 0.3,//right left \.
										0.1, 0.1, 1.0,//right bottom \.22
										0.1, 0.1, 1.0,//right bottom \.
										0.1, 0.1, 1.0,//right bottom \.
										0.1, 0.1, 1.0//right bottom \.
										]);
	var RTexture=new Float32Array([
											0.0,0.0,//front straight 1
											1.0,0.0,//front straight
											1.0,1.0,//front straight
											0.0,1.0,//front straight
											0.0,0.0,//front top 2
											1.0,0.0,//front top
											1.0,1.0,//front top 
											0.0,1.0,//front top
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//middle 4
											1.0,0.0,//middle
											1.0,1.0,//middle 
											0.0,1.0,//middle
											0.0,0.0,//back straight 5
											1.0,0.0,//back straight
											1.0,1.0,//back straight
											0.0,1.0,//back straight
											0.0,0.0,//back top 6
											1.0,0.0,//back top
											1.0,1.0,//back top 
											0.0,1.0,//back top
											0.0,0.0,//back right 7
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 8
											1.0,0.0,//back middle
											1.0,1.0,//back middle 
											0.0,1.0,//back middle
											0.0,0.0,//top top 9	
											1.0,0.0,//top top
											1.0,1.0,//top top
											0.0,1.0,//top top
											0.0,0.0,//top bottom 10	
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//bottom 13
											1.0,0.0,//bottom
											1.0,1.0,//bottom
											0.0,1.0,//bottom
											0.0,0.0,//straight left 14
											1.0,0.0,//straight left
											1.0,1.0,//straight left
											0.0,1.0,//straight left
											0.0,0.0,//straight right 15
											1.0,0.0,//straight right
											1.0,1.0,//straight right
											0.0,1.0,//straight right
											0.0,0.0,//right right 16
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 17
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0,//right left
											0.0,0.0,//right front \.18
											1.0,0.0,//right front \.
											1.0,1.0,//right front \.
											0.0,1.0,//right front \.
											0.0,0.0,//right back \.19
											1.0,0.0,//right back \.
											1.0,1.0,//right back \.
											0.0,1.0,//right back \.
											0.0,0.0,//right right \.20
											1.0,0.0,//right right \.
											1.0,1.0,//right right \.
											0.0,1.0,//right right \.
											0.0,0.0,//right left \.21
											1.0,0.0,//right left \.
											1.0,1.0,//right left \.
											0.0,1.0,//right left \.
											0.0,0.0,//right bottom \.22
											1.0,0.0,//right bottom \.
											1.0,1.0,//right bottom \.
											0.0,1.0,//right bottom \.
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,RCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,RcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,RTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
	gl.drawArrays(gl.TRIANGLE_FAN,80,4);//21
	gl.drawArrays(gl.TRIANGLE_FAN,84,4);//22
	
	gl.bindVertexArray(null);
}

function msdDrawA(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var ACoordinates=new Float32Array([
										    0.0, 1.0, 0.0,//front A
										    0.0, 0.6, 0.0,//front A
										    0.8,-1.0, 0.0,//front A
										    1.0,-1.0, 0.0,//front A
										    0.0, 1.0, 0.0,//front A
										    0.0, 0.6, 0.0,//front A
										   -0.8,-1.0, 0.0,//front A
										   -1.0,-1.0, 0.0,//front A
										    0.3, 0.0, 0.0,//front A mid
										   -0.3, 0.0, 0.0,//front A mid
										   -0.4,-0.2, 0.0,//front A mid
										    0.4,-0.2, 0.0,//front A mid
										    0.0, 1.0, 0.1,//back A
	                                        0.0, 0.6, 0.1,//back A
	                                        0.8,-1.0, 0.1,//back A
	                                        1.0,-1.0, 0.1,//back A
	                                        0.0, 1.0, 0.1,//back A
	                                        0.0, 0.6, 0.1,//back A
	                                       -0.8,-1.0, 0.1,//back A
	                                       -1.0,-1.0, 0.1, //back A
										    0.3, 0.0, 0.1,//mid A mid
										   -0.3, 0.0, 0.1,//mid A mid
										   -0.4,-0.2, 0.1,//mid A mid
										    0.4,-0.2, 0.1,//mid A mid
											0.0, 1.0, 0.0,//right A
											0.0, 1.0, 0.1,//right A
											1.0,-1.0, 0.1,//right A
											1.0,-1.0, 0.0, //right A
											0.0, 1.0, 0.0,//left A
											0.0, 1.0, 0.1,//left A
										   -1.0,-1.0, 0.1,//left A
										   -1.0,-1.0, 0.0, //left A
										    0.0, 0.6, 0.0,//right A down
										    0.0, 0.6, 0.1,//right A down
											0.8,-1.0, 0.1,//right A down
											0.8,-1.0, 0.0,//right A down
											0.0, 0.6, 0.0,//left A down
										    0.0, 0.6, 0.1,//left A down
										   -0.8,-1.0, 0.1,//left A down
										   -0.8,-1.0, 0.0,//left A down
										    0.3, 0.0, 0.0,//mid A mid
										    0.3, 0.0, 0.1,//mid A mid
										   -0.3, 0.0, 0.1,//mid A mid
										   -0.3, 0.0, 0.0,//mid A mid
										    0.4,-0.2, 0.0,//mid A mid
										    0.4,-0.2, 0.1,//mid A mid
										   -0.4,-0.2, 0.1,//mid A mid
										   -0.4,-0.2, 0.0,//mid A mid
										    1.0,-1.0, 0.0,//bottom A
											1.0,-1.0, 0.1,//bottom A
											0.8,-1.0, 0.1,//bottom A
											0.8,-1.0, 0.0,//bottom A
										   -1.0,-1.0, 0.0,//bottom A
										   -1.0,-1.0, 0.1,//bottom A
										   -0.8,-1.0, 0.1,//bottom A
										   -0.8,-1.0, 0.0 //bottom A
										   ]);
	var AcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front A green
										0.0, 1.0, 0.0,//front A green
										0.0, 1.0, 0.0,//front A green
										0.0, 1.0, 0.0,//front A green
										0.0, 0.0, 1.0,//front A blue
										0.0, 0.0, 1.0,//front A blue
										0.0, 0.0, 1.0,//front A blue
										0.0, 0.0, 1.0,//front A blue
										1.0, 0.0, 0.0,//front A red
										1.0, 0.0, 0.0,//front A red
										1.0, 0.0, 0.0,//front A red
										1.0, 0.0, 0.0,//front A red
										0.0, 1.0, 0.0,//back A green
										0.0, 1.0, 0.0,//back A green
										0.0, 1.0, 0.0,//back A green
										0.0, 1.0, 0.0,//back A green
										0.0, 0.0, 1.0,//back A blue
										0.0, 0.0, 1.0,//back A blue
										0.0, 0.0, 1.0,//back A blue
										0.0, 0.0, 1.0,//back A blue
										1.0, 0.0, 0.0,//back A red
										1.0, 0.0, 0.0,//back A red
										1.0, 0.0, 0.0,//back A red
										1.0, 0.0, 0.0,//back A red
										0.0, 1.0, 1.0,// right A cyan
										0.0, 1.0, 1.0,// right A cyan
										0.0, 1.0, 1.0,// right A cyan
										0.0, 1.0, 1.0,// right A cyan
										0.0, 1.0, 1.0,// left A cyan
 										0.0, 1.0, 1.0,// left A cyan
	                                    0.0, 1.0, 1.0,// left A cyan
										0.0, 1.0, 1.0,// left A cyan
										1.0, 1.0, 0.0,// right A yellow
 										1.0, 1.0, 0.0,// right A yellow
	                                    1.0, 1.0, 0.0,// right A yellow
										1.0, 1.0, 0.0, // right A yellow
										1.0, 1.0, 0.0,// left A yellow
										1.0, 1.0, 0.0,// left A yellow
										1.0, 1.0, 0.0,// left A yellow
										1.0, 1.0, 0.0,// left A yellow
										1.0, 0.0, 1.0,// mid up A voilet
										1.0, 0.0, 1.0,// mid up A voilet
										1.0, 0.0, 1.0,// mid up A voilet
										1.0, 0.0, 1.0, // mid up A voilet
										1.0, 0.0, 1.0,// mid down A voilet
										1.0, 0.0, 1.0,// mid down A voilet
										1.0, 0.0, 1.0,// mid down A voilet
										1.0, 0.0, 1.0, // mid down A voilet
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0 //bottom A white
										]);
	var ATexture=new Float32Array([
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,ACoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,AcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,ATexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);
	//gl.drawArrays(gl.LINES,3,3);
	gl.bindVertexArray(null);
}
function msdDrawE(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var ECoordinates=new Float32Array([
										0.8, 1.0, 0.0,//top front 1
									    0.2, 1.0, 0.0,//top front
									    0.2, 0.8, 0.0,//top front
										0.8, 0.8, 0.0,//top front
										0.8,-1.0, 0.0,//botoom front 2
									    0.2,-1.0, 0.0,//botoom front
									    0.2,-0.8, 0.0,//botoom front
										0.8,-0.8, 0.0,//botoom front
										0.5, 0.1, 0.0,//middle front 3
									    0.2, 0.1, 0.0,//middle front
									    0.2,-0.1, 0.0,//middle front
									    0.5,-0.1, 0.0,//middle front
										0.2, 1.0, 0.0,//straight 4
										0.0, 1.0, 0.0,//straight
										0.0,-1.0, 0.0,//straight
										0.2,-1.0, 0.0,//straight
										0.8, 1.0, 0.1,//top back 5
									    0.2, 1.0, 0.1,//top back
									    0.2, 0.8, 0.1,//top back
										0.8, 0.8, 0.1,//top back
										0.8,-1.0, 0.1,//botoom back 6
									    0.2,-1.0, 0.1,//botoom back
									    0.2,-0.8, 0.1,//botoom back
										0.8,-0.8, 0.1,//botoom back
										0.5, 0.1, 0.1,//middle back 7
									    0.2, 0.1, 0.1,//middle back
									    0.2,-0.1, 0.1,//middle back
									    0.5,-0.1, 0.1,//middle back
										0.2, 1.0, 0.1,//straight back 8
										0.0, 1.0, 0.1,//straight back 
										0.0,-1.0, 0.1,//straight back 
										0.2,-1.0, 0.1,//straight back
										0.0, 1.0, 0.1,//top top 9
										0.0, 1.0, 0.0,//top top
										0.8, 1.0, 0.0,//top top
										0.8, 1.0, 0.1,//top top
										0.0,-1.0, 0.1,//bottom bottom 10
										0.0,-1.0, 0.0,//bottom bottom
										0.8,-1.0, 0.0,//bottom bottom
										0.8,-1.0, 0.1,//bottom bottom
										0.2, 0.8, 0.1,//top bottom 11
										0.2, 0.8, 0.0,//top bottom
										0.8, 0.8, 0.0,//top bottom
										0.8, 0.8, 0.1,//top bottom
										0.2,-0.8, 0.1,//bottom top 12
										0.2,-0.8, 0.0,//bottom top
										0.8,-0.8, 0.0,//bottom top
										0.8,-0.8, 0.1,//bottom top
										0.2, 0.1, 0.1,//middle top 13
										0.2, 0.1, 0.0,//middle top 
										0.5, 0.1, 0.0,//middle top 
										0.5, 0.1, 0.1,//middle top
										0.2,-0.1, 0.1,//middle bottom 14
										0.2,-0.1, 0.0,//middle bottom 
										0.5,-0.1, 0.0,//middle bottom 
										0.5,-0.1, 0.1,//middle bottom
										0.0, 1.0, 0.1,//straight left 15
										0.0, 1.0, 0.0,//straight left 
										0.0,-1.0, 0.0,//straight left 
										0.0,-1.0, 0.1,//straight left
										0.2, 1.0, 0.1,//straight right 16
										0.2, 1.0, 0.0,//straight right 
										0.2,-1.0, 0.0,//straight right 
										0.2,-1.0, 0.1,//straight right
										0.8, 1.0, 0.1,//top right 17
										0.8, 1.0, 0.0,//top right
										0.8, 0.8, 0.0,//top right
										0.8, 0.8, 0.1,//top right
										0.5, 0.1, 0.1,//middle right 18
										0.5, 0.1, 0.0,//middle right
										0.5,-0.1, 0.0,//middle right
										0.5,-0.1, 0.1,//middle right
									    0.8,-1.0, 0.1,//bottom right 19
									    0.8,-1.0, 0.0,//bottom right
									    0.8,-0.8, 0.0,//bottom right
									    0.8,-0.8, 0.1//bottom right
									   ]);
	var EcolorCoordinates=new Float32Array([
										1.0, 0.0, 0.0,//top front 1
										1.0, 0.0, 0.0,//top front
										1.0, 0.0, 0.0,//top front
										1.0, 0.0, 0.0,//top front
										0.0, 1.0, 0.0,//botoom front 2
										0.0, 1.0, 0.0,//botoom front
										0.0, 1.0, 0.0,//botoom front
										0.0, 1.0, 0.0,//botoom front
										0.0, 0.0, 1.0,//middle front 3
										0.0, 0.0, 1.0,//middle front
										0.0, 0.0, 1.0,//middle front
										0.0, 0.0, 1.0,//middle front
										1.0, 1.0, 0.0,//straight 4
										1.0, 1.0, 0.0,//straight
										1.0, 1.0, 0.0,//straight
										1.0, 1.0, 0.0,//straight
										0.0, 0.0, 1.0,//top back 5
										0.0, 0.0, 1.0,//top back
										0.0, 0.0, 1.0,//top back
										0.0, 0.0, 1.0,//top back
										0.0, 0.0, 1.0,//botoom back 6
										0.0, 0.0, 1.0,//botoom back
										0.0, 0.0, 1.0,//botoom back
										0.0, 0.0, 1.0,//botoom back
										0.0, 1.0, 1.0,//middle back 7
										0.0, 1.0, 1.0,//middle back
										0.0, 1.0, 1.0,//middle back
										0.0, 1.0, 1.0,//middle back
										0.0, 1.0, 1.0,//straight back 8
										0.0, 1.0, 1.0,//straight back 
										0.0, 1.0, 1.0,//straight back 
										0.0, 1.0, 1.0,//straight back
										1.0, 1.0, 1.0,//top top 9
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//bottom bottom 10
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//top bottom 11
										1.0, 1.0, 1.0,//top bottom
										1.0, 1.0, 1.0,//top bottom
										1.0, 1.0, 1.0,//top bottom
										1.0, 0.0, 1.0,//bottom top 12
										1.0, 0.0, 1.0,//bottom top
										1.0, 0.0, 1.0,//bottom top
										1.0, 0.0, 1.0,//bottom top
										1.0, 0.0, 1.0,//middle top 13
										1.0, 0.0, 1.0,//middle top
										1.0, 0.0, 1.0,//middle top
										1.0, 0.0, 1.0,//middle top
										1.0, 1.0, 0.0,//middle bottom 14
										1.0, 1.0, 0.0,//middle bottom
										1.0, 1.0, 0.0,//middle bottom
										1.0, 1.0, 0.0,//middle bottom
										1.0, 0.0, 0.0,//straight left 15
										1.0, 0.0, 0.0,//straight left
										1.0, 0.0, 0.0,//straight left
										1.0, 0.0, 0.0,//straight left
										1.0, 0.0, 1.0,//straight right 16
										1.0, 0.0, 1.0,//straight right
										1.0, 0.0, 1.0,//straight right
										1.0, 0.0, 1.0,//straight right
										1.0, 0.0, 1.0,//top right 17
										1.0, 0.0, 1.0,//top right
										1.0, 0.0, 0.0,//top right
										1.0, 0.0, 0.0,//top right
										1.0, 0.0, 1.0,//middle right 18
										1.0, 0.0, 1.0,//middle right
										1.0, 0.0, 0.0,//middle right
										1.0, 0.0, 0.0,//middle right
										1.0, 0.0, 1.0,//bottom right 19
										1.0, 0.0, 1.0,//bottom right
										1.0, 0.0, 0.0,//bottom right
										1.0, 0.0, 0.0 //bottom right
										
										]);
	
	var ETexture=new Float32Array([
											0.0,0.0,//top front 1
											1.0,0.0,//top front
											1.0,1.0,//top front
											0.0,1.0,//top front
											0.0,0.0,//botoom front 2
											1.0,0.0,//botoom front
											1.0,1.0,//botoom front
											0.0,1.0,//botoom front
											0.0,0.0,//middle front 3
											1.0,0.0,//middle front
											1.0,1.0,//middle front
											0.0,1.0,//middle front
											0.0,0.0,//straight 4
											1.0,0.0,//straight
											1.0,1.0,//straight
											0.0,1.0,//straight
											0.0,0.0,//top back 5
											1.0,0.0,//top back
											1.0,1.0,//top back
											0.0,1.0,//top back
											0.0,0.0,//botoom back 6
											1.0,0.0,//botoom back
											1.0,1.0,//botoom back
											0.0,1.0,//botoom back
											0.0,0.0,//middle back 7
                                            1.0,0.0,//middle back
                                            1.0,1.0,//middle back
                                            0.0,1.0,//middle back
											0.0,0.0,//straight back 8
                                            1.0,0.0,//straight back 
                                            1.0,1.0,//straight back 
                                            0.0,1.0,//straight back
											0.0,0.0,//top top 9
                                            1.0,0.0,//top top
                                            1.0,1.0,//top top
                                            0.0,1.0,//top top
											0.0,0.0,//bottom bottom 10
                                            1.0,0.0,//bottom bottom
                                            1.0,1.0,//bottom bottom
                                            0.0,1.0,//bottom bottom
											0.0,0.0,//top bottom 11
                                            1.0,0.0,//top bottom
                                            1.0,1.0,//top bottom
                                            0.0,1.0,//top bottom
											0.0,0.0,//bottom top 12
                                            1.0,0.0,//bottom top
                                            1.0,1.0,//bottom top
                                            0.0,1.0,//bottom top
											0.0,0.0,//middle top 13
                                            1.0,0.0,//middle top
                                            1.0,1.0,//middle top
                                            0.0,1.0,//middle top
											0.0,0.0,//middle bottom 14
                                            1.0,0.0,//middle bottom
                                            1.0,1.0,//middle bottom
                                            0.0,1.0,//middle bottom
											0.0,0.0,//straight left 15
                                            1.0,0.0,//straight left
                                            1.0,1.0,//straight left
                                            0.0,1.0,//straight left
											0.0,0.0,//straight right 16
                                            1.0,0.0,//straight right
                                            1.0,1.0,//straight right
                                            0.0,1.0,//straight right
											0.0,0.0,//top right 17
                                            1.0,0.0,//top right
                                            1.0,1.0,//top right
                                            0.0,1.0,//top right
											0.0,0.0,//middle right 18
                                            1.0,0.0,//middle right
                                            1.0,1.0,//middle right
                                            0.0,1.0,//middle right
											0.0,0.0,//bottom right 19
                                            1.0,0.0,//bottom right
                                            1.0,1.0,//bottom right
                                            0.0,1.0//bottom right
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,ECoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,EcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,ETexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	
	gl.bindVertexArray(null);
}
function msdDrawI(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var ICoordinates=new Float32Array([
									    0.5, 1.0, 0.0,//front top 1
									   -0.5, 1.0, 0.0,//front top
									   -0.5, 0.8, 0.0,//front top
									    0.5, 0.8, 0.0,//front top
										0.5,-0.8, 0.0,//front bottom 2
									   -0.5,-0.8, 0.0,//front bottom
									   -0.5,-1.0, 0.0,//front bottom 
									    0.5,-1.0, 0.0,//front bottom
										0.1, 0.8, 0.0,//front middle 3
									   -0.1, 0.8, 0.0,//front middle
									   -0.1,-0.8, 0.0,//front middle 
									    0.1,-0.8, 0.0,//front middle
										0.5, 1.0, 0.1,//front top 4
									   -0.5, 1.0, 0.1,//front top
									   -0.5, 0.8, 0.1,//front top
									    0.5, 0.8, 0.1,//front top
										0.5,-0.8, 0.1,//front bottom 5
									   -0.5,-0.8, 0.1,//front bottom
									   -0.5,-1.0, 0.1,//front bottom 
									    0.5,-1.0, 0.1,//front bottom
										0.1, 0.8, 0.1,//front middle 6
									   -0.1, 0.8, 0.1,//front middle
									   -0.1,-0.8, 0.1,//front middle 
									    0.1,-0.8, 0.1,//front middle
									   -0.5, 1.0, 0.1,//top top 7
									   -0.5, 1.0, 0.0,//top top
									    0.5, 1.0, 0.0,//top top
									    0.5, 1.0, 0.1,//top top
									   -0.5, 0.8, 0.1,//top bottom 8
									   -0.5, 0.8, 0.0,//top bottom
									    0.5, 0.8, 0.0,//top bottom
									    0.5, 0.8, 0.1,//top bottom
									   -0.5,-0.8, 0.1,//bottom top 9
									   -0.5,-0.8, 0.0,//bottom top
									    0.5,-0.8, 0.0,//bottom top
									    0.5,-0.8, 0.1,//bottom top
									   -0.5,-1.0, 0.1,//bottom bottom 10
									   -0.5,-1.0, 0.0,//bottom bottom
									    0.5,-1.0, 0.0,//bottom bottom
									    0.5,-1.0, 0.1,//bottom bottom
										0.1, 0.8, 0.1,//middle right 11
										0.1, 0.8, 0.0,//middle right
										0.1,-0.8, 0.0,//middle right
										0.1,-0.8, 0.1,//middle right
									   -0.1, 0.8, 0.1,//middle left 12
									   -0.1, 0.8, 0.0,//middle left
									   -0.1,-0.8, 0.0,//middle left
									   -0.1,-0.8, 0.1,//middle left
									    0.5, 1.0, 0.1,//top right 13
										0.5, 1.0, 0.0,//top right
										0.5, 0.8, 0.0,//top right
										0.5, 0.8, 0.1,//top right
									   -0.5, 1.0, 0.1,//top left 14
									   -0.5, 1.0, 0.0,//top left
									   -0.5, 0.8, 0.0,//top left
									   -0.5, 0.8, 0.1,//top left
									    0.5,-0.8, 0.1,//bottom right 15
										0.5,-0.8, 0.0,//bottom right
										0.5,-1.0, 0.0,//bottom right
										0.5,-1.0, 0.1,//bottom right
									   -0.5,-0.8, 0.1,//bottom left 16
									   -0.5,-0.8, 0.0,//bottom left
									   -0.5,-1.0, 0.0,//bottom left
									   -0.5,-1.0, 0.1//bottom left
										   ]);
	var IcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom 
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front middle 3
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle 
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front top 4
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 5
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom 
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front middle 6
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle 
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 1.0,//top top 7
										0.0, 1.0, 1.0,//top top
										0.0, 1.0, 1.0,//top top
										0.0, 1.0, 1.0,//top top
										0.0, 1.0, 1.0,//top bottom 8
 										0.0, 1.0, 1.0,//top bottom
	                                    0.0, 1.0, 1.0,//top bottom
										0.0, 1.0, 1.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 9
 										1.0, 1.0, 0.0,//bottom top
	                                    1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom bottom 10
										1.0, 1.0, 0.0,//bottom bottom
										1.0, 1.0, 0.0,//bottom bottom
										1.0, 1.0, 0.0,//bottom bottom
										1.0, 0.0, 1.0,//middle right 11
										1.0, 0.0, 1.0,//middle right
										1.0, 0.0, 1.0,//middle right
										1.0, 0.0, 1.0,//middle right
										1.0, 0.0, 1.0,//middle left 12
										1.0, 0.0, 1.0,//middle left
										1.0, 0.0, 1.0,//middle left
										1.0, 0.0, 1.0,//middle left
										1.0, 1.0, 1.0,//top right 13
										1.0, 1.0, 1.0,//top right
										1.0, 1.0, 1.0,//top right
										1.0, 1.0, 1.0,//top right
										1.0, 1.0, 1.0,//top left 14
										1.0, 1.0, 1.0,//top left
										1.0, 1.0, 1.0,//top left
										1.0, 1.0, 1.0,//top left
										1.0, 1.0, 1.0,//bottom right 15
										1.0, 1.0, 1.0,//bottom right
										1.0, 1.0, 1.0,//bottom right
										1.0, 1.0, 1.0,//bottom right
										1.0, 1.0, 1.0,//bottom left 16
										1.0, 1.0, 1.0,//bottom left
										1.0, 1.0, 1.0,//bottom left
										1.0, 1.0, 1.0 //bottom left
										
										]);
	var ITexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom 
											0.0,1.0,//front bottom
											0.0,0.0,//front middle 3
											1.0,0.0,//front middle
											1.0,1.0,//front middle 
											0.0,1.0,//front middle
											0.0,0.0,//front top 4
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 5
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom 
											0.0,1.0,//front bottom
											0.0,0.0,//front middle 6
											1.0,0.0,//front middle
											1.0,1.0,//front middle 
											0.0,1.0,//front middle
											0.0,0.0,//top top 7
											1.0,0.0,//top top
											1.0,1.0,//top top
											0.0,1.0,//top top
											0.0,0.0,//top bottom 8
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 9
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 10
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//middle right 11
											1.0,0.0,//middle right
											1.0,1.0,//middle right
											0.0,1.0,//middle right
											0.0,0.0,//middle left 12
											1.0,0.0,//middle left
											1.0,1.0,//middle left
											0.0,1.0,//middle left
											0.0,0.0,//top right 13
											1.0,0.0,//top right
											1.0,1.0,//top right
											0.0,1.0,//top right
											0.0,0.0,//top left 14
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom right 15
											1.0,0.0,//bottom right
											1.0,1.0,//bottom right
											0.0,1.0,//bottom right
											0.0,0.0,//bottom left 16
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0 //bottom left
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,ICoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,IcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,ITexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	
	gl.bindVertexArray(null);
}

function msdDrawL(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var LCoordinates=new Float32Array([
									    0.1, 1.0, 0.0,//front top 1
									   -0.1, 1.0, 0.0,//front top
									   -0.1,-1.0, 0.0,//front top
									    0.1,-1.0, 0.0,//front top
										0.5,-0.8, 0.0,//front bottom 2
									    0.1,-0.8, 0.0,//front bottom
									    0.1,-1.0, 0.0,//front bottom 
									    0.5,-1.0, 0.0,//front bottom
									    0.1, 1.0, 0.1,//back top 3
									   -0.1, 1.0, 0.1,//back top
									   -0.1,-1.0, 0.1,//back top
									    0.1,-1.0, 0.1,//back top
									    0.5,-0.8, 0.1,//back bottom 4
									    0.1,-0.8, 0.1,//back bottom
									    0.1,-1.0, 0.1,//back bottom 
									    0.5,-1.0, 0.1,//back bottom
									   -0.1, 1.0, 0.1,//top 5
									   -0.1, 1.0, 0.0,//top
									    0.1, 1.0, 0.0,//top
										0.1, 1.0, 0.1,//top
									   -0.1,-1.0, 0.1,//bottom 6
									   -0.1,-1.0, 0.0,//bottom
									    0.5,-1.0, 0.0,//bottom
										0.5,-1.0, 0.1,//bottom
									    0.1,-0.8, 0.1,//bottom up 7
									    0.1,-0.8, 0.0,//bottom up 
									    0.5,-0.8, 0.0,//bottom up 
										0.5,-0.8, 0.1,//bottom up 
									    0.1, 1.0, 0.1,//middle right 8
									    0.1, 1.0, 0.0,//middle right
									    0.1,-0.8, 0.0,//middle right
										0.1,-0.8, 0.1,//middle right
									   -0.1, 1.0, 0.1,//middle left 9
									   -0.1, 1.0, 0.0,//middle left
									   -0.1,-1.0, 0.0,//middle left
									   -0.1,-1.0, 0.1,//middle left
									    0.5,-0.8, 0.1,//bottom right 10
									    0.5,-0.8, 0.0,//bottom right
									    0.5,-1.0, 0.0,//bottom right
										0.5,-1.0, 0.1 //bottom right
										
										   ]);
	var LcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom 
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//back top 3
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										0.0, 1.0, 0.0,//back bottom 4
										0.0, 1.0, 0.0,//back bottom
										0.0, 1.0, 0.0,//back bottom 
										0.0, 1.0, 0.0,//back bottom
										0.0, 0.0, 1.0,//top 5
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										1.0, 0.0, 0.0,//bottom 6
										1.0, 0.0, 0.0,//bottom
										1.0, 0.0, 0.0,//bottom
										1.0, 0.0, 0.0,//bottom
										0.0, 1.0, 1.0,//bottom up 7
										0.0, 1.0, 1.0,//bottom up 
										0.0, 1.0, 1.0,//bottom up 
										0.0, 1.0, 1.0,//bottom up 
										0.0, 1.0, 1.0,//middle right 8
 										0.0, 1.0, 1.0,//middle right
	                                    0.0, 1.0, 1.0,//middle right
										0.0, 1.0, 1.0,//middle right
										1.0, 1.0, 0.0,//middle left 9
 										1.0, 1.0, 0.0,//middle left
	                                    1.0, 1.0, 0.0,//middle left
										1.0, 1.0, 0.0,//middle left
										1.0, 1.0, 0.0,//bottom right 10
										1.0, 1.0, 0.0,//bottom right
										1.0, 1.0, 0.0,//bottom right
										1.0, 1.0, 0.0,//bottom right
										
										]);
	var LTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom 
											0.0,1.0,//front bottom
											0.0,0.0,//back top 3
											1.0,0.0,//back top
											1.0,1.0,//back top
											0.0,1.0,//back top
											0.0,0.0,//back bottom 4
											1.0,0.0,//back bottom
											1.0,1.0,//back bottom 
											0.0,1.0,//back bottom
											0.0,0.0,//top 5
											1.0,0.0,//top
											1.0,1.0,//top
											0.0,1.0,//top
											0.0,0.0,//bottom 6
											1.0,0.0,//bottom
											1.0,1.0,//bottom
											0.0,1.0,//bottom
											0.0,0.0,//bottom up 7
											1.0,0.0,//bottom up 
											1.0,1.0,//bottom up 
											0.0,1.0,//bottom up 
											0.0,0.0,//middle right 8
											1.0,0.0,//middle right
											1.0,1.0,//middle right
											0.0,1.0,//middle right
											0.0,0.0,//middle left 9
											1.0,0.0,//middle left
											1.0,1.0,//middle left
											0.0,1.0,//middle left
											0.0,0.0,//bottom right 10
											1.0,0.0,//bottom right
											1.0,1.0,//bottom right
											0.0,1.0,//bottom right

										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,LCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,LcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,LTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	
	gl.bindVertexArray(null);
}

function msdDrawP(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var PCoordinates=new Float32Array([
									    0.1, 1.0, 0.0,//front straight 1
									   -0.1, 1.0, 0.0,//front straight
									   -0.1,-1.0, 0.0,//front straight
									    0.1,-1.0, 0.0,//front straight
										0.7, 1.0, 0.0,//front top 2
									    0.1, 1.0, 0.0,//front top
									    0.1, 0.8, 0.0,//front top 
									    0.7, 0.8, 0.0,//front top
									    0.7, 0.8, 0.0,//front right 3
									    0.5, 0.8, 0.0,//front right
									    0.5,-0.1, 0.0,//front right
									    0.7,-0.1, 0.0,//front right
									    0.5, 0.1, 0.0,//middle 4
									    0.1, 0.1, 0.0,//middle
									    0.1,-0.1, 0.0,//middle 
									    0.5,-0.1, 0.0,//middle
									    0.1, 1.0, 0.1,//back straight 5
									   -0.1, 1.0, 0.1,//back straight
									   -0.1,-1.0, 0.1,//back straight
									    0.1,-1.0, 0.1,//back straight
										0.7, 1.0, 0.1,//back top 6
									    0.1, 1.0, 0.1,//back top
									    0.1, 0.8, 0.1,//back top 
									    0.7, 0.8, 0.1,//back top
									    0.7, 0.8, 0.1,//back right 7
									    0.5, 0.8, 0.1,//back right
									    0.5,-0.1, 0.1,//back right
									    0.7,-0.1, 0.1,//back right
									    0.5, 0.1, 0.1,//back middle 8
									    0.1, 0.1, 0.1,//back middle
									    0.1,-0.1, 0.1,//back middle 
									    0.5,-0.1, 0.1,//back middle
									   -0.1, 1.0, 0.1,//top top 9	
									   -0.1, 1.0, 0.0,//top top
									    0.7, 1.0, 0.0,//top top
										0.7, 1.0, 0.1,//top top
									    0.1, 0.8, 0.1,//top bottom 10	
									    0.1, 0.8, 0.0,//top bottom
									    0.5, 0.8, 0.0,//top bottom
										0.5, 0.8, 0.1,//top bottom
									    0.1, 0.1, 0.1,//middle up 11
									    0.1, 0.1, 0.0,//middle up
									    0.5, 0.1, 0.0,//middle up
									    0.5, 0.1, 0.1,//middle up
										0.1,-0.1, 0.1,//middle down 12
									    0.1,-0.1, 0.0,//middle down
									    0.7,-0.1, 0.0,//middle down
									    0.7,-0.1, 0.1,//middle down
									   -0.1,-1.0, 0.1,//bottom 13
									   -0.1,-1.0, 0.0,//bottom
									    0.1,-1.0, 0.0,//bottom
										0.1,-1.0, 0.1,//bottom
									   -0.1, 1.0, 0.1,//straight left 14
									   -0.1, 1.0, 0.0,//straight left
									   -0.1,-1.0, 0.0,//straight left
									   -0.1,-1.0, 0.1,//straight left
									    0.1, 1.0, 0.1,//straight right 15
									    0.1, 1.0, 0.0,//straight right
									    0.1,-1.0, 0.0,//straight right
									    0.1,-1.0, 0.1,//straight right
										0.7, 1.0, 0.1,//right right 16
										0.7, 1.0, 0.0,//right right
										0.7,-0.1, 0.0,//right right
										0.7,-0.1, 0.1,//right right
										0.5, 0.8, 0.1,//right left 17
										0.5, 0.8, 0.0,//right left
										0.5, 0.1, 0.0,//right left
										0.5, 0.1, 0.1//right left
										   ]);
	var PcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front straight 1
										0.0, 1.0, 0.0,//front straight
										0.0, 1.0, 0.0,//front straight
										0.0, 1.0, 0.0,//front straight
										0.0, 0.0, 1.0,//front top 2
										0.0, 0.0, 1.0,//front top
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//middle 4
										0.0, 1.0, 0.0,//middle
										0.0, 1.0, 0.0,//middle 
										0.0, 1.0, 0.0,//middle
										0.0, 0.0, 1.0,//back straight 5
										0.0, 0.0, 1.0,//back straight
										0.0, 0.0, 1.0,//back straight
										0.0, 0.0, 1.0,//back straight
										1.0, 0.0, 0.0,//back top 6
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top 
										1.0, 0.0, 0.0,//back top
										0.0, 1.0, 1.0,//back right 7
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back middle 8
 										0.0, 1.0, 1.0,//back middle
	                                    0.0, 1.0, 1.0,//back middle 
										0.0, 1.0, 1.0,//back middle
										1.0, 1.0, 0.0,//top top 9	
 										1.0, 1.0, 0.0,//top top
	                                    1.0, 1.0, 0.0,//top top
										1.0, 1.0, 0.0,//top top
										1.0, 1.0, 0.0,//top bottom 10	
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//bottom 13
										1.0, 0.0, 1.0,//bottom
										1.0, 0.0, 1.0,//bottom
										1.0, 0.0, 1.0,//bottom
										1.0, 1.0, 0.0,//straight left 14
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight right 15
										1.0, 1.0, 0.0,//straight right
										1.0, 1.0, 0.0,//straight right
										1.0, 1.0, 0.0,//straight right
										0.0, 0.6, 1.0,//right right 16
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right left 17
										0.0, 0.6, 1.0,//right left
										0.0, 0.6, 1.0,//right left
										0.0, 0.6, 1.0//right left
										
										]);
	var PTexture=new Float32Array([
											0.0,0.0,//front straight 1
											1.0,0.0,//front straight
											1.0,1.0,//front straight
											0.0,1.0,//front straight
											0.0,0.0,//front top 2
											1.0,0.0,//front top
											1.0,1.0,//front top 
											0.0,1.0,//front top
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//middle 4
											1.0,0.0,//middle
											1.0,1.0,//middle 
											0.0,1.0,//middle
											0.0,0.0,//back straight 5
											1.0,0.0,//back straight
											1.0,1.0,//back straight
											0.0,1.0,//back straight
											0.0,0.0,//back top 6
											1.0,0.0,//back top
											1.0,1.0,//back top 
											0.0,1.0,//back top
											0.0,0.0,//back right 7
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 8
											1.0,0.0,//back middle
											1.0,1.0,//back middle 
											0.0,1.0,//back middle
											0.0,0.0,//top top 9	
											1.0,0.0,//top top
											1.0,1.0,//top top
											0.0,1.0,//top top
											0.0,0.0,//top bottom 10	
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//bottom 13
											1.0,0.0,//bottom
											1.0,1.0,//bottom
											0.0,1.0,//bottom
											0.0,0.0,//straight left 14
											1.0,0.0,//straight left
											1.0,1.0,//straight left
											0.0,1.0,//straight left
											0.0,0.0,//straight right 15
											1.0,0.0,//straight right
											1.0,1.0,//straight right
											0.0,1.0,//straight right
											0.0,0.0,//right right 16
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 17
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0//right left

										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,PCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,PcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,PTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	
	gl.bindVertexArray(null);
}


function msdDrawT(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var TCoordinates=new Float32Array([
										0.4, 1.0, 0.0,//front 1
									   -0.4, 1.0, 0.0,//front
									   -0.4, 0.8, 0.0,//front
										0.4, 0.8, 0.0,//front
										0.1, 0.8, 0.0,//front 2
									   -0.1, 0.8, 0.0,//front
									   -0.1,-1.0, 0.0,//front
									    0.1,-1.0, 0.0,//front
										0.4, 1.0, 0.1,//back 3
									   -0.4, 1.0, 0.1,//back
									   -0.4, 0.8, 0.1,//back
										0.4, 0.8, 0.1,//back
										0.1, 0.8, 0.1,//back 4
									   -0.1, 0.8, 0.1,//back
									   -0.1,-1.0, 0.1,//back
										0.1,-1.0, 0.1,//back
									   -0.4, 1.0, 0.1,//top 5
									   -0.4, 1.0, 0.0,//top
									    0.4, 1.0, 0.0,//top
									    0.4, 1.0, 0.1,//top
									   -0.4, 0.8, 0.0,//top bottom 6
									   -0.4, 0.8, 0.1,//top bottom
									    0.4, 0.8, 0.1,//top bottom
									    0.4, 0.8, 0.0, //top  bottom
									   -0.1, 0.8, 0.0,//left side middle 7
									   -0.1, 0.8, 0.1,//left side middle
									   -0.1,-1.0, 0.1,//left side middle
									   -0.1,-1.0, 0.0,//left side middle
									    0.1, 0.8, 0.0,//right side middle 8
									    0.1, 0.8, 0.1,//right side middle
									    0.1,-1.0, 0.1,//right side middle
									    0.1,-1.0, 0.0,//right side middle
										0.4, 1.0, 0.1,//right top side
										0.4, 1.0, 0.0,//right top side
										0.4, 0.8, 0.0,//right top side
										0.4, 0.8, 0.1,//right top side
									   -0.4, 1.0, 0.1,//left top side
									   -0.4, 1.0, 0.0,//left top side
									   -0.4, 0.8, 0.0,//left top side
									   -0.4, 0.8, 0.1,//left top side
									   -0.1,-1.0, 0.1,//bottom
									   -0.1,-1.0, 0.0,//bottom
									    0.1,-1.0, 0.0,//bottom
									    0.1,-1.0, 0.1 //bottom
									   ]);
	var TcolorCoordinates=new Float32Array([
										1.0, 0.0, 0.0,//front top
										1.0, 0.0, 0.0,//front top
										1.0, 0.0, 0.0,//front top
										1.0, 0.0, 0.0,//front top
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										0.0, 1.0, 0.0,//back middle
										0.0, 1.0, 0.0,//back middle
										0.0, 1.0, 0.0,//back middle
										0.0, 1.0, 0.0,//back middle
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top bottom
										0.0, 0.0, 1.0,//top bottom
										0.0, 0.0, 1.0,//top bottom
										0.0, 0.0, 1.0,//top bottom
										0.0, 1.0, 1.0,//left side middle
										0.0, 1.0, 1.0,//left side middle
										0.0, 1.0, 1.0,//left side middle
										0.0, 1.0, 1.0,//left side middle
										0.0, 1.0, 1.0,//right side middle
										0.0, 1.0, 1.0,//right side middle
										0.0, 1.0, 1.0,//right side middle
										0.0, 1.0, 1.0,//right side middle
										1.0, 1.0, 1.0,//right top side
										1.0, 1.0, 1.0,//right top side
										1.0, 1.0, 1.0,//right top side
										1.0, 1.0, 1.0,//right top side
										1.0, 1.0, 1.0,//left top side
										1.0, 1.0, 1.0,//left top side
										1.0, 1.0, 1.0,//left top side
										1.0, 1.0, 1.0,//left top side
										1.0, 1.0, 1.0,//bottom
										1.0, 1.0, 1.0,//bottom
										1.0, 1.0, 1.0,//bottom
										1.0, 1.0, 1.0 //bottom
										]);
	
	var TTexture=new Float32Array([
											0.0,0.0,//front top
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front middle
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back top
											1.0,0.0,//back top
											1.0,1.0,//back top
											0.0,1.0,//back top
											0.0,0.0,//back middle
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//top
											1.0,0.0,//top
											1.0,1.0,//top
											0.0,1.0,//top
											0.0,0.0,//top bottom 
											1.0,0.0,//top bottom 
											1.0,1.0,//top bottom 
											0.0,1.0,//top bottom
											0.0,0.0,//left side middle
                                            1.0,0.0,//left side middle
                                            1.0,1.0,//left side middle
                                            0.0,1.0,//left side middle
											0.0,0.0,//right side middle
                                            1.0,0.0,//right side middle
                                            1.0,1.0,//right side middle
                                            0.0,1.0,//right side middle
											0.0,0.0,//top right side
                                            1.0,0.0,//top right side
                                            1.0,1.0,//top right side
                                            0.0,1.0,//top right side
											0.0,0.0,//top left side
                                            1.0,0.0,//top left side
                                            1.0,1.0,//top left side
                                            0.0,1.0,//top left side
											0.0,0.0,//bottom
                                            1.0,0.0,//bottom
                                            1.0,1.0,//bottom
                                            0.0,1.0 //bottom
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,TCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,TcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,TTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);
	gl.bindVertexArray(null);
}
*/
function degToRadian(degrees)
{
	return(degrees*Math.PI/180);
}
function uninitialize()
{
	if(msd_vao)
	{
		gl.deleteVertexArray(msd_vao);
		msd_vao=null;
	}
	if(msd_vbo)
	{
		gl.deleteBuffer(msd_vbo);
		msd_vbo=null;
	}
	if(msd_vbo_color)
	{
		gl.deleteBuffer(msd_vbo_color);
		msd_vbo_color=null;
	}
	if(msd_shaderProgramObject)
	{
		if(msd_fragmentShaderObject)
		{
			gl.detachShader(msd_shaderProgramObject,msd_fragmentShaderObject);
			gl.deleteShader(msd_fragmentShaderObject);
			msd_fragmentShaderObject=null;
		}
		if(msd_vertexShaderObject)
		{
			gl.detachShader(msd_shaderProgramObject,msd_vertexShaderObject);
			gl.deleteShader(msd_vertexShaderObject);
			msd_vertexShaderObject=null;
		}
		gl.deleteProgram(msd_shaderProgramObject);
		msd_shaderProgramObject=null;
	}
	
}
function keyDown(event)
{
		switch(event.keyCode)
		{
			case 27://Escape
				uninitialize();
				window.close();
				break;
			case 70: //for 'F' or 'f'
				toggleFullScreen();
				break;
		}
}
function mouseDown()
{
		
}