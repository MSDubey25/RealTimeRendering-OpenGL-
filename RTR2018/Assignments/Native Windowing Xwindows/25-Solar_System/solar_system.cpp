#include<iostream>
#include<stdio.h>
#include<stdlib.h>
#include<memory.h>

#include<X11/Xlib.h>
#include<X11/Xutil.h>
#include<X11/XKBlib.h>
#include<X11/keysym.h>

#include<GL/gl.h>
#include<GL/glu.h>
#include<GL/glx.h>

using namespace std;

//global declarations
bool bFullscreen=false;
Display *gpDisplay=NULL;
XVisualInfo *gpXVisualInfo=NULL;
Colormap gColormap;
Window gWindow;
int giWindowWidth=800;
int giWindowHeight=600;
char keys[26];
static GLfloat angle_tri = 0.0f;
static GLfloat angle_rect = 0.0f;

static GLXContext gGLXContext;

GLUquadric *quadric = NULL;
FILE *gpFile = NULL;
int year = 0;
int day = 0;
//entry point function
int main()
{

        void CreateWindow(void);
        void ToggleFullscreen(void);
        void uninitialize(void);
        void initialize(void);
        void Resize(int,int);
        void display(void);
        void update(void);
        
        int WinWidth=giWindowWidth;
        int WinHeight=giWindowHeight;
        gpFile=fopen("log.txt", "w");
        Bool bDone=false;
        if ( gpFile== 0)
	{
		exit(0);
	}
	else
	{
		fprintf(gpFile, "Log file is created\n");
		//fprintf();
	}
        CreateWindow();
        
        initialize();
        //Message Loop
        XEvent event;
        KeySym keysym;
        
        while(bDone==false)
        {
                while(XPending(gpDisplay))
                {
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
                                                case 'D':
			                                day = (day + 6) % 360;
			                                break;
		                                case 'd':
			                                day = (day - 6) % 360;
			                                break;
		                                case 'Y':
			                                year = (year + 3) % 360;
			                                break;
		                                case 'y':
			                                year = (year - 3) % 360;
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
                }
                  update();
                  display();
        }
        uninitialize();
        return(0);
}

void CreateWindow(void)
{
        void uninitialize(void);
        
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
        
        defaultScreen=XDefaultScreen(gpDisplay);
        
        defaultDepth=DefaultDepth(gpDisplay,defaultScreen);
        
        gpXVisualInfo=glXChooseVisual(gpDisplay,defaultScreen,frameBufferAttributes);
        if(gpXVisualInfo==NULL)
        {
                printf("ERROR : Unable to get XVisualInfo.\nExitting Now...\n");
                uninitialize();
                exit(1);
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
       
       XStoreName(gpDisplay,gWindow,"Two_2D_Shapes_Animation");
       
       Atom windowManagerDelete=XInternAtom(gpDisplay,"WM_DELETE_WINDOW",True);
       XSetWMProtocols(gpDisplay,gWindow,&windowManagerDelete,1);
       
       XMapWindow(gpDisplay,gWindow);
}
void initialize(void)
{
        void uninitialize(void);
        void Resize(int,int);

	gGLXContext=glXCreateContext(gpDisplay,gpXVisualInfo,NULL,GL_TRUE);
        glXMakeCurrent(gpDisplay,gWindow,gGLXContext);

	glShadeModel(GL_SMOOTH);
	
	Resize(giWindowWidth,giWindowHeight);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	glClearDepth(1.0f);
	
}
void Resize(int width, int height)
{
	if (height == 0)
		height = 1;
	glViewport(0, 0, GLsizei(width), GLsizei(height));
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(45.0f,
		(GLfloat)width/(GLfloat)height,
		0.1f,
		100.0f);
}
void display()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	gluLookAt(0.0f, 0.0f, 5.0f, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f, 0.0f);
	glPushMatrix(); //store original
	glRotatef(90.0f, 1.0f, 0.0f, 0.0f);//make z-axis of sphere as y
	glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
	quadric = gluNewQuadric();
	glColor3f(1.0f, 1.0f, 0.0f);
	gluSphere(quadric, 0.75f, 30, 30);
	glPopMatrix();//back to original

	glPushMatrix();//store original
	glRotatef(GLfloat(year), 0.0f, 1.0f, 0.0f);
	glTranslatef(1.5f, 0.0f, 0.0f);
	glRotatef(90.0f, 1.0f, 0.0f, 0.0f);
	glRotatef(GLfloat(day), 0.0f, 0.0f, 1.0f);
	glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
	quadric = gluNewQuadric();
	glColor3f(0.4f, 0.9f, 1.0f);
	gluSphere(quadric, 0.2f, 20, 20);
	
	glPushMatrix();
	glTranslatef(0.5f, 0.0f, 0.0f);
	glRotatef(90.0f, 1.0f, 0.0f, 0.0f);
	glRotatef(GLfloat(day), 0.0f, 0.0f, 1.0f);
	glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
	quadric = gluNewQuadric();
	glColor3f(1.0f, 1.0f, 1.0f);
	gluSphere(quadric, 0.05f, 20, 20);

	glPopMatrix();
	glPopMatrix();


	glXSwapBuffers(gpDisplay,gWindow);
}
void update()
{
	angle_tri += 0.2f;
	angle_rect -= 0.2f;
	if (angle_tri >= 360.0f)
		angle_tri = 0.0f;
	if (angle_rect <= -360.0f)
		angle_rect = 0.0f;
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
        if (gpFile)
	{
		fprintf(gpFile, "Log File is Closed\n========================================================================\n");
		fclose(gpFile);
		gpFile = NULL;
	}
}

