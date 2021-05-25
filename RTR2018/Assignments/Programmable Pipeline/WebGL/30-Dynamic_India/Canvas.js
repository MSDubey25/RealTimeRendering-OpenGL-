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

var vao_letters;
var vao_rectangle;
var vbo_position_letters;
var vbo_position_rectangle;
var vbo_color_letters;
var mvpUniform;

var perspectiveProjectionMatrix;

var counter1 = 0.0;
var counter2 = 0.0;
var counter3 = 0.0;
var counter4 = 0.0;
var counterP1 = 0.0;
var xTranslate = 0.0;
var timer = 0.0;

var flagI1 = false;
var flagA = false;
var flagN = false;
var flagI2 = false;
var flagD = false;
var Cr = 0.0, Cg = 0.0, Cb = 0.0;
var Gr = 0.0, Gg = 0.0, Gb = 0.0;


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
						"out vec4 out_vColor;"+
						"uniform mat4 u_mvp_matrix;"+
						"void main(void)"+
						"{"+
						"gl_Position=u_mvp_matrix * vPosition;"+
						"out_vColor=vColor;"+
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
	//create vao
	vao_letters=gl.createVertexArray();
	gl.bindVertexArray(vao_letters);
	vbo_position_letters=gl.createBuffer();
	vbo_color_letters=gl.createBuffer();
	gl.bindVertexArray(vao_letters);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_position_letters);
	gl.bufferData(gl.ARRAY_BUFFER,0, gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION, 3, gl.FLOAT, false, 0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	//for color
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color_letters);
	gl.bufferData(gl.ARRAY_BUFFER,0, gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR, 3, gl.FLOAT, false,0, 0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindVertexArray(null);
	/////////////////////////////////////////////////////////
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
	var IVertices = new Float32Array([
	 -1.75, 0.75,0.0, //for I
	-1.75, 0.65,0.0,	 //for I
	-1.25, 0.65,0.0 , //for I
	-1.25, 0.75 ,0.0, //for I
	-1.35, 0.65 ,0.0, //for I
	-1.65, 0.65 ,0.0, //for I
	-1.65, -0.65 ,0.0,//for I
	-1.35, -0.65 ,0.0,//for I
	-1.75, -0.65 ,0.0,//for I
	-1.75, -0.75 ,0.0,//for I
	-1.25, -0.75 ,0.0,//for I
	-1.25, -0.65 ,0.0//for I
	]);
	var NVertices = new Float32Array([
		-1.10, 0.75 ,0.0, //for N
		-1.25, 0.75 ,0.0, //for N
		-1.25, -0.75 ,0.0,//for N
		-1.10, -0.75 ,0.0,//for N
		-1.10, 0.75 ,0.0, //for N
		-1.25, 0.75 ,0.0, //for N
		-0.95, -0.75 ,0.0,//for N
		-0.8, -0.75 ,0.0, //for N
		-0.80, 0.75 ,0.0, //for N
		-0.95, 0.75 ,0.0, //for N
		-0.95, -0.75 ,0.0,//for N
		-0.80, -0.75 ,0.0//for N 
	]);
	var DVertices = new Float32Array([
	-0.0, 0.75 ,0.0,  //for D
	-0.60, 0.75 ,0.0,	//for D
	-0.60, -0.75 ,0.0,//for D
	0.0, -0.75 ,0.0,	//for D
	-0.15, 0.60 ,0.0,	//for D
	-0.35, 0.60 ,0.0,	//for D
	-0.35, -0.60,0.0,	//for D
	-0.15, -0.60,0.0,	//for D
	-0.5, 0.60,0.0,	//for D
	-0.60, 0.60,0.0,	//for D
	-0.60, -0.60,0.0,	//for D
	-0.5, -0.60,0.0	//for D

	]);
	var AVertices = new Float32Array([
		1.25, 0.75,0.0, //A
		1.1, 0.75,0.0,  //A
		0.9, -0.75,0.0, //A
		1.55, -0.75,0.0,//A
		1.18, 0.5,0.0,//triangle A
		1.05, -0.75,0.0,
		1.40, -0.75,0.0

	]);
	var FlagVertices = new Float32Array([
		0.057, 0.0,0.0, 
		0.203, 0.0,0.0, 
		0.205, -0.05,0.0, 
		0.045, -0.05,0.0,
		0.057, 0.0 ,0.0,
		0.2029, 0.0,0.0,
		0.195, 0.05,0.0,
		 0.065, 0.05,0.0
	]);
	

	var IColor = new Float32Array([
	1.0, 0.6, 0.2,	//or I
	1.0, 0.6, 0.2,		//or I
	1.0, 0.6, 0.2,		//or I
	1.0, 0.6, 0.2 ,		//or I
	1.0, 0.6, 0.2 ,		//or I
	1.0, 0.6, 0.2,		//or I
	0.071, 0.533, 0.027 ,//or I
	0.071, 0.533, 0.027 ,//or I
	0.071, 0.533, 0.027 ,//or I
	0.071, 0.533, 0.027 ,//or I
	0.071, 0.533, 0.027 ,//or I
	0.071, 0.533, 0.027 //or I
	]);
	var NColor = new Float32Array([
	1.0, 0.6, 0.2 ,		//or N
	1.0, 0.6, 0.2 ,		//or N
	0.071, 0.533, 0.027 ,//or N
	0.071, 0.533, 0.027 ,//or N
	1.0, 0.6, 0.2 ,		//or N
	1.0, 0.6, 0.2 ,		//or N
	0.071, 0.533, 0.027 ,//or N
	0.071, 0.533, 0.027 ,//or N 
	1.0, 0.6, 0.2 ,		//or N
	1.0, 0.6, 0.2 ,		//or N
	0.071, 0.533, 0.027 ,//or N
	0.071, 0.533, 0.027  //or N
	]);
	var DColor = new Float32Array([
	Cr, Cg, Cb , //for D
	Cr, Cg, Cb , //for D
	Gr, Gg, Gb , //for D
	Gr, Gg, Gb , //or D
	0.0, 0.0, 0.0 ,		 //or D
	0.0, 0.0, 0.0 ,		 //or D
	0.0, 0.0, 0.0 ,		 //or D
	0.0, 0.0, 0.0 ,		 //or D
	0.0, 0.0, 0.0 ,		 //or D
	0.0, 0.0, 0.0 ,		 //or D
	0.0, 0.0, 0.0 ,		 //or D
	0.0, 0.0, 0.0 //or D
	]);
	var AColor = new Float32Array([
	1.0, 0.6, 0.2,      //A
	1.0, 0.6, 0.2,	   //A
	0.071, 0.533, 0.027,//A
	0.071, 0.533, 0.027,//A
	0.0, 0.0, 0.0,	   //A
	0.0, 0.0, 0.0,	   //A
	0.0, 0.0, 0.0	   //A
	]);

	var FlagColor = new Float32Array([
	1.0, 1.0, 1.0,
	1.0, 1.0, 1.0,
	0.071, 0.533, 0.027,
	0.071, 0.533, 0.027,
	1.0, 1.0, 1.0,
	1.0, 1.0, 1.0,
	1.0, 0.6, 0.2,
	1.0, 0.6, 0.2
	]);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shaderProgramObject);
	
	var modelViewMatrix=mat4.create();
	var modelViewProjectionMatrix=mat4.create();
	var translationMatrix=mat4.create();
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[-2.0 + counter1, 0.0,-3.0]);
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.8, 0.9, 0.0]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	//similarly bind with textures if any
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_position_letters);
	gl.bufferData(gl.ARRAY_BUFFER,
		IVertices, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color_letters);
	gl.bufferData(gl.ARRAY_BUFFER,IColor, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//bind with vao
	gl.bindVertexArray(vao_letters);
	//draw necessary scene
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
	//unbind vao
	gl.bindVertexArray(null);
	//////////////////////////////Axis///////////////////////////////////
	modelViewMatrix=mat4.identity(modelViewMatrix);
	modelViewProjectionMatrix=mat4.identity(modelViewProjectionMatrix);
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[0.2, 6.5 - counter3, -3.0]);
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.8, 0.9, 0.0]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	//similarly bind with textures if any
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_position_letters);
	gl.bufferData(gl.ARRAY_BUFFER,
		NVertices, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color_letters);
	gl.bufferData(gl.ARRAY_BUFFER,NColor, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//bind with vao
	gl.bindVertexArray(vao_letters);
	//draw necessary scene
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
	//unbind vao
	gl.bindVertexArray(null);
	
	modelViewMatrix=mat4.identity(modelViewMatrix);
	modelViewProjectionMatrix=mat4.identity(modelViewProjectionMatrix);
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[0.25, 0.0, -3.0]);
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.8, 0.9, 0.0]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	//similarly bind with textures if any
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_position_letters);
	gl.bufferData(gl.ARRAY_BUFFER,
		DVertices, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color_letters);
	gl.bufferData(gl.ARRAY_BUFFER,DColor, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//bind with vao
	gl.bindVertexArray(vao_letters);
	//draw necessary scene
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
	//unbind vao
	gl.bindVertexArray(null);
	
	
	modelViewMatrix=mat4.identity(modelViewMatrix);
	modelViewProjectionMatrix=mat4.identity(modelViewProjectionMatrix);
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[1.8, -2.52 + counter4, -3.0]);
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.8, 0.9, 0.0]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	//similarly bind with textures if any
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_position_letters);
	gl.bufferData(gl.ARRAY_BUFFER,
		IVertices, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color_letters);
	gl.bufferData(gl.ARRAY_BUFFER,IColor, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//bind with vao
	gl.bindVertexArray(vao_letters);
	//draw necessary scene
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
	//unbind vao
	gl.bindVertexArray(null);
	
	
	modelViewMatrix=mat4.identity(modelViewMatrix);
	modelViewProjectionMatrix=mat4.identity(modelViewProjectionMatrix);
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[2.3 - counter2, 0.0, -3.0]);
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.8, 0.9, 0.0]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	//similarly bind with textures if any
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_position_letters);
	gl.bufferData(gl.ARRAY_BUFFER,
		AVertices, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color_letters);
	gl.bufferData(gl.ARRAY_BUFFER,AColor, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//bind with vao
	gl.bindVertexArray(vao_letters);
	//draw necessary scene
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.drawArrays(gl.TRIANGLES, 4, 3);
	//unbind vao
	gl.bindVertexArray(null);
	
	if (flagI1 == true && flagA==true && flagN==true && flagI2==true && Cr >= 1.0 && Cg>=0.6 && Cb>=0.2
	&& Gr >= 0.071 && Gg >= 0.533 && Gb >= 0.027)
	{
			modelViewMatrix=mat4.identity(modelViewMatrix);
	modelViewProjectionMatrix=mat4.identity(modelViewProjectionMatrix);
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[1.0555, 0.0, -3.0]);
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.8, 0.9, 0.0]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	//similarly bind with textures if any
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_position_letters);
	gl.bufferData(gl.ARRAY_BUFFER,
		FlagVertices, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color_letters);
	gl.bufferData(gl.ARRAY_BUFFER,FlagColor, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//bind with vao
	gl.bindVertexArray(vao_letters);
	//draw necessary scene
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
	//unbind vao
	gl.bindVertexArray(null);
	
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
		verticesColor[index]=0.0;
		verticesColor[index+1]=0.0;
		verticesColor[index+2]=1.0;
	}
	modelViewMatrix=mat4.identity(modelViewMatrix);
	modelViewProjectionMatrix=mat4.identity(modelViewProjectionMatrix);
	
	mat4.translate(modelViewMatrix,modelViewMatrix,[1.157, 0.0, -3.0]);
	mat4.scale(modelViewMatrix,modelViewMatrix,[0.01, 0.01, 0.01]);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	//similarly bind with textures if any
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_position_letters);
	gl.bufferData(gl.ARRAY_BUFFER,
		new Float32Array(vertices), gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color_letters);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verticesColor), gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//bind with vao
	gl.bindVertexArray(vao_letters);
	//draw necessary scene
	gl.drawArrays(gl.LINE_LOOP,0,noofpoints);
	//unbind vao
	gl.bindVertexArray(null);
	
	}
	
	gl.useProgram(null);
	
	//animation loop
	requestAnimationFrame(draw,canvas);
	if (counter1 <= 2.0 && flagI1 == false)
		counter1 = counter1 + 0.025;
	else
	{
		flagI1 = true;
	}
	if (counter2 <= 2.09 && flagI1 == true)
		counter2 = counter2 + 0.025;
	else
	{
		flagA = true;
	}
	if (counter3 <= 6.5 &&  flagA == true)
		counter3 = counter3 + 0.025;
	else
	{
		flagN = true;
	}
	if (counter4 <= 2.5 &&  flagN == true)
		counter4 = counter4 + 0.025;
	else
	{
		flagI2 = true;
	}
	if (counter4 >= 2.5)
	{
		if (Cr <= 1.0)
			Cr = Cr + 0.025;
		if (Cg <= 0.6)
			Cg = Cg + 0.025;
		if (Cb <= 0.2)
			Cb = Cb + 0.025;
		if (Gr <= 0.071)
			Gr = Gr + 0.025;
		if (Gg <= 0.533)
			Gg = Gg + 0.025;
		if (Gb <= 0.027)
			Gb = Gb + 0.025;
	}
	else
	{
		flagD = true;
	}
	if (counterP1 <= 2.9 &&   Cr > 0.99 && Gg > 0.472)
	{
		if (xTranslate <= 1.25)
		{
			counterP1 = counterP1 + 0.007;
			xTranslate += 0.007;
		}
		else if (xTranslate >= 1.25 && xTranslate <= 2.09)
		{
			xTranslate += 0.007;
		}
		else
		{
			//counterP1 = counterP1 + 0.0001f;
			timer += 0.007;
		}
		if (timer >= 1.92)
		{
			counterP1 = counterP1 + 0.001;

		}
	}
}
function degToRadian(degrees)
{
	return(degrees*Math.PI/180);
}
function uninitialize()
{
	if(vao_letters)
	{
		gl.deleteVertexArray(vao_letters);
		vao_letters=null;
	}
	if(vao_rectangle)
	{
		gl.deleteVertexArray(vao_rectangle);
		vao_rectangle=null;
	}
	if(vbo_position_letters)
	{
		gl.deleteBuffer(vbo_position_letters);
		vbo_position_letters=null;
	}
	if(vbo_position_rectangle)
	{
		gl.deleteBuffer(vbo_position_rectangle);
		vbo_position_rectangle=null;
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