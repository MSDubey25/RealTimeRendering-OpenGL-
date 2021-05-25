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

#define _USE_MATH_DEFINES 1;
#include<math.h>
#define num 1000;

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

static GLXContext gGLXContext;
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
                                                    /*    if(bFullscreen==false)
                                                        {
                                                                ToggleFullscreen();
                                                                bFullscreen=true;
                                                        }
                                                        else
                                                        {
                                                                ToggleFullscreen();
                                                                bFullscreen=false;
                                                        }*/
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
       
       XStoreName(gpDisplay,gWindow,"Static India");
       
       Atom windowManagerDelete=XInternAtom(gpDisplay,"WM_DELETE_WINDOW",True);
       XSetWMProtocols(gpDisplay,gWindow,&windowManagerDelete,1);
       
       XMapWindow(gpDisplay,gWindow);
}
void initialize(void)
{
        void uninitialize(void);
        void Resize(int,int);
        void ToggleFullscreen(void);

	gGLXContext=glXCreateContext(gpDisplay,gpXVisualInfo,NULL,GL_TRUE);
        glXMakeCurrent(gpDisplay,gWindow,gGLXContext);

	glClearColor(0.0f,0.0f,.0f,1.0f);
	Resize(giWindowWidth,giWindowHeight);
	ToggleFullscreen();
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
void DrawPlane();
	static GLfloat counter1 = 0.0f;
	static GLfloat counter2 = 0.0f;
	static GLfloat counter3 = 0.0f;
	static GLfloat counter4 = 0.0f;
	static GLfloat counterP1 = 0.0f;
	static GLfloat xTranslate = 0.0f;
	static GLfloat timer = 0.0f;
	
	static bool flagI1=false;
	static bool flagA = false;
	static bool flagN = false;
	static bool flagI2 = false;
	static bool flagD = false;
	glClear(GL_COLOR_BUFFER_BIT);
	glMatrixMode(GL_MODELVIEW);
/*	glLoadIdentity();
	glTranslatef(0.0f, 0.0f, -4.0f);
		glBegin(GL_LINES);
		glColor3f(1.0f, 0.0f, 0.0f);
		glVertex2f(-2.2f,0.0f);
		glVertex2f(2.2f, 0.0f);

		glVertex2f(-2.2f, 0.75f);
		glVertex2f(2.2f, 0.75f);

		glVertex2f(-2.2f, -0.75f);
		glVertex2f(2.2f, -0.75f);

		glVertex2f(0.0f, 1.25f);
		glVertex2f(0.0f, -1.25f);

		glVertex2f(-1.75f, 1.25f);
		glVertex2f(-1.75f, -1.25f);

		glVertex2f(1.75f, 1.25f);
		glVertex2f(1.75f, -1.25f);

		glVertex2f(-2.1f, 1.2f);
		glVertex2f(2.1f, 1.2f);
		glVertex2f(-2.1f, -1.2f);
		glVertex2f(2.1f, -1.2f);

		glVertex2f(-2.1f, -0.25f);
		glVertex2f(2.1f, -0.25f);
		glVertex2f(-2.1f, 0.25f);
		glVertex2f(2.1f, 0.25f);
		glEnd();
	*/	
	//for Letter I
	glLoadIdentity();
	glTranslatef(-2.0f+counter1,0.0f,-4.0f);
	//glScalef(0.8f, 0.9f, 0.0f);
	glBegin(GL_QUADS);
	
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-1.75f, 0.75f);
	glVertex2f(-1.75f, 0.65f);
	glVertex2f(-1.25f, 0.65f);
	glVertex2f(-1.25f, 0.75f);


	glVertex2f(-1.35f, 0.65f);
	glVertex2f(-1.65f, 0.65f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-1.65f, -0.65f);
	glVertex2f(-1.35f, -0.65f);

	glVertex2f(-1.75f, -0.65f);
	glVertex2f(-1.75f, -0.75f);
	glVertex2f(-1.25f, -0.75f);
	glVertex2f(-1.25f, -0.65f);
	glEnd();
	
	
	//Letter A 
	glLoadIdentity();
	glTranslatef(2.05f - counter2, 0.0f, -4.0f);
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(1.25f, 0.75f);
	glVertex2f(1.1f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(0.9f, -0.75f);
	glVertex2f(1.55f, -0.75f);
	glEnd();
	glColor3f(0.0f, 0.0f, 0.0f);
	glBegin(GL_TRIANGLES);
	glVertex2f(1.18f, 0.5f);
	glVertex2f(1.05f, -0.75f);
	glVertex2f(1.40f, -0.75f);
	glEnd();
	//flag
	glLoadIdentity();
	if (xTranslate>2.09f)
	{
		glTranslatef(1.525f, 0.0f, -4.0f);
		glBegin(GL_QUADS);

		glColor3f(1.0f, 1.0f, 1.0f);//white
		glVertex2f(-0.057f, 0.0f);//tr
		glVertex2f(-0.203f, 0.0f);//tl
		glColor3f(0.071f, 0.533f, 0.027f);//green
		glVertex2f(-0.205f, -0.05f);//bl
		glVertex2f(-0.045f, -0.05f);//br

		glColor3f(1.0f, 1.0f, 1.0f);//white
		glVertex2f(-0.057f, 0.0f);//br
		glVertex2f(-0.2029f, 0.0f);//bl
		glColor3f(1.0f, 0.6f, 0.2f);//saffron
		glVertex2f(-0.195f, 0.05f);//tl
		glVertex2f(-0.065f, 0.05f);//tr
		glEnd();

		glTranslatef(-0.13f, 0.0f, 0.0f);
		glColor3f(0.0f, 0.0f, 1.0f);
		glBegin(GL_LINE_LOOP);
		for (int i = 0; i < 1000; i++)
		{
			GLfloat angle = 2 * M_PI*i / num;
			glVertex3f(0.01f*cos(angle), 0.01f*sin(angle), 0.0f);
		}
		glEnd();
	}
	
	//Letter N
	glLoadIdentity();
	glTranslatef(0.2f, 6.5f-counter3, -4.0f);
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-1.10f, 0.75f);
	glVertex2f(-1.25f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-1.25f, -0.75f);
	glVertex2f(-1.10f, -0.75f);

	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-1.10f, 0.75f);
	glVertex2f(-1.25f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.95f, -0.75f);
	glVertex2f(-0.8f, -0.75f);

	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-0.80f, 0.75f);
	glVertex2f(-0.95f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.95f, -0.75f);
	glVertex2f(-0.80f, -0.75f);
	glEnd();


	//Letter I
	glLoadIdentity();
	glTranslatef(2.15f, -2.5f+counter4, -4.0f);
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-1.75f, 0.75f);
	glVertex2f(-1.75f, 0.65f);
	glVertex2f(-1.25f, 0.65f);
	glVertex2f(-1.25f, 0.75f);


	glVertex2f(-1.35f, 0.65f);
	glVertex2f(-1.65f, 0.65f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-1.65f, -0.65f);
	glVertex2f(-1.35f, -0.65f);

	glVertex2f(-1.75f, -0.65f);
	glVertex2f(-1.75f, -0.75f);
	glVertex2f(-1.25f, -0.75f);
	glVertex2f(-1.25f, -0.65f);
	glEnd();

	//for Letter D
	static GLfloat Cr=0.0f, Cg=0.0f, Cb=0.0f;
	static GLfloat Gr = 0.0f, Gg = 0.0f, Gb = 0.0f;
	glLoadIdentity();
	glTranslatef(0.2f, 0.0f, -4.0f);
	glBegin(GL_QUADS);
	glColor3f(Cr, Cg, Cb);//saffron
	glVertex2f(-0.0f, 0.75f);
	glVertex2f(-0.60f, 0.75f);
	glColor3f(Gr, Gg, Gb);//green
	glVertex2f(-0.60f, -0.75f);
	glVertex2f(0.0f, -0.75f);

	glColor3f(0.0f, 0.0f, 0.0f);

	glVertex2f(-0.15f, 0.60f);
	glVertex2f(-0.35f, 0.60f);
	glVertex2f(-0.35f, -0.60f);
	glVertex2f(-0.15f, -0.60f);

	glVertex2f(-0.5f, 0.60f);
	glVertex2f(-0.60f, 0.60f);
	glVertex2f(-0.60f, -0.60f);
	glVertex2f(-0.5f, -0.60f);

	glEnd();
	
	//Center Plane
	glLoadIdentity();
	//glTranslatef(-4.5f+2.4f*counterP1 + 1.0f,0.0f,-4.0f);
	if (xTranslate < 1.25f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.0f, 0.0f, -4.0f);
	}
	else
	{
		glTranslatef(-4.5f + 2.4f*xTranslate + 1.0f, 0.0f, -4.0f);
	}
	if (xTranslate > 2.09f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.5f, 0.0f, 0.0f);
	}
	DrawPlane();	
	
	//top Plane
	glLoadIdentity();
	//glTranslatef(-4.5f +2.4f*counterP1+1.0f, -sin((counterP1*2.0f-2.0f)/2.0f)/0.5f+0.5f, -4.0f);
	if (xTranslate<=1.25f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.0f, -sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f + 0.5f, -4.0f);
	}
	else
	{
		glTranslatef(-4.5f + 2.4f*xTranslate + 1.0f, 0.0f, -4.0f);
	}
	if (xTranslate > 2.09f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.5f, -sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f + 0.5f, 0.0f);
	}
	DrawPlane();
	
	//bottom Plane
	glLoadIdentity();
	//glTranslatef(-4.5f +2.4f*counterP1 + 1.0f, sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f - 0.5f, -4.0f);
	if (xTranslate <=1.25f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.0f, sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f - 0.5f, -4.0f);
	}
	else
	{
		glTranslatef(-4.5f + 2.4f*xTranslate + 1.0f, 0.0f, -4.0f);
	}
	if(xTranslate>2.09f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.5f, sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f - 0.5f, 0.0f);
	}
	DrawPlane();
	
/*
	static GLfloat x = 0.0f;
	static GLfloat y = 0.0f;
	static GLfloat anglePB = 270.0f;
	glLoadIdentity();
	glRotatef(anglePB, 0.0f, 0.0f, 1.0f);
	glTranslatef(-2.0f, -2.0f, 0.0f);
	//glRotatef(90.0f,0.0f,0.0f,1.0f);
	
	if (x < 1.0f)
		glTranslatef(x, 0.0f, 0.0f);
	else
	{
	//	glTranslatef(x, 0.0f, 0.0f);
	}
	//glRotatef(90.0f, 0.0f, 0.0f, 1.0f);
	DrawPlane();
	*/
	glXSwapBuffers(gpDisplay,gWindow);
	if (counter1 <= 2.0f && flagI1 == false)
		counter1 = counter1 + 0.0025f;
	else
	{
		flagI1 = true;
	}
	if (counter2 <= 1.85f && flagI1 == true)
		counter2 = counter2 + 0.0025f;
	else
	{
		flagA = true;
	}
	if (counter3 <= 6.5f &&  flagA==true)
		counter3 = counter3 + 0.0025f;
	else
	{
		flagN = true;
	}
	if (counter4 <= 2.5f &&  flagN == true)
		counter4 = counter4 + 0.0025f;
	else
	{
		flagI2 = true;
	}
	if (counter4>=2.5f)
	{
		if(Cr<=1.0f)
			Cr = Cr + 0.0025f;
		if(Cg<=0.6f)
			Cg = Cg + 0.0025f;
		if(Cb<=0.2)
			Cb = Cb + 0.0025f;
		if (Gr <= 0.071f)
			Gr = Gr + 0.00025f;
		if (Gg <= 0.533f)
			Gg = Gg + 0.0025f;
		if (Gb <= 0.027)
			Gb = Gb + 0.00025f;
	}
	else
	{
		flagD = true;
	}
	if (counterP1 <= 2.9f &&   Cr > 0.99f && Gg > 0.472f)
	{
		if (xTranslate <= 1.25f)
		{
			counterP1 = counterP1 + 0.0007f;
			xTranslate += 0.0007f;
		}
		else if (xTranslate >= 1.25f && xTranslate<=2.09f)
		{
			xTranslate += 0.0007f;
		}
		else
		{
			//counterP1 = counterP1 + 0.0001f;
			timer += 0.0007f;
		}
		if (timer >= 1.92f)
		{
			counterP1 = counterP1 + 0.001f;
			
		}
	}
	
}
void DrawPlane()
{
	glBegin(GL_POLYGON);
	//glColor3f(176.0f/255.0f, 224.0f / 255.0f, 230.0f / 255.0f);//powder blue
	glColor3f(70.0f / 255.0f, 130.0f / 255.0f, 180.0f / 255.0f);//steel blue
	glVertex2f(0.0f, 0.1f);
	glVertex2f(-0.05f, 0.05f);
	glVertex2f(-0.05f, -0.05f);
	glVertex2f(0.0f, -0.1f);
	glVertex2f(-0.05f, -0.2f);
	glVertex2f(0.0f, -0.25f);
	glVertex2f(0.2f, -0.1f);
	glVertex2f(0.4f, -0.05f);
	glVertex2f(0.45f, 0.0f);
	glVertex2f(0.4f, 0.05f);
	glVertex2f(0.2f, 0.1f);
	glVertex2f(0.0f, 0.25f);
	glVertex2f(-0.05f, 0.2f);

	glEnd();
	//Flag
	glBegin(GL_QUAD_STRIP);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.2f, -0.05f);
	glVertex2f(-0.05f, -0.05f);
	glColor3f(1.0f, 1.0f, 1.0f);//white
	glVertex2f(-0.2f, 0.0f);
	glVertex2f(-0.05f, 0.0f);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-0.2f, 0.05f);
	glVertex2f(-0.05f, 0.05f);
	glEnd();
	

	//Chakra
	glTranslatef(-0.13f, 0.0f, 0.0f);
	glColor3f(0.0f, 0.0f, 1.0f);
	glBegin(GL_LINE_LOOP);
	for (int i = 0; i < 1000; i++)
	{
		GLfloat angle = 2 * M_PI*i / num;
		glVertex3f(0.01f*cos(angle), 0.01f*sin(angle), 0.0f);
	}
	glEnd();
	//F
	glTranslatef(0.3f, 0.0f, 0.0f);
	glScalef(0.1f, 0.05f, 0.0f);
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-0.0f, 0.75f);
	glVertex2f(-0.60f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.60f, -0.75f);
	glVertex2f(0.0f, -0.75f);

	glColor3f(70.0f / 255.0f, 130.0f / 255.0f, 180.0f / 255.0f);//steel blue

	glVertex2f(0.0f, 0.60f);
	glVertex2f(-0.45f, 0.60f);
	glVertex2f(-0.45f, 0.1f);
	glVertex2f(0.0f, 0.1f);

	glVertex2f(0.0f, -0.05f);
	glVertex2f(-0.45f, -0.05f);
	glVertex2f(-0.45f, -0.75f);
	glVertex2f(0.0f, -0.75f);

	glVertex2f(0.0f, 0.15f);
	glVertex2f(-0.2f, 0.15f);
	glVertex2f(-0.2f, -0.75f);
	glVertex2f(0.0f, -0.75f);

	glEnd();
	
	//I
	glTranslatef(-0.1f,0.0f,0.0f);
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-1.75f, 0.75f);
	glVertex2f(-1.75f, 0.65f);
	glVertex2f(-1.25f, 0.65f);
	glVertex2f(-1.25f, 0.75f);


	glVertex2f(-1.35f, 0.65f);
	glVertex2f(-1.65f, 0.65f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-1.65f, -0.65f);
	glVertex2f(-1.35f, -0.65f);

	glVertex2f(-1.75f, -0.65f);
	glVertex2f(-1.75f, -0.75f);
	glVertex2f(-1.25f, -0.75f);
	glVertex2f(-1.25f, -0.65f);
	glEnd();
	//A
	glTranslatef(-2.0f,0.0f,0.0f);
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(1.2f, 0.75f);
	glVertex2f(1.05f, 0.75f);
	glColor3f(0.066f, 0.533f, 0.027f);//green
	glVertex2f(0.85f, -0.75f);
	glVertex2f(1.5f, -0.75f);
	glEnd();
	glColor3f(70.0f / 255.0f, 130.0f / 255.0f, 180.0f / 255.0f);
	glBegin(GL_TRIANGLES);
	glVertex2f(1.13f, 0.5f);
	glVertex2f(1.0f, -0.75f);
	glVertex2f(1.35f, -0.75f);
	glEnd();

	glBegin(GL_QUAD_STRIP);

	glEnd();
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
}


