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
#define num 2000;
//#define _USE_MATH_DEFINES 1;
#include<math.h>

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

static GLXContext gGLXContext;

static GLfloat angle_tri = 0.0f;
static GLfloat angle_rect = 0.0f;

GLint gVertexShaderObject;
GLint gFragmentShaderObject;
GLint gShaderProgramObject;

GLuint vao_letters;
GLuint vao_rectangle;
GLuint vbo_position_letters;
GLuint vbo_position_rectangle;
GLuint vbo_color_letters;
GLuint mvpUniform;
mat4 perspectiveProjectionMatrix;

GLfloat counter1;
    GLfloat counter2;
    GLfloat counter3;
    GLfloat counter4;
    GLfloat counterP1;
    GLfloat xTranslate;
    GLfloat timer;
    
    GLfloat Cr, Cg, Cb;
    GLfloat Gr, Gg, Gb;
    
    bool flagI1;
    bool flagA;
    bool flagN;
    bool flagI2;
    bool flagD;
    

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
       
       XStoreName(gpDisplay,gWindow,"Dynamic India");
       
       Atom windowManagerDelete=XInternAtom(gpDisplay,"WM_DELETE_WINDOW",True);
       XSetWMProtocols(gpDisplay,gWindow,&windowManagerDelete,1);
       
       XMapWindow(gpDisplay,gWindow);
       printf("In createw\n");
}
void initialize(void)
{
    counter1=0.0f;
    counter2=0.0f;
    counter3=0.0f;
    counter4=0.0f;
    counterP1=0.0f;
    xTranslate=0.0f;
    timer=0.0f;
    
    Cr=0.0f;
    Cg=0.0f;
    Cb=0.0f;
    Gr=0.0f;
    Gg=0.0f;
    Gb=0.0f;
    
    flagI1=false;
    flagA=false;
    flagN=false;
    flagI2=false;
    flagD=false;
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
        
        //vertex Shader
        gVertexShaderObject=glCreateShader(GL_VERTEX_SHADER);
        const char *vertexShaderSourceCode=
        "#version 130" \
		"\n" \
		"in vec4 vPosition;" \
		"in vec4 vColor;" \
		"out vec4 out_vColor;" \
		"uniform mat4 u_mvp_matrix;" \
		"void main(void)" \
		"{" \
		"gl_Position=u_mvp_matrix * vPosition;" \
		"out_vColor=vColor;" \
		"}";
		
        glShaderSource(gVertexShaderObject,1,(const char**)&vertexShaderSourceCode,NULL);
        glCompileShader(gVertexShaderObject);
        
        GLint iShaderCompileStatus=0;
        GLint iInfoLogLength=0;
        char *szInfoLog=NULL;
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
        "#version 130" \
		"\n" \
		"in vec4 out_vColor;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{" \
		"FragColor=out_vColor;" \
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
		gFragmentShaderObject);

	//prelinking binding to vertex attributes
	glBindAttribLocation(gShaderProgramObject,AMC_ATTRIBUTE_POSITION,"vPosition");
	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_COLOR, "vColor");

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
	mvpUniform = glGetUniformLocation(gShaderProgramObject,"u_mvp_matrix");

   	//create vao
	glGenVertexArrays(1, &vao_letters);
	glBindVertexArray(vao_letters);
	glGenBuffers(1, &vbo_position_letters);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
	glBufferData(GL_ARRAY_BUFFER, 500*3*4*sizeof(GLfloat),
		NULL, GL_DYNAMIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	//for color
	glGenBuffers(1, &vbo_color_letters);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
	glBufferData(GL_ARRAY_BUFFER, 500 * 3 * 4 * sizeof(GLfloat),
		NULL, GL_DYNAMIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_COLOR, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_COLOR);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glBindVertexArray(0);
	////////////////////////////////////////////////////////
	
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	glClearDepth(1.0f);
	Resize(giWindowWidth,giWindowHeight);
	perspectiveProjectionMatrix = mat4::identity();
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	
}
void Resize(int width, int height)
{
		if (height == 0)
		height = 1;
	glViewport(0, 0, GLsizei(width), GLsizei(height));
	perspectiveProjectionMatrix=perspective(45.0f,
		(GLfloat)width / (GLfloat)height,
		0.1f,
		100.0f);
}
void display()
{
        printf("In display\n");
        const GLfloat IVertices[] = {
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
	const GLfloat NVertices[] = {
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
	const GLfloat DVertices[] = {
	-0.0f, 0.75f ,0.0,  //for D
	-0.60f, 0.75f ,0.0,	//for D
	-0.60f, -0.75f ,0.0,//for D
	0.0f, -0.75f ,0.0,	//for D
	-0.15f, 0.60f ,0.0,	//for D
	-0.35f, 0.60f ,0.0,	//for D
	-0.35f, -0.60f,0.0,	//for D
	-0.15f, -0.60f,0.0,	//for D
	-0.5f, 0.60f,0.0,	//for D
	-0.60f, 0.60f,0.0,	//for D
	-0.60f, -0.60f,0.0,	//for D
	-0.5f, -0.60f,0.0	//for D

	};
	const GLfloat AVertices[] = {
	1.25f, 0.75f,0.0, //A
		1.1f, 0.75f,0.0,  //A
		0.9f, -0.75f,0.0, //A
		1.55f, -0.75f,0.0,//A
		1.18f, 0.5f,0.0,//triangle A
		1.05f, -0.75f,0.0,
		1.40f, -0.75f,0.0

	};
	const GLfloat FlagVertices[] = {
		0.057f, 0.0f,0.0, 
		0.203f, 0.0f,0.0, 
		0.205f, -0.05f,0.0, 
		0.045f, -0.05f,0.0,
		0.057f, 0.0f ,0.0,
		0.2029f, 0.0f,0.0,
		0.195f, 0.05f,0.0,
		 0.065f, 0.05f,0.0f
	};
	

	const GLfloat IColor[] = {
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
	const GLfloat NColor[] = {
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
	const GLfloat DColor[] = {
	 Cr, Cg, Cb ,     //for D
        Cr, Cg, Cb ,     //for D
        Gr, Gg, Gb , //for D
        Gr, Gg, Gb , //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f ,		 //for D
	0.0f, 0.0f, 0.0f //for D
	};
	const GLfloat AColor[] = {
	1.0f, 0.6f, 0.2f,      //A
	1.0f, 0.6f, 0.2f,	   //A
	0.071f, 0.533f, 0.027f,//A
	0.071f, 0.533f, 0.027f,//A
	0.0f, 0.0f, 0.0f,	   //A
	0.0f, 0.0f, 0.0f,	   //A
	0.0f, 0.0f, 0.0f	   //A
	};

	const GLfloat FlagColor[] = {
	1.0f, 1.0f, 1.0f,
	1.0f, 1.0f, 1.0f,
	0.071f, 0.533f, 0.027f,
	0.071f, 0.533f, 0.027f,
	1.0f, 1.0f, 1.0f,
	1.0f, 1.0f, 1.0f,
	1.0f, 0.6f, 0.2f,
	1.0f, 0.6f, 0.2f
	};
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);
	
	//declaration of matrices
	mat4 modelViewMatrix;
	mat4 modelViewProjectionMatrix;
	mat4 translationMatrix;
	mat4 scaleMatrix;

	
	//initialize above to identity
	modelViewMatrix = mat4::identity();
	modelViewProjectionMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	scaleMatrix = mat4::identity();
	//do necessary transformation
	translationMatrix = translate(-2.0f+counter1,0.0f,-3.0f);
	scaleMatrix=scale(0.8f, 0.9f, 0.0f);
	modelViewMatrix = translationMatrix*scaleMatrix;
	//do necessary matrix multiplication
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);

	//similarly bind with textures if any
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(IVertices),
		IVertices, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(IColor),
		IColor, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	//bind with vao
	glBindVertexArray(vao_letters);
	//draw necessary scene
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
	//unbind vao
	glBindVertexArray(0);

    modelViewMatrix = mat4::identity();	
	translationMatrix = translate(0.2f, 6.5f-counter3, -3.0f);
	modelViewMatrix = translationMatrix*scaleMatrix*modelViewMatrix;
	//do necessary matrix multiplication
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(NVertices),
		NVertices, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(NColor),
		NColor, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	//bind with vao
	glBindVertexArray(vao_letters);
	//draw necessary scene
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
	//unbind vao
	glBindVertexArray(0);

    modelViewMatrix = mat4::identity();
	translationMatrix = translate(0.25f, 0.0f, -3.0f);
	modelViewMatrix = translationMatrix *scaleMatrix* modelViewMatrix;
	//do necessary matrix multiplication
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(DVertices),
		DVertices, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(DColor),
		DColor, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	//bind with vao
	glBindVertexArray(vao_letters);
	//draw necessary scene
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
	//unbind vao
	glBindVertexArray(0);
    modelViewMatrix = mat4::identity();
	translationMatrix = translate(1.85f, -2.5f+counter4, -3.0f);
	modelViewMatrix = translationMatrix*scaleMatrix * modelViewMatrix;
	//do necessary matrix multiplication
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(IVertices),
		IVertices, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(IColor),
		IColor, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	//bind with vao
	glBindVertexArray(vao_letters);
	//draw necessary scene
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
	//unbind vao
	glBindVertexArray(0);
	modelViewMatrix = mat4::identity();
	translationMatrix = translate(2.15f - counter2, 0.0f, -3.0f);
	modelViewMatrix = translationMatrix * scaleMatrix*modelViewMatrix;
	//do necessary matrix multiplication
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(AVertices),
		AVertices, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(AColor),
		AColor, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	//bind with vao
	glBindVertexArray(vao_letters);
	//draw necessary scene
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDrawArrays(GL_TRIANGLES, 4, 3);
	//glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
	//unbind vao
	glBindVertexArray(0);
	
	
	
	GLfloat circle[1000];
	GLfloat circleColor[1000];
	for (int i = 0; i < 998; i=i+3)
	{
		GLfloat angle = 2 * M_PI*i / num;
		circle[i] = 0.01f*cos(angle);
		circle[i+1] = 0.01f*sin(angle);
		circle[i+2] = 0.0f;
		circleColor[i] = 0.0f;
		circleColor[i+1] = 0.0f;
		circleColor[i+2] = 1.0f;
	}
	if(flagD==true && Gg >= 0.027 && Gg >= 0.533f && Gr >= 0.071f)
    {
        modelViewMatrix = mat4::identity();
	translationMatrix = translate(1.13f, 0.0f, -3.0f);
	modelViewMatrix = translationMatrix * scaleMatrix*modelViewMatrix;
	//do necessary matrix multiplication
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(FlagVertices),
		FlagVertices, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(FlagColor),
		FlagColor, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	//bind with vao
	glBindVertexArray(vao_letters);
	//draw necessary scene
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
	//unbind vao
	glBindVertexArray(0);
    
        modelViewMatrix = mat4::identity();
	translationMatrix = translate(1.23f, 0.0f, -3.0f);
	modelViewMatrix = translationMatrix *modelViewMatrix;
	//do necessary matrix multiplication
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(circle),
		circle, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
	glBufferData(GL_ARRAY_BUFFER, sizeof(circleColor),
		circleColor, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	//bind with vao
	glBindVertexArray(vao_letters);
	//draw necessary scene
	//glPointSize(2.0f);
	for (int i = 0; i < 998; i += 2)
	{
		glDrawArrays(GL_POINTS, i, i + 2);
	}
	//unbind vao
	glBindVertexArray(0);


    }
		//unuse program
	glUseProgram(0);
	glXSwapBuffers(gpDisplay,gWindow);
	if (counter1 <= 2.0f && flagI1 == false)
    {
        counter1 = counter1 + 0.025f;
    }
    else
    {
        flagI1 = true;
    }
    if (counter2 <= 1.85f && flagI1 == true)
    {
        counter2 = counter2 + 0.025f;
    }
    else
    {
        flagA = true;
    }
    if (counter3 <= 6.5f &&  flagA==true)
    {
        counter3 = counter3 + 0.025f;
    }
    else
    {
        flagN = true;
    }
    if (counter4 <= 2.5f &&  flagN == true)
    {
        counter4 = counter4 + 0.025f;
    }
    else
    {
        flagI2 = true;
    }
    if (counter4>=2.5f)
    {
        if(Cr<=1.0f)
            Cr = Cr + 0.025f;
        if(Cg<=0.6f)
            Cg = Cg + 0.025f;
        if(Cb<=0.2)
            Cb = Cb + 0.025f;
        if (Gr <= 0.071f)
            Gr = Gr + 0.0025f;
        if (Gg <= 0.533f)
            Gg = Gg + 0.0025f;
        if (Gb <= 0.027)
            Gb = Gb + 0.0025f;
    }
    else
    {
        flagD = true;
    }
    if (counterP1 <= 2.9f &&   Cr > 0.99f && Gg > 0.472f)
    {
        if (xTranslate <= 1.25f)
        {
            counterP1 = counterP1 + 0.00007f;
            xTranslate += 0.00007f;
        }
        else if (xTranslate >= 1.25f && xTranslate<=2.09f)
        {
            xTranslate += 0.00007f;
        }
        else
        {
            //counterP1 = counterP1 + 0.0001f;
            timer += 0.00007f;
        }
        if (timer >= 1.92f)
        {
            counterP1 = counterP1 + 0.0001f;
            
        }
    }	
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
        if (vbo_position_letters)
	{
		glDeleteBuffers(1, &vbo_position_letters);
		vbo_position_letters = 0;
	}
	if (vao_letters)
	{
		glDeleteBuffers(1, &vao_letters);
		vao_letters = 0;
	}
	if (vbo_position_rectangle)
	{
		glDeleteBuffers(1, &vbo_position_rectangle);
		vbo_position_rectangle = 0;
	}
	if (vao_rectangle)
	{
		glDeleteBuffers(1, &vao_rectangle);
		vao_rectangle = 0;
	}
        //shaders
        glUseProgram(gShaderProgramObject);
        
        glDetachShader(gShaderProgramObject,GL_FRAME_NV);
        glDetachShader(gShaderProgramObject,GLU_VERTEX);
        glDetachShader(gFragmentShaderObject,GL_FRAME_NV);       
        gFragmentShaderObject=0;
        glDetachShader(gVertexShaderObject,GLU_VERTEX);       
        gVertexShaderObject=0;
        glDeleteProgram(gShaderProgramObject);
        gShaderProgramObject=0;
        glUseProgram(0);
}


