package com.astromedicomp.graphwithshapes;

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

public class GLESView extends GLSurfaceView implements GLSurfaceView.Renderer,OnGestureListener,OnDoubleTapListener
{
	private final Context context;
	private GestureDetector gestureDetector;

	//seven new variables
	private int vertexShaderObject;
	private int num=1000;
	private int fragmentShaderObject;
	private int shaderProgramObject;
	private ByteBuffer byteBuffer;
	private ByteBuffer byteBufferC;
	private FloatBuffer positionBuffer;
	private FloatBuffer colorBuffer;
	private int[] vao_triangle=new int[1];
	private int[] vbo_position_triangle=new int[1];
	private int[] vbo_color_triangle=new int[1];
	
	private float angle_traingle=0.0F;
	private float angle_rectangle=0.0F;

	private int mvpUniform;
	private int thicknessUniform;
	private float[] perspectiveProjectionMatrix=new float[16];

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
															"in vec4 vPosition;"+
															"in vec4 vColor;"+
															"out vec4 out_vColor;"+
															"uniform mat4 u_mvp_matrix;"+
															"uniform float thickness;"+
															"void main(void)"+
															"{"+
															"gl_PointSize=thickness;"+
															"gl_Position=u_mvp_matrix * vPosition;"+
															"out_vColor=vColor;"+
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
															"in vec4 out_vColor;"+
															"out vec4 FragColor;"+
															"void main(void)"+
															"{"+
															"FragColor=out_vColor;"+
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
		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_COLOR,"vColor");
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
		mvpUniform=GLES32.glGetUniformLocation(shaderProgramObject,"u_mvp_matrix");
		//triangle vertices
		final float[] traingleVertices=new float[]
										{-1.0f, 0.0f, 0.0f ,
										1.0f, 0.0f, 0.0f,
										0.0f, -1.0f, 0.0f,
										0.0f, 1.0f, 0.0f};
		final float[] traingleColor=new float[]
										{0.0f, 1.0f, 0.0f ,
										0.0f, 1.0f, 0.0f,
										0.0f, 0.0f, 1.0f,
										0.0f, 0.0f, 1.0f};
		
		//create vao triangle
		GLES32.glGenVertexArrays(1,vao_triangle,0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		GLES32.glGenBuffers(1,vbo_position_triangle,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_triangle[0]);

		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		byteBuffer=ByteBuffer.allocateDirect((2000)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBuffer.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		positionBuffer=byteBuffer.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		positionBuffer.put(traingleVertices);
		//step5:set the array at 0th position of the buffer
		positionBuffer.position(0);
		//System.out.println("RTR:positionBuffer is ---->"+positionBuffer);
		
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,(2000)*4,
							null,GLES32.GL_DYNAMIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);

		//for traingle color
		GLES32.glGenBuffers(1,vbo_color_triangle,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_triangle[0]);
		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		byteBufferC=ByteBuffer.allocateDirect((2000)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBufferC.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		colorBuffer=byteBufferC.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		colorBuffer.put(traingleColor);
		//step5:set the array at 0th position of the buffer
		colorBuffer.position(0);
				
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,(2000)*4,
							null,GLES32.GL_DYNAMIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_COLOR,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_COLOR);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);

		GLES32.glBindVertexArray(0);
		//////////////////////////////////////////////////////////////////////////////////////////////////
		
		//depth mandate lines
		GLES32.glEnable(GLES32.GL_DEPTH_TEST);
		GLES32.glDepthFunc(GLES32.GL_LEQUAL);
		
		Matrix.setIdentityM(perspectiveProjectionMatrix,0);
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
		Matrix.perspectiveM(perspectiveProjectionMatrix,0,45.0f,
		width / height,
		0.1f,
		100.0f);
	}
	private void Display()
	{
		final float[] linesCoordinates=new float[]
										{-1.0f, 0.0f, 0.0f ,
										1.0f, 0.0f, 0.0f,
										0.0f, -1.0f, 0.0f,
										0.0f, 1.0f, 0.0f};
		final float[] colorCoordinates=new float[]
										{0.0f, 1.0f, 0.0f ,
										0.0f, 1.0f, 0.0f,
										0.0f, 0.0f, 1.0f,
										0.0f, 0.0f, 1.0f};
				
		GLES32.glClear(GLES32.GL_COLOR_BUFFER_BIT | GLES32.GL_DEPTH_BUFFER_BIT);
		GLES32.glUseProgram(shaderProgramObject);
		float[] modelViewProjectionMatrix=new float[16];
		float[] translationMatrix=new float[16];
		float[] rotationMatrix=new float[16];
		float[] modelViewMatrix=new float[16];

		Matrix.setIdentityM(modelViewProjectionMatrix,0);
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.setIdentityM(rotationMatrix,0);
		Matrix.setIdentityM(modelViewMatrix,0);

		Matrix.translateM(translationMatrix,0,0.0F,0.0F,-2.5F);
		//Matrix.rotateM(rotationMatrix,0,angle_traingle,0.0F,1.0F,0.0F);

		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		
		positionBuffer.put(linesCoordinates);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (linesCoordinates.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		
		colorBuffer.put(colorCoordinates);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (colorCoordinates.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glLineWidth(2.0f);
		GLES32.glDrawArrays(GLES32.GL_LINES,0,6);

		//unbind vao
		GLES32.glBindVertexArray(0);

		float s = 0.0f;
	for (int i = 0; i < 40; i++)
	{
		if (i == 20)
			s = 0.0f;

		if (i < 20)
		{
			s = s - 1.0f / 20.0f;
			linesCoordinates[0] = -1.0f;
			linesCoordinates[1] = s;
			linesCoordinates[2] = 0.0f;
			linesCoordinates[3] = 1.0f;
			linesCoordinates[4] = s;
			linesCoordinates[5] = 0.0f;
			linesCoordinates[6] = s;
			linesCoordinates[7] = -1.0f;
			linesCoordinates[8] = 0.0f;
			linesCoordinates[9] = s;
			linesCoordinates[10] = 1.0f;
			linesCoordinates[11] = 0.0f;
			positionBuffer.put(linesCoordinates);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (linesCoordinates.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		
		colorBuffer.put(colorCoordinates);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (colorCoordinates.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glLineWidth(1.0f);
		GLES32.glDrawArrays(GLES32.GL_LINES,0,6);

		//unbind vao
		GLES32.glBindVertexArray(0);
		}
		else
		{
			s = s + 1.0f / 20.0f;
			linesCoordinates[0] = -1.0f;
			linesCoordinates[1] = s;
			linesCoordinates[2] = 0.0f;
			linesCoordinates[3] = 1.0f;
			linesCoordinates[4] = s;
			linesCoordinates[5] = 0.0f;
			linesCoordinates[6] = s;
			linesCoordinates[7] = -1.0f;
			linesCoordinates[8] = 0.0f;
			linesCoordinates[9] = s;
			linesCoordinates[10] = 1.0f;
			linesCoordinates[11] = 0.0f;
			positionBuffer.put(linesCoordinates);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (linesCoordinates.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		
		colorBuffer.put(colorCoordinates);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (colorCoordinates.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glLineWidth(1.0f);
		GLES32.glDrawArrays(GLES32.GL_LINES,0,6);

		//unbind vao
		GLES32.glBindVertexArray(0);
		}
	}
	
		//for rectangle
		linesCoordinates[0] = 0.70f;
		linesCoordinates[1] = 0.70f;
		linesCoordinates[2] = 0.0f;
		linesCoordinates[3] = -0.70f;
		linesCoordinates[4] = 0.70f;
		linesCoordinates[5] = 0.0f;
		linesCoordinates[6] = -0.70f;
		linesCoordinates[7] = -0.70f;
		linesCoordinates[8] = 0.0f;
		linesCoordinates[9] = 0.70f;
		linesCoordinates[10] = -0.70f;
		linesCoordinates[11] = 0.0f;
		for (int i = 0; i < 12; i = i + 3)
		{
			colorCoordinates[i + 0] = 1.0f;
			colorCoordinates[i + 1] = 1.0f;
			colorCoordinates[i + 2] = 0.0f;
		}
		positionBuffer.put(linesCoordinates);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (linesCoordinates.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		//GLES32.glVertexAttrib3f(GLESMacros.AMC_ATTRIBUTE_COLOR,1.0f,1.0f,0.0f);
			colorBuffer.put(colorCoordinates);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (colorCoordinates.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glLineWidth(2.0f);
		GLES32.glDrawArrays(GLES32.GL_LINE_LOOP,0,4);

		//unbind vao
		GLES32.glBindVertexArray(0);
		
		//for triangle
		linesCoordinates[0] = 0.0f;
		linesCoordinates[1] = 0.70f;
		linesCoordinates[2] = 0.0f;
		linesCoordinates[3] = -0.70f;
		linesCoordinates[4] = -0.70f;
		linesCoordinates[5] = 0.0f;
		linesCoordinates[6] = 0.70f;
		linesCoordinates[7] = -0.70f;
		linesCoordinates[8] = 0.0f;
		for (int i = 0; i < 9; i = i + 3)
		{
			colorCoordinates[i + 0] = 1.0f;
			colorCoordinates[i + 1] = 1.0f;
			colorCoordinates[i + 2] = 0.0f;
		}
		positionBuffer.put(linesCoordinates);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (linesCoordinates.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		//GLES32.glVertexAttrib3f(GLESMacros.AMC_ATTRIBUTE_COLOR,1.0f,1.0f,0.0f);
			colorBuffer.put(colorCoordinates);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (colorCoordinates.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glLineWidth(2.0f);
		GLES32.glDrawArrays(GLES32.GL_LINE_LOOP,0,3);

		//unbind vao
		GLES32.glBindVertexArray(0);
		
		//for circle
		float linesCoordinates1[]=new float[2000];
		float colorCoordinates1[]=new float[2000];
	for (int i = 0; i < 2000; i++)
	{
		float angle = 2 * i* (float)Math.PI / num;
		if (i % 3 == 0)
		{
			linesCoordinates1[i] = (float)Math.cos(angle);
			colorCoordinates1[i] = 1.0f;
		}
		else if (i % 3 == 1)
		{
			linesCoordinates1[i] = (float)Math.sin(angle);
			colorCoordinates1[i] = 1.0f;
		}
		else
		{
			linesCoordinates1[i] = 0.0f;
			colorCoordinates1[i] = 0.0f;
		}
	}
		GLES32.glUniform1f(thicknessUniform,3.0f);
		positionBuffer.put(linesCoordinates1);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (linesCoordinates1.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		//GLES32.glVertexAttrib3f(GLESMacros.AMC_ATTRIBUTE_COLOR,1.0f,1.0f,0.0f);
			colorBuffer.put(colorCoordinates1);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (colorCoordinates1.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		//similarly bind with textures if any

		//draw necessary scene
		//GLES32.glPointSize(2.0f);
		for (int i = 0; i < 1998; i += 2)
		{
			//GLES32.glDrawArrays(GLES32.GL_LINE_LOOP, i, i + 2);
			GLES32.glDrawArrays(GLES32.GL_LINES, i, i + 2);
		}
		//unbind vao
		GLES32.glBindVertexArray(0);
		
		//for incircle
		for (int i = 0; i < 2000; i++)
		{
			float angle = 2 * i* (float)Math.PI / num;
			if (i % 3 == 0)
			{
				linesCoordinates1[i] = (float)Math.cos(angle) / 1.15f;
				colorCoordinates1[i] = 1.0f;
			}
			else if (i % 3 == 1)
			{
				linesCoordinates1[i] = (float)Math.sin(angle) / 1.15f;
				colorCoordinates1[i] = 1.0f;
			}
			else
			{
				linesCoordinates1[i] = 0.0f;
				colorCoordinates1[i] = 0.0f;
			}
		}
		
		Matrix.translateM(translationMatrix,0,0.0f,-0.545f,0.0F);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		//Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		GLES32.glUniform1f(thicknessUniform,3.0f);
		positionBuffer.put(linesCoordinates1);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (linesCoordinates1.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		//GLES32.glVertexAttrib3f(GLESMacros.AMC_ATTRIBUTE_COLOR,1.0f,1.0f,0.0f);
			colorBuffer.put(colorCoordinates1);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_triangle[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (colorCoordinates1.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_triangle[0]);
		//similarly bind with textures if any

		//draw necessary scene
		//GLES32.glPointSize(2.0f);
		for (int i = 0; i < 1998; i += 2)
		{
			GLES32.glDrawArrays(GLES32.GL_LINES, i, i + 2);
			//GLES32.glDrawArrays(GLES32.GL_LINE_LOOP, i, i + 2);
		}
		//unbind vao
		GLES32.glBindVertexArray(0);
		
		//unuse program
		GLES32.glUseProgram(0);
		requestRender();
		update();
	}
	private void update()
	{
		angle_traingle+=0.5F;
		if(angle_traingle>360.0F)
			angle_traingle=0.0F;
		angle_rectangle+=0.5F;
		if(angle_rectangle>360.0F)
			angle_rectangle=0.0F;
	}
	private void uninitialize()
	{
		if (vbo_position_triangle[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_position_triangle,0);
			vbo_position_triangle[0] = 0;
		}
		if (vbo_color_triangle[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_color_triangle,0);
			vbo_color_triangle[0] = 0;
		}
		if (vao_triangle[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vao_triangle,0);
			vao_triangle[0] = 0;
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

