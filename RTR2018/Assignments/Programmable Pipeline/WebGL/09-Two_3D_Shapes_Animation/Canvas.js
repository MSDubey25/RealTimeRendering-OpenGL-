//global variables
var canvas=null;
var gl=null;
var bFullscreen=false;
var canvas_original_width;
var canvas_original_height;

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

var vao_pyramid;
var vbo_pyramid;
var vao_cube;
var vbo_cube;
var vbo_color_pyramid;
var vbo_color_cube;
var mvpUniform;

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
						"in vec4 vColor;"+
						"uniform mat4 u_mvp_matrix;"+
						"out vec4 out_vColor;"+
						"void main(void)"+
						"{"+
						"out_vColor=vColor;"+
						"gl_Position=u_mvp_matrix * vPosition;"+
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
							"in vec4 out_vColor;"+
							"out vec4 FragColor;"+
							"void main(void)"+
							"{"+
							"FragColor=out_vColor;"+
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
	gl.bindAttribLocation(shaderProgramObject,WebGlMacros.AMC_ATTRIBUTE_COLOR,"vColor");
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
	mvpUniform=gl.getUniformLocation(shaderProgramObject,"u_mvp_matrix");
		//triangle vertices
	var pyramidVertices=new Float32Array([0.0,1.0,0.0,//
										-1.0,-1.0,1.0,
										1.0,-1.0,1.0,
										0.0,1.0,0.0,//
										1.0,-1.0,1.0,
										1.0,-1.0,-1.0,
										0.0,1.0,0.0,//
										1.0,-1.0,-1.0,
										-1.0,-1.0,-1.0,
										0.0,1.0,0.0,//
										-1.0,-1.0,-1.0,
										-1.0,-1.0,1.0]);//right-bottom
										
	var cubeVertices=new Float32Array([-1.0, 1.0, -1.0,//top
										-1.0, 1.0, 1.0,
										1.0, 1.0, 1.0,
										1.0, 1.0, -1.0,
										-1.0, -1.0, -1.0,//bottom
										-1.0, -1.0, 1.0,
										1.0, -1.0, 1.0,
										1.0, -1.0, -1.0,
										1.0, 1.0, 1.0,//front
										-1.0, 1.0, 1.0,
										-1.0, -1.0, 1.0,
										1.0, -1.0, 1.0,
										-1.0, 1.0, -1.0,//back
										1.0, 1.0, -1.0,
										1.0, -1.0, -1.0,
										-1.0, -1.0, -1.0,
										1.0, 1.0, -1.0,//right
										1.0, 1.0, 1.0,
										1.0, -1.0, 1.0,
										1.0, -1.0, -1.0,
										-1.0, 1.0, 1.0,//left
										-1.0, 1.0, -1.0,
										-1.0, -1.0, -1.0,
										-1.0, -1.0, 1.0
										]);
	var pyramidColor=new Float32Array([
										1.0,0.0,0.0,//r
										0.0,1.0,0.0,//g
										0.0,0.0,1.0,//b 
										1.0,0.0,0.0,//r
										0.0,0.0,1.0,//b
										0.0,1.0,0.0,//g
										1.0,0.0,0.0,//r
										0.0,1.0,0.0,//g
										0.0,0.0,1.0,//b
										1.0,0.0,0.0,//r
										0.0,0.0,1.0,//b
										0.0,1.0,0.0//g
										]);
	var cubeColor=new Float32Array([
										1.0,0.0,0.0,//r
										1.0,0.0,0.0,//r
										1.0,0.0,0.0,//r
										1.0,0.0,0.0,//r
										0.0,0.0,1.0,//b
										0.0,0.0,1.0,//b
										0.0,0.0,1.0,//b
										0.0,0.0,1.0,//b
										0.0,1.0,0.0,//g
										0.0,1.0,0.0,//g
										0.0,1.0,0.0,//g
										0.0,1.0,0.0,//g
										0.0,1.0,1.0,//c
										0.0,1.0,1.0,//c
										0.0,1.0,1.0,//c
										0.0,1.0,1.0,//c
										1.0,0.0,1.0,//m
										1.0,0.0,1.0,//m
										1.0,0.0,1.0,//m
										1.0,0.0,1.0,//m
										1.0,1.0,0.0,//y
										1.0,1.0,0.0,//y
										1.0,1.0,0.0,//y
										1.0,1.0,0.0//y
										]);
										
	
	//for triangle
	vao_pyramid=gl.createVertexArray();
	gl.bindVertexArray(vao_pyramid);
	vbo_pyramid=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_pyramid);
	gl.bufferData(gl.ARRAY_BUFFER,pyramidVertices,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//for triangle color
	vbo_color_pyramid=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color_pyramid);
	gl.bufferData(gl.ARRAY_BUFFER,pyramidColor,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindVertexArray(null);
	
	//for Rectangle
	vao_cube=gl.createVertexArray();
	gl.bindVertexArray(vao_cube);
	vbo_cube=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_cube);
	gl.bufferData(gl.ARRAY_BUFFER,cubeVertices,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//for triangle color
	vbo_color_cube=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color_cube);
	gl.bufferData(gl.ARRAY_BUFFER,cubeColor,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
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
	mat4.translate(modelViewMatrix,modelViewMatrix,[-2.0,0.0,-6.0]);
	mat4.rotateY(modelViewMatrix,modelViewMatrix,degToRadian(angle));
	//mat4.multiply(modelViewMatrix,modelViewMatrix,translationMatrix);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	gl.bindVertexArray(vao_pyramid);
	gl.drawArrays(gl.TRIANGLES,0,12);
	gl.bindVertexArray(null);
	//mat4.identity(modelViewMatrix);
	mat4.identity(modelViewMatrix);
	mat4.translate(modelViewMatrix,modelViewMatrix,[2.0,0.0,-6.0]);
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.75,0.75,0.75]);
	mat4.rotateX(modelViewMatrix,modelViewMatrix,degToRadian(angle));
	mat4.rotateY(modelViewMatrix,modelViewMatrix,degToRadian(angle));
	mat4.rotateZ(modelViewMatrix,modelViewMatrix,degToRadian(angle));
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	//gl.vertexAttrib3f(WebGlMacros.AMC_ATTRIBUTE_COLOR,0.0,0.0,1.0);
	gl.bindVertexArray(vao_cube);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);
	gl.bindVertexArray(null);
	gl.useProgram(null);
	//angle rotation
	if(angle<=360.0)
		angle=angle+0.5;
	else
		angle=0.0;
	//animation loop
	requestAnimationFrame(draw,canvas);
}
function degToRadian(degrees)
{
	return(degrees*Math.PI/180);
}
function uninitialize()
{
	if(vao_pyramid)
	{
		gl.deleteVertexArray(vao_pyramid);
		vao_pyramid=null;
	}
	if(vbo_pyramid)
	{
		gl.deleteBuffer(vbo_pyramid);
		vbo_pyramid=null;
	}
	if(vao_cube)
	{
		gl.deleteVertexArray(vao_cube);
		vao_cube=null;
	}
	if(vbo_cube)
	{
		gl.deleteBuffer(vbo_cube);
		vbo_cube=null;
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