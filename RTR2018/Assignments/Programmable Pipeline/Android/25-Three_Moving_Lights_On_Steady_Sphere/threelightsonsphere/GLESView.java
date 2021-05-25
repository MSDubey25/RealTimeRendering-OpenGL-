package com.astromedicomp.threelightsonsphere;

//added by user/developer
import androidx.appcompat.widget.AppCompatTextView;
import android.content.Context;
import android.view.Gravity;
import android.graphics.Color;
import android.view.View;
import android.view.MotionEvent;
import android.view.GestureDetector;
import android.view.GestureDetector.OnGestureListener;
import android.view.GestureDetector.OnDoubleTapListener;

import android.opengl.GLES32;
import android.opengl.GLSurfaceView;
import javax.microedition.khronos.opengles.GL10;
import javax.microedition.khronos.egl.EGLConfig;

//for opengl buffers
import java.nio.ByteBuffer; //nio->non-blocking/native Input Output
import java.nio.ByteOrder;
import java.nio.FloatBuffer;

import android.opengl.Matrix;//for Matrix Maths
import java.lang.Math;

import java.nio.ShortBuffer; //for sphere

public class GLESView extends GLSurfaceView implements GLSurfaceView.Renderer,OnGestureListener,OnDoubleTapListener
{
	private final Context context;
	private GestureDetector gestureDetector;

	//seven new variables
	private int vertexShaderObject;
	private int num=2000;
	private int fragmentShaderObject;
	private int shaderProgramObject;
		
	private int mUniform;
	private int vUniform;
	private int pUniform;
	
	private int laUniform_red;
	private int ldUniform_red;
	private int lsUniform_red;
	private int lightPositionUniform_red;
	private int laUniform_blue;
	private int ldUniform_blue;
	private int lsUniform_blue;
	private int lightPositionUniform_blue;
	private int laUniform_green;
	private int ldUniform_green;
	private int lsUniform_green;
	private int lightPositionUniform_green;
	private int kaUniform;
	private int kdUniform;
	private int ksUniform;
	private int materialShininessUniform;
	private int isTouchedUniform;
	
	private boolean isLighting=false;
	private float[] ModelMatrix=new float[16];
	private float[] ViewMatrix=new float[16];
	private float[] ProjectionMatrix=new float[16];

	private int[] vao_sphere = new int[1];
    private int[] vbo_sphere_position = new int[1];
    private int[] vbo_sphere_normal = new int[1];
    private int[] vbo_sphere_element = new int[1];
	private int numVertices=0;
    private int numElements=0;
		
	static float angle = 0.0f;
	float light_ambient_red[] = new float[]{0.0f,0.0f,0.0f,1.0f};
	float light_diffuse_red[] = new float[]{ 1.0f,0.0f,0.0f,1.0f };
	float light_specular_red[] = new float[]{ 1.0f,0.0f,0.0f,1.0f };
	float light_position_red[] = new float[]{ 0.0f,0.0f,0.0f,1.0f };
	
	float light_ambient_green[] = new float[]{0.0f,0.0f,0.0f,1.0f};
	float light_diffuse_green[] = new float[]{ 0.0f,1.0f,0.0f,1.0f };
	float light_specular_green[] = new float[]{ 0.0f,1.0f,0.0f,1.0f };
	float light_position_green[] = new float[]{ 0.0f,0.0f,0.0f,1.0f };
	
	float light_ambient_blue[] = new float[]{0.0f,0.0f,0.0f,1.0f};
	float light_diffuse_blue[] = new float[]{ 0.0f,0.0f,1.0f,1.0f };
	float light_specular_blue[] = new float[]{ 0.0f,0.0f,1.0f,1.0f };
	float light_position_blue[] = new float[]{ 0.0f,0.0f,0.0f,1.0f };

	float material_ambient[] = new float[]{ 0.5f,0.5f,0.5f,1.0f };
	float material_diffuse[] = new float[]{ 1.0f,1.0f,1.0f,1.0f };
	float material_specular[] = new float[]{ 1.0f,1.0f,1.0f,1.0f };
	float material_shininess[] = new float[]{ 128.0f };
	public GLESView(Context drawing)
	{
		super(drawing);
		context=drawing;
		gestureDetector=new GestureDetector(drawing,this,null,false);
		gestureDetector.setOnDoubleTapListener(this);	

		//call functions of GLSurfaceView
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
		return true;
	}

	@Override
	public boolean onDoubleTap(MotionEvent event)
	{
		if(isLighting==false)
			isLighting=true;
		else
			isLighting=false;
		
		return true;
	}

	@Override 
	public boolean onDoubleTapEvent(MotionEvent event)
	{
		return true;
	}

	@Override 
	public boolean onSingleTapConfirmed(MotionEvent event)
	{
		return true;
	}

	@Override 
	public boolean onDown(MotionEvent event)
	{
		return true;
	}

	@Override 
	public void onLongPress(MotionEvent event)
	{
	}

	@Override 
	public void onShowPress(MotionEvent event)
	{
		
	}

	@Override 
	public boolean onSingleTapUp(MotionEvent event)
	{
		return true;
	}

	@Override 
	public boolean onFling(MotionEvent e1,MotionEvent e2,float velocityX,float velocityY)
	{
		return true;
	}

	@Override 
	public boolean onScroll(MotionEvent e1,MotionEvent e2,float distanceX,float distanceY)
	{
		uninitialize();
		System.exit(0);
		return true;
	}
	@Override
	public void onSurfaceCreated(GL10 gl,EGLConfig config)
	{
		String version=gl.glGetString(GL10.GL_VERSION);
		System.out.println("RTR: OpenGL version ="+version);
		String glslVersion=gl.glGetString(GLES32.GL_SHADING_LANGUAGE_VERSION);
		System.out.println("RTR: OpenGL shading version ="+glslVersion);
		initialize();
	}
	@Override
	public void onSurfaceChanged(GL10 unused,int width,int height)
	{
		Resize(width,height);
	}

	@Override
	public void onDrawFrame(GL10 unused)
	{
		Display();
	}

	private void initialize()
	{
	//upto wglMakeCurrent is taken care by GLSurfaceView
		vertexShaderObject=GLES32.glCreateShader(GLES32.GL_VERTEX_SHADER);
		final String vertexShaderSourceCode = String.format(
															"#version 320 es"+
															"\n"+
															"precision highp float;"+
															"in vec4 vPosition;"+
															"in vec3 vNormal;"+
															"uniform mat4 u_m_matrix;"+
															"uniform mat4 u_v_matrix;"+
															"uniform mat4 u_p_matrix;"+
															"uniform vec4 u_lightPosition_red;" +
															"uniform vec4 u_lightPosition_blue;"+
															"uniform vec4 u_lightPosition_green;" +
															"uniform int u_LkeyIsPressed;" +
															"out vec3 light_direction_red;"+
															"out vec3 light_direction_blue;" +
															"out vec3 light_direction_green;"+
															"out vec3 reflection_vector_red;" +
															"out vec3 reflection_vector_blue;"+
															"out vec3 reflection_vector_green;" +
															"out vec3 viewer_vector;" +
															"out vec3 transformedNormal;" +
															"out vec3 white;" +
															"uniform float u_isTouched;"+
															"void main(void)"+
															"{"+
															"	if(u_isTouched==1.0)"+
															"	{"+
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
															"}");
		
		GLES32.glShaderSource(vertexShaderObject,vertexShaderSourceCode);
		GLES32.glCompileShader(vertexShaderObject);
		//error check for shader compilation
		int[] iShaderCompileStatus=new int[1];
		int[] iInfoLogLength=new int[1];
		String szInfoLog=null;

		GLES32.glGetShaderiv(vertexShaderObject,GLES32.GL_COMPILE_STATUS,iShaderCompileStatus,0);
		System.out.println("RTR:Vertex Shader Compilation Status ---->"+iShaderCompileStatus[0]);
		if(iShaderCompileStatus[0]==GLES32.GL_FALSE)
		{
			GLES32.glGetShaderiv(vertexShaderObject,GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);
			if(iInfoLogLength[0]>0)
			{
				szInfoLog=GLES32.glGetShaderInfoLog(vertexShaderObject);
				System.out.println("RTR:Vertex Shader Compilation Log ---->"+szInfoLog);
				uninitialize();
				System.exit(0);
			}
		}
		fragmentShaderObject=GLES32.glCreateShader(GLES32.GL_FRAGMENT_SHADER);
		final String fragmentShaderSourceCode=String.format(
															"#version 320 es"+
															"\n"+
															"precision highp float;"+
															"in vec3 light_direction_red;" +
															"in vec3 light_direction_blue;" +
															"in vec3 light_direction_green;"+
															"in vec3 reflection_vector_red;"+
															"in vec3 reflection_vector_blue;" +
															"in vec3 reflection_vector_green;"+
															"in vec3 viewer_vector;" +
															"in vec3 transformedNormal;" +
															"in vec3 white;" +
															"uniform vec3 u_la_red;" +
															"uniform vec3 u_ld_red;" +
															"uniform vec3 u_ls_red;" +
															"uniform vec3 u_la_blue;"+
															"uniform vec3 u_ld_blue;"+
															"uniform vec3 u_ls_blue;" +
															"uniform vec3 u_la_green;"+
															"uniform vec3 u_ld_green;"+
															"uniform vec3 u_ls_green;"+
															"uniform vec3 u_ka;" +
															"uniform vec3 u_kd;" +
															"uniform vec3 u_ks;" +
															"uniform float u_materialShininess;" +
															"uniform float u_isTouched;"+
															"out vec4 FragColor;"+
															"void main(void)"+
															"{"+
															"	if(u_isTouched==1.0)"+
															"	{"+
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
															"}");
		GLES32.glShaderSource(fragmentShaderObject,fragmentShaderSourceCode);
		GLES32.glCompileShader(fragmentShaderObject);
		//error check for shader compilation
		iShaderCompileStatus[0]=0;
		iInfoLogLength[0]=0;
		szInfoLog=null;

		GLES32.glGetShaderiv(fragmentShaderObject,GLES32.GL_COMPILE_STATUS,iShaderCompileStatus,0);
		System.out.println("RTR:Fragment Shader Compilation Status ---->"+iShaderCompileStatus[0]);
		if(iShaderCompileStatus[0]==GLES32.GL_FALSE)
		{
			GLES32.glGetShaderiv(fragmentShaderObject,GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);
			if(iInfoLogLength[0]>0)
			{
				szInfoLog=GLES32.glGetShaderInfoLog(fragmentShaderObject);
				System.out.println("RTR:Fragment Shader Compilation Log ---->"+szInfoLog);
				uninitialize();
				System.exit(0);
			}
		}

		//create ,Attach and bind shader object
		shaderProgramObject=GLES32.glCreateProgram();
		GLES32.glAttachShader(shaderProgramObject,vertexShaderObject);
		GLES32.glAttachShader(shaderProgramObject,fragmentShaderObject);
		//prelink binding attribute
		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_POSITION,"vPosition");
		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_NORMAL,"vNormal");
		//link the program
		GLES32.glLinkProgram(shaderProgramObject);
		//error check for program link
		int[] iProgramLinkStatus=new int[1];
		iInfoLogLength[0]=0;
		szInfoLog=null;

		GLES32.glGetProgramiv(shaderProgramObject,GLES32.GL_LINK_STATUS,iProgramLinkStatus,0);
		System.out.println("RTR:program Status ---->"+iProgramLinkStatus[0]);
		if(iProgramLinkStatus[0]==GLES32.GL_FALSE)
		{
			GLES32.glGetProgramiv(shaderProgramObject,GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);
			if(iInfoLogLength[0]>0)
			{
				szInfoLog=GLES32.glGetProgramInfoLog(shaderProgramObject);
				System.out.println("RTR:program link error Log ---->"+szInfoLog);
				uninitialize();
				System.exit(0);
			}
		}
		//post linking
		mUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_m_matrix");
		vUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_v_matrix");
		pUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_p_matrix");
		laUniform_red = GLES32.glGetUniformLocation(shaderProgramObject, "u_la_red");
		ldUniform_red = GLES32.glGetUniformLocation(shaderProgramObject, "u_ld_red");
		lsUniform_red = GLES32.glGetUniformLocation(shaderProgramObject, "u_ls_red");
		lightPositionUniform_red = GLES32.glGetUniformLocation(shaderProgramObject, "u_lightPosition_red");
		laUniform_blue = GLES32.glGetUniformLocation(shaderProgramObject, "u_la_blue");
		ldUniform_blue = GLES32.glGetUniformLocation(shaderProgramObject, "u_ld_blue");
		lsUniform_blue = GLES32.glGetUniformLocation(shaderProgramObject, "u_ls_blue");
		lightPositionUniform_blue = GLES32.glGetUniformLocation(shaderProgramObject, "u_lightPosition_blue");
		laUniform_green = GLES32.glGetUniformLocation(shaderProgramObject, "u_la_green");
		ldUniform_green = GLES32.glGetUniformLocation(shaderProgramObject, "u_ld_green");
		lsUniform_green = GLES32.glGetUniformLocation(shaderProgramObject, "u_ls_green");
		lightPositionUniform_green = GLES32.glGetUniformLocation(shaderProgramObject, "u_lightPosition_green");
		kaUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ka");
		kdUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_kd");
		ksUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ks");
		materialShininessUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_materialShininess");
		isTouchedUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_isTouched");
		
		//for sphere
		Sphere sphere=new Sphere();
        float sphere_vertices[]=new float[1146];
        float sphere_normals[]=new float[1146];
        float sphere_textures[]=new float[764];
        short sphere_elements[]=new short[2280];
		
		sphere.getSphereVertexData(sphere_vertices, sphere_normals, sphere_textures, sphere_elements);
        numVertices = sphere.getNumberOfSphereVertices();
        numElements = sphere.getNumberOfSphereElements();

        // vao
        GLES32.glGenVertexArrays(1,vao_sphere,0);
        GLES32.glBindVertexArray(vao_sphere[0]);
        
        // position vbo
        GLES32.glGenBuffers(1,vbo_sphere_position,0);
        GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_sphere_position[0]);
        
        ByteBuffer byteBuffer=ByteBuffer.allocateDirect(sphere_vertices.length * 4);
        byteBuffer.order(ByteOrder.nativeOrder());
        FloatBuffer verticesBuffer=byteBuffer.asFloatBuffer();
        verticesBuffer.put(sphere_vertices);
        verticesBuffer.position(0);
        
        GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,
                            sphere_vertices.length * 4,
                            verticesBuffer,
                            GLES32.GL_STATIC_DRAW);
        
        GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,
                                     3,
                                     GLES32.GL_FLOAT,
                                     false,0,0);
        
        GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
        
        GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);
        
        // normal vbo
        GLES32.glGenBuffers(1,vbo_sphere_normal,0);
        GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_sphere_normal[0]);
        
        byteBuffer=ByteBuffer.allocateDirect(sphere_normals.length * 4);
        byteBuffer.order(ByteOrder.nativeOrder());
        verticesBuffer=byteBuffer.asFloatBuffer();
        verticesBuffer.put(sphere_normals);
        verticesBuffer.position(0);
        
        GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,
                            sphere_normals.length * 4,
                            verticesBuffer,
                            GLES32.GL_STATIC_DRAW);
        
        GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_NORMAL,
                                     3,
                                     GLES32.GL_FLOAT,
                                     false,0,0);
        
        GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_NORMAL);
        
        GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);
        
        // element vbo
        GLES32.glGenBuffers(1,vbo_sphere_element,0);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER,vbo_sphere_element[0]);
        
        byteBuffer=ByteBuffer.allocateDirect(sphere_elements.length * 2);
        byteBuffer.order(ByteOrder.nativeOrder());
        ShortBuffer elementsBuffer=byteBuffer.asShortBuffer();
        elementsBuffer.put(sphere_elements);
        elementsBuffer.position(0);
        
        GLES32.glBufferData(GLES32.GL_ELEMENT_ARRAY_BUFFER,
                            sphere_elements.length * 2,
                            elementsBuffer,
                            GLES32.GL_STATIC_DRAW);
        
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER,0);

        GLES32.glBindVertexArray(0);

		
		//depth mandate lines
		GLES32.glEnable(GLES32.GL_DEPTH_TEST);
		GLES32.glDepthFunc(GLES32.GL_LEQUAL);
		
		Matrix.setIdentityM(ModelMatrix,0);
		Matrix.setIdentityM(ViewMatrix,0);
		Matrix.setIdentityM(ProjectionMatrix,0);
		/*System.out.println("RTR:perspectiveProjectionMatrix ---->");
		for(int i=0;i<16;i++)
		{
			System.out.print(perspectiveProjectionMatrix[i]);
		}*/
		GLES32.glClearColor(0.0f,0.0f,0.0f,1.0f);
		
	}
	private void Resize(int width,int height)
	{
		if (height == 0)
			height = 1;
		GLES32.glViewport(0, 0,width, height);
		Matrix.perspectiveM(ProjectionMatrix,0,45.0f,
		width / height,
		0.1f,
		100.0f);
	}
	private void Display()
	{
		GLES32.glClear(GLES32.GL_COLOR_BUFFER_BIT | GLES32.GL_DEPTH_BUFFER_BIT);
		GLES32.glUseProgram(shaderProgramObject);
		float[] translationMatrix=new float[16];
		float[] rotationMatrix=new float[16];

		Matrix.setIdentityM(ModelMatrix,0);
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.setIdentityM(rotationMatrix,0);
		
		Matrix.translateM(translationMatrix,0,0.0f, 0.0f, -2.0f);
		Matrix.multiplyMM(ModelMatrix,0,ModelMatrix,0,translationMatrix,0);
		Matrix.multiplyMM(ModelMatrix,0,ModelMatrix,0,rotationMatrix,0);
				
		if (isLighting == true)
		{
			GLES32.glUniform1f(isTouchedUniform, 1.0f);
		light_position_red[0] = 0.0f;
		light_position_red[1] = 100.0f*(float)Math.sin(angle);
		light_position_red[2] = 100.0f*(float)Math.cos(angle);
		light_position_red[3] = 1.0f;
		GLES32.glUniform3fv(laUniform_red, 1, light_ambient_red,0);
		GLES32.glUniform3fv(ldUniform_red, 1, light_diffuse_red,0);
		GLES32.glUniform3fv(lsUniform_red, 1, light_specular_red,0);
		GLES32.glUniform4fv(lightPositionUniform_red, 1,light_position_red,0);
		
		light_position_green[0] = 100.0f*(float)Math.sin(angle);
		light_position_green[1] = 0.0f;
		light_position_green[2] = 100.0f*(float)Math.cos(angle);
		light_position_green[3] = 1.0f;
		GLES32.glUniform3fv(laUniform_blue, 1, light_ambient_green,0);
		GLES32.glUniform3fv(ldUniform_blue, 1, light_diffuse_green,0);
		GLES32.glUniform3fv(lsUniform_blue, 1, light_specular_green,0);
		GLES32.glUniform4fv(lightPositionUniform_blue, 1, light_position_green,0);
		
		light_position_blue[0] = 100.0f*(float)Math.sin(angle);
		light_position_blue[1] = 100.0f*(float)Math.cos(angle);
		light_position_blue[2] = 0.0f;
		light_position_blue[3] = 1.0f;
		GLES32.glUniform3fv(laUniform_green, 1, light_ambient_blue,0);
		GLES32.glUniform3fv(ldUniform_green, 1, light_diffuse_blue,0);
		GLES32.glUniform3fv(lsUniform_green, 1, light_specular_blue,0);
		GLES32.glUniform4fv(lightPositionUniform_green, 1, light_position_blue,0);
		GLES32.glUniform3fv(kaUniform, 1, material_ambient,0);
		GLES32.glUniform3fv(kdUniform, 1, material_diffuse,0);
		GLES32.glUniform3fv(ksUniform, 1, material_specular,0);
		GLES32.glUniform1fv(materialShininessUniform, 1, material_shininess,0);
		}
		else
		{
			GLES32.glUniform1f(isTouchedUniform, 0.0f);
		}
		GLES32.glUniformMatrix4fv(mUniform,1,false,ModelMatrix,0);
		GLES32.glUniformMatrix4fv(vUniform,1,false,ViewMatrix,0);
		GLES32.glUniformMatrix4fv(pUniform,1,false,ProjectionMatrix,0);
		
		//for diffuse light on sphere
		// bind vao
		System.out.println("RTR:drawing sphere :---->");
        GLES32.glBindVertexArray(vao_sphere[0]);
        
        // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0);
        
        // unbind vao
        GLES32.glBindVertexArray(0);
		
		//unuse program
		GLES32.glUseProgram(0);
		requestRender();
		
		update();
	}
	private void update()
	{
	if (angle >= 360.0f)
		angle = 0.0f;
	else
		angle += 0.01f;
	}
	private void uninitialize()
	{
		// destroy vao
        if(vao_sphere[0] != 0)
        {
            GLES32.glDeleteVertexArrays(1, vao_sphere, 0);
            vao_sphere[0]=0;
        }
        
        // destroy position vbo
        if(vbo_sphere_position[0] != 0)
        {
            GLES32.glDeleteBuffers(1, vbo_sphere_position, 0);
            vbo_sphere_position[0]=0;
        }
        
        // destroy normal vbo
        if(vbo_sphere_normal[0] != 0)
        {
            GLES32.glDeleteBuffers(1, vbo_sphere_normal, 0);
            vbo_sphere_normal[0]=0;
        }
        
        // destroy element vbo
        if(vbo_sphere_element[0] != 0)
        {
            GLES32.glDeleteBuffers(1, vbo_sphere_element, 0);
            vbo_sphere_element[0]=0;
        }
		
		if(shaderProgramObject!=0)
		{
			int[] shaderCount=new int[1];
			int shaderNumber=0;
			GLES32.glUseProgram(shaderProgramObject);
			GLES32.glGetProgramiv(shaderProgramObject,GLES32.GL_ATTACHED_SHADERS,shaderCount,0);
			int[] shaders=new int[shaderCount[0]];
			GLES32.glGetAttachedShaders(shaderProgramObject,shaderCount[0],shaderCount,0,shaders,0);

			for(int i=0;i<shaderCount[0];i++)
			{
				System.out.println("RTR:Deleting Shader :---->"+shaders[i]);
				GLES32.glDetachShader(shaderProgramObject, shaders[i]);
				GLES32.glDeleteShader(shaders[i]);
				shaders[i]=0;
			}
		}
	}
}

