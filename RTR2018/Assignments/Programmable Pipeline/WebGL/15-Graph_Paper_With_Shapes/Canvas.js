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

var vao;
var vbo_position;
var vbo_color;
var mvpUniform;

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
						"gl_PointSize = 3.0;"+
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

	vao=gl.createVertexArray();
	gl.bindVertexArray(vao);
	vbo_position=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
	gl.bufferData(gl.ARRAY_BUFFER,0,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//color
	vbo_color=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,0,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
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
	var linesCoordinates=new Float32Array([-1.0, 0.0, 0.0 ,
										1.0, 0.0, 0.0,
										0.0, -1.0, 0.0,
										0.0, 1.0, 0.0]);
	var colorCoordinates=new Float32Array([0.0, 1.0, 0.0 ,
										0.0, 1.0, 0.0,
										0.0, 0.0, 1.0,
										0.0, 0.0, 1.0]);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shaderProgramObject);
	
	var modelViewMatrix=mat4.create();
	var modelViewProjectionMatrix=mat4.create();
	var translationMatrix=mat4.create();
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,0.0,-2.0]);
	//mat4.multiply(modelViewMatrix,modelViewMatrix,translationMatrix);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	//outer circle
	var noofpoints = 0;
	var vertices = [];
	var verticesColor=[];
	
	for(var i = 0.0, index = 0  ; i < 360.0 ; i = i + 1.0, index = index + 3)
	{
		noofpoints++;
	}
	for(var i = 0.0, index = 0  ; i < 360.0 ; i = i + 1.0, index = index + 3)
	{
		var degToRad = i * (Math.PI / 180.0);
		
		vertices[index] = 1.0 * Math.cos(degToRad);
		vertices[index + 1] = 1.0 * Math.sin(degToRad);
		vertices[index + 2] = 0.0;
		verticesColor[index]=1.0;
		verticesColor[index+1]=1.0;
		verticesColor[index+2]=0.0;
	}
	
	
	
	//graph
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(linesCoordinates),gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colorCoordinates),gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	
	gl.lineWidth(2.0);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.LINES,0,4);
	//gl.drawArrays(gl.LINES,3,3);
	gl.bindVertexArray(null);
	//////////////////////////////Axis///////////////////////////////////
	/////////////////////////////////////////////////////////////////////
	var s = 0.0;
	for (var i = 0; i < 40; i++)
	{
		if (i == 20)
			s = 0.0;

		if (i < 20)
		{
			s = s - 1.0 / 20.0;
			linesCoordinates[0] = -1.0;
			linesCoordinates[1] = s;
			linesCoordinates[2] = 0.0;
			linesCoordinates[3] = 1.0;
			linesCoordinates[4] = s;
			linesCoordinates[5] = 0.0;
			linesCoordinates[6] = s;
			linesCoordinates[7] = -1.0;
			linesCoordinates[8] = 0.0;
			linesCoordinates[9] = s;
			linesCoordinates[10] = 1.0;
			linesCoordinates[11] = 0.0;
		//similarly bind with textures if any

		//draw necessary scene
		gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(linesCoordinates),gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
		gl.bindBuffer(gl.ARRAY_BUFFER,null);
		gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colorCoordinates),gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
		gl.bindBuffer(gl.ARRAY_BUFFER,null);
		
		gl.lineWidth(1.0);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.LINES,0,4);
		//gl.drawArrays(gl.LINES,3,3);
		gl.bindVertexArray(null);
		}
		else
		{
			s = s + 1.0 / 20.0;
			linesCoordinates[0] = -1.0;
			linesCoordinates[1] = s;
			linesCoordinates[2] = 0.0;
			linesCoordinates[3] = 1.0;
			linesCoordinates[4] = s;
			linesCoordinates[5] = 0.0;
			linesCoordinates[6] = s;
			linesCoordinates[7] = -1.0;
			linesCoordinates[8] = 0.0;
			linesCoordinates[9] = s;
			linesCoordinates[10] = 1.0;
			linesCoordinates[11] = 0.0;

		//similarly bind with textures if any

		//draw necessary scene
		gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(linesCoordinates),gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
		gl.bindBuffer(gl.ARRAY_BUFFER,null);
		gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colorCoordinates),gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
		gl.bindBuffer(gl.ARRAY_BUFFER,null);
		
		gl.lineWidth(1.0);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.LINES,0,4);
		//gl.drawArrays(gl.LINES,3,3);
		gl.bindVertexArray(null);
		}
		
	}
	
	//for rectangle
		linesCoordinates[0] = 0.70;
		linesCoordinates[1] = 0.70;
		linesCoordinates[2] = 0.0;
		linesCoordinates[3] = -0.70;
		linesCoordinates[4] = 0.70;
		linesCoordinates[5] = 0.0;
		linesCoordinates[6] = -0.70;
		linesCoordinates[7] = -0.70;
		linesCoordinates[8] = 0.0;
		linesCoordinates[9] = 0.70;
		linesCoordinates[10] = -0.70;
		linesCoordinates[11] = 0.0;
		for (var i = 0; i < 12; i = i + 3)
		{
			colorCoordinates[i + 0] = 1.0;
			colorCoordinates[i + 1] = 1.0;
			colorCoordinates[i + 2] = 0.0;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(linesCoordinates),gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
		gl.bindBuffer(gl.ARRAY_BUFFER,null);
		gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colorCoordinates),gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
		gl.bindBuffer(gl.ARRAY_BUFFER,null);
		
		gl.lineWidth(2.0);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.LINE_LOOP,0,4);
		//gl.drawArrays(gl.LINES,3,3);
		gl.bindVertexArray(null);
		
		//for triangle
		linesCoordinates[0] = 0.0;
		linesCoordinates[1] = 0.70;
		linesCoordinates[2] = 0.0;
		linesCoordinates[3] = -0.70;
		linesCoordinates[4] = -0.70;
		linesCoordinates[5] = 0.0;
		linesCoordinates[6] = 0.70;
		linesCoordinates[7] = -0.70;
		linesCoordinates[8] = 0.0;
		for (var i = 0; i < 9; i = i + 3)
		{
			colorCoordinates[i + 0] = 1.0;
			colorCoordinates[i + 1] = 1.0;
			colorCoordinates[i + 2] = 0.0;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(linesCoordinates),gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
		gl.bindBuffer(gl.ARRAY_BUFFER,null);
		gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colorCoordinates),gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
		gl.bindBuffer(gl.ARRAY_BUFFER,null);
		
		gl.lineWidth(2.0);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.LINE_LOOP,0,3);
		//gl.drawArrays(gl.LINES,3,3);
		gl.bindVertexArray(null);
		
		gl.bindVertexArray(vao);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,true,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verticesColor),gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,true,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	//gl.vertexAttrib3f(WebGlMacros.AMC_ATTRIBUTE_COLOR,1.0,1.0,0.0);
	//gl.disableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	
	gl.drawArrays(gl.LINE_LOOP,0,noofpoints);
	
	gl.bindVertexArray(null);
	
	//for incircle
	
	for(var i = 0.0, index = 0  ; i < 360.0 ; i = i + 1.0, index = index + 3)
	{
		var degToRad = i * (Math.PI / 180.0);
		
		vertices[index] = 0.429 * Math.cos(degToRad);
		vertices[index + 1] = 0.429 * Math.sin(degToRad);
		vertices[index + 2] = 0.0;
	}
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,-0.27,0.0]);
	//mat4.multiply(modelViewMatrix,modelViewMatrix,translationMatrix);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,true,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verticesColor),gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,true,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	//gl.vertexAttrib3f(WebGlMacros.AMC_ATTRIBUTE_COLOR,1.0,1.0,0.0);
	//gl.disableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	
	gl.drawArrays(gl.LINE_LOOP,0,noofpoints);
	
	gl.bindVertexArray(null);	
	gl.useProgram(null);
	
	//animation loop
	requestAnimationFrame(draw,canvas);
}
function uninitialize()
{
	if(vao)
	{
		gl.deleteVertexArray(vao);
		vao=null;
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