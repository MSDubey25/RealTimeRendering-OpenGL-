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

var light_ambient_red=[0.0,0.0,0.0];
var light_diffuse_red=[1.0,0.0,0.0];
var light_specular_red=[1.0,0.0,0.0];
var light_position_red=[2.0,0.0,0.0,1.0];

var light_ambient_blue=[0.0,0.0,0.0];
var light_diffuse_blue=[0.0,0.0,1.0];
var light_specular_blue=[0.0,0.0,1.0];
var light_position_blue=[-2.0,0.0,0.0,1.0];

var material_ambient=[0.5,0.5,0.5];
var material_diffuse=[1.0,1.0,1.0];
var material_specular=[1.0,1.0,1.0];
var material_shininess=128.0;

var vao_pyramid;
var vbo_position_pyramid;
var vbo_normal_pyramid;


var perspectiveProjectionMatrix;
var modelMatrixUniform;
var viewMatrixUniform;
var projectionMatrixUniform;
var laRedUniform;
var ldRedUniform;
var lsRedUniform;
var lightPositionRedUniform;
var laBlueUniform;
var ldBlueUniform;
var lsBlueUniform;
var lightPositionBlueUniform;
var kaUniform;
var kdUniform;
var ksUniform;
var materialShininessUniform;
var isLkeyPressedUniform;
var angle=0.0;

var bLKeyPressed=false;
var bIsAnimation=false;
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
						"uniform vec4 u_lightPosition;" +
						"uniform vec4 u_lightPosition_blue;" +
						"uniform float u_LkeyIsPressed;" +
						"out vec3 light_direction;" +
						"out vec3 reflection_vector;" +
						"out vec3 light_direction_blue;" +
						"out vec3 reflection_vector_blue;" +
						"out vec3 viewer_vector;" +
						"out vec3 viewer_vector_blue;" +
						"out vec3 transformedNormal;" +
						"out vec3 white;" +
						"void main(void)" +
						"{" +
						"	if(u_LkeyIsPressed==1.0)" +
						"	{" +
						"		vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" +
						"		transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);" +
						"		light_direction=vec3(u_lightPosition-eyeCoordinates);" +
						"		reflection_vector=reflect(-light_direction,transformedNormal);" +
						"		viewer_vector=vec3(-eyeCoordinates);" +
						"		" +
						"		light_direction_blue=vec3(u_lightPosition_blue-eyeCoordinates);" +
						"		reflection_vector_blue=reflect(-light_direction_blue,transformedNormal);" +
						"		viewer_vector_blue=vec3(-eyeCoordinates);" +
						"	}" +
						"	else" +
						"	{" +
						"		white=vec3(1.0,1.0,1.0);" +
						"	}" +
						"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" +
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
							"in vec3 light_direction;" +
							"in vec3 reflection_vector;" +
							"in vec3 viewer_vector;" +
							"in vec3 light_direction_blue;" +
							"in vec3 reflection_vector_blue;" +
							"in vec3 viewer_vector_blue;" +
							"in vec3 transformedNormal;" +
							"in vec3 white;" +
							"uniform vec3 u_la;" +
							"uniform vec3 u_ld;" +
							"uniform vec3 u_ls;" +
							"uniform vec3 u_la_blue;" +
							"uniform vec3 u_ld_blue;" +
							"uniform vec3 u_ls_blue;" +
							"uniform vec3 u_ka;" +
							"uniform vec3 u_kd;" +
							"uniform vec3 u_ks;" +
							"uniform float u_materialShininess;" +
							"uniform float u_LkeyIsPressed;" +
							"out vec4 FragColor;" +
							"void main(void)" +
							"{" +
							"	if(u_LkeyIsPressed==1.0)" +
							"	{" +
							"		vec3 normalized_tNormal=normalize(transformedNormal);" +
							"		vec3 normalized_light_direction=normalize(light_direction);" +
							"		vec3 normalized_reflection_vector=normalize(reflection_vector);" +
							"		vec3 normalized_viewer_vector=normalize(viewer_vector);" +
							"		vec3 normalized_light_direction_blue=normalize(light_direction_blue);" +
							"		vec3 normalized_reflection_vector_blue=normalize(reflection_vector_blue);" +
							"		vec3 normalized_viewer_vector_blue=normalize(viewer_vector_blue);" +
							"		" +
							"		float tn_dot_lightdirection=max(dot(normalized_light_direction,normalized_tNormal),0.0f);" +
							"		vec3 ambient=u_la*u_ka;" +
							"		vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;" +
							"		vec3 specular=u_ls*u_ks*pow(max(dot(normalized_reflection_vector,normalized_viewer_vector),0.0f),u_materialShininess);" +
							"		vec3 phong_ads_light=ambient+diffuse+specular;" +
							"		" +
							"		tn_dot_lightdirection=max(dot(normalized_light_direction_blue,normalized_tNormal),0.0f);" +
							"		ambient=u_la_blue*u_ka;" +
							"		diffuse=u_ld_blue*u_kd*tn_dot_lightdirection;" +
							"		specular=u_ls_blue*u_ks*pow(max(dot(normalized_reflection_vector_blue,normalized_viewer_vector),0.0f),u_materialShininess);" +
							"		phong_ads_light=phong_ads_light+(ambient+diffuse+specular);" +
							"		FragColor=vec4(phong_ads_light,1.0);" +
							"	}" +
							"	else" +
							"	{" +
							"		FragColor=vec4(white,1.0);" +
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
	laRedUniform = gl.getUniformLocation(shaderProgramObject, "u_la");
	ldRedUniform = gl.getUniformLocation(shaderProgramObject, "u_ld");
	lsRedUniform = gl.getUniformLocation(shaderProgramObject, "u_ls");
	lightPositionRedUniform = gl.getUniformLocation(shaderProgramObject, "u_lightPosition");
	laBlueUniform = gl.getUniformLocation(shaderProgramObject, "u_la_blue");
	ldBlueUniform = gl.getUniformLocation(shaderProgramObject, "u_ld_blue");
	lsBlueUniform = gl.getUniformLocation(shaderProgramObject, "u_ls_blue");
	lightPositionBlueUniform = gl.getUniformLocation(shaderProgramObject, "u_lightPosition_blue");
	kaUniform = gl.getUniformLocation(shaderProgramObject, "u_ka");
	kdUniform = gl.getUniformLocation(shaderProgramObject, "u_kd");
	ksUniform = gl.getUniformLocation(shaderProgramObject, "u_ks");
	materialShininessUniform = gl.getUniformLocation(shaderProgramObject, "u_materialShininess");
	
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
	var pyramidNormals=new Float32Array([0.0, 0.447214, 0.894427,//front
								0.0, 0.447214, 0.894427,//front
								0.0, 0.447214, 0.894427,//front
								0.894427, 0.447214, 0.0,//right
								0.894427, 0.447214, 0.0,//right
								0.894427, 0.447214, 0.0,//right
								0.0, 0.447214, -0.894427,//back
								0.0, 0.447214, -0.894427,//back
								0.0, 0.447214, -0.894427,//back
								-0.894427, 0.447214, 0.0,//left
								- 0.894427, 0.447214, 0.0,//left
								- 0.894427, 0.447214, 0.0//left
								]);
	//for triangle
	vao_pyramid=gl.createVertexArray();
	gl.bindVertexArray(vao_pyramid);
	vbo_position_pyramid=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position_pyramid);
	gl.bufferData(gl.ARRAY_BUFFER,pyramidVertices,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//for triangle normals
	vbo_normal_pyramid=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_normal_pyramid);
	gl.bufferData(gl.ARRAY_BUFFER,pyramidNormals,gl.STATIC_DRAW);
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
		gl.uniform3fv(laRedUniform,light_ambient_red);
		gl.uniform3fv(ldRedUniform,light_diffuse_red);
		gl.uniform3fv(lsRedUniform,light_specular_red);
		gl.uniform4fv(lightPositionRedUniform,light_position_red);
		gl.uniform3fv(laBlueUniform,light_ambient_blue);
		gl.uniform3fv(ldBlueUniform,light_diffuse_blue);
		gl.uniform3fv(lsBlueUniform,light_specular_blue);
		gl.uniform4fv(lightPositionBlueUniform,light_position_blue);
		gl.uniform3fv(kaUniform,material_ambient);
		gl.uniform3fv(kdUniform,material_diffuse);
		gl.uniform3fv(ksUniform,material_specular);
		gl.uniform1f(materialShininessUniform,material_shininess);
	}
	else
	{
		gl.uniform1f(LKeyPressedUniform,0.0);
	}
	var modelMatrix=mat4.create();
	var viewMatrix=mat4.create();
	
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-4.0]);
	if(bIsAnimation==true)
	{
		mat4.rotateY(modelMatrix,modelMatrix,angle*Math.PI/180.0);
	}
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	gl.bindVertexArray(vao_pyramid);
	gl.drawArrays(gl.TRIANGLES,0,12);
	gl.bindVertexArray(null);
	if(angle<=360.0)
		angle=angle+0.5;
	else
		angle=0.0;
	//animation loop
	requestAnimationFrame(draw,canvas);
}
function uninitialize()
{
	if(vao_pyramid)
	{
		gl.deleteVertexArray(vao_pyramid);
		vao_pyramid=null;
	}
	if(vbo_position_pyramid)
	{
		gl.deleteVertexArray(vbo_position_pyramid);
		vbo_position_pyramid=null;
	}
	if(vbo_normal_pyramid)
	{
		gl.deleteVertexArray(vbo_normal_pyramid);
		vbo_normal_pyramid=null;
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
			case 65: //for 'A' or 'a'
				if(bIsAnimation==false)
					bIsAnimation=true;
				else
					bIsAnimation=false;
				break;
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