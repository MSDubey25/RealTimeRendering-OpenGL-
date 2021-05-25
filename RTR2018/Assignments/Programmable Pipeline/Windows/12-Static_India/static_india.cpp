#include<Windows.h>
#include<GL/glew.h>
#include<gl/GL.h>
#include<stdio.h>
#include "vmath.h"
#define _USE_MATH_DEFINES 1
#include<math.h>
#define num 1000;

#pragma comment(lib,"glew32.lib")
#pragma comment(lib,"opengl32.lib")


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
		fprintf(gpFile, "Log file is created\n");
		//fprintf();
	}

	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("Static India PP"),
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
		fprintf(gpFile, "Choose pixel format Failed\n");
		DestroyWindow(hwnd);
	}
	else if (iRet == -2)
	{
		fprintf(gpFile, "Set pixel format Failed\n");
		DestroyWindow(hwnd);
	}
	else if (iRet == -3)
	{
		fprintf(gpFile, "wglCreateContext Failed\n");
		DestroyWindow(hwnd);
	}
	else if (iRet == -4)
	{
		fprintf(gpFile, "wglMakeCurrent Failed\n");
		DestroyWindow(hwnd);
	}
	else
	{
		fprintf(gpFile, "Initialization Succeeded\n");

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
			if (bFullScreen == true)
				ToggleFullScreen();
			DestroyWindow(hwnd);
			break;
		case 0x46:
			ToggleFullScreen();
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
int initialize(void)
{
	void Resize(int, int);
	void uninitialize(void);

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
	fwprintf(gpFile, TEXT("Value of ivertex shader compile Status is : %d"), result);
	if (result != GLEW_OK)
	{
		fprintf(gpFile, "GLEW Init Failed\n");
		uninitialize();
		DestroyWindow(ghHwnd);
	}
	//define vertex shader object
	gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);

	//write vertex shader code
	const GLchar *vertexShaderSourceCode =
		"#version 330 core" \
		"\n" \
		"in vec4 vPosition;" \
		"in vec4 vColor;" \
		"uniform mat4 u_mvp_matrix;" \
		"out vec4 out_color;" \
		"void main(void)" \
		"{" \
		"gl_Position=u_mvp_matrix * vPosition;" \
		"out_color=vColor;" \
		"}";

	//specify above source code to vertexShaderObject
	glShaderSource(gVertexShaderObject, 1,
		(const GLchar**)&vertexShaderSourceCode,
		NULL);
	glCompileShader(gVertexShaderObject);
	GLint iShaderCompileStatus = 0;
	GLint iInfoLogLength = 0;
	GLchar *szInfoLog = NULL;

	glGetShaderiv(gVertexShaderObject,
		GL_COMPILE_STATUS,
		&iShaderCompileStatus);
	fwprintf(gpFile, TEXT("Value of ivertex shader compile Status is : %d"), iShaderCompileStatus);
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
				fwprintf(gpFile, TEXT("Error in compiling vertex Shader : %hs"), szInfoLog);
				free(szInfoLog);
				uninitialize();
				DestroyWindow(ghHwnd);
			}
		}
	}

	//define Fragment shader object
	gFragmentShaderObject = glCreateShader(GL_FRAGMENT_SHADER);

	//write fragment shader code
	const GLchar *fragmentShaderSourceCode =
		"#version 330 core" \
		"\n" \
		"in vec4 out_color;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{" \
		"FragColor=out_color;" \
		"}";

	//specify above source code to FragmentShaderObject
	glShaderSource(gFragmentShaderObject, 1,
		(const GLchar**)&fragmentShaderSourceCode,
		NULL);
	glCompileShader(gFragmentShaderObject);

	iShaderCompileStatus = 0;
	iInfoLogLength = 0;
	szInfoLog = NULL;

	glGetShaderiv(gFragmentShaderObject,
		GL_COMPILE_STATUS,
		&iShaderCompileStatus);
	fwprintf(gpFile, TEXT("Value of ifragment shader compile Status is : %d"), iShaderCompileStatus);
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
				fwprintf(gpFile, TEXT("Error in compiling Fragment Shader : %hs"), szInfoLog);
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
	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_COLOR, "vColor");
	//Link the shader program
	fwprintf(gpFile, TEXT("attach comp\n"));
	glLinkProgram(gShaderProgramObject);
	//ErrorCheck for linking

	GLint iProgramLinkStatus = 0;
	iInfoLogLength = 0;
	szInfoLog = NULL;

	glGetProgramiv(gShaderProgramObject,
		GL_LINK_STATUS,
		&iProgramLinkStatus);
	fwprintf(gpFile, TEXT("Value of iProgramLinkStatus is : %d"), iProgramLinkStatus);
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
				fwprintf(gpFile, TEXT("Error in Linking Shader : %hs"), szInfoLog);
				free(szInfoLog);
				uninitialize();
				//DestroyWindow(ghHwnd);
			}
		}
	}

	//post linking retrieving uniform location
	mvpUniform = glGetUniformLocation(gShaderProgramObject, "u_mvp_matrix");

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
	/////////////////////////////////////////////////////////
	
	/////////////////////////////////////////////////////////
	
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	glClearDepth(1.0f);
	perspectiveProjectionMatrix = mat4::identity();
	Resize(WIN_WIDTH, WIN_HEIGHT);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	return 0;
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
void Display(void)
{
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
	1.0f, 0.6f, 0.2f ,	 //for D
	1.0f, 0.6f, 0.2f ,	 //for D
	0.071f, 0.533f, 0.027f , //for D
	0.071f, 0.533f, 0.027f , //for D
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
	translationMatrix = translate(0.0f,0.0f,-3.0f);
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
	
	translationMatrix = translate(0.2f, 0.0f, 0.0f);
	modelViewMatrix = translationMatrix*modelViewMatrix;
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

	translationMatrix = translate(0.05f, 0.0f, 0.0f);
	modelViewMatrix = translationMatrix * modelViewMatrix;
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

	translationMatrix = translate(1.6f, 0.0f, 0.0f);
	modelViewMatrix = translationMatrix * modelViewMatrix;
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
	translationMatrix = translate(0.2f, 0.0f, -3.0f);
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
	
	modelViewMatrix = mat4::identity();
	translationMatrix = translate(1.055f, 0.0f, -3.0f);
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
	modelViewMatrix = mat4::identity();
	translationMatrix = translate(1.15f, 0.0f, -3.0f);
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

	//unuse program
	glUseProgram(0);
	SwapBuffers(ghdc);
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
	glUseProgram(gShaderProgramObject);
	glDetachShader(gShaderProgramObject, GL_FRAGMENT_SHADER);
	glDetachShader(gShaderProgramObject, GL_VERTEX_SHADER);
	glDeleteShader(gFragmentShaderObject);
	gFragmentShaderObject = 0;
	glDeleteShader(gVertexShaderObject);
	gVertexShaderObject = 0;
	glDeleteProgram(gShaderProgramObject);
	gShaderProgramObject = 0;
	glUseProgram(0);
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














