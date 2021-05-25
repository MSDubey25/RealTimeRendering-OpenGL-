//global variables
var canvas = null;
var gl = null; // webgl context
var bFullscreen = false;
var canvas_original_width;
var canvas_original_height;

//to start animation : to have requestAnimationFrame() to be called "cross-browser" compatible

var requestAnimationFrame = 
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ;


//to stop animation frame : to have cancelAnimationFrame() to be called "cross-browser" compatible
var cancelAnimationFrame = 
window.cancelAnimationFrame ||
window.webkitCancelRequestAnimationFrame || webkitCancelAnimationFrame || 
window.mozCancelRequestAnimationFrame || mozCancelAnimationFrame || 
window.oCancelRequestAnimationFrame || oCancelAnimationFrame || 
window.msCancelRequestAnimationFrame || msCancelAnimationFrame;

//when whole WebGLMacros is 'const', all inside it are automatically 'const'

const WebGLMacros = 
{
	AMC_ATTRIBUTE_VERTEX : 0,
	AMC_ATTRIBUTE_COLOR : 1,
	AMC_ATTRIBUTE_NORMAL : 2,
	AMC_ATTRIBUTE_TEXTURE0 : 3,
	AMC_ATTRIBUTE_VELOCITY: 4,
	AMC_ATTRIBUTE_POINTSIZE: 5,
	AMC_ATTRIBUTE_STARTTIME: 6,
};

var RRJ_vertexShaderObject_PS;
var RRJ_fragmentShaderObject_PS;
var RRJ_shaderProgramObject_PS;


var RRJ_vao_Points_PS;
var RRJ_vbo_Points_Position_PS;
var RRJ_vbo_Points_StartTime_PS;
var RRJ_vbo_Points_Velocity_PS;
var RRJ_vbo_Points_Size_PS;


var RRJ_mvpUniform_PS;
var RRJ_timeUniform_PS;

var RRJ_perspectiveProjectionMatrix_PS;
var RRJ_modelViewMatrix_PS;
var RRJ_modelViewProjectionMatrix_PS;


var RRJ_MAX_STARS_PS = 100000;



//onload function
function main()
{
	//get <canvas> element from HTML5
	//document is html page representative
	canvas = document.getElementById("AMC");
	if(!canvas)
		console.log("Obtaining canvas failed\n");
	else
		console.log("Obtaining canvas succeeded\n");
	
	canvas_original_width = canvas.width;
	canvas_original_height = canvas.height;
	
	//register keyboard's keydown event handler
	window.addEventListener("keydown", //default event listener
							keyDown, //our user defined listener
							false // capture parameter
							);
	window.addEventListener("click", //default event listener
							mouseDown, //our user defined listener
							false // capture parameter
							);
	window.addEventListener("resize", //default event listener
							resize, //our user defined listener
							false // capture parameter
							);
	//initialize WebGL
	init();
	
	//start drawing here as warming-up
	resize();
	draw();
}


function toggleFullscreen()
{
	
	//code
	var fullscreen_element = 
	document.fullscreenElement ||
	document.webkitFullscreenElement ||
	document.mozFullScreenElement ||
	document.msFullscreenElement ||
	null;
	
	//if not fullscreen
	if(fullscreen_element == null)
	{
		if(canvas.requestFullscreen)
			canvas.requestFullscreen();
		else if(canvas.mozRequestFullScreen)
				canvas.mozRequestFullScreen();
		else if(canvas.webkitRequestFullscreen)
				canvas.webkitRequestFullscreen();
		else if(canvas.msRequestFullscreen)
				canvas.msRequestFullscreen();
		bFullscreen = true;
	}
	else // if already fullscreen
	{
		if(document.exitFullscreen)
			document.exitFullscreen();
		else if(document.mozCancelFullScreen)
				document.mozCancelFullScreen();
		else if(document.webkitExitFullscreen)
				document.webkitExitFullscreen();
		else if(document.msExitFullscreen)
				document.msExitFullscreen();
		bFullscreen = false;
	}
}

function init()
{
	//code
	//get webGL 2.0 context
	gl = canvas.getContext("webgl2");
	if(gl == null) // failed to get context
	{
		console.log("Failed to get the rendering context for WebGL");
		return;
	}
	
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	
	//vertex shader
	var RRJ_vertexShaderSourceCode = 
	"#version 300 es"+
	"\n"+
	"in vec4 vPosition;"+
	"in vec4 vColor;" +
	"in vec3 vVelocity;" +
	"in float vSize;" +
	//"in float startTime;" +
	"out vec4 outColor;" +
	
	"uniform mat4 u_mvp_matrix;"+
	"uniform float u_time;" +
	"void main(void)"+
	"{"+
	
		"float t = u_time - vSize;" +	
		"vec4 vert = vPosition;" +
		"gl_PointSize = vSize;" + 
		"vert.z = vert.z + u_time;" +
		"gl_Position = u_mvp_matrix * vert;"+
		"outColor = vColor;" +
	"}";
	
	
	RRJ_vertexShaderObject_PS = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(RRJ_vertexShaderObject_PS, RRJ_vertexShaderSourceCode);
	gl.compileShader(RRJ_vertexShaderObject_PS);
	if(gl.getShaderParameter(RRJ_vertexShaderObject_PS, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(RRJ_vertexShaderObject_PS);
		if(error.length > 0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	//fragment shader
	var RRJ_fragmentShaderSourceCode = 
	"#version 300 es"+
	"\n"+
	"precision highp float;"+
	"in vec4 outColor;" +
	"out vec4 FragColor;"+
	"void main(void)"+
	"{"+
	"FragColor = outColor;"+
	"}";
	RRJ_fragmentShaderObject_PS = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(RRJ_fragmentShaderObject_PS, RRJ_fragmentShaderSourceCode);
	gl.compileShader(RRJ_fragmentShaderObject_PS);
	if(gl.getShaderParameter(RRJ_fragmentShaderObject_PS, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(RRJ_fragmentShaderObject_PS);
		if(error.length > 0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	//shader program
	RRJ_shaderProgramObject_PS = gl.createProgram();
	gl.attachShader(RRJ_shaderProgramObject_PS, RRJ_vertexShaderObject_PS);
	gl.attachShader(RRJ_shaderProgramObject_PS, RRJ_fragmentShaderObject_PS);
	
	
	//pre-link binding of shader program object with vertex shader attributes
	gl.bindAttribLocation(RRJ_shaderProgramObject_PS, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
	gl.bindAttribLocation(RRJ_shaderProgramObject_PS, WebGLMacros.AMC_ATTRIBUTE_COLOR, "vColor");
	gl.bindAttribLocation(RRJ_shaderProgramObject_PS, WebGLMacros.AMC_ATTRIBUTE_VELOCITY, "vVelocity");
	gl.bindAttribLocation(RRJ_shaderProgramObject_PS, WebGLMacros.AMC_ATTRIBUTE_POINTSIZE, "vSize");
	
	
	//linking
	gl.linkProgram(RRJ_shaderProgramObject_PS);
	if(gl.getProgramParameter(RRJ_shaderProgramObject_PS, gl.LINK_STATUS) == false)
	{
		var error = gl.getProgramInfoLog(RRJ_shaderProgramObject_PS);
		if(error.length > 0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	//get MVP uniform location
	RRJ_mvpUniform_PS = gl.getUniformLocation(RRJ_shaderProgramObject_PS, "u_mvp_matrix");
	RRJ_timeUniform_PS = gl.getUniformLocation(RRJ_shaderProgramObject_PS, "u_time");

	
	
	//vertices, colors, shader attribs, vbo, vao initialization
	var RRJ_points_Position = new Float32Array(RRJ_MAX_STARS_PS  * 3);
	var RRJ_points_Size = new Float32Array(RRJ_MAX_STARS_PS);
	
	
	fill_PointsData(RRJ_points_Position, RRJ_points_Size);
	
	
	RRJ_vao_Points_PS = gl.createVertexArray();
	gl.bindVertexArray(RRJ_vao_Points_PS);
	
		/********** Position **********/
		RRJ_vbo_Points_Position_PS = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Points_Position_PS);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_points_Position, gl.STATIC_DRAW);
		gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 
									3,
									gl.FLOAT,
									false,
									0, 0);
		gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		
		
		/********** Color **********/
		gl.vertexAttrib3f(WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.0, 1.0, 0.0);
		
		
		/********** Size **********/
		RRJ_vbo_Points_Size_PS = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Points_Size_PS);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_points_Size, gl.STATIC_DRAW);
		gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_POINTSIZE, 
									1,
									gl.FLOAT,
									false,
									0, 0);
		gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_POINTSIZE);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		
	gl.bindVertexArray(null);
	
		
	
	
	
	//set clear color
	gl.clearColor(0.0, 0.0, 0.0, 1.0); //blue
	
	//create and make identity projection matrix
	RRJ_perspectiveProjectionMatrix_PS = mat4.create();
	RRJ_modelViewMatrix_PS = mat4.create();
	RRJ_modelViewProjectionMatrix_PS = mat4.create();

}

function resize()
{
	//code
	if(bFullscreen == true)
	{
		//fullscreen chi width ani height mhnje innerWidth and innerHeight
		canvas.width = window.innerWidth; 
		canvas.height = window.innerHeight; 
		
	}
	else
	{		
		canvas.width = canvas_original_width; 
		canvas.height = canvas_original_height;		
	}
	
	//set the viewport to match
	gl.viewport(0, 0, canvas.width, canvas.height);
	
	//perspective  out, fovy, aspect, near, far
	
		mat4.perspective(RRJ_perspectiveProjectionMatrix_PS, 45.0, canvas.width/canvas.height, 0.1, 100.0);
	
}


var RRJ_MAX_STARS_PS = 0.0;
var RRJ_angle_points_PS = 0.0;
var RRJ_trans_PS = -200.0;

function draw()
{
	//code
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.useProgram(RRJ_shaderProgramObject_PS);
	
	
	
	RRJ_Space();
	
	
	//animation loop
	requestAnimationFrame(draw, canvas);
	
}


function RRJ_Space(){
	
	
	mat4.identity(RRJ_modelViewMatrix_PS);
	mat4.identity(RRJ_modelViewProjectionMatrix_PS);
	
	mat4.translate(RRJ_modelViewMatrix_PS, RRJ_modelViewMatrix_PS, [0.0, 0.0, RRJ_trans_PS]);
	mat4.rotateY(RRJ_modelViewMatrix_PS, RRJ_modelViewMatrix_PS, degToRad(RRJ_angle_points_PS));
	mat4.multiply(RRJ_modelViewProjectionMatrix_PS, RRJ_perspectiveProjectionMatrix_PS, RRJ_modelViewMatrix_PS);
	
	gl.uniformMatrix4fv(RRJ_mvpUniform_PS, false, RRJ_modelViewProjectionMatrix_PS);
	gl.uniform1f(RRJ_timeUniform_PS, RRJ_MAX_STARS_PS);
	
	gl.bindVertexArray(RRJ_vao_Points_PS);
	
		gl.drawArrays(gl.POINTS, 0, RRJ_MAX_STARS_PS);
	
	gl.bindVertexArray(null);
	
	

	
	RRJ_angle_points_PS += 0.05;
	if(RRJ_angle_points_PS > 360.0)
		RRJ_angle_points_PS = 0.0;
	

	
	RRJ_MAX_STARS_PS = RRJ_MAX_STARS_PS + 0.5;
}

function degToRad(angle){
	
	return((angle * Math.PI / 180.0));
	
}

function uninitialize()
{
	if(RRJ_vbo_Points_Size_PS){
		gl.deleteBuffer(RRJ_vbo_Points_Size_PS);
		RRJ_vbo_Points_Size_PS = 0;
	}
	



	if(RRJ_vbo_Points_Position_PS){
		gl.deleteBuffer(RRJ_vbo_Points_Position_PS);
		RRJ_vbo_Points_Position_PS = 0;
	}
	
	if(RRJ_vao_Points_PS){
		gl.deleteVertexArray(RRJ_vao_Points_PS);
		RRJ_vao_Points_PS = 0;
	}
	
	if(RRJ_shaderProgramObject_PS)
	{
		if(RRJ_fragmentShaderObject_PS)
		{
			gl.detachShader(RRJ_shaderProgramObject_PS, RRJ_fragmentShaderObject_PS);
			gl.deleteShader(RRJ_fragmentShaderObject_PS);
			RRJ_fragmentShaderObject_PS = null;
		}
		
		if(RRJ_vertexShaderObject_PS)
		{
			gl.detachShader(RRJ_shaderProgramObject_PS, RRJ_vertexShaderObject_PS);
			gl.deleteShader(RRJ_vertexShaderObject_PS);
			RRJ_vertexShaderObject_PS = null;
		}
		
		gl.deleteProgram(RRJ_shaderProgramObject_PS);
		RRJ_shaderProgramObject_PS = null;
	}

}

function keyDown(event)
{
	//code
	switch(event.keyCode)
	{
		case 27: // Escape
		//uninitialize
		uninitialize();
		//close application tab 
		window.close(); //firefox not working safari and chrome well works
		break;
		case 70: // for 'f' or 'F'
		toggleFullscreen();
		break;
	}
}

function mouseDown()
{
	//code
}


function fill_PointsData(pos, size){
	
	var index = 0;
	
		for(var i = 0; i < RRJ_MAX_STARS_PS; i++){
			
			pos[index] = Math.random() * 300.0 - 150.0;
			pos[index + 1] = Math.random() * 100.0 - 50.0;
			pos[index + 2] = Math.random() * 10000.0 - 5000.0;
	

			
			size[index] = Math.abs(Math.random() * 3.0 - 5.0);
			
			index = index + 3;
		}
	
	
}