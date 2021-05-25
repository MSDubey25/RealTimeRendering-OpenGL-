//global variables
var canvas=null;
var gl=null;
var bFullscreen=false;
var canvas_original_width;
var canvas_original_height;
var CHECKIMAGEHEIGHT=64;
var CHECKIMAGEWIDTH=64;
var checkImage=new Uint8Array(CHECKIMAGEHEIGHT*CHECKIMAGEWIDTH*4);
//Attributes Macro
const WebGlMacros=
{
	AMC_ATTRIBUTE_POSITION:0,
	AMC_ATTRIBUTE_COLOR:1,
	AMC_ATTRIBUTE_NORMAL:2,
	AMC_ATTRIBUTE_TEXTURE:3
};

var vertexShaderObject;
var fragmentShaderObject;
var shaderProgramObject;

var vao_rectangle;
var vbo_position;
var vbo_texture;
var mvpUniform;
var samplerUniform;

var rectangle_texture;
var angle=0.0;


var perspectiveProjectionMatrix;

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
	//get WebGL 2.0 context
	gl=canvas.getContext("webgl2");
	if(gl==null)
	{
			console.log("Failed to get the rendering context of webGL");
			return;
	}
	gl.viewportWidth=canvas.width;
	gl.viewportHeight=canvas.height;
	
	var vertexShaderSourceCode = "#version 300 es"+
						"\n"+
						"in vec4 vPosition;"+
						"in vec2 vTexCoord;"+
						"uniform mat4 u_mvp_matrix;"+
						"out vec2 out_TexCoord;"+
						"void main(void)"+
						"{"+
						"gl_Position=u_mvp_matrix * vPosition;"+
						"out_TexCoord=vTexCoord;"+
						"}";
	vertexShaderObject=gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShaderObject,vertexShaderSourceCode);
	gl.compileShader(vertexShaderObject);
	if(gl.getShaderParameter(vertexShaderObject,gl.COMPILE_STATUS)==false)
	{
		var error=gl.getShaderInfoLog(vertexShaderObject);
		if(error.length>0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	var fragmentShaderSourceCode=
							"#version 300 es"+
							"\n"+
							"precision highp float;"+
							"in vec2 out_TexCoord;"+
							"uniform sampler2D u_sampler;"+
							"out vec4 FragColor;"+
							"void main(void)"+
							"{"+
							"FragColor=texture(u_sampler,out_TexCoord);"+
							"}";
	fragmentShaderObject=gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShaderObject,fragmentShaderSourceCode);
	gl.compileShader(fragmentShaderObject);
	if(gl.getShaderParameter(fragmentShaderObject,gl.COMPILE_STATUS)==false)
	{
		var error=gl.getShaderInfoLog(fragmentShaderObject);
		if(error.length>0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	//shader program
	shaderProgramObject=gl.createProgram();
	gl.attachShader(shaderProgramObject,vertexShaderObject);
	gl.attachShader(shaderProgramObject,fragmentShaderObject);
	//prelink binding attribute
	gl.bindAttribLocation(shaderProgramObject,WebGlMacros.AMC_ATTRIBUTE_POSITION,"vPosition");
	gl.bindAttribLocation(shaderProgramObject,WebGlMacros.AMC_ATTRIBUTE_TEXTURE,"vTexCoord");
	//link the program
	gl.linkProgram(shaderProgramObject);
	if(!gl.getProgramParameter(shaderProgramObject,gl.LINK_STATUS))
	{
		var error=gl.getProgramInfoLog(shaderProgramObject);
		if(error.length>0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	LoadTexture();
	mvpUniform=gl.getUniformLocation(shaderProgramObject,"u_mvp_matrix");
	samplerUniform=gl.getUniformLocation(shaderProgramObject,"u_sampler");
										
	var rectangleTexture=new Float32Array([
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0
										]);
										
	
	//for Rectangle
	vao_rectangle=gl.createVertexArray();
	gl.bindVertexArray(vao_rectangle);
	vbo_position=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
	gl.bufferData(gl.ARRAY_BUFFER,0,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//for rectangle texture
	vbo_texture=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,rectangleTexture,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindVertexArray(null);
	  gl.enable(gl.DEPTH_TEST);
	  //gl.enable(gl.CULL_FACE);
	  gl.depthFunc(gl.LEQUAL);
	//set Clear Color
	gl.clearColor(0.0,0.0,0.0,1.0);//blue
	
	//initialize projection Matrix
	perspectiveProjectionMatrix=mat4.create();
}
function LoadTexture()
	{
		MakeCheckImage();
		texture_checker=gl.createTexture();
		gl.bindTexture  (gl.TEXTURE_2D, texture_checker);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
		gl.texImage2D(gl.TEXTURE_2D, 0,gl.RGBA,CHECKIMAGEWIDTH,CHECKIMAGEHEIGHT,0,
						gl.RGBA,gl.UNSIGNED_BYTE,checkImage);
		gl.bindTexture(gl.TEXTURE_2D,null);
		//////////////////
	}
	function MakeCheckImage()
	{
			var i, j;
			var c;
			for (i = 0; i < CHECKIMAGEHEIGHT; i++)
			{
				for (j = 0; j < CHECKIMAGEWIDTH; j++)
				{
					c = ((i&0x8)^(j&0x8))*255;
					checkImage[(i*64+j)*4+0] = c;
					checkImage[(i*64+j)*4+1] = c;
					checkImage[(i*64+j)*4+2] = c;
					checkImage[(i*64+j)*4+3] = 255;
				}
			}
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
	mat4.perspective(perspectiveProjectionMatrix,45.0,
		parseFloat(canvas.width) / parseFloat(canvas.height),
		0.1,
		100.0);
}
function draw()
{
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shaderProgramObject);
	
	var modelViewMatrix=mat4.create();
	var modelViewProjectionMatrix=mat4.create();
	var cubeVertices=new Float32Array([ 
										-2.0,-1.0,0.0,
										-2.0,1.0,0.0,
										0.0,1.0,0.0,
										0.0,-1.0,0.0
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(cubeVertices),gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	mat4.identity(modelViewMatrix);
	mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,0.0,-6.0]);
	//mat4.scale(modelViewMatrix,modelViewMatrix,[0.75,0.75,0.75]);
	
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	//gl.vertexAttrib3f(WebGlMacros.AMC_ATTRIBUTE_COLOR,0.0,0.0,1.0);
	//gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.bindTexture(gl.TEXTURE_2D,texture_checker);
	gl.uniform1i(samplerUniform,0);
	gl.bindVertexArray(vao_rectangle);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	gl.bindVertexArray(null);
	
	
	cubeVertices[0] = 1.0;
	cubeVertices[1] = -1.0;
	cubeVertices[2] = 0.0;
	cubeVertices[3] = 1.0;
	cubeVertices[4] = 1.0;
	cubeVertices[5] = 0.0;
	cubeVertices[6] = 2.41421;
	cubeVertices[7] = 1.0;
	cubeVertices[8] = -1.41421;
	cubeVertices[9] = 2.41421;
	cubeVertices[10] = -1.0;
	cubeVertices[11] = -1.41421;
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(cubeVertices),gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	mat4.identity(modelViewMatrix);
	mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,0.0,-6.0]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	//gl.vertexAttrib3f(WebGlMacros.AMC_ATTRIBUTE_COLOR,0.0,0.0,1.0);
	//gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.bindTexture(gl.TEXTURE_2D,texture_checker);
	gl.uniform1i(samplerUniform,0);
	gl.bindVertexArray(vao_rectangle);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	gl.bindVertexArray(null);
	gl.useProgram(null);
	//angle rotation
	requestAnimationFrame(draw,canvas);
}

function uninitialize()
{
	if(vao_texture)
	{
		gl.deleteVertexArray(vao_pyramid);
		vao_pyramid=null;
	}
	
	if(vao_rectangle)
	{
		gl.deleteVertexArray(vao_rectangle);
		vao_rectangle=null;
	}
	if(vbo_position)
	{
		gl.deleteBuffer(vbo_position);
		vbo_position=null;
	}
	if(shaderProgramObject)
	{
		if(fragmentShaderObject)
		{
			gl.detachShader(shaderProgramObject,fragmentShaderObject);
			gl.deleteShader(fragmentShaderObject);
			fragmentShaderObject=null;
		}
		if(vertexShaderObject)
		{
			gl.detachShader(shaderProgramObject,vertexShaderObject);
			gl.deleteShader(vertexShaderObject);
			vertexShaderObject=null;
		}
		gl.deleteProgram(shaderProgramObject);
		shaderProgramObject=null;
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