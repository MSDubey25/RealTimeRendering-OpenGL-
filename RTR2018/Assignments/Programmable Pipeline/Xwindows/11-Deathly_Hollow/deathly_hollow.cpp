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
static GLfloat angle_tri = 0.0f;
static GLfloat angle_rect = 0.0f;

static GLXContext gGLXContext;

GLint gVertexShaderObject;
GLint gFragmentShaderObject;
GLint gShaderProgramObject;

GLuint vao;
GLuint vbo_position;
GLuint vbo_color;
GLuint mvpUniform;
mat4 perspectiveProjectionMatrix;

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
       
       XStoreName(gpDisplay,gWindow,"Deathly Hollow");
       
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
        
        //vertex Shader
        gVertexShaderObject=glCreateShader(GL_VERTEX_SHADER);
        const char *vertexShaderSourceCode=
        "#version 130" \
		"\n" \
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
	glGenVertexArrays(1, &vao);
	glBindVertexArray(vao);
	glGenBuffers(1, &vbo_position);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position);
	glBufferData(GL_ARRAY_BUFFER, 1000 * 3 * sizeof(GL_FLOAT),
		NULL, GL_DYNAMIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	//for color
	glGenBuffers(1, &vbo_color);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_color);
	glBufferData(GL_ARRAY_BUFFER, 1000 * 3 * sizeof(GL_FLOAT),
		NULL, GL_DYNAMIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_COLOR, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_COLOR);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glBindVertexArray(0);
	/////////////////////////////////////////////////////////	
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
    static GLfloat angle = 0.0f;
	static GLfloat counter = 0.0f;
	bool flag = false;
	GLfloat ox, oy, radius, perimeter, a, b, c, semi, area;
	GLfloat x = 0.5f, y = 0.5f, Sx = 1.0f, Sy = 1.0f;
	GLfloat linesCoordinates[1000];
	GLfloat colorCoordinates[1000];
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);

	//declaration of matrices
	mat4 modelViewMatrix;
	mat4 modelViewProjectionMatrix;
	mat4 translationMatrix;
	mat4 rotationMatrix;
	//initialize above to identity
	modelViewMatrix = mat4::identity();
	modelViewProjectionMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	rotationMatrix = mat4::identity();
	//do necessary transformation
	translationMatrix = translate(-Sx + counter, -Sy + counter, -3.0f);
	modelViewMatrix = translationMatrix;
	//do necessary matrix multiplication
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);

	
	GLfloat linesCoordinates1[2000];
	GLfloat colorCoordinates1[2000];
	
		linesCoordinates[0] = 0.0f;
		linesCoordinates[1] = y;
		linesCoordinates[2] = 0.0f;
		linesCoordinates[3] = -x;
		linesCoordinates[4] = -y;
		linesCoordinates[5] = 0.0f;
		linesCoordinates[6] = x;
		linesCoordinates[7] = -y;
		linesCoordinates[8] = 0.0f;
		for (int i = 0; i < 9; i = i + 3)
		{
			colorCoordinates[i + 0] = 1.0f;
			colorCoordinates[i + 1] = 1.0f;
			colorCoordinates[i + 2] = 1.0f;
		}

		glBindBuffer(GL_ARRAY_BUFFER, vbo_position);
		glBufferData(GL_ARRAY_BUFFER, 9 * sizeof(float),
			linesCoordinates, GL_DYNAMIC_DRAW);
		glBindBuffer(GL_ARRAY_BUFFER, 0);

		glBindBuffer(GL_ARRAY_BUFFER, vbo_color);
		glBufferData(GL_ARRAY_BUFFER, 9 * sizeof(float),
			colorCoordinates, GL_DYNAMIC_DRAW);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
		glBindVertexArray(vao);
		glLineWidth(2.0f);
		glDrawArrays(GL_LINE_LOOP, 0, 3);
		glBindVertexArray(0);

		modelViewMatrix = mat4::identity();
		modelViewProjectionMatrix = mat4::identity();
		translationMatrix = mat4::identity();
		translationMatrix = translate(Sx - counter, -Sy + counter, -3.0f);
		rotationMatrix = rotate( 0.0f, angle, 0.0f);
		modelViewMatrix = modelViewMatrix*translationMatrix;
		modelViewMatrix = modelViewMatrix * rotationMatrix;
		//do necessary matrix multiplication
		modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

		//send necessary matrices to shaders in respective uniforms
		glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
		//incircle
		a = sqrtf((0.0f + x)*(0.0f + x) + (y + y)*(y + y));
		b = sqrtf((x + x)*(x + x) + (-y + y)*(-y + y));
		c = sqrtf((0.0f - x)*(0.0f - x) + (y + y)*(y + y));
		perimeter = a + b + c;
		semi = perimeter / 2;
		ox = (b*0.0f + c * (-x) + a * x) / perimeter;
		oy = (b*y + c * (-y) + a * (-y)) / perimeter;

		area = sqrtf(semi*(semi - a)*(semi - b)*(semi - c));

		radius = 2 * area / perimeter;
		for (int i = 0; i < 2000; i++)
		{
			
			GLfloat angle = 2 * i* M_PI / num;
			if (i % 3 == 0)
			{
				linesCoordinates1[i] = radius * cos(angle) + ox;
				colorCoordinates1[i] = 0.0f;
			}
			else if (i % 3 == 1)
			{
				linesCoordinates1[i] = radius * sin(angle) + oy;
				colorCoordinates1[i] = 1.0f;
			}
			else
			{
				linesCoordinates1[i] = 0.0f;
				colorCoordinates1[i] = 1.0f;
			}
		}
		glBindBuffer(GL_ARRAY_BUFFER, vbo_position);
		glBufferData(GL_ARRAY_BUFFER, sizeof(linesCoordinates1),
			linesCoordinates1, GL_DYNAMIC_DRAW);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
		glBindBuffer(GL_ARRAY_BUFFER, vbo_color);
		glBufferData(GL_ARRAY_BUFFER, sizeof(colorCoordinates1),
			colorCoordinates1, GL_DYNAMIC_DRAW);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
		glBindVertexArray(vao);
		glPointSize(2.0f);
		for (int i = 0; i < 998; i += 2)
		{
			glDrawArrays(GL_POINTS, i, i + 2);
		}
		glBindVertexArray(0);

		modelViewMatrix = mat4::identity();
		modelViewProjectionMatrix = mat4::identity();
		translationMatrix = mat4::identity();
		translationMatrix = translate(0.0f, Sy - counter, -3.0f);
		modelViewMatrix = modelViewMatrix * translationMatrix;
		//do necessary matrix multiplication
		modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

		//send necessary matrices to shaders in respective uniforms
		glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
		linesCoordinates[0] = 0.0f;
		linesCoordinates[1] = y;
		linesCoordinates[2] = 0.0f;
		linesCoordinates[3] = 0.0f;
		linesCoordinates[4] = -y;
		linesCoordinates[5] = 0.0f;
		
		for (int i = 0; i < 6; i = i + 3)
		{
			colorCoordinates[i + 0] = 1.0f;
			colorCoordinates[i + 1] = 1.0f;
			colorCoordinates[i + 2] = 1.0f;
		}

		glBindBuffer(GL_ARRAY_BUFFER, vbo_position);
		glBufferData(GL_ARRAY_BUFFER, 6 * sizeof(float),
			linesCoordinates, GL_DYNAMIC_DRAW);
		glBindBuffer(GL_ARRAY_BUFFER, 0);

		glBindBuffer(GL_ARRAY_BUFFER, vbo_color);
		glBufferData(GL_ARRAY_BUFFER, 6 * sizeof(float),
			colorCoordinates, GL_DYNAMIC_DRAW);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
		glBindVertexArray(vao);
		glLineWidth(2.0f);
		glDrawArrays(GL_LINES, 0, 6);
		glBindVertexArray(0);
		//unuse program
		glUseProgram(0);
		glXSwapBuffers(gpDisplay,gWindow);
		angle = angle + 2.0f;
		if (angle >= 360.0f)
			angle = 0.0f;

		if (counter <= 1.0f && flag == false && counter >= 0.0f)
			counter = counter + 0.011f;
		else
		{
			flag = true;
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
        if (vbo_position)
	    {
		    glDeleteBuffers(1, &vbo_position);
		    vbo_position = 0;
	    }
	    if (vbo_color)
	    {
		    glDeleteBuffers(1, &vbo_color);
		    vbo_color = 0;
	    }
	    if (vao)
	    {
		    glDeleteBuffers(1, &vao);
		    vao = 0;
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


