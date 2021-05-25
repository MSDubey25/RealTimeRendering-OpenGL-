#include<Windows.h>
#include<stdio.h>
#include<GL/glew.h>
#include<gl/GL.h>
#include"vmath.h"
#include"Sphere.h"
#include"Stack.h"
#pragma comment(lib,"glew32.lib")
#pragma comment(lib,"opengl32.lib")
#pragma comment(lib,"Sphere.lib")

#define WIN_WIDTH 800
#define WIN_HEIGHT 600

using namespace vmath;

HDC gHdc = NULL;
HGLRC ghrc = NULL;
HWND gHwnd = NULL;

DWORD dwStyle;
WINDOWPLACEMENT wpPrev = { sizeof(WINDOWPLACEMENT) };

bool gbActiveWindow = false;
bool bIsFullScreen = false;
bool bDone = false;
int iRet;
int shoulder = 0, elbow = 0;
//Shaders variable

GLint gVertexShaderObject;
GLint gFragmentShaderObject;
GLint gShaderProgramObject;


//Global Variables

GLuint vao_sphere;
GLuint vbo_position_sphere;
GLuint vbo_normal_sphere;
GLuint vbo_element_sphere;

GLuint vao_sphere1;
GLuint vbo_position_sphere1;
GLuint vbo_normal_sphere1;
GLuint vbo_element_sphere1;

GLuint mvpUniform;
mat4 perspectiveProjectionMatrix;
static GLfloat angle_pyramid = 0.0f, angle_cube = 0.0f;

float sphere_vertices[1146];
float sphere_normals[1146];
float sphere_texture[764];
unsigned short sphere_elements[2280];
int gNumVertices, gNumElements;

enum {
	AMC_ATTRIBUTE_POSITION = 0,
	AMC_ATTRIBUTE_COLOR,
	AMC_ATTIBUTE_NORMAL,
	AMC_ATTRIBUTE_TEXCOORD0
};

FILE * gpFile = NULL;

Stack sp;

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpszCmdLine, int iCmdShow)
{

	int initialize(void);

	void display();
	void Update();
	MSG msg;
	HWND hwnd;
	TCHAR szAppName[] = TEXT("3D Rotation");
	WNDCLASSEX wndclass;

	if (fopen_s(&gpFile, "Log.txt", "w") != 0)
	{
		MessageBox(NULL, TEXT("Log File cannot be created"), TEXT("Error"), MB_OK);
		exit(0);
	}

	wndclass.cbSize = sizeof(WNDCLASSEX);
	wndclass.style = CS_HREDRAW | CS_VREDRAW | CS_OWNDC;
	wndclass.cbWndExtra = 0;
	wndclass.cbClsExtra = 0;
	wndclass.lpfnWndProc = WndProc;
	wndclass.hInstance = hInstance;
	wndclass.hCursor = LoadCursor(NULL, IDC_ARROW);
	wndclass.hIcon = LoadIcon(NULL, IDI_APPLICATION);
	wndclass.hIconSm = LoadIcon(NULL, IDI_APPLICATION);
	wndclass.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
	wndclass.lpszClassName = szAppName;
	wndclass.lpszMenuName = NULL;

	RegisterClassEx(&wndclass);


	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("Robotic Arm"), WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE, 100, 100, WIN_WIDTH, WIN_HEIGHT, NULL, NULL, hInstance, NULL);

	gHwnd = hwnd;
	iRet = initialize();
	if (iRet == -1)
	{
		fprintf(gpFile, "Choose Pixel Format Failed\n");
		DestroyWindow(0);
	}
	else if (iRet == -2)
	{
		fprintf(gpFile, "SetPixel Format failed");
		DestroyWindow(0);
	}
	else if (iRet == -3)
	{
		fprintf(gpFile, "wglCreateContext failed");
		DestroyWindow(0);
	}
	else if (iRet == -4)
	{
		fprintf(gpFile, "wglMakeCurrent failed");
		DestroyWindow(0);
	}
	else
	{
		fprintf(gpFile, "Initialize Function succeded");
	}

	ShowWindow(hwnd, iCmdShow);
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
			if (gbActiveWindow == true)
			{
				Update();
			}

			display();
		}
	}
	return((int)msg.wParam);
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT iMsg, WPARAM wParam, LPARAM lParam)
{
	void resize(int, int);
	void ToggleFullScreen();
	void uninitialize();

	switch (iMsg)
	{
	case WM_KEYDOWN:
		switch (wParam)
		{
		case 0x46:
			if (bIsFullScreen == false)
			{
				ToggleFullScreen();
			}
			else
			{
				ToggleFullScreen();
			}
			break;
		case VK_ESCAPE:
			DestroyWindow(hwnd);
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
		}
		break;
	case WM_SETFOCUS:
		gbActiveWindow = true;
		break;
	case WM_KILLFOCUS:
		gbActiveWindow = false;
		break;
	case WM_SIZE:
		resize(LOWORD(lParam), HIWORD(lParam));
		break;
	case WM_ERASEBKGND:
		return 0;
	case WM_DESTROY:
		uninitialize();
		PostQuitMessage(0);
		break;
	}

	return(DefWindowProc(hwnd, iMsg, wParam, lParam));
}


void ToggleFullScreen(void)
{
	MONITORINFO mi;
	if (bIsFullScreen == false)
	{
		dwStyle = GetWindowLong(gHwnd, GWL_STYLE);
		if (dwStyle & WS_OVERLAPPEDWINDOW)
		{
			mi = { sizeof(MONITORINFO) };

			if (GetWindowPlacement(gHwnd, &wpPrev) && GetMonitorInfo(MonitorFromWindow(gHwnd, MONITORINFOF_PRIMARY), &mi))
			{
				SetWindowLong(gHwnd, GWL_STYLE, dwStyle & ~WS_OVERLAPPEDWINDOW);
				SetWindowPos(gHwnd, HWND_TOP,
					mi.rcMonitor.left,
					mi.rcMonitor.top,
					mi.rcMonitor.right - mi.rcMonitor.left,
					mi.rcMonitor.bottom - mi.rcMonitor.top,
					SWP_NOZORDER | SWP_FRAMECHANGED);
			}
		}
		ShowCursor(false);
		bIsFullScreen = true;
	}

	else
	{
		SetWindowLong(gHwnd, GWL_STYLE, dwStyle | WS_OVERLAPPEDWINDOW);
		SetWindowPlacement(gHwnd, &wpPrev);
		SetWindowPos(gHwnd,
			HWND_TOP,
			0,
			0,
			0,
			0,
			SWP_NOZORDER |
			SWP_FRAMECHANGED |
			SWP_NOMOVE |
			SWP_NOSIZE |
			SWP_NOOWNERZORDER);

		ShowCursor(true);
		bIsFullScreen = false;
	}
}

int initialize()
{
	void resize(int, int);
	PIXELFORMATDESCRIPTOR pfd;
	int iPixelFormatDescriptor;
	GLenum result;
	void uninitialize();
	GLint iShaderCompileStatus = 0;
	GLint iProgramLinkStatus = 0;
	GLint iInfoLogLength = 0;
	GLchar* szInfolog = NULL;


	ZeroMemory(&pfd, sizeof(PIXELFORMATDESCRIPTOR));

	pfd.nSize = sizeof(PIXELFORMATDESCRIPTOR);
	pfd.nVersion = 1;
	pfd.dwFlags = PFD_DRAW_TO_WINDOW |
		PFD_SUPPORT_OPENGL |
		PFD_DOUBLEBUFFER;

	pfd.iPixelType = PFD_TYPE_RGBA;
	pfd.cColorBits = 32;
	pfd.cRedBits = 8;
	pfd.cGreenBits = 8;
	pfd.cBlueBits = 8;
	pfd.cAlphaBits = 8;
	pfd.cDepthBits = 32;

	gHdc = GetDC(gHwnd);
	iPixelFormatDescriptor = ChoosePixelFormat(gHdc, &pfd);

	if (iPixelFormatDescriptor == 0)
	{
		return -1;
	}
	if (SetPixelFormat(gHdc, iPixelFormatDescriptor, &pfd) == FALSE)
	{
		return -2;
	}
	ghrc = wglCreateContext(gHdc);

	if (ghrc == NULL)
	{
		return -3;
	}

	if (wglMakeCurrent(gHdc, ghrc) == FALSE)
	{
		return -4;
	}

	result = glewInit();
	if (result != GLEW_OK)
	{
		uninitialize();
		fprintf(gpFile, "Inside GLEW\n");
		DestroyWindow(gHwnd);
	}


	gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);

	//write vertex shader code.
	const GLchar* vertexShaderSourceCode =
		"#version 330" \
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


	glShaderSource(gVertexShaderObject, 1, (const GLchar **)&vertexShaderSourceCode, NULL);
	glCompileShader(gVertexShaderObject);

	glGetShaderiv(gVertexShaderObject, GL_COMPILE_STATUS, &iShaderCompileStatus);

	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gVertexShaderObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);

		if (iInfoLogLength > 0)
		{
			szInfolog = (GLchar *)malloc(iInfoLogLength);
			if (szInfolog != NULL)
			{
				GLsizei written;

				glGetShaderInfoLog(gVertexShaderObject, iInfoLogLength, &written, szInfolog);
				fprintf(gpFile, "Inside Vertex Shader %s", szInfolog);
				free(szInfolog);

				uninitialize();
				DestroyWindow(0);
				exit(0);
			}
		}
	}


	//For Fragment Shader.

	gFragmentShaderObject = glCreateShader(GL_FRAGMENT_SHADER);

	const GLchar* fragmentShaderSourceCode =
		"#version 330" \
		"\n" \
		"in vec4 out_color;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{" \
		"FragColor=vec4(0.5, 0.35, 0.05,1.0);" \
		"}";

	glShaderSource(gFragmentShaderObject, 1, (const GLchar **)&fragmentShaderSourceCode, NULL);
	glCompileShader(gFragmentShaderObject);

	glGetShaderiv(gFragmentShaderObject, GL_COMPILE_STATUS, &iShaderCompileStatus);

	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gFragmentShaderObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);

		if (iInfoLogLength > 0)
		{
			szInfolog = (GLchar *)malloc(iInfoLogLength);
			if (szInfolog != NULL)
			{
				GLsizei written;

				glGetShaderInfoLog(gFragmentShaderObject, iInfoLogLength, &written, szInfolog);
				fprintf(gpFile, "Inside Fragment Shader %s", szInfolog);
				free(szInfolog);

				uninitialize();
				DestroyWindow(0);
				exit(0);
			}
		}
	}


	//Create shader program object

	gShaderProgramObject = glCreateProgram();

	glAttachShader(gShaderProgramObject, gVertexShaderObject);

	glAttachShader(gShaderProgramObject, gFragmentShaderObject);

	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_POSITION, "vPosition");

	//glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_COLOR, "vColor");

	glLinkProgram(gShaderProgramObject);

	glGetProgramiv(gShaderProgramObject, GL_LINK_STATUS, &iProgramLinkStatus);

	if (iProgramLinkStatus == GL_FALSE)
	{
		glGetProgramiv(gShaderProgramObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);

		if (iInfoLogLength > 0)
		{
			szInfolog = (GLchar *)malloc(iInfoLogLength);
			if (szInfolog != NULL)
			{
				GLsizei written;

				glGetProgramInfoLog(gShaderProgramObject, iInfoLogLength, &written, szInfolog);
				fprintf(gpFile, "Inside Linking of program %s", szInfolog);
				free(szInfolog);

				uninitialize();
				DestroyWindow(0);
				exit(0);
			}
		}
	}

	//
	mvpUniform = glGetUniformLocation(gShaderProgramObject, "u_mvp_matrix");


	getSphereVertexData(sphere_vertices, sphere_normals, sphere_texture, sphere_elements);
	gNumVertices = getNumberOfSphereVertices();
	gNumElements = getNumberOfSphereElements();


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
	glVertexAttribPointer(AMC_ATTIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTIBUTE_NORMAL);
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
	glVertexAttribPointer(AMC_ATTIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTIBUTE_NORMAL);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glGenBuffers(1, &vbo_element_sphere1);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_element_sphere1);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphere_elements), sphere_elements, GL_STATIC_DRAW);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);

	glBindVertexArray(0);






	glShadeModel(GL_SMOOTH);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);

	glClearDepth(1.0f);

	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	perspectiveProjectionMatrix = mat4::identity();
	//glEnable(GL_CULL_FACE);
	//glDisable(GL_CULL_FACE);
	//glEnable(GL_FRONT_FACE);
	//glEnable(GL_BACK);
	resize(WIN_WIDTH, WIN_HEIGHT);
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	return 0;
}


void resize(int width, int height)
{
	if (height == 0)
		height = 1;
	glViewport(0, 0, (GLsizei)width, (GLsizei)height);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	perspectiveProjectionMatrix = perspective(45.0f, (GLfloat)width / (GLfloat)height, 0.1f, 100.0f);
}

void display()
{
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

	

	sp.push(modelViewMatrix);

	rotationMatrix = rotate((float)shoulder, 0.0f, 0.0f, 1.0f);
	modelViewMatrix = modelViewMatrix * rotationMatrix;

	translationMatrix = mat4::identity();
	translationMatrix = translate(1.0f, 0.0f, 0.0f);
	modelViewMatrix = modelViewMatrix * translationMatrix;

	sp.push(modelViewMatrix);

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
	

	modelViewMatrix = sp.pop();

	translationMatrix = mat4::identity();
	translationMatrix = translate(1.0f, 0.0f, 0.0f);
	modelViewMatrix = modelViewMatrix * translationMatrix;

	rotationMatrix = mat4::identity();
	rotationMatrix = rotate((float)elbow, 0.0f, 0.0f, 1.0f);
	modelViewMatrix = modelViewMatrix * rotationMatrix;

	translationMatrix = mat4::identity();
	translationMatrix = translate(1.0f, 0.0f, 0.0f);
	modelViewMatrix = modelViewMatrix * translationMatrix;

	sp.push(modelViewMatrix);

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
	sp.pop();
	sp.pop();

	glUseProgram(0);

	SwapBuffers(gHdc);
}

void Update()
{
	if (angle_pyramid <= 360.0f)
	{
		angle_pyramid = angle_pyramid + 0.05f;
	}
	else
	{
		angle_pyramid = 0.0f;
	}
	if (angle_cube <= 360.0f)
	{
		angle_cube = angle_cube + 0.05f;
	}
	else
	{
		angle_cube = 0.0f;
	}
}

void uninitialize()
{
	if (bIsFullScreen == true) {
		SetWindowLong(gHwnd, GWL_STYLE, dwStyle | WS_OVERLAPPEDWINDOW);
		SetWindowPlacement(gHwnd, &wpPrev);
		SetWindowPos(gHwnd,
			HWND_TOP,
			0,
			0,
			0,
			0,
			SWP_NOZORDER |
			SWP_FRAMECHANGED |
			SWP_NOMOVE |
			SWP_NOSIZE |
			SWP_NOOWNERZORDER);
		ShowCursor(TRUE);
	}

	if (wglGetCurrentContext() == ghrc)
	{
		wglMakeCurrent(NULL, NULL);
		ghrc = NULL;
	}
	if (ghrc)
	{
		wglDeleteContext(ghrc);
		ghrc = NULL;
	}
	if (ghrc)
	{
		wglDeleteContext(ghrc);
		ghrc = NULL;
	}
	if (gpFile)
	{
		fprintf(gpFile, "Log File closed successfully");
		fclose(gpFile);
		gpFile = NULL;
	}


	glUseProgram(gShaderProgramObject);
	glDetachShader(gShaderProgramObject, gFragmentShaderObject);
	glDetachShader(gShaderProgramObject, gVertexShaderObject);
	glDeleteShader(gFragmentShaderObject);
	gFragmentShaderObject = 0;
	glDeleteShader(gVertexShaderObject);
	gVertexShaderObject = 0;
	glDeleteProgram(gShaderProgramObject);
	gShaderProgramObject = 0;
	glUseProgram(0);
}


