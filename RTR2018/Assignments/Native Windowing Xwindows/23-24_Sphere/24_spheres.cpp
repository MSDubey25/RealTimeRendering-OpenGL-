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

using namespace std;

//global declarations
bool bFullscreen=false;
Display *gpDisplay=NULL;
XVisualInfo *gpXVisualInfo=NULL;
Colormap gColormap;
Window gWindow;
int giWindowWidth=800;
int giWindowHeight=600;

FILE *gpFile = NULL;

char keys[26];
GLXContext gGLXContext=NULL;

static GLfloat angleOfXRotation = 0.0f;
static GLfloat angleOfYRotation = 0.0f;
static GLfloat angleOfZRotation = 0.0f;

//for lights
bool bLights = false;
GLfloat LightAmbience[] = { 0.0f,0.0f,0.0f,1.0f };
GLfloat LightDiffuse[] = { 1.0f,1.0f,1.0f,1.0f };
GLfloat LightPosition[] = { 0.0f,0.0f,0.0f,1.0f };

GLUquadric *quadric[24];
GLuint keyPress = 0;
GLfloat Light_Model_Ambient[] = { 0.2f,0.2f,0.2f,1.0f };
GLfloat Light_Model_Local_Viewer[] = {0.0f};

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
	                                        case 'X':case 'x':
			                                keyPress = 1;
			                                angleOfXRotation = 0.0f;
			                                break;
		                                case 'Y':case 'y':
			                                keyPress = 2;
			                                angleOfYRotation = 0.0f;
			                                break;
		                                case 'Z':case 'z':
			                                keyPress = 3;
			                                angleOfZRotation = 0.0f;
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
       
       XStoreName(gpDisplay,gWindow,"24 Sphere");
       
       Atom windowManagerDelete=XInternAtom(gpDisplay,"WM_DELETE_WINDOW",True);
       XSetWMProtocols(gpDisplay,gWindow,&windowManagerDelete,1);
       
       XMapWindow(gpDisplay,gWindow);
}
void initialize(void)
{
        void uninitialize(void);
        void Resize(int,int);
        //bool LoadTexture(GLuint *,const char *);

	gGLXContext=glXCreateContext(gpDisplay,gpXVisualInfo,NULL,GL_TRUE);
        glXMakeCurrent(gpDisplay,gWindow,gGLXContext);

	glShadeModel(GL_SMOOTH);
	
	Resize(giWindowWidth,giWindowHeight);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);
	glClearColor(0.25f, 0.25f, 0.25f, 1.0f);
	glEnable(GL_AUTO_NORMAL);
	glEnable(GL_NORMALIZE);

	glLightfv(GL_LIGHT0, GL_AMBIENT, LightAmbience);
	glLightfv(GL_LIGHT0, GL_DIFFUSE, LightDiffuse);
	glLightfv(GL_LIGHT0, GL_POSITION, LightPosition);

	glLightModelfv(GL_LIGHT_MODEL_AMBIENT,Light_Model_Ambient);
	glLightModelfv(GL_LIGHT_MODEL_LOCAL_VIEWER,Light_Model_Local_Viewer);
	glEnable(GL_LIGHT0);

	for (int i = 0; i < 24; i++)
	{
		quadric[i] = gluNewQuadric();
	}
	glClearDepth(1.0f);
	glEnable(GL_TEXTURE_2D);
	
}
void Resize(int width, int height)
{
	if (height == 0)
		height = 1;

	glViewport(0, 0, GLsizei(width), GLsizei(height));

	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();

	if (width <= height)
	{
		glOrtho(0.0f,
			15.5f,
			0.0f,
			(15.5f*(GLfloat)height / (GLfloat)width),
			-10.0f,
			10.0f);
	}
	else
	{
		glOrtho(0.0f,
			(15.5f*(GLfloat)width / (GLfloat)height),
			0.0f,
			15.5f,
			-10.0f,
			10.0f);
	}
}
void display()
{
	void draw24Sphere();
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	//glTranslatef(0.0f, 0.0f, -0.7f);
	
	if (keyPress == 1)
	{
		glRotatef(angleOfXRotation, 1.0f, 0.0f, 0.0f);
		LightPosition[1] =angleOfXRotation;		
	}
	else if(keyPress==2)
	{
		glRotatef(angleOfYRotation, 0.0f, 1.0f, 0.0f);
		LightPosition[2] = angleOfYRotation;
	}
	else if(keyPress==3)
	{
		glRotatef(angleOfZRotation, 0.0f, 0.0f, 1.0f);
		LightPosition[0] = angleOfZRotation;
	}
	glLightfv(GL_LIGHT0, GL_POSITION, LightPosition);
	draw24Sphere();
	glXSwapBuffers(gpDisplay,gWindow);
}
void draw24Sphere()
{
	GLfloat MaterialAmbience[4];
	GLfloat MaterialDiffuse[4];
	GLfloat MaterialSpecular[4];
	GLfloat MaterialShininess[1];
	glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
	//1st sphere on 1st column Emerald
	MaterialAmbience[0] = 0.0215f;
	MaterialAmbience[1] = 0.1745f;
	MaterialAmbience[2] = 0.0215f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);
	
	MaterialDiffuse[0] = 0.7568f;
	MaterialDiffuse[1] = 0.61424f;
	MaterialDiffuse[2] = 0.07568f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.633f;
	MaterialSpecular[1] = 0.727811f;
	MaterialSpecular[2] = 0.633f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.6*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(1.5f,14.0f,0.0f);
	gluSphere(quadric[0],1.0,30,30);
	
	//2nd sphere on 1st column Jade
	MaterialAmbience[0] = 0.135f;
	MaterialAmbience[1] = 0.2225f;
	MaterialAmbience[2] = 0.1575f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.54f;
	MaterialDiffuse[1] = 0.89f;
	MaterialDiffuse[2] = 0.63f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.316228f;
	MaterialSpecular[1] = 0.316228f;
	MaterialSpecular[2] = 0.316228f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.1*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(1.5f, 11.5f, 0.0f);
	gluSphere(quadric[1], 1.0, 30, 30);
	
	//3rd sphere on 1st column Obsidien
	MaterialAmbience[0] = 0.05375f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.06625f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.18275f;
	MaterialDiffuse[1] = 0.17f;
	MaterialDiffuse[2] = 0.22525f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.332741f;
	MaterialSpecular[1] = 0.328634f;
	MaterialSpecular[2] = 0.346435f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.3*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(1.5f, 9.0f, 0.0f);
	gluSphere(quadric[2], 1.0, 30, 30);

	//4th sphere on 1st column Pearl
	MaterialAmbience[0] = 0.25f;
	MaterialAmbience[1] = 0.20725f;
	MaterialAmbience[2] = 0.20725f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 1.0f;
	MaterialDiffuse[1] = 0.829f;
	MaterialDiffuse[2] = 0.829f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.296648f;
	MaterialSpecular[1] = 0.296648f;
	MaterialSpecular[2] = 0.296648f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.088*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(1.5f, 6.5f, 0.0f);
	gluSphere(quadric[3], 1.0, 30, 30);

	//5th sphere on 1st column Ruby
	MaterialAmbience[0] = 0.1745f;
	MaterialAmbience[1] = 0.01175f;
	MaterialAmbience[2] = 0.01175f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.61424f;
	MaterialDiffuse[1] = 0.04136f;
	MaterialDiffuse[2] = 0.04136f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.727811f;
	MaterialSpecular[1] = 0.626959f;
	MaterialSpecular[2] = 0.626959f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.6*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(1.5f, 4.0f, 0.0f);
	gluSphere(quadric[4], 1.0, 30, 30);

	//6th sphere on 1st column Turquoise
	MaterialAmbience[0] = 0.1f;
	MaterialAmbience[1] = 0.18725f;
	MaterialAmbience[2] = 0.1745f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.396f;
	MaterialDiffuse[1] = 0.74151f;
	MaterialDiffuse[2] = 0.69102f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.297254f;
	MaterialSpecular[1] = 0.30829f;
	MaterialSpecular[2] = 0.306678f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.1*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(1.5f, 1.5f, 0.0f);
	gluSphere(quadric[5], 1.0, 30, 30);
	
	//1st sphere on 2nd column brass
	MaterialAmbience[0] = 0.329412f;
	MaterialAmbience[1] = 0.223529f;
	MaterialAmbience[2] = 0.027451f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.780392f;
	MaterialDiffuse[1] = 0.568627f;
	MaterialDiffuse[2] = 0.113725f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.992157f;
	MaterialSpecular[1] = 0.941176f;
	MaterialSpecular[2] = 0.807843f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.21794872*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(9.0f, 14.0f, 0.0f);
	gluSphere(quadric[6], 1.0, 30, 30);

	//2nd sphere on 2nd column Bronze
	MaterialAmbience[0] = 0.2125f;
	MaterialAmbience[1] = 0.1275f;
	MaterialAmbience[2] = 0.054f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.714f;
	MaterialDiffuse[1] = 0.4284f;
	MaterialDiffuse[2] = 0.18144f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.393548f;
	MaterialSpecular[1] = 0.271906f;
	MaterialSpecular[2] = 0.166721f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.2*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(9.0f, 11.5f, 0.0f);
	gluSphere(quadric[7], 1.0, 30, 30);

	//3rd sphere on 2nd column Chrome
	MaterialAmbience[0] = 0.25f;
	MaterialAmbience[1] = 0.25f;
	MaterialAmbience[2] = 0.25f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.4f;
	MaterialDiffuse[1] = 0.4f;
	MaterialDiffuse[2] = 0.4f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.774597f;
	MaterialSpecular[1] = 0.774597f;
	MaterialSpecular[2] = 0.774597f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.6*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(9.0f, 9.0f, 0.0f);
	gluSphere(quadric[8], 1.0, 30, 30);

	//4th sphere on 2nd column Copper
	MaterialAmbience[0] = 0.19125f;
	MaterialAmbience[1] = 0.0735f;
	MaterialAmbience[2] = 0.0225f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.7038f;
	MaterialDiffuse[1] = 0.27048f;
	MaterialDiffuse[2] = 0.0828f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.256777f;
	MaterialSpecular[1] = 0.137622f;
	MaterialSpecular[2] = 0.086014f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.1*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(9.0f, 6.5f, 0.0f);
	gluSphere(quadric[9], 1.0, 30, 30);

	//5th sphere on 2nd column Gold
	MaterialAmbience[0] = 0.24725f;
	MaterialAmbience[1] = 0.1995f;
	MaterialAmbience[2] = 0.0745f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.75164f;
	MaterialDiffuse[1] = 0.60648f;
	MaterialDiffuse[2] = 0.22648f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.628281f;
	MaterialSpecular[1] = 0.555802f;
	MaterialSpecular[2] = 0.366065f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.4*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(9.0f, 4.0f, 0.0f);
	gluSphere(quadric[10], 1.0, 30, 30);

	//6th sphere on 2nd column Silver
	MaterialAmbience[0] = 0.19225f;
	MaterialAmbience[1] = 0.19225f;
	MaterialAmbience[2] = 0.19225f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.50754f;
	MaterialDiffuse[1] = 0.50754f;
	MaterialDiffuse[2] = 0.50754f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.508273f;
	MaterialSpecular[1] = 0.508273f;
	MaterialSpecular[2] = 0.508273f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.4*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(9.0f, 1.5f, 0.0f);
	gluSphere(quadric[11], 1.0, 30, 30);

	//1st sphere on 3rd column Black Plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.01f;
	MaterialDiffuse[1] = 0.01f;
	MaterialDiffuse[2] = 0.01f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.50f;
	MaterialSpecular[1] = 0.50f;
	MaterialSpecular[2] = 0.50f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(16.5f, 14.0f, 0.0f);
	gluSphere(quadric[12], 1.0, 30, 30);

	//2nd sphere on 3rd column Cyan Plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.1f;
	MaterialAmbience[2] = 0.06f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.0f;
	MaterialDiffuse[1] = 0.50980392f;
	MaterialDiffuse[2] = 0.50980392f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.50196078f;
	MaterialSpecular[1] = 0.50196078f;
	MaterialSpecular[2] = 0.50196078f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(16.5f, 11.5f, 0.0f);
	gluSphere(quadric[13], 1.0, 30, 30);

	//3rd sphere on 3rd column Green Plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.1f;
	MaterialDiffuse[1] = 0.35f;
	MaterialDiffuse[2] = 0.1f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.45f;
	MaterialSpecular[1] = 0.55f;
	MaterialSpecular[2] = 0.45f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(16.5f, 9.0f, 0.0f);
	gluSphere(quadric[14], 1.0, 30, 30);

	//4th sphere on 3rd column REd Plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.0f;
	MaterialDiffuse[2] = 0.0f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.7f;
	MaterialSpecular[1] = 0.6f;
	MaterialSpecular[2] = 0.6f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(16.5f, 6.5f, 0.0f);
	gluSphere(quadric[15], 1.0, 30, 30);

	//5th sphere on 3rd column White Plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.55f;
	MaterialDiffuse[1] = 0.55f;
	MaterialDiffuse[2] = 0.55f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.70f;
	MaterialSpecular[1] = 0.70f;
	MaterialSpecular[2] = 0.70f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(16.5f, 4.0f, 0.0f);
	gluSphere(quadric[16], 1.0, 30, 30);

	//6th sphere on 3rd column Yellow Plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.0f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.60f;
	MaterialSpecular[1] = 0.60f;
	MaterialSpecular[2] = 0.50f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(16.5f, 1.5f, 0.0f);
	gluSphere(quadric[17], 1.0, 30, 30);

	//1st sphere on 4th column Black Rubber
	MaterialAmbience[0] = 0.02f;
	MaterialAmbience[1] = 0.02f;
	MaterialAmbience[2] = 0.02f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.01f;
	MaterialDiffuse[1] = 0.01f;
	MaterialDiffuse[2] = 0.01f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.40f;
	MaterialSpecular[1] = 0.40f;
	MaterialSpecular[2] = 0.40f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(24.0f, 14.0f, 0.0f);
	gluSphere(quadric[18], 1.0, 30, 30);

	//2nd sphere on 4th column Cyan Rubber
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.05f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.4f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.5f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.04f;
	MaterialSpecular[1] = 0.7f;
	MaterialSpecular[2] = 0.7f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(24.0f, 11.5f, 0.0f);
	gluSphere(quadric[19], 1.0, 30, 30);

	//3rd sphere on 4th column Green Rubber
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.4f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.4f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.04f;
	MaterialSpecular[1] = 0.7f;
	MaterialSpecular[2] = 0.04f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(24.0f, 9.0f, 0.0f);
	gluSphere(quadric[20], 1.0, 30, 30);

	//4th sphere on 4th column REd Rubber
	MaterialAmbience[0] = 0.05f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.4f;
	MaterialDiffuse[2] = 0.4f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.7f;
	MaterialSpecular[1] = 0.04f;
	MaterialSpecular[2] = 0.04f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(24.0f, 6.5f, 0.0f);
	gluSphere(quadric[21], 1.0, 30, 30);

	//5th sphere on 4th column White Rubber
	MaterialAmbience[0] = 0.05f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.05f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.5f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.70f;
	MaterialSpecular[1] = 0.70f;
	MaterialSpecular[2] = 0.70f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(24.0f, 4.0f, 0.0f);
	gluSphere(quadric[22], 1.0, 30, 30);

	//6th sphere on 4th column Yellow Rubber
	MaterialAmbience[0] = 0.05f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_AMBIENT, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.4f;
	MaterialDiffuse[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_DIFFUSE, MaterialDiffuse);

	MaterialSpecular[0] = 0.7f;
	MaterialSpecular[1] = 0.7f;
	MaterialSpecular[2] = 0.04f;
	MaterialSpecular[3] = 1.0f;
	glMaterialfv(GL_FRONT, GL_SPECULAR, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glMaterialfv(GL_FRONT, GL_SHININESS, MaterialShininess);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(24.0f, 1.5f, 0.0f);
	gluSphere(quadric[17], 1.0, 30, 30);
}

void update()
{
	angleOfXRotation += 1.0f;
	//if (angleOfXRotation >= 360.0f)
		//angleOfXRotation = 0.0f;
	angleOfYRotation += 1.0f;
	//if (angleOfYRotation >= 360.0f)
		//angleOfYRotation = 0.0f;
	angleOfZRotation += 1.0f;
	//if (angleOfZRotation >= 360.0f)
		//angleOfZRotation = 0.0f;
}

/*bool LoadTexture(GLuint *texture,const char *path)
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
*/
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
	if (quadric)
	{
		for (int i = 0; i < 24; i++)
		{
			gluDeleteQuadric(quadric[i]);
			quadric[i] = NULL;
		}
		
	}
}


