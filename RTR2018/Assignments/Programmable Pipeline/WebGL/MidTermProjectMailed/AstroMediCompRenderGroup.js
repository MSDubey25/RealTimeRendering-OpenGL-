//**********************************************************
// Program: 	AstroMediComp!!
// Coder:   	RenderGroup.
// Description: This program will draw "AstroMediComp" Logo
//				with animation.
//**********************************************************
//Global variables
var  NKR_canvas = null;
var  NKR_gl=null;
var  gl=null;
var  NKR_bFullscreen=false;
var  NKR_canvas_original_width;
var  NKR_canvas_original_height;


//Shader Variables: Nikita *********************************/
var  NKR_vertexShaderObject;
var  NKR_fragmentShaderObject;
var  NKR_shadowProgram;
var  NKR_normalProgram;
var  NKR_pointProgram;

//Shader Variables: Vikas **********************************/

var VVK_vertexShaderObject;
var VVK_fragmentShaderObject;
var VVK_shaderProgramObject;

//Uniform Variables: Vikas**********************************/
var VVK_mvpUniform;
var VVK_pointSize;

//Vao, Vbo, Other Variables:Vikas**************************/
var vvk_vao_nervecell_body;
var vvk_vbo_nervecell_body;

var vvk_vao_nervecell_dendrons;
var vvk_vbo_nervecell_dendrons;

//Variable sized array for putting data into it.
var vvk_calculateCurvedPoints= new Float32Array(45000);				// vvk_calculateCurvePoints() function will fill this array.

//Fixed sized array for storing nerve cell dendron's
var vvk_calculateDendronPoints= new Float32Array(130000);			// vvk_calculateDendronPoints() function will fill in this array with curve points.

var vvk_curveVertices;
var vvk_numberOfCurvedPoints;										// Number of points calculated.

var vvk_dendronVertices;
var vvk_numberOfDendronPoints;										// Number of dendron points calculated.	

//Experiment
var vvk_controlPoint_1 = vec3.fromValues( 1.0, -0.5, 0.0);
var vvk_controlPoint_2= vec3.fromValues ( 0.3, 0.0, 0.0);
var vvk_controlPoint_3 = vec3.fromValues( 0.1, -1.0, 0.0);
var vvk_controlPoint_4 = vec3.fromValues( 0.2, -1.0, 0.0);

var vvk_controlPointsArray = new Float32Array(
												[
													/*
													//left top-1 curve
													-1.0, 0.6, 0.0,
												  	 0.0, 0.5, 0.0,
	                                                -0.1, 1.0, 0.0,
													 0.0, 1.0, 0.0,
	
													//left top-2 curve
													-1.0, 0.0, 0.0,
												  	-0.7, 0.0, 0.0,
	                                                -0.5, 0.5, 0.0,
													-1.0, 0.6, 0.0,
	
													//Right top-1 curve
													1.0, 0.6, 0.0,	
												    0.0, 0.5, 0.0,
												    0.1, 1.0, 0.0,
													0.0, 1.0, 0.0,
	
													//Right top-2 curve
													 1.0, 0.0, 0.0,
												  	 0.7, 0.0, 0.0,
	                                                 0.5, 0.5, 0.0,
													 1.0, 0.6, 0.0,
	
													//Right bottom-1 curve
													1.0,  0.0, 0.0,
													0.7,  0.0, 0.0,
													0.5, -0.5, 0.0,
													1.0, -0.6, 0.0,	
													
													//Right bottom-2 curve
													1.0, -0.6, 0.0,
													0.0, -0.5, 0.0,
													0.1, -1.0, 0.0,
													0.0, -1.0, 0.0,			
	
													//left bottom-2 curve
													-1.0, -0.6, 0.0,
												  	 0.0, -0.5, 0.0,
													-0.1, -1.0, 0.0,
	                                                 0.0, -1.0, 0.0, 
		
													//left bottom-1 curve	
													-1.0, 0.0, 0.0,
												  	-0.7, 0.0, 0.0,
	                                                -0.5,-0.5, 0.0,
													-1.0,-0.6, 0.0
                                                     */
                                                                
                                                    //left top-1 curve
													 0.0, 1.0, 0.0,
													 0.0, 0.5, 0.0,
	                                                -0.1, 1.0, 0.0,
													-1.0, 0.6, 0.0,
												  	 
													//left top-2 curve
													-1.0, 0.6, 0.0,
													-0.7, 0.0, 0.0,
	                                                -0.5, 0.5, 0.0,
													-1.0, 0.0, 0.0,
												  	
													//left bottom-1 curve	
													-1.0, 0.0, 0.0,
												  	-0.7, 0.0, 0.0,
	                                                -0.5,-0.5, 0.0,
													-1.0,-0.6, 0.0,
	
													//left bottom-2 curve
													-1.0, -0.6, 0.0,
												  	 0.0, -0.5, 0.0,
													-0.1, -1.0, 0.0,
	                                                 0.0, -1.0, 0.0, 
													
													//Right bottom-2 curve
													0.0, -1.0, 0.0,
													0.0, -0.5, 0.0,
													0.1, -1.0, 0.0,
													1.0, -0.6, 0.0,	
													
													//Right bottom-1 curve
													1.0, -0.6, 0.0,
													0.7,  0.0, 0.0,
													0.5, -0.5, 0.0,
													1.0,  0.0, 0.0,
														
													//Right top-2 curve
													 1.0, 0.0, 0.0,
												  	 0.7, 0.0, 0.0,
	                                                 0.5, 0.5, 0.0,
													 1.0, 0.6, 0.0,
	
													//Right top-1 curve
													1.0, 0.6, 0.0,	
												    0.0, 0.5, 0.0,
												    0.1, 1.0, 0.0,
													0.0, 1.0, 0.0            
												]

											);

var vvk_controlPointsDendron = new Float32Array(
	
												 [
													//Left middle set of dendrons
													//1
													-1.0, 0.0, 0.0,
												  	-1.2, 0.2, 0.0,
													-1.7, 0.0, 0.0,
	                                                -2.0, 0.3, 0.0,
													
													//2
													-1.0, 0.0, 0.0,
												  	-1.2, 0.2, 0.0,
													-1.7, 0.0, 0.0,
	                                                -2.0, 0.0, 0.0,
	
													//3
													-1.0, 0.0, 0.0,
												  	-1.2, -0.2, 0.0,
													-1.7, 0.0, 0.0,
	                                                -2.0, -0.3, 0.0,
	
													//Left top set of dendrons
													//1
													-1.0, 0.6, 0.0,		
													-1.2, 0.8, 0.0,
													-1.7, 0.6, 0.0, 
													-2.0, 0.8, 0.0,
	
													//2
													-1.0, 0.6, 0.0,		
													-1.2, 0.8, 0.0,
													-1.7, 0.6, 0.0, 
													-2.0, 1.2, 0.0,
	
													//3 
													-1.0, 0.6, 0.0,		
													-1.2, 0.8, 0.0,
													-1.7, 0.6, 0.0, 
													-2.0, 1.5, 0.0,
	
													//Left Bottom set of dendrons
													-1.0, -0.6, 0.0,		
													-1.2, -0.8, 0.0,
													-1.7, -0.6, 0.0, 
													-2.0, -0.8, 0.0,
	
													//2
													-1.0, -0.6, 0.0,		
													-1.2, -0.8, 0.0,
													-1.7, -0.6, 0.0, 
													-2.0, -1.2, 0.0,
	
													//3 
													-1.0, -0.6, 0.0,		
													-1.2, -0.8, 0.0,
													-1.7, -0.6, 0.0, 
													-2.0, -1.5, 0.0,
															
													//Right top set of dendrons
													//1
													 1.0, 0.6, 0.0,		
													 1.2, 0.8, 0.0,
													 1.7, 0.6, 0.0, 
													 2.0, 0.8, 0.0,
	
													//2
													 1.0, 0.6, 0.0,		
													 1.2, 0.8, 0.0,
													 1.7, 0.6, 0.0, 
													 2.0, 1.2, 0.0,
	
													//3 
													 1.0, 0.6, 0.0,		
													 1.2, 0.8, 0.0,
													 1.7, 0.6, 0.0, 
													 2.0, 1.5, 0.0,

													//Right middle set of dendrons
													//1
													1.0, 0.0, 0.0,
												    1.2, 0.2, 0.0,
												    1.7, 0.0, 0.0,
												    2.0, 0.3, 0.0,
													//2
													1.0, 0.0, 0.0,
												  	1.2, 0.2, 0.0,
													1.7, 0.0, 0.0,
	                                                2.0, 0.0, 0.0,
													//3	
													1.0, 0.0, 0.0,
												    1.2, -0.2, 0.0,
												    1.7, 0.0, 0.0,
												    2.0, -0.3, 0.0,
												
													//Right bottom set of dendrons
													//1
													 1.0, -0.6, 0.0,		
													 1.2, -0.8, 0.0,
													 1.7, -0.6, 0.0, 
													 2.0, -0.8, 0.0,
	
													//2
													 1.0, -0.6, 0.0,		
													 1.2, -0.8, 0.0,
													 1.7, -0.6, 0.0, 
													 2.0, -1.2, 0.0,
	
													//3 
													 1.0, -0.6, 0.0,		
													 1.2, -0.8, 0.0,
													 1.7, -0.6, 0.0, 
													 2.0, -1.5, 0.0,
	
													//Top set of dendrons
													//1
													0.0, 1.0, 0.0,
												    0.2, 1.2, 0.0,
												    0.0, 1.7, 0.0,
												    0.3, 2.0, 0.0,
													//2
													0.0, 1.0, 0.0,
													0.2, 1.2, 0.0,
													0.0, 1.7, 0.0,
													0.0, 2.0, 0.0,
													//3
													0.0, 1.0, 0.0,
												   -0.2, 1.2, 0.0,
												    0.0, 1.7, 0.0,
												   -0.3, 2.0, 0.0,
	
													//Bottom set of dendrons	
													//1
													0.0, -1.0, 0.0,
												    0.2, -1.2, 0.0,
												    0.0, -1.7, 0.0,
												    0.3, -2.0, 0.0,	
													//2
													0.0, -1.0, 0.0,
													0.2, -1.2, 0.0,
													0.0, -1.7, 0.0,
													0.0, -2.0, 0.0, 	
													//3
													0.0, -1.0, 0.0,
												   -0.2, -1.2, 0.0,
												    0.0, -1.7, 0.0,
												   -0.3, -2.0, 0.0
												]
											);

//**************************************************************/
//Variables representing "shader variables" in our program*****/
const  AMC_WebGLMacros=
{
	AMC_ATTRIBUTE_VERTEX:0, 
	AMC_ATTRIBUTE_COLOR:1,
	AMC_ATTRIBUTE_NORMAL:2,
	AMC_ATTRIBUTE_TEXTURE0:3,
    AMC_ATTRIBUTE_VELOCITY: 4,
	AMC_ATTRIBUTE_POINTSIZE: 5,
	AMC_ATTRIBUTE_STARTTIME: 6
};

//NIKITA:********************************************************/
//Define Vao, Vbo and Uniform Variables
var NKR_vao_sphere;
var NKR_vao_rings;
var NKR_vbo_position;
var NKR_vbo_color;
var NKR_vbo_normals;
var NKR_vbo_elements;
var NKR_vbo_texcoords;
var NKR_saturnTexture;  
var NKR_noofElements = 0;
var vao_singlepoint;
var vbo_singlePointPos;
var anglePoint = 0.1;
var indexNervePath = 0;

var NKR_vertexPositions = [];
var NKR_arrayOfVertices = [];
var NKR_normals = [];
var NKR_quadTexCoords = [];
var NKR_indices = [];
var NKR_textureCoords = [];

var NKR_mvpUniform_R;
var NKR_mvpFromLightUniform_R;
var NKR_shadowMapUniform_R;
var NKR_mvpUniform;
var NKR_mvpUniform_Point;

var NKR_depthMap;
var NKR_depthMapFBO;
var NKR_diffuseTextureUniform;
var NKR_lengthOfArray = 0;
var NKR_yRotate = 1.0;

var NKR_OFFSCREEN_WIDTH = 1024;
var NKR_OFFSCREEN_HEIGHT = 1024;
var NKR_LIGHT_X = 0;
var NKR_LIGHT_Y = 7;
var NKR_LIGHT_Z = 2; 

//************************Matrix Variables**************************************/
var NKR_viewProjMatrixFromLight;
var NKR_viewProjMatrix;

var NKR_MatrixCreditSong;
var NKR_PlayAudio = true;

var AMC_SceneNumber = 0;
var AMC_SceneGodCounter = 0.0;

var xTranslateNerveSaturn = 0.0;
var zTranslateNerveSaturn = 0.0;
var scaleFactorNerve = 0.36;
var scaleFactorSaturn = 0.12;

var VVK_perspectiveProjectionMatrix;

//*****************************************************************************/

//************Rohit ******************

//For Shader
var RRJ_vertexShaderObject;
var RRJ_fragmentShaderObject;
var RRJ_shaderProgramObject;

//For Chip
var RRJ_vao_Line;
var RRJ_vbo_Line_Position;
var RRJ_vbo_Line_Color; 

//For Curve
var RRJ_vao_Curve;
var RRJ_vbo_Curve_Position;
var RRJ_vbo_Curve_Color;

//For Rect
var RRJ_vao_Rect;
var RRJ_vbo_Rect_Position;
var RRJ_vbo_Rect_Color;
var RRJ_rect_Position = new Float32Array([
					1.0, 1.0, 0.0,
					-1.0, 1.0, 0.0,
					-1.0, -1.0, 0.0, 
					1.0, -1.0, 0.0,
				]);

var RRJ_rect_Color = new Float32Array([
					0.750, 0.750, 0.750,
					0.750, 0.750, 0.750,
					0.750, 0.750, 0.750,
					0.750, 0.750, 0.750,
					
				]);



//For Circle
var RRJ_vao_Circle;
var RRJ_vbo_Circle_Position;
var RRJ_vbo_Circle_Color;


//For Triangle
var RRJ_vao_Tri;
var RRJ_vbo_Tri_Position;
var RRJ_vbo_Tri_Color;


//For Chip Lines
var RRJ_vao_Chip_Lines;
var RRJ_vbo_Chip_Lines_Position;
var RRJ_vbo_Chip_Lines_Color;


//For Circuit Lines
var RRJ_vao_Circuit_Lines;
var RRJ_vbo_Circuit_Lines_Position;
var RRJ_vbo_Circuit_Lines_Color;

var MAX_POINTS = 64 * 250;

//For Uniform
var RRJ_mvpUniform;
var RRJ_pointSizeUniform;

//For Projection
var RRJ_perspectiveProjectionMatrix;


var RRJ_angle = 0.0;
var RRJ_iChange = 1;
var RRJ_point = 0;
var RRJ_modelViewMatrix;
var RRJ_modelViewProjectionMatrix;
var RRJ_BlendCounter = 0.0;
var RRJ_Counter = 1.0;
var iSequence = 0; // risk involved here not named with initials 

var RRJ_translateZValue = 7.0;
var RRJ_rotateAngle = 0.0;

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

var RRJ_timeFactor = 0.0;
var RRJ_angle_points_PS = 0.0;
var RRJ_trans_PS = -200.0;


//////////////////////////////////////

//********* MSD Text Rendering*****************************
var msd_pos_AMCX=0.0;
var msd_pos_AMCY=0.0;
var msd_pos_KIIX=0.0;
var msd_pos_KIIY=0.0;
var msd_pos_KIIZ=-110.0;
var msd_pos_KIIZ_IS=-110.0;
var msd_pos_KIIZ_IN=-110.0;
var blend_counter=0.0;
var blend_counterS=0.0;
var flagA=0;
var flagS=0;
var flagT=0;
var flagR=0;
var flagO=0;
var flagM=0;
var flagE=0;
var flagD=0;
var flagI=0;
var flagC=0;
var flagO1=0;
var flagM1=0;
var flagP=0;

///for fire
//var msd_nParticles = 0;
var msd_msd_timeUniform;
var msd_resolutionUniform;
//var msd_mouseUniform;
var msd_samplerUniform;
var msd_uvAlphamsd_msd_timeUniform;
var msd_time = -100.0;

var msd_vertexShaderObject;
var msd_fragmentShaderObject;
var msd_shaderProgramObject;

var msd_vao;
var msd_vbo;
var msd_vbo_color;
var msd_vbo_texture;
var msd_mvpUniform;
var msd_msd_samplerUniform;
var msd_blendUniform;
var msd_rectangle_texture;
var msd_rectangle_texture1;
var msd_angle_A=90.0;
var msd_angle_S=90.0;
var msd_angle_T=90.0;
var msd_angle_R=90.0;
var msd_angle_O=90.0;
var msd_angle_M=90.0;
var msd_angle_E=90.0;
var msd_angle_D=90.0;
var msd_angle_I=90.0;
var msd_angle_C=90.0;
var msd_angle_O1=90.0;
var msd_angle_M1=90.0;
var msd_angle_P=90.0;

//****************************************************
//To Start animation:
var requestAnimationFrame=
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame;

//To Stop the animation
var cancelAnimationFrame=
		window.cancelAnimationFrame ||
		window.webkitCancelRequestAnimationFrame ||
		window.webkitCancelAnimationFrame ||
		window.mozCancelRequestAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.oCancelRequestAnimationFrame ||
		window.oCancelAnimationFrame ||
		window.msCancelRequestAnimationFrame ||
		window.msCancelAnimationFrame;

//onload function
function main()
{
	
	// Get the Canvas from the ID 
	NKR_canvas=document.getElementById("AMC");
	if(!NKR_canvas)
		console.log("\n Obtaining canvas failed!! \n");
	else
		console.log("\n Obtaining canvas succeeded!! \n");
	
	//Store the original height and width into global variables
	NKR_canvas_original_width = NKR_canvas.width;
	NKR_canvas_original_height = NKR_canvas.height;
	
	window.addEventListener("keydown",keyDown,false);
	window.addEventListener("click",mouseDown,false);
	window.addEventListener("resize",resize,false);
	window.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mouseup", mouseUp, false);
    window.addEventListener("mousemove", mouseMove, false);
	
	
	//Initialize function 
    
	toggleFullscreen();
	
    
	initSaturn();
	initNerveCell();
    initChipCircuit();
	initTextRendering();
    initParticleSystem();
	initPoint();
    
	//resize function call
	resize();
	
	//draw function call
	drawAMC();
	
	
}//main()

//initNerveCell()***********************************/
function initNerveCell()
{
	// code
	// Get WebGL 2.0 context.
	// This context is nothing but "the GateWay" for all the WebGL functions, macro's
	// and what not!
	// As like Windows\Linux\Android--> The function/macro's here do not follow the same 
	// style of naming.
	// Ex. glClear() is not there exactly: rather clear() exists in WebGL.
	// But for our convenience we have created the context of named "gl" itself. which
	// will be used to call or invoke the methods/access the macros.
	// Ex. gl.clear()!
	/*
	gl=NKR_canvas.getContext("webgl2");

	if(gl==null)
	{
		console.log("\n initNerveCell()::Failed to get rendering context for WebGL!\n");
		return;
	}
	*/
	//Once the context is received-->Set viewport: width and height
	//gl.viewportWidth = NKR_canvas.width;
	//gl.viewportHeight= NKR_canvas.height;
		
	//Due to Nikita!!
	//var gl= NKR_gl;
	
	//Vertex Shader**************************************
	var vertexShaderSourceCode=
		"#version 300 es"+
		"\n"+
		"in vec4 vPosition;"+
        "uniform float u_point_size;"+
		"uniform mat4 u_mvp_matrix;"+
		"void main(void)"+
		"{"+
            "gl_PointSize= 100.0f;"+
			"gl_Position = u_mvp_matrix * vPosition;"+
		"}";
	
	
	VVK_vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(VVK_vertexShaderObject, vertexShaderSourceCode);
	gl.compileShader(VVK_vertexShaderObject);
	
	//Error handlng
	if(gl.getShaderParameter(VVK_vertexShaderObject, gl.COMPILE_STATUS)==false)
	{
		var error = gl.getShaderInfoLog(VVK_vertexShaderObject);
		if(error.length > 0)
		{
			alert(error);
			uninitialize();
		}
		
	}
	
	//Fragment Shader
	
	var fragmentShaderSourceCode = 
		"#version 300 es"+
		"\n"+
		"precision highp float;"+
		"out vec4 FragColor;"+
		"void main(void)"+
		"{"+
			"FragColor = vec4(0.0, 1.0, 1.0, 1.0);"+
		"}";

	VVK_fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(VVK_fragmentShaderObject, fragmentShaderSourceCode);
	gl.compileShader(VVK_fragmentShaderObject);
	
	//Error Handling
	if(gl.getShaderParameter(VVK_fragmentShaderObject, gl.COMPILE_STATUS)==false)
	{
		var error = gl.getShaderInfoLog(VVK_fragmentShaderObject);
		if(error.length > 0)
		{
			alert(error);
			uninitialize();
		}
		
	}
	//Shader Program object
	VVK_shaderProgramObject = gl.createProgram();
	gl.attachShader(VVK_shaderProgramObject, VVK_vertexShaderObject);
	gl.attachShader(VVK_shaderProgramObject, VVK_fragmentShaderObject);
	
	//pre-link attribute binding
	gl.bindAttribLocation(VVK_shaderProgramObject, AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
	
	//Linking both shaders to shader program object
	gl.linkProgram(VVK_shaderProgramObject);
	
	//Error handling
	if(gl.getProgramParameter(VVK_shaderProgramObject, gl.LINK_STATUS)==false)
	{
		var error = gl.getProgramInfoLog(VVK_shaderProgramObject);
		if(error.length > 0)
		{
			alert(error);
			uninitialize();
		}
	}
	//post link: providing uniform location
	VVK_mvpUniform = gl.getUniformLocation(VVK_shaderProgramObject,"u_mvp_matrix");
	VVK_pointSize = gl.getUniformLocation(VVK_shaderProgramObject, "u_point_size");
	
	//******************************Nerve Cell Body**************************
	// Calculate the vertices from the bezier!
	// Put the data into the array dynamically!
	
	vvk_numberOfCurvePoints = vvk_calculateCurvePoints();
	console.log("vvk_numberOfCurvePoints::" + vvk_numberOfCurvePoints);
	
	//Providing geometry data ==> A Global array has been created for the same.	
	
	//Vertex array object::nervecell_body
	vvk_vao_nervecell_body = gl.createVertexArray();
	gl.bindVertexArray(vvk_vao_nervecell_body);
	
	//vertex buffer object::nervecell_dendrons
	vvk_vbo_nervecell_body = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vvk_vbo_nervecell_body);
	gl.bufferData(gl.ARRAY_BUFFER, vvk_calculateCurvedPoints, gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	
	gl.bindVertexArray(null);
	
	//*****************************Nerve Cell Dendrons**********************
	vvk_numberOfDendronPoints = vvk_calculateDendronCurvePoints();
	console.log("vvk_numberOfDendronPoints::" + vvk_numberOfDendronPoints);
	
	//Vao for Dendrons
	vvk_vao_nervecell_dendrons = gl.createVertexArray();
	gl.bindVertexArray(vvk_vao_nervecell_dendrons);
	
	//Vbo for Dendrons
	vvk_vbo_nervecell_dendrons = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vvk_vbo_nervecell_dendrons);
	
	gl.bufferData(gl.ARRAY_BUFFER, vvk_calculateDendronPoints, gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	gl.bindVertexArray(null);
	
	//**********************************************************************
	//Set the Clear color to "Blue"
	//gl.clearColor(0.0, 0.0, 0.0, 1.0); //Blue color.
	
	//initialize the perspective projection matrix
	VVK_perspectiveProjectionMatrix = mat4.create();
	
}//initNerveCell()

//************************vvk_calculateDendronPoints()**********************//
function vvk_calculateDendronCurvePoints()
{
	//variables
	var generatedDendronVertex=vec3.create();
	
	var interpolation_amount=0.0, i=0, countOfVertices=0;
	
	var dendronControlPoint_1 = vec3.create();
	var dendronControlPoint_2 = vec3.create();
	var dendronControlPoint_3 = vec3.create();
	var dendronControlPoint_4 = vec3.create();	
	//code
	
	for(var dendronCount=1, startIndex=0; dendronCount < 25; dendronCount=dendronCount+1, startIndex=startIndex+12)
	{
		
		vec3.set(dendronControlPoint_1, vvk_controlPointsDendron[startIndex], vvk_controlPointsDendron[startIndex+1], vvk_controlPointsDendron[startIndex+2]);
		vec3.set(dendronControlPoint_2, vvk_controlPointsDendron[startIndex+3], vvk_controlPointsDendron[startIndex+4], vvk_controlPointsDendron[startIndex+5]);
		vec3.set(dendronControlPoint_3, vvk_controlPointsDendron[startIndex+6], vvk_controlPointsDendron[startIndex+7], vvk_controlPointsDendron[startIndex+8]);
		vec3.set(dendronControlPoint_4, vvk_controlPointsDendron[startIndex+9], vvk_controlPointsDendron[startIndex+10], vvk_controlPointsDendron[startIndex+11]);
		
		//console.log("control point_1::" + dendronControlPoint_1);
		//console.log("control point_2::" + dendronControlPoint_2);
		//console.log("control point_3::" + dendronControlPoint_3);
		//console.log("control point_4::" + dendronControlPoint_4);
	
		//Generate curve points for every curve!
		
		for(interpolation_amount=0.0; interpolation_amount < 1.0; interpolation_amount = interpolation_amount+0.001, i=i+3, countOfVertices = countOfVertices+1)
		{
			
			vec3.bezier(	
						
						generatedDendronVertex, 								// Receiving vector or generated vector.
						dendronControlPoint_1,								// Control Point_1
						dendronControlPoint_2,								// Control Point_2		
						dendronControlPoint_3,								// Control Point_3
						dendronControlPoint_4,								// Control Point_4		
						interpolation_amount							// interpolation_amount between the points.
						
						);
			
			
			vvk_calculateDendronPoints[i] = generatedDendronVertex[0];
			vvk_calculateDendronPoints[i+1] = generatedDendronVertex[1];
			vvk_calculateDendronPoints[i+2] = generatedDendronVertex[2];
			
			//vvk_calculateCurvedPoints.push(generatedVertex);
		
			/*console.log(
			            "vvk_calculateDendronPoints::(x)" + vvk_calculateDendronPoints[i] + 
						"vvk_calculateDendronPoints::(y)" + vvk_calculateDendronPoints[i+1] +
						"vvk_calculateDendronPoints::(y)" + vvk_calculateDendronPoints[i+2]	
			          );
			*/
			//console.log(" vvk_calculateCurvePoints()::(x, y, z)"+ generatedVertex);
			
		} // This loop will generate "curve points" for the given set of control points.
		
	}//This will will generate "control points" for the dendron curve to be created.
	
	console.log("vvk_countOfDendronVertices::" + countOfVertices);
	
	return countOfVertices;						//It will return the length of the array.
	
}//vvk_calculateDendronPoints()

//********************vvk_calculateCurvePoints()****************************/
function vvk_calculateCurvePoints()
{
	
	//variables
	var generatedVertex = vec3.create();
	
	//This is the amount of interpolation between two points while drawing the curve!
	var interpolation_amount=0.0, i=0, countOfVertices=0;
	var controlPoint_1 = vec3.create();
	var controlPoint_2 = vec3.create();
	var controlPoint_3 = vec3.create();
	var controlPoint_4 = vec3.create();
	
	//code
	//console.log("Control point array element_1::" + vvk_controlPointsArray);   // This statement will print entire array.
	//console.log("control point_1::" + controlPoint_1);							 // This statement will print entire vector.
	
	//Purpose is: To Create new set of control points [actually 4] for each curve to be created.
	for(var curveCount=1, startIndex=0; curveCount < 9; curveCount=curveCount+1, startIndex=startIndex+12)
	{
		
		vec3.set(controlPoint_1, vvk_controlPointsArray[startIndex], vvk_controlPointsArray[startIndex+1], vvk_controlPointsArray[startIndex+2]);
		
		vec3.set(controlPoint_2, vvk_controlPointsArray[startIndex+3], vvk_controlPointsArray[startIndex+4], vvk_controlPointsArray[startIndex+5]);
		
		vec3.set(controlPoint_3, vvk_controlPointsArray[startIndex+6], vvk_controlPointsArray[startIndex+7], vvk_controlPointsArray[startIndex+8]);
		
		vec3.set(controlPoint_4, vvk_controlPointsArray[startIndex+9], vvk_controlPointsArray[startIndex+10], vvk_controlPointsArray[startIndex+11]);
		
		//console.log("control point_1::" + controlPoint_1);
		//console.log("control point_2::" + controlPoint_2);
		//console.log("control point_3::" + controlPoint_3);
		//console.log("control point_4::" + controlPoint_4);
	
		//Generate curve points for every curve!
		
		for(interpolation_amount=0.0; interpolation_amount < 1.0; interpolation_amount = interpolation_amount+0.001, i=i+3, countOfVertices = countOfVertices+1)
		{
			
			vec3.bezier(	
						
						generatedVertex, 								// Receiving vector or generated vector.
						controlPoint_1,								// Control Point_1
						controlPoint_2,								// Control Point_2		
						controlPoint_3,								// Control Point_3
						controlPoint_4,								// Control Point_4		
						interpolation_amount							// interpolation_amount between the points.
						
						);
			
			
			vvk_calculateCurvedPoints[i] = generatedVertex[0];
			vvk_calculateCurvedPoints[i+1] = generatedVertex[1];
			vvk_calculateCurvedPoints[i+2] = generatedVertex[2];
			
			//vvk_calculateCurvedPoints.push(generatedVertex);
		
			/*console.log(
			            "vvk_calculateCurvePoints::(x)" + vvk_calculateCurvedPoints[i] + 
						"vvk_calculateCurvePoints::(y)" + vvk_calculateCurvedPoints[i+1] +
						"vvk_calculateCurvePoints::(y)" + vvk_calculateCurvedPoints[i+2]	
			           );
			*/
			//console.log(" vvk_calculateCurvePoints()::(x, y, z)"+ generatedVertex);
			
		} // This loop will generate "curve points" for the given set of control points.
		
	}//This will will generate "control points" for the curve to be created.
	
	console.log("vvk_countOfVertices::" + countOfVertices);
	
	return countOfVertices;						//It will return the length of the array.
	
}//calculateCurvePoints()

//initProcessorChip()*******************************/


//drawAMC()***************************************************************************************//
function drawAMC()
{	
	//code		
	drawSaturn();	
	
	//animation loop!
	requestAnimationFrame(drawAMC, NKR_canvas);
}
//we get warning when we dont draw shadow map 
//Error: WebGL warning: drawElements: Tex image TEXTURE_2D level 0 is incurring lazy initialization.

//drawSaturn()************************************************************************************//
function drawSaturn()
{		
	gl.disable(gl.BLEND);
    
	//Code   
    
    if(NKR_PlayAudio == true)
    {
        
        NKR_MatrixCreditSong.play();
        NKR_PlayAudio = false;
    }
    
	
    
	// For the shadow map   
   var NKR_viewMatrixFromLight = mat4.create(); 
   var NKR_projMatrixFromLight = mat4.create();
   var mvp_Saturn = mat4.create();
   var modelViewProjectionMatrix = mat4.create();
   var translationMatrix = mat4.create();
   var scaleMatrix = mat4.create();
   var rotateMatrix = mat4.create();
	
   NKR_viewProjMatrixFromLight = mat4.create();    
   
   //-10.0, 0.5, 1.0  1.0, NKR_yRotate, 7.0
   mat4.lookAt(NKR_viewMatrixFromLight, [1.5, NKR_yRotate, 3.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
   mat4.perspective(NKR_projMatrixFromLight, 70.0, NKR_OFFSCREEN_WIDTH/NKR_OFFSCREEN_HEIGHT, 1.0, 100.0); //parsefloat kelela naiye   
   mat4.multiply(NKR_viewProjMatrixFromLight, NKR_projMatrixFromLight, NKR_viewMatrixFromLight);
   
	// For regular drawing
   var NKR_viewMatrix = mat4.create(); 
   var NKR_projMatrix = mat4.create();   
   NKR_viewProjMatrix = mat4.create();

   //top view of saturn 
   //mat4.lookAt(viewMatrix, [0.0, 3.0, 1.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
   mat4.lookAt(NKR_viewMatrix, [0.0, 0.0, 7.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
   mat4.perspective(NKR_projMatrix, 45, NKR_canvas.width/NKR_canvas.height, 1.0, 100.0);				//To be reviewed!
   mat4.multiply(NKR_viewProjMatrix, NKR_projMatrix, NKR_viewMatrix); 
	
    mat4.translate(translationMatrix, translationMatrix, [xTranslateNerveSaturn, 0.0, zTranslateNerveSaturn]);
    mat4.scale(scaleMatrix, translationMatrix, [scaleFactorSaturn, scaleFactorSaturn, scaleFactorSaturn]);
    mat4.rotate(rotateMatrix, scaleMatrix, 1.0, [1.0, 1.0, 1.0]);
    if(RRJ_iChange == 1 || RRJ_iChange == 2)
        mat4.rotate(rotateMatrix, rotateMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
    else if(RRJ_iChange == 3 || RRJ_iChange ==4)
        mat4.rotate(rotateMatrix, rotateMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);
    
    mat4.multiply(mvp_Saturn, rotateMatrix, mvp_Saturn);
	mat4.multiply(mvp_Saturn, NKR_viewProjMatrix, mvp_Saturn);	
	
	// Change the drawing destination to FBO
     NKR_gl.bindFramebuffer(NKR_gl.FRAMEBUFFER, NKR_depthMapFBO);
     
	 NKR_gl.viewport(0, 0, NKR_OFFSCREEN_WIDTH, NKR_OFFSCREEN_HEIGHT);									//1024, 1024
	 NKR_gl.clear(NKR_gl.DEPTH_BUFFER_BIT);
	 
	 // For generating a shadow map
     NKR_gl.useProgram(NKR_shadowProgram); 
    
	// Draw the saturn and the rings (for generating a shadow map)
     NKR_gl.uniformMatrix4fv(NKR_mvpUniform, false, NKR_viewProjMatrixFromLight);
	 NKR_gl.bindVertexArray(NKR_vao_sphere);		
		NKR_gl.bindBuffer(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_vbo_elements);
		NKR_gl.bufferData(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_indices, NKR_gl.DYNAMIC_DRAW);
		NKR_gl.drawElements(NKR_gl.TRIANGLES, NKR_noofElements, NKR_gl.UNSIGNED_SHORT, 0);
	 NKR_gl.bindVertexArray(null);

	 NKR_gl.uniformMatrix4fv(NKR_mvpUniform, false, NKR_viewProjMatrixFromLight);	
	 NKR_gl.bindVertexArray(NKR_vao_rings);
		
		 for(var NKR_xradius = 2.0, NKR_yradius = 1.5 ; NKR_xradius > 1.0, NKR_yradius > 1.0 ; NKR_xradius = NKR_xradius-0.01, NKR_yradius=NKR_yradius-0.01)
		 {
			 NKR_arrayOfVertices = [];
			 NKR_quadTexCoords = [];
			 NKR_lengthOfArray = 0;
			 NKR_drawCircle(0.0, 0.0, NKR_xradius, NKR_yradius);			 
			 
			 NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_position);
			 NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_arrayOfVertices), NKR_gl.DYNAMIC_DRAW);
			 NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3, NKR_gl.FLOAT, false, 0, 0);	
			 NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);		 
			 
			 NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_color);
			 NKR_gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 1.0);
			 NKR_gl.disableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);		 
			 
			 NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_texcoords);
			 NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_quadTexCoords), NKR_gl.DYNAMIC_DRAW);
			 NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, NKR_gl.FLOAT, false, 0, 0);	
			 NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);	
			 
			 NKR_gl.drawArrays(NKR_gl.LINE_LOOP, 0, NKR_lengthOfArray );	
		 }
	 NKR_gl.bindVertexArray(null);	
		 
     NKR_gl.useProgram(null);
		 
         /*
	//nerve cell drawing************
	mat4.identity(modelViewProjectionMatrix);
	mat4.identity(translationMatrix);
		 
	NKR_gl.useProgram(VVK_shaderProgramObject);
	 
	//perform translation
	mat4.translate(translationMatrix, translationMatrix, [xTranslateNerveSaturn, 0.0, zTranslateNerveSaturn]);
	mat4.scale(scaleMatrix, translationMatrix, [scaleFactorNerve, scaleFactorNerve, scaleFactorNerve]);
	if(RRJ_iChange == 1 || RRJ_iChange == 2)
        mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
    else if(RRJ_iChange == 3 || RRJ_iChange ==4)
        mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);
    
	//push data into matrices
    mat4.multiply(modelViewProjectionMatrix, rotateMatrix, modelViewProjectionMatrix);
	mat4.multiply(modelViewProjectionMatrix, NKR_viewProjMatrix, modelViewProjectionMatrix);
		 
        
     //provide mvp to shader
	 NKR_gl.uniformMatrix4fv(VVK_mvpUniform, false, modelViewProjectionMatrix);
     //Provide point size to shader    
     NKR_gl.uniform1f(VVK_pointSize, 4.0); 
	 //Bind to vertex array object and draw the geometry of: Body of Nerve Cell.
	 NKR_gl.bindVertexArray(vvk_vao_nervecell_body);

	 NKR_gl.drawArrays(NKR_gl.LINE_LOOP, 0, vvk_numberOfCurvePoints);

	 NKR_gl.bindVertexArray(null);

	 NKR_gl.bindVertexArray(vvk_vao_nervecell_dendrons);

	 NKR_gl.drawArrays(NKR_gl.LINE_LOOP, 0, vvk_numberOfDendronPoints);

	 NKR_gl.bindVertexArray(null);
		 
     NKR_gl.useProgram(null);
     //nerve cell drawing************
	 
     //drawTextRendering();
     //drawChipCircuit();
	 */
     
     // Change the drawing destination to color buffer
     NKR_gl.bindFramebuffer(NKR_gl.FRAMEBUFFER, null);	 
	 
	 gl.disable(gl.BLEND);
     
     NKR_gl.viewport(0, 0, NKR_canvas.width, NKR_canvas.height);
	 NKR_gl.clearColor(0.0, 0.0, 0.0, 1.0); 
	 NKR_gl.clear(NKR_gl.COLOR_BUFFER_BIT | NKR_gl.DEPTH_BUFFER_BIT);
	 
     /*
     //Case Saturn
	 // For regular drawing
     NKR_gl.useProgram(NKR_normalProgram); 
     
     // Draw the saturn and rings (for regular drawing)	 
	 
	 NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
	 NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);
	 
	 NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
     NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
	 NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);
	 
	 NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
     NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);	 
	 NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
	 
	 NKR_gl.bindVertexArray(NKR_vao_sphere);	    
		NKR_gl.bindBuffer(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_vbo_elements);
		NKR_gl.bufferData(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_indices, NKR_gl.DYNAMIC_DRAW);
		NKR_gl.drawElements(NKR_gl.TRIANGLES, NKR_noofElements, NKR_gl.UNSIGNED_SHORT, 0);
	 NKR_gl.bindVertexArray(null);
	 
	 //Case Saturn Rings
	 NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
	 NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);

	 NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
     NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
	 NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);

	 NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
     NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);
	 NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
		
	 NKR_gl.bindVertexArray(NKR_vao_rings);
		 
		 for(var NKR_xradius = 2.0, NKR_yradius = 1.5 ; NKR_xradius > 1.0, NKR_yradius > 1.0 ; NKR_xradius = NKR_xradius-0.01, NKR_yradius=NKR_yradius-0.01)
		 {
			 NKR_arrayOfVertices = [];
			 NKR_quadTexCoords = [];
			 NKR_lengthOfArray = 0;
			 NKR_drawCircle(0.0, 0.0, NKR_xradius, NKR_yradius);						 
			
			 NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_position);
			 NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_arrayOfVertices), NKR_gl.DYNAMIC_DRAW);
			 NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3, NKR_gl.FLOAT, false, 0, 0);	
			 NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);		 
			 
			 NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_color);
			 NKR_gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 1.0);
			 NKR_gl.disableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
			 
			 NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_texcoords);
			 NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_quadTexCoords), NKR_gl.DYNAMIC_DRAW);
			 NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2, NKR_gl.FLOAT, false, 0, 0);	
			 NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);	
			 
			 NKR_gl.drawArrays(NKR_gl.LINE_LOOP, 0, NKR_lengthOfArray );	
		 }
		 
	 NKR_gl.bindVertexArray(null);
		 
	 NKR_gl.useProgram(null);
	 
    //Case nerve cell drawing************
	mat4.identity(modelViewProjectionMatrix);
	mat4.identity(translationMatrix);
		 
	NKR_gl.useProgram(VVK_shaderProgramObject);
	 
	//perform translation
	mat4.translate(translationMatrix, translationMatrix, [xTranslateNerveSaturn, 0.0, zTranslateNerveSaturn]);
	mat4.scale(scaleMatrix, translationMatrix, [scaleFactorNerve, scaleFactorNerve, scaleFactorNerve]);
	if(RRJ_iChange == 1 || RRJ_iChange == 2)
        mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
    else if(RRJ_iChange == 3 || RRJ_iChange ==4)
        mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);
    
	//push data into matrices
    mat4.multiply(modelViewProjectionMatrix, rotateMatrix, modelViewProjectionMatrix);
	mat4.multiply(modelViewProjectionMatrix, NKR_viewProjMatrix, modelViewProjectionMatrix);
		 
     //provide mvp to shader
	 NKR_gl.uniformMatrix4fv(VVK_mvpUniform, false, modelViewProjectionMatrix);
	 //Bind to vertex array object and draw the geometry of: Body of Nerve Cell.
	 NKR_gl.bindVertexArray(vvk_vao_nervecell_body);

	 NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfCurvePoints);

	 NKR_gl.bindVertexArray(null);

	 NKR_gl.bindVertexArray(vvk_vao_nervecell_dendrons);

	 NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfDendronPoints);

	 NKR_gl.bindVertexArray(null);
		 
     NKR_gl.useProgram(null);
     //nerve cell drawing************
     
     //Case Text
     drawTextRendering();
     
     //Case Chip
     drawChipCircuit();
     
     //Case Space
     gl.useProgram(RRJ_shaderProgramObject_PS);	
	  RRJ_Space(); 
     gl.useProgram(null);     
     
     //Case Point
     gl.useProgram(NKR_pointProgram);	
      drawPoint();
     gl.useProgram(null);    
     
     */
     
     //_______________________________________________________________________________________
     switch(AMC_SceneNumber)
     {
         case 0:
            AMC_SceneGodCounter += 0.00018;
            if(AMC_SceneGodCounter > 0.17)
            {
                AMC_SceneNumber = 1;
                AMC_SceneGodCounter = 0.0;
            }
            
         break;
         case 1:
             //Case Space
             gl.useProgram(RRJ_shaderProgramObject_PS);	
              RRJ_Space(); 
             gl.useProgram(null);     
             
             //Case Point
             gl.useProgram(NKR_pointProgram);	
              drawPoint();
             gl.useProgram(null);
             
             AMC_SceneGodCounter += 0.00018;
            if(AMC_SceneGodCounter > 0.58)
            {
                AMC_SceneNumber = 2;
                AMC_SceneGodCounter = 0.0;
            }
             
         break;
         
         case 2:
              
              zTranslateNerveSaturn += 0.003;             
              
              
             //Case Saturn
             // For regular drawing
             NKR_gl.useProgram(NKR_normalProgram); 
             
             // Draw the saturn and rings (for regular drawing)	 
             
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);	 
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
             
             NKR_gl.bindVertexArray(NKR_vao_sphere);	    
                NKR_gl.bindBuffer(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_vbo_elements);
                NKR_gl.bufferData(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_indices, NKR_gl.DYNAMIC_DRAW);
                NKR_gl.drawElements(NKR_gl.TRIANGLES, NKR_noofElements, NKR_gl.UNSIGNED_SHORT, 0);
             NKR_gl.bindVertexArray(null);
             
             //Case Saturn Rings
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);

             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);

             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
                
             NKR_gl.bindVertexArray(NKR_vao_rings);
                 
                 for(var NKR_xradius = 2.0, NKR_yradius = 1.5 ; NKR_xradius > 1.0, NKR_yradius > 1.0 ; NKR_xradius = NKR_xradius-0.01, NKR_yradius=NKR_yradius-0.01)
                 {
                     NKR_arrayOfVertices = [];
                     NKR_quadTexCoords = [];
                     NKR_lengthOfArray = 0;
                     NKR_drawCircle(0.0, 0.0, NKR_xradius, NKR_yradius);						 
                    
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_position);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_arrayOfVertices), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);		 
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_color);
                     NKR_gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 1.0);
                     NKR_gl.disableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_texcoords);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_quadTexCoords), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);	
                     
                     NKR_gl.drawArrays(NKR_gl.LINE_LOOP, 0, NKR_lengthOfArray );	
                 }
                 
             NKR_gl.bindVertexArray(null);
                 
             NKR_gl.useProgram(null);
             
             //Case Space
             gl.useProgram(RRJ_shaderProgramObject_PS);	
              RRJ_Space(); 
             gl.useProgram(null);     
             
             gl.useProgram(NKR_pointProgram);	
              drawPoint(); 
             gl.useProgram(null); 
             
             AMC_SceneGodCounter += 0.00018;
            if(AMC_SceneGodCounter > 0.30)
            {
                AMC_SceneNumber = 3;
                AMC_SceneGodCounter = 0.0;
            }
         break;
         
         case 3:
         
              //Case Saturn
             // For regular drawing
             NKR_gl.useProgram(NKR_normalProgram); 
             
             // Draw the saturn and rings (for regular drawing)	 
             
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);	 
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
             
             NKR_gl.bindVertexArray(NKR_vao_sphere);	    
                NKR_gl.bindBuffer(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_vbo_elements);
                NKR_gl.bufferData(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_indices, NKR_gl.DYNAMIC_DRAW);
                NKR_gl.drawElements(NKR_gl.TRIANGLES, NKR_noofElements, NKR_gl.UNSIGNED_SHORT, 0);
             NKR_gl.bindVertexArray(null);
             
             //Case Saturn Rings
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);

             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);

             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
                
             NKR_gl.bindVertexArray(NKR_vao_rings);
                 
                 for(var NKR_xradius = 2.0, NKR_yradius = 1.5 ; NKR_xradius > 1.0, NKR_yradius > 1.0 ; NKR_xradius = NKR_xradius-0.01, NKR_yradius=NKR_yradius-0.01)
                 {
                     NKR_arrayOfVertices = [];
                     NKR_quadTexCoords = [];
                     NKR_lengthOfArray = 0;
                     NKR_drawCircle(0.0, 0.0, NKR_xradius, NKR_yradius);						 
                    
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_position);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_arrayOfVertices), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);		 
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_color);
                     NKR_gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 1.0);
                     NKR_gl.disableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_texcoords);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_quadTexCoords), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);	
                     
                     NKR_gl.drawArrays(NKR_gl.LINE_LOOP, 0, NKR_lengthOfArray );	
                 }
                 
             NKR_gl.bindVertexArray(null);
                 
             NKR_gl.useProgram(null);
             
             //Case Space
             gl.useProgram(RRJ_shaderProgramObject_PS);	
              RRJ_Space(); 
             gl.useProgram(null);     
  
             gl.useProgram(NKR_pointProgram);	
              drawPoint(); 
             gl.useProgram(null);
             
             AMC_SceneGodCounter += 0.00018;
            if(AMC_SceneGodCounter > 0.21)
            {
                AMC_SceneNumber = 4;
                AMC_SceneGodCounter = 0.0;
            }
         break;
         case 4:
         
            //Case Saturn
             // For regular drawing
             NKR_gl.useProgram(NKR_normalProgram); 
             
             // Draw the saturn and rings (for regular drawing)	 
             
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);	 
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
             
             NKR_gl.bindVertexArray(NKR_vao_sphere);	    
                NKR_gl.bindBuffer(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_vbo_elements);
                NKR_gl.bufferData(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_indices, NKR_gl.DYNAMIC_DRAW);
                NKR_gl.drawElements(NKR_gl.TRIANGLES, NKR_noofElements, NKR_gl.UNSIGNED_SHORT, 0);
             NKR_gl.bindVertexArray(null);
             
             //Case Saturn Rings
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);

             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);

             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
                
             NKR_gl.bindVertexArray(NKR_vao_rings);
                 
                 for(var NKR_xradius = 2.0, NKR_yradius = 1.5 ; NKR_xradius > 1.0, NKR_yradius > 1.0 ; NKR_xradius = NKR_xradius-0.01, NKR_yradius=NKR_yradius-0.01)
                 {
                     NKR_arrayOfVertices = [];
                     NKR_quadTexCoords = [];
                     NKR_lengthOfArray = 0;
                     NKR_drawCircle(0.0, 0.0, NKR_xradius, NKR_yradius);						 
                    
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_position);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_arrayOfVertices), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);		 
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_color);
                     NKR_gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 1.0);
                     NKR_gl.disableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_texcoords);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_quadTexCoords), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);	
                     
                     NKR_gl.drawArrays(NKR_gl.LINE_LOOP, 0, NKR_lengthOfArray );	
                 }
                 
             NKR_gl.bindVertexArray(null);
                 
             NKR_gl.useProgram(null);
             
             //Case Space
             gl.useProgram(RRJ_shaderProgramObject_PS);	
              RRJ_Space(); 
             gl.useProgram(null);          
             
         
         //Case nerve cell drawing************
            mat4.identity(modelViewProjectionMatrix);
            mat4.identity(translationMatrix);
                 
            NKR_gl.useProgram(VVK_shaderProgramObject);
             
            //perform translation
            mat4.translate(translationMatrix, translationMatrix, [xTranslateNerveSaturn, 0.0, zTranslateNerveSaturn]);
            mat4.scale(scaleMatrix, translationMatrix, [scaleFactorNerve, scaleFactorNerve, scaleFactorNerve]);
            if(RRJ_iChange == 1 || RRJ_iChange == 2)
                mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
            else if(RRJ_iChange == 3 || RRJ_iChange ==4)
                mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);
            
            //push data into matrices
            mat4.multiply(modelViewProjectionMatrix, rotateMatrix, modelViewProjectionMatrix);
            mat4.multiply(modelViewProjectionMatrix, NKR_viewProjMatrix, modelViewProjectionMatrix);
                 
             //provide mvp to shader
             NKR_gl.uniformMatrix4fv(VVK_mvpUniform, false, modelViewProjectionMatrix);
             //Bind to vertex array object and draw the geometry of: Body of Nerve Cell.
             NKR_gl.bindVertexArray(vvk_vao_nervecell_body);

             NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfCurvePoints);

             NKR_gl.bindVertexArray(null);

             NKR_gl.bindVertexArray(vvk_vao_nervecell_dendrons);

             NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfDendronPoints);

             NKR_gl.bindVertexArray(null);
                 
             NKR_gl.useProgram(null);
             //nerve cell drawing************
             
            AMC_SceneGodCounter += 0.00018;
            if(AMC_SceneGodCounter > 0.13)
            {
                AMC_SceneNumber = 5;
                AMC_SceneGodCounter = 0.0;
            }
              
         break;
         
         case 5:
         
                //Case Saturn
             // For regular drawing
             NKR_gl.useProgram(NKR_normalProgram); 
             
             // Draw the saturn and rings (for regular drawing)	 
             
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);	 
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
             
             NKR_gl.bindVertexArray(NKR_vao_sphere);	    
                NKR_gl.bindBuffer(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_vbo_elements);
                NKR_gl.bufferData(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_indices, NKR_gl.DYNAMIC_DRAW);
                NKR_gl.drawElements(NKR_gl.TRIANGLES, NKR_noofElements, NKR_gl.UNSIGNED_SHORT, 0);
             NKR_gl.bindVertexArray(null);
             
             //Case Saturn Rings
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);

             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);

             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
                
             NKR_gl.bindVertexArray(NKR_vao_rings);
                 
                 for(var NKR_xradius = 2.0, NKR_yradius = 1.5 ; NKR_xradius > 1.0, NKR_yradius > 1.0 ; NKR_xradius = NKR_xradius-0.01, NKR_yradius=NKR_yradius-0.01)
                 {
                     NKR_arrayOfVertices = [];
                     NKR_quadTexCoords = [];
                     NKR_lengthOfArray = 0;
                     NKR_drawCircle(0.0, 0.0, NKR_xradius, NKR_yradius);						 
                    
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_position);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_arrayOfVertices), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);		 
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_color);
                     NKR_gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 1.0);
                     NKR_gl.disableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_texcoords);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_quadTexCoords), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);	
                     
                     NKR_gl.drawArrays(NKR_gl.LINE_LOOP, 0, NKR_lengthOfArray );	
                 }
                 
             NKR_gl.bindVertexArray(null);
                 
             NKR_gl.useProgram(null);
             
             //Case Space
             gl.useProgram(RRJ_shaderProgramObject_PS);	
              RRJ_Space(); 
             gl.useProgram(null);
             
             //Case nerve cell drawing************
            mat4.identity(modelViewProjectionMatrix);
            mat4.identity(translationMatrix);
                 
            NKR_gl.useProgram(VVK_shaderProgramObject);
             
            //perform translation
            mat4.translate(translationMatrix, translationMatrix, [xTranslateNerveSaturn, 0.0, zTranslateNerveSaturn]);
            mat4.scale(scaleMatrix, translationMatrix, [scaleFactorNerve, scaleFactorNerve, scaleFactorNerve]);
            if(RRJ_iChange == 1 || RRJ_iChange == 2)
                mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
            else if(RRJ_iChange == 3 || RRJ_iChange ==4)
                mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);
            
            //push data into matrices
            mat4.multiply(modelViewProjectionMatrix, rotateMatrix, modelViewProjectionMatrix);
            mat4.multiply(modelViewProjectionMatrix, NKR_viewProjMatrix, modelViewProjectionMatrix);
                 
             //provide mvp to shader
             NKR_gl.uniformMatrix4fv(VVK_mvpUniform, false, modelViewProjectionMatrix);
             //Bind to vertex array object and draw the geometry of: Body of Nerve Cell.
             NKR_gl.bindVertexArray(vvk_vao_nervecell_body);

             NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfCurvePoints);

             NKR_gl.bindVertexArray(null);

             NKR_gl.bindVertexArray(vvk_vao_nervecell_dendrons);

             NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfDendronPoints);

             NKR_gl.bindVertexArray(null);
                 
             NKR_gl.useProgram(null);
             //nerve cell drawing************
             
             
             
         
             //Case Chip
              drawChipCircuit();
              
             AMC_SceneGodCounter += 0.00018;
            if(AMC_SceneGodCounter > 0.25)
            {
                AMC_SceneNumber = 6;
                AMC_SceneGodCounter = 0.0;
            }
         break;
         
         
         
         case 6:
         
            if(NKR_yRotate < 3.0)
            {
                NKR_yRotate = NKR_yRotate + 0.015;
            }
            else
            {
                NKR_yRotate = 0.5;
            }
              //Case Saturn
             // For regular drawing
             NKR_gl.useProgram(NKR_normalProgram); 
             
             // Draw the saturn and rings (for regular drawing)	 
             
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);
             
             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);	 
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
             
             NKR_gl.bindVertexArray(NKR_vao_sphere);	    
                NKR_gl.bindBuffer(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_vbo_elements);
                NKR_gl.bufferData(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_indices, NKR_gl.DYNAMIC_DRAW);
                NKR_gl.drawElements(NKR_gl.TRIANGLES, NKR_noofElements, NKR_gl.UNSIGNED_SHORT, 0);
             NKR_gl.bindVertexArray(null);
             
             //Case Saturn Rings
             NKR_gl.uniformMatrix4fv(NKR_mvpFromLightUniform_R, false, NKR_viewProjMatrixFromLight);
             NKR_gl.uniformMatrix4fv(NKR_mvpUniform_R, false, mvp_Saturn);

             NKR_gl.activeTexture(NKR_gl.TEXTURE0); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
             NKR_gl.uniform1i(NKR_diffuseTextureUniform, 0);

             NKR_gl.activeTexture(NKR_gl.TEXTURE1); // Set a texture object to the texture unit
             NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);
             NKR_gl.uniform1i(NKR_shadowMapUniform_R, 1);
                
             NKR_gl.bindVertexArray(NKR_vao_rings);
                 
                 for(var NKR_xradius = 2.0, NKR_yradius = 1.5 ; NKR_xradius > 1.0, NKR_yradius > 1.0 ; NKR_xradius = NKR_xradius-0.01, NKR_yradius=NKR_yradius-0.01)
                 {
                     NKR_arrayOfVertices = [];
                     NKR_quadTexCoords = [];
                     NKR_lengthOfArray = 0;
                     NKR_drawCircle(0.0, 0.0, NKR_xradius, NKR_yradius);						 
                    
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_position);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_arrayOfVertices), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);		 
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_color);
                     NKR_gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 1.0);
                     NKR_gl.disableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
                     
                     NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_texcoords);
                     NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, new Float32Array(NKR_quadTexCoords), NKR_gl.DYNAMIC_DRAW);
                     NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2, NKR_gl.FLOAT, false, 0, 0);	
                     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);	
                     
                     NKR_gl.drawArrays(NKR_gl.LINE_LOOP, 0, NKR_lengthOfArray );	
                 }
                 
             NKR_gl.bindVertexArray(null);
                 
             NKR_gl.useProgram(null);
             
             //Case Space
             gl.useProgram(RRJ_shaderProgramObject_PS);	
              RRJ_Space(); 
             gl.useProgram(null);
             
             //Case nerve cell drawing************
            mat4.identity(modelViewProjectionMatrix);
            mat4.identity(translationMatrix);
                 
            NKR_gl.useProgram(VVK_shaderProgramObject);
             
            //perform translation
            mat4.translate(translationMatrix, translationMatrix, [xTranslateNerveSaturn, 0.0, zTranslateNerveSaturn]);
            mat4.scale(scaleMatrix, translationMatrix, [scaleFactorNerve, scaleFactorNerve, scaleFactorNerve]);
            if(RRJ_iChange == 1 || RRJ_iChange == 2)
                mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
            else if(RRJ_iChange == 3 || RRJ_iChange ==4)
                mat4.rotate(rotateMatrix, scaleMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);
            
            //push data into matrices
            mat4.multiply(modelViewProjectionMatrix, rotateMatrix, modelViewProjectionMatrix);
            mat4.multiply(modelViewProjectionMatrix, NKR_viewProjMatrix, modelViewProjectionMatrix);
                 
             //provide mvp to shader
             NKR_gl.uniformMatrix4fv(VVK_mvpUniform, false, modelViewProjectionMatrix);
             //Bind to vertex array object and draw the geometry of: Body of Nerve Cell.
             NKR_gl.bindVertexArray(vvk_vao_nervecell_body);

             NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfCurvePoints);

             NKR_gl.bindVertexArray(null);

             NKR_gl.bindVertexArray(vvk_vao_nervecell_dendrons);

             NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfDendronPoints);

             NKR_gl.bindVertexArray(null);
                 
             NKR_gl.useProgram(null);
             //nerve cell drawing************             
             
             //Case Chip
              drawChipCircuit();
         
              //Case Text
              drawTextRendering();             
              
         break;
         
         
     }
     //_______________________________________________________________________________________
	
     
}//draw()
//drawNerveCell()***************************************************************************************//
function drawNerveCell()
{
	//variables
	
	//matrices
	var modelViewMatrix = mat4.create();
	var modelViewProjectionMatrix = mat4.create();
	var translationMatrix = mat4.create();
	
	
	//code
	NKR_gl.viewport(0, 0, NKR_canvas.width, NKR_canvas.height);
	
	NKR_gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
	NKR_gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	NKR_gl.useProgram(VVK_shaderProgramObject);
	
		//************************* Draw: Nerve Cell Body **********************//
	
		//perform translation
		mat4.translate(translationMatrix, translationMatrix, [0.0, 0.0, 0.0]);
		
		//push data into matrices
	    mat4.multiply(modelViewMatrix, translationMatrix, modelViewMatrix);
	    mat4.multiply(modelViewMatrix, modelViewMatrix, NKR_viewProjMatrix);
		mat4.multiply(modelViewProjectionMatrix, VVK_perspectiveProjectionMatrix, modelViewMatrix);
		
		//provide mvp to shader
		NKR_gl.uniformMatrix4fv(VVK_mvpUniform, false, NKR_viewProjMatrix);
		
		NKR_gl.lineWidth(5.0);
	
		//Bind to vertex array object and draw the geometry of: Body of Nerve Cell.
		NKR_gl.bindVertexArray(vvk_vao_nervecell_body);
	
			NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfCurvePoints);
	
		NKR_gl.bindVertexArray(null);
	
		//************************* Draw: Nerve Cell Dendrons **********************//
		mat4.identity(translationMatrix);
		mat4.identity(modelViewMatrix);
		mat4.identity(modelViewProjectionMatrix);
	
		mat4.translate(translationMatrix, translationMatrix, [0.0, 0.0, 0.0]);
	
		mat4.multiply(modelViewMatrix, translationMatrix, modelViewMatrix);
	    mat4.multiply(modelViewMatrix, modelViewMatrix, NKR_viewProjMatrix);
		mat4.multiply(modelViewProjectionMatrix, VVK_perspectiveProjectionMatrix, modelViewMatrix);
		
	    
		NKR_gl.uniformMatrix4fv(VVK_mvpUniform, false, NKR_viewProjMatrix);
	
		NKR_gl.bindVertexArray(vvk_vao_nervecell_dendrons);
	
			NKR_gl.drawArrays(NKR_gl.LINES, 0, vvk_numberOfDendronPoints);
	
		NKR_gl.bindVertexArray(null);
		//************************* End Of Drawing *******************************//
		
	NKR_gl.useProgram(null);
	
}
//******************************************************************************************************//
function NKR_drawCircle(NKR_cx, NKR_cy, NKR_xRadius, NKR_yRadius)
{
		
	for( var NKR_i = 0 , NKR_index = 0, NKR_j = 0; NKR_i <= 360 ; NKR_i++, NKR_index = NKR_index + 3, NKR_j = NKR_j + 2 )
	{
		NKR_lengthOfArray++;
		var NKR_degInRad=NKR_degreeToRadians(NKR_i);
		NKR_arrayOfVertices[NKR_index] = NKR_cx + NKR_xRadius * Math.cos(NKR_degInRad);
		NKR_arrayOfVertices[NKR_index+1] = 0.25;
		NKR_arrayOfVertices[NKR_index+2] = NKR_cy + NKR_yRadius * Math.sin(NKR_degInRad);
		
		NKR_quadTexCoords[NKR_j] = 1.0;
		NKR_quadTexCoords[NKR_j+1] = 1.0;
	}
	
}

//update()**************************************************************************//
function update()
{	
	
}//update()

//NKR_degreeToRadians()**************************************************************************//
function NKR_degreeToRadians(NKR_angleInDegrees)
{	
	return(NKR_angleInDegrees * Math.PI/180.0);
	
}//degrees()

//resize()**************************************************************************//
function resize()
{
	if(NKR_bFullscreen==true)
	{
		NKR_canvas.width=window.innerWidth;
		NKR_canvas.height=window.innerHeight;
	}
	else
	{
		NKR_canvas.width = NKR_canvas_original_width;
		NKR_canvas.height = NKR_canvas_original_height;
	}
	//set the viewport to match, since there is no default "repaint()" or "redraw()" function.
	
}//resize()


//initSaturn()**************************************************************************// 
function initSaturn()
{
	NKR_gl = NKR_canvas.getContext( 'webgl2', { antialias: false } );
	
	if(NKR_gl==null)
	{
		console.log("\n Obtaining WebGL Rendenring Context Failed!! \n");
		return; //Terminate the program, as there is no use of proceeding further as no rendering context has been created!!
	}
	
	//console.log('WebGL version: ', gl.getParameter(gl.VERSION));
	//console.log('WebGL vendor : ', gl.getParameter(gl.VENDOR));
	//console.log('WebGL supported extensions: ', gl.getSupportedExtensions());	
		 
	//After getting the context, define the viewport
	NKR_gl.viewportWidth = NKR_canvas.width;
	NKR_gl.viewportHeight = NKR_canvas.height;
	
	//For "gl" calls!
	gl=NKR_gl;
    
    NKR_MatrixCreditSong = document.createElement("audio");
    NKR_MatrixCreditSong.src = "AMC_Final.wav";
    
    NKR_PlayAudio = true;
    
    RRJ_modelViewMatrix = mat4.create();
    RRJ_modelViewMatrix_PS = mat4.create();
    RRJ_modelViewProjectionMatrix = mat4.create();
    RRJ_modelViewProjectionMatrix_PS = mat4.create();
    
	//NKR_MatrixCreditSong.play();
    
	// Shadow.js
   // Vertex shader program to generate a shadow map
   var NKR_SHADOW_VSHADER_SOURCE =
    '#version 300 es'+
	'\n'+
	'precision highp float;'+
	'uniform mat4 u_MvpMatrix;'+
	'in vec4 a_Position;'+
     'void main() {\n' +
     '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '}\n';
	
	NKR_vertexShaderObject = NKR_gl.createShader(NKR_gl.VERTEX_SHADER);
	NKR_gl.shaderSource(NKR_vertexShaderObject, NKR_SHADOW_VSHADER_SOURCE);
	NKR_gl.compileShader(NKR_vertexShaderObject);
	
	//Compilation Error Handling
	if(NKR_gl.getShaderParameter(NKR_vertexShaderObject,NKR_gl.COMPILE_STATUS)==false)
	{
		var error=NKR_gl.getShaderInfoLog(NKR_vertexShaderObject);
		if(error.length > 0)
		{
			alert("vertex compiling "+error);
			uninitialize();
		}
		
	}	//Vertex shader compilation error handling
	
	// Fragment shader program for creating a shadow map
  var NKR_SHADOW_FSHADER_SOURCE =
    '#version 300 es'+
	'\n'+
	'precision highp float;'+
	'out vec4 fragColor;'+
    'void main() {\n' +
    '  fragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);\n' +                      
    '}\n';		
	
	NKR_fragmentShaderObject=NKR_gl.createShader(NKR_gl.FRAGMENT_SHADER);
	NKR_gl.shaderSource(NKR_fragmentShaderObject, NKR_SHADOW_FSHADER_SOURCE);
	NKR_gl.compileShader(NKR_fragmentShaderObject);
	
	//Compilation Error Handling
	if(NKR_gl.getShaderParameter(NKR_fragmentShaderObject,NKR_gl.COMPILE_STATUS)==false)
	{
		var error=NKR_gl.getShaderInfoLog(NKR_fragmentShaderObject);
		if(error.length > 0)
		{
			alert("fragment compiling "+error);
			uninitialize();
		}
		
	}//Error handling for fragment Shader 
	
	//Define the Shader Program
	NKR_shadowProgram = NKR_gl.createProgram();
	NKR_gl.attachShader(NKR_shadowProgram, NKR_vertexShaderObject);
	NKR_gl.attachShader(NKR_shadowProgram, NKR_fragmentShaderObject);
	
	//Before linking the program, initializing the shader variables	
	NKR_gl.bindAttribLocation(NKR_shadowProgram, AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, "a_Position");
	
	//Linking 
	NKR_gl.linkProgram(NKR_shadowProgram);
	//Handling Link Errors
	if(NKR_gl.getProgramParameter(NKR_shadowProgram,NKR_gl.LINK_STATUS)==false)
	{
		var error=NKR_gl.getProgramInfoLog(NKR_shadowProgram);
		if(error.length > 0)
		{
			alert("linking "+error);
			uninitialize();
		}
	}//Shader Program Link Error Handling
	//Post link, tranferring the data to shader's in the form on "uniforms"
	
	NKR_mvpUniform = NKR_gl.getUniformLocation(NKR_shadowProgram,"u_MvpMatrix");
	
	//-------------------------------------------------------------------------------------
	// Vertex shader program for regular drawing
  var NKR_VSHADER_SOURCE =
    '#version 300 es'+
	'\n'+
	'precision highp float;'+
	'in vec4 a_Position;'+
	'in vec4 a_Color;'+
	'in vec2 a_Texcoords;'+
	'in vec3 a_Normals;'+
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_MvpMatrixFromLight;\n' +
    'out vec4 v_PositionFromLight;\n' +
    'out vec4 v_Color;\n' +
	'out vec2 v_Texcoords;'+
	'out vec3 v_Normals;'+
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_PositionFromLight = u_MvpMatrixFromLight * a_Position;\n' +
    '  v_Color = a_Color;\n' +
	'  v_Texcoords = a_Texcoords;'+
	'  v_Normals = a_Normals;'+
    '}\n';
	
	NKR_vertexShaderObject = NKR_gl.createShader(NKR_gl.VERTEX_SHADER);
	NKR_gl.shaderSource(NKR_vertexShaderObject, NKR_VSHADER_SOURCE);
	NKR_gl.compileShader(NKR_vertexShaderObject);
	
	//Compilation Error Handling
	if(NKR_gl.getShaderParameter(NKR_vertexShaderObject,NKR_gl.COMPILE_STATUS)==false)
	{
		var error=NKR_gl.getShaderInfoLog(NKR_vertexShaderObject);
		if(error.length > 0)
		{
			alert("vertex compiling "+error);
			uninitialize();
		}
		
	}//Vertex shader compilation error handling
	
	// Fragment shader program for regular drawing
    var NKR_FSHADER_SOURCE =
		'#version 300 es'+
		'\n'+
		'precision highp float;'+
		'uniform sampler2D u_ShadowMap;\n' +
		"uniform sampler2D diffuseTexture;"+
		'in vec4 v_PositionFromLight;\n' +
		'in vec4 v_Color;\n' +
		'in vec2 v_Texcoords;'+
		'in vec3 v_Normals;'+
		'out vec4 fragColor;'+
		'void main() {\n' +
		'  vec3 shadowCoord =(v_PositionFromLight.xyz/v_PositionFromLight.w) / 2.0 + 0.5;\n' +
		'  vec4 rgbaDepth = texture(u_ShadowMap, shadowCoord.xy);\n' +
		'  float depth = rgbaDepth.r;\n' + // Retrieve the z value from R
		'  float visibility = (shadowCoord.z > depth + 0.005) ? 0.3:1.0;\n'+ 
		"  vec3 normal = normalize( v_Normals);"+
		"  vec3 lightDir = normalize(v_PositionFromLight.xyz);"+
		'	vec3 texColor = texture(diffuseTexture, v_Texcoords).rgb;'+		
		"   vec3 lightColor = vec3(0.5);"+
		"   vec3 ambient = 0.5 * texColor;"+		
		"   float diff = max(dot(lightDir, normal), 0.0);"+
		"   vec3 diffuse = diff * lightColor;"+
		"   vec3 viewDir = normalize(v_PositionFromLight.xyz);"+
		"   vec3 reflectDir = reflect(-lightDir, normal);"+
		"	float spec = 128.0;"+
		"	vec3 halfwayDir = normalize(lightDir + viewDir);"+
		"	spec = pow(max(dot(normal, halfwayDir), 0.0), 128.0);"+
		"	vec3 specular = spec * lightColor;"+
		"	vec3 lighting = (ambient +  (diffuse + specular));"+
		'  fragColor = vec4(v_Color.rgb * lighting * texColor * visibility, v_Color.a);\n' +
		'}\n';		
	
	
	NKR_fragmentShaderObject = NKR_gl.createShader(NKR_gl.FRAGMENT_SHADER);
	NKR_gl.shaderSource(NKR_fragmentShaderObject, NKR_FSHADER_SOURCE);
	NKR_gl.compileShader(NKR_fragmentShaderObject);
	
	//Compilation Error Handling
	if(NKR_gl.getShaderParameter(NKR_fragmentShaderObject,NKR_gl.COMPILE_STATUS)==false)
	{
		var error=NKR_gl.getShaderInfoLog(NKR_fragmentShaderObject);
		if(error.length > 0)
		{
			alert("fragment compiling "+error);
			uninitialize();
		}
		
	}//Error handling for fragment Shader 
	
	//Define the Shader Program
	NKR_normalProgram=NKR_gl.createProgram();
	NKR_gl.attachShader(NKR_normalProgram, NKR_vertexShaderObject);
	NKR_gl.attachShader(NKR_normalProgram, NKR_fragmentShaderObject);
	
	//Before linking the program, initializing the shader variables
	
	NKR_gl.bindAttribLocation(NKR_normalProgram, AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, "a_Position");
	NKR_gl.bindAttribLocation(NKR_normalProgram, AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, "a_Color");
	NKR_gl.bindAttribLocation(NKR_normalProgram, AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "a_Texcoords");
	NKR_gl.bindAttribLocation(NKR_normalProgram, AMC_WebGLMacros.AMC_ATTRIBUTE_NORMAL, "a_Normals");
	
	//Linking 
	NKR_gl.linkProgram(NKR_normalProgram);
	
	//Handling Link Errors
	if(NKR_gl.getProgramParameter(NKR_normalProgram,NKR_gl.LINK_STATUS)==false)
	{
		var error=NKR_gl.getProgramInfoLog(NKR_normalProgram);
		if(error.length > 0)
		{
			alert("linking "+error);
			uninitialize();
		}
	}//Shader Program Link Error Handling
	
	//Post link, tranferring the data to shader's in the form on "uniforms"
	NKR_mvpUniform_R = NKR_gl.getUniformLocation(NKR_normalProgram,"u_MvpMatrix");
	NKR_mvpFromLightUniform_R = NKR_gl.getUniformLocation(NKR_normalProgram,"u_MvpMatrixFromLight");
	NKR_shadowMapUniform_R = NKR_gl.getUniformLocation(NKR_normalProgram,"u_ShadowMap");
	NKR_diffuseTextureUniform = NKR_gl.getUniformLocation(NKR_normalProgram,"diffuseTexture");
	
	NKR_noofElements = NKR_initVertexBuffers();
	
	//************** Define vao_sphere ******************************//	
	
	NKR_vao_sphere = NKR_gl.createVertexArray();
	NKR_gl.bindVertexArray(NKR_vao_sphere);

		 NKR_vbo_position=NKR_gl.createBuffer();	
		 NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_position);
		 NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, NKR_vertexPositions, NKR_gl.DYNAMIC_DRAW);
		 NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, NKR_gl.FLOAT, false, 0, 0);	
		 NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);		

		 NKR_vbo_normals = NKR_gl.createBuffer();	
		 NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_normals);
		 NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, NKR_normals, NKR_gl.DYNAMIC_DRAW);
		 NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_NORMAL,3, NKR_gl.FLOAT, false, 0, 0);	
		 NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_NORMAL);	
		 
		NKR_vbo_color=NKR_gl.createBuffer();	
		NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_color);
		NKR_gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 0.0);
		NKR_gl.disableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);

		NKR_vbo_texcoords=NKR_gl.createBuffer();	
		 NKR_gl.bindBuffer(NKR_gl.ARRAY_BUFFER, NKR_vbo_texcoords);
		 NKR_gl.bufferData(NKR_gl.ARRAY_BUFFER, NKR_textureCoords, NKR_gl.DYNAMIC_DRAW);
		 NKR_gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2, NKR_gl.FLOAT, false, 0, 0);	
	     NKR_gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
		
		NKR_vbo_elements = NKR_gl.createBuffer();
		NKR_gl.bindBuffer(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_vbo_elements);
		NKR_gl.bufferData(NKR_gl.ELEMENT_ARRAY_BUFFER, NKR_indices, NKR_gl.DYNAMIC_DRAW);

   	NKR_gl.bindVertexArray(null);
	
	NKR_vao_rings = NKR_gl.createVertexArray();
	NKR_gl.bindVertexArray(NKR_vao_rings);	  
		NKR_vbo_position=NKR_gl.createBuffer();
		NKR_vbo_texcoords=NKR_gl.createBuffer();
		NKR_vbo_color=NKR_gl.createBuffer();		 
   	NKR_gl.bindVertexArray(null);
		
	NKR_initFramebufferObject();														//User defined?
	
	NKR_saturnTexture = NKR_gl.createTexture();
	NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_saturnTexture);
	NKR_gl.texParameterf(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_WRAP_S, NKR_gl.REPEAT);
	NKR_gl.texParameterf(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_WRAP_T, NKR_gl.REPEAT);
	NKR_gl.texParameterf(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_MAG_FILTER, NKR_gl.LINEAR); 
	NKR_gl.texParameterf(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_MIN_FILTER, NKR_gl.LINEAR_MIPMAP_NEAREST);
	NKR_gl.texParameteri(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_MIN_FILTER, NKR_gl.LINEAR);
	NKR_gl.texParameteri(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_MAG_FILTER, NKR_gl.NEAREST);
	NKR_gl.texImage2D(
		NKR_gl.TEXTURE_2D, 0, NKR_gl.RGBA, NKR_gl.RGBA,
		NKR_gl.UNSIGNED_BYTE,
		document.getElementById('saturn')
	);
	NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, null);
	
	// Enable Depth Statements *******		
	NKR_gl.clearDepth(1.0); //Set up the "Depth Buffer"	
	NKR_gl.enable(NKR_gl.DEPTH_TEST); //Enable Depth Testing	
	NKR_gl.depthFunc(NKR_gl.LEQUAL); //Which depth test to do?		
	
}//initSaturn()

function NKR_initFramebufferObject() {
   
    NKR_depthMapFBO = NKR_gl.createFramebuffer();
	NKR_depthMap = NKR_gl.createTexture();
	NKR_gl.bindTexture(NKR_gl.TEXTURE_2D, NKR_depthMap);
	NKR_gl.texImage2D(
		NKR_gl.TEXTURE_2D, 0, NKR_gl.DEPTH_COMPONENT16, NKR_OFFSCREEN_WIDTH,
		NKR_OFFSCREEN_HEIGHT, 0, NKR_gl.DEPTH_COMPONENT, NKR_gl.UNSIGNED_SHORT, null);
	
	NKR_gl.texParameterf(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_WRAP_S, NKR_gl.CLAMP_TO_EDGE);
	NKR_gl.texParameterf(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_WRAP_T, NKR_gl.CLAMP_TO_EDGE);
	NKR_gl.texParameterf(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_MAG_FILTER, NKR_gl.NEAREST); 
	NKR_gl.texParameterf(NKR_gl.TEXTURE_2D, NKR_gl.TEXTURE_MIN_FILTER, NKR_gl.NEAREST);
	
	NKR_gl.bindFramebuffer(NKR_gl.FRAMEBUFFER, NKR_depthMapFBO);
	NKR_gl.framebufferTexture2D(NKR_gl.DRAW_FRAMEBUFFER, NKR_gl.DEPTH_ATTACHMENT, NKR_gl.TEXTURE_2D, NKR_depthMap, 0);
	NKR_gl.drawBuffers([NKR_gl.NONE]);
	NKR_gl.readBuffer(NKR_gl.NONE);
	NKR_gl.bindFramebuffer(NKR_gl.FRAMEBUFFER, null); 
 }
 
function uninitialize()
{	
	if(VVK_shaderProgramObject)
	{
		if(VVK_fragmentShaderObject)
		{
			NKR_gl.detachShader(VVK_shaderProgramObject, VVK_fragmentShaderObject);
			NKR_gl.deleteShader(VVK_fragmentShaderObject);
			VVK_fragmentShaderObject=null;
		}
		
		if(VVK_vertexShaderObject)
		{
			NKR_gl.detachShader(VVK_shaderProgramObject, VVK_vertexShaderObject);
			NKR_gl.deleteShader(VVK_vertexShaderObject);
			VVK_vertexShaderObject=null;
		}
		NKR_gl.deleteProgram(VVK_shaderProgramObject);
		VVK_shaderProgramObject=null;
		
	}//VVK_shaderProgramObject
	
	if(NKR_shadowProgram)
	{
		if(NKR_fragmentShaderObject)
		{
			NKR_gl.detachShader(NKR_shadowProgram, NKR_fragmentShaderObject);
			NKR_gl.deleteShader(NKR_fragmentShaderObject);
			NKR_fragmentShaderObject=null;
		}
		
		if(NKR_vertexShaderObject)
		{
			NKR_gl.detachShader(NKR_shadowProgram, NKR_vertexShaderObject);
			NKR_gl.deleteShader(NKR_vertexShaderObject);
			NKR_vertexShaderObject=null;
		}
		NKR_gl.deleteProgram(NKR_shadowProgram);
		NKR_shadowProgram=null;
		
	}//shadowProgram	
	
	if(NKR_normalProgram)
	{
		if(NKR_fragmentShaderObject)
		{
			NKR_gl.detachShader(NKR_normalProgram, NKR_fragmentShaderObject);
			NKR_gl.deleteShader(NKR_fragmentShaderObject);
			NKR_fragmentShaderObject=null;
		}
		
		if(NKR_vertexShaderObject)
		{
			NKR_gl.detachShader(NKR_normalProgram, NKR_vertexShaderObject);
			NKR_gl.deleteShader(NKR_vertexShaderObject);
			vertexShaderObject=null;
		}
		NKR_gl.deleteProgram(NKR_normalProgram);
		NKR_normalProgram=null;
		
	}//normalProgram
    
    uninitializeChipCircuit();
    uninitializeTextRendering();
    uninitialize_PS();
}

function NKR_initVertexBuffers() 
{
    let latitudeBands = 50;
    let longitudeBands = 50;
    let radius = 1;

    var vertexPositionData = [];
    var normalData = [];
    let textureCoordData = [];
    let indexData = [];

    // Calculate sphere vertex positions, normals, and texture coordinates.
    for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
      let theta = latNumber * Math.PI / latitudeBands;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);

      for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
        let phi = longNumber * 2 * Math.PI / longitudeBands;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);

        let x = cosPhi * sinTheta;
        let y = 0.2 + cosTheta;
        let z = sinPhi * sinTheta;

        let u = 1 - (longNumber / longitudeBands);
        let v = 1 - (latNumber / latitudeBands);

        vertexPositionData.push(radius * x);
        vertexPositionData.push(radius * y);
        vertexPositionData.push(radius * z);

        normalData.push(x);
        normalData.push(y);
        normalData.push(z);

        textureCoordData.push(u);
        textureCoordData.push(v);
      }
    }

    // Calculate sphere indices.
    for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
      for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
        let first = (latNumber * (longitudeBands + 1)) + longNumber;
        let second = first + longitudeBands + 1;

        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);

        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }

    NKR_vertexPositions = new Float32Array(vertexPositionData);
    NKR_normals = new Float32Array(normalData);
    NKR_textureCoords = new Float32Array(textureCoordData);
    NKR_indices = new Uint16Array(indexData);
	
	return indexData.length;
 }
 
 //initChipCircuit()****************************
 function initChipCircuit()
 {
     RRJ_vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);

	var RRJ_vertexShaderCode = 
		"#version 300 es" +
		"\n" +
		"in vec4 vPosition;" +
		"in vec4 vColor;" +
		"out vec4 outColor;" +
		"uniform float u_point_size;" +
		"uniform mat4 u_mvp_matrix;" +
		"void main(void) " +
		"{" +
			"gl_PointSize = u_point_size;"  +
			"gl_Position = u_mvp_matrix * vPosition;" +
			"outColor = vColor;" +

		"}";

	gl.shaderSource(RRJ_vertexShaderObject, RRJ_vertexShaderCode);
	gl.compileShader(RRJ_vertexShaderObject);
	if(gl.getShaderParameter(RRJ_vertexShaderObject, gl.COMPILE_STATUS) == false){
		var RRJ_error = gl.getShaderInfoLog(RRJ_vertexShaderObject);
		if(RRJ_error.length > 0){
			alert("Vertex Shade Compilation Error: " + RRJ_error);
			uninitialize();
		}
	}


	RRJ_fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);

	var RRJ_fragmentShaderCode = 
		"#version 300 es" +
		"\n" +
		"precision highp float;" +
		"in vec4 outColor;" +
		"out vec4 FragColor;" +
		"void main(void) " +
		"{" +
			"FragColor = outColor;" +
		"}";

	gl.shaderSource(RRJ_fragmentShaderObject, RRJ_fragmentShaderCode);
	gl.compileShader(RRJ_fragmentShaderObject);

	if(gl.getShaderParameter(RRJ_fragmentShaderObject, gl.COMPILE_STATUS) == false){
		var RRJ_error = gl.getShaderInfoLog(RRJ_fragmentShaderObject);
		if(RRJ_error.length > 0){
			alert("Fragment Shader Compilation Error: " + RRJ_error);
			uninitialize();
		}
	}


	RRJ_shaderProgramObject = gl.createProgram();

	gl.attachShader(RRJ_shaderProgramObject, RRJ_vertexShaderObject);
	gl.attachShader(RRJ_shaderProgramObject, RRJ_fragmentShaderObject);

	gl.bindAttribLocation(RRJ_shaderProgramObject, AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
	gl.bindAttribLocation(RRJ_shaderProgramObject, AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, "vColor");

	gl.linkProgram(RRJ_shaderProgramObject);

	if(!gl.getProgramParameter(RRJ_shaderProgramObject, gl.LINK_STATUS)){
		var RRJ_error = gl.getProgramInfoLog(RRJ_shaderProgramObject);
		if(RRJ_error.length > 0){
			alert("Shader Program Linking Error: " + RRJ_error);
			uninitialize();
		}
	}


	RRJ_mvpUniform = gl.getUniformLocation(RRJ_shaderProgramObject, "u_mvp_matrix");
	RRJ_pointSizeUniform = gl.getUniformLocation(RRJ_shaderProgramObject, "u_point_size");


	/********** Position **********/

	var RRJ_tri_Position = new Float32Array([
						-1.35, -1.10, 0.0,
						-1.35, -1.35, 0.0,
						-1.10, -1.35, 0.0,
					]);

	var RRJ_tri_Color = new Float32Array([
						1.0, 1.0, 0.0,
						1.0, 1.0, 0.0,
						1.0, 1.0, 0.0,
					]);


	var RRJ_line_Position = new Float32Array(1000 * 3);
				
	var RRJ_curve_Position = new Float32Array(1000 * 3);

	var RRJ_circle_Position = new Float32Array(150 * 3);
	


	fill_ChipData(RRJ_curve_Position, RRJ_line_Position);
	
	colorChip(RRJ_rect_Color, 0.218, 0.3867, 0.277);
	fillCircleData(RRJ_circle_Position);

	var RRJ_chip_lines_Position = new Float32Array(40 * 12);


	fill_ChipLinesData(RRJ_chip_lines_Position);
	



	var RRJ_circuit_lines_Position = new Float32Array(MAX_POINTS  * 3);

	fill_CircuitLines(RRJ_circuit_lines_Position);
	

	/********** Circuit **********/

	RRJ_vao_Circuit_Lines = gl.createVertexArray();
	gl.bindVertexArray(RRJ_vao_Circuit_Lines);

		/********** Position ***********/
		RRJ_vbo_Circuit_Lines_Position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Circuit_Lines_Position);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_circuit_lines_Position, gl.STATIC_DRAW);
		gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,
							3,
							gl.FLOAT,
							false,
							0, 0);
		gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);


		/********** Color ***********/
		gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.0, 0.0, 1.0);



	gl.bindVertexArray(null);





	/************ Line ***********/
	RRJ_vao_Line = gl.createVertexArray();
	gl.bindVertexArray(RRJ_vao_Line);
	
		/************* Position ************/
		RRJ_vbo_Line_Position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Line_Position);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_line_Position, gl.STATIC_DRAW);
		gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,
												3,
												gl.FLOAT,
												false,
												0, 0);
		gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		
		/************ Color **********/
		gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.20, 0.20, 0.20, 1.0);
		
	gl.bindVertexArray(null);	




	/*********** Curve **********/
	RRJ_vao_Curve = gl.createVertexArray();
	gl.bindVertexArray(RRJ_vao_Curve);

		/*********** Position ***********/
		RRJ_vbo_Curve_Position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Curve_Position);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_curve_Position, gl.STATIC_DRAW);
		gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, 
							3,
							gl.FLOAT,
							false,
							0, 0);
		gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		/*********** Color **********/
		gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.90, 0.90, 0.0, 1.0);

	gl.bindVertexArray(null);









	/************ Rect ***********/
	RRJ_vao_Rect = gl.createVertexArray();
	gl.bindVertexArray(RRJ_vao_Rect);
	
		/************* Position ************/
		RRJ_vbo_Rect_Position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Rect_Position);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_rect_Position, gl.STATIC_DRAW);
		gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,
												3,
												gl.FLOAT,
												false,
												0, 0);
		gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		
		/************ Color **********/
		gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.218, 0.3867, 0.277, 1.0);
		
		
		
	gl.bindVertexArray(null);	









	/************ Circles ***********/
	RRJ_vao_Circle = gl.createVertexArray();
	gl.bindVertexArray(RRJ_vao_Circle);

		/*********** Position *************/
		RRJ_vbo_Circle_Position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Circle_Position);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_circle_Position, gl.STATIC_DRAW);
		gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,
							3,
							gl.FLOAT,
							false,
							0, 0);
		gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		/********** Color ***********/
		gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 0.0, 1.0);

	gl.bindVertexArray(null);









	/************ Chip Lines ***********/
	RRJ_vao_Chip_Lines = gl.createVertexArray();
	gl.bindVertexArray(RRJ_vao_Chip_Lines);

		/*********** Position *************/
		RRJ_vbo_Chip_Lines_Position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Chip_Lines_Position);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_chip_lines_Position, gl.STATIC_DRAW);
		gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,
							3,
							gl.FLOAT,
							false,
							0, 0);
		gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		/********** Color ***********/
		gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 0.0, 1.0);

	gl.bindVertexArray(null);









	/********** Triangle **********/
	RRJ_vao_Tri = gl.createVertexArray();
	gl.bindVertexArray(RRJ_vao_Tri);

		/********** Position ***********/
		RRJ_vbo_Tri_Position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Tri_Position);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_tri_Position, gl.STATIC_DRAW);
		gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,
							3,
							gl.FLOAT,
							false,
							0, 0);
		gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		/************ Color **********/
		gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 0.0, 1.0);
		

	gl.bindVertexArray(null);

 }
 //initChipCircuit()****************************
 
 //uninitializeChipCircuit()************************
 function uninitializeChipCircuit(){


	if(RRJ_vbo_Circuit_Lines_Position){
		gl.deleteBuffer(RRJ_vbo_Circuit_Lines_Position);
		RRJ_vbo_Circuit_Lines_Position = 0;
	}

	if(RRJ_vao_Circuit_Lines){
		gl.deleteVertexArray(RRJ_vao_Circuit_Lines);
		RRJ_vao_Circuit_Lines = 0;
	}


	if(RRJ_vbo_Tri_Position){
		gl.deleteBuffer(RRJ_vbo_Tri_Position);
		RRJ_vbo_Tri_Position = 0;
	}

	if(RRJ_vao_Tri){
		gl.deleteVertexArray(RRJ_vao_Tri);
		RRJ_vao_Tri = 0;
	}


	if(RRJ_vbo_Chip_Lines_Position){
		gl.deleteBuffer(RRJ_vbo_Chip_Lines_Position);
		vbo_Chip_Lines_Position = 0;
	}

	if(RRJ_vao_Chip_Lines){
		gl.deleteVertexArray(RRJ_vao_Chip_Lines);
		RRJ_vao_Chip_Lines = 0;
	}


	if(RRJ_vbo_Circle_Position){
		gl.deleteBuffer(RRJ_vbo_Circle_Position);
		RRJ_vbo_Circle_Position = 0;
	}

	if(RRJ_vao_Circle){
		gl.deleteVertexArray(RRJ_vao_Circle);
		RRJ_vao_Circle = 0;
	}



	if(RRJ_vbo_Rect_Position){
		gl.deleteBuffer(RRJ_vbo_Rect_Position);
		RRJ_vbo_Rect_Position = null;
	}

	if(RRJ_vao_Rect){
		gl.deleteVertexArray(RRJ_vao_Rect);
		RRJ_vao_Rect = null;
	}

	if(RRJ_vbo_Curve_Position){
		gl.deleteBuffer(RRJ_vbo_Curve_Position);
		RRJ_vbo_Curve_Position = 0;
	}

	if(RRJ_vao_Curve){
		gl.deleteVertexArray(RRJ_vao_Curve);
		RRJ_vao_Curve = 0;
	}


	if(RRJ_vbo_Line_Position){
		gl.deleteBuffer(RRJ_vbo_Line_Position);
		RRJ_vbo_Line_Position = null;
	}

	if(RRJ_vao_Line){
		gl.deleteVertexArray(RRJ_vao_Line);
		RRJ_vao_Line = null;
	}

	if(RRJ_shaderProgramObject){

		gl.useProgram(RRJ_shaderProgramObject);

			if(RRJ_fragmentShaderObject){
				gl.detachShader(RRJ_shaderProgramObject, RRJ_fragmentShaderObject);
				gl.deleteShader(RRJ_fragmentShaderObject);
				RRJ_fragmentShaderObject = null;
			}

			if(RRJ_vertexShaderObject){
				gl.detachShader(RRJ_shaderProgramObject, RRJ_vertexShaderObject);
				gl.deleteShader(RRJ_vertexShaderObject);
				RRJ_vertexShaderObject = null;
			}

		gl.useProgram(null);
		gl.deleteProgram(RRJ_shaderProgramObject);
		RRJ_shaderProgramObject = null;
	}
}
//uninitializeChipCircuit()************************


//drawChipCircuit()*******************************

function drawChipCircuit()
{
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
	
    gl.useProgram(RRJ_shaderProgramObject);

        switch(iSequence){
			case 0:
				RRJ_Chip(0, RRJ_BlendCounter);
				RRJ_BlendCounter = RRJ_BlendCounter + 0.003;
				if(RRJ_BlendCounter > 1.0)
					RRJ_BlendCounter = 1.0;

				RRJ_Counter = RRJ_Counter - 0.003;
				if(RRJ_Counter < 0.0){
					RRJ_BlendCounter = 0.0;
					RRJ_Counter = 1.0;
					iSequence = 1;
				}

				break;



			case 1:
				RRJ_Circuit(RRJ_BlendCounter);
				RRJ_Chip(0, 1.0);
				RRJ_BlendCounter = RRJ_BlendCounter + 0.001;
				if(RRJ_BlendCounter > 1.0)
					RRJ_BlendCounter = 1.0;

				RRJ_Counter = RRJ_Counter - 0.001;
				if(RRJ_Counter < 0.0){
					RRJ_Counter = 1.0;
					iSequence = 2;
				}
				break;

			case 2:
				RRJ_Circuit(1.0);
				RRJ_CircuitPoints(1.0);
				RRJ_Chip(0, 1.0);
				RRJ_Counter = RRJ_Counter - 0.001;
				if(RRJ_Counter < 0.0){
					RRJ_Counter = 1.0;
					RRJ_BlendCounter = 1.0;
					iSequence = 3;
				}
				break;

			case 3:
				RRJ_Circuit(RRJ_BlendCounter);
				RRJ_CircuitPoints(RRJ_BlendCounter);
				RRJ_Chip(0, 1.0);
				RRJ_BlendCounter = RRJ_BlendCounter - 0.003;
				if(RRJ_BlendCounter < 0.0)
					RRJ_BlendCounter = 0.0;

				RRJ_Counter = RRJ_Counter - 0.003;
				if(RRJ_Counter < 0.0){
					RRJ_Counter = 1.0;
					iSequence = 4;
				}
				break;

			case 4:
				RRJ_Chip(1, 1.0);
				break;


		}

	gl.useProgram(null)

}
//drawChipCircuit()*******************************

//fill_ChipData()*********************************
function fill_ChipData(curvePos, linePos){

	var iSide = 1;
	var centerX = -0.8;
	var centerY = 0.8;
	var angle = 180.0; 
	console.log("In fill_ChipData()!!\n")

	var index = 0;
	var fX = -0.8;
	var fY = 1.0;


	for(var i = 0; i < 1000; i = i + 1){

		switch(iSide){
			case 1:
				if(i < 250){			
					curvePos[index] = (0.2 * Math.cos(NKR_degreeToRadians(angle))) + centerX; 
					curvePos[index + 1] = (0.2 * Math.sin(NKR_degreeToRadians(angle))) + centerY;
					curvePos[index + 2] = 0.0;


					linePos[index] = fX;
					linePos[index + 1] = fY;
					linePos[index + 2] = 0.0;



					index = index + 3;		
					angle = angle - (90.0 / 250);
					fX = fX + (1.6 / 250);


					if(i == 249){
						centerX = 0.8;
						centerY = 0.8;
						angle = 90.0;
						fX = 1.0;
						fY = 0.8;
						iSide = 2;
					}
				}
				break;

			case 2:
				if(i < 500){
					curvePos[index] = (0.2 * Math.cos(NKR_degreeToRadians(angle))) + centerX; 
					curvePos[index + 1] = (0.2 * Math.sin(NKR_degreeToRadians(angle))) + centerY;
					curvePos[index + 2] = 0.0;


					linePos[index] = fX;
					linePos[index + 1] = fY;
					linePos[index + 2] = 0.0;


					index = index + 3;
					angle = angle - (90.0 / 250);
					fY = fY - (1.6 / 250);

					if(i == 499){
						centerX = 0.8;
						centerY = -0.8;
						angle = 0.0;
						fX = 0.80;
						fY = -1.0;
						iSide = 3;	
					}
				}
				break;

			case 3:
				if(i < 750){
					curvePos[index] = (0.2 * Math.cos(NKR_degreeToRadians(angle))) + centerX; 
					curvePos[index + 1] = (0.2 * Math.sin(NKR_degreeToRadians(angle))) + centerY;
					curvePos[index + 2] = 0.0;


					linePos[index] = fX;
					linePos[index + 1] = fY;
					linePos[index + 2] = 0.0;


					index = index + 3;
					angle = angle - (90.0 / 250);

					fX = fX - (1.6 / 250);
					

					if(i == 749){
						centerX = -0.8;
						centerY = -0.8;
						angle = 270.0;
						fX = -1.0;
						fY = -0.8;
						iSide = 4;	
					}
				}
				break;

			case 4:
				if(i < 1000){
					curvePos[index] = (0.2 * Math.cos(NKR_degreeToRadians(angle))) + centerX; 
					curvePos[index + 1] = (0.2 * Math.sin(NKR_degreeToRadians(angle))) + centerY;
					curvePos[index + 2] = 0.0;



					linePos[index] = fX;
					linePos[index + 1] = fY;
					linePos[index + 2] = 0.0;




					index = index + 3;
					angle = angle - (90.0 / 250);

					fY = fY + (1.6 / 250);
						

					if(i == 999){
						centerX = 0.0;
						centerY = 0.0;
						angle = 0.0;
						fX = 0.0;
						fY = 0.0;
						iSide = 0;
					}
				}
				break;
		}

	}
}
//fill_ChipData()*****************************

//colorChip()*********************************
function colorChip(col, r, g, b){

	var index = 0;
	for(var i = 0; i < 4; i++){
		col[index]  = r;
		col[index + 1] = g;
		col[index + 2] = b;

		index = index + 3;
	} 
}
//colorChip()*********************************

//fillCircleData()*********************************
function fillCircleData(pos){

	console.log("in FillCircleData() !!\n");
	var index = 0;
	var fAngle = 0.0;
	var centerX = -1.35;
	var centerY = 1.350;

	for(var i = 0; i < 150; i++){

		if(i < 50){
			pos[index] = 0.01 * Math.cos(NKR_degreeToRadians(fAngle)) + centerX;
			pos[index + 1] = 0.01 * Math.sin(NKR_degreeToRadians(fAngle))+ centerY;
			pos[index + 2] = 0.0;

			fAngle = fAngle + (360.0 / 50.0);
			index = index + 3;
			if(i == 49){
				fAngle = 0.0;
				centerX = 1.35;
				centerY = 1.35;
			}
		}
		else if(i < 100){
			pos[index] = 0.01 * Math.cos(NKR_degreeToRadians(fAngle)) + centerX;
			pos[index + 1] = 0.01 * Math.sin(NKR_degreeToRadians(fAngle))+ centerY;
			pos[index + 2] = 0.0;

			fAngle = fAngle + (360.0 / 50.0);
			index = index + 3;
			if(i == 99){
				fAngle = 0.0;
				centerX = 1.35;
				centerY = -1.35;
			}
		}
		else if(i < 150){
			pos[index] = 0.01 * Math.cos(NKR_degreeToRadians(fAngle)) + centerX;
			pos[index + 1] = 0.01 * Math.sin(NKR_degreeToRadians(fAngle))+ centerY;
			pos[index + 2] = 0.0;

			fAngle = fAngle + (360.0 / 50.0);
			index = index + 3;
			if(i == 149){
				fAngle = 0.0;
				centerX = 0.0;
				centerY = 0.0;
			}

		}
	}
}
//fillCircleData()*********************************

//scaleRect()*********************************
function scaleRect(pos, axis, factor){

	var x = 0, y = 0, z = 0;

	if(axis[0] == 1)
		x = 1;

	if(axis[1] == 1)
		y = 1;

	if(axis[2] == 1)
		z = 1;

	
	for(var i = 0; i < 4; i++){

		if(x == 1){
			if(pos[(i * 3) + 0] < 0.0)
				pos[(i * 3) + 0] = pos[(i * 3) + 0] - factor;
			else if(pos[(i * 3) + 0] >= 0.0)
				pos[(i * 3) + 0] = pos[(i * 3) + 0] + factor;
		}

		if(y == 1){
			if(pos[(i * 3) + 1] < 0.0)
				pos[(i * 3) + 1] = pos[(i * 3) + 1] - factor;
			else if(pos[(i * 3) + 1] >= 0.0)
				pos[(i * 3) + 1] = pos[(i * 3) + 1] + factor;	
		}

		if(z == 1){
			if(pos[(i * 3) + 2] < 0.0)
				pos[(i * 3) + 2] = pos[(i * 3) + 2] - factor;
			else if(pos[(i * 3) + 2] >= 0.0)
				pos[(i * 3) + 2] = pos[(i * 3) + 2] + factor;
		}

	}
}
//scaleRect()*********************************

//fill_ChipLinesData()*********************************
function fill_ChipLinesData(pos){

	var fX = -1.43;
	var fY = 0.9;
	var index = 0;

	for(var i =0; i < 40; i++){

		if(i < (20)){

			pos[index] = fX;
			pos[index + 1] = fY;
			pos[index + 2] = 0.0;

			pos[index + 3] = fX + 0.15;
			pos[index + 4] = fY - 0.15;
			pos[index + 5] = 0.0;


			pos[index + 6] = fX + 0.15;
			pos[index + 7] = fY - 0.15;
			pos[index + 8] = 0.0;

			pos[index + 9] = fX + 0.5;
			pos[index + 10] = fY - 0.15;
			pos[index + 11] = 0.0;

			index = index + 12;

			fY = fY - (1.4 / 20);
			if(i == 19){
				fX = -0.80;
				fY = 1.44;
			}

		}
		else if(i < 40){

			pos[index] = fX;
			pos[index + 1] = fY;
			pos[index + 2] = 0.0;

			pos[index + 3] = fX + 0.15;
			pos[index + 4] = fY - 0.15;
			pos[index + 5] = 0.0;


			pos[index + 6] = fX + 0.15;
			pos[index + 7] = fY - 0.15;
			pos[index + 8] = 0.0;

			pos[index + 9] = fX + 0.15;
			pos[index + 10] = fY - 0.35;
			pos[index + 11] = 0.0;

			index = index + 12;

			fX = fX + (1.4 / 20);
			if(i ==  39){
				fX = 0.0;
				fY = 0.0;
			}
			
		}

	}

}
//fill_ChipLinesData()*********************************

//fill_CircuitLines()*********************************
function fill_CircuitLines(pos){

	var side_angle = 10.0;

	var iSide = 1;
	var length = 3.0;
	var level = 0;
	var index = 0;
	var fX = -1.50;
	var fY = 1.5;

	for(var i = 0; i < MAX_POINTS; i++){

		if((i % 16) == 0 && i != 0){
			iSide = iSide + 1;

			if(iSide == 2){

				if(level <= 20){
					fX = 1.5 + (level * (length / 128));
					fY = 1.5;
				}
				else if(level <= 40){
					fX = 1.5 + (level * (length / 128));
					fY = 1.5 + ((level - 20) * (length / 128) * Math.cos(side_angle));
				}
				else if(level <= 80){
					fX = 1.5 + (level * length / 128);
					fY = 1.5 + (20 * (length / 128)) * Math.cos(side_angle); 
				}
				else if(level <= 100){
					fX = 1.5 + (level * (length / 128));
					fY = 1.5 - ((level - 100) * (length / 128) * Math.cos(side_angle));
				}
				else{
					fX = 1.5 + (level * (length / 128));
					fY = 1.5;
				}

			}
			else if(iSide == 3){


				if(level <= 15){				
					fX = 1.5;
					fY = -1.5 - (level * (length / 128));
				}
				else if(level <= 30){

					fX = (1.5) + ((level - 15) * (length / 128) * Math.cos(side_angle));
					fY = -1.5 - (level * (length / 128));	
				}
				else if(level <= 45){
					
					fX = (1.5) + ((15) * (length / 128) * Math.cos(side_angle));
					fY = -1.5 - (level * (length / 128));
				}
				else{
					fX = 1.5;
					fY = -1.5 - (level * (length / 128));
				}

			}
			else if(iSide == 4){


				if(level <= 20){
					fX = -1.5 - (level * (length / 128));
					fY = -1.5;
				}
				else if(level <= 40){
					fX = -1.5 - (level * (length / 128));
					fY = -1.5 - ((level - 20) * (length / 128) * Math.cos(side_angle));
				}
				else if(level <= 60){
					fX = -1.5 - (level * length / 128);
					fY = -1.5 - (20 * (length / 128)) * Math.cos(side_angle); 
				}
				else if(level <= 80){
					fX = -1.5 - (level * (length / 128));
					fY = -1.5 + ((level - 80) * (length / 128) * Math.cos(side_angle));
				}
				else if(level <= 100){
					fX = -1.5 - (level * length / 128);
					fY = -1.5 - (0 * (length / 128)) * Math.cos(side_angle); 
				}
				else if(level <= 120){
					fX = -1.5 - (level * (length / 128));
					fY = -1.5 - ((level - 100) * (length / 128) * Math.cos(side_angle));
				}
				else{
					fX = -1.5 - (level * (length / 128));
					fY = -1.5 + (17 * length / 128);
					//fY = -1.5 - ((level - 100) * (length / 128) * Math.cos(side_angle));
				}



				/*fX = -1.5 - (level * (length / 128));
				fY = -1.5;*/
			}	


			if(iSide > 4){
				level = level + 1;
				iSide = 1;

				if(level <= 15){				
					fX = -1.5;
					fY = 1.5 + (level * (length / 128));
				}
				else if(level <= 30){
	
					//fX = (-1.5 + ((21 - level) * (length / 128))) + ((length / 128) * Math.cos(NKR_degreeToRadians(side_angle)));
					fX = (-1.5) - ((level - 15) * (length / 128) * Math.cos(side_angle));
					fY = 1.5 + (level * (length / 128));	
				}
				else if(level <= 45){
					//fX = (-1.5) - ((level - 20) * (length / 128) * Math.cos(side_angle));
					fX = (-1.5) - ((15) * (length / 128) * Math.cos(side_angle));
					fY = 1.5 + (level * (length / 128));
				}
				else{
					fX = -1.5;
					fY = 1.5 + (level * (length / 128));
				}
				
				

			}




		}


		if(iSide == 1){

			pos[index] = fX;
			pos[index + 1] = fY;
			pos[index + 2] = 0.0;
			index = index + 3;
			fX = fX + (length / 15);

		}
		else if(iSide == 2){
			pos[index] = fX;
			pos[index + 1] = fY;
			pos[index + 2] = 0.0;

			index = index + 3;
			fY = fY - (length / 15);
		}
		else if(iSide == 3){
			pos[index] = fX;
			pos[index + 1] = fY;
			pos[index + 2] = 0.0;

			index = index + 3;
			fX = fX - (length / 15);

		}
		else if(iSide == 4){
			pos[index] = fX;
			pos[index + 1] = fY;
			pos[index + 2] = 0.0;

			index = index + 3;
			fY = fY + (length / 15);

		}


	}
}
//fill_CircuitLines()*********************************

//RRJ_Circuit()*********************************
function RRJ_Circuit(blendFactor){




		//Circuit
		//Static
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);

		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -4.1 + RRJ_translateZValue]);
		mat4.scale(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.9, 0.9, 0.9]);
        mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, RRJ_rotateAngle, [1.0, 0.0, 0.0]);
		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		gl.uniform1f(RRJ_pointSizeUniform, 3.0);

		gl.bindVertexArray(RRJ_vao_Circuit_Lines);

			//gl.drawArrays(gl.POINTS, 0, MAX_POINTS);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.250, 0.250, 0.250, blendFactor);
			gl.drawArrays(gl.POINTS, 0, 64 * 140);

		gl.bindVertexArray(null);

}
//RRJ_Circuit()*********************************

//RRJ_CircuitPoints()*********************************
function RRJ_CircuitPoints(blendFactor){


		RRJ_point = RRJ_point + 100;
		if(RRJ_point > 64 * 140)
			RRJ_point = 1;


		//Dynamic
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);

		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -4.1 + RRJ_translateZValue]);
		mat4.scale(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.9, 0.9, 0.9]);
        mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, RRJ_rotateAngle, [1.0, 0.0, 0.0]);
        mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		gl.uniform1f(RRJ_pointSizeUniform, 5.0);

		gl.bindVertexArray(RRJ_vao_Circuit_Lines);

			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.0, 1.0, 1.0, blendFactor);
			gl.drawArrays(gl.POINTS, RRJ_point, 1024);

		gl.bindVertexArray(null);

}
//RRJ_CircuitPoints()*********************************

//RRJ_Chip()*********************************
function RRJ_Chip(rotationFlag, blendFactor){


		//Chip 2
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);
		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -4.10 + RRJ_translateZValue]);
		mat4.scale(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [1.5, 1.51, 1.0]);
		if(RRJ_iChange == 1 || RRJ_iChange == 2)
			mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
		else if(RRJ_iChange == 3 || RRJ_iChange ==4)
			mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);
		
		
		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);

		gl.bindVertexArray(RRJ_vao_Rect);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.0, 0.2, 0.0, blendFactor);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		gl.bindVertexArray(null);








		//Circle
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);
		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.00, 0.0, -4.0 + RRJ_translateZValue]);
		if(RRJ_iChange == 1 || RRJ_iChange == 2)
			mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
		else if(RRJ_iChange == 3 || RRJ_iChange ==4)
			mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);
	
		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		gl.uniform1f(RRJ_pointSizeUniform, 4.0);

		gl.bindVertexArray(RRJ_vao_Circle);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 0.0, blendFactor);
			gl.drawArrays(gl.POINTS, 0, 150);
		gl.bindVertexArray(null);




		//For Tri
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);
		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -4.0 + RRJ_translateZValue]);

		if(RRJ_iChange == 1 || RRJ_iChange == 2)
			mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
		else if(RRJ_iChange == 3 || RRJ_iChange ==4)
			mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);
		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		gl.uniform1f(RRJ_pointSizeUniform, 3.0);

		gl.bindVertexArray(RRJ_vao_Tri);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 1.0, 1.0, 0.0, blendFactor);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindVertexArray(null);



		//For Rect
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);
		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -4.0 + RRJ_translateZValue]);
		mat4.scale(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [1.05, 1.05, 1.0]);
		if(RRJ_iChange == 1 || RRJ_iChange == 2)
			mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle), [1.0, 0.0, 0.0]);
		else if(RRJ_iChange == 3 || RRJ_iChange ==4)
			mat4.rotate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle), [0.0, 1.0, 0.0]);

		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		

		gl.bindVertexArray(RRJ_vao_Rect);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.550, 0.555, 0.550, blendFactor);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		gl.bindVertexArray(null);




		

		//For Chip Lines
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);
		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -4.0 + RRJ_translateZValue]);
		if(RRJ_iChange == 1 || RRJ_iChange == 2)
			mat4.rotateX(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));
		else if(RRJ_iChange == 3 || RRJ_iChange ==4)
			mat4.rotateY(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));

		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		//gl.uniform1f(pointSizeUniform, 3.0);

		gl.bindVertexArray(RRJ_vao_Chip_Lines);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.550, 0.55, 0.550, blendFactor);
			gl.drawArrays(gl.LINES, 0, 4 * 40);
		gl.bindVertexArray(null);




		//For Rect 2
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);
		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -3.9650 + RRJ_translateZValue]);
		mat4.scale(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.84, 0.84, 1.0]);
		if(RRJ_iChange == 1 || RRJ_iChange == 2)
			mat4.rotateX(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));
		else if(RRJ_iChange == 3 || RRJ_iChange ==4)
			mat4.rotateY(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));

		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		gl.uniform1f(RRJ_pointSizeUniform, 3.0);

		gl.bindVertexArray(RRJ_vao_Rect);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.0, 0.3, 0.0, blendFactor);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		gl.bindVertexArray(null);


		//For Border
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);
		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -4.00 + RRJ_translateZValue]);
		mat4.scale(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [1.10, 1.10, 1.0]);
		if(RRJ_iChange == 1 || RRJ_iChange == 2)
			mat4.rotateX(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));
		else if(RRJ_iChange == 3 || RRJ_iChange ==4)
			mat4.rotateY(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));
		

		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		gl.uniform1f(RRJ_pointSizeUniform, 30.0);

		gl.bindVertexArray(RRJ_vao_Line);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.550, 0.550, 0.550, blendFactor);
			gl.drawArrays(gl.POINTS, 0, 1000);
		gl.bindVertexArray(null);

		gl.bindVertexArray(RRJ_vao_Curve);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.550, 0.550, 0.550, 1.0);
			gl.drawArrays(gl.POINTS, 0, 1000);
		gl.bindVertexArray(null);




		//For Border
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);
		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -3.950 + RRJ_translateZValue]);
		mat4.scale(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.850, 0.850, 1.0]);
		if(RRJ_iChange == 1 || RRJ_iChange == 2)
			mat4.rotateX(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));
		else if(RRJ_iChange == 3 || RRJ_iChange ==4)
			mat4.rotateY(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));

		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		gl.uniform1f(RRJ_pointSizeUniform, 12.0);

		gl.bindVertexArray(RRJ_vao_Line);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.20, 0.200, 0.200, blendFactor);
			gl.drawArrays(gl.POINTS, 0, 1000);
		gl.bindVertexArray(null);

		gl.bindVertexArray(RRJ_vao_Curve);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.200, 0.20, 0.20, blendFactor);
			gl.drawArrays(gl.POINTS, 0, 1000);
		gl.bindVertexArray(null);



		//For Border
		mat4.identity(RRJ_modelViewMatrix);
		mat4.identity(RRJ_modelViewProjectionMatrix);
		mat4.translate(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.0, 0.0, -3.9500 + RRJ_translateZValue]);
		mat4.scale(RRJ_modelViewMatrix, RRJ_modelViewMatrix, [0.92, 0.92, 1.0]);
		if(RRJ_iChange == 1 || RRJ_iChange == 2)
			mat4.rotateX(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));
		else if(RRJ_iChange == 3 || RRJ_iChange ==4)
			mat4.rotateY(RRJ_modelViewMatrix, RRJ_modelViewMatrix, NKR_degreeToRadians(RRJ_angle));
	
		
		mat4.multiply(RRJ_modelViewProjectionMatrix, NKR_viewProjMatrix, RRJ_modelViewMatrix);

		gl.uniformMatrix4fv(RRJ_mvpUniform, false, RRJ_modelViewProjectionMatrix);
		gl.uniform1f(RRJ_pointSizeUniform, 11.0);

		gl.bindVertexArray(RRJ_vao_Line);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.50, 0.500, 0.500, blendFactor);
			gl.drawArrays(gl.POINTS, 0, 1000);
		gl.bindVertexArray(null);

		gl.bindVertexArray(RRJ_vao_Curve);
			gl.vertexAttrib4f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.500, 0.500, 0.500, blendFactor);
			gl.drawArrays(gl.POINTS, 0, 1000);
		gl.bindVertexArray(null);


		if(rotationFlag == 1){
			if(RRJ_iChange == 1){

				RRJ_angle = RRJ_angle + 0.1;

				if(RRJ_angle > 10.0){
					RRJ_iChange = 2;
					RRJ_angle = 10.0;
				}
			}
			else if(RRJ_iChange == 2){
				RRJ_angle = RRJ_angle - 0.1;
				if(RRJ_angle < 0.0){
					RRJ_iChange = 3;
					RRJ_angle = 0.0;
				}
			}
			else if(RRJ_iChange == 3){
				RRJ_angle = RRJ_angle + 0.1;
				if(RRJ_angle > 10.0){
					RRJ_iChange = 4;
					RRJ_angle = 10.0;
				}
			}
			else if(RRJ_iChange == 4){
				RRJ_angle = RRJ_angle - 0.1;
				if(RRJ_angle < 0.0){
					RRJ_iChange = 1;
					RRJ_angle = 0.0;
				}
			}

		}


}
//RRJ_Chip()*********************************

//initTextRendering()************************
function initTextRendering()
{
    var msd_vertexShaderSourceCode = "#version 300 es"+
						"\n"+
						"in vec4 vPosition;"+
						"in vec3 vColor;"+
						"in vec2 vTexCoord;"+
						"out vec3 out_vColor;"+
						"out vec2 out_TexCoord;"+
						"uniform mat4 u_mvp_matrix;"+
						"void main(void)"+
						"{"+
						"gl_Position=u_mvp_matrix * vPosition;"+
						"out_vColor=vColor;"+
						"out_TexCoord=vTexCoord;"+
						"}";
			
	msd_vertexShaderObject=gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(msd_vertexShaderObject,msd_vertexShaderSourceCode);
	gl.compileShader(msd_vertexShaderObject);
	if(gl.getShaderParameter(msd_vertexShaderObject,gl.COMPILE_STATUS)==false)
	{
		var error=gl.getShaderInfoLog(msd_vertexShaderObject);
		if(error.length>0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	var msd_fragmentShaderSourceCode=
							"#version 300 es"+
							"\n"+
							"precision highp float;"+
							"in vec3 out_vColor;"+
							"in vec2 out_TexCoord;"+
							"uniform sampler2D u_sampler;"+
							"uniform float u_blend;"+
							" uniform vec2 u_resolution;"+
							" uniform float msd_time;"+
							"uniform sampler2D sampler;"+
							"uniform vec4 uvAlphamsd_time;"+
							"out vec4 FragColor;"+
							"void main(void)"+
							"{"+
							/*"FragColor=out_vColor+texture(u_sampler,out_TexCoord);"+*/
							"vec2 uv = gl_FragCoord.yx / u_resolution.yx;"+
							"float umsd_time = uvAlphamsd_time.w;"+
							"vec2 n0Uv = vec2(uv.x*1.4 + 0.01, uv.y + msd_time*0.69);"+
							"vec2 n1Uv = vec2(uv.x*0.5 - 0.033, uv.y*2.0 + msd_time*0.12);"+
							"vec2 n2Uv = vec2(uv.x*0.94 + 0.02, uv.y*3.0 + msd_time*0.61);"+
							"float n0 = (texture(sampler, n0Uv).w-0.5)*2.0;"+
							"float n1 = (texture(sampler, n1Uv).w-0.5)*2.0;"+
							"float n2 = (texture(sampler, n2Uv).w-0.5)*2.0;"+
							"float noiseA = clamp(n0 + n1 + n2, -1.0, 1.0);"+
							"vec2 n0UvB = vec2(uv.x*0.7 - 0.01, uv.y + msd_time*0.27);"+
							"vec2 n1UvB = vec2(uv.x*0.45 + 0.033, uv.y*1.9 + msd_time*0.61);"+
							"vec2 n2UvB = vec2(uv.x*0.8 - 0.02, uv.y*2.5 + msd_time*0.51);"+
							"float n0B = (texture(sampler, n0UvB).w-0.5)*2.0;"+
							"float n1B = (texture(sampler, n1UvB).w-0.5)*2.0;"+
							"float n2B = (texture(sampler, n2UvB).w-0.5)*2.0;"+
							"float noiseB = clamp(n0B + n1B + n2B, -1.0, 1.0);"+
							"vec2 finalNoise = vec2(noiseA, noiseB);"+
							"float perturb = (1.0 - uv.y) * 0.35 + 0.02;"+
							"finalNoise = (finalNoise * perturb) + uv - 0.02;"+
							"vec4 color = texture(sampler, finalNoise);"+
							"color = vec4(color.x*2.0, color.y*0.9, (color.y/color.x)*0.2, 1.0);"+
							"finalNoise = clamp(finalNoise, 0.05, 1.0);"+
							"color.w = texture(sampler, finalNoise).z*2.0;"+
							"color.w = color.w*texture(sampler, uv).z;"+
							"FragColor=vec4(texture(u_sampler,out_TexCoord).xyz,u_blend);"+
							/*"FragColor=vec4(out_vColor,u_blend);"+*/
							/*"FragColor=color+texture(u_sampler,out_TexCoord);"+*/
							/*"FragColor=color;"+*/
							"}";
	msd_fragmentShaderObject=gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(msd_fragmentShaderObject,msd_fragmentShaderSourceCode);
	gl.compileShader(msd_fragmentShaderObject);
	if(gl.getShaderParameter(msd_fragmentShaderObject,gl.COMPILE_STATUS)==false)
	{
		var error=gl.getShaderInfoLog(msd_fragmentShaderObject);
		if(error.length>0)
		{
			alert(error);
			uninitialize();
		}
	}
	
	//shader program
	msd_shaderProgramObject=gl.createProgram();
	gl.attachShader(msd_shaderProgramObject,msd_vertexShaderObject);
	gl.attachShader(msd_shaderProgramObject,msd_fragmentShaderObject);
	//prelink binding attribute
	gl.bindAttribLocation(msd_shaderProgramObject,AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,"vPosition");
	gl.bindAttribLocation(msd_shaderProgramObject,AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,"vColor");
	gl.bindAttribLocation(msd_shaderProgramObject,AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,"vTexCoord");
	//link the program
	gl.linkProgram(msd_shaderProgramObject);
	if(!gl.getProgramParameter(msd_shaderProgramObject,gl.LINK_STATUS))
	{
		var error=gl.getProgramInfoLog(msd_shaderProgramObject);
		if(error.length>0)
		{
			alert(error);
			uninitialize();
		}
	}
	msd_mvpUniform=gl.getUniformLocation(msd_shaderProgramObject,"u_mvp_matrix");
	msd_msd_samplerUniform=gl.getUniformLocation(msd_shaderProgramObject,"u_sampler");
	msd_blendUniform=gl.getUniformLocation(msd_shaderProgramObject,"u_blend");
	msd_msd_timeUniform=gl.getUniformLocation(msd_shaderProgramObject,"msd_time");
	msd_resolutionUniform=gl.getUniformLocation(msd_shaderProgramObject,"u_resolution");
	msd_uvAlphamsd_msd_timeUniform=gl.getUniformLocation(msd_shaderProgramObject,"uvAlphamsd_time");
	msd_samplerUniform=gl.getUniformLocation(msd_shaderProgramObject,"sampler");
	//for texture
    
	msd_rectangle_texture=gl.createTexture();
	msd_rectangle_texture.image=new Image();
	msd_rectangle_texture.image.src="stone.png";
	msd_rectangle_texture.image.onload=function(){
		gl.bindTexture(gl.TEXTURE_2D,msd_rectangle_texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
		//gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,msd_rectangle_texture.image);
       gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
			gl.UNSIGNED_BYTE,
			document.getElementById('flame')
		);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D,null);
	}
	
    
    
	//rectangle
	msd_vao=gl.createVertexArray();
	gl.bindVertexArray(msd_vao);
	msd_vbo=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,msd_vbo);
	gl.bufferData(gl.ARRAY_BUFFER,0,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//color
	msd_vbo_color=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,msd_vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,0,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	//for texture
	msd_vbo_texture=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,msd_vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,0,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindVertexArray(null);
	
	//fire
    /*
		msd_rectangle_texture = gl.createTexture();
		//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		
		//gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
		gl.bindTexture(gl.TEXTURE_2D, msd_rectangle_texture);
		
		//using clamp to edge for TEXTURE_WRAP_T it te pakdun thevlya sarkha dista
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		
		//using nearest shows line patches
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
			gl.UNSIGNED_BYTE,
			document.getElementById('flame')
		);
		gl.bindTexture(gl.TEXTURE_2D, null);
        */
}
//initTextRendering()************************

//drawTextRendering()************************
function drawTextRendering()
{
	
	gl.useProgram(msd_shaderProgramObject);
	msd_pos_KIIX=-1.3;
	msd_pos_KIIY=0.7;
	var spacing=0.07;
	var msd_modelViewMatrix=mat4.create();
	var msd_modelViewProjectionMatrix=mat4.create();
	
	////////////////////////   KNOWLEDGE IS INTER-RELATED   ////////////////////////////
	gl.disable(gl.BLEND);
	//draw K
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-3.0+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawK(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw N
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-2.65+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	if(msd_time < 100)
		{
			msd_time = msd_time + 0.01;
			
		}else
		{
			msd_time = -100.0;
		}
		
		//it decides speed of fire
		gl.uniform1f(msd_msd_timeUniform, msd_time);
		
		//standard 800 * 600 worked first msd_time
		gl.uniform2fv(msd_resolutionUniform, [600, 800]);
		gl.uniform4fv(msd_uvAlphamsd_msd_timeUniform, [1.0, 1.0, 2.0, 0.5 ]);
		
	msdDrawN(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw O
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-2.3+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawO(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw W
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.95+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawW(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw L
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.6+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawL(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.45+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw D
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.1+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawD(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw G
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-0.8+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawG(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-0.5+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw I
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[0.4+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IS]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawI(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw S
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[0.7+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IS]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawS(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw I
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[1.5+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawI(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw N
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[1.8+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawN(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw T
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[2.2+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawT(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[2.4+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw R
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[2.75+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawR(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	spacing=-0.09;
	//draw Dash
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.3+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.5,0.5,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawDash(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw R
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.6+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawR(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.9+spacing+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw L
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[4.2+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawL(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw A
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[4.6+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.2,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawA(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw T
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[4.9+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawT(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[5.1+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw D
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[5.5+msd_pos_KIIX,1.5+msd_pos_KIIY,msd_pos_KIIZ_IN]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[0.25,0.25,0.0]);
	//mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle));
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawD(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	///////////////////////////////// ASTROMEDICOMP ////////////////////////////////
	var zTranslateText = 2.5;    
    var scaleFactorAstromedicomp = 0.3;
	msd_pos_AMCX=-1.1;
	msd_pos_AMCY=-0.6;
	gl.enable(gl.BLEND);
	//draw A
	if(msd_pos_KIIZ_IN==zTranslateText)
	{
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-3.0+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp - 0.1,scaleFactorAstromedicomp,0.0]);
		if(flagA==2 || flagA==1)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_A));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
		}
		mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		gl.uniform1f(msd_blendUniform,blend_counter);
		msdDrawA(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);	
		
	//draw S
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-2.3+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp, scaleFactorAstromedicomp, 0.0]);
		if(flagA==1)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_S));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
		}
		
		mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
		gl.uniform1f(msd_blendUniform,blend_counter);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		msdDrawS(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
		
	//draw T
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.6+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
		if(flagS==2)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_T));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
		}
		mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		msdDrawT(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw R
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-1.1+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
		if(flagT==3)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_R));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
		}
		mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		msdDrawR(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw O
		msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
		msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
		mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[-0.4+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
		mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
		if(flagR==4)
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_O));
		}
		else
		{
			mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
		}
		mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
		gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
		msdDrawO(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw M
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[0.3+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
	if(flagO==5)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_M));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawM(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw E
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[1.0+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
	if(flagM==6)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_E));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawE(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw D
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[1.8+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
	if(flagE==7)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_D));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawD(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw I
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[2.6+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
	if(flagD==8)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_I));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawI(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw C
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.2+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
	if(flagI==9)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_C));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawC(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw O
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[3.8+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
	if(flagC==10)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_O1));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawO(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw M
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[4.5+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
	if(flagO1==11)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_M1));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawM(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	
	//draw P
	msd_modelViewMatrix=mat4.identity(msd_modelViewMatrix);
	msd_modelViewProjectionMatrix=mat4.identity(msd_modelViewProjectionMatrix);
	mat4.translate(msd_modelViewMatrix,msd_modelViewMatrix,[5.2+msd_pos_AMCX,-1.5+msd_pos_AMCY,zTranslateText]);
	mat4.scale(msd_modelViewMatrix,msd_modelViewMatrix,[scaleFactorAstromedicomp,scaleFactorAstromedicomp,0.0]);
	if(flagM1==12)
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(msd_angle_P));
	}
	else
	{
		mat4.rotateY(msd_modelViewMatrix,msd_modelViewMatrix,NKR_degreeToRadians(90.0));
	}
	mat4.multiply(msd_modelViewProjectionMatrix,NKR_viewProjMatrix,msd_modelViewMatrix);
	gl.uniformMatrix4fv(msd_mvpUniform,false,msd_modelViewProjectionMatrix);
	msdDrawP(msd_vbo,msd_vbo_color,msd_vbo_texture,msd_rectangle_texture);
	}
	
	gl.useProgram(null);
	
	//knowledge is interrelated animation
    
	if(msd_pos_KIIZ<zTranslateText)
		msd_pos_KIIZ+=0.5;
	if(msd_pos_KIIZ_IS<zTranslateText && msd_pos_KIIZ==zTranslateText)
		msd_pos_KIIZ_IS+=0.5;
	if(msd_pos_KIIZ_IN<zTranslateText && msd_pos_KIIZ_IS==zTranslateText)
		msd_pos_KIIZ_IN+=0.5;

	if(msd_pos_KIIZ_IN==zTranslateText)
	{
		if(blend_counter<1.0)
		{
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
			blend_counter+=0.008;
		}
		else
		{
			flagA=2;
		}
	}
	if(blend_counter>=1.0)
	{
		//console.log("blend_counter="+blend_counter);

		if(msd_angle_A>0.0)
		{	
			msd_angle_A-=0.5;
			//console.log("msd_angle_A"+msd_angle_A);
		}
		else
			flagA=1;
	}
	
	if(flagA==1)
	{
		if(msd_angle_S>0.0)
		   msd_angle_S-=0.5;
	    else	
			flagS=2;	
	}

	if(flagS==2)
	{
		if(msd_angle_T>0.0)
			msd_angle_T=msd_angle_T-0.5;
		else 
			flagT=3;
	}
	
	if(flagT==3)
	{   
        if(msd_angle_R>0.0)
			msd_angle_R-=0.5;
		else
			flagR=4;	
	}		
	
	if(flagR==4)
	{
		if(msd_angle_O>0.0)
			msd_angle_O-=0.5;
		else
			flagO=5;	
	}	
	
	if(flagO==5)
	{
		if(msd_angle_M>0.0)	
			msd_angle_M-=0.5;
		else
			flagM=6;
	}
		
	if(flagM==6)
	{
		if(msd_angle_E>0.0)
			msd_angle_E-=0.5;
		else
			flagE=7;
	}
	
	if(flagE==7)
	{
		if(msd_angle_D>0.0)
			msd_angle_D-=0.5;
		else
			flagD=8;
	}
	if(flagD==8)
	{
		if(msd_angle_I>0.0)
			msd_angle_I-=0.5;
		else
			flagI=9;
	}
		
	if(flagI==9)
	{
		if(msd_angle_C>0.0)
			msd_angle_C-=0.5;
		else
			flagC=10;	
	}
	if(flagC==10)
	{
		if(msd_angle_O1>0.0)
			msd_angle_O1-=0.5;
		else
			flagO1=11;
	}
	
	if(flagO1==11)
	{
		if(msd_angle_M1>0.0)
			msd_angle_M1-=0.5;
		else
			flagM1=12;
	}	
	if(flagM1==12)
	{
		if(msd_angle_P>0.0)
			msd_angle_P-=0.5;
		else
			flagP=13;
	}
	
}

//drawTextRendering()************************

//uninitializeTextRendering()****************
function uninitializeTextRendering()
{
	if(msd_vao)
	{
		gl.deleteVertexArray(msd_vao);
		msd_vao=null;
	}
	if(msd_vbo)
	{
		gl.deleteBuffer(msd_vbo);
		msd_vbo=null;
	}
	if(msd_vbo_color)
	{
		gl.deleteBuffer(msd_vbo_color);
		msd_vbo_color=null;
	}
	if(msd_shaderProgramObject)
	{
		if(msd_fragmentShaderObject)
		{
			gl.detachShader(msd_shaderProgramObject,msd_fragmentShaderObject);
			gl.deleteShader(msd_fragmentShaderObject);
			msd_fragmentShaderObject=null;
		}
		if(msd_vertexShaderObject)
		{
			gl.detachShader(msd_shaderProgramObject,msd_vertexShaderObject);
			gl.deleteShader(msd_vertexShaderObject);
			msd_vertexShaderObject=null;
		}
		gl.deleteProgram(msd_shaderProgramObject);
		msd_shaderProgramObject=null;
	}
	
}
//uninitializeTextRendering()****************

//initParticleSystem()************************
function initParticleSystem()
{
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
	gl.bindAttribLocation(RRJ_shaderProgramObject_PS, AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
	gl.bindAttribLocation(RRJ_shaderProgramObject_PS, AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, "vColor");
	gl.bindAttribLocation(RRJ_shaderProgramObject_PS, AMC_WebGLMacros.AMC_ATTRIBUTE_VELOCITY, "vVelocity");
	gl.bindAttribLocation(RRJ_shaderProgramObject_PS, AMC_WebGLMacros.AMC_ATTRIBUTE_POINTSIZE, "vSize");
	
	
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
		gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, 
									3,
									gl.FLOAT,
									false,
									0, 0);
		gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		
		
		/********** Color **********/
		gl.vertexAttrib3f(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR, 0.0, 1.0, 0.0);
		
		
		/********** Size **********/
		RRJ_vbo_Points_Size_PS = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RRJ_vbo_Points_Size_PS);
		gl.bufferData(gl.ARRAY_BUFFER, RRJ_points_Size, gl.STATIC_DRAW);
		gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_POINTSIZE, 
									1,
									gl.FLOAT,
									false,
									0, 0);
		gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_POINTSIZE);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		
	gl.bindVertexArray(null);
}
//initParticleSystem()****************************

//RRJ_Space()*******************************
function RRJ_Space(){
	
	RRJ_angle_points_PS = 5.0;
    
	mat4.identity(RRJ_modelViewMatrix_PS);
	mat4.identity(RRJ_modelViewProjectionMatrix_PS);
	
	mat4.translate(RRJ_modelViewMatrix_PS, RRJ_modelViewMatrix_PS, [0.0, 0.0, RRJ_trans_PS]);
	mat4.rotateY(RRJ_modelViewMatrix_PS, RRJ_modelViewMatrix_PS, NKR_degreeToRadians(RRJ_angle_points_PS));
	mat4.multiply(RRJ_modelViewProjectionMatrix_PS, NKR_viewProjMatrix, RRJ_modelViewMatrix_PS);
	
	gl.uniformMatrix4fv(RRJ_mvpUniform_PS, false, RRJ_modelViewProjectionMatrix_PS);
	gl.uniform1f(RRJ_timeUniform_PS, RRJ_timeFactor);
	
	gl.bindVertexArray(RRJ_vao_Points_PS);
	
		gl.drawArrays(gl.POINTS, 0, RRJ_MAX_STARS_PS);
	
	gl.bindVertexArray(null);

	/*
	RRJ_angle_points_PS += 0.01;
	if(RRJ_angle_points_PS > 360.0)
		RRJ_angle_points_PS = 0.0;
	*/

	
	RRJ_timeFactor = RRJ_timeFactor + 0.5;
}
//RRJ_Space()*******************************

//initPoint()-----------------------------
function initPoint()
{
   // Vertex shader program
   var NKR_SHADOW_VSHADER_SOURCE =
    '#version 300 es'+
	'\n'+
	'precision highp float;'+
	'uniform mat4 u_MvpMatrix;'+
	'in vec4 a_Position;'+
     'void main() {\n' +
     '  gl_PointSize = 10.0f;'+
     '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '}\n';
	
	NKR_vertexShaderObject = NKR_gl.createShader(NKR_gl.VERTEX_SHADER);
	NKR_gl.shaderSource(NKR_vertexShaderObject, NKR_SHADOW_VSHADER_SOURCE);
	NKR_gl.compileShader(NKR_vertexShaderObject);
	
	//Compilation Error Handling
	if(NKR_gl.getShaderParameter(NKR_vertexShaderObject,NKR_gl.COMPILE_STATUS)==false)
	{
		var error=NKR_gl.getShaderInfoLog(NKR_vertexShaderObject);
		if(error.length > 0)
		{
			alert("vertex compiling "+error);
			uninitialize();
		}
		
	}	//Vertex shader compilation error handling
	
	// Fragment shader program for creating a shadow map
  var NKR_SHADOW_FSHADER_SOURCE =
    '#version 300 es'+
	'\n'+
	'precision highp float;'+
	'out vec4 fragColor;'+
    'void main() {\n' +
    '  fragColor = vec4(0.0, 1.0, 0.0, 1.0);\n' +                      
    '}\n';		
	
	NKR_fragmentShaderObject=NKR_gl.createShader(NKR_gl.FRAGMENT_SHADER);
	NKR_gl.shaderSource(NKR_fragmentShaderObject, NKR_SHADOW_FSHADER_SOURCE);
	NKR_gl.compileShader(NKR_fragmentShaderObject);
	
	//Compilation Error Handling
	if(NKR_gl.getShaderParameter(NKR_fragmentShaderObject,NKR_gl.COMPILE_STATUS)==false)
	{
		var error=NKR_gl.getShaderInfoLog(NKR_fragmentShaderObject);
		if(error.length > 0)
		{
			alert("fragment compiling "+error);
			uninitialize();
		}
		
	}//Error handling for fragment Shader 
	
	//Define the Shader Program
	NKR_pointProgram = NKR_gl.createProgram();
	NKR_gl.attachShader(NKR_pointProgram, NKR_vertexShaderObject);
	NKR_gl.attachShader(NKR_pointProgram, NKR_fragmentShaderObject);
	
	//Before linking the program, initializing the shader variables	
	NKR_gl.bindAttribLocation(NKR_pointProgram, AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, "a_Position");
	
	//Linking 
	NKR_gl.linkProgram(NKR_pointProgram);
	//Handling Link Errors
	if(NKR_gl.getProgramParameter(NKR_pointProgram,NKR_gl.LINK_STATUS)==false)
	{
		var error=NKR_gl.getProgramInfoLog(NKR_pointProgram);
		if(error.length > 0)
		{
			alert("linking "+error);
			uninitialize();
		}
	}//Shader Program Link Error Handling
	//Post link, tranferring the data to shader's in the form on "uniforms"
	
	NKR_mvpUniform_Point = NKR_gl.getUniformLocation(NKR_pointProgram,"u_MvpMatrix");
    
    vao_singlepoint = gl.createVertexArray();
    gl.bindVertexArray(vao_singlepoint);
     vbo_singlePointPos = gl.createBuffer();    
     
    gl.bindVertexArray(null);
}
//initPoint()-----------------------------

//drawPoint()*******************************
function drawPoint()
{
    mat4.identity(RRJ_modelViewMatrix_PS);
	mat4.identity(RRJ_modelViewProjectionMatrix_PS);
	
	mat4.translate(RRJ_modelViewMatrix_PS, RRJ_modelViewMatrix_PS, [0.0, 0.0, 1.0]);
	mat4.multiply(RRJ_modelViewProjectionMatrix_PS, NKR_viewProjMatrix, RRJ_modelViewMatrix_PS);
	
	gl.uniformMatrix4fv(NKR_mvpUniform_Point, false, RRJ_modelViewProjectionMatrix_PS);
	 var points = [0.3 * Math.cos(anglePoint), 0.3 * Math.sin(anglePoint), 4.0];
     //vvk_calculateCurvedPoints
	gl.bindVertexArray(vao_singlepoint);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_singlePointPos);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);    
        
		gl.drawArrays(gl.POINTS, 0, 1);
	
	gl.bindVertexArray(null);
	
    anglePoint += 0.03;
}


//uninitialize_PS()*****************
function uninitialize_PS()
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
//uninitialize_PS()*****************

//fill_PointsData()******************
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
//fill_PointsData()******************

function toggleFullscreen()
{	
	//code
	var fullscreen_element=
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		document.msFullscreenElement ||
		null;
	
	//if not in fullscreen mode, switch to it!
	if(fullscreen_element==null)
	{
		if(NKR_canvas.requestFullscreen)
			NKR_canvas.requestFullscreen();
		else if(NKR_canvas.mozRequestFullScreen)
			NKR_canvas.mozRequestFullScreen();
		else if(NKR_canvas.webkitRequestFullscreen)
			NKR_canvas.webkitRequestFullscreen();
		else if(NKR_canvas.msRequestFullscreen)
			NKR_canvas.msRequestFullscreen();
	
		NKR_bFullscreen=true;
		
	}
	else
	{
		if(document.exitFullscreen)
			document.exitFullscreen();
		else if(document.mozCancelFullScreen)
			document.mozCancelFullScreen();
		else if(document.webkitExitFullscreen)
			document.webkitExitFullscreen();
		else if(document.msExitFullscreen)
			document.msExitFullscreen();
		
		NKR_bFullscreen=false;
	}
	
}//toggleFullscreen()

function keyDown(event)
{
	switch(event.keyCode)
	{
		case 70: //For 'f' or 'F'
					 toggleFullscreen();
					 break;
		case 27: //escape
					//uninitialize()
					uninitialize();
					//Close Application's tab
					window.close();
					break;
		case 80:	//NKR_MatrixCreditSong.play();			
					break;
		
	}//switch(event.keyCode)
}//keyDown()

var mouseDown = function(e) {
   
};

var mouseUp = function(e) {
    
};


var MouseWheelHandler = function(e) {
    
}

var mouseMove = function(e) {       
};