#include<Windows.h>
#include<GL/glew.h>
#include<gl/GL.h>
#include<stdio.h>
#include "vmath.h"
#include "Sphere.h"

#pragma comment(lib,"glew32.lib")
#pragma comment(lib,"opengl32.lib")
#pragma comment(lib,"Sphere.lib")


#define WIN_WIDTH 800
#define WIN_HEIGHT 600

using namespace vmath;

enum {
	AMC_ATTRIBUTE_POSITION = 0,
	AMC_ATTRIBUTE_COLOR,
	AMC_ATTRIBUTE_NORMAL,
	AMC_ATTRIBUTE_TEXCOORD0
};

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

bool bFullScreen = false;
HWND ghHwnd = NULL;
DWORD dwStyle;
WINDOWPLACEMENT wpPrev = { sizeof(WINDOWPLACEMENT) };
HDC ghdc = NULL;
HGLRC ghrc = NULL;
bool gbActiveWindow = false;
FILE *gpFile = NULL;

static GLfloat angle_tri = 0.0f;
static GLfloat angle_rect = 0.0f;
int currentWidth;
int currentHeight;
GLint gVertexShaderObject;
GLint gFragmentShaderObject;
GLint gShaderProgramObject;

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

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpszCmdLine, int iCmdShow)
{
	//function Declarations
	int initialize(void);
	void Display();
	bool bDone = false;
	int iRet = 0;
	WNDCLASSEX wndclass;
	HWND hwnd;
	MSG msg;
	TCHAR szAppName[] = TEXT("Perspective Projection - Triangle");
	wndclass.cbSize = sizeof(WNDCLASSEX);
	wndclass.style = CS_HREDRAW | CS_VREDRAW | CS_OWNDC;
	wndclass.cbClsExtra = 0;
	wndclass.cbWndExtra = 0;
	wndclass.lpfnWndProc = WndProc;
	wndclass.hInstance = hInstance;
	wndclass.hIcon = LoadIcon(NULL, IDI_APPLICATION);
	wndclass.hCursor = LoadCursor(NULL, IDC_ARROW);
	wndclass.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
	wndclass.lpszClassName = szAppName;
	wndclass.lpszMenuName = NULL;
	wndclass.hIconSm = LoadIcon(NULL, IDI_APPLICATION);

	RegisterClassEx(&wndclass);

	if (fopen_s(&gpFile, "log.txt", "w") != 0)
	{
		MessageBox(NULL, TEXT("Log file canont be created"), TEXT("Error"), MB_OK);
		exit(0);
	}
	else
	{
		fprintf(gpFile, "\nLog file is created\n");
		//fprintf();
	}

	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("24 Sphere"),
		WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE,
		100,
		100,
		WIN_WIDTH,
		WIN_HEIGHT,
		NULL,
		NULL,
		hInstance,
		NULL);
	ghHwnd = hwnd;
	iRet = initialize();

	if (iRet == -1)
	{
		fprintf(gpFile, "\nChoose pixel format Failed\n");
		DestroyWindow(hwnd);
	}
	else if (iRet == -2)
	{
		fprintf(gpFile, "\nSet pixel format Failed\n");
		DestroyWindow(hwnd);
	}
	else if (iRet == -3)
	{
		fprintf(gpFile, "\nwglCreateContext Failed\n");
		DestroyWindow(hwnd);
	}
	else if (iRet == -4)
	{
		fprintf(gpFile, "\nwglMakeCurrent Failed\n");
		DestroyWindow(hwnd);
	}
	else
	{
		fprintf(gpFile, "\nInitialization Succeeded\n");

	}
	ShowWindow(hwnd, iCmdShow);
	//UpdateWindow(hwnd);
	SetForegroundWindow(hwnd);
	SetFocus(hwnd);


	while (bDone == false)
	{
		if (PeekMessage(&msg, NULL, 0, 0, PM_REMOVE))
		{
			if (msg.message == WM_QUIT)
			{
				bDone = true;
			}
			else
			{
				TranslateMessage(&msg);
				DispatchMessage(&msg);
			}
		}
		else
		{

		}
		Display();
	}
	return ((int)msg.wParam);
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT iMsg, WPARAM wParam, LPARAM lParam)
{
	void ToggleFullScreen();
	void Resize(int, int);
	void uninitialize();
	void ShadersToggle();
	switch (iMsg)
	{
	case WM_SETFOCUS:
		gbActiveWindow = true;
		break;
	case WM_KILLFOCUS:
		gbActiveWindow = false;
		break;
	case WM_SIZE:
		Resize(LOWORD(lParam), HIWORD(lParam));
		break;
	case WM_ERASEBKGND:
		return 0;
	case WM_CLOSE:
		DestroyWindow(hwnd);
		break;
	case WM_KEYDOWN:
		switch (wParam)
		{
		case VK_ESCAPE:
			ToggleFullScreen();
			fprintf(gpFile, "\nESC key is pressed\n");
			break;
		case 0x46:
			if (gbIsFragmentShader == false)
			{
				gbIsFragmentShader = true;
				gbIsVertexShader = false;
			}
			else
			{
				gbIsFragmentShader = false; 
				gbIsVertexShader = true;
			}
			fprintf(gpFile, "\nF key is pressed\n");
			ShadersToggle();
			break;
		}
		break;
	case WM_CHAR:
		switch (wParam)
		{
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
			fprintf(gpFile, "\nL key is pressed\n");
			break;
		case 'q':case 'Q':
			if (bFullScreen == true)
				ToggleFullScreen();
			fprintf(gpFile, "\nQ key is pressed\n");
			DestroyWindow(hwnd);
			break;
		case 'v':case 'V':
			if (gbIsVertexShader == false)
			{
				gbIsVertexShader = true;
				gbIsFragmentShader = false;
			}
			else
			{
				gbIsVertexShader = false;
				gbIsFragmentShader = true;
			}
			fprintf(gpFile, "\nV key is pressed\n");
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
		}
		break;
	case WM_DESTROY:
		uninitialize();
		PostQuitMessage(0);
		break;
	}
	return DefWindowProc(hwnd, iMsg, wParam, lParam);
}

void ToggleFullScreen()
{
	MONITORINFO mi;
	if (bFullScreen == false)
	{
		dwStyle = GetWindowLong(ghHwnd, GWL_STYLE);
		if (dwStyle & WS_OVERLAPPEDWINDOW)
		{
			mi = { sizeof(MONITORINFO) };
			if (GetWindowPlacement(ghHwnd, &wpPrev) && GetMonitorInfo(MonitorFromWindow(ghHwnd, MONITORINFOF_PRIMARY), &mi))
			{
				SetWindowLong(ghHwnd, GWL_STYLE, dwStyle & ~WS_OVERLAPPEDWINDOW);
				SetWindowPos(ghHwnd,
					HWND_TOP,
					mi.rcMonitor.left,
					mi.rcMonitor.top,
					mi.rcMonitor.right - mi.rcMonitor.left,
					mi.rcMonitor.bottom - mi.rcMonitor.top,
					SWP_NOZORDER | SWP_FRAMECHANGED);
			}
		}
		ShowCursor(FALSE);
		bFullScreen = true;
	}
	else
	{
		SetWindowLong(ghHwnd, GWL_STYLE, dwStyle | WS_OVERLAPPEDWINDOW);
		SetWindowPlacement(ghHwnd, &wpPrev);
		SetWindowPos(ghHwnd,
			HWND_TOP,
			0,
			0,
			0,
			0,
			SWP_NOZORDER | SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOOWNERZORDER);
		ShowCursor(TRUE);
		bFullScreen = false;
	}
}
void ShadersToggle()
{
	void uninitialize();
	//define vertex shader object
	gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);

	//write vertex shader code
	const GLchar *vertexShaderSourceCodePerFragment =
		"#version 330 core" \
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
		"		mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" \
		"		transformedNormal=normalMatrix*vNormal;" \
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
		"#version 330 core" \
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
		"uniform float u_MaterialShininess;" \
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
		"		vec3 specular=u_ls*u_ks*pow(max(dot(reflection_vector,viewer_vector),0.0f),u_MaterialShininess);" \
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
		fwprintf(gpFile, TEXT("\nvertexShaderSourceCodePerFragment attached to the shader source\n"));
	}
	else
	{
		glShaderSource(gVertexShaderObject, 1,
			(const GLchar**)&vertexShaderSourceCodePerVertex,
			NULL);
		fwprintf(gpFile, TEXT("\nvertexShaderSourceCodePerVertex attached to the shader source\n"));
	}


	glCompileShader(gVertexShaderObject);
	GLint iShaderCompileStatus = 0;
	GLint iInfoLogLength = 0;
	GLchar *szInfoLog = NULL;

	glGetShaderiv(gVertexShaderObject,
		GL_COMPILE_STATUS,
		&iShaderCompileStatus);
	fwprintf(gpFile, TEXT("\nValue of ivertex shader compile Status is : %d\n"), iShaderCompileStatus);
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
				fwprintf(gpFile, TEXT("Error in compiling vertex Shader : %hs\n"), szInfoLog);
				free(szInfoLog);
				uninitialize();
				DestroyWindow(ghHwnd);
			}
		}
	}

	//define Fragment shader object
	gFragmentShaderObject = glCreateShader(GL_FRAGMENT_SHADER);

	//write fragment shader code
	const GLchar *fragmentShaderSourceCodePerFragment =
		"#version 330 core" \
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
		"uniform float u_MaterialShininess;" \
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
		"		vec3 specular=u_ls*u_ks*pow(max(dot(normalized_reflection_vector,normalized_viewer_vector),0.0f),u_MaterialShininess);" \
		"		vec3 phong_ads_light=ambient+diffuse+specular;" \
		"		FragColor=vec4(phong_ads_light,1.0);" \
		"	}" \
		"	else" \
		"	{" \
		"		FragColor=vec4(white,1.0);" \
		"	}" \
		"}";

	const GLchar *fragmentShaderSourceCodePerVertex =
		"#version 330 core" \
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
		fwprintf(gpFile, TEXT("\nfragmentShaderSourceCodePerVertex attached to the shader source\n"));
	}
	else
	{
		glShaderSource(gFragmentShaderObject, 1,
			(const GLchar**)&fragmentShaderSourceCodePerFragment,
			NULL);
		fwprintf(gpFile, TEXT("\nfragmentShaderSourceCodePerFragment attached to the shader source\n"));
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
	fwprintf(gpFile, TEXT("Value of ifragment shader compile Status is : %d\n"), iShaderCompileStatus);
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
				fwprintf(gpFile, TEXT("Error in compiling Fragment Shader : %hs\n"), szInfoLog);
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
	fwprintf(gpFile, TEXT("\nattach comp\n"));
	glLinkProgram(gShaderProgramObject);
	//ErrorCheck for linking

	GLint iProgramLinkStatus = 0;
	iInfoLogLength = 0;
	szInfoLog = NULL;

	glGetProgramiv(gShaderProgramObject,
		GL_LINK_STATUS,
		&iProgramLinkStatus);
	fwprintf(gpFile, TEXT("Value of iProgramLinkStatus is : %d\n"), iProgramLinkStatus);
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
				fwprintf(gpFile, TEXT("Error in Linking Shader : %hs\n"), szInfoLog);
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
	laUniform = glGetUniformLocation(gShaderProgramObject, "u_la");
	ldUniform = glGetUniformLocation(gShaderProgramObject, "u_ld");
	lsUniform = glGetUniformLocation(gShaderProgramObject, "u_ls");
	lightPositionUniform = glGetUniformLocation(gShaderProgramObject, "u_lightPosition");
	kaUniform = glGetUniformLocation(gShaderProgramObject, "u_ka");
	kdUniform = glGetUniformLocation(gShaderProgramObject, "u_kd");
	ksUniform = glGetUniformLocation(gShaderProgramObject, "u_ks");
	MaterialShininessUniform = glGetUniformLocation(gShaderProgramObject, "u_MaterialShininess");
	isLkeyPressedUniform = glGetUniformLocation(gShaderProgramObject, "u_LkeyIsPressed");

}
int initialize(void)
{
	void Resize(int, int);
	void uninitialize(void);
	void ShadersToggle();
	PIXELFORMATDESCRIPTOR pfd;
	int iPixelFormatIndex;
	GLenum result;

	//initialize the pfd structure

	//memset((void*)&pfd,NULL,sizeof(PIXELFORMATDESCRIPTOR));
	//	or
	ZeroMemory(&pfd, sizeof(PIXELFORMATDESCRIPTOR));

	pfd.nSize = sizeof(PIXELFORMATDESCRIPTOR);
	pfd.nVersion = 1;
	pfd.dwFlags = PFD_DRAW_TO_WINDOW | PFD_SUPPORT_OPENGL | PFD_DOUBLEBUFFER;
	pfd.iPixelType = PFD_TYPE_RGBA;
	pfd.cColorBits = 32;
	pfd.cRedBits = 8;
	pfd.cBlueBits = 8;
	pfd.cGreenBits = 8;
	pfd.cAlphaBits = 8;
	pfd.cDepthBits = 32;

	ghdc = GetDC(ghHwnd);
	iPixelFormatIndex = ChoosePixelFormat(ghdc, &pfd);
	if (iPixelFormatIndex == 0)
	{
		return -1;
	}
	if (SetPixelFormat(ghdc, iPixelFormatIndex, &pfd) == FALSE)
	{
		return -2;
	}
	ghrc = wglCreateContext(ghdc);
	if (ghrc == NULL)
	{
		return -3;
	}
	if (wglMakeCurrent(ghdc, ghrc) == FALSE)
	{
		return -4;
	}
	result = glewInit();
	fwprintf(gpFile, TEXT("\nValue of ivertex shader compile Status is : %d\n"), result);
	if (result != GLEW_OK)
	{
		fprintf(gpFile, "\nGLEW Init Failed\n");
		uninitialize();
		DestroyWindow(ghHwnd);
	}
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
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_vertices), NULL, GL_DYNAMIC_DRAW);

	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);

	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);

	glBindBuffer(GL_ARRAY_BUFFER, 0);

	// normal vbo
	glGenBuffers(1, &gVbo_sphere_normal);
	glBindBuffer(GL_ARRAY_BUFFER, gVbo_sphere_normal);
	glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_normals), NULL, GL_DYNAMIC_DRAW);

	glVertexAttribPointer(AMC_ATTRIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 0, NULL);

	glEnableVertexAttribArray(AMC_ATTRIBUTE_NORMAL);

	glBindBuffer(GL_ARRAY_BUFFER, 0);

	// element vbo
	glGenBuffers(1, &vbo_sphere_element);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphere_elements), NULL, GL_DYNAMIC_DRAW);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);

	// unbind vao
	glBindVertexArray(0);
	/////////////////////////////////////////////////////////
	glClearColor(0.25f, 0.25f, 0.25f, 1.0f);
	glClearDepth(1.0f);
	projectionMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	modelMatrix = mat4::identity();
	Resize(WIN_WIDTH, WIN_HEIGHT);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	return 0;
}
void Resize(int width, int height)
{
	currentWidth = width;
	currentHeight = height;
	projectionMatrix = mat4::identity();
	if (height == 0)
		height = 1;
	//glViewport(0, 0, GLsizei(width), GLsizei(height));
	/*projectionMatrix = perspective(45.0f,
		(GLfloat)width / (GLfloat)height,
		0.1f,
		100.0f);*/
	projectionMatrix = perspective(45.0f,
		((GLfloat)width / (GLfloat)height),
		0.01f,
		100.0f);
}
void Display(void)
{
	void draw24Sphere();
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
	//getSphereVertexData(sphere_vertices, sphere_normals, sphere_textures, sphere_elements);
	//gNumVertices = getNumberOfSphereVertices();
	//gNumElements = getNumberOfSphereElements();

	//glBindBuffer(GL_ARRAY_BUFFER, gVbo_sphere_position);
	//glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_vertices),
	//	sphere_vertices, GL_DYNAMIC_DRAW);
	//glBindBuffer(GL_ARRAY_BUFFER, 0);

	//// normal vbo
	//glBindBuffer(GL_ARRAY_BUFFER, gVbo_sphere_normal);
	//glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_normals), sphere_normals, GL_DYNAMIC_DRAW);
	//glBindBuffer(GL_ARRAY_BUFFER, 0);

	//// element vbo
	//glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	//glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphere_elements), sphere_elements, GL_DYNAMIC_DRAW);
	//glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);

	/*
	// *** bind vao ***
	glBindVertexArray(vao_sphere);

	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);

	// *** unbind vao ***
	glBindVertexArray(0);*/
	
	draw24Sphere();
	//unuse program
	glUseProgram(0);
	SwapBuffers(ghdc);
	
	if (angleOfYRotation >= 360.0f)
		angleOfYRotation = 0.0f;
	else
		angleOfYRotation += 0.01f;

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
	glViewport(0, 600, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(0, 500, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
	modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication
//	glViewport(600, 100, 220, 220);
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

	// *** bind vao ***
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
	glViewport(0, 300, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(0, 200, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(0, 100, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(300, 600, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(300, 500, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(300, 400, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(300, 300, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(300, 200, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(300, 100, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(600, 600, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(600, 500, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(600, 400, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(600, 300, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(600, 200, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(600, 100, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(900, 600, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(900, 500, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(900, 400, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(900, 300, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(900, 200, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
	glViewport(900, 100, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
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
void uninitialize()
{
	if (bFullScreen == true)
	{
		SetWindowLong(ghHwnd, GWL_STYLE, dwStyle | WS_OVERLAPPEDWINDOW);
		SetWindowPlacement(ghHwnd, &wpPrev);
		SetWindowPos(ghHwnd,
			HWND_TOP,
			0,
			0,
			0,
			0,
			SWP_NOZORDER | SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOOWNERZORDER);
		ShowCursor(TRUE);
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
	if (wglGetCurrentContext() == ghrc)
	{
		wglMakeCurrent(NULL, NULL);
	}
	if (ghrc)
	{
		wglDeleteContext(ghrc);
		ghrc = NULL;
	}
	if (ghdc)
	{
		ReleaseDC(ghHwnd, ghdc);
		ghdc = NULL;
	}
	if (gpFile)
	{
		fprintf(gpFile, "Log File is Closed\n========================================================================\n");
		fclose(gpFile);
		gpFile = NULL;
	}

}














