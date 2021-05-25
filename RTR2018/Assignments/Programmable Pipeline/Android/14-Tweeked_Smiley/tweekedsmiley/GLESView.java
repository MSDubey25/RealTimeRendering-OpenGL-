package com.astromedicomp.tweekedsmiley;

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

import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.opengl.GLUtils;

public class GLESView extends GLSurfaceView implements GLSurfaceView.Renderer,OnGestureListener,OnDoubleTapListener
{
	private final Context context;
	private GestureDetector gestureDetector;

	//seven new variables
	private int vertexShaderObject;
	private int fragmentShaderObject;
	private int shaderProgramObject;

	private int[] vao_rectangle=new int[1];
	private int[] vbo_position_rectangle=new int[1];
	private int[] vbo_texture=new int[1];

	private int mvpUniform;
	private int samplerUniform;

	private float[] perspectiveProjectionMatrix=new float[16];

	private int[] texture_smiley=new int[1];
	private int keypress=0;
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
		keypress++;
		if(keypress>4)
			keypress=0;
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
															"in vec2 vTexCoord;"+
															"uniform mat4 u_mvp_matrix;"+
															"out vec2 out_TexCoord;"+
															"void main(void)"+
															"{"+
															"gl_Position=u_mvp_matrix * vPosition;"+
															"out_TexCoord=vTexCoord;"+
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
															"in vec2 out_TexCoord;"+
															"uniform sampler2D u_sampler;"+
															"out vec4 FragColor;"+
															"void main(void)"+
															"{"+
															"FragColor=texture(u_sampler,out_TexCoord);"+
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
		mvpUniform=GLES32.glGetUniformLocation(shaderProgramObject,"u_mvp_matrix");
		samplerUniform=GLES32.glGetUniformLocation(shaderProgramObject,"u_sampler");
		//triangle vertices
		final float[] rectangleVertices=new float[] 
										{ 1.5F,1.5F,0.0F,
										-1.5F,1.5F,0.0F,
										-1.5F,-1.5F,0.0F,
										1.5F,-1.5F,0.0F };
		
		//create vao rectangle
		GLES32.glGenVertexArrays(1,vao_rectangle,0);
		GLES32.glBindVertexArray(vao_rectangle[0]);
		GLES32.glGenBuffers(1,vbo_position_rectangle,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_position_rectangle[0]);

		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		ByteBuffer byteBufferR=ByteBuffer.allocateDirect((rectangleVertices.length)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBufferR.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		FloatBuffer positionBufferR=byteBufferR.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		positionBufferR.put(rectangleVertices);
		//step5:set the array at 0th position of the buffer
		positionBufferR.position(0);
		//System.out.println("RTR:positionBuffer is ---->"+positionBuffer);
		
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,(rectangleVertices.length)*4,
							positionBufferR,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,3,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);
		
		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		ByteBuffer byteBufferT=ByteBuffer.allocateDirect((Float.SIZE/8)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBufferT.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		FloatBuffer colorBufferT=byteBufferT.asFloatBuffer();
		
		//for texture
		GLES32.glGenBuffers(1,vbo_texture,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_texture[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (Float.SIZE/8)*4,
			colorBufferT, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_TEXCOORD0, 2, GLES32.GL_FLOAT, false, 0, 0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_TEXCOORD0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		/////////////////////////////////////////////////////////
		
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
		GLES32.glEnable(GLES32.GL_TEXTURE_2D);
		texture_smiley[0]=LoadTexture(R.raw.smiley_512x512);
		
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
		Matrix.setIdentityM(translationMatrix,0);
		translationMatrix[11]=-4.0F;

		float[] modelViewMatrix=new float[16];
		Matrix.setIdentityM(modelViewProjectionMatrix,0);
		
		Matrix.setIdentityM(modelViewMatrix,0);
		Matrix.translateM(translationMatrix,0,0.0F,0.0F,-4.0F);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		
		float[] rectangleTexCoord =new float[] { 0.0f,0.0f,
										0.0f,0.0f,
										0.0f,0.0f,
										0.0f,0.0f };
		
		if(keypress==1)
		{
			rectangleTexCoord[0]= 0.5f;
			rectangleTexCoord[1]= 0.5f;
			rectangleTexCoord[2]= 0.0f;
			rectangleTexCoord[3]= 0.5f;
			rectangleTexCoord[4]= 0.0f;
			rectangleTexCoord[5]= 0.0f;
			rectangleTexCoord[6]= 0.5f;
			rectangleTexCoord[7]= 0.0f;
			
		}
		else if(keypress==2)
		{
			rectangleTexCoord[0]= 1.0f;
			rectangleTexCoord[1]= 1.0f;
			rectangleTexCoord[2]= 0.0f;
			rectangleTexCoord[3]= 1.0f;
			rectangleTexCoord[4]= 0.0f;
			rectangleTexCoord[5]= 0.0f;
			rectangleTexCoord[6]= 1.0f;
			rectangleTexCoord[7]= 0.0f;
			
		}
		else if(keypress==3)
		{
			rectangleTexCoord[0]= 2.0f;
			rectangleTexCoord[1]= 2.0f;
			rectangleTexCoord[2]= 0.0f;
			rectangleTexCoord[3]= 2.0f;
			rectangleTexCoord[4]= 0.0f;
			rectangleTexCoord[5]= 0.0f;
			rectangleTexCoord[6]= 2.0f;
			rectangleTexCoord[7]= 0.0f;
			
		}
		else if(keypress==4)
		{
			rectangleTexCoord[0]= 0.5f;
			rectangleTexCoord[1]= 0.5f;
			rectangleTexCoord[2]= 0.5f;
			rectangleTexCoord[3]= 0.5f;
			rectangleTexCoord[4]= 0.5f;
			rectangleTexCoord[5]= 0.5f;
			rectangleTexCoord[6]= 0.5f;
			rectangleTexCoord[7]= 0.5f;
			
		}
		else
		{
			rectangleTexCoord[0]= 0.0F;
			rectangleTexCoord[1]= 0.0f;
			rectangleTexCoord[2]= 0.0f;
			rectangleTexCoord[3]= 0.0f;
			rectangleTexCoord[4]= 0.0f;
			rectangleTexCoord[5]= 0.0f;
			rectangleTexCoord[6]= 0.0f;
			rectangleTexCoord[7]= 0.0f;
			
		}
		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		ByteBuffer byteBufferT=ByteBuffer.allocateDirect((rectangleTexCoord.length)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBufferT.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		FloatBuffer colorBufferT=byteBufferT.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		colorBufferT.put(rectangleTexCoord);
		//step5:set the array at 0th position of the buffer
		colorBufferT.position(0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo_texture[0]);
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER, (rectangleTexCoord.length)*4,
			colorBufferT, GLES32.GL_DYNAMIC_DRAW);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER, 0);
		//working with textures
		GLES32.glActiveTexture(GLES32.GL_TEXTURE0);
		GLES32.glBindTexture(GLES32.GL_TEXTURE_2D,texture_smiley[0]);
		GLES32.glUniform1i(samplerUniform,0);
		//bind with vao rectangle
		GLES32.glBindVertexArray(vao_rectangle[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_TRIANGLE_FAN,0,4);

		//unbind vao
		GLES32.glBindVertexArray(0);
		//unuse program
		GLES32.glUseProgram(0);
		requestRender();
	}
	private void uninitialize()
	{
		if (vbo_texture[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_texture,0);
			vbo_texture[0] = 0;
		}
		if (texture_smiley[0]!=0)
		{
			GLES32.glDeleteBuffers(1, texture_smiley,0);
			texture_smiley[0] = 0;
		}
		if (vbo_position_rectangle[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo_position_rectangle,0);
			vbo_position_rectangle[0] = 0;
		}
		
		if (vao_rectangle[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vao_rectangle,0);
			vao_rectangle[0] = 0;
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

