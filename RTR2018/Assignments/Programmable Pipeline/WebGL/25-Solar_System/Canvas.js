//global variables
var canvas=null;
var gl=null;
var bFullscreen=false;
var canvas_original_width;
var canvas_original_height;
var Stack=new Array();

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
var mvpUniform;


var year = 0, day = 0;
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
						"\n" +
						"in vec4 vPosition;" +
						"in vec4 vColor;" +
						"uniform mat4 u_mvp_matrix;" +
						"out vec4 out_color;" +
						"void main(void)" +
						"{" +
						"gl_Position=u_mvp_matrix*vPosition;" +
						"out_color=vColor;"+
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
							"in vec4 out_color;" +
							"out vec4 FragColor;" +
							"void main(void)" +
							"{" +
							"FragColor=out_color;" +
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
	
		//for sphere
	sphere=new Mesh();
	makeSphere(sphere,1.0,30,30);
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
	var modelViewMatrix=mat4.create();
	var modelViewProjectionMatrix=mat4.create();
	var translationMatrix=mat4.create();
	var scaleMatrix=mat4.create();
	mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,0.0,-8.0]);
	Stack.push(modelViewMatrix);
	//mat4.scale(modelViewMatrix,modelViewMatrix,[2.0,0.5,1.0]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	gl.vertexAttrib3f(WebGlMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 0.0);
	sphere.draw();
	Stack.pop();
	//Earth
	
	//modelViewMatrix=mat4.create();
	modelViewProjectionMatrix=mat4.create();
	translationMatrix=mat4.create();
	mat4.rotateY(modelViewMatrix,modelViewMatrix,year*Math.PI/180.0);
	mat4.translate(modelViewMatrix,modelViewMatrix,[4.0,0.0,0.0]);
	mat4.rotateY(modelViewMatrix,modelViewMatrix,day*Math.PI/180.0);
	Stack.push(modelViewMatrix);//
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.5,0.5,0.5]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	gl.vertexAttrib3f(WebGlMacros.AMC_ATTRIBUTE_COLOR, 0.0, 0.0, 1.0);
	sphere.draw();
	
	
	//Moon
	//modelViewMatrix=mat4.create();
	modelViewProjectionMatrix=mat4.create();
	translationMatrix=mat4.create();
	mat4.translate(modelViewMatrix,modelViewMatrix,[-2.0,0.0,0.0]);
	mat4.rotateZ(modelViewMatrix,modelViewMatrix,day*Math.PI/180.0);
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.25,0.25,0.25]);
	Stack.push(modelViewMatrix);
	
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	gl.vertexAttrib3f(WebGlMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 1.0);
	sphere.draw();
	Stack.pop();
	
	Stack.pop();
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
			case 68://for D 
				day = (day + 6) % 360;
				break;
			case 100: // for d
				day = (day - 6) % 360;
				break;
			case 89://for Y
				year = (year + 3) % 360;
				break;
			case 121://for y
				year = (year - 3) % 360;
				break;
		}
}
function mouseDown()
{
		
}