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

var vao_cube;
var vbo_cube_position;
var vbo_cube_normal;

var modelViewMatrixUniform;
var projectionMatrixUniform;
var ldUniform;
var kdUniform;
var lightPositionUniform;
var LKeyPressedUniform;

var perspectiveProjectionMatrix;
var angleCube=0.0;
var bLKeyPressed=false;
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
						"in vec3 vNormal;" +
						"uniform mat4 u_mv_matrix;" +
						"uniform mat4 u_p_matrix;" +
						"uniform float u_LkeyIsPressed;" +
						"uniform vec3 u_ld;" +
						"uniform vec3 u_kd;" +
						"uniform vec4 u_lightPosition;" +
						"out vec3 diffuseColor;" +
						"void main(void)" +
						"{" +
						"	if(u_LkeyIsPressed==1.0)" +
						"	{" +
						"		vec4 eyeCoordinate=u_mv_matrix * vPosition;" +
						"		mat3 normalMatrix= mat3(transpose(inverse(u_mv_matrix)));" +
						"		vec3 tNormal=normalize(normalMatrix*vNormal);" +
						"		vec3 s=normalize(vec3(u_lightPosition.xyz-eyeCoordinate.xyz));" +
						"		diffuseColor=u_ld*u_kd*dot(s,tNormal);" +
						"	}" +
						"gl_Position=u_p_matrix *u_mv_matrix* vPosition;" +
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
							"in vec3 diffuseColor;" +
							"uniform float u_LkeyIsPressed;" +
							"out vec4 FragColor;" +
							"void main(void)" +
							"{" +
							"	if(u_LkeyIsPressed==1.0)" +
							"	{" +
							"		FragColor=vec4(diffuseColor,1.0);" +
							"	}" +
							"	else" +
							"	{" +
							"		FragColor=vec4(1.0,1.0,1.0,1.0);" +
							"	}" +
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
	gl.bindAttribLocation(shaderProgramObject,WebGlMacros.AMC_ATTRIBUTE_NORMAL,"vNormal");
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
	modelViewMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_mv_matrix");
	projectionMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_p_matrix");
	LKeyPressedUniform=gl.getUniformLocation(shaderProgramObject,"u_LkeyIsPressed");
	ldUniform=gl.getUniformLocation(shaderProgramObject,"u_ld");
	kdUniform=gl.getUniformLocation(shaderProgramObject,"u_kd");
	lightPositionUniform=gl.getUniformLocation(shaderProgramObject,"u_lightPosition");
	//triangle vertices
	var cubeVertices=new Float32Array([1.0, 1.0, -1.0,//top
										-1.0, 1.0, -1.0,
										-1.0, 1.0, 1.0,
										1.0, 1.0, 1.0,
										
										1.0, -1.0, 1.0,//bottom
										-1.0, -1.0, 1.0,
										-1.0, -1.0, -1.0,
										1.0, -1.0, -1.0,
										
										1.0, 1.0, 1.0,//front
										-1.0, 1.0, 1.0,
										-1.0, -1.0, 1.0,
										1.0, -1.0, 1.0,
										
										1.0, -1.0, -1.0,//back
										-1.0, -1.0, -1.0,
										-1.0, 1.0, -1.0,
										1.0, 1.0, -1.0,
										
										-1.0, 1.0, 1.0,//left
										-1.0, 1.0, -1.0,
										-1.0, -1.0, -1.0,
										-1.0, -1.0, 1.0,
										
										1.0, 1.0, -1.0,//right
										1.0, 1.0, 1.0,
										1.0, -1.0, 1.0,
										1.0, -1.0, -1.0]);//right-bottom
										
	var cubeNormals=new Float32Array([
									0.0, 1.0, 0.0,//top
								0.0, 1.0, 0.0,
								0.0, 1.0, 0.0,
								0.0, 1.0, 0.0,
								0.0, -1.0, 0.0,//bottom
								0.0, -1.0, 0.0,
								0.0, -1.0, 0.0,
								0.0, -1.0, 0.0,
								0.0,0.0,1.0,//front
								0.0,0.0,1.0,
								0.0,0.0,1.0,
								0.0,0.0,1.0,
								0.0, 0.0,- 1.0,//back
								0.0, 0.0, -1.0,
								0.0, 0.0, -1.0,
								0.0, 0.0, -1.0,
								-1.0, 0.0, 0.0,//left
								-1.0, 0.0, 0.0,
								-1.0, 0.0, 0.0,
								-1.0, 0.0, 0.0,
								1.0, 0.0, 0.0,//right
								1.0, 0.0, 0.0,
								1.0, 0.0, 0.0,
								1.0, 0.0, 0.0
	]);
	vao_cube=gl.createVertexArray();
	gl.bindVertexArray(vao_cube);
	vbo_cube_position=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_cube_position);
	gl.bufferData(gl.ARRAY_BUFFER,cubeVertices,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//normals
	vbo_cube_normal=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_cube_normal);
	gl.bufferData(gl.ARRAY_BUFFER,cubeNormals,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_NORMAL,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_NORMAL);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindVertexArray(null);
	  gl.enable(gl.DEPTH_TEST);
	  gl.enable(gl.CULL_FACE);
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
	if(bLKeyPressed==true)
	{
		gl.uniform1f(LKeyPressedUniform,1.0);
		gl.uniform3f(ldUniform,1.0,1.0,1.0);
		gl.uniform3f(kdUniform,0.5,0.5,0.5);
		var lightPosition=[0.0,0.0,2.0,1.0];
		gl.uniform4fv(lightPositionUniform,lightPosition);
	}
	else
	{
		gl.uniform1f(LKeyPressedUniform,0.0);
	}
	var modelViewMatrix=mat4.create();
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,0.0,-4.0]);
	//mat4.multiply(modelViewMatrix,modelViewMatrix,translationMatrix);
	mat4.rotateX(modelViewMatrix,modelViewMatrix,angleCube*Math.PI/180.0);
	mat4.rotateY(modelViewMatrix,modelViewMatrix,angleCube*Math.PI/180.0);
	mat4.rotateZ(modelViewMatrix,modelViewMatrix,angleCube*Math.PI/180.0);
	gl.uniformMatrix4fv(modelViewMatrixUniform,false,modelViewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	gl.bindVertexArray(vao_cube);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 12, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 20, 4);
	gl.bindVertexArray(null);
	gl.useProgram(null);
	angleCube=angleCube+1.0;
	if(angleCube>=360.0)
	{
		angleCube=angleCube-360.0;
	}
	//animation loop
	requestAnimationFrame(draw,canvas);
}
function uninitialize()
{
	if(vao_cube)
	{
		gl.deleteVertexArray(vao_cube);
		vao_cube=null;
	}
	if(vbo_cube_position)
	{
		gl.deleteBuffer(vbo_cube_position);
		vbo_cube_position=null;
	}
	if(vbo_cube_normal)
	{
		gl.deleteBuffer(vbo_cube_normal);
		vbo_cube_normal=null;
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
			case 76://for 'L' or 'l'
				if(bLKeyPressed==false)
				{
					bLKeyPressed=true;
				}
				else
				{
					bLKeyPressed=false;
				}
				break;
		}
}
function mouseDown()
{
		
}