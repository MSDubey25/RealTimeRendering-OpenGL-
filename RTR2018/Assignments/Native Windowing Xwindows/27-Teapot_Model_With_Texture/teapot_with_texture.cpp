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
#include<SOIL/SOIL.h>
#include"OGL.h"

using namespace std;

//global declarations
bool bFullscreen=false;
bool bTexture = false;
Display *gpDisplay=NULL;
XVisualInfo *gpXVisualInfo=NULL;
Colormap gColormap;
Window gWindow;
int giWindowWidth=800;
int giWindowHeight=600;

FILE *gpFile = NULL;

char keys[26];
GLXContext gGLXContext=NULL;

static GLfloat angle_teapot = 0.0f;

GLuint texture_marble;

//for lights
bool bLights = false;
GLfloat LightAmbience[] = { 0.5f,0.5f,0.5f,1.0f };
GLfloat LightDiffuse[] = { 1.0f,1.0f,1.0f,1.0f };
GLfloat LightSpecular[] = {1.0f,1.0f,1.0f,1.0f};
GLfloat LightPosition[] = { 0.0f,0.0f,2.0f,1.0f };

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
        bool LoadTexture(GLuint *,const char *);
        
        int WinWidth=giWindowWidth;
        int WinHeight=giWindowHeight;
        
        Bool bDone=false;
        gpFile=fopen("log.txt", "w");
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
                                                case 'L':case 'l':
			                                if (bLights == false)
			                                {
				                                bLights = true;
				                                glEnable(GL_LIGHTING);
			                                }
			                                else
			                                {
				                                bLights = false;
				                                glDisable(GL_LIGHTING);
			                                }

			                                break;
	                                        case 'T':case 't':
			                        if (bTexture == false)
			                        {
				                        bTexture = true;
				                        glEnable(GL_TEXTURE_2D);
				                        LoadTexture(&texture_marble, "marble.bmp");
			                        }
			                        else
			                        {
				                        bTexture = false;
				                        glDisable(GL_TEXTURE);
				                        
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
       
       XStoreName(gpDisplay,gWindow,"Teapot With Texture");
       
       Atom windowManagerDelete=XInternAtom(gpDisplay,"WM_DELETE_WINDOW",True);
       XSetWMProtocols(gpDisplay,gWindow,&windowManagerDelete,1);
       
       XMapWindow(gpDisplay,gWindow);
}
void initialize(void)
{
        void uninitialize(void);
        void Resize(int,int);
        bool LoadTexture(GLuint *,const char *);

	gGLXContext=glXCreateContext(gpDisplay,gpXVisualInfo,NULL,GL_TRUE);
        glXMakeCurrent(gpDisplay,gWindow,gGLXContext);

	glShadeModel(GL_SMOOTH);
	
	Resize(giWindowWidth,giWindowHeight);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
//	glEnable(GL_AUTO_NORMAL);
	//glEnable(GL_NORMALIZE);

	glLightfv(GL_LIGHT0, GL_AMBIENT, LightAmbience);
	glLightfv(GL_LIGHT0, GL_DIFFUSE, LightDiffuse);
	glLightfv(GL_LIGHT0, GL_POSITION, LightPosition);
	glEnable(GL_LIGHT0);
	glEnable(GL_TEXTURE_2D);
	
}
void Resize(int width, int height)
{
	if (height == 0)
		height = 1;
	glViewport(0, 0, GLsizei(width), GLsizei(height));
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(45.0f,
		(GLfloat)width / (GLfloat)height,
		0.1f,
		100.0f);
}
void display()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(0.0f, 0.0f, -1.5f);
	glRotatef(-90.0f, 0.0f, 1.0f, 0.0f);
	glRotatef(angle_teapot, 0.0f, 1.0f, 0.0f);
	if (bTexture == false)
	{
		glBindTexture(GL_TEXTURE_2D, texture_marble);
	}
	else
	{
		glBindTexture(GL_TEXTURE_2D, 0);
	}
	glBegin(GL_TRIANGLES);
	for (int i = 0; i < sizeof(face_indicies) / sizeof(face_indicies[0]); i++)
	{
		for (int j = 0; j < 3; j++)
		{
			int vi = face_indicies[i][j];
			int ni = face_indicies[i][j + 3];
			int ti = face_indicies[i][j + 6];
			glTexCoord2f(textures[ti][0],textures[ti][1]);
			glNormal3f(normals[ni][0],normals[ni][1], normals[ni][2]);
			glVertex3f(vertices[vi][0], vertices[vi][1], vertices[vi][2]);
		}
	}
	glEnd();
	glXSwapBuffers(gpDisplay,gWindow);
}
void update()
{
	angle_teapot += 0.5f;
	if (angle_teapot >= 360.0f)
		angle_teapot = 0.0f;
}

bool LoadTexture(GLuint *texture,const char *path)
{
        bool bResult=false;
        int width;
        int height;
        unsigned char *imagedata=NULL;
        imagedata=SOIL_load_image(path,&width,&height,0,SOIL_LOAD_RGB);
        if(imagedata==NULL)
        {
                bResult=false;
                return bResult;
        }
        else
        {
                bResult=true;
        }
        glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
	glGenTextures(1, texture);
	glBindTexture(GL_TEXTURE_2D, *texture);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
	gluBuild2DMipmaps(GL_TEXTURE_2D,3,width,height,
					GL_RGB,GL_UNSIGNED_BYTE,imagedata);
	SOIL_free_image_data(imagedata);
	return bResult;
        
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


