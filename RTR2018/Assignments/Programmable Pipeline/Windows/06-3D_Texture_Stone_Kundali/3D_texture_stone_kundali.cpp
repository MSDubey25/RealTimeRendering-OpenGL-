#include<Windows.h>
#include<GL/glew.h>
#include<gl/GL.h>
#include<stdio.h>
#include "vmath.h"
#include "Header.h"

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

static GLfloat angle_pyramid = 0.0f;
static GLfloat angle_cube = 0.0f;

GLint gVertexShaderObject;
GLint gFragmentShaderObject;
GLint gShaderProgramObject;

GLuint vao_pyramid;
GLuint vao_cube;
GLuint vbo_position_pyramid;
GLuint vbo_position_cube;
GLuint vbo_texture_pyramid;
GLuint vbo_texture_cube;
GLuint texture_stone;
GLuint texture_kundali;
GLuint mvpUniform;
GLuint samplerUniform;
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

	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("3D Texture Stone Kundali"),
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
	BOOL LoadTexture(GLuint *texture, TCHAR imageResourceID[]);
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
		"in vec2 vTexCoord;" \
		"uniform mat4 u_mvp_matrix;" \
		"out vec2 out_TexCoord;" \
		"void main(void)" \
		"{" \
		"gl_Position=u_mvp_matrix * vPosition;" \
		"out_TexCoord=vTexCoord;" \
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
		"in vec2 out_TexCoord;" \
		"uniform sampler2D u_sampler;" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{" \
		"FragColor=texture(u_sampler,out_TexCoord);" \
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
	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_TEXCOORD0, "vTexCoord");

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
	samplerUniform = glGetUniformLocation(gShaderProgramObject, "u_sampler");
	const GLfloat pyramidVertices[] = { 0.0f,1.0f,0.0f,//
										-1.0f,-1.0f,1.0f,
										1.0f,-1.0f,1.0f,
										0.0f,1.0f,0.0f,//
										1.0f,-1.0f,1.0f,
										1.0f,-1.0f,-1.0f,
										0.0f,1.0f,0.0f,//
										1.0f,-1.0f,-1.0f,
										-1.0f,-1.0f,-1.0f,
										0.0f,1.0f,0.0f,//
										-1.0f,-1.0f,-1.0f,
										-1.0f,-1.0f,1.0f
										};
	const GLfloat pyramidVerticesTexCoord[] = { 0.5f,1.0f,//a
												0.0f,0.0f,//l
												1.0f,0.0f,//r
												0.5f,1.0f,//a
												0.0f,0.0f,//l
												1.0f,0.0f,//r
												0.5f,1.0f,//a
												0.0f,0.0f,//l
												1.0f,0.0f,//r
												0.5f,1.0f,//a
												0.0f,0.0f,//l
												1.0f,0.0f//r
										};
	const GLfloat cubeVertices[] = { -1.0f, 1.0f, -1.0f,//top
										-1.0f, 1.0f, 1.0f,
										1.0f, 1.0f, 1.0f,
										1.0f, 1.0f, -1.0f,
										-1.0f, -1.0f, -1.0f,//bottom
										-1.0f, -1.0f, 1.0f,
										1.0f, -1.0f, 1.0f,
										1.0f, -1.0f, -1.0f,
										1.0f, 1.0f, 1.0f,//front
										-1.0f, 1.0f, 1.0f,
										-1.0f, -1.0f, 1.0f,
										1.0f, -1.0f, 1.0f,
										-1.0f, 1.0f, -1.0f,//back
										1.0f, 1.0f, -1.0f,
										1.0f, -1.0f, -1.0f,
										-1.0f, -1.0f, -1.0f,
										1.0f, 1.0f, -1.0f,//right
										1.0f, 1.0f, 1.0f,
										1.0f, -1.0f, 1.0f,
										1.0f, -1.0f, -1.0f,
										-1.0f, 1.0f, 1.0f,//left
										-1.0f, 1.0f, -1.0f,
										-1.0f, -1.0f, -1.0f,
										-1.0f, -1.0f, 1.0f
										};
	const GLfloat cubeVerticesTexCoord[] = { 0.0f,1.0f,//tl top
											0.0f,0.0f,//bl
											1.0f,0.0f,//br
											1.0f,1.0f,//tr
											1.0f,1.0f,//tr bottom
											0.0f,1.0f,//br
											0.0f,0.0f,//bl
											1.0f,0.0f,//tl
											0.0f,0.0f,//bl front 
											1.0f,0.0f,//br
											1.0f,1.0f,//tr
											0.0f,1.0f,//tl
											1.0f,0.0f,//br back
											1.0f,1.0f,//tr
											0.0f,1.0f,//br
											0.0f,0.0f,//bl
											1.0f,0.0f,//br right
											1.0f,1.0f,//tr
											0.0f,1.0f,//br
											0.0f,0.0f,//bl
											0.0f,0.0f,//bl left
											1.0f,0.0f,//tl
											1.0f,1.0f,//tr
											0.0f,1.0f//br
	};

	//create vao
	glGenVertexArrays(1, &vao_pyramid);
	glBindVertexArray(vao_pyramid);
	//for position
	glGenBuffers(1, &vbo_position_pyramid);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_pyramid);
	glBufferData(GL_ARRAY_BUFFER, sizeof(pyramidVertices),
		pyramidVertices, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	//for texture
	glGenBuffers(1, &vbo_texture_pyramid);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_texture_pyramid);
	glBufferData(GL_ARRAY_BUFFER, sizeof(pyramidVerticesTexCoord),
		pyramidVerticesTexCoord, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_TEXCOORD0, 2, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_TEXCOORD0);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glBindVertexArray(0);
	/////////////////////////////////////////////////////////
	
	//create vao
	glGenVertexArrays(1, &vao_cube);
	glBindVertexArray(vao_cube);
	//for position
	glGenBuffers(1, &vbo_position_cube);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_cube);
	glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVertices),
		cubeVertices, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	//for texture
	glGenBuffers(1, &vbo_texture_cube);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_texture_cube);
	glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVerticesTexCoord),
		cubeVerticesTexCoord, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_TEXCOORD0, 2, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_TEXCOORD0);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glBindVertexArray(0);
	/////////////////////////////////////////////////////////
	
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	glClearDepth(1.0f);
	perspectiveProjectionMatrix = mat4::identity();
	Resize(WIN_WIDTH, WIN_HEIGHT);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	glEnable(GL_TEXTURE_2D);
	LoadTexture(&texture_stone, MAKEINTRESOURCE(ID_STONE));
	LoadTexture(&texture_kundali, MAKEINTRESOURCE(ID_KUNDALI));
	return 0;
}
BOOL LoadTexture(GLuint *texture, TCHAR imageResourceID[])
{
	HBITMAP hBitmap = NULL;
	BITMAP bmp;
	BOOL bStatus = FALSE;

	//code
	hBitmap = (HBITMAP)LoadImage(GetModuleHandle(NULL),
		imageResourceID,
		IMAGE_BITMAP, 0, 0,
		LR_CREATEDIBSECTION);
	if (hBitmap)
	{
		bStatus = TRUE;
		GetObject(hBitmap, sizeof(BITMAP), &bmp);
		glPixelStorei(GL_UNPACK_ALIGNMENT, 4);
		glGenTextures(1, texture);
		glBindTexture(GL_TEXTURE_2D, *texture);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
		glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, bmp.bmWidth, bmp.bmHeight, 0, GL_BGR_EXT,
			GL_UNSIGNED_BYTE, bmp.bmBits);
		glGenerateMipmap(GL_TEXTURE_2D);
		//glBindTexture(0);
		DeleteObject(hBitmap);
	}
	return bStatus;
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
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);
	
	//declaration of matrices
	mat4 modelViewMatrix;
	mat4 modelViewProjectionMatrix;
	mat4 translationMatrix;
	mat4 rotationMatrix;

	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, texture_stone);
	glUniform1i(samplerUniform, 0);
	//bind with vao
	glBindVertexArray(vao_pyramid);
	//initialize above to identity
	modelViewMatrix = mat4::identity();
	modelViewProjectionMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	rotationMatrix = mat4::identity();
	//do necessary transformation
	translationMatrix = translate(-2.0f,0.0f,-6.0f);
	rotationMatrix = rotate(angle_pyramid,0.0f,1.0f,0.0f);
	modelViewMatrix = translationMatrix*rotationMatrix;
	//do necessary matrix multiplication
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);

	//similarly bind with textures if any

	//draw necessary scene
	glDrawArrays(GL_TRIANGLES, 0, 12);

	//unbind vao
	glBindVertexArray(0);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, texture_kundali);
	glUniform1i(samplerUniform, 0);
	//bind with vao
	glBindVertexArray(vao_cube);
	modelViewMatrix = mat4::identity();
	//modelViewProjectionMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	rotationMatrix = mat4::identity();
	translationMatrix = translate(2.0f, 0.0f, -6.0f);
	//rotationMatrix = rotate(angle_cube, 1.0f, 1.0f, 1.0f);
	rotationMatrix = rotate(angle_cube, angle_cube, angle_cube);
	modelViewMatrix = translationMatrix*rotationMatrix;
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glVertexAttrib3f(AMC_ATTRIBUTE_COLOR,0.0f,0.0f,1.0f);

	//similarly bind with textures if any

	//draw necessary scene
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 12, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 16, 4);
	glDrawArrays(GL_TRIANGLE_FAN, 20, 4);
	//unbind vao
	glBindVertexArray(0);

	//unuse program
	glUseProgram(0);
	SwapBuffers(ghdc);
	angle_pyramid += 0.05f;
	if (angle_pyramid >= 360.0f)
		angle_pyramid = 0;
	angle_cube += 0.05f;
	if (angle_cube >= 360.0f)
		angle_cube = 0;
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
	if (vbo_position_pyramid)
	{
		glDeleteBuffers(1, &vbo_position_pyramid);
		vbo_position_pyramid = 0;
	}
	if (vao_pyramid)
	{
		glDeleteBuffers(1, &vao_pyramid);
		vao_pyramid = 0;
	}
	if (vbo_position_cube)
	{
		glDeleteBuffers(1, &vbo_position_cube);
		vbo_position_cube = 0;
	}
	if (vbo_texture_pyramid)
	{
		glDeleteBuffers(1, &vbo_texture_pyramid);
		vbo_texture_pyramid = 0;
	}
	if (vbo_texture_cube)
	{
		glDeleteBuffers(1, &vbo_texture_cube);
		vbo_texture_cube = 0;
	}
	if (vao_cube)
	{
		glDeleteBuffers(1, &vao_cube);
		vao_cube = 0;
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
	glDeleteTextures(1, &texture_stone);
	glDeleteTextures(1, &texture_kundali);

}













