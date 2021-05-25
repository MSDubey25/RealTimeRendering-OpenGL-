#include<iostream>
#include<stdio.h>
#include<stdlib.h>
#include<memory.h>

#include<GL/glew.h>
#include<X11/Xlib.h>
#include<X11/Xutil.h>
#include<X11/XKBlib.h>
#include<X11/keysym.h>

#include<GL/gl.h>
#include<GL/glx.h>
#include "vmath.h"

using namespace std;
using namespace vmath;

enum {
	AMC_ATTRIBUTE_POSITION=0,
	AMC_ATTRIBUTE_COLOR,
	AMC_ATTRIBUTE_NORMAL,
	AMC_ATTRIBUTE_TEXCOORD0
};

//global declarations
bool bFullscreen=false;
Display *gpDisplay=NULL;
XVisualInfo *gpXVisualInfo=NULL;
Colormap gColormap;
Window gWindow;
//FILE *gpFile = NULL;
int giWindowWidth=800;
int giWindowHeight=600;
char keys[26];
static GLfloat angle_tri = 0.0f;
static GLfloat angle_rect = 0.0f;

static GLXContext gGLXContext;

GLint gVertexShaderObject;
GLint gTessellationControlShaderObject;
GLint gTessellationEvaluationShaderObject;
GLint gFragmentShaderObject;
GLint gShaderProgramObject;

GLuint vao;
GLuint vbo;

GLuint mUniform;
GLuint vUniform;
GLuint pUniform;
GLuint gNumberOfSegmentsUniform;
GLuint gNumberOfStripsUniform;
GLuint gLineColorUniform;

unsigned int gNumberOfLineSegments;

mat4 projectionMatrix;
mat4 modelMatrix;
mat4 viewMatrix;


//entry point function
int main()
{

        void CreateWindow(void);
        void ToggleFullscreen(void);
        void uninitialize(void);
        void initialize(void);
        void Resize(int,int);
        void display(void);
        
        int WinWidth=giWindowWidth;
        int WinHeight=giWindowHeight;
        
        Bool bDone=false;
      /*  gpFile=fopen("log.txt", "w");
        if ( gpFile == NULL)
	{
	        printf("log error");
		//MessageBox(NULL, TEXT("Log file canont be created"), TEXT("Error"), MB_OK);
		exit(0);
	}
	else
	{
	        printf("log created");
		//fprintf(
		//gpFile, "Log file is created\n");
		printf("log write");
		
		//fprintf();
	}*/
	printf("before create window");
	
        CreateWindow();
        printf("After create win\n");
        
        initialize();
       printf("\nAfter Initialize\n");
        //Message Loop
        XEvent event;
        KeySym keysym;
        
        while(bDone==false)
        {
        printf("\ninside 1st while\n");
                while(XPending(gpDisplay))
                {
                printf("\nAinside game loop\n");
                        XNextEvent(gpDisplay,&event);
                        switch(event.type)
                        {
                                case MapNotify:
                                        break;
                                case KeyPress:
                                        keysym=XkbKeycodeToKeysym(gpDisplay,event.xkey.keycode,0,0);
                                        switch(keysym)
                                        {
                                                case XK_Escape:
                                                        bDone=true;
                                                        break;
                                                case XK_Up:
													gNumberOfLineSegments++;
													if (gNumberOfLineSegments >= 50)
													{
														gNumberOfLineSegments = 50;
													}
													break;
												case XK_Down:
													gNumberOfLineSegments--;
													if (gNumberOfLineSegments <= 0)
													{
														gNumberOfLineSegments = 1;
													}
													break;
                                                
                                                default:
                                                        break;
                                        }
                                        XLookupString(&event.xkey,keys,sizeof(keys),NULL,NULL);
                                        switch(keys[0])
                                        {
                                                case 'F':
                                                case 'f':
                                                        if(bFullscreen==false)
                                                        {
                                                                ToggleFullscreen();
                                                                bFullscreen=true;
                                                        }
                                                        else
                                                        {
                                                                ToggleFullscreen();
                                                                bFullscreen=false;
                                                        }
                                                        break;
                                                default:
                                                        break;
                                        }
                                        break;
                                case ButtonPress:
                                        switch(event.xbutton.button)
                                        {
                                                case 1:
                                                        break;
                                                case 2:
                                                        break;
                                                case 3:
                                                        break;
                                                default:
                                                        break;
                                        }                                
                                        break;    
                                case MotionNotify:
                                        break;
                                case ConfigureNotify:
                                        WinWidth=event.xconfigure.width;
                                        WinHeight=event.xconfigure.height;
                                        Resize(WinWidth,WinHeight);
                                        break;
                                case Expose:
                                        break;
                                case DestroyNotify:
                                        break;
                                case 33:
                                        bDone=true;
                                        break;
                                default:
                                        break;        
                        }        
                        printf("first while end\n");
                }
                printf("Before Display\n");
               // exit(0);
                  display();
        }
        uninitialize();
        return(0);
}

void CreateWindow(void)
{
        printf("in cretae tar\n");
        void uninitialize(void);
        printf("\nIn CreateWindow\n");
        XSetWindowAttributes winAttribs;
        int defaultScreen;
        int defaultDepth;
        int styleMask;
        
        static int frameBufferAttributes[]={GLX_RGBA,
                                            GLX_DOUBLEBUFFER,
                                            GLX_RED_SIZE,8,
                                            GLX_GREEN_SIZE,8,
                                            GLX_BLUE_SIZE,8,
                                            GLX_ALPHA_SIZE,8,
                                            GLX_DEPTH_SIZE,24,
                                            0};
        
        gpDisplay=XOpenDisplay(NULL);
        if(gpDisplay==NULL)
        {
                printf("ERROR : Unable to Open X Display.\nExitting Now...\n");
                uninitialize();
                exit(1);
        }
        printf("gpDisplay milla\n");
        defaultScreen=XDefaultScreen(gpDisplay);
        if(defaultScreen==0)
        {
                printf("no default screen\n");
        }
        defaultDepth=DefaultDepth(gpDisplay,defaultScreen);
        if(defaultDepth != 1)
        {
                                printf("no default depth\n");
        }
        gpXVisualInfo=glXChooseVisual(gpDisplay,defaultScreen,frameBufferAttributes);
        if(gpXVisualInfo==NULL)
        {
                printf("ERROR : Unable to get XVisualInfo.\nExitting Now...\n");
                uninitialize();
                exit(1);
        }
        else
        {
                printf("visual success\n");
        }
        winAttribs.border_pixel=0;
        winAttribs.border_pixmap=0;
        winAttribs.background_pixel=BlackPixel(gpDisplay,defaultScreen);
        winAttribs.background_pixmap=0;
        winAttribs.colormap=XCreateColormap(gpDisplay,
                                            RootWindow(gpDisplay,gpXVisualInfo->screen),
                                            gpXVisualInfo->visual,
                                            AllocNone);
        gColormap=winAttribs.colormap;
        winAttribs.event_mask=ExposureMask|VisibilityChangeMask|ButtonPressMask|KeyPressMask|PointerMotionMask|StructureNotifyMask;
        
        styleMask=CWBorderPixel|CWBackPixel|CWEventMask|CWColormap;
        
        gWindow=XCreateWindow(gpDisplay,
                              RootWindow(gpDisplay,gpXVisualInfo->screen),
                              0,
                              0,
                              giWindowWidth,
                              giWindowHeight,
                              0,
                              gpXVisualInfo->depth,
                              InputOutput,
                              gpXVisualInfo->visual,
                              styleMask,
                              &winAttribs);
       if(!gWindow)
       {
                printf("ERROR : Failed to Create Main Window.\nExittin Now ...\n");
                uninitialize();
                exit(1);
       }
       
       XStoreName(gpDisplay,gWindow,"Tessellation Shader");
       
       Atom windowManagerDelete=XInternAtom(gpDisplay,"WM_DELETE_WINDOW",True);
       XSetWMProtocols(gpDisplay,gWindow,&windowManagerDelete,1);
       
       XMapWindow(gpDisplay,gWindow);
       printf("In createw\n");
}
void initialize(void)
{
        void uninitialize(void);
        void Resize(int,int);

        GLenum result;        
        
	    gGLXContext=glXCreateContext(gpDisplay,gpXVisualInfo,NULL,GL_TRUE);
        glXMakeCurrent(gpDisplay,gWindow,gGLXContext);

        result=glewInit();
        if(result!=GLEW_OK)
        {
                uninitialize();
                exit(1);
        }
        printf("openGl verssion :%s",glGetString(GL_VERSION));
        printf("GLSL verssion :%s",glGetString(GL_SHADING_LANGUAGE_VERSION));
        
        //tessellation control shader
    	gTessellationControlShaderObject = glCreateShader(GL_TESS_CONTROL_SHADER);
	
	const char *tessellationControlShaderSourceCode = 
		"#version 410 core" \
		"\n" \
		"layout(vertices=4)out;" \
		"uniform int numberOfSegments;" \
		"uniform int numberOfStrips;" \
		"void main(void)" \
		"{" \
		"	gl_out[gl_InvocationID].gl_Position=gl_in[gl_InvocationID].gl_Position;" \
		"	gl_TessLevelOuter[0]=float(numberOfStrips);" \
		"	gl_TessLevelOuter[1]=float(numberOfSegments);" \
		"}";
	glShaderSource(gTessellationControlShaderObject, 1,
		(const char**)&tessellationControlShaderSourceCode,
		NULL);
	glCompileShader(gTessellationControlShaderObject);

	GLint iShaderCompileStatus=0;
        GLint iInfoLogLength=0;
        char *szInfoLog=NULL;
	

	glGetShaderiv(gTessellationControlShaderObject,
		GL_COMPILE_STATUS,
		&iShaderCompileStatus);
	printf("Value of igTessellationControlShaderObject shader compile Status is : %d\n", iShaderCompileStatus);
	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gTessellationControlShaderObject,
			GL_INFO_LOG_LENGTH,
			&iInfoLogLength);
		if (iInfoLogLength > 0)
		{
			szInfoLog = (GLchar*)malloc(iInfoLogLength);
			if (szInfoLog != NULL)
			{
				GLsizei writtened;
				glGetShaderInfoLog(gTessellationControlShaderObject,
					iInfoLogLength,
					&writtened,
					szInfoLog);
				printf("Error in compiling tessellation Control Shader : %hs\n", szInfoLog);
				free(szInfoLog);
				uninitialize();
				//DestroyWindow(ghHwnd);
			}
		}
	}

	gTessellationEvaluationShaderObject = glCreateShader(GL_TESS_EVALUATION_SHADER);

	const char *tessellationEvaluationShaderSourceCode =
		"#version 410 core" \
		"\n" \
		"layout(isolines)in;" \
		"uniform mat4 u_m_matrix;" \
		"uniform mat4 u_v_matrix;" \
		"uniform mat4 u_p_matrix;" \
		"void main(void)" \
		"{" \
		"	float u=gl_TessCoord.x;" \
		"	vec3 p0=gl_in[0].gl_Position.xyz;" \
		"	vec3 p1=gl_in[1].gl_Position.xyz;" \
		"	vec3 p2=gl_in[2].gl_Position.xyz;" \
		"	vec3 p3=gl_in[3].gl_Position.xyz;" \
		"	float u1=(1.0-u);" \
		"	float u2=(u*u);" \
		"	float b3=u2 * u;" \
		"	float b2=3.0* u2 * u1;" \
		"	float b1=3.0* u * u1 * u1;" \
		"	float b0=u1 * u1 * u1;" \
		"	vec3 p=p0 * b0 + p1 * b1 + p2 * b2 + p3 * b3 ;" \
		"	gl_Position=u_p_matrix*u_v_matrix*u_m_matrix*vec4(p,1.0);" \
		"}";
	glShaderSource(gTessellationEvaluationShaderObject, 1,
		(const char**)&tessellationEvaluationShaderSourceCode,
		NULL);
	glCompileShader(gTessellationEvaluationShaderObject);

	iShaderCompileStatus = 0;
	iInfoLogLength = 0;
	szInfoLog = NULL;

	glGetShaderiv(gTessellationEvaluationShaderObject,
		GL_COMPILE_STATUS,
		&iShaderCompileStatus);
	printf("Value of igTessellationEvaluationShaderObject shader compile Status is : %d\n", iShaderCompileStatus);
	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gTessellationEvaluationShaderObject,
			GL_INFO_LOG_LENGTH,
			&iInfoLogLength);
		if (iInfoLogLength > 0)
		{
			szInfoLog = (GLchar*)malloc(iInfoLogLength);
			if (szInfoLog != NULL)
			{
				GLsizei writtened;
				glGetShaderInfoLog(gTessellationEvaluationShaderObject,
					iInfoLogLength,
					&writtened,
					szInfoLog);
				printf("Error in compiling tessellation Control Shader : %hs\n", szInfoLog);
				free(szInfoLog);
				uninitialize();
				//DestroyWindow(ghHwnd);
			}
		}
	}

        //vertex Shader
        gVertexShaderObject=glCreateShader(GL_VERTEX_SHADER);
        const char *vertexShaderSourceCode=
       "#version 410 core" \
		"\n" \
		"in vec2 vPosition;" \
		"void main(void)" \
		"{" \
		"gl_Position=vec4(vPosition,0.0,1.0);" \
		"}";
        
        glShaderSource(gVertexShaderObject,1,(const char**)&vertexShaderSourceCode,NULL);
        glCompileShader(gVertexShaderObject);
        
        iShaderCompileStatus = 0;
	iInfoLogLength = 0;
	szInfoLog = NULL;
	glGetShaderiv(gVertexShaderObject,
                      GL_COMPILE_STATUS,
                      &iShaderCompileStatus);
                      
        if(iShaderCompileStatus==GL_FALSE)
        {
                glGetShaderiv(gVertexShaderObject,
                      GL_INFO_LOG_LENGTH,
                      &iInfoLogLength);
                if(iInfoLogLength>0)
                {
                        szInfoLog=(char*)malloc(sizeof(GLchar)*iInfoLogLength);
                        if(szInfoLog!=NULL)
                        {
                                GLsizei writtened;
                                glGetShaderInfoLog(gVertexShaderObject,
                                                   iInfoLogLength,
                                                   &writtened,
                                                   szInfoLog);
                               // fprintf(gpFile,"Vertex Shader error : %s",szInfoLog);
                                printf("\n\t\t Vertex Shader error : %s",szInfoLog);
                                free(szInfoLog);
                                uninitialize();
                        }
                }
        }
        //fragment shader
        gFragmentShaderObject=glCreateShader(GL_FRAGMENT_SHADER);
        const char *FragmentShaderSourceCode=
       "#version 410 core" \
		"\n" \
		"uniform vec4 lineColor;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{" \
		"		FragColor=lineColor;" \
		"}";
        
        glShaderSource(gFragmentShaderObject,1,(const char**)&FragmentShaderSourceCode,NULL);
        glCompileShader(gFragmentShaderObject);
        
        iShaderCompileStatus=0;
        iInfoLogLength=0;
        szInfoLog=NULL;
        glGetShaderiv(gFragmentShaderObject,
                      GL_COMPILE_STATUS,
                      &iShaderCompileStatus);
                      
        if(iShaderCompileStatus==GL_FALSE)
        {
                glGetShaderiv(gFragmentShaderObject,
                      GL_INFO_LOG_LENGTH,
                      &iInfoLogLength);
                if(iInfoLogLength>0)
                {
                        szInfoLog=(char*)malloc(sizeof(GLchar)*iInfoLogLength);
                        if(szInfoLog!=NULL)
                        {
                                GLsizei writtened;
                                glGetShaderInfoLog(gFragmentShaderObject,
                                                   iInfoLogLength,
                                                   &writtened,
                                                   szInfoLog);
                                //fprintf(gpFile,"Fragment Shader error : %s",szInfoLog);
                                printf("Fragment Shader error : %s",szInfoLog);
                                free(szInfoLog);
                                uninitialize();
                               // DestroyWindow();
                        }
                }
        }
        
        //create Shader program object
	gShaderProgramObject = glCreateProgram();

	//attach vertex/fragment shaders
	glAttachShader(gShaderProgramObject,
		gVertexShaderObject);
	glAttachShader(gShaderProgramObject,
		gTessellationControlShaderObject);
	glAttachShader(gShaderProgramObject,
		gTessellationEvaluationShaderObject);
	glAttachShader(gShaderProgramObject,
		gFragmentShaderObject);

	//prelinking binding to vertex attributes
	glBindAttribLocation(gShaderProgramObject,AMC_ATTRIBUTE_POSITION,"vPosition");

	//Link the shader program
	glLinkProgram(gShaderProgramObject);
	//ErrorCheck for linking

	GLint iProgramLinkStatus = 0;
	iInfoLogLength = 0;
	szInfoLog = NULL;

	glGetProgramiv(gShaderProgramObject,
		GL_LINK_STATUS,
		&iProgramLinkStatus);
	printf("Value of iProgramLinkStatus is : %d", iProgramLinkStatus);
	if (iProgramLinkStatus == GL_FALSE)
	{
		glGetProgramiv(gShaderProgramObject,
			GL_INFO_LOG_LENGTH,
			&iInfoLogLength);
		if (iInfoLogLength > 0)
		{
			szInfoLog = (GLchar*)malloc(iInfoLogLength);
			if (szInfoLog != NULL)
			{
				GLsizei writtened;
				glGetProgramInfoLog(gShaderProgramObject,
					iInfoLogLength,
					&writtened,
					szInfoLog);
				printf("Error in Linking Shader : %s", szInfoLog);
				free(szInfoLog);
				uninitialize();
				//DestroyWindow(ghHwnd);
			}
		}
	}

	//post linking retrieving uniform location
	mUniform = glGetUniformLocation(gShaderProgramObject, "u_m_matrix");
	vUniform = glGetUniformLocation(gShaderProgramObject, "u_v_matrix");
	pUniform = glGetUniformLocation(gShaderProgramObject, "u_p_matrix");
	gNumberOfSegmentsUniform= glGetUniformLocation(gShaderProgramObject, "numberOfSegments");
	gNumberOfStripsUniform= glGetUniformLocation(gShaderProgramObject, "numberOfStrips");
	gLineColorUniform= glGetUniformLocation(gShaderProgramObject, "lineColor");
	const GLfloat VCNTArray[] = {
		-1.0f,-1.0,-0.5f,1.0f,0.5f,-1.0f,1.0f,1.0f
	};
	//create vao
	glGenVertexArrays(1,&vao);
	glBindVertexArray(vao);
	glGenBuffers(1,&vbo);
	glBindBuffer(GL_ARRAY_BUFFER,vbo);
	glBufferData(GL_ARRAY_BUFFER,sizeof(VCNTArray),
				 VCNTArray,GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION,3,GL_FLOAT,GL_FALSE,0,NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER,0);
	glBindVertexArray(0);
	/////////////////////////////////////////////////////////
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	glClearDepth(1.0f);
	projectionMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	modelMatrix = mat4::identity();
	Resize(giWindowWidth,giWindowHeight);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	
}
void Resize(int width, int height)
{
	if (height == 0)
		height = 1;
	glViewport(0, 0, GLsizei(width), GLsizei(height));
	projectionMatrix=perspective(45.0f,
		(GLfloat)width / (GLfloat)height,
		0.1f,
		100.0f);
}
void display()
{
        printf("In display\n");
        //exit(0);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);

	//declaration of matrices
	mat4 translationMatrix;
	//initialize above to identity
	translationMatrix = mat4::identity();
	
	//do necessary transformation
	translationMatrix = translate(0.5f,0.5f,-2.0f);
	//scaleMatrix = scale(0.5f,0.5f,0.5f);
	modelMatrix = translationMatrix;
	//do necessary matrix multiplication
	

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
	glUniform1i(gNumberOfSegmentsUniform,gNumberOfLineSegments);

	//char* str[255];
	//wsprintf(str,"OpenGL PP Window : [Segments = %d ]",gNumberOfLineSegments);
	//SetWindowText(ghHwnd,str);
	glUniform1i(gNumberOfStripsUniform,1);
	glUniform4fv(gLineColorUniform,1,vmath::vec4(1.0,1.0,0.0,1.0));
	// *** bind vao ***
	glBindVertexArray(vao);
	
	//glPatchParameteri(GL_PATCH_VERTICES,4);
	glDrawArrays(GL_PATCHES, 0, 4);
	
	//unbind vao
	glBindVertexArray(0);

	//unuse program
	glUseProgram(0);
	glXSwapBuffers(gpDisplay,gWindow);
}

void ToggleFullscreen()
{
        Atom wm_state;
        Atom fullscreen;
        XEvent xev={0};
        
        wm_state=XInternAtom(gpDisplay,"_NET_WM_STATE",False);
        memset(&xev,0,sizeof(xev));
        
        xev.type=ClientMessage;
        xev.xclient.window=gWindow;
        xev.xclient.message_type=wm_state;
        xev.xclient.format=32;
        xev.xclient.data.l[0]=bFullscreen?0:1;
        
        fullscreen=XInternAtom(gpDisplay,"_NET_WM_STATE_FULLSCREEN",False);
        xev.xclient.data.l[1]=fullscreen;
        
        XSendEvent(gpDisplay,
                   RootWindow(gpDisplay,gpXVisualInfo->screen),
                   False,
                   StructureNotifyMask,
                   &xev);
}

void uninitialize(void)
{
        printf("in uni nit\n");
        GLXContext currentContext=glXGetCurrentContext();
        if(currentContext!=NULL && currentContext==gGLXContext)
        {
                glXMakeCurrent(gpDisplay,0,0);
        }
        if(gGLXContext)
        {
                glXDestroyContext(gpDisplay,gGLXContext);
        }
        if(gWindow)
        {
                XDestroyWindow(gpDisplay,gWindow);
        }        
        
        if(gColormap)
        {
                XFreeColormap(gpDisplay,gColormap);
        }
        
        if(gpXVisualInfo)
        {
                free(gpXVisualInfo);
                gpXVisualInfo=NULL;
        }
        
        if(gpDisplay)
        {
                XCloseDisplay(gpDisplay);
                gpDisplay=NULL;
        }
        if (vbo)
	    {
		    glDeleteBuffers(1, &vbo);
		    vbo = 0;
	    }
	    if (vao)
	    {
		    glDeleteBuffers(1, &vao);
		    vao = 0;
	    }
        //shaders
        GLsizei shaderCount, shaderNumber;
	if (gShaderProgramObject)
	{
		glUseProgram(gShaderProgramObject);
		glGetProgramiv(gShaderProgramObject, GL_ATTACHED_SHADERS, &shaderCount);
		GLuint* pShaders = (GLuint*)malloc(sizeof(GLuint*)*shaderCount);
		if (pShaders)
		{
			glGetAttachedShaders(gShaderProgramObject, shaderCount, &shaderCount, pShaders);
			for (shaderNumber = 0; shaderNumber < shaderCount; shaderNumber++)
			{
				glDetachShader(gShaderProgramObject, pShaders[shaderNumber]);
				pShaders[shaderNumber] = 0;
			}
			free(pShaders);
		}
		glDeleteProgram(gShaderProgramObject);
		gShaderProgramObject = 0;
		glUseProgram(0);
	}
}


