package com.astromedicomp.shadertoggle;

import android.opengl.GLSurfaceView;
import android.opengl.GLES32;
import javax.microedition.khronos.opengles.GL10;
import javax.microedition.khronos.egl.EGLConfig;
import android.content.Context;
import android.view.Gravity;
import android.graphics.Color;
import android.view.MotionEvent;
import android.view.GestureDetector;
import android.view.GestureDetector.OnGestureListener;
import android.view.GestureDetector.OnDoubleTapListener;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import android.opengl.Matrix;
import java.nio.ShortBuffer;


public class GLESView extends GLSurfaceView implements GLSurfaceView.Renderer,OnGestureListener,OnDoubleTapListener{
	
	private static Context context;
	private GestureDetector gestureDetector;
	private int gVertexShaderObject;
	private int gFragmentShaderObject;
	private int shaderProgramObject;
	
	private int gVertexShaderObject1;
	private int gFragmentShaderObject1;
	private int shaderProgramObject1;
	
	private int[] vao_pyramid=new int[1];
	private int[] vbo_pyramid_position=new int[1];
	private int[] vbo_pyramid_color=new int[1];

	private int[] vao_cube=new int[1];
	private int[] vbo_cube_position=new int[1];
	private int[] vbo_cube_color=new int[1];
	
	private int[] vao_sphere=new int[1];
	private int[] vbo_sphere_position=new int[1];
	private int[] vbo_sphere_normal=new int[1];
	private int[] vbo_sphere_element=new int[1];
	
	
	private float[] light_ambient=new float[4];
private float[] light_diffuse=new float[4];
private float[] light_specular=new float[4];
private float[] light_position=new float[4];

private float[] material_ambient=new float[4];
private float[] material_diffuse=new float[4];
private float[] material_specular=new float[4];
private float[] material_shininess=new float[1];
	FloatBuffer ambientBuffer;
	FloatBuffer diffuseBuffer;
	FloatBuffer specularBuffer;
	FloatBuffer positionBuffer;
	
	FloatBuffer mambientBuffer;
	FloatBuffer mdiffuseBuffer;
	FloatBuffer mspecularBuffer;
	FloatBuffer mshininessBuffer;
	
	FloatBuffer ambientBuffer1;
	FloatBuffer diffuseBuffer1;
	FloatBuffer specularBuffer1;
	FloatBuffer positionBuffer1;
	
	FloatBuffer mambientBuffer1;
	FloatBuffer mdiffuseBuffer1;
	FloatBuffer mspecularBuffer1;
	FloatBuffer mshininessBuffer1;
	
		private int mUniform;
		private int vUniform;
		private int pUniform;
		private int laUniform;
		private int kaUniform;
		private int lsUniform;
		private int ldUniform;
		private int kdUniform;
		private int ksUniform;
		private int lightPositionUniform;
		private int isLKeypressedUniform1;
		private int isLKeypressedUniform2;
		private int material_shininess_uniform;
		
		private int mUniform1;
		private int vUniform1;
		private int pUniform1;
		private int laUniform1;
		private int kaUniform1;
		private int lsUniform1;
		private int ldUniform1;
		private int kdUniform1;
		private int ksUniform1;
		private int lightPositionUniform1;
		private int isLKeypressedUniform3;
		private int isLKeypressedUniform4;
		private int material_shininess_uniform1;
		private int vkey=0;
	private int gbLight = 0;
	private float[] perspectiveProjectionMatrix=new float[16];
	float angle_pyramid=0.0f;
	float angle_cube=0.0f;
	float numVertices;
		float numElements;
	public GLESView(Context drawingContext){
		super(drawingContext);
		context=drawingContext;
		gestureDetector=new GestureDetector(drawingContext,this,null,false);
		gestureDetector.setOnDoubleTapListener(this);
		setEGLContextClientVersion(3);
		setRenderer(this);
		setRenderMode(GLSurfaceView.RENDERMODE_WHEN_DIRTY);
	}
	
	
	@Override
	public boolean onTouchEvent(MotionEvent event)
	{
		int eventaction=event.getAction();
		if(!gestureDetector.onTouchEvent(event))
			super.onTouchEvent(event);
		return(true);
	}
	
	@Override
	public boolean onDoubleTap(MotionEvent e)
	{
		return(true);
	}
	
	@Override
	public boolean onDoubleTapEvent(MotionEvent e)
	{
		return(true);
	}
	
	@Override
	public boolean onSingleTapConfirmed(MotionEvent e)
	{
		
		if(gbLight==0)
			gbLight++;
		else
			gbLight=0;
		if(vkey==0)
		{
			gbLight=1;
			vkey=1;
		}
		else if(vkey==1)
		{
			gbLight=1;
			vkey=0;
		}
		return(true);
	}
	
	@Override
	public boolean onDown(MotionEvent e)
	{
		return(true);
	}
	@Override
	public boolean onFling(MotionEvent e1,MotionEvent e2,float velocityx,float velocityy)
	{
		
		return(true);
	}
	@Override
	public void onLongPress(MotionEvent e)
	{
		
	}
	@Override
	public boolean onScroll(MotionEvent e1,MotionEvent e2,float distancex,float distancey)
	{
		uninitialize();
		System.exit(0);
		return(true);
	}
	@Override
	public void onShowPress(MotionEvent e)
	{
		
	}
	@Override
	public boolean onSingleTapUp(MotionEvent e)
	{
		return(true);
	}
	@Override
	public void onSurfaceCreated(GL10 gl,EGLConfig config)
	{
		String version=gl.glGetString(GL10.GL_VERSION);
		System.out.println("RTR"+version);
		String version1=gl.glGetString(GLES32.GL_SHADING_LANGUAGE_VERSION);
		System.out.println("RTR"+version1);
		initialize();
	}
	@Override
	public void onSurfaceChanged(GL10 unused,int width,int height)
	{
		resize(width,height);
	}
	@Override
	public void onDrawFrame(GL10 unused)
	{
		
		display();
	}
	
	//Our custom methods
	
	private void initialize()
	{
		
		Sphere sphere=new Sphere();
		float sphere_vertices[]=new float[1146];
		float sphere_normals[]=new float[1146];
		float sphere_textures[]=new float[764];
		short sphere_elements[]=new short[2280];
		String szInfoLog1=null;
		sphere.getSphereVertexData(sphere_vertices,sphere_normals,sphere_textures,sphere_elements);
		numVertices=sphere.getNumberOfSphereVertices();
		numElements=sphere.getNumberOfSphereElements();
		
		
		System.out.println("iRTR:Initialize:Before Vertex Shader"+szInfoLog1);
		
		gVertexShaderObject = GLES32.glCreateShader(GLES32.GL_VERTEX_SHADER);
		final String vertexShaderSourceCode=
		String.format
		(
				"#version 320 es"+
				"\n" +
				"in vec4 vPosition;" +
				"in vec3 vnormal;" +
				"uniform mat4 u_m_matrix;" +
				"uniform mat4 u_v_matrix;" +
				"uniform mat4 u_p_matrix;" +
				"uniform int u_lkeyispressed1;" +
				"uniform vec4 u_light_position;" +
				"out vec4 eye_coordinates;" +
				"out vec3 light_direction;" +
				"out vec3 tnorm;" +
				"out vec3 viewer_vector;" +
				"void main(void)" +
				"{" +
				"gl_Position=u_p_matrix*u_v_matrix*u_m_matrix*vPosition;" +
				"if(u_lkeyispressed1 == 1)" +
				"{" +
				"vec4 eye_coordinates=u_v_matrix*u_m_matrix*vPosition;" +
				"tnorm=mat3(u_v_matrix*u_m_matrix)*vnormal;" +
				"light_direction=vec3(u_light_position)-eye_coordinates.xyz;" +
				"viewer_vector=vec3(-eye_coordinates);" +
				"}" +
				"else" +
				"{" +
				"}" +

				"}"

		);

		GLES32.glShaderSource(gVertexShaderObject,vertexShaderSourceCode);
		GLES32.glCompileShader(gVertexShaderObject);
				


		//Error checking
		int[] iShaderCompileStatus=new int[1];
		int[] iInfoLogLength=new int[1];
		String szInfoLog=null;
		GLES32.glGetShaderiv(gVertexShaderObject,GLES32.GL_COMPILE_STATUS,iShaderCompileStatus,0);

		if(iShaderCompileStatus[0]==GLES32.GL_FALSE)
		{
			GLES32.glGetShaderiv(gVertexShaderObject,GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);
			if(iInfoLogLength[0]>0)
			{
				szInfoLog=GLES32.glGetShaderInfoLog(gVertexShaderObject);
				System.out.println("iRTR:VertexShaderObject"+szInfoLog);
				uninitialize();
				System.exit(0);
			}
		}
		

		gFragmentShaderObject = GLES32.glCreateShader(GLES32.GL_FRAGMENT_SHADER);
		final String fragmentShaderSourceCode=
		String.format
		(
				"#version 320 es"+
				"\n"+
				"precision highp float;"+
				"out vec4 FragColor;" +
				"uniform int u_lkeyispressed2;" +
				"uniform vec3 u_ld;" +
				"uniform vec3 u_la;" +
				"uniform vec3 u_ls;" +
				"uniform vec3 u_ka;" +
				"uniform vec3 u_ks;" +
				"uniform vec3 u_kd;" +
				"uniform float m_shininess;"+
				"in vec3 light_direction;" +
				"in vec3 tnorm;"+
				"in vec3 viewer_vector;" +
				"void main(void)" +
				"{" +
				"if(u_lkeyispressed2 == 1)" +
				"{" +
				"vec3 tdnorm=normalize(tnorm);" +
				"vec3 light_direction1=normalize(light_direction);" +
				"float tn_dot_ld=max(dot(light_direction1,tdnorm),0.0);" +
				"vec3 reflection_vector=reflect(-light_direction1,tdnorm);" +
				"vec3 viewer_vector1=normalize(viewer_vector);" +
				"vec3 ambient = u_la * u_ka;" +
				"vec3 diffuse = u_ld * u_kd * tn_dot_ld;" +
				"vec3 specular=u_ls * u_ks * pow(max(dot(reflection_vector,viewer_vector1),0.0),m_shininess);" +
				"vec3 phong_ads_light=ambient+diffuse+specular;" +
				"FragColor=vec4(phong_ads_light,1.0);" +
				"}" +
				"else"+
				"{"+
				"FragColor=vec4(1.0,1.0,1.0,1.0);" +
				"}"+
				"}"
		);

		GLES32.glShaderSource(gFragmentShaderObject,fragmentShaderSourceCode);
		GLES32.glCompileShader(gFragmentShaderObject);
				


		//Error checking
		iShaderCompileStatus[0]=0;
		iInfoLogLength[0]=0;
		szInfoLog=null;
		GLES32.glGetShaderiv(gFragmentShaderObject,GLES32.GL_COMPILE_STATUS,iShaderCompileStatus,0);

		if(iShaderCompileStatus[0]==GLES32.GL_FALSE)
		{
			GLES32.glGetShaderiv(gFragmentShaderObject,GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);
			if(iInfoLogLength[0]>0)
			{
				szInfoLog=GLES32.glGetShaderInfoLog(gFragmentShaderObject);
				System.out.println("iRTR:FragmentShaderObject"+szInfoLog);
				uninitialize();
				System.exit(0);
			}
		}
		
		shaderProgramObject=GLES32.glCreateProgram();
		GLES32.glAttachShader(shaderProgramObject,gVertexShaderObject);
		GLES32.glAttachShader(shaderProgramObject,gFragmentShaderObject);

		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_POSITION,"vPosition");	
		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_NORMAL,"vnormal");
		
		
		GLES32.glLinkProgram(shaderProgramObject);
		
		int[] iShaderLinkStatus = new int[1];
		iInfoLogLength[0] = 0;
		szInfoLog = null;

		GLES32.glGetProgramiv(shaderProgramObject, GLES32.GL_LINK_STATUS,iShaderLinkStatus,0);

	if (iShaderLinkStatus[0] == GLES32.GL_FALSE) {
		GLES32.glGetProgramiv(shaderProgramObject, GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);

		if (iInfoLogLength[0] > 0) {
			szInfoLog=GLES32.glGetProgramInfoLog(shaderProgramObject);

			System.out.println("iRTR:shaderProgramObject"+szInfoLog);
			uninitialize();
			System.exit(0);	
			
		}
	}

		mUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_m_matrix");
		vUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_v_matrix");
		pUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_p_matrix");
		laUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_la");
		lsUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ls");
		ldUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ld");
		kdUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_kd");
		kaUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ka");
		ksUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ks");
		material_shininess_uniform = GLES32.glGetUniformLocation(shaderProgramObject, "m_shininess");
		lightPositionUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_light_position");
		isLKeypressedUniform1 = GLES32.glGetUniformLocation(shaderProgramObject, "u_lkeyispressed1");
		isLKeypressedUniform2 = GLES32.glGetUniformLocation(shaderProgramObject, "u_lkeyispressed2");
		
		//============================================================================================================
		gVertexShaderObject1 = GLES32.glCreateShader(GLES32.GL_VERTEX_SHADER);
		final String vertexShaderSourceCode1=
		String.format
		(
				"#version 320 es"+
				"\n" +
				"in vec4 vPosition;" +
				"in vec3 vnormal;" +
				"uniform mat4 u_m_matrix;" +
				"uniform mat4 u_v_matrix;" +
				"uniform mat4 u_p_matrix;" +
				"uniform int u_lkeyispressed;" +
				"uniform vec3 u_ld;" +
				"uniform vec3 u_la;" +
				"uniform vec3 u_ls;" +
				"uniform vec3 u_ka;" +
				"uniform vec3 u_ks;" +
				"uniform vec3 u_kd;" +
				"uniform float m_shininess;" +
				"uniform vec4 u_light_position;" +
				"out vec3 phong_ads_light;" +
				"void main(void)" +
				"{" +
				"gl_Position=u_p_matrix*u_v_matrix*u_m_matrix*vPosition;" +
				"if(u_lkeyispressed == 1)" +
				"{" +
				"vec4 eye_coordinates=u_v_matrix*u_m_matrix*vPosition;" +
				"vec3 tnorm=normalize(mat3(u_v_matrix*u_m_matrix)*vnormal);" +
				"vec3 light_direction=normalize(vec3(u_light_position)-eye_coordinates.xyz);" +
				"float tn_dot_ld=max(dot(light_direction,tnorm),0.0);" +
				"vec3 reflection_vector=reflect(-light_direction,tnorm);" +
				"vec3 viewer_vector=normalize(vec3(-eye_coordinates));" +
				"vec3 ambient = u_la * u_ka;" +
				"vec3 diffuse = u_ld * u_kd * tn_dot_ld;" +
				"vec3 specular=u_ls * u_ks * pow(max(dot(reflection_vector,viewer_vector),0.0),m_shininess);" +
				"phong_ads_light=ambient+diffuse+specular;" +
				"}" +
				"else" +
				"{" +
				"phong_ads_light=vec3(1.0,1.0,1.0);" +
				"}" +

				"}"
		);

		GLES32.glShaderSource(gVertexShaderObject1,vertexShaderSourceCode1);
		GLES32.glCompileShader(gVertexShaderObject1);
				


		//Error checking
		int[] iShaderCompileStatus1=new int[1];
		int[] iInfoLogLength1=new int[1];
		szInfoLog1=null;
		GLES32.glGetShaderiv(gVertexShaderObject1,GLES32.GL_COMPILE_STATUS,iShaderCompileStatus1,0);

		if(iShaderCompileStatus1[0]==GLES32.GL_FALSE)
		{
			GLES32.glGetShaderiv(gVertexShaderObject1,GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);
			if(iInfoLogLength[0]>0)
			{
				szInfoLog=GLES32.glGetShaderInfoLog(gVertexShaderObject1);
				System.out.println("iRTR:VertexShaderObject"+szInfoLog1);
				uninitialize();
				System.exit(0);
			}
		}
		

		gFragmentShaderObject1 = GLES32.glCreateShader(GLES32.GL_FRAGMENT_SHADER);
		final String fragmentShaderSourceCode1=
		String.format
		(
			"#version 320 es"+
			"\n"+
			"precision highp float;"+
			"in vec3 phong_ads_light;" +
			"out vec4 FragColor;" +
			"uniform int u_lkeyispressed;" +
			"void main(void)" +
			"{" +
			"FragColor=vec4(phong_ads_light,1.0);" +
			"}"
		);

		GLES32.glShaderSource(gFragmentShaderObject1,fragmentShaderSourceCode1);
		GLES32.glCompileShader(gFragmentShaderObject1);
				


		//Error checking
		iShaderCompileStatus1[0]=0;
		iInfoLogLength1[0]=0;
		szInfoLog1=null;
		GLES32.glGetShaderiv(gFragmentShaderObject1,GLES32.GL_COMPILE_STATUS,iShaderCompileStatus1,0);

		if(iShaderCompileStatus1[0]==GLES32.GL_FALSE)
		{
			GLES32.glGetShaderiv(gFragmentShaderObject1,GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength1,0);
			if(iInfoLogLength1[0]>0)
			{
				szInfoLog=GLES32.glGetShaderInfoLog(gFragmentShaderObject1);
				System.out.println("iRTR:FragmentShaderObject"+szInfoLog1);
				uninitialize();
				System.exit(0);
			}
		}
		
		shaderProgramObject1=GLES32.glCreateProgram();
		GLES32.glAttachShader(shaderProgramObject1,gVertexShaderObject1);
		GLES32.glAttachShader(shaderProgramObject1,gFragmentShaderObject1);

		GLES32.glBindAttribLocation(shaderProgramObject1,GLESMacros.AMC_ATTRIBUTE_POSITION,"vPosition");	
		GLES32.glBindAttribLocation(shaderProgramObject1,GLESMacros.AMC_ATTRIBUTE_NORMAL,"vnormal");
		
		
		GLES32.glLinkProgram(shaderProgramObject1);
		
		int[] iShaderLinkStatus1 = new int[1];
		iInfoLogLength1[0] = 0;
		szInfoLog1 = null;

		GLES32.glGetProgramiv(shaderProgramObject1, GLES32.GL_LINK_STATUS,iShaderLinkStatus1,0);

	if (iShaderLinkStatus1[0] == GLES32.GL_FALSE) {
		GLES32.glGetProgramiv(shaderProgramObject1, GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength1,0);

		if (iInfoLogLength1[0] > 0) {
			szInfoLog1=GLES32.glGetProgramInfoLog(shaderProgramObject1);

			System.out.println("iRTR:shaderProgramObject"+szInfoLog1);
			uninitialize();
			System.exit(0);	
			
		}
	}

		mUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_m_matrix");
		vUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_v_matrix");
		pUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_p_matrix");
		laUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_la");
		lsUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_ls");
		ldUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_ld");
		kdUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_kd");
		kaUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_ka");
		ksUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_ks");
		material_shininess_uniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "m_shininess");
		lightPositionUniform1 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_light_position");
		isLKeypressedUniform3 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_lkeyispressed");
		isLKeypressedUniform4 = GLES32.glGetUniformLocation(shaderProgramObject1, "u_lkeyispressed");
		//=============================================================================================================
		GLES32.glGenVertexArrays(1,vao_sphere,0);
		GLES32.glBindVertexArray(vao_sphere[0]);
		
		GLES32.glGenBuffers(1,vbo_sphere_position,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_sphere_position[0]);
		ByteBuffer byteBuffer=ByteBuffer.allocateDirect(sphere_vertices.length*4);
		byteBuffer.order(ByteOrder.nativeOrder());
		FloatBuffer verticesBuffer=byteBuffer.asFloatBuffer();
		verticesBuffer.put(sphere_vertices);
		verticesBuffer.position(0);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,sphere_vertices.length*4,verticesBuffer,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);
		
		GLES32.glGenBuffers(1,vbo_sphere_normal,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_sphere_normal[0]);
		ByteBuffer byteBuffer1=ByteBuffer.allocateDirect(sphere_normals.length*4);
		byteBuffer1.order(ByteOrder.nativeOrder());
		FloatBuffer verticesBuffer1=byteBuffer1.asFloatBuffer();
		verticesBuffer1.put(sphere_normals);
		verticesBuffer1.position(0);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,sphere_normals.length*4,verticesBuffer1,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_NORMAL,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_NORMAL);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);
		
		GLES32.glGenBuffers(1,vbo_sphere_element,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_sphere_element[0]);
		ByteBuffer byteBuffer2=ByteBuffer.allocateDirect(sphere_elements.length*2);
		byteBuffer2.order(ByteOrder.nativeOrder());
		ShortBuffer elementsBuffer=byteBuffer2.asShortBuffer();
		elementsBuffer.put(sphere_elements);
		elementsBuffer.position(0);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,sphere_elements.length*2,elementsBuffer,GLES32.GL_STATIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0); 
		
		
		GLES32.glBindVertexArray(0);
		
	light_ambient[0] = 0.0f;
	light_ambient[1] = 0.0f;
	light_ambient[2] = 0.0f;
	light_ambient[3] = 0.0f;
	
	ByteBuffer byteBuffer3=ByteBuffer.allocateDirect(light_ambient.length*4);
	byteBuffer3.order(ByteOrder.nativeOrder());
	ambientBuffer=byteBuffer3.asFloatBuffer();
	ambientBuffer.put(light_ambient);
	ambientBuffer.position(0);

	light_diffuse[0] = 0.6f;
	light_diffuse[1] = 0.0f;
	light_diffuse[2] = 0.5f;
	light_diffuse[3] = 1.0f;
	
	ByteBuffer byteBuffer4=ByteBuffer.allocateDirect(light_diffuse.length*4);
	byteBuffer4.order(ByteOrder.nativeOrder());
	diffuseBuffer=byteBuffer4.asFloatBuffer();
	diffuseBuffer.put(light_diffuse);
	diffuseBuffer.position(0);

	light_specular[0] = 0.6f;
	light_specular[1] = 0.0f;
	light_specular[2] = 0.5f;
	light_specular[3] = 1.0f;
	
	ByteBuffer byteBuffer5=ByteBuffer.allocateDirect(light_specular.length*4);
	byteBuffer5.order(ByteOrder.nativeOrder());
	specularBuffer=byteBuffer5.asFloatBuffer();
	specularBuffer.put(light_specular);
	specularBuffer.position(0);

	light_position[0] = 100.0f;
	light_position[1] = 100.0f;
	light_position[2] = 100.0f;
	light_position[3] = 1.0f;

	ByteBuffer byteBuffer6=ByteBuffer.allocateDirect(light_position.length*4);
	byteBuffer6.order(ByteOrder.nativeOrder());
	positionBuffer=byteBuffer6.asFloatBuffer();
	positionBuffer.put(light_position);
	positionBuffer.position(0);
	
	material_ambient[0] = 0.0f;
	material_ambient[1] = 0.0f;
	material_ambient[2] = 0.0f;
	material_ambient[3] = 0.0f;
	
	ByteBuffer byteBuffer7=ByteBuffer.allocateDirect(material_ambient.length*4);
	byteBuffer7.order(ByteOrder.nativeOrder());
	mambientBuffer=byteBuffer7.asFloatBuffer();
	mambientBuffer.put(material_ambient);
	mambientBuffer.position(0);

	material_diffuse[0] = 0.6f;
	material_diffuse[1] = 0.0f;
	material_diffuse[2] = 0.5f;
	material_diffuse[3] = 1.0f;
	
	ByteBuffer byteBuffer8=ByteBuffer.allocateDirect(material_diffuse.length*4);
	byteBuffer8.order(ByteOrder.nativeOrder());
	mdiffuseBuffer=byteBuffer8.asFloatBuffer();
	mdiffuseBuffer.put(material_diffuse);
	mdiffuseBuffer.position(0);

	material_specular[0] = 0.6f;
	material_specular[1] = 0.0f;
	material_specular[2] = 0.5f;
	material_specular[3] = 1.0f;
	
	ByteBuffer byteBuffer9=ByteBuffer.allocateDirect(material_specular.length*4);
	byteBuffer9.order(ByteOrder.nativeOrder());
	mspecularBuffer=byteBuffer9.asFloatBuffer();
	mspecularBuffer.put(material_specular);
	mspecularBuffer.position(0);


	material_shininess[0] = 50.0f;
	ByteBuffer byteBuffer10=ByteBuffer.allocateDirect(material_shininess.length*4);
	byteBuffer10.order(ByteOrder.nativeOrder());
	mshininessBuffer=byteBuffer10.asFloatBuffer();
	mshininessBuffer.put(material_shininess);
	mshininessBuffer.position(0);

		GLES32.glEnable(GLES32.GL_DEPTH_TEST);
		GLES32.glDepthFunc(GLES32.GL_LEQUAL);
		Matrix.setIdentityM(perspectiveProjectionMatrix,0);

		GLES32.glClearColor(0.0f,0.0f,0.0f,1.0f);
	}
	private void resize(int width,int height)
	{
		if(height==0)
			height=1;
		GLES32.glViewport(0,0,width,height);
		Matrix.perspectiveM(perspectiveProjectionMatrix,0,45.0f, (float)width / (float)height, 0.1f, 100.0f);
	}
	private void display()
	{	
		String szInfoLog1=null;
		GLES32.glClear(GLES32.GL_COLOR_BUFFER_BIT|GLES32.GL_DEPTH_BUFFER_BIT);
		if(vkey==0)
		GLES32.glUseProgram(shaderProgramObject1);
		else
		GLES32.glUseProgram(shaderProgramObject);
		float[] projectionMatrix=new float[16];
		float[] modelMatrix=new float[16];
		float[] viewMatrix=new float[16];
		
		
		//triangle
		Matrix.setIdentityM(projectionMatrix,0);
		Matrix.setIdentityM(modelMatrix,0);
		Matrix.setIdentityM(viewMatrix,0);
		//Matrix.setIdentityM(rotationMatrix,0);
		Matrix.translateM(modelMatrix,0,0.0f,0.0f,-2.0f);
		Matrix.multiplyMM(projectionMatrix,0,perspectiveProjectionMatrix,0,projectionMatrix,0);
		GLES32.glUniformMatrix4fv(mUniform,1,false,modelMatrix,0);
		GLES32.glUniformMatrix4fv(vUniform,1,false,viewMatrix,0);
		GLES32.glUniformMatrix4fv(pUniform,1,false,projectionMatrix,0);
		
		if (gbLight == 1)
		{
		GLES32.glUniform1i(isLKeypressedUniform1, 1);
		GLES32.glUniform1i(isLKeypressedUniform2, 1);
		GLES32.glUniform3fv(laUniform, 1, ambientBuffer);
		GLES32.glUniform3fv(ldUniform, 1, diffuseBuffer);
		GLES32.glUniform3fv(lsUniform, 1, specularBuffer);
		GLES32.glUniform4fv(lightPositionUniform, 1, positionBuffer);

		GLES32.glUniform3fv(kaUniform, 1, mambientBuffer);
		GLES32.glUniform3fv(kdUniform, 1, mdiffuseBuffer);
		GLES32.glUniform3fv(ksUniform, 1, mspecularBuffer);
		GLES32.glUniform1fv(material_shininess_uniform, 1, mshininessBuffer);
		}
		else
		{
		GLES32.glUniform1i(isLKeypressedUniform1, 0);
		GLES32.glUniform1i(isLKeypressedUniform2, 0);
		}
		
		GLES32.glBindVertexArray(vao_sphere[0]);
		GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER,vbo_sphere_element[0]);
		GLES32.glDrawElements(GLES32.GL_TRIANGLES,(int)numElements,GLES32.GL_UNSIGNED_SHORT,0);
		GLES32.glBindVertexArray(0);
		
		//=============================================================================================================
		
		Matrix.setIdentityM(projectionMatrix,0);
		Matrix.setIdentityM(modelMatrix,0);
		Matrix.setIdentityM(viewMatrix,0);
		//Matrix.setIdentityM(rotationMatrix,0);
		Matrix.translateM(modelMatrix,0,0.0f,0.0f,-2.0f);
		Matrix.multiplyMM(projectionMatrix,0,perspectiveProjectionMatrix,0,projectionMatrix,0);
		GLES32.glUniformMatrix4fv(mUniform1,1,false,modelMatrix,0);
		GLES32.glUniformMatrix4fv(vUniform1,1,false,viewMatrix,0);
		GLES32.glUniformMatrix4fv(pUniform1,1,false,projectionMatrix,0);
		
		if (gbLight == 1)
		{
		GLES32.glUniform1i(isLKeypressedUniform3, 1);
		GLES32.glUniform1i(isLKeypressedUniform4, 1);
		GLES32.glUniform3fv(laUniform1, 1, ambientBuffer);
		GLES32.glUniform3fv(ldUniform1, 1, diffuseBuffer);
		GLES32.glUniform3fv(lsUniform1, 1, specularBuffer);
		GLES32.glUniform4fv(lightPositionUniform1, 1, positionBuffer);

		GLES32.glUniform3fv(kaUniform1, 1, mambientBuffer);
		GLES32.glUniform3fv(kdUniform1, 1, mdiffuseBuffer);
		GLES32.glUniform3fv(ksUniform1, 1, mspecularBuffer);
		GLES32.glUniform1fv(material_shininess_uniform1, 1, mshininessBuffer);
		}
		else
		{
		GLES32.glUniform1i(isLKeypressedUniform3, 0);
		GLES32.glUniform1i(isLKeypressedUniform4, 0);
		}
		
		
		
		GLES32.glBindVertexArray(vao_sphere[0]);
		GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER,vbo_sphere_element[0]);
		GLES32.glDrawElements(GLES32.GL_TRIANGLES,(int)numElements,GLES32.GL_UNSIGNED_SHORT,0);
		GLES32.glBindVertexArray(0);
		GLES32.glUseProgram(0);
		Update();
		requestRender();
	}
	private void Update()
	{
		
	}
	private void uninitialize()
	{
		if (vbo_sphere_position[0]!=0) {
			GLES32.glDeleteBuffers(1,vbo_sphere_position,0);
			vbo_sphere_position[0] = 0;
		}
		if (vbo_sphere_element[0]!=0) {
			GLES32.glDeleteBuffers(1,vbo_sphere_element,0);
			vbo_sphere_element[0] = 0;
		}
		if (vao_sphere[0]!=0) {
			GLES32.glDeleteVertexArrays(1,vao_sphere,0);
			vao_sphere[0] = 0;
		}
		
		if (shaderProgramObject != 0) {
			int[] shaderCount=new int[1];

			GLES32.glUseProgram(shaderProgramObject);
			
			GLES32.glGetProgramiv(shaderProgramObject,GLES32.GL_ATTACHED_SHADERS,shaderCount,0);	
	
			if (shaderCount[0]!=0) {
				
				int shaderNumber;
				int[] shaders = new int[shaderCount[0]];

				GLES32.glGetAttachedShaders(shaderProgramObject,shaderCount[0],shaderCount,0,shaders,0);
	
				for (shaderNumber = 0; shaderNumber < shaderCount[0]; shaderNumber++) {
					GLES32.glDetachShader(shaderProgramObject, shaders[shaderNumber]);
					GLES32.glDeleteShader(shaders[shaderNumber]);
					shaders[shaderNumber] = 0;
				}
			}
			GLES32.glDeleteProgram(shaderProgramObject);
			shaderProgramObject = 0;
			GLES32.glUseProgram(0);
		}	
	}
}
