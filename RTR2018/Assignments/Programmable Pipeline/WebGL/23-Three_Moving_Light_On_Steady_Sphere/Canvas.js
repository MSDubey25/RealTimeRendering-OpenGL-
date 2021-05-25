//global variables
var canvas=null;
var gl=null;
var bFullscreen=false;
var canvas_original_width;
var canvas_original_height;
var bIsVertex=true;
var bIstoggleVertexFragment=false;
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
var light_position_red=[0.0,0.0,0.0,1.0];

var light_ambient_green=[0.0,0.0,0.0];
var light_diffuse_green=[0.0,1.0,0.0];
var light_specular_green=[0.0,1.0,0.0];
var light_position_green=[0.0,0.0,0.0,1.0];

var light_ambient_blue=[0.0,0.0,0.0];
var light_diffuse_blue=[0.0,0.0,1.0];
var light_specular_blue=[0.0,0.0,1.0];
var light_position_blue=[0.0,0.0,0.0,1.0];

var material_ambient=[0.5,0.5,0.5];
var material_diffuse=[1.0,1.0,1.0];
var material_specular=[1.0,1.0,1.0];
var material_shininess=128.0;

var sphere=null;

var perspectiveProjectionMatrix;
var modelMatrixUniform;
var viewMatrixUniform;
var projectionMatrixUniform;
var laUniform_red;
var ldUniform_red;
var lsUniform_red;
var lightPositionUniform_red;
var laUniform_blue;
var ldUniform_blue;
var lsUniform_blue;
var lightPositionUniform_blue;
var laUniform_green;
var ldUniform_green;
var lsUniform_green;
var lightPositionUniform_green;
var kaUniform;
var kdUniform;
var ksUniform;
var materialShininessUniform;

var LKeyPressedUniform;
var angle=0.0;
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
function toggleVertexFragment()
{
	var vertexShaderSourceCodePerVertex = "#version 300 es"+
						"\n"+
						"in vec4 vPosition;" +
						"in vec3 vNormal;" +
						"uniform mat4 u_m_matrix;" +
						"uniform mat4 u_v_matrix;" +
						"uniform mat4 u_p_matrix;" +
						"uniform vec3 u_la_red;" +
						"uniform vec3 u_ld_red;" +
						"uniform vec3 u_ls_red;" +
						"uniform vec4 u_lightPosition_red;" +
						"uniform vec3 u_la_blue;" +
						"uniform vec3 u_ld_blue;" +
						"uniform vec3 u_ls_blue;" +
						"uniform vec4 u_lightPosition_blue;" +
						"uniform vec3 u_la_green;" +
						"uniform vec3 u_ld_green;" +
						"uniform vec3 u_ls_green;" +
						"uniform vec4 u_lightPosition_green;" +
						"uniform vec3 u_ka;" +
						"uniform vec3 u_kd;" +
						"uniform vec3 u_ks;" +
						"uniform float u_materialShininess;" +
						"uniform float u_LkeyIsPressed;" +
						"out vec3 phong_ads_light;" +
						"void main(void)" +
						"{" +
						"	if(u_LkeyIsPressed==1.0)" +
						"	{" +
						"		vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" +
						"		mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" +
						"		vec3 transformedNormal=normalize(normalMatrix*vNormal);" +
						/*"		vec3 transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);" \*/
						"		vec3 light_direction_red=normalize(vec3(u_lightPosition_red-eyeCoordinates));" +
						"		float tn_dot_lightdirection_red=max(dot(light_direction_red,transformedNormal),0.0f);" +
						"		vec3 reflection_vector_red=reflect(-light_direction_red,transformedNormal);" +
						"		vec3 light_direction_blue=normalize(vec3(u_lightPosition_blue-eyeCoordinates));" +
						"		float tn_dot_lightdirection_blue=max(dot(light_direction_blue,transformedNormal),0.0f);" +
						"		vec3 reflection_vector_blue=reflect(-light_direction_blue,transformedNormal);" +
						"		vec3 light_direction_green=normalize(vec3(u_lightPosition_green-eyeCoordinates));" +
						"		float tn_dot_lightdirection_green=max(dot(light_direction_green,transformedNormal),0.0f);" +
						"		vec3 reflection_vector_green=reflect(-light_direction_green,transformedNormal);" +
						"		vec3 viewer_vector=normalize(vec3(-eyeCoordinates));" +
						"		vec3 ambient=u_la_red*u_ka;" +
						"		vec3 diffuse=u_ld_red*u_kd*tn_dot_lightdirection_red;" +
						"		vec3 specular=u_ls_red*u_ks*pow(max(dot(reflection_vector_red,viewer_vector),0.0f),u_materialShininess);" +
						"		phong_ads_light=ambient+diffuse+specular;" +
						"		ambient=u_la_blue*u_ka;" +
						"		diffuse=u_ld_blue*u_kd*tn_dot_lightdirection_blue;" +
						"		specular=u_ls_blue*u_ks*pow(max(dot(reflection_vector_blue,viewer_vector),0.0f),u_materialShininess);" +
						"		phong_ads_light=phong_ads_light+(ambient+diffuse+specular);" +
						"		ambient=u_la_green*u_ka;" +
						"		diffuse=u_ld_green*u_kd*tn_dot_lightdirection_green;" +
						"		specular=u_ls_green*u_ks*pow(max(dot(reflection_vector_green,viewer_vector),0.0f),u_materialShininess);" +
						"		phong_ads_light=phong_ads_light+(ambient+diffuse+specular);" +
						"	}" +
						"	else" +
						"	{" +
						"		phong_ads_light=vec3(1.0,1.0,1.0);" +
						"	}" +
						"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" +
						"}";
	
	var vertexShaderSourceCodePerFragment = "#version 300 es"+
						"\n"+
						"in vec4 vPosition;" +
						"in vec3 vNormal;" +
						"uniform mat4 u_m_matrix;" +
						"uniform mat4 u_v_matrix;" +
						"uniform mat4 u_p_matrix;" +
						"uniform vec4 u_lightPosition_red;" +
						"uniform vec4 u_lightPosition_blue;" +
						"uniform vec4 u_lightPosition_green;" +
						"uniform float u_LkeyIsPressed;" +
						"out vec3 light_direction_red;" +
						"out vec3 light_direction_blue;" +
						"out vec3 light_direction_green;" +
						"out vec3 reflection_vector_red;" +
						"out vec3 reflection_vector_blue;" +
						"out vec3 reflection_vector_green;" +
						"out vec3 viewer_vector;" +
						"out vec3 transformedNormal;" +
						"out vec3 white;" +
						"void main(void)" +
						"{" +
						"	if(u_LkeyIsPressed==1.0)" +
						"	{" +
						"		vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" +
						"		mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" +
						"		transformedNormal=normalMatrix*vNormal;" +
						"		light_direction_red=vec3(u_lightPosition_red-eyeCoordinates);" +
						"		reflection_vector_red=reflect(-light_direction_red,transformedNormal);" +
						"		light_direction_blue=vec3(u_lightPosition_blue-eyeCoordinates);" +
						"		reflection_vector_blue=reflect(-light_direction_blue,transformedNormal);" +
						"		light_direction_green=vec3(u_lightPosition_green-eyeCoordinates);" +
						"		reflection_vector_green=reflect(-light_direction_green,transformedNormal);" +
						"		viewer_vector=vec3(-eyeCoordinates);" +
						"	}" +
						"	else" +
						"	{" +
						"		white=vec3(1.0,1.0,1.0);" +
						"	}" +
						"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" +
						"}";
	vertexShaderObject=gl.createShader(gl.VERTEX_SHADER);
	if(bIsVertex==true)
	{
		gl.shaderSource(vertexShaderObject,vertexShaderSourceCodePerVertex);
	}
	else
	{
		gl.shaderSource(vertexShaderObject,vertexShaderSourceCodePerFragment);
	}
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
	
	var fragmentShaderSourceCodePerVertex=
							"#version 300 es"+
							"\n"+
							"precision highp float;"+
							"in vec3 phong_ads_light;" +
							"uniform float u_LkeyIsPressed;" +
							"out vec4 FragColor;" +
							"void main(void)" +
							"{" +
							"	if(u_LkeyIsPressed==1.0)" +
							"	{" +
							"		FragColor=vec4(phong_ads_light,1.0);" +
							"	}" +
							"	else" +
							"	{" +
							"		FragColor=vec4(1.0,1.0,1.0,1.0);" +
							"	}" +
							"}";
	
	var fragmentShaderSourceCodePerFragment="#version 300 es"+
							"\n"+
							"precision highp float;"+
							"in vec3 light_direction_red;" +
							"in vec3 light_direction_blue;" +
							"in vec3 light_direction_green;" +
							"in vec3 reflection_vector_red;" +
							"in vec3 reflection_vector_blue;" +
							"in vec3 reflection_vector_green;" +
							"in vec3 viewer_vector;" +
							"in vec3 transformedNormal;" +
							"in vec3 white;" +
							"uniform vec3 u_la_red;" +
							"uniform vec3 u_ld_red;" +
							"uniform vec3 u_ls_red;" +
							"uniform vec3 u_la_blue;" +
							"uniform vec3 u_ld_blue;" +
							"uniform vec3 u_ls_blue;" +
							"uniform vec3 u_la_green;" +
							"uniform vec3 u_ld_green;" +
							"uniform vec3 u_ls_green;" +
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
							"		vec3 normalized_light_direction_red=normalize(light_direction_red);" +
							"		vec3 normalized_reflection_vector_red=normalize(reflection_vector_red);" +
							"		vec3 normalized_light_direction_blue=normalize(light_direction_blue);" +
							"		vec3 normalized_reflection_vector_blue=normalize(reflection_vector_blue);" +
							"		vec3 normalized_light_direction_green=normalize(light_direction_green);" +
							"		vec3 normalized_reflection_vector_green=normalize(reflection_vector_green);" +
							"		vec3 normalized_viewer_vector=normalize(viewer_vector);" +
							"		float tn_dot_lightdirection_red=max(dot(normalized_light_direction_red,normalized_tNormal),0.0f);" +
							"		float tn_dot_lightdirection_blue=max(dot(normalized_light_direction_blue,normalized_tNormal),0.0f);" +
							"		float tn_dot_lightdirection_green=max(dot(normalized_light_direction_green,normalized_tNormal),0.0f);" +
							"		vec3 ambient=u_la_red*u_ka+u_la_blue*u_ka+u_la_green*u_ka;" +
							"		vec3 diffuse=u_ld_red*u_kd*tn_dot_lightdirection_red+u_ld_blue*u_kd*tn_dot_lightdirection_blue+u_ld_green*u_kd*tn_dot_lightdirection_green;" +
							"		vec3 specular=u_ls_red*u_ks*pow(max(dot(normalized_reflection_vector_red,normalized_viewer_vector),0.0f),u_materialShininess)+u_ls_blue*u_ks*pow(max(dot(normalized_reflection_vector_blue,normalized_viewer_vector),0.0f),u_materialShininess)+u_ls_green*u_ks*pow(max(dot(normalized_reflection_vector_green,normalized_viewer_vector),0.0f),u_materialShininess);" +
							"		vec3 phong_ads_light=ambient+diffuse+specular;" +
							"		FragColor=vec4(phong_ads_light,1.0);" +
							"	}" +
							"	else" +
							"	{" +
							"		FragColor=vec4(white,1.0);" +
							"	}" +
							"}";
	fragmentShaderObject=gl.createShader(gl.FRAGMENT_SHADER);
	if(bIsVertex==true)
	{
		gl.shaderSource(fragmentShaderObject,fragmentShaderSourceCodePerVertex);
	}
	else
	{
		gl.shaderSource(fragmentShaderObject,fragmentShaderSourceCodePerFragment);
	}
	//gl.shaderSource(fragmentShaderObject,fragmentShaderSourceCode);
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
	laUniform_red = gl.getUniformLocation(shaderProgramObject, "u_la_red");
	ldUniform_red = gl.getUniformLocation(shaderProgramObject, "u_ld_red");
	lsUniform_red = gl.getUniformLocation(shaderProgramObject, "u_ls_red");
	lightPositionUniform_red = gl.getUniformLocation(shaderProgramObject, "u_lightPosition_red");
	laUniform_blue = gl.getUniformLocation(shaderProgramObject, "u_la_blue");
	ldUniform_blue = gl.getUniformLocation(shaderProgramObject, "u_ld_blue");
	lsUniform_blue = gl.getUniformLocation(shaderProgramObject, "u_ls_blue");
	lightPositionUniform_blue = gl.getUniformLocation(shaderProgramObject, "u_lightPosition_blue");
	laUniform_green = gl.getUniformLocation(shaderProgramObject, "u_la_green");
	ldUniform_green = gl.getUniformLocation(shaderProgramObject, "u_ld_green");
	lsUniform_green = gl.getUniformLocation(shaderProgramObject, "u_ls_green");
	lightPositionUniform_green = gl.getUniformLocation(shaderProgramObject, "u_lightPosition_green");
	kaUniform = gl.getUniformLocation(shaderProgramObject, "u_ka");
	kdUniform = gl.getUniformLocation(shaderProgramObject, "u_kd");
	ksUniform = gl.getUniformLocation(shaderProgramObject, "u_ks");
	materialShininessUniform = gl.getUniformLocation(shaderProgramObject, "u_materialShininess");
	
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
	
	toggleVertexFragment();	
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
		
		light_position_red[0] = 0.0;
		light_position_red[1] = 100.0*Math.sin(angle);
		light_position_red[2] = 100.0*Math.cos(angle);
		light_position_red[3] = 1.0;
		gl.uniform3fv(laUniform_red,light_ambient_red);
		gl.uniform3fv(ldUniform_red,light_diffuse_red);
		gl.uniform3fv(lsUniform_red,light_specular_red);
		gl.uniform4fv(lightPositionUniform_red,light_position_red);
		
		light_position_blue[0] = 100.0*Math.sin(angle);
		light_position_blue[1] = 0.0;
		light_position_blue[2] = 100.0*Math.cos(angle);
		light_position_blue[3] = 1.0;
		gl.uniform3fv(laUniform_blue,light_ambient_blue);
		gl.uniform3fv(ldUniform_blue,light_diffuse_blue);
		gl.uniform3fv(lsUniform_blue,light_specular_blue);
		gl.uniform4fv(lightPositionUniform_blue,light_position_blue);
		
		light_position_green[0] = 100.0*Math.sin(angle);
		light_position_green[1] = 100.0*Math.cos(angle);
		light_position_green[2] = 0.0;
		light_position_green[3] = 1.0;
		gl.uniform3fv(laUniform_green,light_ambient_green);
		gl.uniform3fv(ldUniform_green,light_diffuse_green);
		gl.uniform3fv(lsUniform_green,light_specular_green);
		gl.uniform4fv(lightPositionUniform_green, light_position_green);
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
	
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-6.0]);

	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);

	sphere.draw();
	if (angle >= 360.0)
		angle = 0.0;
	else
		angle += 0.01;
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
			case 32://Escape
				toggleFullScreen();
				break;
			case 70: //for 'F' or 'f'
				if(bIsVertex==true)
					bIsVertex=false;
				toggleVertexFragment();
				break;
			case 81: //for 'Q' or 'q'
				uninitialize();
				window.close();
				break;
			case 86: //for 'V' or 'v'
				if(bIsVertex==false)
					bIsVertex=true;
				toggleVertexFragment();
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