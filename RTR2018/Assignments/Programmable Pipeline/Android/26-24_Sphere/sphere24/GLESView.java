package com.astromedicomp.sphere24;

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
	private int laUniform;
	private int ldUniform;
	private int lsUniform;
	private int kaUniform;
	private int kdUniform;
	private int ksUniform;
	private int materialShininessUniform;
	private int isTouchedUniform;
	private int lightPositionUniform;
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
	
	private float angleOfXRotation = 0.0f;
	private float angleOfYRotation = 0.0f;
	private float angleOfZRotation = 0.0f;
	 private int keyPress=0;
	
	private float[] light_ambient = new float[4];
	private float[] light_diffuse = new float[4];
	private float[] light_specular = new float[4];
	private float[] light_position = new float[4];
	
	private float[] material_ambient = new float[3];
	private float[] material_diffuse = new float[3];
	private float[] material_specular = new float[3];
	private float[] material_shininess = new float[1];
	
	int h;
	int w;
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
		keyPress++;
		if(keyPress>3)
		{
			keyPress=0;
		}
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
				
		light_ambient[0]=0.0f;
		light_ambient[1]=0.0f;
		light_ambient[2]=0.0f;
		light_ambient[3]=0.0f;
		
		light_diffuse[0]=1.0f;
		light_diffuse[1]=1.0f;
		light_diffuse[2]=1.0f;
		light_diffuse[3]=1.0f;
		
		light_specular[0]=1.0f;
		light_specular[1]=1.0f;
		light_specular[2]=1.0f;
		light_specular[3]=1.0f;
		
		light_position[0]=0.0f;
		light_position[1]=0.0f;
		light_position[2]=0.0f;
		light_position[3]=1.0f;
		
		material_ambient[0]=0.0f;
		material_ambient[1]=0.0f;
		material_ambient[2]=0.0f;
				
		material_diffuse[0]=1.0f;
		material_diffuse[1]=1.0f;
		material_diffuse[2]=1.0f;
				
		material_specular[0]=1.0f;
		material_specular[1]=1.0f;
		material_specular[2]=1.0f;
		
		material_shininess[0]=128.0f;
	//upto wglMakeCurrent is taken care by GLSurfaceView
		vertexShaderObject=GLES32.glCreateShader(GLES32.GL_VERTEX_SHADER);
		final String vertexShaderSourceCode = String.format(
						"#version 320 es"+
						"\n"+
						"precision highp float;"+
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
						"uniform float u_isTouched;"+
						"void main(void)"+
						"{"+
						"	if(u_isTouched==1.0)"+
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
							"uniform float u_isTouched;" +
							"out vec4 FragColor;"+
							"void main(void)"+
							"{"+
							"	if(u_isTouched==1.0)"+
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
		laUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_la");
		ldUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ld");
		lsUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ls");
		kaUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ka");
		kdUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_kd");
		ksUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ks");
		materialShininessUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_materialShininess");
		lightPositionUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_lightPosition");
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
		GLES32.glClearColor(0.25f,0.25f,0.25f,1.0f);
		
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
		w=width;
		h=height;
	}
	private void Display()
	{
		GLES32.glClear(GLES32.GL_COLOR_BUFFER_BIT | GLES32.GL_DEPTH_BUFFER_BIT);
		GLES32.glUseProgram(shaderProgramObject);
		float[] translationMatrix=new float[16];
		float[] rotationMatrix=new float[16];
		float[] scaleMatrix=new float[16];

		Matrix.setIdentityM(ModelMatrix,0);
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.setIdentityM(rotationMatrix,0);
		Matrix.setIdentityM(scaleMatrix,0);
		
		Matrix.translateM(translationMatrix,0,0.0f, 0.0f, -1.5f);
		Matrix.multiplyMM(ModelMatrix,0,ModelMatrix,0,translationMatrix,0);
		//Matrix.multiplyMM(ModelMatrix,0,ModelMatrix,0,scaleMatrix,0);
		//Matrix.multiplyMM(ModelMatrix,0,ModelMatrix,0,rotationMatrix,0);
		material_ambient[0]=0.0215f;
		material_ambient[1]=0.1745f;
		material_ambient[2]=0.0215f;
		
		material_diffuse[0]=0.7568f;
		material_diffuse[1]=0.61424f;
		material_diffuse[2]=0.07568f;
		
		material_specular[0]=0.633f;
		material_specular[1]=0.727811f;
		material_specular[2]=0.633f;
		
		material_shininess[0]=0.6f*128.0f;
		if (isLighting == true)
		{
			GLES32.glUniform1f(isTouchedUniform, 1.0f);
			GLES32.glUniform3fv(laUniform,1,light_ambient,0);
			GLES32.glUniform3fv(ldUniform,1,light_diffuse,0);
			GLES32.glUniform3fv(lsUniform,1,light_specular,0);
			GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
			GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
			GLES32.glUniform3fv(ksUniform,1,material_specular,0);
			GLES32.glUniform1fv(materialShininessUniform,1,material_shininess,0);
			if (keyPress == 1 || keyPress==0)
			{
				//rotationMatrix = rotate(angleOfXRotation, 1.0f, 0.0f, 0.0f);
				light_position[0] = 0.0f;
				light_position[1] = 100.0f*(float)Math.sin(angleOfYRotation);
				light_position[2] = 100.0f*(float)Math.cos(angleOfYRotation);
				light_position[3] = 1.0f;
			}
			else if (keyPress == 2)
			{
				//rotationMatrix=rotate(angleOfYRotation, 0.0f, 1.0f, 0.0f);
				light_position[0] = 100.0f*(float)Math.sin(angleOfYRotation);
				light_position[1] = 0.0f;
				light_position[2] = 100.0f*(float)Math.cos(angleOfYRotation);
				light_position[3] = 1.0f;
			}
			else if (keyPress == 3)
			{
				//rotationMatrix = rotate(angleOfZRotation, 0.0f, 0.0f, 1.0f);
				light_position[0] = 100.0f*(float)Math.sin(angleOfYRotation);
				light_position[1] = 100.0f*(float)Math.cos(angleOfYRotation);
				light_position[2] = 0.0f;
				light_position[3] = 1.0f;
			}
			GLES32.glUniform4fv(lightPositionUniform,1, light_position,0);
		}
		else
		{
			GLES32.glUniform1f(isTouchedUniform, 0.0f);
		}
		GLES32.glViewport(0, 850,w/6, h/6);
		GLES32.glUniformMatrix4fv(mUniform,1,false,ModelMatrix,0);
		GLES32.glUniformMatrix4fv(vUniform,1,false,ViewMatrix,0);
		GLES32.glUniformMatrix4fv(pUniform,1,false,ProjectionMatrix,0);
		
		//for diffuse light on sphere
		//1st sphere on 1st row Emerald
        GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//2nd sphere on 1st row jade
		material_ambient[0]=0.135f;
		material_ambient[1]=0.2225f;
		material_ambient[2]=0.1575f;
		
		material_diffuse[0]=0.54f;
		material_diffuse[1]=0.89f;
		material_diffuse[2]=0.63f;
		
		material_specular[0]=0.316228f;
		material_specular[1]=0.316228f;
		material_specular[2]=0.316228f;
		
		material_shininess[0]=0.1f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(370, 850,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//3rd sphere on 1st row obsidien
		material_ambient[0]=0.05375f;
		material_ambient[1]=0.05f;
		material_ambient[2]=0.06625f;
		
		material_diffuse[0]=0.18275f;
		material_diffuse[1]=0.17f;
		material_diffuse[2]=0.22525f;
		
		material_specular[0]=0.332741f;
		material_specular[1]=0.328634f;
		material_specular[2]=0.346435f;
		
		material_shininess[0]=0.3f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(740, 850,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//4th sphere on 1st row pearl
		material_ambient[0]=0.25f;
		material_ambient[1]=0.20725f;
		material_ambient[2]=0.20725f;
		
		material_diffuse[0]=1.0f;
		material_diffuse[1]=0.829f;
		material_diffuse[2]=0.829f;
		
		material_specular[0]=0.296648f;
		material_specular[1]=0.296648f;
		material_specular[2]=0.296648f;
		
		material_shininess[0]=0.088f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1110, 850,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//5th sphere on 1st row ruby
		material_ambient[0]=0.1745f;
		material_ambient[1]=0.01175f;
		material_ambient[2]=0.01175f;
		
		material_diffuse[0]=0.61424f;
		material_diffuse[1]=0.04136f;
		material_diffuse[2]=0.04136f;
		
		material_specular[0]=0.727811f;
		material_specular[1]=0.626959f;
		material_specular[2]=0.626959f;
		
		material_shininess[0]=0.6f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1480, 850,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//6th sphere on 1st row turquoise
		material_ambient[0]=0.1f;
		material_ambient[1]=0.18725f;
		material_ambient[2]=0.1745f;
		
		material_diffuse[0]=0.396f;
		material_diffuse[1]=0.74151f;
		material_diffuse[2]=0.69102f;
		
		material_specular[0]=0.297254f;
		material_specular[1]=0.30829f;
		material_specular[2]=0.306678f;
		
		material_shininess[0]=0.1f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1850, 850,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//////////////////////////// 2nd row ////////////////////////
		//1st sphere on 2nd row brass
		material_ambient[0]=0.329412f;
		material_ambient[1]=0.223529f;
		material_ambient[2]=0.027451f;
		
		material_diffuse[0]=0.780392f;
		material_diffuse[1]=0.568627f;
		material_diffuse[2]=0.113725f;
		
		material_specular[0]=0.992157f;
		material_specular[1]=0.941176f;
		material_specular[2]=0.807843f;
		
		material_shininess[0]=0.21794872f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
        GLES32.glViewport(0, 600,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//2nd sphere on 2nd row bronze
		material_ambient[0]=0.2125f;
		material_ambient[1]=0.1275f;
		material_ambient[2]=0.054f;
		
		material_diffuse[0]=0.714f;
		material_diffuse[1]=0.4284f;
		material_diffuse[2]=0.18144f;
		
		material_specular[0]=0.393548f;
		material_specular[1]=0.271906f;
		material_specular[2]=0.166721f;
		
		material_shininess[0]=0.3f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(370, 600,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//3rd sphere on 2nd row chrome
		material_ambient[0]=0.25f;
		material_ambient[1]=0.25f;
		material_ambient[2]=0.25f;
		
		material_diffuse[0]=0.4f;
		material_diffuse[1]=0.4f;
		material_diffuse[2]=0.4f;
		
		material_specular[0]=0.774597f;
		material_specular[1]=0.774597f;
		material_specular[2]=0.774597f;
		
		material_shininess[0]=0.6f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(740, 600,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//4th sphere on 2nd row copper
		material_ambient[0]=0.19125f;
		material_ambient[1]=0.0735f;
		material_ambient[2]=0.0225f;
		
		material_diffuse[0]=0.7038f;
		material_diffuse[1]=0.27048f;
		material_diffuse[2]=0.0828f;
		
		material_specular[0]=0.256777f;
		material_specular[1]=0.137622f;
		material_specular[2]=0.086014f;
		
		material_shininess[0]=0.1f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1110, 600,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//5th sphere on 2nd row gold
		material_ambient[0]=0.24725f;
		material_ambient[1]=0.1995f;
		material_ambient[2]=0.0745f;
		
		material_diffuse[0]=0.75164f;
		material_diffuse[1]=0.60648f;
		material_diffuse[2]=0.22648f;
		
		material_specular[0]=0.628281f;
		material_specular[1]=0.555802f;
		material_specular[2]=0.366065f;
		
		material_shininess[0]=0.4f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1480, 600,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//6th sphere on 2nd row silver
		material_ambient[0]=0.19225f;
		material_ambient[1]=0.19225f;
		material_ambient[2]=0.19225f;
		
		material_diffuse[0]=0.50754f;
		material_diffuse[1]=0.50754f;
		material_diffuse[2]=0.50754f;
		
		material_specular[0]=0.508273f;
		material_specular[1]=0.508273f;
		material_specular[2]=0.508273f;
		
		material_shininess[0]=0.4f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1850, 600,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//////////////////////////// 3rd row ////////////////////////
		//1st sphere on 3rd row black plastic
		material_ambient[0]=0.0f;
		material_ambient[1]=0.0f;
		material_ambient[2]=0.0f;
		
		material_diffuse[0]=0.01f;
		material_diffuse[1]=0.01f;
		material_diffuse[2]=0.01f;
		
		material_specular[0]=0.5f;
		material_specular[1]=0.5f;
		material_specular[2]=0.5f;
		
		material_shininess[0]=0.25f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
        GLES32.glViewport(0, 350,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//2nd sphere on 3rd row cyan plastic
		material_ambient[0]=0.0f;
		material_ambient[1]=0.1f;
		material_ambient[2]=0.06f;
		
		material_diffuse[0]=0.0f;
		material_diffuse[1]=0.50980392f;
		material_diffuse[2]=0.50980392f;
		
		material_specular[0]=0.50196078f;
		material_specular[1]=0.50196078f;
		material_specular[2]=0.50196078f;
		
		material_shininess[0]=0.25f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(370, 350,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//3rd sphere on 3rd row green plastic
		material_ambient[0]=0.0f;
		material_ambient[1]=0.0f;
		material_ambient[2]=0.0f;
		
		material_diffuse[0]=0.1f;
		material_diffuse[1]=0.35f;
		material_diffuse[2]=0.1f;
		
		material_specular[0]=0.45f;
		material_specular[1]=0.55f;
		material_specular[2]=0.45f;
		
		material_shininess[0]=0.25f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(740, 350,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//4th sphere on 3rd row red plastic
		material_ambient[0]=0.0f;
		material_ambient[1]=0.0f;
		material_ambient[2]=0.0f;
		
		material_diffuse[0]=0.5f;
		material_diffuse[1]=0.0f;
		material_diffuse[2]=0.0f;
		
		material_specular[0]=0.7f;
		material_specular[1]=0.6f;
		material_specular[2]=0.6f;
		
		material_shininess[0]=0.25f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1110, 350,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//5th sphere on 3rd row white plastic
		material_ambient[0]=0.0f;
		material_ambient[1]=0.0f;
		material_ambient[2]=0.0f;
		
		material_diffuse[0]=0.55f;
		material_diffuse[1]=0.55f;
		material_diffuse[2]=0.55f;
		
		material_specular[0]=0.7f;
		material_specular[1]=0.7f;
		material_specular[2]=0.7f;
		
		material_shininess[0]=0.25f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1480, 350,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//6th sphere on 3rd row yellow plastic
		material_ambient[0]=0.0f;
		material_ambient[1]=0.0f;
		material_ambient[2]=0.0f;
		
		material_diffuse[0]=0.5f;
		material_diffuse[1]=0.5f;
		material_diffuse[2]=0.0f;
		
		material_specular[0]=0.6f;
		material_specular[1]=0.6f;
		material_specular[2]=0.5f;
		
		material_shininess[0]=0.25f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1850, 350,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//////////////////////////// 4th row ////////////////////////
		//1st sphere on 4th row black rubber
		material_ambient[0]=0.02f;
		material_ambient[1]=0.02f;
		material_ambient[2]=0.02f;
		
		material_diffuse[0]=0.01f;
		material_diffuse[1]=0.01f;
		material_diffuse[2]=0.01f;
		
		material_specular[0]=0.4f;
		material_specular[1]=0.4f;
		material_specular[2]=0.4f;
		
		material_shininess[0]=0.078125f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
        GLES32.glViewport(0, 100,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//2nd sphere on 4th row cyan rubber
		material_ambient[0]=0.0f;
		material_ambient[1]=0.05f;
		material_ambient[2]=0.05f;
		
		material_diffuse[0]=0.4f;
		material_diffuse[1]=0.5f;
		material_diffuse[2]=0.5f;
		
		material_specular[0]=0.04f;
		material_specular[1]=0.7f;
		material_specular[2]=0.7f;
		
		material_shininess[0]=0.078125f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(370, 100,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//3rd sphere on 4th row green rubber
		material_ambient[0]=0.0f;
		material_ambient[1]=0.05f;
		material_ambient[2]=0.0f;
		
		material_diffuse[0]=0.4f;
		material_diffuse[1]=0.5f;
		material_diffuse[2]=0.4f;
		
		material_specular[0]=0.04f;
		material_specular[1]=0.7f;
		material_specular[2]=0.04f;
		
		material_shininess[0]=0.078125f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(740, 100,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//4th sphere on 4th row red rubber
		material_ambient[0]=0.05f;
		material_ambient[1]=0.0f;
		material_ambient[2]=0.0f;
		
		material_diffuse[0]=0.5f;
		material_diffuse[1]=0.4f;
		material_diffuse[2]=0.4f;
		
		material_specular[0]=0.7f;
		material_specular[1]=0.04f;
		material_specular[2]=0.04f;
		
		material_shininess[0]=0.078125f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1110, 100,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//5th sphere on 4th row white rubber
		material_ambient[0]=0.05f;
		material_ambient[1]=0.05f;
		material_ambient[2]=0.05f;
		
		material_diffuse[0]=0.5f;
		material_diffuse[1]=0.5f;
		material_diffuse[2]=0.5f;
		
		material_specular[0]=0.7f;
		material_specular[1]=0.7f;
		material_specular[2]=0.7f;
		
		material_shininess[0]=0.078125f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1480, 100,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		//6th sphere on 4th row yellow rubber
		material_ambient[0]=0.05f;
		material_ambient[1]=0.05f;
		material_ambient[2]=0.0f;
		
		material_diffuse[0]=0.5f;
		material_diffuse[1]=0.5f;
		material_diffuse[2]=0.4f;
		
		material_specular[0]=0.7f;
		material_specular[1]=0.7f;
		material_specular[2]=0.04f;
		
		material_shininess[0]=0.078125f*128.0f;
		GLES32.glUniform3fv(kaUniform,1,material_ambient,0);
		GLES32.glUniform3fv(kdUniform,1,material_diffuse,0);
		GLES32.glUniform3fv(ksUniform,1,material_specular,0);
		GLES32.glViewport(1850, 100,w/6, h/6);
		GLES32.glBindVertexArray(vao_sphere[0]);
        GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element[0]);
        GLES32.glDrawElements(GLES32.GL_TRIANGLES, numElements, GLES32.GL_UNSIGNED_SHORT, 0); 
        GLES32.glBindVertexArray(0);
		
		
		//unuse program
		GLES32.glUseProgram(0);
		requestRender();
		
		update();
	}
	private void update()
	{
		if (angleOfYRotation >= 360.0f)
		angleOfYRotation = 0.0f;
	else
		angleOfYRotation += 0.1f;
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

