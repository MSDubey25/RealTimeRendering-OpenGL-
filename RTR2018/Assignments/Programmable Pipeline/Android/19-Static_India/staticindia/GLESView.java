package com.astromedicomp.staticindia;

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
	
	private int[] vao_letters=new int[1];
	private int[] vbo_position_letters=new int[1];
	private int[] vbo_color_letters=new int[1];
	
	
	private float angle_traingle=0.0F;
	private float angle_rectangle=0.0F;

	private int mvpUniform;
	private float[] perspectiveProjectionMatrix=new float[16];
	
	private ByteBuffer byteBuffer;
	private ByteBuffer byteBufferC;
	private FloatBuffer positionBuffer;
	private FloatBuffer colorBuffer;

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
		final float[] traingleVertices=new float[]
										{0.0F,1.0F,0.0F,
										-1.0F,-1.0F,0.0F,
										1.0F,-1.0F,0.0F};
		final float[] traingleColor=new float[]
										{1.0F,0.0F,0.0F,
										0.0F,1.0F,0.0F,
										0.0F,0.0F,1.0F};
		
		
		//create vao triangle
		GLES32.glGenVertexArrays(1,vao_letters,0);
		GLES32.glBindVertexArray(vao_letters[0]);
		GLES32.glGenBuffers(1,vbo_position_letters,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_letters[0]);


		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		byteBuffer=ByteBuffer.allocateDirect(500 * 3 * 4);
		//step2:Arange the buffer into native ByteOrder
		byteBuffer.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		positionBuffer=byteBuffer.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		positionBuffer.put(traingleVertices);
		//step5:set the array at 0th position of the buffer
		positionBuffer.position(0);
		//System.out.println("RTR:positionBuffer is ---->"+positionBuffer);
		
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,500 * 3 * 4,
							null,GLES32.GL_DYNAMIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);

		//for traingle color
		GLES32.glGenBuffers(1,vbo_color_letters,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_letters[0]);
		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		byteBufferC=ByteBuffer.allocateDirect(500 * 3 * 4);
		//step2:Arange the buffer into native ByteOrder
		byteBufferC.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		colorBuffer=byteBufferC.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		colorBuffer.put(traingleColor);
		//step5:set the array at 0th position of the buffer
		colorBuffer.position(0);
				
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,500 * 3 * 4,
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
		final float[] IVertices=new float[]{
	 -1.75f, 0.75f,0.0f, //for I
	-1.75f, 0.65f,0.0f,	 //for I
	-1.25f, 0.65f,0.0f , //for I
	-1.25f, 0.75f ,0.0f, //for I
	-1.35f, 0.65f ,0.0f, //for I
	-1.65f, 0.65f ,0.0f, //for I
	-1.65f, -0.65f ,0.0f,//for I
	-1.35f, -0.65f ,0.0f,//for I
	-1.75f, -0.65f ,0.0f,//for I
	-1.75f, -0.75f ,0.0f,//for I
	-1.25f, -0.75f ,0.0f,//for I
	-1.25f, -0.65f ,0.0f//for I
	};
	final float[] NVertices=new float[]
	{
		-1.10f, 0.75f ,0.0f, //for N
		-1.25f, 0.75f ,0.0f, //for N
		-1.25f, -0.75f ,0.0f,//for N
		-1.10f, -0.75f ,0.0f,//for N
		-1.10f, 0.75f ,0.0f, //for N
		-1.25f, 0.75f ,0.0f, //for N
		-0.95f, -0.75f ,0.0f,//for N
		-0.8f, -0.75f ,0.0f, //for N
		-0.80f, 0.75f ,0.0f, //for N
		-0.95f, 0.75f ,0.0f, //for N
		-0.95f, -0.75f ,0.0f,//for N
		-0.80f, -0.75f ,0.0f//for N 
	};
	final float[] DVertices=new float[]
	{
	-0.0f, 0.75f ,0.0f,  //for D
	-0.60f, 0.75f ,0.0f,	//for D
	-0.60f, -0.75f ,0.0f,//for D
	0.0f, -0.75f ,0.0f,	//for D
	-0.15f, 0.60f ,0.0f,	//for D
	-0.35f, 0.60f ,0.0f,	//for D
	-0.35f, -0.60f,0.0f,	//for D
	-0.15f, -0.60f,0.0f,	//for D
	-0.5f, 0.60f,0.0f,	//for D
	-0.60f, 0.60f,0.0f,	//for D
	-0.60f, -0.60f,0.0f,	//for D
	-0.5f, -0.60f,0.0f	//for D

	};
	final float[] AVertices=new float[]
	{
	1.25f, 0.75f,0.0f, //A
		1.1f, 0.75f,0.0f,  //A
		0.9f, -0.75f,0.0f, //A
		1.55f, -0.75f,0.0f,//A
		1.18f, 0.5f,0.0f,//triangle A
		1.05f, -0.75f,0.0f,
		1.40f, -0.75f,0.0f

	};
	final float[] FlagVertices=new float[]
	{
		0.057f, 0.0f,0.0f, 
		0.203f, 0.0f,0.0f, 
		0.205f, -0.05f,0.0f, 
		0.045f, -0.05f,0.0f,
		0.057f, 0.0f ,0.0f,
		0.2029f, 0.0f,0.0f,
		0.195f, 0.05f,0.0f,
		 0.065f, 0.05f,0.0f
	};
	
	final float[] IColor=new float[]
	{
	1.0f, 0.6f, 0.2f,	//for I
	1.0f, 0.6f, 0.2f,		//for I
	1.0f, 0.6f, 0.2f,		//for I
	1.0f, 0.6f, 0.2f ,		//for I
	1.0f, 0.6f, 0.2f ,		//for I
	1.0f, 0.6f, 0.2f,		//for I
	0.071f, 0.533f, 0.027f ,//for I
	0.071f, 0.533f, 0.027f ,//for I
	0.071f, 0.533f, 0.027f ,//for I
	0.071f, 0.533f, 0.027f ,//for I
	0.071f, 0.533f, 0.027f ,//for I
	0.071f, 0.533f, 0.027f //for I
	};
	final float[] NColor=new float[]
	{
	1.0f, 0.6f, 0.2f ,		//for N
	1.0f, 0.6f, 0.2f ,		//for N
	0.071f, 0.533f, 0.027f ,//for N
	0.071f, 0.533f, 0.027f ,//for N
	1.0f, 0.6f, 0.2f ,		//for N
	1.0f, 0.6f, 0.2f ,		//for N
	0.071f, 0.533f, 0.027f ,//for N
	0.071f, 0.533f, 0.027f ,//for N 
	1.0f, 0.6f, 0.2f ,		//for N
	1.0f, 0.6f, 0.2f ,		//for N
	0.071f, 0.533f, 0.027f ,//for N
	0.071f, 0.533f, 0.027f  //for N
	};
	final float[] DColor=new float[]
	{
	1.0f, 0.6f, 0.2f ,	 //for D
	1.0f, 0.6f, 0.2f ,	 //for D
	0.071f, 0.533f, 0.027f , //for D
	0.071f, 0.533f, 0.027f , //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f //for D
	};
	final float[] AColor=new float[]{
	1.0f, 0.6f, 0.2f,      //A
	1.0f, 0.6f, 0.2f,	   //A
	0.071f, 0.533f, 0.027f,//A
	0.071f, 0.533f, 0.027f,//A
	0.0f, 0.0f, 0.0f,	   //A
	0.0f, 0.0f, 0.0f,	   //A
	0.0f, 0.0f, 0.0f	   //A
	};
	final float[] FlagColor=new float[]{
	1.0f, 1.0f, 1.0f,
	1.0f, 1.0f, 1.0f,
	0.071f, 0.533f, 0.027f,
	0.071f, 0.533f, 0.027f,
	1.0f, 1.0f, 1.0f,
	1.0f, 1.0f, 1.0f,
	1.0f, 0.6f, 0.2f,
	1.0f, 0.6f, 0.2f
	};
		GLES32.glClear(GLES32.GL_COLOR_BUFFER_BIT | GLES32.GL_DEPTH_BUFFER_BIT);
		GLES32.glUseProgram(shaderProgramObject);
		float[] modelViewProjectionMatrix=new float[16];
		float[] translationMatrix=new float[16];
		float[] rotationMatrix=new float[16];
		float[] scaleMatrix=new float[16];
		float[] modelViewMatrix=new float[16];

		Matrix.setIdentityM(modelViewProjectionMatrix,0);
		Matrix.setIdentityM(translationMatrix,0);
		Matrix.setIdentityM(rotationMatrix,0);
		Matrix.setIdentityM(modelViewMatrix,0);
		Matrix.setIdentityM(scaleMatrix,0);

		Matrix.translateM(translationMatrix,0,0.0F,0.0F,-4.0F);
		//Matrix.rotateM(rotationMatrix,0,angle_traingle,0.0F,1.0F,0.0F);
		
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		//Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		//bind with vao traingle
		positionBuffer.put(IVertices);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (IVertices.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);
		
		colorBuffer.put(IColor);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (IColor.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 0, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 4, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 8, 4);

		//unbind vao
		GLES32.glBindVertexArray(0);
		/////////////////////////// N /////////////////
		Matrix.translateM(translationMatrix,0,0.2F,0.0F,4.0F);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		//Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		//bind with vao traingle
		positionBuffer.put(NVertices);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (NVertices.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);
		
		colorBuffer.put(NColor);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (NColor.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 0, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 4, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 8, 4);

		//unbind vao
		GLES32.glBindVertexArray(0);
		
		/////////////////////////// D /////////////////
		Matrix.translateM(translationMatrix,0,-0.15F,0.0F,0.0F);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		//Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		//bind with vao traingle
		positionBuffer.put(DVertices);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (DVertices.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);
		
		colorBuffer.put(DColor);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (DColor.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 0, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 4, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 8, 4);

		//unbind vao
		GLES32.glBindVertexArray(0);

	///////////////////////// I ////////////////
			Matrix.translateM(translationMatrix,0,1.9F,0.0F,0.0F);
		//Matrix.rotateM(rotationMatrix,0,angle_traingle,0.0F,1.0F,0.0F);

		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		//Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		//bind with vao traingle
		positionBuffer.put(IVertices);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (IVertices.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);
		
		colorBuffer.put(IColor);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (IColor.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 0, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 4, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 8, 4);

		//unbind vao
		GLES32.glBindVertexArray(0);

		//////////////// A  /////////
		
			Matrix.translateM(translationMatrix,0,-3.8F,0.0F,0.0F);
		//Matrix.rotateM(rotationMatrix,0,angle_traingle,0.0F,1.0F,0.0F);

		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		//Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		//bind with vao traingle
		positionBuffer.put(AVertices);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (AVertices.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);
		
		colorBuffer.put(AColor);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (AColor.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 0, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLES, 4, 3);
		//GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 8, 4);

		//unbind vao
		GLES32.glBindVertexArray(0);
		
		////flag
			Matrix.translateM(translationMatrix,0,2.92F,0.0F,0.0F);
		//Matrix.rotateM(rotationMatrix,0,angle_traingle,0.0F,1.0F,0.0F);

		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		//Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		//bind with vao traingle
		positionBuffer.put(FlagVertices);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (FlagVertices.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);
		
		colorBuffer.put(FlagColor);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (FlagColor.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 0, 4);
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 4, 4);
		//GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN, 8, 4);

		//unbind vao
		GLES32.glBindVertexArray(0);
	//////CHAKRA
		//for circle
		float circleCoordinates1[]=new float[1000];
		float colorCoordinates1[]=new float[1000];
	for (int i = 0; i < 1000; i++)
	{
		float angle = 2 * i* (float)Math.PI / 1000;
		if (i % 3 == 0)
		{
			circleCoordinates1[i] = (float)Math.cos(angle);
			colorCoordinates1[i] = 0.0f;
		}
		else if (i % 3 == 1)
		{
			circleCoordinates1[i] = (float)Math.sin(angle);
			colorCoordinates1[i] = 0.0f;
		}
		else
		{
			circleCoordinates1[i] = 0.0f;
			colorCoordinates1[i] = 1.0f;
		}
	}
		Matrix.translateM(translationMatrix,0,-0.95F,0.0F,0.0F);
		//Matrix.rotateM(rotationMatrix,0,angle_traingle,0.0F,1.0F,0.0F);
		Matrix.scaleM(scaleMatrix,0,0.015f,0.015f,0.015f);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		//Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,rotationMatrix,0);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,scaleMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		//bind with vao traingle
		positionBuffer.put(circleCoordinates1);
		positionBuffer.position(0);
		//bind with vao traingle
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (circleCoordinates1.length)*4,
			positionBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);
		
		colorBuffer.put(colorCoordinates1);
		colorBuffer.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_color_letters[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (colorCoordinates1.length)*4,
			colorBuffer, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		GLES32.glBindVertexArray(vao_letters[0]);

		//similarly bind with textures if any

		//draw necessary scene
		for (int i = 0; i < 997; i += 2)
		{
			GLES32.glDrawArrays(GLES32.GL_LINE_LOOP, i, i + 2);
			//GLES32.glDrawArrays(GLES32.GL_LINE_LOOP, i, i + 2);
		}

		//unbind vao
		GLES32.glBindVertexArray(0);

		//unuse program
		GLES32.glUseProgram(0);
		requestRender();
		//update();
	}
	private void update()
	{
	}
	private void uninitialize()
	{
		if (vbo_position_letters[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_position_letters,0);
			vbo_position_letters[0] = 0;
		}
		if (vbo_color_letters[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_color_letters,0);
			vbo_color_letters[0] = 0;
		}
		if (vao_letters[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vao_letters,0);
			vao_letters[0] = 0;
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

