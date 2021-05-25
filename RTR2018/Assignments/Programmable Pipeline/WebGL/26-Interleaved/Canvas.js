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
var rectangle_texture;
var samplerUniform;

var modelMatrixUniform;
var viewMatrixUniform;
var projectionMatrixUniform;
var laUniform;
var ldUniform;
var lsUniform;
var kdaUniform;
var kdUniform;
var ksUniform;
var lightPositionUniform;
var LKeyPressedUniform;
var materialShininess;

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
		"in vec4 vPosition;" +
		"in vec3 vNormal;" +
		"in vec4 vColor;" +
		"in vec2 vTexCoord;" +
		"uniform mat4 u_m_matrix;" +
		"uniform mat4 u_v_matrix;" +
		"uniform mat4 u_p_matrix;" +
		"uniform vec4 u_lightPosition;" +
		"uniform float u_LkeyIsPressed;" +
		"out vec3 light_direction;" +
		"out vec3 reflection_vector;" +
		"out vec3 viewer_vector;" +
		"out vec3 transformedNormal;" +
		"out vec3 white;" +
		"out vec4 out_vColor;" +
		"out vec2 out_TexCoord;" +
		"void main(void)" +
		"{" +
		"	if(u_LkeyIsPressed==1.0)" +
		"	{" +
		"		vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" +
		"		mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" +
		"		transformedNormal=normalMatrix*vNormal;" +
		"		light_direction=vec3(u_lightPosition-eyeCoordinates);" +
		"		reflection_vector=reflect(-light_direction,transformedNormal);" +
		"		viewer_vector=vec3(-eyeCoordinates);" +
		"		" +
		"	}" +
		"	else" +
		"	{" +
		"		white=vec3(1.0,1.0,1.0);" +
		"	}" +
		"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" +
		"out_vColor=vColor;" +
		"out_TexCoord=vTexCoord;" +
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
		"in vec2 out_TexCoord;" +
		"in vec3 light_direction;" +
		"in vec3 reflection_vector;" +
		"in vec3 viewer_vector;" +
		"in vec3 transformedNormal;" +
		"in vec3 white;" +
		"in vec4 out_vColor;" +
		"uniform sampler2D u_sampler;" +
		"uniform vec3 u_la;" +
		"uniform vec3 u_ld;" +
		"uniform vec3 u_ls;" +
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
		"		" +
		"		float tn_dot_lightdirection=max(dot(normalized_light_direction,normalized_tNormal),0.0f);" +
		"		vec3 ambient=u_la*u_ka;" +
		"		vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;" +
		"		vec3 specular=u_ls*u_ks*pow(max(dot(normalized_reflection_vector,normalized_viewer_vector),0.0f),u_materialShininess);" +
		"		vec3 phong_ads_light=ambient+diffuse+specular;" +
		"		vec4 texture=texture(u_sampler,out_TexCoord);" +
		"		FragColor=vec4(vec3(out_vColor*texture)*phong_ads_light,1.0);" +
		/*"		FragColor=out_vColor;" \*/
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
	gl.bindAttribLocation(shaderProgramObject,WebGlMacros.AMC_ATTRIBUTE_COLOR,"vColor");
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
	modelMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_m_matrix");
	viewMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_v_matrix");
	projectionMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_p_matrix");
	LKeyPressedUniform=gl.getUniformLocation(shaderProgramObject,"u_LkeyIsPressed");
	laUniform=gl.getUniformLocation(shaderProgramObject,"u_la");
	ldUniform=gl.getUniformLocation(shaderProgramObject,"u_ld");
	lsUniform=gl.getUniformLocation(shaderProgramObject,"u_ls");
	kaUniform=gl.getUniformLocation(shaderProgramObject,"u_ka");
	kdUniform=gl.getUniformLocation(shaderProgramObject,"u_kd");
	ksUniform=gl.getUniformLocation(shaderProgramObject,"u_ks");
	lightPositionUniform=gl.getUniformLocation(shaderProgramObject,"u_lightPosition");
	materialShininess=gl.getUniformLocation(shaderProgramObject,"u_materialShininess");
	
	var VCNT=new Float32Array([
		-1.0, 1.0, -1.0,1.0,0.0,0.0,0.0, 1.0, 0.0,0.0,1.0,
		-1.0, 1.0,  1.0,1.0,0.0,0.0,0.0, 1.0, 0.0,0.0,0.0,
		 1.0, 1.0,  1.0,1.0,0.0,0.0,0.0, 1.0, 0.0,1.0,0.0,
		 1.0, 1.0, -1.0,1.0,0.0,0.0,0.0, 1.0, 0.0,1.0,1.0,
		-1.0,-1.0, -1.0,0.0,0.0,1.0,0.0,-1.0, 0.0,1.0,1.0,
		-1.0, -1.0, 1.0,0.0,0.0,1.0,0.0,-1.0, 0.0,0.0,1.0,
		 1.0, -1.0, 1.0,0.0,0.0,1.0,0.0,-1.0, 0.0,0.0,0.0,
		 1.0, -1.0,-1.0,0.0,0.0,1.0,0.0,-1.0, 0.0,1.0,0.0,
		 1.0, 1.0,  1.0,0.0,1.0,0.0,0.0, 0.0, 1.0,0.0,0.0,
		-1.0, 1.0,  1.0,0.0,1.0,0.0,0.0, 0.0, 1.0,1.0,0.0,
		-1.0, -1.0, 1.0,0.0,1.0,0.0,0.0, 0.0, 1.0,1.0,1.0,
		 1.0, -1.0, 1.0,0.0,1.0,0.0,0.0, 0.0, 1.0,0.0,1.0,
		-1.0, 1.0, -1.0,0.0,1.0,1.0,0.0, 0.0,-1.0,1.0,0.0,
		 1.0, 1.0, -1.0,0.0,1.0,1.0,0.0, 0.0,-1.0,1.0,1.0,
		 1.0, -1.0,-1.0,0.0,1.0,1.0,0.0, 0.0,-1.0,0.0,1.0,
		-1.0, -1.0,-1.0,0.0,1.0,1.0,0.0, 0.0,-1.0,0.0,0.0,
		 1.0, 1.0, -1.0,1.0,0.0,1.0,1.0, 0.0, 0.0,1.0,0.0,
		 1.0, 1.0,  1.0,1.0,0.0,1.0,1.0, 0.0, 0.0,1.0,1.0,
		 1.0, -1.0, 1.0,1.0,0.0,1.0,1.0, 0.0, 0.0,0.0,1.0,
		 1.0, -1.0,-1.0,1.0,0.0,1.0,1.0, 0.0, 0.0,0.0,0.0,
		-1.0, 1.0,  1.0,1.0,1.0,0.0,-1.0, 0.0,0.0,0.0,0.0,
		-1.0, 1.0, -1.0,1.0,1.0,0.0,-1.0, 0.0,0.0,1.0,0.0,
		-1.0, -1.0,-1.0,1.0,1.0,0.0,-1.0, 0.0,0.0,1.0,1.0,
		-1.0, -1.0, 1.0,1.0,1.0,0.0,-1.0, 0.0,0.0,0.0,1.0
	]);
	vao_cube=gl.createVertexArray();
	gl.bindVertexArray(vao_cube);
	vbo_cube_position=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_cube_position);
	gl.bufferData(gl.ARRAY_BUFFER,VCNT,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_POSITION,3,gl.FLOAT,false,11*4,(0*4));
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_POSITION);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,11*4, (3*4));
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_COLOR);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_NORMAL,3,gl.FLOAT,false,11*4,(6*4));
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_NORMAL);
	gl.vertexAttribPointer(WebGlMacros.AMC_ATTRIBUTE_TEXTURE,2,gl.FLOAT,false,11*4,(9*4));
	gl.enableVertexAttribArray(WebGlMacros.AMC_ATTRIBUTE_TEXTURE);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindVertexArray(null);
	  gl.enable(gl.DEPTH_TEST);
	//  gl.enable(gl.CULL_FACE);
	  gl.depthFunc(gl.LEQUAL);
	rectangle_texture=gl.createTexture();
	rectangle_texture.image=new Image();
	rectangle_texture.image.src="marble.png";
	rectangle_texture.image.onload=function(){
		gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,rectangle_texture.image);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D,null);
	}
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
		gl.uniform3f(laUniform,0.25,0.25,0.25);
		gl.uniform3f(ldUniform,1.0,1.0,1.0);
		gl.uniform3f(lsUniform,1.0,1.0,1.0);
		gl.uniform3f(kaUniform,0.5,0.5,0.5);
		gl.uniform3f(kdUniform,1.0,1.0,1.0);
		gl.uniform3f(ksUniform,1.0,1.0,1.0);
		gl.uniform1f(materialShininess,128.0);
		var lightPosition=[-2.0,0.0,0.0,1.0];
		gl.uniform4fv(lightPositionUniform,lightPosition);
	}
	else
	{
		gl.uniform1f(LKeyPressedUniform,0.0);
	}
	var modelMatrix=mat4.create();
	var viewMatrix=mat4.create();
	
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-4.0]);
	//mat4.multiply(modelViewMatrix,modelViewMatrix,translationMatrix);
	mat4.rotateX(modelMatrix,modelMatrix,angleCube*Math.PI/180.0);
	mat4.rotateY(modelMatrix,modelMatrix,angleCube*Math.PI/180.0);
	mat4.rotateZ(modelMatrix,modelMatrix,angleCube*Math.PI/180.0);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(samplerUniform,0);
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
		gl.deleteVertexArray(vbo_cube_position);
		vbo_cube_position=null;
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