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
#include "Sphere.h"
//#include "Stack.h"
#include <cmath>

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

static GLfloat angle_rect = 0.0f;

GLint gVertexShaderObject;
GLint gFragmentShaderObject;
GLint gShaderProgramObject;

GLuint vao_sphere;
GLuint vbo_position_sphere;
GLuint vbo_normal_sphere;
GLuint vbo_element_sphere;

GLuint vao_sphere1;
GLuint vbo_position_sphere1;
GLuint vbo_normal_sphere1;
GLuint vbo_element_sphere1;
int gNumVertices;
int gNumElements;
GLuint mvpUniform;
mat4 perspectiveProjectionMatrix;
//for sphere
float sphere_vertices[1146];
float sphere_normals[1146];
float sphere_textures[764];
unsigned short sphere_elements[2280];

int shoulder = 0, elbow = 0;
class Stack
{
public:
	// ctor/dtor
	Stack();


	void pushMatrix(mat4 data);
	mat4 popMatrix();
	
private:
	struct Node
	{
		mat4 data = mat4::identity();
		struct Node *next = NULL;
	}
	
	*top = NULL;


}sp;
Stack::Stack()
{
	top = NULL;
}

// to empty and destroy the MatrixStack


// to insert elements in MatrixStack
void Stack::pushMatrix(mat4 val)
{
	struct Node *temp;
	temp = (struct Node*)malloc(sizeof(struct Node));
	temp->data = val;
	temp->next = top;
	top = temp;
}

// to delete elements from MatrixStack
mat4 Stack::popMatrix()
{
	struct Node *temp;
	mat4 val;
	val.identity();
	if (top == NULL)
	{

	}
	else
	{
		temp = top;
		top = top->next;
		val = temp->data;
		free(temp);
	}
	return val;
}
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
                                                case 'S':
			                                        shoulder = (shoulder + 3) % 360;
			                                        break;
		                                        case 's':
			                                        shoulder = (shoulder - 3) % 360;
			                                        break;
		                                        case 'E':
			                                        elbow = (elbow + 3) % 360;
			                                        break;
		                                        case 'e':
			                                        elbow = (elbow - 3) % 360;
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
       
       XStoreName(gpDisplay,gWindow,"Robotic Arm");
       
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
        //write vertex shader code
        
    	const GLchar *vertexShaderSourceCode =
		"#version 130" \
		"\n" \
		"in vec4 vPosition;" \
		"in vec4 vColor;" \
		"uniform mat4 u_mvp_matrix;" \
		"out vec4 out_color;" \
		"void main(void)" \
		"{" \
		"gl_Position=u_mvp_matrix*vPosition;" \
		"out_color=vColor;"
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
        //write fragment shader code
	    const GLchar *FragmentShaderSourceCode =
		"#version 130" \
		"\n" \
		"in vec4 out_color;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{" \
		"FragColor=vec4(0.5, 0.35, 0.05,1.0);" \
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
	mvpUniform = glGetUniformLocation(gShaderProgramObject, "u_mvp_matrix");
	
	//create vao
	getSphereVertexData(sphere_vertices, sphere_normals, sphere_textures, sphere_elements);
	gNumVertices = getNumberOfSphereVertices();
	gNumElements = getNumberOfSphereElements();

	//create vao
	//Sphere
	glGenVertexArrays(1, &vao_sphere);
	glBindVertexArray(vao_sphere);
	glGenBuffers(1, &vbo_position_sphere);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_sphere);
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_vertices), sphere_vertices, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER, 0);


	glGenBuffers(1, &vbo_normal_sphere);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_normal_sphere);
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_normals), sphere_normals, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_NORMAL);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glGenBuffers(1, &vbo_element_sphere);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_element_sphere);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphere_elements), sphere_elements, GL_STATIC_DRAW);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);

	glBindVertexArray(0);

	//Sphere1

	glGenVertexArrays(1, &vao_sphere1);
	glBindVertexArray(vao_sphere1);
	glGenBuffers(1, &vbo_position_sphere1);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_sphere1);
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_vertices), sphere_vertices, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER, 0);


	glGenBuffers(1, &vbo_normal_sphere1);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_normal_sphere1);
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_normals), sphere_normals, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_NORMAL);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glGenBuffers(1, &vbo_element_sphere1);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_element_sphere1);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphere_elements), sphere_elements, GL_STATIC_DRAW);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);

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
   glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);

	mat4 modelViewMatrix;
	mat4 modelViewProjectionMatrix;
	mat4 translationMatrix;
	mat4 rotationMatrix;
	mat4 scaleMatrix;

	modelViewMatrix = mat4::identity();
	rotationMatrix = mat4::identity();
	modelViewProjectionMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	scaleMatrix = mat4::identity();
	

	translationMatrix = translate(0.0f, 0.0f, -12.0f);
	modelViewMatrix = translationMatrix * modelViewMatrix;

	

	sp.pushMatrix(modelViewMatrix);

	rotationMatrix = rotate((float)shoulder, 0.0f, 0.0f, 1.0f);
	modelViewMatrix = modelViewMatrix * rotationMatrix;

	translationMatrix = mat4::identity();
	translationMatrix = translate(1.0f, 0.0f, 0.0f);
	modelViewMatrix = modelViewMatrix * translationMatrix;

	sp.pushMatrix(modelViewMatrix);

	scaleMatrix = scale(2.0f, 0.5f, 1.0f);
	modelViewMatrix = modelViewMatrix * scaleMatrix;

	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
	glUniformMatrix4fv(mvpUniform,1,GL_FALSE,modelViewProjectionMatrix);

	

	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glBindVertexArray(vao_sphere);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_element_sphere);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	glBindVertexArray(0);
	

	modelViewMatrix = sp.popMatrix();

	translationMatrix = mat4::identity();
	translationMatrix = translate(1.0f, 0.0f, 0.0f);
	modelViewMatrix = modelViewMatrix * translationMatrix;

	rotationMatrix = mat4::identity();
	rotationMatrix = rotate((float)elbow, 0.0f, 0.0f, 1.0f);
	modelViewMatrix = modelViewMatrix * rotationMatrix;

	translationMatrix = mat4::identity();
	translationMatrix = translate(1.0f, 0.0f, 0.0f);
	modelViewMatrix = modelViewMatrix * translationMatrix;

	sp.pushMatrix(modelViewMatrix);

	scaleMatrix = mat4::identity();
	scaleMatrix = scale(2.0f, 0.5f, 1.0f);
	modelViewMatrix = modelViewMatrix * scaleMatrix;

	modelViewProjectionMatrix = mat4::identity();
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
	glUniformMatrix4fv(mvpUniform,1,GL_FALSE,modelViewProjectionMatrix);

	
	modelViewProjectionMatrix = mat4::identity();
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glBindVertexArray(vao_sphere1);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_element_sphere1);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	glBindVertexArray(0);
	sp.popMatrix();
	sp.popMatrix();

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
     /*   if (vbo_sphere_element)
	{
		glDeleteBuffers(1, &vbo_sphere_element);
		vbo_sphere_element = 0;
	}
	if (gVbo_sphere_position)
	{
		glDeleteBuffers(1, &gVbo_sphere_position);
		gVbo_sphere_position = 0;
	}
	if (gVbo_sphere_normal)
	{
		glDeleteBuffers(1, &gVbo_sphere_normal);
		gVbo_sphere_normal = 0;
	}
	if (vao_sphere)
	{
		glDeleteBuffers(1, &vao_sphere);
		vao_sphere = 0;
	}*/
	GLsizei shaderCount, shaderNumber;
	if (gShaderProgramObject)
	{
		glUseProgram(gShaderProgramObject);
		glGetProgramiv(gShaderProgramObject,GL_ATTACHED_SHADERS,&shaderCount);
		GLuint* pShaders = (GLuint*)malloc(sizeof(GLuint*)*shaderCount);
		if (pShaders)
		{
			glGetAttachedShaders(gShaderProgramObject,shaderCount,&shaderCount,pShaders);
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


