package com.astromedicomp.roboticarm;

//Added by me


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
import java.util.*;

public class GLESView extends GLSurfaceView implements GLSurfaceView.Renderer,OnGestureListener,OnDoubleTapListener{
	
	private static Context context;
	private GestureDetector gestureDetector;
	private int gVertexShaderObject;
	private int gFragmentShaderObject;
	private int shaderProgramObject;
	Stack<float[]> stack=new Stack<float[]>();
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
	private int shoulder = 0, elbow = 0;
	private int mvpUniform;
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
		
		shoulder = (shoulder + 10) % 360;
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
		
		elbow=(elbow+3)%360;
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
		sphere.getSphereVertexData(sphere_vertices,sphere_normals,sphere_textures,sphere_elements);
		numVertices=sphere.getNumberOfSphereVertices();
		numElements=sphere.getNumberOfSphereElements();
		
		
		
		gVertexShaderObject = GLES32.glCreateShader(GLES32.GL_VERTEX_SHADER);
		final String vertexShaderSourceCode=
		String.format
		(
			"#version 320 es"+
			"\n"+
			"in vec4 vPosition;"+
			"in vec4 vColor;"+
			"uniform mat4 u_mvp_matrix;"+
			"out vec4 out_color;"+
			"void main(void)"+
			"{"+
			"gl_Position=u_mvp_matrix * vPosition;"+
			"out_color=vColor;"+
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
			"in vec4 out_color;"+
			"out vec4 FragColor;"+
			"void main(void)"+
			"{"+
			"FragColor=vec4(0.5, 0.35, 0.05,1.0);"+
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
		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_COLOR,"vColor");
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

		mvpUniform=GLES32.glGetUniformLocation(shaderProgramObject,"u_mvp_matrix");

		
		
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
	
		GLES32.glClear(GLES32.GL_COLOR_BUFFER_BIT|GLES32.GL_DEPTH_BUFFER_BIT);
		GLES32.glUseProgram(shaderProgramObject);
		float[] modelViewProjectionMatrix=new float[16];
		float[] modelViewMatrix=new float[16];
		float[]translationMatrix=new float[32];
		float[]rotationMatrix=new float[32];
		float[]scaleMatrix=new float[32];
		
		//triangle
		Matrix.setIdentityM(modelViewMatrix,0);
		Matrix.setIdentityM(modelViewProjectionMatrix,0);
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.setIdentityM(rotationMatrix,0);
		Matrix.setIdentityM(scaleMatrix,0);



		Matrix.translateM(translationMatrix,0,0.0f, 0.0f, -12.0f);
	
		
		Matrix.multiplyMM(modelViewMatrix,0,translationMatrix,0,modelViewMatrix,0);
		stack.push(modelViewMatrix.clone());
		
		Matrix.setRotateM(rotationMatrix,0,shoulder,0.0f, 0.0f, 1.0f);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.translateM(translationMatrix,0,1.0f, 0.0f, 0.0f);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);

		stack.push(modelViewMatrix.clone());

		Matrix.scaleM(scaleMatrix,0,2.0f, 0.5f, 1.0f);
        Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,scaleMatrix,0);

		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		
		GLES32.glBindVertexArray(vao_sphere[0]);
		GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER,vbo_sphere_element[0]);
		GLES32.glDrawElements(GLES32.GL_TRIANGLES,(int)numElements,GLES32.GL_UNSIGNED_SHORT,0);
		GLES32.glBindVertexArray(0);
		modelViewMatrix=stack.pop();
		
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.translateM(translationMatrix,0,1.0f, 0.0f, 0.0f);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		
		
		Matrix.setIdentityM(rotationMatrix,0);
		Matrix.rotateM(rotationMatrix,0,(float)elbow, 0.0f, 0.0f, 1.0f);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.translateM(translationMatrix,0,1.0f, 0.0f, 0.0f);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		
		stack.push(modelViewMatrix.clone());
		
		Matrix.setIdentityM(scaleMatrix,0);
		Matrix.scaleM(scaleMatrix,0,2.0f, 0.5f, 1.0f);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,scaleMatrix,0);
		
		
		Matrix.setIdentityM(modelViewProjectionMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		GLES32.glBindVertexArray(vao_sphere[0]);
		GLES32.glBindBuffer(GLES32.GL_ELEMENT_ARRAY_BUFFER,vbo_sphere_element[0]);
		GLES32.glDrawElements(GLES32.GL_TRIANGLES,(int)numElements,GLES32.GL_UNSIGNED_SHORT,0);
		GLES32.glBindVertexArray(0);
		
		stack.pop();
		stack.pop();
		
		
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
