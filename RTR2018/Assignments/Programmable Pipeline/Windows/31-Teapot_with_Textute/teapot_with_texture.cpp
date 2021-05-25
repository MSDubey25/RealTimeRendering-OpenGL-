#include<windows.h>
#include<stdio.h>
#include<iostream>
#include<GL/glew.h>
#include<gl/GL.h>
#include"vmath.h"
#include"OGL.h"
#include"texture.h"

#pragma comment(lib,"glew32.lib")
#pragma comment(lib,"opengl32.lib")

#define WIN_WIDTH 800
#define WIN_HEIGHT 600

using namespace vmath;
using namespace std;
//Global Variables
HWND ghwnd = NULL;
WINDOWPLACEMENT wpPrev = { sizeof(WINDOWPLACEMENT) };
DWORD dwStyle;
bool bFullscreen = false;
HDC ghdc = NULL;
HGLRC ghrc = NULL;
bool gbActiveWindow = false;
FILE *gpFile = NULL;
GLenum result;
bool gbLight = false;
GLuint texture_marble;

enum
{
	AMC_ATTRIBUTE_POSITION = 0,
	AMC_ATTRIBUTE_COLOR,
	AMC_ATTRIBUTE_NORMAL,
	AMC_ATTRIBUTE_TEXCOORD0	
};

GLuint gVertexShaderObject;
GLuint gFragmentShaderObject;
GLuint gShaderProgramObject;

GLuint vao_teapot;
GLuint vbo_position_teapot;
GLuint vbo_texture;
float angleTeapot = 0.0f;

const int lengthOfArray = (sizeof(face_indicies) / sizeof(face_indicies[0])) * 3 * 3;
const int lengthOfTexCoordArray = (sizeof(face_indicies) / sizeof(face_indicies[0])) * 3 * 2;

GLuint mUniform;
GLuint vUniform;
GLuint pUniform;

GLuint samplerUniform;
mat4 perspectiveProjectionMatrix;
LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpszCmdLine, int iCmdShow)
{
	//variable declarations
	WNDCLASSEX wndclass;
	TCHAR szAppName[] = TEXT("Teapot");
	HWND hwnd;
	MSG msg;
	bool bdone = false;
	int iRet = 0;

	//function declarations
	int initialize();
	void display();
	void update();

	if (fopen_s(&gpFile, "Log.txt", "w") != 0)
	{
		MessageBox(NULL, TEXT("LogFile cannot be created"), TEXT("error"), MB_OK);
		exit(0);
	}
	else {
		fprintf(gpFile, "log file created successfully\n");
	}

	wndclass.cbClsExtra = 0;
	wndclass.cbSize = sizeof(WNDCLASSEX);
	wndclass.cbWndExtra = 0;
	wndclass.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
	wndclass.hCursor = LoadCursor(NULL, IDC_ARROW);
	wndclass.hIcon = LoadIcon(NULL, IDI_APPLICATION);
	wndclass.hIconSm = LoadIcon(NULL, IDI_APPLICATION);
	wndclass.hInstance = hInstance;
	wndclass.lpfnWndProc = WndProc;
	wndclass.lpszClassName = szAppName;
	wndclass.lpszMenuName = NULL;
	wndclass.style = CS_HREDRAW | CS_VREDRAW | CS_OWNDC;

	RegisterClassEx(&wndclass);

	hwnd = CreateWindowEx(WS_EX_APPWINDOW,
		szAppName,
		TEXT("Teapot With Texture"),
		WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE,
		100,
		100,
		WIN_WIDTH,
		WIN_HEIGHT,
		NULL,
		NULL,
		hInstance,
		NULL);

	ghwnd = hwnd;
	iRet = initialize();
	if (iRet == -1)
	{
		fprintf(gpFile, "choose pixel format failed\n");
		DestroyWindow(hwnd);
	}
	else {
		if (iRet == -2)
		{
			fprintf(gpFile, "set pixel format failed\n");
			DestroyWindow(hwnd);
		}
		else {
			if (iRet == -3)
			{
				fprintf(gpFile, "wgl create context failed\n");
				DestroyWindow(hwnd);
			}
			else {
				if (iRet == -4)
				{
					fprintf(gpFile, "wgl make current failed\n");
					DestroyWindow(hwnd);
				}
				else {
					fprintf(gpFile, "succeeded\n");
				}
			}
		}
	}
	ShowWindow(hwnd, iCmdShow);
	SetForegroundWindow(hwnd);
	SetFocus(hwnd);

	while (bdone == false)
	{
		if (PeekMessage(&msg, NULL, 0, 0, PM_REMOVE))
		{
			if (msg.message == WM_QUIT)
			{
				bdone = true;
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
				//here call update
				update();
			}
			display();
		}
	}
	return (int)msg.wParam;
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT iMsg, WPARAM wParam, LPARAM lParam)
{
	//function declarations
	void resize(int, int);
	void uninitialize();

	void ToggleFullScreen();
	switch (iMsg)
	{
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
	case WM_CHAR:
		switch (wParam)
		{
		case 'f':
		case 'F':
			ToggleFullScreen();
			break;
		}
		break;
	case WM_KEYDOWN:
		switch (wParam)
		{
		case VK_ESCAPE:
			DestroyWindow(hwnd);
			break;
		}
		break;
	case WM_CLOSE:
		DestroyWindow(hwnd);
		break;
	case WM_DESTROY:
		uninitialize();
		PostQuitMessage(0);
		break;
	}
	return(DefWindowProc(hwnd, iMsg, wParam, lParam));
}

void ToggleFullScreen()
{
	MONITORINFO mi;
	if (bFullscreen == false)
	{
		dwStyle = GetWindowLong(ghwnd, GWL_STYLE);
		if (dwStyle & WS_OVERLAPPEDWINDOW)
		{
			mi = { sizeof(MONITORINFO) };
			if (GetWindowPlacement(ghwnd, &wpPrev) &&
				GetMonitorInfo(MonitorFromWindow(ghwnd, MONITORINFOF_PRIMARY), &mi))
			{
				SetWindowLong(ghwnd, GWL_STYLE, dwStyle & ~WS_OVERLAPPEDWINDOW);
				SetWindowPos(ghwnd,
					HWND_TOP,
					mi.rcMonitor.left,
					mi.rcMonitor.top,
					mi.rcMonitor.right - mi.rcMonitor.left,
					mi.rcMonitor.bottom - mi.rcMonitor.top,
					SWP_NOZORDER | SWP_FRAMECHANGED);

				ShowCursor(FALSE);
				bFullscreen = true;

			}
		}
	}
	else
	{
		SetWindowLong(ghwnd, GWL_STYLE, dwStyle | WS_OVERLAPPEDWINDOW);
		SetWindowPlacement(ghwnd, &wpPrev);
		SetWindowPos(ghwnd,
			HWND_TOP,
			0,
			0,
			0,
			0,
			SWP_NOZORDER | SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOOWNERZORDER);
		ShowCursor(TRUE);
		bFullscreen = false;
	}
}

int initialize()
{
	//function declarations
	void resize(int, int);
	void uninitialize();

	BOOL loadTexture(GLuint *texture, TCHAR imageResourceID[]);
	
	//variable declarations
	PIXELFORMATDESCRIPTOR pfd;
	int iPixelFormatIndex;

	//code
	//initialize pfd structure
	ZeroMemory(&pfd, sizeof(PIXELFORMATDESCRIPTOR));

	pfd.nSize = sizeof(PIXELFORMATDESCRIPTOR);
	pfd.nVersion = 1;
	pfd.dwFlags = PFD_DRAW_TO_WINDOW | PFD_SUPPORT_OPENGL | PFD_DOUBLEBUFFER;
	pfd.iPixelType = PFD_TYPE_RGBA;
	pfd.cColorBits = 32;
	pfd.cDepthBits = 32;
	pfd.cRedBits = 8;
	pfd.cGreenBits = 8;
	pfd.cBlueBits = 8;

	pfd.cAlphaBits = 8;

	ghdc = GetDC(ghwnd);
	iPixelFormatIndex = ChoosePixelFormat(ghdc, &pfd);
	if (iPixelFormatIndex == 0)
	{
		return -1;
	}
	else
	{
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
		if(result != GLEW_OK)
		{
			fprintf(gpFile, "GLEW INIT FAILED\n");
			uninitialize();
			DestroyWindow(ghwnd);
		}
		
		//Define vertex shader object
		gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);
		//write vertex code
		const GLchar* vertexShaderSourceCode = 
		"#version 330 core"\
		"\n"\
		"in vec4 vPosition;"\
		"in vec2 vTexCoord;"\
		"out vec2 outTexCoord;"\
		"uniform mat4 u_m_matrix;"\
		"uniform mat4 u_v_matrix;"\
		"uniform mat4 u_p_matrix;"\
		"void main(void)"\
		"{"\
		"	outTexCoord = vTexCoord;"\
		"	gl_Position = u_p_matrix * u_v_matrix *  u_m_matrix * vPosition;"\
		"}";
		
		glShaderSource(gVertexShaderObject, 1, (const GLchar**)&vertexShaderSourceCode, NULL);

		//compile the vertex shader
		glCompileShader(gVertexShaderObject);

		GLint iShaderCompileStatus = 0;
		GLint iInfoLogLength = 0;
		char *szInfoLog = NULL;
		glGetShaderiv(gVertexShaderObject, GL_COMPILE_STATUS, &iShaderCompileStatus);
		if(iShaderCompileStatus == GL_FALSE)
		{
			glGetShaderiv(gVertexShaderObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);
			if(iInfoLogLength > 0)
			{

				szInfoLog = (char *)malloc(iInfoLogLength * sizeof(char));
				if(szInfoLog != NULL)
				{
					GLsizei written;
					glGetShaderInfoLog(gVertexShaderObject, iInfoLogLength, &written, szInfoLog);
					fprintf(gpFile, "Vertex Shader Compile Status :\n%s\n", szInfoLog);
					free(szInfoLog);
					uninitialize();
					exit(0);
				}
			}
		}

		//Define fragment shader object
		gFragmentShaderObject = glCreateShader(GL_FRAGMENT_SHADER);
		//write fragment code
		const GLchar* fragmentShaderSourceCode = 
		"#version 330 core"\
		"\n"\
		"out vec4 fragColor;"\
		"in vec2 outTexCoord;"\
		"uniform sampler2D u_sampler;"\
		"void main(void)"\
		"{"\
		"fragColor = texture(u_sampler, outTexCoord) * vec4(1.0, 1.0, 1.0, 1.0);"\
		"}";
		
		glShaderSource(gFragmentShaderObject, 1, (const GLchar**)&fragmentShaderSourceCode, NULL);

		//compile the fragment shader
		glCompileShader(gFragmentShaderObject);

		iShaderCompileStatus = 0;
		iInfoLogLength = 0;
		szInfoLog = NULL;
		glGetShaderiv(gFragmentShaderObject, GL_COMPILE_STATUS, &iShaderCompileStatus);
		if(iShaderCompileStatus == GL_FALSE)
		{
			glGetShaderiv(gFragmentShaderObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);
			if(iInfoLogLength > 0)
			{

				szInfoLog = (char *)malloc(iInfoLogLength * sizeof(char));
				if(szInfoLog != NULL)
				{
					GLsizei written;
					glGetShaderInfoLog(gFragmentShaderObject, iInfoLogLength, &written, szInfoLog);
					fprintf(gpFile, "Fragment Shader Compile Status :\n%s\n", szInfoLog);
					free(szInfoLog);
					uninitialize();
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

		//link shader program
		glLinkProgram(gShaderProgramObject);

		GLint iProgramLinkStatus = 0;
		iInfoLogLength = 0;
		szInfoLog = NULL;
		glGetProgramiv(gShaderProgramObject, GL_LINK_STATUS, &iProgramLinkStatus);
		if(iProgramLinkStatus == GL_FALSE)
		{
			glGetProgramiv(gShaderProgramObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);
			if(iInfoLogLength > 0)
			{
				szInfoLog = (char *)malloc(iInfoLogLength * sizeof(char));
				if(szInfoLog != NULL)
				{
					GLsizei written;
					glGetProgramInfoLog(gShaderProgramObject, iInfoLogLength, &written, szInfoLog);
					//TCHAR str[250];
					//wsprintf(str,(TCHAR *)szInfoLog);
					//MessageBox(NULL, str, TEXT("error"), MB_OK);
					fprintf(gpFile, "Program Link Status :\n%s\n", szInfoLog);
					free(szInfoLog);
					uninitialize();					
					exit(0);
				}
			}
		}
		mUniform = glGetUniformLocation(gShaderProgramObject, "u_m_matrix");
		vUniform = glGetUniformLocation(gShaderProgramObject, "u_v_matrix");
		pUniform = glGetUniformLocation(gShaderProgramObject, "u_p_matrix");
		
		samplerUniform = glGetUniformLocation(gShaderProgramObject, "u_sampler");

		
		float *teapotVertices = new float[lengthOfArray];
		float *teapotNormals = new float[lengthOfArray];
		float *teapotTexCoords = new float[lengthOfTexCoordArray];

		//glBegin(GL_TRIANGLES);
		for (int i = 0; i < sizeof(face_indicies) / sizeof(face_indicies[0]); i++)
		{
			for (int j = 0; j < 3; j++)
			{
				int vi = face_indicies[i][j];
				int ni = face_indicies[i][j + 3];
				int ti = face_indicies[i][j + 6];

				//glTexCoord2f(textures[ti][0], textures[ti][1]);
				teapotNormals[i * 3 * 3 + j * 3 + 0] = normals[ni][0];
				teapotNormals[i * 3 * 3 + j * 3 + 1] = normals[ni][1];
				teapotNormals[i * 3 * 3 + j * 3 + 2] = normals[ni][2];

				teapotVertices[i * 3 * 3 + j * 3 + 0] = vertices[vi][0];
				teapotVertices[i * 3 * 3 + j * 3 + 1] = vertices[vi][1];
				teapotVertices[i * 3 * 3 + j * 3 + 2] = vertices[vi][2];
			
				teapotTexCoords[i * 3 * 2 + j * 2 + 0] = textures[ti][0];
				teapotTexCoords[i * 3 * 2 + j * 2 + 1] = textures[ti][1];
				
			}
		}
		//glEnd();


		glGenVertexArrays(1, &vao_teapot);
		glBindVertexArray(vao_teapot);

		glGenBuffers(1, &vbo_position_teapot);
		glBindBuffer(GL_ARRAY_BUFFER, vbo_position_teapot);
		glBufferData(GL_ARRAY_BUFFER, sizeof(float) * lengthOfArray, teapotVertices, GL_STATIC_DRAW);
		glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_TRUE, 0, NULL);
		glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
		glBindBuffer(GL_ARRAY_BUFFER, 0);

		glGenBuffers(1, &vbo_texture);
		glBindBuffer(GL_ARRAY_BUFFER, vbo_texture);
		glBufferData(GL_ARRAY_BUFFER, sizeof(float) * lengthOfTexCoordArray, teapotTexCoords, GL_STATIC_DRAW);
		glVertexAttribPointer(AMC_ATTRIBUTE_TEXCOORD0, 2, GL_FLOAT, GL_TRUE, 0, NULL);
		glEnableVertexAttribArray(AMC_ATTRIBUTE_TEXCOORD0);
		glBindBuffer(GL_ARRAY_BUFFER, 0);

		glBindVertexArray(0);

		glDisable(GL_CULL_FACE);
		glClearDepth(1.0f);
		glEnable(GL_DEPTH_TEST);
		glDepthFunc(GL_LEQUAL);
		glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
		perspectiveProjectionMatrix = mat4 :: identity();

		glEnable(GL_TEXTURE_2D);
		loadTexture(&texture_marble, MAKEINTRESOURCE(IDBITMAP_MARBLE));

		resize(WIN_WIDTH, WIN_HEIGHT);
		return 0;
	}
}

void resize(int width, int height)
{
	if (height == 0)
		height = 1;
	glViewport(0, 0, (GLsizei)width, (GLsizei)height);
	perspectiveProjectionMatrix = perspective(45.0f, (GLfloat)width/(GLfloat)height, 0.1f, 100.0f);
}

void display()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);

	//declarations of matrices
	
	mat4 translationMatrix;
	mat4 modelMatrix;
	mat4 viewMatrix;

	//rectangle 
	//initialize them to identity
	modelMatrix = mat4 :: identity();
	viewMatrix = mat4 :: identity();
	translationMatrix = mat4 :: identity();
	

	//do necessary matrix multiplications
	translationMatrix = translate(0.0f, 0.0f, -1.5f);	
	translationMatrix = translationMatrix * rotate(angleTeapot, 0.0f, 1.0f, 0.0f);
	viewMatrix = translationMatrix;
	
	//send necessary matrices to shader in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, perspectiveProjectionMatrix);
	
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, texture_marble);
	glUniform1i(samplerUniform, 0);


	//bind with vao which records buffer operations
	glBindVertexArray(vao_teapot);
	
	glDrawArrays(GL_TRIANGLES, 0, lengthOfArray/3);

	//unbind vao
	glBindVertexArray(0);
	//unuseprogram
	glUseProgram(0);
	SwapBuffers(ghdc);
}

void update()
{
	
	if(angleTeapot > 360.0f)
	{
		angleTeapot = 0.0f;
	}
	angleTeapot = angleTeapot + 0.1f;
}

void uninitialize()
{
	SetWindowLong(ghwnd, GWL_STYLE, dwStyle | WS_OVERLAPPEDWINDOW);
	SetWindowPlacement(ghwnd, &wpPrev);
	SetWindowPos(ghwnd,
		HWND_TOP,
		0,
		0,
		0,
		0,
		SWP_NOZORDER | SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOOWNERZORDER);
	ShowCursor(TRUE);

	if(vbo_position_teapot)
	{
		glDeleteBuffers(1, &vbo_position_teapot);
		vbo_position_teapot = 0;
	}
	if(vao_teapot)
	{
		glDeleteVertexArrays(1, &vao_teapot);
		vao_teapot = 0;
	}

	
	
	GLsizei shaderCount, shaderNumber;
	if(gShaderProgramObject)
	{
		
		glUseProgram(gShaderProgramObject);
		glGetProgramiv(gShaderProgramObject, GL_ATTACHED_SHADERS, &shaderCount);
		GLuint *pShaders = (GLuint *)malloc( shaderCount * sizeof(GLuint));
		if(pShaders)
		{
			glGetAttachedShaders(gShaderProgramObject, shaderCount, &shaderCount, pShaders);
			for(shaderNumber = 0 ; shaderNumber < shaderCount ; shaderNumber++)
			{
				glDetachShader(gShaderProgramObject, pShaders[shaderNumber]);
				glDeleteShader(pShaders[shaderNumber]);
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
		ReleaseDC(ghwnd, ghdc);
		ghdc = NULL;
	}
	if (gpFile)
	{
		fprintf(gpFile, "Closing File\n");
		fclose(gpFile);
		gpFile = NULL;
	}
	
}

BOOL loadTexture(GLuint *texture, TCHAR imageResourceID[])
{
	HBITMAP hBitmap = NULL;
	BITMAP bmp;
	BOOL bStatus = FALSE;

	//code
	hBitmap = (HBITMAP)LoadImage(
		GetModuleHandle(NULL),
		imageResourceID,
		IMAGE_BITMAP,
		0,
		0,
		LR_CREATEDIBSECTION
	);
	if (hBitmap)
	{
		bStatus = TRUE;
		GetObject(hBitmap, sizeof(BITMAP), &bmp);
		glPixelStorei(GL_UNPACK_ALIGNMENT, 4);
		glGenTextures(1, texture);
		glBindTexture(GL_TEXTURE_2D, *texture);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
		glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB,
			bmp.bmWidth, bmp.bmHeight,
			0, GL_BGR, GL_UNSIGNED_BYTE,
			bmp.bmBits);
		glGenerateMipmap(GL_TEXTURE_2D);
		DeleteObject(hBitmap);
	}
	return bStatus;
}
