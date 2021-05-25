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

int currentWidth;
int currentHeight;

GLuint vao_sphere;
GLuint gVbo_sphere_position;
GLuint gVbo_sphere_normal;
GLuint vbo_sphere_element;
int gNumVertices;
int gNumElements;
GLuint mUniform;
GLuint vUniform;
GLuint pUniform;
GLuint laUniform;
GLuint ldUniform;
GLuint lsUniform;
GLuint lightPositionUniform;
GLuint kaUniform;
GLuint kdUniform;
GLuint ksUniform;
GLuint MaterialShininessUniform;
GLuint isLkeyPressedUniform;


mat4 projectionMatrix;
mat4 modelMatrix;
mat4 viewMatrix;
mat4 translationMatrix;
mat4 scaleMatrix;
mat4 rotationMatrix;
//for sphere
float sphere_vertices[1146];
float sphere_normals[1146];
float sphere_textures[764];
unsigned short sphere_elements[2280];

bool gbIsLighting = false;
bool gbIsVertexShader = true;
bool gbIsFragmentShader = false;

float light_ambient[4] = {0.0f,0.0f,0.0f,0.0f};
float light_diffuse[4] = { 1.0f,1.0f,1.0f,1.0f };
float light_specular[4] = { 1.0f,1.0f,1.0f,1.0f };
float light_position[4] = { 0.0f,0.0f,0.0f,1.0f };
float light_Model_Ambient[4] = { 0.2f,0.2f,0.2f,1.0f };
float light_Model_Local_Viewer[1] = { 0.0f };

float material_ambient[4] = { 0.0f,0.0f,0.0f,0.0f };
float material_diffuse[4] = { 1.0f,1.0f,1.0f,1.0f };
float material_specular[4] = { 1.0f,1.0f,1.0f,1.0f };
float material_shininess[1] = { 128.0f };

GLint keyPress=0;
static GLfloat angleOfXRotation = 0.0f;
static GLfloat angleOfYRotation = 0.0f;
static GLfloat angleOfZRotation = 0.0f;
//entry point function
int main()
{

        void CreateWindow(void);
        void ToggleFullscreen(void);
        void uninitialize(void);
        void initialize(void);
        void Resize(int,int);
        void display(void);
        void ShadersToggle();
        
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
                                        XLookupString(&event.xkey,keys,sizeof(keys),NULL,NULL);
                                        switch(keys[0])
                                        {
                                                case 'F':
                                                case 'f':
                                                        if (gbIsFragmentShader == false)
		                                                {
			                                                gbIsFragmentShader = true;
			                                                gbIsVertexShader = false;
		                                                }
		                                               /* else
		                                                {
			                                                gbIsFragmentShader = false; 
			                                                gbIsVertexShader = true;
		                                                }*/
		                                                ShadersToggle();
                                                        break;
                                                case 'L':case 'l':
		                                                if (gbIsLighting == false)
		                                                {
			                                                gbIsLighting = true;
		                                                }
		                                                else
		                                                {
			                                                gbIsLighting = false;
			                                                //glUniform1i(isLkeyPressedUniform, 0);
		                                                }
		                                                break;
	                                                case 'q':case 'Q':
			                                            if (bFullscreen == true)
				                                            ToggleFullscreen();
                                                        bDone=true;
			                                            break;
		                                            case 'v':case 'V':
			                                            if (gbIsVertexShader == false)
			                                            {
				                                            gbIsVertexShader = true;
				                                            gbIsFragmentShader = false;
			                                            }
			                                            /*else
			                                            {
				                                            gbIsVertexShader = false;
				                                            gbIsFragmentShader = true;
			                                            }*/
			                                            ShadersToggle();
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
                              //  default:
                                //        break;        
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
       
       XStoreName(gpDisplay,gWindow,"24 Sphere");
       
       Atom windowManagerDelete=XInternAtom(gpDisplay,"WM_DELETE_WINDOW",True);
       XSetWMProtocols(gpDisplay,gWindow,&windowManagerDelete,1);
       
       XMapWindow(gpDisplay,gWindow);
       printf("In createw\n");
}
void ShadersToggle()
{
	void uninitialize();
	//define vertex shader object
	gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);

	//write vertex shader code
	const GLchar *vertexShaderSourceCodePerFragment =
		"#version 130" \
		"\n" \
		"in vec4 vPosition;" \
		"in vec3 vNormal;" \
		"uniform mat4 u_m_matrix;" \
		"uniform mat4 u_v_matrix;" \
		"uniform mat4 u_p_matrix;" \
		"uniform vec4 u_lightPosition;" \
		"uniform int u_LkeyIsPressed;" \
		"out vec3 light_direction;" \
		"out vec3 reflection_vector;" \
		"out vec3 viewer_vector;" \
		"out vec3 transformedNormal;" \
		"out vec3 white;" \
		"void main(void)" \
		"{" \
		"	if(u_LkeyIsPressed==1)" \
		"	{" \
		"		vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" \
		"		transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);" \             		
		"		light_direction=vec3(u_lightPosition-eyeCoordinates);" \
		"		reflection_vector=reflect(-light_direction,transformedNormal);" \
		"		viewer_vector=vec3(-eyeCoordinates);" \
		"	}" \
		"	else" \
		"	{" \
		"		white=vec3(1.0,1.0,1.0);" \
		"	}" \
		"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" \
		"}";

	const GLchar *vertexShaderSourceCodePerVertex =
		"#version 130" \
		"\n" \
		"in vec4 vPosition;" \
		"in vec3 vNormal;" \
		"uniform mat4 u_m_matrix;" \
		"uniform mat4 u_v_matrix;" \
		"uniform mat4 u_p_matrix;" \
		"uniform vec3 u_la;" \
		"uniform vec3 u_ld;" \
		"uniform vec3 u_ls;" \
		"uniform vec4 u_lightPosition;" \
		"uniform vec3 u_ka;" \
		"uniform vec3 u_kd;" \
		"uniform vec3 u_ks;" \
		"uniform float u_materialShininess;" \
		"uniform int u_LkeyIsPressed;" \
		"out vec3 phong_ads_light;" \
		"void main(void)" \
		"{" \
		"	if(u_LkeyIsPressed==1)" \
		"	{" \
		"		vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" \
		/*"		mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" \
		"		vec3 transformedNormal=normalize(normalMatrix*vNormal);" \*/
		"		vec3 transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);" \
		"		vec3 light_direction=normalize(vec3(u_lightPosition-eyeCoordinates));" \
		"		float tn_dot_lightdirection=max(dot(light_direction,transformedNormal),0.0f);" \
		"		vec3 reflection_vector=reflect(-light_direction,transformedNormal);" \
		"		vec3 viewer_vector=normalize(vec3(-eyeCoordinates));" \
		"		vec3 ambient=u_la*u_ka;" \
		"		vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;" \
		"		vec3 specular=u_ls*u_ks*pow(max(dot(reflection_vector,viewer_vector),0.0f),u_materialShininess);" \
		"		phong_ads_light=ambient+diffuse+specular;" \
		"	}" \
		"	else" \
		"	{" \
		"		phong_ads_light=vec3(1.0,1.0,1.0);" \
		"	}" \
		"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" \
		"}";
	//specify above source code to vertexShaderObject
	if (gbIsVertexShader == false)
	{
		glShaderSource(gVertexShaderObject, 1,
			(const GLchar**)&vertexShaderSourceCodePerFragment,
			NULL);
		printf("\nvertexShaderSourceCodePerFragment attached to the shader source\n");
	}
	else
	{
		glShaderSource(gVertexShaderObject, 1,
			(const GLchar**)&vertexShaderSourceCodePerVertex,
			NULL);
		printf("\nvertexShaderSourceCodePerVertex attached to the shader source\n");
	}


	glCompileShader(gVertexShaderObject);
	GLint iShaderCompileStatus = 0;
	GLint iInfoLogLength = 0;
	GLchar *szInfoLog = NULL;

	glGetShaderiv(gVertexShaderObject,
		GL_COMPILE_STATUS,
		&iShaderCompileStatus);
	printf("\nValue of ivertex shader compile Status is : %d\n", iShaderCompileStatus);
	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gVertexShaderObject,
			GL_INFO_LOG_LENGTH,
			&iInfoLogLength);
		if (iInfoLogLength > 0)
		{
			szInfoLog = (GLchar*)malloc(iInfoLogLength);
			if (szInfoLog != NULL)
			{
				GLsizei writtened;
				glGetShaderInfoLog(gVertexShaderObject,
					iInfoLogLength,
					&writtened,
					szInfoLog);
				printf("Error in compiling vertex Shader : %s\n", szInfoLog);
				free(szInfoLog);
				uninitialize();
			}
		}
	}

	//define Fragment shader object
	gFragmentShaderObject = glCreateShader(GL_FRAGMENT_SHADER);

	//write fragment shader code
	const GLchar *fragmentShaderSourceCodePerFragment =
		"#version 130" \
		"\n" \
		"in vec3 light_direction;" \
		"in vec3 reflection_vector;" \
		"in vec3 viewer_vector;" \
		"in vec3 transformedNormal;" \
		"in vec3 white;" \
		"uniform vec3 u_la;" \
		"uniform vec3 u_ld;" \
		"uniform vec3 u_ls;" \
		"uniform vec3 u_ka;" \
		"uniform vec3 u_kd;" \
		"uniform vec3 u_ks;" \
		"uniform float u_materialShininess;" \
		"uniform int u_LkeyIsPressed;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{" \
		"	if(u_LkeyIsPressed==1)" \
		"	{" \
		"		vec3 normalized_tNormal=normalize(transformedNormal);" \
		"		vec3 normalized_light_direction=normalize(light_direction);" \
		"		vec3 normalized_reflection_vector=normalize(reflection_vector);" \
		"		vec3 normalized_viewer_vector=normalize(viewer_vector);" \
		"		float tn_dot_lightdirection=max(dot(normalized_light_direction,normalized_tNormal),0.0f);" \
		"		vec3 ambient=u_la*u_ka;" \
		"		vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;" \
		"		vec3 specular=u_ls*u_ks*pow(max(dot(normalized_reflection_vector,normalized_viewer_vector),0.0f),u_materialShininess);" \
		"		vec3 phong_ads_light=ambient+diffuse+specular;" \
		"		FragColor=vec4(phong_ads_light,1.0);" \
		"	}" \
		"	else" \
		"	{" \
		"		FragColor=vec4(white,1.0);" \
		"	}" \
		"}";

	const GLchar *fragmentShaderSourceCodePerVertex =
		"#version 130" \
		"\n" \
		"in vec3 phong_ads_light;" \
		"uniform int u_LkeyIsPressed;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{" \
		"	if(u_LkeyIsPressed==1)" \
		"	{" \
		"		FragColor=vec4(phong_ads_light,1.0);" \
		"	}" \
		"	else" \
		"	{" \
		"		FragColor=vec4(1.0,1.0,1.0,1.0);" \
		"	}" \
		"}";
	//specify above source code to FragmentShaderObject
	if (gbIsFragmentShader == false)
	{
		glShaderSource(gFragmentShaderObject, 1,
			(const GLchar**)&fragmentShaderSourceCodePerVertex,
			NULL);
		printf("\nfragmentShaderSourceCodePerVertex attached to the shader source\n");
	}
	else
	{
		glShaderSource(gFragmentShaderObject, 1,
			(const GLchar**)&fragmentShaderSourceCodePerFragment,
			NULL);
		printf("\nfragmentShaderSourceCodePerFragment attached to the shader source\n");
	}

	/*glShaderSource(gFragmentShaderObject, 1,
		(const GLchar**)&fragmentShaderSourceCodePerFragment,
		NULL);*/
	glCompileShader(gFragmentShaderObject);

	iShaderCompileStatus = 0;
	iInfoLogLength = 0;
	szInfoLog = NULL;

	glGetShaderiv(gFragmentShaderObject,
		GL_COMPILE_STATUS,
		&iShaderCompileStatus);
	printf("Value of ifragment shader compile Status is : %d\n", iShaderCompileStatus);
	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gFragmentShaderObject,
			GL_INFO_LOG_LENGTH,
			&iInfoLogLength);
		if (iInfoLogLength > 0)
		{
			szInfoLog = (GLchar*)malloc(iInfoLogLength);
			if (szInfoLog != NULL)
			{
				GLsizei writtened;
				glGetShaderInfoLog(gFragmentShaderObject,
					iInfoLogLength,
					&writtened,
					szInfoLog);
				printf("Error in compiling Fragment Shader : %s\n", szInfoLog);
				free(szInfoLog);
				uninitialize();
				//DestroyWindow(ghHwnd);
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
	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_POSITION, "vPosition");
	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_NORMAL, "vNormal");

	//Link the shader program
	printf("\nattach comp\n");
	glLinkProgram(gShaderProgramObject);
	//ErrorCheck for linking

	GLint iProgramLinkStatus = 0;
	iInfoLogLength = 0;
	szInfoLog = NULL;

	glGetProgramiv(gShaderProgramObject,
		GL_LINK_STATUS,
		&iProgramLinkStatus);
	printf("Value of iProgramLinkStatus is : %d\n", iProgramLinkStatus);
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
				printf("Error in Linking Shader : %s\n", szInfoLog);
				free(szInfoLog);
				uninitialize();
			}
		}
	}
	//post linking retrieving uniform location
	mUniform = glGetUniformLocation(gShaderProgramObject, "u_m_matrix");
	vUniform = glGetUniformLocation(gShaderProgramObject, "u_v_matrix");
	pUniform = glGetUniformLocation(gShaderProgramObject, "u_p_matrix");
	laUniform = glGetUniformLocation(gShaderProgramObject, "u_la");
	ldUniform = glGetUniformLocation(gShaderProgramObject, "u_ld");
	lsUniform = glGetUniformLocation(gShaderProgramObject, "u_ls");
	lightPositionUniform = glGetUniformLocation(gShaderProgramObject, "u_lightPosition");
	kaUniform = glGetUniformLocation(gShaderProgramObject, "u_ka");
	kdUniform = glGetUniformLocation(gShaderProgramObject, "u_kd");
	ksUniform = glGetUniformLocation(gShaderProgramObject, "u_ks");
	MaterialShininessUniform = glGetUniformLocation(gShaderProgramObject, "u_materialShininess");
	isLkeyPressedUniform = glGetUniformLocation(gShaderProgramObject, "u_LkeyIsPressed");

}

void initialize(void)
{
        void uninitialize(void);
        void Resize(int,int);
        void ShadersToggle();

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
        
        ShadersToggle();
        
	getSphereVertexData(sphere_vertices, sphere_normals, sphere_textures, sphere_elements);
	gNumVertices = getNumberOfSphereVertices();
	gNumElements = getNumberOfSphereElements();

	//create vao
	// vao
	glGenVertexArrays(1, &vao_sphere);
	glBindVertexArray(vao_sphere);

	// position vbo
	glGenBuffers(1, &gVbo_sphere_position);
	glBindBuffer(GL_ARRAY_BUFFER, gVbo_sphere_position);
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_vertices), sphere_vertices, GL_STATIC_DRAW);

	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);

	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);

	glBindBuffer(GL_ARRAY_BUFFER, 0);

	// normal vbo
	glGenBuffers(1, &gVbo_sphere_normal);
	glBindBuffer(GL_ARRAY_BUFFER, gVbo_sphere_normal);
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_normals), sphere_normals, GL_STATIC_DRAW);

	glVertexAttribPointer(AMC_ATTRIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 0, NULL);

	glEnableVertexAttribArray(AMC_ATTRIBUTE_NORMAL);

	glBindBuffer(GL_ARRAY_BUFFER, 0);

	// element vbo
	glGenBuffers(1, &vbo_sphere_element);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphere_elements), sphere_elements, GL_STATIC_DRAW);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);

	// unbind vao
	glBindVertexArray(0);
	/////////////////////////////////////////////////////////
	
	glClearColor(0.25f, 0.25f, 0.25f, 1.0f);
	glClearDepth(1.0f);
	Resize(giWindowWidth,giWindowHeight);
	projectionMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	modelMatrix = mat4::identity();
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	
}
void Resize(int width, int height)
{
    currentWidth = width;
	currentHeight = height;
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
	void draw24Sphere();
        printf("In display\n");
   glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);

	//declaration of matrices
	//initialize above to identity
	translationMatrix = mat4::identity();
	scaleMatrix = mat4::identity();
	rotationMatrix = mat4::identity();
	//do necessary transformation
	//scaleMatrix = scale(2.25f,2.25f,2.25f);
	translationMatrix = translate(0.0f,0.0f,-10.0f);
	modelMatrix = translationMatrix*scaleMatrix;
	//do necessary matrix multiplication
	if (gbIsLighting == true)
	{
		glUniform1i(isLkeyPressedUniform, 1);
		glUniform3fv(laUniform, 1, light_ambient);
		glUniform3fv(ldUniform, 1, light_diffuse);
		glUniform3fv(lsUniform, 1, light_specular);
		
		glUniform3fv(kaUniform, 1, material_ambient);
		glUniform3fv(kdUniform, 1, material_diffuse);
		glUniform3fv(ksUniform, 1, material_specular);
		glUniform1fv(MaterialShininessUniform, 1, material_shininess);
		//glLightModelfv(GL_LIGHT_MODEL_AMBIENT, light_Model_Ambient);
		//glLightModelfv(GL_LIGHT_MODEL_LOCAL_VIEWER, light_Model_Local_Viewer);
		if (keyPress == 1 || keyPress==0)
		{
			//rotationMatrix = rotate(angleOfXRotation, 1.0f, 0.0f, 0.0f);
			light_position[0] = 0.0f;
			light_position[1] = 100.0f*sin(angleOfYRotation);
			light_position[2] = 100.0f*cos(angleOfYRotation);
			light_position[3] = 1.0f;
		}
		else if (keyPress == 2)
		{
			//rotationMatrix=rotate(angleOfYRotation, 0.0f, 1.0f, 0.0f);
			light_position[0] = 100.0f*sin(angleOfYRotation);
			light_position[1] = 0.0f;
			light_position[2] = 100.0f*cos(angleOfYRotation);
			light_position[3] = 1.0f;
		}
		else if (keyPress == 3)
		{
			//rotationMatrix = rotate(angleOfZRotation, 0.0f, 0.0f, 1.0f);
			light_position[0] = 100.0f*sin(angleOfYRotation);
			light_position[1] = 100.0f*cos(angleOfYRotation);
			light_position[2] = 0.0f;
			light_position[3] = 1.0f;
		}
		glUniform4fv(lightPositionUniform, 1, light_position);
	}
	else
	{
		glUniform1i(isLkeyPressedUniform, 0);
	}

	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
	//
	
	draw24Sphere();	//unuse program
	glUseProgram(0);
	glXSwapBuffers(gpDisplay,gWindow);
	if (angleOfYRotation >= 360.0f)
		angleOfYRotation = 0.0f;
	else
		angleOfYRotation += 0.1f;

}
void draw24Sphere()
{
	float MaterialAmbience[4];
	float MaterialDiffuse[4];
	float MaterialSpecular[4];
	float MaterialShininess[1];
	
	//1st sphere on 1st column Emerald
	MaterialAmbience[0] = 0.0215f;
	MaterialAmbience[1] = 0.1745f;
	MaterialAmbience[2] = 0.0215f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);
	
	MaterialDiffuse[0] = 0.7568f;
	MaterialDiffuse[1] = 0.61424f;
	MaterialDiffuse[2] = 0.07568f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);
	
	MaterialSpecular[0] = 0.633f;
	MaterialSpecular[1] = 0.727811f;
	MaterialSpecular[2] = 0.633f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);
	
	MaterialShininess[0] = 0.6*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	//translationMatrix = translate(-150.0f, 80.0f, -10.0f);
	translationMatrix = translate(-0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(20.0f, 20.0f, 20.0f);
	glViewport(0, 650, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication
	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	glBindBuffer(GL_ARRAY_BUFFER, gVbo_sphere_position);
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_vertices),
		sphere_vertices, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	// normal vbo
	glBindBuffer(GL_ARRAY_BUFFER, gVbo_sphere_normal);
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_normals), sphere_normals, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	// element vbo
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphere_elements), sphere_elements, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
	
	// *** bind vao ***z
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	
	//2nd sphere on 1st column jade
	MaterialAmbience[0] = 0.135f;
	MaterialAmbience[1] = 0.2225f;
	MaterialAmbience[2] = 0.1575f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.54f;
	MaterialDiffuse[1] = 0.89f;
	MaterialDiffuse[2] = 0.63f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.316228f;
	MaterialSpecular[1] = 0.316228f;
	MaterialSpecular[2] = 0.316228f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);
	
	MaterialShininess[0] = 0.1*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(0, 525, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication
//	glViewport(600, 100, 220, 220);
	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);


	//3rd sphere on 1st column obsidien
	MaterialAmbience[0] = 0.05375f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.06625f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.18275f;
	MaterialDiffuse[1] = 0.17f;
	MaterialDiffuse[2] = 0.22525f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.332741f;
	MaterialSpecular[1] = 0.328634f;
	MaterialSpecular[2] = 0.346435f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.3*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(0, 400, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);

	//4th sphere on 1st column pearl
	MaterialAmbience[0] = 0.25f;
	MaterialAmbience[1] = 0.20725f;
	MaterialAmbience[2] = 0.20725f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 1.0f;
	MaterialDiffuse[1] = 0.829f;
	MaterialDiffuse[2] = 0.829f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.296648f;
	MaterialSpecular[1] = 0.296648f;
	MaterialSpecular[2] = 0.296648f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.088*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(0, 275, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);

	//5th sphere on 1st column ruby
	MaterialAmbience[0] = 0.1745f;
	MaterialAmbience[1] = 0.01175f;
	MaterialAmbience[2] = 0.01175f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.61424f;
	MaterialDiffuse[1] = 0.04136f;
	MaterialDiffuse[2] = 0.04136f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.727811f;
	MaterialSpecular[1] = 0.626959f;
	MaterialSpecular[2] = 0.626959f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.6*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(0, 150, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);

	//6th sphere on 1st column turquoise
	MaterialAmbience[0] = 0.1f;
	MaterialAmbience[1] = 0.18725f;
	MaterialAmbience[2] = 0.1745f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.396f;
	MaterialDiffuse[1] = 0.74151f;
	MaterialDiffuse[2] = 0.69102f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.297254f;
	MaterialSpecular[1] = 0.30829f;
	MaterialSpecular[2] = 0.306678f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.1*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);

	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication
	glViewport(0, 25, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);

	//1st sphere on 2nd column brass
	MaterialAmbience[0] = 0.329412f;
	MaterialAmbience[1] = 0.223529f;
	MaterialAmbience[2] = 0.027451f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.780392f;
	MaterialDiffuse[1] = 0.568627f;
	MaterialDiffuse[2] = 0.113725f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.992157f;
	MaterialSpecular[1] = 0.941176f;
	MaterialSpecular[2] = 0.807843f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.21794872*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(375, 650, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//2nd sphere on 2nd column bronze
	MaterialAmbience[0] = 0.2125f;
	MaterialAmbience[1] = 0.1275f;
	MaterialAmbience[2] = 0.054f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.714f;
	MaterialDiffuse[1] = 0.4284f;
	MaterialDiffuse[2] = 0.18144f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.393548f;
	MaterialSpecular[1] = 0.271906f;
	MaterialSpecular[2] = 0.166721f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialShininess[0] = 0.2*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(375, 525, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);

	//3rd sphere on 2nd column chrome
	MaterialAmbience[0] = 0.25f;
	MaterialAmbience[1] = 0.25f;
	MaterialAmbience[2] = 0.25f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.4f;
	MaterialDiffuse[1] = 0.4f;
	MaterialDiffuse[2] = 0.4f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.774597f;
	MaterialSpecular[1] = 0.774597f;
	MaterialSpecular[2] = 0.774597f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.6*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(375, 400, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//4th sphere on 2nd column copper
	MaterialAmbience[0] = 0.19125f;
	MaterialAmbience[1] = 0.0735f;
	MaterialAmbience[2] = 0.0225f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.7038f;
	MaterialDiffuse[1] = 0.27048f;
	MaterialDiffuse[2] = 0.0828f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.256777f;
	MaterialSpecular[1] = 0.137622f;
	MaterialSpecular[2] = 0.086014f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.1*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(375, 275, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//5th sphere on 2nd column gold
	MaterialAmbience[0] = 0.24725f;
	MaterialAmbience[1] = 0.1995f;
	MaterialAmbience[2] = 0.0745f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.75164f;
	MaterialDiffuse[1] = 0.60648f;
	MaterialDiffuse[2] = 0.22648f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.628281f;
	MaterialSpecular[1] = 0.555802f;
	MaterialSpecular[2] = 0.366065f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.4*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(375, 150, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//6th sphere on 2nd column silver
	MaterialAmbience[0] = 0.19225f;
	MaterialAmbience[1] = 0.19225f;
	MaterialAmbience[2] = 0.19225f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.50754f;
	MaterialDiffuse[1] = 0.50754f;
	MaterialDiffuse[2] = 0.50754f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.508273f;
	MaterialSpecular[1] = 0.508273f;
	MaterialSpecular[2] = 0.508273f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.4*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(375, 25, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	
	//1st sphere on 3rd column black plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.01f;
	MaterialDiffuse[1] = 0.01f;
	MaterialDiffuse[2] = 0.01f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.50f;
	MaterialSpecular[1] = 0.50f;
	MaterialSpecular[2] = 0.50f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(750, 650, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//2nd sphere on 3rd column cyan plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.1f;
	MaterialAmbience[2] = 0.06f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.0f;
	MaterialDiffuse[1] = 0.50980392f;
	MaterialDiffuse[2] = 0.50980392f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.50196078f;
	MaterialSpecular[1] = 0.50196078f;
	MaterialSpecular[2] = 0.50196078f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(750, 525, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//3rd sphere on 3rd column green plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.1f;
	MaterialDiffuse[1] = 0.35f;
	MaterialDiffuse[2] = 0.1f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.45f;
	MaterialSpecular[1] = 0.55f;
	MaterialSpecular[2] = 0.45f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(750, 400, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//4th sphere on 3rd column red plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.0f;
	MaterialDiffuse[2] = 0.0f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.7f;
	MaterialSpecular[1] = 0.6f;
	MaterialSpecular[2] = 0.6f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(750, 275, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//5th sphere on 3rd column white plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.55f;
	MaterialDiffuse[1] = 0.55f;
	MaterialDiffuse[2] = 0.55f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.70f;
	MaterialSpecular[1] = 0.70f;
	MaterialSpecular[2] = 0.70f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(750, 150, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//6th sphere on 3rd column yellow plastic
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.0f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.60f;
	MaterialSpecular[1] = 0.60f;
	MaterialSpecular[2] = 0.50f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.25*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(750, 25, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//1st sphere on 4th column black rubber
	MaterialAmbience[0] = 0.02f;
	MaterialAmbience[1] = 0.02f;
	MaterialAmbience[2] = 0.02f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.01f;
	MaterialDiffuse[1] = 0.01f;
	MaterialDiffuse[2] = 0.01f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.40f;
	MaterialSpecular[1] = 0.40f;
	MaterialSpecular[2] = 0.40f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(1125, 650, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);

	//2nd sphere on 4th column cyan rubber
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.05f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.4f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.5f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.04f;
	MaterialSpecular[1] = 0.7f;
	MaterialSpecular[2] = 0.7f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(1125, 525, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
	//3rd sphere on 4th column green rubber
	MaterialAmbience[0] = 0.0f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.4f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.4f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.04f;
	MaterialSpecular[1] = 0.7f;
	MaterialSpecular[2] = 0.04f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(1125, 400, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);

	//4th sphere on 4th column red rubber
	MaterialAmbience[0] = 0.05f;
	MaterialAmbience[1] = 0.0f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.4f;
	MaterialDiffuse[2] = 0.4f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.7f;
	MaterialSpecular[1] = 0.04f;
	MaterialSpecular[2] = 0.04f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(1125, 275, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);

	//5th sphere on 4th column white rubber
	MaterialAmbience[0] = 0.05f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.05f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.5f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.70f;
	MaterialSpecular[1] = 0.70f;
	MaterialSpecular[2] = 0.70f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(1125, 150, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);

	//6th sphere on 4th column yellow rubber
	MaterialAmbience[0] = 0.05f;
	MaterialAmbience[1] = 0.05f;
	MaterialAmbience[2] = 0.0f;
	MaterialAmbience[3] = 1.0f;
	glUniform3fv(kaUniform, 1, MaterialAmbience);

	MaterialDiffuse[0] = 0.5f;
	MaterialDiffuse[1] = 0.5f;
	MaterialDiffuse[2] = 0.4f;
	MaterialDiffuse[3] = 1.0f;
	glUniform3fv(kdUniform, 1, MaterialDiffuse);

	MaterialSpecular[0] = 0.7f;
	MaterialSpecular[1] = 0.7f;
	MaterialSpecular[2] = 0.04f;
	MaterialSpecular[3] = 1.0f;
	glUniform3fv(ksUniform, 1, MaterialSpecular);

	MaterialShininess[0] = 0.078125*128.0f;
	glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
	
	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	//scaleMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	translationMatrix = translate(0.0f, 0.0f, -2.0f);
	//scaleMatrix = scale(0.25f, 0.25f, 0.25f);
	glViewport(1125, 25, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_sphere);
	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);
	// unbind vao
	glBindVertexArray(0);
}
void update()
{
	angleOfXRotation += 0.5f;
	//if (angleOfXRotation >= 360.0f)
		//angleOfXRotation = 0.0f;
	angleOfYRotation += 0.5f;
	//if (angleOfYRotation >= 360.0f)
		//angleOfYRotation = 0.0f;
	angleOfZRotation += 0.5f;
	//if (angleOfZRotation >= 360.0f)
		//angleOfZRotation = 0.0f;
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
        if (vbo_sphere_element)
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
	}
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


