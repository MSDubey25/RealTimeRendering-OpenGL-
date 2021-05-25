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

var sphere=null;

var perspectiveProjectionMatrix;
var modelMatrixUniform;
var viewMatrixUniform;
var projectionMatrixUniform;
var laUniform,ldUniform,lsUniform;
var kaUniform,kdUniform,ksUniform;
var lightPositionUniform;
var materialShininessUniform;
var LKeyPressedUniform;

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
						"uniform mat4 u_m_matrix;"+
						"uniform mat4 u_v_matrix;"+
						"uniform mat4 u_p_matrix;"+
						"uniform vec3 u_ld;"+
						"uniform vec3 u_kd;"+
						"uniform vec4 u_lightPosition;"+
						"uniform float u_LkeyIsPressed;"+
						"out vec3 diffuseLight;"+
						"void main(void)"+
						"{"+
						"	if(u_LkeyIsPressed==1.0)"+
						"	{"+
						"		mat4 u_mv_matrix=u_v_matrix *u_m_matrix;"+
						"		vec4 eyeCoordinate=u_mv_matrix * vPosition;"+
						/*"		mat3 normalMatrix= mat3(transpose(inverse(u_mv_matrix)));"+
						"		vec3 transformedNormal=normalize(normalMatrix*vNormal);"+*/
						"		vec3 transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);"+
						"		vec3 s=normalize(vec3(u_lightPosition.xyz-eyeCoordinate.xyz));"+
						"		diffuseLight=u_ld*u_kd*dot(s,transformedNormal);"+
						"	}"+
						"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;"+
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
							"in vec3 diffuseLight;" +
							"uniform float u_LkeyIsPressed;" +
							"out vec4 FragColor;" +
							"void main(void)" +
							"{" +
							"	if(u_LkeyIsPressed==1.0)" +
							"	{" +
							"		FragColor=vec4(diffuseLight,1.0);" +
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
	modelMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_m_matrix");
	viewMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_v_matrix");
	projectionMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_p_matrix");
	LKeyPressedUniform=gl.getUniformLocation(shaderProgramObject,"u_LkeyIsPressed");
	ldUniform=gl.getUniformLocation(shaderProgramObject,"u_ld");
	kdUniform=gl.getUniformLocation(shaderProgramObject,"u_kd");
	lightPositionUniform=gl.getUniformLocation(shaderProgramObject,"u_lightPosition");

		//for sphere
	sphere=new Mesh();
	makeSphere(sphere,2.0,30,30);
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
	var modelMatrix=mat4.create();
	var viewMatrix=mat4.create();
	
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-6.0]);
	
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	
	sphere.draw();
	//animation loop
	requestAnimationFrame(draw,canvas);
}
function uninitialize()
{
	if(sphere)
	{
		sphere.deallocate();
		sphere=null;
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