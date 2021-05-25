package com.astromedicomp.render2texture;

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
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.opengl.GLUtils;
import android.view.Display;
import android.view.WindowManager;
import android.app.Activity;
import android.graphics.Point;
import java.nio.IntBuffer;


public class GLESView extends GLSurfaceView implements GLSurfaceView.Renderer, OnGestureListener, OnDoubleTapListener {
	
	private static Context context;
	private GestureDetector gestureDetector;
	private int gVertexShaderObject;
	private int gFragmentShaderObject;
	private int shaderProgramObject;

	private int[] vao_cube=new int[1];
	private int[] vbo_cube_position=new int[1];
	private int[] vbo_cube_tex=new int[1];
	private int samplerUniform;

	private int mvpUniform;
	private float[] perspectiveProjectionMatrix = new float[16];
	private int[] texture_marble = new int[1];
	private float angleCube=0.0f;
	private int gWidth=0;
	private int gHeight=0;


	private int[] texture_FBO = new int[1];
	private int[] FBO = new int[1];
	private int[] depthRenderBuffer = new int[1];
	private ByteBuffer byteBuffer;
	private FloatBuffer positionBuffer;
	private FloatBuffer texCoordBuffer;

	private int width=256;
	private int height=256;

	public GLESView(Context drawingContext) {
		super(drawingContext);

		context = drawingContext;
		setEGLContextClientVersion(3);
		setRenderer(this);
		setRenderMode(GLSurfaceView.RENDERMODE_WHEN_DIRTY);

		gestureDetector = new GestureDetector(drawingContext, this, null, false);
		gestureDetector.setOnDoubleTapListener(this);
	}

	@Override
	public boolean onTouchEvent(MotionEvent event) {
		int eventaction = event.getAction();
		if (!gestureDetector.onTouchEvent(event)) {
			super.onTouchEvent(event);
		}
		return (true);
	}

	@Override
	public boolean onDoubleTap(MotionEvent e) {
		return (true);
	}

	@Override
	public boolean onDoubleTapEvent(MotionEvent e) {
		return (true);
	}

	@Override
	public boolean onSingleTapConfirmed(MotionEvent e) {
		return (true);
	}

	@Override
	public boolean onDown(MotionEvent e) {
		return (true);
	}

	@Override
	public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
		return (true);
	}

	@Override
	public void onLongPress(MotionEvent e) {

	}

	@Override
	public boolean onScroll(MotionEvent e1, MotionEvent e2, float distanceX, float distanceY) {
		uninitialize();
		System.exit(0);
		return (true);
	}

	@Override
	public void onShowPress(MotionEvent e) {

	}

	@Override
	public boolean onSingleTapUp(MotionEvent e) {
		return (true);
	}

	@Override
	public void onSurfaceCreated(GL10 gl, EGLConfig config) {
		String Version = gl.glGetString(GL10.GL_VERSION);
		String shaderVersion = gl.glGetString(GLES32.GL_SHADING_LANGUAGE_VERSION);

		System.out.println(Version);
		System.out.println(shaderVersion);

		Initialize();
	}

	@Override
	public void onSurfaceChanged(GL10 unused, int width, int height) {
		resize(width, height);
	}

	@Override
	public void onDrawFrame(GL10 unused) {
		display();
	}

	


	private void Initialize() {

		gVertexShaderObject = GLES32.glCreateShader(GLES32.GL_VERTEX_SHADER);
		final String vertexShaderSourceCode=
		String.format
		(
			"#version 320 es" +
			"\n" +
			"in vec4 vPosition;" +
			"in vec2 vTexCoord;" +
			"uniform mat4 u_mvp_matrix;" +
			"out vec2 out_texcoord;" +
			"void main(void)" +
			"{" +
			"gl_Position=u_mvp_matrix*vPosition;" +
			"out_texcoord=vTexCoord;" +
			"}"
		);

		GLES32.glShaderSource(gVertexShaderObject,vertexShaderSourceCode);
		GLES32.glCompileShader(gVertexShaderObject);

		// Error Checking
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
				System.out.println("RTR:VertexShaderObject"+szInfoLog);
				uninitialize();
				System.exit(0);
			}
		}
		

		gFragmentShaderObject = GLES32.glCreateShader(GLES32.GL_FRAGMENT_SHADER);
		final String fragmentShaderSourceCode=
		String.format
		(
			"#version 320 es" +
			"\n" +
			"precision highp float;"+
			"in vec2 out_texcoord;" +
			"uniform highp sampler2D u_sampler;" +
			"out vec4 FragColor;" +
			"void main(void)" +
			"{" +
			"FragColor=texture(u_sampler,out_texcoord);" +
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
				System.out.println("RTR:FragmentShaderObject"+szInfoLog);
				uninitialize();
				System.exit(0);
			}
		}
		
		shaderProgramObject=GLES32.glCreateProgram();
		GLES32.glAttachShader(shaderProgramObject,gVertexShaderObject);
		GLES32.glAttachShader(shaderProgramObject,gFragmentShaderObject);

		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_POSITION,"vPosition");	
		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_TEXCOORD0,"vTexCoord");
		GLES32.glLinkProgram(shaderProgramObject);
		
		int[] iShaderLinkStatus = new int[1];
		iInfoLogLength[0] = 0;
		szInfoLog = null;

		GLES32.glGetProgramiv(shaderProgramObject, GLES32.GL_LINK_STATUS,iShaderLinkStatus,0);

	if (iShaderLinkStatus[0] == GLES32.GL_FALSE) {
		GLES32.glGetProgramiv(shaderProgramObject, GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);

		if (iInfoLogLength[0] > 0) {
			szInfoLog=GLES32.glGetProgramInfoLog(shaderProgramObject);

			System.out.println("RTR: shaderProgramObject"+szInfoLog);
			uninitialize();
			System.exit(0);	
			
		}
	}

		mvpUniform=GLES32.glGetUniformLocation(shaderProgramObject,"u_mvp_matrix");
		samplerUniform=GLES32.glGetUniformLocation(shaderProgramObject,"u_sampler");

	
	final float[] cubeVertices = new float[]
	{
		1.0f, 1.0f, -1.0f,
		-1.0f, 1.0f, -1.0f,
		-1.0f, 1.0f, 1.0f,
		1.0f, 1.0f, 1.0f,
		1.0f, -1.0f, -1.0f,
		-1.0f, -1.0f, -1.0f,
		-1.0f, -1.0f, 1.0f,
		1.0f, -1.0f, 1.0f,
		1.0f, 1.0f, 1.0f,
		-1.0f, 1.0f, 1.0f,
		-1.0f, -1.0f, 1.0f,
		1.0f, -1.0f, 1.0f,
		1.0f, 1.0f, -1.0f,
		-1.0f, 1.0f, -1.0f,
		-1.0f, -1.0f, -1.0f,
		1.0f, -1.0f, -1.0f,
		1.0f, 1.0f, -1.0f,
		1.0f, 1.0f, 1.0f,
		1.0f, -1.0f, 1.0f,
		1.0f, -1.0f, -1.0f,
		-1.0f, 1.0f, -1.0f,
		-1.0f, 1.0f, 1.0f,
		-1.0f, -1.0f, 1.0f,
		-1.0f, -1.0f, -1.0f
	};	

	final float[] cubeTex = new float[]
	{
		0.0f, 1.0f,
		0.0f, 0.0f,
		1.0f, 0.0f,
		1.0f, 1.0f,
		1.0f, 1.0f,
		0.0f, 1.0f,
		0.0f, 0.0f,
		1.0f, 0.0f,
		0.0f, 0.0f,
		1.0f, 0.0f,
		1.0f, 1.0f,
		0.0f, 1.0f,
		1.0f, 0.0f,
		1.0f, 1.0f,
		0.0f, 1.0f,
		0.0f, 0.0f,
		1.0f, 0.0f,
		1.0f, 1.0f,
		0.0f, 1.0f,
		0.0f, 0.0f,
		0.0f, 0.0f,
		1.0f, 0.0f,
		1.0f, 1.0f,
		0.0f, 1.0f
	};	
	



	
		GLES32.glGenVertexArrays(1,vao_cube,0);
		GLES32.glBindVertexArray(vao_cube[0]);
		
		
		GLES32.glGenBuffers(1,vbo_cube_position,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_cube_position[0]);
		ByteBuffer byteBuffer2=ByteBuffer.allocateDirect(cubeVertices.length*4);
		byteBuffer2.order(ByteOrder.nativeOrder());
		FloatBuffer positionBuffer1=byteBuffer2.asFloatBuffer();
		positionBuffer1.put(cubeVertices);
		positionBuffer1.position(0);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,cubeVertices.length*4,positionBuffer1,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);
		
		GLES32.glGenBuffers(1,vbo_cube_tex,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_cube_tex[0]);
		ByteBuffer byteBuffer3=ByteBuffer.allocateDirect(cubeTex.length*4);
		byteBuffer3.order(ByteOrder.nativeOrder());
		FloatBuffer texBuffer1=byteBuffer3.asFloatBuffer();
		texBuffer1.put(cubeTex);
		texBuffer1.position(0);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,cubeTex.length*4,texBuffer1,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_TEXCOORD0,2,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_TEXCOORD0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);
		GLES32.glBindVertexArray(0);


		texture_marble[0] = LoadTexture(R.raw.marble);

		Display display = ((Activity) context).getWindowManager().getDefaultDisplay();
		Point size = new Point();
	    display.getSize(size);
	    width = size.x;
	    height = size.y;

	
		System.out.println("RTR: Init "+width+" "+height);

	
	
	GLES32.glGenFramebuffers(1, FBO, 0);
	GLES32.glBindFramebuffer(GLES32.GL_FRAMEBUFFER, FBO[0]);
	GLES32.glGenTextures(1, texture_FBO, 0);
	GLES32.glBindTexture(GLES32.GL_TEXTURE_2D, texture_FBO[0]);
	GLES32.glTexImage2D(GLES32.GL_TEXTURE_2D, 0, GLES32.GL_RGBA, width, height, 0, GLES32.GL_RGBA, GLES32.GL_UNSIGNED_BYTE, null);
	GLES32.glTexParameteri(GLES32.GL_TEXTURE_2D, GLES32.GL_TEXTURE_MAG_FILTER, GLES32.GL_LINEAR);
	GLES32.glTexParameteri(GLES32.GL_TEXTURE_2D, GLES32.GL_TEXTURE_MIN_FILTER, GLES32.GL_LINEAR);
	GLES32.glFramebufferTexture2D(GLES32.GL_FRAMEBUFFER, GLES32.GL_COLOR_ATTACHMENT0, GLES32.GL_TEXTURE_2D, texture_FBO[0], 0);
	
	final int[] drawBuffers=new int[]{
			GLES32.GL_COLOR_ATTACHMENT0
	};

	

	byteBuffer=ByteBuffer.allocateDirect(drawBuffers.length*4);
	byteBuffer.order(ByteOrder.nativeOrder());
	IntBuffer drawBuf=byteBuffer.asIntBuffer();
	drawBuf.put(drawBuffers);
	drawBuf.position(0);
	GLES32.glDrawBuffers(1,drawBuf);


	GLES32.glGenRenderbuffers(1, depthRenderBuffer, 0);
	GLES32.glBindRenderbuffer(GLES32.GL_RENDERBUFFER, depthRenderBuffer[0]);
	GLES32.glRenderbufferStorage(GLES32.GL_RENDERBUFFER, GLES32.GL_DEPTH_COMPONENT16, width, height);
	GLES32.glFramebufferRenderbuffer(GLES32.GL_FRAMEBUFFER, GLES32.GL_DEPTH_ATTACHMENT, GLES32.GL_RENDERBUFFER, depthRenderBuffer[0]);
	GLES32.glBindTexture(GLES32.GL_TEXTURE_2D, 0);
	GLES32.glBindRenderbuffer(GLES32.GL_RENDERBUFFER, 0);
	GLES32.glBindFramebuffer(GLES32.GL_FRAMEBUFFER, 0);


	int FBOstatus = GLES32.glCheckFramebufferStatus(GLES32.GL_FRAMEBUFFER);
	System.out.println("RTR: FBO status" + FBOstatus);

	GLES32.glEnable(GLES32.GL_DEPTH_TEST);
	GLES32.glDepthFunc(GLES32.GL_LEQUAL);
	
	GLES32.glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

	GLES32.glEnable(GLES32.GL_TEXTURE_2D);
	Matrix.setIdentityM(perspectiveProjectionMatrix, 0);
	System.out.println("RTR: Init ");


	}


	private void resize(int width, int height) {
		if (height == 0)
			height = 1;
		gWidth=width;
		gHeight=height;
		GLES32.glViewport(0, 0, width, height);
		Matrix.perspectiveM(perspectiveProjectionMatrix, 0, 45.0f, (float) width / (float) height, 0.1f, 100.0f);

	}


	private void display() {
		GLES32.glBindFramebuffer(GLES32.GL_FRAMEBUFFER,FBO[0]);
		GLES32.glViewport(0, 0, width, height);
		GLES32.glEnable(GLES32.GL_DEPTH_TEST);
		GLES32.glDepthFunc(GLES32.GL_LEQUAL);
		GLES32.glClearColor(0.5f, 0.5f, 0.5f, 1.0f);
		GLES32.glClearDepthf(1.0f);

		GLES32.glClear(GLES32.GL_COLOR_BUFFER_BIT | GLES32.GL_DEPTH_BUFFER_BIT);
		GLES32.glUseProgram(shaderProgramObject);

		float[] modelViewMatrix=new float[16];
		float[] modelViewProjectionMatrix=new float[16];
		float[] translationMatrix=new float[16];
		float[] rotationMatrix=new float[16];
		float[] scaleMatrix=new float[16];

		
		Matrix.setIdentityM(modelViewMatrix,0);
		Matrix.setIdentityM(modelViewProjectionMatrix,0);
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.setIdentityM(rotationMatrix,0);
		Matrix.setIdentityM(scaleMatrix,0);


		Matrix.translateM(translationMatrix,0,0.0f, 0.0f, -5.0f);
		Matrix.setRotateM(rotationMatrix,0,angleCube,1.0f, 1.0f, 1.0f);
		Matrix.scaleM(scaleMatrix,0,0.75f,0.75f,0.75f);
		Matrix.multiplyMM(modelViewMatrix,0,translationMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,scaleMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		GLES32.glUniform1i(samplerUniform, 0);
		GLES32.glBindVertexArray(vao_cube[0]);
		GLES32.glActiveTexture(GLES32.GL_TEXTURE0);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D, texture_marble[0]);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,0,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,4,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,8,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,12,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,16,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,20,4);
		GLES32.glBindVertexArray(0);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D, 0);
		GLES32.glBindFramebuffer(GLES32.GL_FRAMEBUFFER,0);
		GLES32.glUseProgram(0);


		GLES32.glViewport(0, 0, gWidth, gHeight);
		GLES32.glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
		GLES32.glClearDepthf(1.0f);
		GLES32.glClear(GLES32.GL_COLOR_BUFFER_BIT | GLES32.GL_DEPTH_BUFFER_BIT);
		GLES32.glUseProgram(shaderProgramObject);
		Matrix.setIdentityM(modelViewMatrix,0);
		Matrix.setIdentityM(modelViewProjectionMatrix,0);
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.setIdentityM(rotationMatrix,0);
		Matrix.setIdentityM(scaleMatrix,0);
		Matrix.translateM(translationMatrix,0,0.0f, 0.0f, -5.0f);
		Matrix.setRotateM(rotationMatrix,0,angleCube,1.0f, 1.0f, 1.0f);
		Matrix.scaleM(scaleMatrix,0,0.75f,0.75f,0.75f);
		Matrix.multiplyMM(modelViewMatrix,0,translationMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,scaleMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		GLES32.glUniform1i(samplerUniform, 0);
		GLES32.glBindVertexArray(vao_cube[0]);
		GLES32.glActiveTexture(GLES32.GL_TEXTURE0);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D, texture_FBO[0]);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,0,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,4,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,8,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,12,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,16,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,20,4);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D, 0);
		GLES32.glBindVertexArray(0);
		GLES32.glUseProgram(0);

		Update();

		requestRender();
		

	}

	void uninitialize() {
		if (vbo_cube_tex[0]!=0) {
			GLES32.glDeleteBuffers(1,vbo_cube_tex,0);
			vbo_cube_tex[0] = 0;
		}
		if (vbo_cube_position[0]!=0) {
			GLES32.glDeleteBuffers(1,vbo_cube_position,0);
			vbo_cube_position[0] = 0;
		}
		
			if (vao_cube[0]!=0) {
			GLES32.glDeleteVertexArrays(1,vao_cube,0);
			vao_cube[0] = 0;
		}

		if (shaderProgramObject != 0) {
			int[] shaderCount = new int[1];

			GLES32.glUseProgram(shaderProgramObject);

			GLES32.glGetProgramiv(shaderProgramObject, GLES32.GL_ATTACHED_SHADERS, shaderCount, 0);

			if (shaderCount[0] != 0) {

				int shaderNumber;
				int[] shaders = new int[shaderCount[0]];

				GLES32.glGetAttachedShaders(shaderProgramObject, shaderCount[0], shaderCount, 0, shaders, 0);

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

	

	private void Update(){
		angleCube = angleCube - 0.2f;
		if (angleCube < -360.0f)
			angleCube = 0.0f;
	}

	private int LoadTexture(int imgFileResourceId) {
		int [] texture=new int[1];
		BitmapFactory.Options options= new BitmapFactory.Options();
		options.inScaled=false;
		Bitmap bitmap=BitmapFactory.decodeResource(context.getResources(),imgFileResourceId,options);
		
		GLES32.glGenTextures(1,texture,0);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D,texture[0]);
		GLES32.glPixelStorei(GLES32.GL_UNPACK_ALIGNMENT,4);
		GLES32.glTexParameteri(GLES32.GL_TEXTURE_2D,GLES32.GL_TEXTURE_MAG_FILTER,GLES32.GL_LINEAR);
		GLES32.glTexParameteri(GLES32.GL_TEXTURE_2D,GLES32.GL_TEXTURE_MIN_FILTER,GLES32.GL_LINEAR_MIPMAP_LINEAR);
		GLUtils.texImage2D(GLES32.GL_TEXTURE_2D,0,bitmap,0);
		GLES32.glGenerateMipmap(GLES32.GL_TEXTURE_2D);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D,0);
		return(texture[0]);
	}

}

