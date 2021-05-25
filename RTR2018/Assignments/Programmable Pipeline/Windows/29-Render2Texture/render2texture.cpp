#include<Windows.h>
#include<stdio.h>
#include<GL/glew.h>
#include<gl/GL.h>
#include"vmath.h"

#include "resource.h"

#pragma comment(lib,"glew32.lib")
#pragma comment(lib,"opengl32.lib")


#define WIN_WIDTH 800
#define WIN_HEIGHT 600
#define BUFFER_SIZE 1024

using namespace vmath;

enum {
	AMC_ATTRIBUTE_POSITION = 0,
	AMC_ATTRIBUTE_COLOR,
	AMC_ATTIBUTE_NORMAL,
	AMC_ATTRIBUTE_TEXCOORD0

};


GLuint vao_cube;
GLuint vbo_position_cube;
GLuint vbo_texture_cube;

GLfloat giWinWidth;
GLfloat giWinHeight;

GLuint frameBufferObject;
GLuint texture_frameBufferObject;
GLuint depthBufferObject;

GLuint texture_width = 256;
GLuint texture_height = 256;

GLuint texture_marble;

GLuint mvpUniform;
mat4 perspectiveProjectionMatrix;

HDC gHdc = NULL;
HGLRC ghrc = NULL;
HWND gHwnd = NULL;

DWORD dwStyle;
WINDOWPLACEMENT wpPrev = { sizeof(WINDOWPLACEMENT) };

bool gbActiveWindow = false;
bool bIsFullScreen = false;
bool bDone = false;
int iRet;


GLuint gVertexShaderObject;
GLuint gFragmentShaderObject;
GLuint gShaderProgramObject;

GLuint gShaderProgramObject_textureCube;
GLuint gVertexShaderObject_model;
GLuint gFragmentShaderObject_model;


GLuint vao_textureCube;
GLuint vbo_position_textureCube;
GLuint vbo_texture_textureCube;

GLuint mvpUniform_textureCube;

GLuint samplerUniform;
GLuint samplerUniform_textureCube;
FILE * gpFile = NULL;

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);


GLfloat angleCube1 = 0.0f;
GLfloat angleCube2 = 0.0f;


int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpszCmdLine, int iCmdShow)
{

	int initialize(void);

	void display();
	void Update();
	MSG msg;
	HWND hwnd;
	TCHAR szAppName[] = TEXT("Programmable Native Window Using Shaders");
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


	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("Render to Tecture with Monkey Head"), WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE, 100, 100, WIN_WIDTH, WIN_HEIGHT, NULL, NULL, hInstance, NULL);

	gHwnd = hwnd;
	iRet = initialize();
	if (iRet == -1)
	{
		fprintf(gpFile, "Choose Pixel Format Failed\n");
		DestroyWindow(0);
	}
	else if (iRet == -2)
	{
		fprintf(gpFile, "SetPixel FOrmat failed");
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

			Update();

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
	BOOL loadTexture(GLuint *, TCHAR[]);

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


	gVertexShaderObject_model = glCreateShader(GL_VERTEX_SHADER);

	//write vertex shader code.
	const GLchar* vertexShaderSourceCode_model =
		"#version 440 core" \
		"\n" \
		"in vec4 vPosition;" \
		"in vec2 vTexCoord;" \
		"uniform mat4 u_mvp_matrix;" \
		"out vec2 out_texcoord;" \
		"void main(void)" \
		"{" \
		"gl_Position=u_mvp_matrix*vPosition;" \
		"out_texcoord=vTexCoord;" \
		"}"
		;


	glShaderSource(gVertexShaderObject_model, 1, (const GLchar **)&vertexShaderSourceCode_model, NULL);
	glCompileShader(gVertexShaderObject_model);

	glGetShaderiv(gVertexShaderObject_model, GL_COMPILE_STATUS, &iShaderCompileStatus);

	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gVertexShaderObject_model, GL_INFO_LOG_LENGTH, &iInfoLogLength);

		if (iInfoLogLength > 0)
		{
			szInfolog = (GLchar *)malloc(iInfoLogLength);
			if (szInfolog != NULL)
			{
				GLsizei written;

				glGetShaderInfoLog(gVertexShaderObject_model, iInfoLogLength, &written, szInfolog);
				fprintf(gpFile, "Inside Vertex Shader %s", szInfolog);
				free(szInfolog);

				uninitialize();
				DestroyWindow(0);
				exit(0);
			}
		}
	}


	//For Fragment Shader.

	gFragmentShaderObject_model = glCreateShader(GL_FRAGMENT_SHADER);

	const GLchar* fragmentShaderSourceCode_model =
		"#version 440 core" \
		"\n"
		"in vec2 out_texcoord;" \
		"uniform sampler2D u_sampler;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{"  \
		"FragColor=texture(u_sampler,out_texcoord);" \
		"}";

	glShaderSource(gFragmentShaderObject_model, 1, (const GLchar **)&fragmentShaderSourceCode_model, NULL);
	glCompileShader(gFragmentShaderObject_model);

	glGetShaderiv(gFragmentShaderObject_model, GL_COMPILE_STATUS, &iShaderCompileStatus);

	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gFragmentShaderObject_model, GL_INFO_LOG_LENGTH, &iInfoLogLength);

		if (iInfoLogLength > 0)
		{
			szInfolog = (GLchar *)malloc(iInfoLogLength);
			if (szInfolog != NULL)
			{
				GLsizei written;

				glGetShaderInfoLog(gFragmentShaderObject_model, iInfoLogLength, &written, szInfolog);
				fprintf(gpFile, "Inside Fragment Shader %s", szInfolog);
				free(szInfolog);

				uninitialize();
				DestroyWindow(0);
				exit(0);
			}
		}
	}


	//Create shader program object

	gShaderProgramObject_textureCube = glCreateProgram();

	glAttachShader(gShaderProgramObject_textureCube, gVertexShaderObject_model);

	glAttachShader(gShaderProgramObject_textureCube, gFragmentShaderObject_model);

	glBindAttribLocation(gShaderProgramObject_textureCube, AMC_ATTRIBUTE_POSITION, "vPosition");

	glBindAttribLocation(gShaderProgramObject_textureCube , AMC_ATTRIBUTE_TEXCOORD0, "vTexCoord");

	glLinkProgram(gShaderProgramObject_textureCube);

	glGetProgramiv(gShaderProgramObject_textureCube, GL_LINK_STATUS, &iProgramLinkStatus);

	if (iProgramLinkStatus == GL_FALSE)
	{
		glGetProgramiv(gShaderProgramObject_textureCube, GL_INFO_LOG_LENGTH, &iInfoLogLength);

		if (iInfoLogLength > 0)
		{
			szInfolog = (GLchar *)malloc(iInfoLogLength);
			if (szInfolog != NULL)
			{
				GLsizei written;

				glGetProgramInfoLog(gShaderProgramObject_textureCube, iInfoLogLength, &written, szInfolog);
				fprintf(gpFile, "Inside Linking of program %s", szInfolog);
				free(szInfolog);

				uninitialize();
				DestroyWindow(0);
				exit(0);
			}
		}
	}

	//

	mvpUniform_textureCube = glGetUniformLocation(gShaderProgramObject_textureCube, "u_mvp_matrix");
	samplerUniform_textureCube = glGetUniformLocation(gShaderProgramObject_textureCube, "u_sampler");
	


	const GLfloat cubeVertices1[] = {
		1.0f, 1.0f, -1.0f,
	-1.0f, 1.0f, -1.0f,
	-1.0f, 1.0f, 1.0f,
	1.0f, 1.0f, 1.0f,

	1.0f, -1.0f, -1.0f,
	-1.0f, -1.0f, -1.0f,
	-1.0f, -1.0f, 1.0f,
	1.0f, -1.0f, 1.0f,

	1.0f, 1.0f, 1.0f,
	-1.0f, 1.0f, 1.0f,
	-1.0f, -1.0f, 1.0f,
	1.0f, -1.0f, 1.0f,

	1.0f, 1.0f, -1.0f,
	-1.0f, 1.0f, -1.0f,
	-1.0f, -1.0f, -1.0f,
	1.0f, -1.0f, -1.0f,

	1.0f, 1.0f, -1.0f,
	1.0f, 1.0f, 1.0f,
	1.0f, -1.0f, 1.0f,
	1.0f, -1.0f, -1.0f,

	-1.0f, 1.0f, 1.0f,
	-1.0f, 1.0f, -1.0f,
	-1.0f, -1.0f, -1.0f,
	-1.0f, -1.0f, 1.0f
	};

	const GLfloat cubeTex1[] = {
		0.0f,0.0f,
		1.0f,0.0f,
		1.0f,1.0f,
		0.0f,1.0f,

		1.0f,0.0f,
		1.0f,1.0f,
		0.0f,1.0f,
		0.0f,0.0f,

		1.0f,0.0f,
		1.0f,1.0f,
		0.0f,1.0f,
		0.0f,0.0f,

		0.0f,0.0f,
		1.0f,0.0f,
		1.0f,1.0f,
		0.0f,1.0f,

		0.0f,1.0f,
		0.0f,0.0f,
		1.0f,0.0f,
		1.0f,1.0f,

		1.0f,1.0f,
		0.0f,1.0f,
		0.0f,0.0f,
		1.0f,0.0f
	};
	

	glGenVertexArrays(1, &vao_textureCube);
	glBindVertexArray(vao_textureCube);
	glGenBuffers(1, &vbo_position_textureCube);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_textureCube);
	glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVertices1), cubeVertices1, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glGenBuffers(1, &vbo_texture_textureCube);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_texture_textureCube);
	glBufferData(GL_ARRAY_BUFFER, sizeof(cubeTex1), cubeTex1, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_TEXCOORD0, 2, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_TEXCOORD0);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindVertexArray(0);

	//
	gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);

	//write vertex shader code.
	const GLchar* vertexShaderSourceCode =
		"#version 440 core" \
		"\n" \
		"in vec4 vPosition;" \
		"in vec2 vTexCoord;" \
		"uniform mat4 u_mvp_matrix;" \
		"out vec2 out_texcoord;" \
		"void main(void)" \
		"{" \
		"gl_Position=u_mvp_matrix*vPosition;" \
		"out_texcoord=vTexCoord;" \
		"}"
		;

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
		"#version 440 core" \
		"\n"
		"in vec2 out_texcoord;" \
		"uniform sampler2D u_sampler;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{"  \
		"FragColor=texture(u_sampler,out_texcoord);" \
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

	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_TEXCOORD0, "vTexCoord");

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

	mvpUniform = glGetUniformLocation(gShaderProgramObject, "u_mvp_matrix");
	samplerUniform = glGetUniformLocation(gShaderProgramObject, "u_sampler");


	const GLfloat cubeVertices[] = {
		1.0f, 1.0f, -1.0f,
	-1.0f, 1.0f, -1.0f,
	-1.0f, 1.0f, 1.0f,
	1.0f, 1.0f, 1.0f,

	1.0f, -1.0f, -1.0f,
	-1.0f, -1.0f, -1.0f,
	-1.0f, -1.0f, 1.0f,
	1.0f, -1.0f, 1.0f,

	1.0f, 1.0f, 1.0f,
	-1.0f, 1.0f, 1.0f,
	-1.0f, -1.0f, 1.0f,
	1.0f, -1.0f, 1.0f,

	1.0f, 1.0f, -1.0f,
	-1.0f, 1.0f, -1.0f,
	-1.0f, -1.0f, -1.0f,
	1.0f, -1.0f, -1.0f,

	1.0f, 1.0f, -1.0f,
	1.0f, 1.0f, 1.0f,
	1.0f, -1.0f, 1.0f,
	1.0f, -1.0f, -1.0f,

	-1.0f, 1.0f, 1.0f,
	-1.0f, 1.0f, -1.0f,
	-1.0f, -1.0f, -1.0f,
	-1.0f, -1.0f, 1.0f
	};

	const GLfloat cubeTex[] = {
		0.0f,0.0f,
		1.0f,0.0f,
		1.0f,1.0f,
		0.0f,1.0f,

		1.0f,0.0f,
		1.0f,1.0f,
		0.0f,1.0f,
		0.0f,0.0f,

		1.0f,0.0f,
		1.0f,1.0f,
		0.0f,1.0f,
		0.0f,0.0f,

		0.0f,0.0f,
		1.0f,0.0f,
		1.0f,1.0f,
		0.0f,1.0f,

		0.0f,1.0f,
		0.0f,0.0f,
		1.0f,0.0f,
		1.0f,1.0f,

		1.0f,1.0f,
		0.0f,1.0f,
		0.0f,0.0f,
		1.0f,0.0f
	};

	glGenVertexArrays(1, &vao_cube);
	glBindVertexArray(vao_cube);
	glGenBuffers(1, &vbo_position_cube);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_cube);
	glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVertices), cubeVertices, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER, 0);


	glGenBuffers(1, &vbo_texture_cube);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_texture_cube);
	glBufferData(GL_ARRAY_BUFFER, sizeof(cubeTex), cubeTex, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_TEXCOORD0, 2, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_TEXCOORD0);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindVertexArray(0);
	//
	glShadeModel(GL_SMOOTH);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);
	glClearDepth(1.0f);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);

	//FBO

	glGenFramebuffers(1, &frameBufferObject);
	glBindFramebuffer(GL_FRAMEBUFFER, frameBufferObject);
	glPixelStorei(GL_UNPACK_ALIGNMENT, 4);
	glGenTextures(1, &texture_frameBufferObject);
	glBindTexture(GL_TEXTURE_2D, texture_frameBufferObject);


	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);

	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, texture_width, texture_height, 0, GL_RGBA, GL_UNSIGNED_BYTE, NULL);

	glGenerateMipmap(GL_TEXTURE_2D);

	glBindFramebuffer(GL_FRAMEBUFFER, 0);

	glCreateFramebuffers(1, &frameBufferObject);
	glBindFramebuffer(GL_FRAMEBUFFER, frameBufferObject);
	glTexStorage2D(GL_TEXTURE_2D, 1, GL_RGBA8, 1024, 1024);

	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture_frameBufferObject, 0);

	glGenRenderbuffers(1, &depthBufferObject);
	glBindRenderbuffer(GL_RENDERBUFFER, depthBufferObject);
	glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, 1024, 1024);
	glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthBufferObject);

	glBindFramebuffer(GL_FRAMEBUFFER, NULL);

	loadTexture(&texture_marble, MAKEINTRESOURCE(IDBITMAP_MARBLE));
	glEnable(GL_TEXTURE_2D);

	perspectiveProjectionMatrix = mat4::identity();
	glFrontFace(GL_CCW);
	resize(WIN_WIDTH, WIN_HEIGHT);
	glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
	glClearColor(0.0f, 0.0f, 1.0f, 1.0f);
	return 0;
}


void resize(int width, int height)
{
	if (height == 0)
		height = 1;
	glViewport(0, 0, (GLsizei)width, (GLsizei)height);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	giWinHeight = height;
	giWinWidth = width;

	perspectiveProjectionMatrix = perspective(45.0f, (GLfloat)width / (GLfloat)height, 0.1f, 100.0f);
}

void display()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject_textureCube);

	glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
	glFrontFace(GL_CCW);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);

	mat4 modelViewMatrix;
	mat4 modelViewProjectionMatrix;
	mat4 translationMatrix;
	mat4 scaleMatrix;
	mat4 rotationMatrix;

	glBindFramebuffer(GL_FRAMEBUFFER, frameBufferObject);
	glViewport(0, 0, texture_width, texture_height);

	glClearColor(0.5f, 0.5f, 0.5f, 1.0f);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	const GLfloat aspect = (GLfloat)texture_width / (GLfloat)texture_height;

	perspectiveProjectionMatrix = perspective(45.0f, (GLfloat)giWinWidth / (GLfloat)giWinHeight, 0.1f, 100.0f);


	modelViewMatrix = mat4::identity();
	modelViewProjectionMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	scaleMatrix = mat4::identity();
	rotationMatrix = mat4::identity();


	translationMatrix = translate(0.0f, 0.0f, -5.0f);

	rotationMatrix = rotate(angleCube1, angleCube1, angleCube1);


	modelViewMatrix = translationMatrix * rotationMatrix;
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);

	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, texture_marble);
	glUniform1i(samplerUniform, 0);
	glBindVertexArray(vao_textureCube);
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 12, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 16, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 20, 4);
	glBindVertexArray(0);

	glUseProgram(0);





	glUseProgram(gShaderProgramObject);

	glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
	glBindFramebuffer(GL_FRAMEBUFFER, NULL);
	glBindTexture(GL_TEXTURE_2D, texture_frameBufferObject);

	glViewport(0, 0, (GLsizei)giWinWidth, (GLsizei)giWinHeight);

	glClearColor(0.0f, 0.0f, 0.0f, 1);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	perspectiveProjectionMatrix = perspective(45.0f, (GLfloat)giWinWidth / (GLfloat)giWinHeight, 0.1f, 100.0f);

	modelViewMatrix = mat4::identity();
	modelViewProjectionMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	scaleMatrix = mat4::identity();
	rotationMatrix = mat4::identity();

	translationMatrix = translate(0.0f, 0.0f, -5.0f);

	scaleMatrix = scale(0.75f, 0.75f, 0.75f);

	rotationMatrix = rotate(angleCube2, angleCube2, angleCube2);
	modelViewMatrix = translationMatrix * scaleMatrix * rotationMatrix;
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);

	glUniform1i(samplerUniform, 0);
	glBindVertexArray(vao_cube);

	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 12, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 16, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 20, 4);
	glBindTexture(GL_TEXTURE_2D, 0);

	// unbind vao
	glBindVertexArray(0);

	glUseProgram(0);
	SwapBuffers(gHdc);
}


void Update()
{
	angleCube1 = angleCube1 + 0.01f;

	if (angleCube1 >= 360.0f)
	{
		angleCube1 = 0.0f;
	}

	angleCube2 = angleCube2 + 0.03f;

	if (angleCube2 >= 360.0f)
	{
		angleCube2 = 0.0f;
	}
}


void uninitialize()
{
	if (vbo_position_cube)
	{
		glDeleteBuffers(1, &vbo_position_cube);
		vbo_position_cube = 0;
	}
	if (vao_cube)
	{
		glDeleteVertexArrays(1, &vao_cube);
		vao_cube = 0;
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



}


BOOL loadTexture(GLuint *texture, TCHAR imgResourceID[])
{
	HBITMAP hBitMap = NULL;
	BITMAP bmp;
	BOOL bStatus = FALSE;

	hBitMap = (HBITMAP)LoadImage(GetModuleHandle(NULL), imgResourceID, IMAGE_BITMAP, 0, 0, LR_CREATEDIBSECTION);
	if (hBitMap)
	{
		bStatus = TRUE;
		GetObject(hBitMap, sizeof(BITMAP), &bmp);
		glPixelStorei(GL_UNPACK_ALIGNMENT, 4);

		glGenTextures(1, texture);
		glBindTexture(GL_TEXTURE_2D, *texture);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);

		glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, bmp.bmWidth, bmp.bmHeight, 0, GL_BGR, GL_UNSIGNED_BYTE, bmp.bmBits);
		glGenerateMipmap(GL_TEXTURE_2D);

		DeleteObject(hBitMap);
	}

	return(bStatus);

}

