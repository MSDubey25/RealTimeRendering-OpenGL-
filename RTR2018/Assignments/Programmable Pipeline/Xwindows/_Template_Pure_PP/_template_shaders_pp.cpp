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

typedef GLXContext (*glXCreateContextAttribsARBProc)(Display *,GLXFBConfig,GLXContext,Bool,const int *);

using namespace std;
using namespace vmath;
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
glXCreateContextAttribsARBProc glXCreateContextAttribsARB=NULL;
GLXFBConfig gGLXFBConfig;

static GLXContext gGLXContext;

GLint gVertexShaderObject;
GLint gFragmentShaderObject;
GLint gShaderProgramObject;

GLuint mvpUniform;

enum 
{
    AMC_ATTRIBUTE_POSITION=0
};

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
        GLXFBConfig *pGLXFBConfig=NULL;
        GLXFBConfig bestGLXFBConfig;
        XVisualInfo *pTempXVisualInfo=NULL;
        int iNumberOfFBConfigs=0;
        
        printf("in cretae tar\n");
        void uninitialize(void);
        printf("\nIn CreateWindow\n");
        XSetWindowAttributes winAttribs;
        int defaultScreen;
        int defaultDepth;
        int styleMask;
        
        static int frameBufferAttributes[]={GLX_X_RENDERABLE,True,
                                            GLX_DRAWABLE_TYPE,GLX_WINDOW_BIT,
                                            GLX_RENDER_TYPE,GLX_RGBA_BIT,
                                            GLX_X_VISUAL_TYPE,GLX_TRUE_COLOR,
                                            GLX_RED_SIZE,8,
                                            GLX_GREEN_SIZE,8,
                                            GLX_BLUE_SIZE,8,
                                            GLX_ALPHA_SIZE,8,
                                            GLX_DEPTH_SIZE,24,
                                            GLX_STENCIL_SIZE,8,
                                            GLX_DOUBLEBUFFER,True,
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
        
        pGLXFBConfig=glXChooseFBConfig(gpDisplay,defaultScreen,frameBufferAttributes,&iNumberOfFBConfigs);
        printf("there are %d no of matchinf FBConfigs :",iNumberOfFBConfigs);
        printf("\n");
        
        int bestFrameBufferConfig=-1;
        int bestNumberOfSamples=-1;
        int worstFrameBufferConfig=-1;
        int worstNumberOfSamples=999;
        
        for(int i=0;i<iNumberOfFBConfigs;i++)
        {
            pTempXVisualInfo=glXGetVisualFromFBConfig(gpDisplay,pGLXFBConfig[i]);
            if(pTempXVisualInfo)
            {
                int sampleBuffers,samples;
                glXGetFBConfigAttrib(gpDisplay,pGLXFBConfig[i],GLX_SAMPLE_BUFFERS,&sampleBuffers);
                glXGetFBConfigAttrib(gpDisplay,pGLXFBConfig[i],GLX_SAMPLES,&samples);
                if(bestFrameBufferConfig<0 ||sampleBuffers && samples >bestNumberOfSamples)
                {
                    bestFrameBufferConfig=i;
                    bestNumberOfSamples=samples;
                }
                if(worstFrameBufferConfig<0 || !sampleBuffers || samples < worstNumberOfSamples)
                {
                    worstFrameBufferConfig=i;
                    worstNumberOfSamples=samples;
                }
            }
            XFree(pTempXVisualInfo);
                       
        }
        bestGLXFBConfig=pGLXFBConfig[bestFrameBufferConfig];
        gGLXFBConfig=bestGLXFBConfig;
        XFree(pGLXFBConfig);
        gpXVisualInfo=glXGetVisualFromFBConfig(gpDisplay,bestGLXFBConfig);
        
        //gpXVisualInfo=glXChooseVisual(gpDisplay,defaultScreen,frameBufferAttributes);
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
       
       XStoreName(gpDisplay,gWindow,"First Programmable Pipeline Window");
       
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
        
        glXCreateContextAttribsARB=(glXCreateContextAttribsARBProc)glXGetProcAddressARB((GLubyte *)"glXCreateContextAttribsARB");
        if(glXCreateContextAttribsARB==NULL)
        {
            printf("NO Native Driver");
            uninitialize();
            exit(1);
        }
        GLint Attribs[]={
                        GLX_CONTEXT_MAJOR_VERSION_ARB,3,
                        GLX_CONTEXT_MINOR_VERSION_ARB,3,
                        GLX_CONTEXT_PROFILE_MASK_ARB,GLX_CONTEXT_CORE_PROFILE_BIT_ARB,
                        0
                        };
        gGLXContext=glXCreateContextAttribsARB(gpDisplay,gGLXFBConfig,0,True,Attribs);
        if(!gGLXContext)
        {
            GLint Attribs[]={
                        GLX_CONTEXT_MAJOR_VERSION_ARB,1,
                        GLX_CONTEXT_MINOR_VERSION_ARB,0,
                        0
                        };
        gGLXContext=glXCreateContextAttribsARB(gpDisplay,gGLXFBConfig,0,True,Attribs);
        }
        if(!glXIsDirect(gpDisplay,gGLXContext))
        {
            printf("The obtained context is not H/W rendering context");
        }
        else
        {
                        //printf("major version :%d \n",glGetString(GLX_CONTEXT_MAJOR_VERSION_ARB));
                        //printf("minor version :%d \n",glGetString(GLX_CONTEXT_MINOR_VERSION_ARB));
                        printf("The obtained context is H/W rendering context");
        }
	    //gGLXContext=glXCreateContext(gpDisplay,gpXVisualInfo,NULL,GL_TRUE);
        glXMakeCurrent(gpDisplay,gWindow,gGLXContext);

        result=glewInit();
        if(result!=GLEW_OK)
        {
                uninitialize();
                exit(1);
        }
        
        
        //vertex Shader
        gVertexShaderObject=glCreateShader(GL_VERTEX_SHADER);
        const char *vertexShaderSourceCode=
        "#version 130" \
        "\n" \
        "in vec4 vPosition;" \
        "uniform mat4 u_mvp_matrix;" \
        "void main(void)" \
        "{" \
        "gl_Position=u_mvp_matrix * vPosition;" \
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
                        szInfoLog=(char*)malloc(iInfoLogLength);
                        if(szInfoLog!=NULL)
                        {
                                GLsizei writtened;
                                glGetShaderInfoLog(gVertexShaderObject,
                                                   iInfoLogLength,
                                                   &writtened,
                                                   szInfoLog);
                               // fprintf(gpFile,"Vertex Shader error : %s",szInfoLog);
                                 printf("Vertex Shader error : %s",szInfoLog);
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
        "void main(void)" \
        "{" \
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
                        szInfoLog=(char*)malloc(iInfoLogLength);
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
        
        gShaderProgramObject=glCreateProgram();
        glAttachShader(gShaderProgramObject,gVertexShaderObject);
        glAttachShader(gShaderProgramObject,gFragmentShaderObject);
                
        glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_POSITION, "vPosition");        
                
        glLinkProgram(gShaderProgramObject);
        //error check for linking of shaders
        
        GLint iProgramLinkStatus=0;
        iInfoLogLength=0;
        szInfoLog=NULL;
        glGetProgramiv(gShaderProgramObject,
                      GL_LINK_STATUS,
                      &iProgramLinkStatus);
                      
        if(iProgramLinkStatus==GL_FALSE)
        {
                glGetProgramiv(gShaderProgramObject,
                      GL_INFO_LOG_LENGTH,
                      &iInfoLogLength);
                if(iInfoLogLength>0)
                {
                        szInfoLog=(char*)malloc(iInfoLogLength);
                        if(szInfoLog!=NULL)
                        {
                                GLsizei writtened;
                                glGetProgramInfoLog(gShaderProgramObject,
                                                   iInfoLogLength,
                                                   &writtened,
                                                   szInfoLog);
                                printf("Program Link error : %s",szInfoLog);
                                free(szInfoLog);
                                uninitialize();
                                //DestroyWindow();
                        }
                }
        }
        
        mvpUniform = glGetUniformLocation(gShaderProgramObject, "u_mvp_matrix");
        
	glClearColor(0.0f, 0.0f, 1.0f, 1.0f);
	glClearDepth(1.0f);
	Resize(giWindowWidth,giWindowHeight);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	
}
void Resize(int width, int height)
{
	if (height == 0)
		height = 1;
	glViewport(0, 0, GLsizei(width), GLsizei(height));
}
void display()
{
        printf("In display\n");
        //exit(0);
        
     mat4 modelViewProjectionMatrix=mat4::identity();   
        
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);
	
	glUniformMatrix4fv(mvpUniform,1,GL_FALSE,modelViewProjectionMatrix);
	
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
       // XFree(gGLXFBConfig);
}


