package com.astromedicomp.two3dshapesanimation;

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

public class GLESView extends GLSurfaceView implements GLSurfaceView.Renderer,OnGestureListener,OnDoubleTapListener
{
	private final Context context;
	private GestureDetector gestureDetector;

	//seven new variables
	private int vertexShaderObject;
	private int fragmentShaderObject;
	private int shaderProgramObject;
	
	private int[] vao_pyramid=new int[1];
	private int[] vao_cube=new int[1];
	private int[] vbo_position_pyramid=new int[1];
	private int[] vbo_position_cube=new int[1];
	private int[] vbo_color_pyramid=new int[1];
	private int[] vbo_color_cube=new int[1];
	
	private float angle_pyramid=0.0F;
	private float angle_cube=0.0F;

	private int mvpUniform;
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
															"void main(void)"+
															"{"+
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
		final float[] pyramidVertices=new float[]
										{ 0.0F,1.0F,0.0F,//
										-1.0F,-1.0F,1.0F,
										1.0F,-1.0F,1.0F,
										0.0F,1.0F,0.0F,//
										1.0F,-1.0F,1.0F,
										1.0F,-1.0F,-1.0F,
										0.0F,1.0F,0.0F,//
										1.0F,-1.0F,-1.0F,
										-1.0F,-1.0F,-1.0F,
										0.0F,1.0F,0.0F,//
										-1.0F,-1.0F,-1.0F,
										-1.0F,-1.0F,1.0F
										};
		final float[] pyramidColor=new float[]
										{ 1.0f,0.0f,0.0f,//r
										0.0f,1.0f,0.0f,//g
										0.0f,0.0f,1.0f,//b 
										1.0f,0.0f,0.0f,//r
										0.0f,0.0f,1.0f,//b
										0.0f,1.0f,0.0f,//g
										1.0f,0.0f,0.0f,//r
										0.0f,1.0f,0.0f,//g
										0.0f,0.0f,1.0f,//b
										1.0f,0.0f,0.0f,//r
										0.0f,0.0f,1.0f,//b
										0.0f,1.0f,0.0f//g
										};
		
		final float[] cubeVertices=new float[] 
										{ -1.0f, 1.0f, -1.0f,//top
										-1.0f, 1.0f, 1.0f,
										1.0f, 1.0f, 1.0f,
										1.0f, 1.0f, -1.0f,
										-1.0f, -1.0f, -1.0f,//bottom
										-1.0f, -1.0f, 1.0f,
										1.0f, -1.0f, 1.0f,
										1.0f, -1.0f, -1.0f,
										1.0f, 1.0f, 1.0f,//front
										-1.0f, 1.0f, 1.0f,
										-1.0f, -1.0f, 1.0f,
										1.0f, -1.0f, 1.0f,
										-1.0f, 1.0f, -1.0f,//back
										1.0f, 1.0f, -1.0f,
										1.0f, -1.0f, -1.0f,
										-1.0f, -1.0f, -1.0f,
										1.0f, 1.0f, -1.0f,//right
										1.0f, 1.0f, 1.0f,
										1.0f, -1.0f, 1.0f,
										1.0f, -1.0f, -1.0f,
										-1.0f, 1.0f, 1.0f,//left
										-1.0f, 1.0f, -1.0f,
										-1.0f, -1.0f, -1.0f,
										-1.0f, -1.0f, 1.0f
										};
		final float[] cubeColor=new float[]
										{ 1.0f,0,0.0f,//r
										1.0f,0,0.0f,//r
										1.0f,0,0.0f,//r
										1.0f,0,0.0f,//r
										0.0f,0.0f,1.0f,//b
										0.0f,0.0f,1.0f,//b
										0.0f,0.0f,1.0f,//b
										0.0f,0.0f,1.0f,//b
										0.0f,1.0f,0.0f,//g
										0.0f,1.0f,0.0f,//g
										0.0f,1.0f,0.0f,//g
										0.0f,1.0f,0.0f,//g
										0.0f,1.0f,1.0f,//c
										0.0f,1.0f,1.0f,//c
										0.0f,1.0f,1.0f,//c
										0.0f,1.0f,1.0f,//c
										1.0f,0.0f,1.0f,//m
										1.0f,0.0f,1.0f,//m
										1.0f,0.0f,1.0f,//m
										1.0f,0.0f,1.0f,//m
										1.0f,1.0f,0.0f,//y
										1.0f,1.0f,0.0f,//y
										1.0f,1.0f,0.0f,//y
										1.0f,1.0f,0.0f,//y
										};
		
		//create vao pyramid
		GLES32.glGenVertexArrays(1,vao_pyramid,0);
		GLES32.glBindVertexArray(vao_pyramid[0]);
		GLES32.glGenBuffers(1,vbo_position_pyramid,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_pyramid[0]);

		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		ByteBuffer byteBuffer=ByteBuffer.allocateDirect((pyramidVertices.length)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBuffer.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		FloatBuffer positionBuffer=byteBuffer.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		positionBuffer.put(pyramidVertices);
		//step5:set the array at 0th position of the buffer
		positionBuffer.position(0);
		//System.out.println("RTR:positionBuffer is ---->"+positionBuffer);
		
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,(pyramidVertices.length)*4,
							positionBuffer,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);

		//for pyramidColor color
		GLES32.glGenBuffers(1,vbo_color_pyramid,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_pyramid[0]);
		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		ByteBuffer byteBufferC=ByteBuffer.allocateDirect((pyramidColor.length)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBufferC.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		FloatBuffer colorBuffer=byteBufferC.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		colorBuffer.put(pyramidColor);
		//step5:set the array at 0th position of the buffer
		colorBuffer.position(0);
				
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,(pyramidColor.length)*4,
							colorBuffer,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_COLOR,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_COLOR);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);

		GLES32.glBindVertexArray(0);
		//////////////////////////////////////////////////////////////////////////////////////////////////
		//create vao Cube
		GLES32.glGenVertexArrays(1,vao_cube,0);
		GLES32.glBindVertexArray(vao_cube[0]);
		GLES32.glGenBuffers(1,vbo_position_cube,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_cube[0]);

		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		ByteBuffer byteBufferR=ByteBuffer.allocateDirect((cubeVertices.length)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBufferR.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		FloatBuffer positionBufferR=byteBufferR.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		positionBufferR.put(cubeVertices);
		//step5:set the array at 0th position of the buffer
		positionBufferR.position(0);
		//System.out.println("RTR:positionBuffer is ---->"+positionBuffer);
		
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,(cubeVertices.length)*4,
							positionBufferR,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);

		//for cube color
		GLES32.glGenBuffers(1,vbo_color_cube,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_cube[0]);
		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		ByteBuffer byteBufferCube=ByteBuffer.allocateDirect((cubeColor.length)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBufferCube.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		FloatBuffer colorBufferC=byteBufferCube.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		colorBufferC.put(cubeColor);
		//step5:set the array at 0th position of the buffer
		colorBufferC.position(0);
				
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,(cubeColor.length)*4,
							colorBufferC,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_COLOR,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_COLOR);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);

		GLES32.glBindVertexArray(0);
		//////////////////////////////////////////////////////////////////////////////////////////////////
		//depth mandate lines
		GLES32.glEnable(GLES32.GL_DEPTH_TEST);
		GLES32.glDepthFunc(GLES32.GL_LEQUAL);
		GLES32.glDisable(GLES32.GL_CULL_FACE);
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

		Matrix.translateM(translationMatrix,0,-2.0F,0.0F,-4.0F);
		Matrix.rotateM(rotationMatrix,0,angle_pyramid,0.0F,1.0F,0.0F);

		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		//bind with vao traingle
		GLES32.glBindVertexArray(vao_pyramid[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_TRIANGLES,0,3);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLES,3,3);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLES,6,3);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLES,9,3);
		//unbind vao
		GLES32.glBindVertexArray(0);

		Matrix.setIdentityM(translationMatrix,0);
		Matrix.setIdentityM(rotationMatrix,0);
		Matrix.setIdentityM(modelViewMatrix,0);
		//Matrix.setIdentityM(modelViewProjectionMatrix,0);
		Matrix.translateM(translationMatrix,0,2.0F,0.0F,-4.0F);
		Matrix.rotateM(rotationMatrix,0,angle_cube,1.0F,1.0F,1.0F);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		GLES32.glVertexAttrib3f(GLESMacros.AMC_ATTRIBUTE_COLOR,0.0f,0.0f,1.0f);
		//bind with vao rectangle
		GLES32.glBindVertexArray(vao_cube[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,0,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,4,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,8,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,12,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,16,4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,20,4);

		//unbind vao
		GLES32.glBindVertexArray(0);
		//unuse program
		GLES32.glUseProgram(0);
		requestRender();
		update();
	}
	private void update()
	{
		angle_pyramid+=0.5F;
		if(angle_pyramid>360.0F)
			angle_pyramid=0.0F;
		angle_cube+=0.5F;
		if(angle_cube>360.0F)
			angle_cube=0.0F;
	}
	private void uninitialize()
	{
		if (vbo_position_pyramid[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_position_pyramid,0);
			vbo_position_pyramid[0] = 0;
		}
		if (vbo_position_cube[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_position_cube,0);
			vbo_position_cube[0] = 0;
		}
		if (vbo_color_pyramid[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_color_pyramid,0);
			vbo_color_pyramid[0] = 0;
		}
		if (vbo_color_cube[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_color_cube,0);
			vbo_color_cube[0] = 0;
		}
		if (vao_pyramid[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vao_pyramid,0);
			vao_pyramid[0] = 0;
		}
		if (vao_cube[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vao_cube,0);
			vao_cube[0] = 0;
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

