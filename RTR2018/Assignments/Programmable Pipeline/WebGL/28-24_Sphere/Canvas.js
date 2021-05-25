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

var light_ambient=[0.0,0.0,0.0];
var light_diffuse=[1.0,1.0,1.0];
var light_specular=[1.0,1.0,1.0];
var light_position=[0.0,0.0,0.0,1.0];

var material_ambient=[0.0,0.0,0.0];
var material_diffuse=[1.0,1.0,1.0];
var material_specular=[1.0,1.0,1.0];
var material_shininess=128.0;

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

var keyPress=0;
var angleOfXRotation = 0.0;
var angleOfYRotation = 0.0;
var angleOfZRotation = 0.0;

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
						"in vec4 vPosition;"+
						"in vec3 vNormal;" +
						"uniform mat4 u_m_matrix;"+
						"uniform mat4 u_v_matrix;"+
						"uniform mat4 u_p_matrix;"+
						"uniform vec3 u_la;"+
						"uniform vec3 u_ld;"+
						"uniform vec3 u_ls;"+
						"uniform vec4 u_lightPosition;"+
						"uniform vec3 u_ka;"+
						"uniform vec3 u_kd;"+
						"uniform vec3 u_ks;"+
						"uniform float u_materialShininess;"+
						"uniform float u_LkeyIsPressed;"+
						"out vec3 phong_ads_light;"+
						"void main(void)"+
						"{"+
						"	if(u_LkeyIsPressed==1.0)"+
						"	{"+
						"		vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;"+
						/*"		mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));"+
						"		vec3 transformedNormal=normalize(normalMatrix*vNormal);"+*/
						"		vec3 transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);"+
						"		vec3 light_direction=normalize(vec3(u_lightPosition-eyeCoordinates));"+
						"		float tn_dot_lightdirection=max(dot(light_direction,transformedNormal),0.0f);"+
						"		vec3 reflection_vector=reflect(-light_direction,transformedNormal);"+
						"		vec3 viewer_vector=normalize(vec3(-eyeCoordinates));"+
						"		vec3 ambient=u_la*u_ka;"+
						"		vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;"+
						"		vec3 specular=u_ls*u_ks*pow(max(dot(reflection_vector,viewer_vector),0.0f),u_materialShininess);"+
						"		phong_ads_light=ambient+diffuse+specular;"+
						"	}"+
						"	else"+
						"	{"+
						"		phong_ads_light=vec3(1.0,1.0,1.0);"+
						"	}"+
						"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;"+
						"}";
	
	var vertexShaderSourceCodePerFragment = "#version 300 es"+
						"\n"+
						"in vec4 vPosition;"+
						"in vec3 vNormal;" +
						"uniform mat4 u_m_matrix;"+
						"uniform mat4 u_v_matrix;"+
						"uniform mat4 u_p_matrix;"+
						"uniform vec4 u_lightPosition;"+
						"uniform vec3 u_la;"+
						"uniform vec3 u_ld;"+
						"uniform vec3 u_ls;"+
						"uniform vec3 u_ka;"+
						"uniform vec3 u_kd;"+
						"uniform vec3 u_ks;"+
						"uniform float u_materialShininess;"+
						"out vec3 light_direction;"+
						"out vec3 reflection_vector;"+
						"out vec3 viewer_vector;"+
						"out vec3 transformedNormal;"+
						"out vec3 white;"+
						"uniform float u_LkeyIsPressed;"+
						"void main(void)"+
						"{"+
						"	if(u_LkeyIsPressed==1.0)"+
						"	{"+
						"		vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;"+
						"		mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));"+
						"		transformedNormal=normalMatrix*vNormal;"+
						"		light_direction=vec3(u_lightPosition-eyeCoordinates);"+
						"		reflection_vector=reflect(-light_direction,transformedNormal);"+
						"		viewer_vector=vec3(-eyeCoordinates);"+
						"	}"+
						"	else"+
						"	{"+
						"		white=vec3(1.0,1.0,1.0);"+
						"	}"+
						"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;"+
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
							"uniform float u_LkeyIsPressed;" +
							"in vec3 phong_ads_light;"+
							"out vec4 FragColor;"+
							"void main(void)"+
							"{"+
							"	if(u_LkeyIsPressed==1.0)"+
							"	{"+
							"		FragColor=vec4(phong_ads_light,1.0);"+
							"	}"+
							"	else"+
							"	{"+
							"		FragColor=vec4(1.0,1.0,1.0,1.0);"+
							"	}"+
							"}";
	
	var fragmentShaderSourceCodePerFragment=
							"#version 300 es"+
							"\n"+
							"precision highp float;"+
							"in vec3 light_direction;"+
							"in vec3 reflection_vector;"+
							"in vec3 viewer_vector;"+
							"in vec3 transformedNormal;"+
							"in vec3 white;"+
							"uniform vec3 u_la;"+
							"uniform vec3 u_ld;"+
							"uniform vec3 u_ls;"+
							"uniform vec3 u_ka;"+
							"uniform vec3 u_kd;"+
							"uniform vec3 u_ks;"+
							"uniform float u_materialShininess;"+
							"uniform float u_LkeyIsPressed;" +
							"out vec4 FragColor;"+
							"void main(void)"+
							"{"+
							"	if(u_LkeyIsPressed==1.0)"+
							"	{"+
							"		vec3 normalized_tNormal=normalize(transformedNormal);"+
							"		vec3 normalized_light_direction=normalize(light_direction);"+
							"		vec3 normalized_reflection_vector=normalize(reflection_vector);"+
							"		vec3 normalized_viewer_vector=normalize(viewer_vector);"+
							"		float tn_dot_lightdirection=max(dot(normalized_light_direction,normalized_tNormal),0.0f);"+
							"		vec3 ambient=u_la*u_ka;"+
							"		vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;"+
							"		vec3 specular=u_ls*u_ks*pow(max(dot(normalized_reflection_vector,normalized_viewer_vector),0.0f),u_materialShininess);"+
							"		vec3 phong_ads_light=ambient+diffuse+specular;"+
							"		FragColor=vec4(phong_ads_light,1.0);"+
							"	}"+
							"	else"+
							"	{"+
							"		FragColor=vec4(white,1.0);"+
							"	}"+
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
	laUniform=gl.getUniformLocation(shaderProgramObject,"u_la");
	ldUniform=gl.getUniformLocation(shaderProgramObject,"u_ld");
	lsUniform=gl.getUniformLocation(shaderProgramObject,"u_ls");
	kaUniform=gl.getUniformLocation(shaderProgramObject,"u_ka");
	kdUniform=gl.getUniformLocation(shaderProgramObject,"u_kd");
	ksUniform=gl.getUniformLocation(shaderProgramObject,"u_ks");
	lightPositionUniform=gl.getUniformLocation(shaderProgramObject,"u_lightPosition");
	materialShininessUniform=gl.getUniformLocation(shaderProgramObject,"u_materialShininess");
	
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
	gl.clearColor(0.25,0.25,0.25,1.0);//blue
	
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
	var MaterialAmbience=[0.0,0.0,0.0];
	var MaterialDiffuse=[0.0,0.0,0.0];
	var MaterialSpecular=[0.0,0.0,0.0];
	var MaterialShininess=[1.0];
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shaderProgramObject);
	if(bLKeyPressed==true)
	{
		gl.uniform1f(LKeyPressedUniform,1.0);
		gl.uniform3fv(laUniform,light_ambient);		
		gl.uniform3fv(ldUniform,light_diffuse);		
		gl.uniform3fv(lsUniform,light_specular);		
		gl.uniform3fv(kaUniform,material_ambient);
		gl.uniform3fv(kdUniform,material_diffuse);
		gl.uniform3fv(ksUniform,material_specular);
		//gl.uniform4fv(lightPositionUniform,light_position);
		gl.uniform1f(materialShininessUniform,material_shininess);
		if (keyPress == 1 || keyPress==0)
		{
			//rotationMatrix = rotate(angleOfXRotation, 1.0f, 0.0f, 0.0f);
			light_position[0] = 0.0;
			light_position[1] = 100.0*Math.sin(angleOfYRotation);
			light_position[2] = 100.0*Math.cos(angleOfYRotation);
			light_position[3] = 1.0;
		}
		else if (keyPress == 2)
		{
			//rotationMatrix=rotate(angleOfYRotation, 0.0f, 1.0f, 0.0f);
			light_position[0] = 100.0*Math.sin(angleOfYRotation);
			light_position[1] = 0.0;
			light_position[2] = 100.0*Math.cos(angleOfYRotation);
			light_position[3] = 1.0;
		}
		else if (keyPress == 3)
		{
			//rotationMatrix = rotate(angleOfZRotation, 0.0f, 0.0f, 1.0f);
			light_position[0] = 100.0*Math.sin(angleOfYRotation);
			light_position[1] = 100.0*Math.cos(angleOfYRotation);
			light_position[2] = 0.0;
			light_position[3] = 1.0;
		}
		gl.uniform4fv(lightPositionUniform, light_position);
	}
	else
	{
		gl.uniform1f(LKeyPressedUniform,0.0);
	}
	var modelMatrix=mat4.create();
	var viewMatrix=mat4.create();
	var scaleMatrix=mat4.create();
	gl.viewport(0,600,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.scale(scaleMatrix,scaleMatrix,[0.5,0.5,0.5]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);

	//1st sphere on 1st column Emerald
	MaterialAmbience[0] = 0.0215;
	MaterialAmbience[1] = 0.1745;
	MaterialAmbience[2] = 0.0215;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.7568;
	MaterialDiffuse[1] = 0.61424;
	MaterialDiffuse[2] = 0.07568;	
	gl.uniform3fv(kdUniform,MaterialDiffuse);
	
	MaterialSpecular[0] = 0.633;
	MaterialSpecular[1] = 0.727811;
	MaterialSpecular[2] = 0.633;
	
	gl.uniform3fv(ksUniform,MaterialSpecular);
	
	MaterialShininess[0] = 0.6*128.0;
	gl.uniform1fv(materialShininessUniform, MaterialShininess);
	//gl.viewport(0, 600, canvas.width / 6, canvas.height / 6);
	sphere.draw();
	
	modelMatrix=mat4.create();
	//2nd sphere on 1st column jade
	MaterialAmbience[0] = 0.135;
	MaterialAmbience[1] = 0.2225;
	MaterialAmbience[2] = 0.1575;
	
	gl.uniform3fv(kaUniform,  MaterialAmbience);

	MaterialDiffuse[0] = 0.54;
	MaterialDiffuse[1] = 0.89;
	MaterialDiffuse[2] = 0.63;
	
	gl.uniform3fv(kdUniform, MaterialDiffuse);

	MaterialSpecular[0] = 0.316228;
	MaterialSpecular[1] = 0.316228;
	MaterialSpecular[2] = 0.316228;
	
	gl.uniform3fv(ksUniform,MaterialSpecular);
	
	MaterialShininess[0] = 0.1*128.0;
	gl.uniform3fv(materialShininessUniform,MaterialShininess);
	gl.viewport(0,475,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//3rd sphere on 1st column obsidien
	MaterialAmbience[0] = 0.05375;
	MaterialAmbience[1] = 0.05;
	MaterialAmbience[2] = 0.06625;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.18275;
	MaterialDiffuse[1] = 0.17;
	MaterialDiffuse[2] = 0.22525;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.332741;
	MaterialSpecular[1] = 0.328634;
	MaterialSpecular[2] = 0.346435;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] = 0.3*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(0,350,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	
	//4th sphere on 1st column pearl
	MaterialAmbience[0] = 0.25;
	MaterialAmbience[1] = 0.20725;
	MaterialAmbience[2] = 0.20725;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 1.0;
	MaterialDiffuse[1] = 0.829;
	MaterialDiffuse[2] = 0.829;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.296648;
	MaterialSpecular[1] = 0.296648;
	MaterialSpecular[2] = 0.296648;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.088*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(0,225,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//5th sphere on 1st column ruby
	MaterialAmbience[0] = 0.1745;
	MaterialAmbience[1] = 0.01175;
	MaterialAmbience[2] = 0.01175;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.61424;
	MaterialDiffuse[1] = 0.04136;
	MaterialDiffuse[2] = 0.04136;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.727811;
	MaterialSpecular[1] = 0.626959;
	MaterialSpecular[2] = 0.626959;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.6*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(0,100,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//6th sphere on 1st column turquoise
	MaterialAmbience[0] = 0.1;
	MaterialAmbience[1] = 0.18725;
	MaterialAmbience[2] = 0.1745;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.396;
	MaterialDiffuse[1] = 0.74151;
	MaterialDiffuse[2] = 0.69102;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.297254;
	MaterialSpecular[1] = 0.30829;
	MaterialSpecular[2] = 0.306678;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.1*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(0,-20,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//////////////////////////// 2nd column ////////////////////////
	//1st sphere on 2nd column brass
	MaterialAmbience[0] = 0.329412;
	MaterialAmbience[1] = 0.223529;
	MaterialAmbience[2] = 0.027451;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.780392;
	MaterialDiffuse[1] = 0.568627;
	MaterialDiffuse[2] = 0.113725;	
	gl.uniform3fv(kdUniform,MaterialDiffuse);
	
	MaterialSpecular[0] = 0.992157;
	MaterialSpecular[1] = 0.941176;
	MaterialSpecular[2] = 0.807843;
	
	gl.uniform3fv(ksUniform,MaterialSpecular);
	
	MaterialShininess[0] = 0.21794872*128.0;
	gl.uniform1fv(materialShininessUniform, MaterialShininess);
	
	modelMatrix=mat4.create();
	gl.viewport(300,600,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//2nd sphere on 2nd column bronze
	MaterialAmbience[0] = 0.2125;
	MaterialAmbience[1] = 0.1275;
	MaterialAmbience[2] = 0.054;
	
	gl.uniform3fv(kaUniform,  MaterialAmbience);

	MaterialDiffuse[0] = 0.714;
	MaterialDiffuse[1] = 0.4284;
	MaterialDiffuse[2] = 0.18144;
	
	gl.uniform3fv(kdUniform, MaterialDiffuse);

	MaterialSpecular[0] = 0.393548;
	MaterialSpecular[1] = 0.271906;
	MaterialSpecular[2] = 0.166721;
	
	gl.uniform3fv(ksUniform,MaterialSpecular);
	
	MaterialShininess[0] = 0.2*128.0;
	gl.uniform3fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(300,475,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//3rd sphere on 2nd column chrome
	MaterialAmbience[0] = 0.25;
	MaterialAmbience[1] = 0.25;
	MaterialAmbience[2] = 0.25;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.4;
	MaterialDiffuse[1] = 0.4;
	MaterialDiffuse[2] = 0.4;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.774597;
	MaterialSpecular[1] = 0.774597;
	MaterialSpecular[2] = 0.774597;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] = 0.6*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(300,350,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	
	//4th sphere on 2nd column copper
	MaterialAmbience[0] = 0.19125;
	MaterialAmbience[1] = 0.0735;
	MaterialAmbience[2] = 0.0225;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.7038;
	MaterialDiffuse[1] = 0.27048;
	MaterialDiffuse[2] = 0.0828;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.256777;
	MaterialSpecular[1] = 0.137622;
	MaterialSpecular[2] = 0.086014;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.1*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(300,225,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//5th sphere on 2nd column gold
	MaterialAmbience[0] = 0.24725;
	MaterialAmbience[1] = 0.1995;
	MaterialAmbience[2] = 0.0745;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.75164;
	MaterialDiffuse[1] = 0.60648;
	MaterialDiffuse[2] = 0.22648;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.628281;
	MaterialSpecular[1] = 0.555802;
	MaterialSpecular[2] = 0.366065;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.4*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(300,100,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//6th sphere on 2nd column silver
	MaterialAmbience[0] = 0.19225;
	MaterialAmbience[1] = 0.19225;
	MaterialAmbience[2] = 0.19225;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.50754;
	MaterialDiffuse[1] = 0.50754;
	MaterialDiffuse[2] = 0.50754;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.508273;
	MaterialSpecular[1] = 0.508273;
	MaterialSpecular[2] = 0.508273;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.4*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(300,-20,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//////////////////////////// 3rd column ////////////////////////
	//1st sphere on 3rd column black plastic
	MaterialAmbience[0] = 0.0;
	MaterialAmbience[1] = 0.0;
	MaterialAmbience[2] = 0.0;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.01;
	MaterialDiffuse[1] = 0.01;
	MaterialDiffuse[2] = 0.01;
	gl.uniform3fv(kdUniform,MaterialDiffuse);
	
	MaterialSpecular[0] = 0.50;
	MaterialSpecular[1] = 0.50;
	MaterialSpecular[2] = 0.50;
	
	gl.uniform3fv(ksUniform,MaterialSpecular);
	
	MaterialShininess[0] = 0.25*128.0;
	gl.uniform1fv(materialShininessUniform, MaterialShininess);
	
	modelMatrix=mat4.create();
	gl.viewport(600,600,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//2nd sphere on 3rd column cyan plastic
	MaterialAmbience[0] = 0.0;
	MaterialAmbience[1] = 0.1;
	MaterialAmbience[2] = 0.06;
	
	gl.uniform3fv(kaUniform,  MaterialAmbience);

	MaterialDiffuse[0] = 0.0;
	MaterialDiffuse[1] = 0.50980392;
	MaterialDiffuse[2] = 0.50980392;
	
	gl.uniform3fv(kdUniform, MaterialDiffuse);

	MaterialSpecular[0] = 0.50196078;
	MaterialSpecular[1] = 0.50196078;
	MaterialSpecular[2] = 0.50196078;
	
	gl.uniform3fv(ksUniform,MaterialSpecular);
	
	MaterialShininess[0] = 0.25*128.0;
	gl.uniform3fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(600,475,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//3rd sphere on 3rd column green plastic
	MaterialAmbience[0] = 0.0;
	MaterialAmbience[1] = 0.0;
	MaterialAmbience[2] = 0.0;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.1;
	MaterialDiffuse[1] = 0.35;
	MaterialDiffuse[2] = 0.1;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.45;
	MaterialSpecular[1] = 0.55;
	MaterialSpecular[2] = 0.45;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(600,350,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	
	//4th sphere on 3rd column red plastic
	MaterialAmbience[0] = 0.0;
	MaterialAmbience[1] = 0.0;
	MaterialAmbience[2] = 0.0;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.5;
	MaterialDiffuse[1] = 0.0;
	MaterialDiffuse[2] = 0.0;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.7;
	MaterialSpecular[1] = 0.6;
	MaterialSpecular[2] = 0.6;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.25*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(600,225,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//5th sphere on 3rd column white plastic
	MaterialAmbience[0] = 0.0;
	MaterialAmbience[1] = 0.0;
	MaterialAmbience[2] = 0.0;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.55;
	MaterialDiffuse[1] = 0.55;
	MaterialDiffuse[2] = 0.55;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.70;
	MaterialSpecular[1] = 0.70;
	MaterialSpecular[2] = 0.70;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.25*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(600,100,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//6th sphere on 3rd column yellow plastic
	MaterialAmbience[0] = 0.0;
	MaterialAmbience[1] = 0.0;
	MaterialAmbience[2] = 0.0;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.5;
	MaterialDiffuse[1] = 0.5;
	MaterialDiffuse[2] = 0.0;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.60;
	MaterialSpecular[1] = 0.60;
	MaterialSpecular[2] = 0.50;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.25*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(600,-20,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//////////////////////////// 4th column ////////////////////////
	//1st sphere on 4th column black rubber
	MaterialAmbience[0] = 0.02;
	MaterialAmbience[1] = 0.02;
	MaterialAmbience[2] = 0.02;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.01;
	MaterialDiffuse[1] = 0.01;
	MaterialDiffuse[2] = 0.01;
	gl.uniform3fv(kdUniform,MaterialDiffuse);
	
	MaterialSpecular[0] = 0.40;
	MaterialSpecular[1] = 0.40;
	MaterialSpecular[2] = 0.40;
	
	gl.uniform3fv(ksUniform,MaterialSpecular);
	
	MaterialShininess[0] = 0.078125*128.0;
	gl.uniform1fv(materialShininessUniform, MaterialShininess);
	
	modelMatrix=mat4.create();
	gl.viewport(900,600,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//2nd sphere on 4th column cyan rubber
	MaterialAmbience[0] = 0.0;
	MaterialAmbience[1] = 0.05;
	MaterialAmbience[2] = 0.05;
	
	gl.uniform3fv(kaUniform,  MaterialAmbience);

	MaterialDiffuse[0] = 0.4;
	MaterialDiffuse[1] = 0.5;
	MaterialDiffuse[2] = 0.5;
	
	gl.uniform3fv(kdUniform, MaterialDiffuse);

	MaterialSpecular[0] = 0.04;
	MaterialSpecular[1] = 0.7;
	MaterialSpecular[2] = 0.7;
	
	gl.uniform3fv(ksUniform,MaterialSpecular);
	
	MaterialShininess[0] = 0.078125*128.0;
	gl.uniform3fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(900,475,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//3rd sphere on 4th column green rubber
	MaterialAmbience[0] = 0.0;
	MaterialAmbience[1] = 0.05;
	MaterialAmbience[2] = 0.0;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.4;
	MaterialDiffuse[1] = 0.5;
	MaterialDiffuse[2] = 0.4;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.04;
	MaterialSpecular[1] = 0.7;
	MaterialSpecular[2] = 0.04;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(900,350,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	
	//4th sphere on 4th column red rubber
	MaterialAmbience[0] = 0.05;
	MaterialAmbience[1] = 0.0;
	MaterialAmbience[2] = 0.0;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.5;
	MaterialDiffuse[1] = 0.4;
	MaterialDiffuse[2] = 0.4;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.7;
	MaterialSpecular[1] = 0.04;
	MaterialSpecular[2] = 0.04;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.078125*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(900,225,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//5th sphere on 4th column white rubber
	MaterialAmbience[0] = 0.05;
	MaterialAmbience[1] = 0.05;
	MaterialAmbience[2] = 0.05;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.5;
	MaterialDiffuse[1] = 0.5;
	MaterialDiffuse[2] = 0.5;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.70;
	MaterialSpecular[1] = 0.70;
	MaterialSpecular[2] = 0.70;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.078125*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(900,100,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	//6th sphere on 4th column yellow rubber
	MaterialAmbience[0] = 0.05;
	MaterialAmbience[1] = 0.05;
	MaterialAmbience[2] = 0.0;
	gl.uniform3fv(kaUniform,MaterialAmbience);

	MaterialDiffuse[0] = 0.5;
	MaterialDiffuse[1] = 0.5;
	MaterialDiffuse[2] = 0.4;
	gl.uniform3fv(kdUniform,MaterialDiffuse);

	MaterialSpecular[0] = 0.7;
	MaterialSpecular[1] = 0.7;
	MaterialSpecular[2] = 0.04;
	gl.uniform3fv(ksUniform,MaterialSpecular);

	MaterialShininess[0] =0.078125*128.0;
	gl.uniform1fv(materialShininessUniform,MaterialShininess);
	modelMatrix=mat4.create();
	gl.viewport(900,-20,canvas.width/6,canvas.height/6);
	mat4.translate(modelMatrix,modelMatrix,[0.0,0.0,-3.0]);
	mat4.multiply(modelMatrix,modelMatrix,scaleMatrix);
	gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
	gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
	gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
	sphere.draw();
	
	
	
	//////////////////// angle updation ///////////
	if (angleOfYRotation >= 360.0)
		angleOfYRotation = 0.0;
	else
		angleOfYRotation += 0.1;
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
				toggleFullScreen();
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
			case 88: //for 'x'
				keyPress = 1;
				angleOfXRotation = 0.0;
				break;
			case 89: //for 'y'
				keyPress = 2;
				angleOfYRotation = 0.0;
				break;
			case 90: //for 'z'
				keyPress = 3;
				angleOfZRotation = 0.0;
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