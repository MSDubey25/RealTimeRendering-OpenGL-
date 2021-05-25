package com.astromedicomp.interleaved;

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
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.opengl.GLUtils;

public class GLESView extends GLSurfaceView implements GLSurfaceView.Renderer,OnGestureListener,OnDoubleTapListener
{
	private final Context context;
	private GestureDetector gestureDetector;

	//seven new variables
	private int vertexShaderObject;
	private int num=2000;
	private int fragmentShaderObject;
	private int shaderProgramObject;
		
	private boolean isLighting=false;
	private float[] ModelMatrix=new float[16];
	private float[] ViewMatrix=new float[16];
	private float[] ProjectionMatrix=new float[16];

	private int[] vao_cube = new int[1];
    private int[] vbo_cube_position = new int[1];
    private int[] vbo_cube_normal = new int[1];
	private float angle_cube=0.0F;
	
	private float[] light_position=new float[4];
	
	private int samplerUniform;
	private int[] texture_marble=new int[1];
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
	private int isLKeyPressedUniform;
	private int materialShininessUniform;
    
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
				"\n" +
				"precision highp float;"+
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
		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_COLOR,"vColor");
		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_TEXCOORD0,"vTexCoord");
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
		lightPositionUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_lightPosition");
		kaUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ka");
		kdUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_kd");
		ksUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_ks");
		materialShininessUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_materialShininess");
		isLKeyPressedUniform = GLES32.glGetUniformLocation(shaderProgramObject, "u_LkeyIsPressed");
		samplerUniform=GLES32.glGetUniformLocation(shaderProgramObject,"u_sampler");
		
		float VCNT[] = new float[]{ 
		-1.0f, 1.0f, -1.0f,1.0f,0.0f,0.0f,0.0f, 1.0f, 0.0f,0.0f,1.0f,
		-1.0f, 1.0f,  1.0f,1.0f,0.0f,0.0f,0.0f, 1.0f, 0.0f,0.0f,0.0f,
		 1.0f, 1.0f,  1.0f,1.0f,0.0f,0.0f,0.0f, 1.0f, 0.0f,1.0f,0.0f,
		 1.0f, 1.0f, -1.0f,1.0f,0.0f,0.0f,0.0f, 1.0f, 0.0f,1.0f,1.0f,
		-1.0f,-1.0f, -1.0f,0.0f,0.0f,1.0f,0.0f,-1.0f, 0.0f,1.0f,1.0f,
		-1.0f, -1.0f, 1.0f,0.0f,0.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,1.0f,
		 1.0f, -1.0f, 1.0f,0.0f,0.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,0.0f,
		 1.0f, -1.0f,-1.0f,0.0f,0.0f,1.0f,0.0f,-1.0f, 0.0f,1.0f,0.0f,
		 1.0f, 1.0f,  1.0f,0.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f,0.0f,0.0f,
		-1.0f, 1.0f,  1.0f,0.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f,1.0f,0.0f,
		-1.0f, -1.0f, 1.0f,0.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f,1.0f,1.0f,
		 1.0f, -1.0f, 1.0f,0.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f,0.0f,1.0f,
		-1.0f, 1.0f, -1.0f,0.0f,1.0f,1.0f,0.0f, 0.0f,-1.0f,1.0f,0.0f,
		 1.0f, 1.0f, -1.0f,0.0f,1.0f,1.0f,0.0f, 0.0f,-1.0f,1.0f,1.0f,
		 1.0f, -1.0f,-1.0f,0.0f,1.0f,1.0f,0.0f, 0.0f,-1.0f,0.0f,1.0f,
		-1.0f, -1.0f,-1.0f,0.0f,1.0f,1.0f,0.0f, 0.0f,-1.0f,0.0f,0.0f,
		 1.0f, 1.0f, -1.0f,1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f,1.0f,0.0f,
		 1.0f, 1.0f,  1.0f,1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f,1.0f,1.0f,
		 1.0f, -1.0f, 1.0f,1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f,0.0f,1.0f,
		 1.0f, -1.0f,-1.0f,1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f,0.0f,0.0f,
		-1.0f, 1.0f,  1.0f,1.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,0.0f,0.0f,
		-1.0f, 1.0f, -1.0f,1.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,1.0f,0.0f,
		-1.0f, -1.0f,-1.0f,1.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,1.0f,1.0f,
		-1.0f, -1.0f, 1.0f,1.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,0.0f,1.0f
	};
        // vao
        GLES32.glGenVertexArrays(1,vao_cube,0);
        GLES32.glBindVertexArray(vao_cube[0]);
        
        // position vbo
        GLES32.glGenBuffers(1,vbo_cube_position,0);
        GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_cube_position[0]);
        
        ByteBuffer byteBuffer=ByteBuffer.allocateDirect(VCNT.length * 4);
        byteBuffer.order(ByteOrder.nativeOrder());
        FloatBuffer verticesBuffer=byteBuffer.asFloatBuffer();
        verticesBuffer.put(VCNT);
        verticesBuffer.position(0);
        
        GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,
                            VCNT.length * 4,
                            verticesBuffer,
                            GLES32.GL_STATIC_DRAW);
        
        GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,
                                     3,
                                     GLES32.GL_FLOAT,
                                     false,11*4,0*4);
        
        GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_COLOR,
                                     3,
                                     GLES32.GL_FLOAT,
                                     false,11*4,3*4);
        
        GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_COLOR);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_NORMAL,
                                     3,
                                     GLES32.GL_FLOAT,
                                     false,11*4,6*4);
        
        GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_NORMAL);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_TEXCOORD0,
                                     2,
                                     GLES32.GL_FLOAT,
                                     false,11*4,9*4);
        
        GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_TEXCOORD0);
        
        GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);
        
       
		
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
		texture_marble[0]=LoadTexture(R.raw.marble);
	}
	private int LoadTexture(int imageResourceId)
	{
		int[] texture=new int[1];
		BitmapFactory.Options options=new BitmapFactory.Options();
		options.inScaled=false;
		Bitmap bitmap=BitmapFactory.decodeResource(context.getResources(),imageResourceId,options);

		GLES32.glGenTextures(1, texture,0);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D, texture[0]);
		GLES32.glTexParameteri(GLES32.GL_TEXTURE_2D, GLES32.GL_TEXTURE_MIN_FILTER, GLES32.GL_LINEAR);
		GLES32.glTexParameteri(GLES32.GL_TEXTURE_2D, GLES32.GL_TEXTURE_MIN_FILTER, GLES32.GL_LINEAR_MIPMAP_LINEAR);
		GLUtils.texImage2D(GLES32.GL_TEXTURE_2D, 0,bitmap,0);
		GLES32.glGenerateMipmap(GLES32.GL_TEXTURE_2D);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D,0);

		return texture[0];
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
		
		Matrix.translateM(translationMatrix,0,0.0f, 0.0f, -6.0f);
		Matrix.rotateM(rotationMatrix,0,angle_cube,1.0F,1.0F,1.0F);
		Matrix.multiplyMM(ModelMatrix,0,ModelMatrix,0,translationMatrix,0);
		Matrix.multiplyMM(ModelMatrix,0,ModelMatrix,0,rotationMatrix,0);
				
		if (isLighting == true)
		{
		GLES32.glUniform1f(isLKeyPressedUniform,1.0f);
		GLES32.glUniform3f(laUniform,0.25f,0.25f,0.25f);
		GLES32.glUniform3f(ldUniform,1.0f,1.0f,1.0f);
		GLES32.glUniform3f(lsUniform,1.0f,1.0f,1.0f);
		GLES32.glUniform3f(kaUniform,0.5f,0.5f,0.5f);
		GLES32.glUniform3f(kdUniform,1.0f,1.0f,1.0f);
		GLES32.glUniform3f(ksUniform,1.0f,1.0f,1.0f);
		GLES32.glUniform1f(materialShininessUniform,128.0f);
		light_position[0]=-2.0f;
		light_position[1]=0.0f;
		light_position[2]=0.0f;
		light_position[3]=1.0f;
		GLES32.glUniform4fv(lightPositionUniform,1,light_position,0);
		}
		else
		{
			GLES32.glUniform1f(isLKeyPressedUniform, 0.0f);
		}
		GLES32.glUniformMatrix4fv(mUniform,1,false,ModelMatrix,0);
		GLES32.glUniformMatrix4fv(vUniform,1,false,ViewMatrix,0);
		GLES32.glUniformMatrix4fv(pUniform,1,false,ProjectionMatrix,0);
		
		//for diffuse light on cube
		// bind vao
		GLES32.glActiveTexture(GLES32.GL_TEXTURE0);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D,texture_marble[0]);
		GLES32.glUniform1i(samplerUniform,0);
        GLES32.glBindVertexArray(vao_cube[0]);
        GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 0, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 4, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 8, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 12, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 16, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 20, 4);
        // unbind vao
        GLES32.glBindVertexArray(0);
		
		//unuse program
		GLES32.glUseProgram(0);
		requestRender();
		
		update();
	}
	private void update()
	{
		angle_cube+=0.5F;
		if(angle_cube>360.0F)
			angle_cube=0.0F;
	}
	private void uninitialize()
	{
		// destroy vao
        if(vao_cube[0] != 0)
        {
            GLES32.glDeleteVertexArrays(1, vao_cube, 0);
            vao_cube[0]=0;
        }
        
        // destroy position vbo
        if(vbo_cube_position[0] != 0)
        {
            GLES32.glDeleteBuffers(1, vbo_cube_position, 0);
            vbo_cube_position[0]=0;
        }
        
        // destroy normal vbo
        if(vbo_cube_normal[0] != 0)
        {
            GLES32.glDeleteBuffers(1, vbo_cube_normal, 0);
            vbo_cube_normal[0]=0;
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

