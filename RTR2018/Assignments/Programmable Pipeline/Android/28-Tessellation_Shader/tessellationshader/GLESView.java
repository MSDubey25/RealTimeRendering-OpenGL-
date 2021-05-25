package com.astromedicomp.tessellationshader;

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
	private int TessellationControlShaderObject;
	private int TessellationEvaluationShaderObject;
	private int shaderProgramObject;
	
	private int gNumberOfSegmentsUniform=0;
	private int gNumberOfStripsUniform=0;
	private int gLineColorUniform;
	private int gNumberOfLineSegments=0;
	boolean flag=false;

	int[] vao=new int[1];
	int[] vbo=new int[1];

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
		
		if(flag==false)
		{
			gNumberOfLineSegments++;
			if (gNumberOfLineSegments >= 50)
			{
				gNumberOfLineSegments = 50;
				flag=true;
			}
		}
		else
		{
			gNumberOfLineSegments--;
			if (gNumberOfLineSegments <= 0)
			{
				gNumberOfLineSegments = 1;
				flag=false;
			}
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
	//upto wglMakeCurrent is taken care by GLSurfaceView
		vertexShaderObject=GLES32.glCreateShader(GLES32.GL_VERTEX_SHADER);
		final String vertexShaderSourceCode = String.format(
															"#version 320 es"+
															"\n"+
															"in vec2 vPosition;"+
															"void main(void)"+
															"{"+
															"gl_Position=vec4(vPosition,0.0,1.0);"+
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
		//tessellation control shader
		TessellationControlShaderObject=GLES32.glCreateShader(GLES32.GL_TESS_CONTROL_SHADER);
		final String tessellationControlShaderSourceCode = String.format(
		"#version 320 es"+
		"\n"+
		"layout(vertices=4)out;" +
		"uniform int numberOfSegments;" +
		"uniform int numberOfStrips;" +
		"void main(void)" +
		"{" +
		"	gl_out[gl_InvocationID].gl_Position=gl_in[gl_InvocationID].gl_Position;" +
		"	gl_TessLevelOuter[0]=float(numberOfStrips);" +
		"	gl_TessLevelOuter[1]=float(numberOfSegments);" +
		"}");
		
		GLES32.glShaderSource(TessellationControlShaderObject,tessellationControlShaderSourceCode);
		GLES32.glCompileShader(TessellationControlShaderObject);
		//error check for shader compilation
		iShaderCompileStatus=new int[1];
		iInfoLogLength=new int[1];
		szInfoLog=null;

		GLES32.glGetShaderiv(TessellationControlShaderObject,GLES32.GL_COMPILE_STATUS,iShaderCompileStatus,0);
		System.out.println("RTR:TessellationControl Shader Compilation Status ---->"+iShaderCompileStatus[0]);
		if(iShaderCompileStatus[0]==GLES32.GL_FALSE)
		{
			GLES32.glGetShaderiv(TessellationControlShaderObject,GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);
			if(iInfoLogLength[0]>0)
			{
				szInfoLog=GLES32.glGetShaderInfoLog(TessellationControlShaderObject);
				System.out.println("RTR:tessellationControl Shader Compilation Log ---->"+szInfoLog);
				uninitialize();
				System.exit(0);
			}
		}

		///////////////////		
		//tessellation evaluation
		TessellationEvaluationShaderObject=GLES32.glCreateShader(GLES32.GL_TESS_EVALUATION_SHADER);
		final String tessellationEvaluationShaderSourceCode = String.format(
		"#version 320 es"+
		"\n"+
		"layout(isolines)in;" +
		"uniform mat4 u_mvp_matrix;" +
		"void main(void)" +
		"{" +
		"	float u=gl_TessCoord.x;" +
		"	vec3 p0=gl_in[0].gl_Position.xyz;" +
		"	vec3 p1=gl_in[1].gl_Position.xyz;" +
		"	vec3 p2=gl_in[2].gl_Position.xyz;" +
		"	vec3 p3=gl_in[3].gl_Position.xyz;" +
		"	float u1=(1.0-u);" +
		"	float u2=(u*u);" +
		"	float b3=u2 * u;" +
		"	float b2=3.0* u2 * u1;" +
		"	float b1=3.0* u * u1 * u1;" +
		"	float b0=u1 * u1 * u1;" +
		"	vec3 p=p0 * b0 + p1 * b1 + p2 * b2 + p3 * b3 ;" +
		"	gl_Position=u_mvp_matrix*vec4(p,1.0);" +
		"}");
		
		GLES32.glShaderSource(TessellationEvaluationShaderObject,tessellationEvaluationShaderSourceCode);
		GLES32.glCompileShader(TessellationEvaluationShaderObject);
		//error check for shader compilation
		iShaderCompileStatus=new int[1];
		iInfoLogLength=new int[1];
		szInfoLog=null;

		GLES32.glGetShaderiv(TessellationEvaluationShaderObject,GLES32.GL_COMPILE_STATUS,iShaderCompileStatus,0);
		System.out.println("RTR:tessellationEvaluation Shader Compilation Status ---->"+iShaderCompileStatus[0]);
		if(iShaderCompileStatus[0]==GLES32.GL_FALSE)
		{
			GLES32.glGetShaderiv(TessellationEvaluationShaderObject,GLES32.GL_INFO_LOG_LENGTH,iInfoLogLength,0);
			if(iInfoLogLength[0]>0)
			{
				szInfoLog=GLES32.glGetShaderInfoLog(TessellationEvaluationShaderObject);
				System.out.println("RTR:tessellationEvaluation Shader Compilation Log ---->"+szInfoLog);
				uninitialize();
				System.exit(0);
			}
		}
		///////////////////
		fragmentShaderObject=GLES32.glCreateShader(GLES32.GL_FRAGMENT_SHADER);
		final String fragmentShaderSourceCode=String.format(
															"#version 320 es"+
															"\n"+
															"precision highp float;"+
															"uniform vec4 lineColor;"+
															"out vec4 FragColor;"+
															"void main(void)"+
															"{"+
															"FragColor=lineColor;"+
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
		GLES32.glAttachShader(shaderProgramObject,TessellationControlShaderObject);
		GLES32.glAttachShader(shaderProgramObject,TessellationEvaluationShaderObject);
		GLES32.glAttachShader(shaderProgramObject,fragmentShaderObject);
		//prelink binding attribute
		GLES32.glBindAttribLocation(shaderProgramObject,GLESMacros.AMC_ATTRIBUTE_POSITION,"vPosition");
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
		gNumberOfSegmentsUniform= GLES32.glGetUniformLocation(shaderProgramObject, "numberOfSegments");
		gNumberOfStripsUniform= GLES32.glGetUniformLocation(shaderProgramObject, "numberOfStrips");
		gLineColorUniform= GLES32.glGetUniformLocation(shaderProgramObject, "lineColor");
		//triangle vertices
		final float[] traingleVertices=new float[]
										{-1.0f,-1.0f,-0.5f,1.0f,0.5f,-1.0f,1.0f,1.0f};
		//create vao
		GLES32.glGenVertexArrays(1,vao,0);
		GLES32.glBindVertexArray(vao[0]);
		GLES32.glGenBuffers(1,vbo,0);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,vbo[0]);

		//To create Buffer data from out array
		//step1:Allocate the buffer directly from native memory
		ByteBuffer byteBuffer=ByteBuffer.allocateDirect((traingleVertices.length)*4);
		//step2:Arange the buffer into native ByteOrder
		byteBuffer.order(ByteOrder.nativeOrder());
		//step3:create the float type buffer and convert our byte type buffer into float type Buffer
		FloatBuffer positionBuffer=byteBuffer.asFloatBuffer();
		//step4:now put our array into the cooked buffer
		positionBuffer.put(traingleVertices);
		//step5:set the array at 0th position of the buffer
		positionBuffer.position(0);
		//System.out.println("RTR:positionBuffer is ---->"+positionBuffer);
		
		GLES32.glBufferData(GLES32.GL_ARRAY_BUFFER,(traingleVertices.length)*4,
							positionBuffer,GLES32.GL_STATIC_DRAW);
		GLES32.glVertexAttribPointer(GLESMacros.AMC_ATTRIBUTE_POSITION,2,GLES32.GL_FLOAT,false,0,0);
		GLES32.glEnableVertexAttribArray(GLESMacros.AMC_ATTRIBUTE_POSITION);
		GLES32.glBindBuffer(GLES32.GL_ARRAY_BUFFER,0);
		GLES32.glBindVertexArray(0);

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
		GLES32.glClear(GLES32.GL_COLOR_BUFFER_BIT | GLES32.GL_DEPTH_BUFFER_BIT);
		GLES32.glUseProgram(shaderProgramObject);
		float[] modelViewProjectionMatrix=new float[16];
		float[] translationMatrix=new float[16];
		Matrix.setIdentityM(translationMatrix,0);
		translationMatrix[11]=-4.0F;

		float[] modelViewMatrix=new float[16];
		Matrix.setIdentityM(modelViewProjectionMatrix,0);
		
		Matrix.setIdentityM(modelViewMatrix,0);
		Matrix.translateM(translationMatrix,0,0.5f,0.5f,-7.0f);
		Matrix.multiplyMM(modelViewMatrix,0,modelViewMatrix,0,translationMatrix,0);
		Matrix.multiplyMM(modelViewProjectionMatrix,0,perspectiveProjectionMatrix,0,modelViewMatrix,0);
		/*System.out.println("RTR:Afetr Multiplication matrix is ---->"+modelViewProjectionMatrix);
		for(int i=0;i<16;i++)
		{
			System.out.print(modelViewProjectionMatrix[i]+" ,");
		}*/
		GLES32.glUniformMatrix4fv(mvpUniform,1,false,modelViewProjectionMatrix,0);
		GLES32.glUniform1i(gNumberOfSegmentsUniform,gNumberOfLineSegments);
		GLES32.glUniform1i(gNumberOfStripsUniform,1);
		float[] color=new float[]{0.0f,0.0f,1.0f,0.0f};
		if(gNumberOfLineSegments==1 || gNumberOfLineSegments==50)
		{
			GLES32.glUniform4fv(gLineColorUniform,1,color,0);
		}
		else if(gNumberOfLineSegments>1 && gNumberOfLineSegments<50 && flag==false)
		{
				color[0]=1.0f;
				color[1]=1.0f;
				color[2]=0.0f;
				GLES32.glUniform4fv(gLineColorUniform,1,color,0);
		}
		else
		{
				color[0]=1.0f;
				color[1]=0.0f;
				color[2]=0.0f;
				GLES32.glUniform4fv(gLineColorUniform,1,color,0);
		}
			
		//bind with vao
		GLES32.glBindVertexArray(vao[0]);

		//similarly bind with textures if any

		//draw necessary scene
		GLES32.glDrawArrays(GLES32.GL_PATCHES, 0, 4);

		//unbind vao
		GLES32.glBindVertexArray(0);

		//unuse program
		GLES32.glUseProgram(0);
		requestRender();
	}
	private void uninitialize()
	{
		if (vbo[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vbo,0);
			vbo[0] = 0;
		}
		if (vao[0]!=0)
		{
			GLES32.glDeleteBuffers(1, vao,0);
			vao[0] = 0;
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

