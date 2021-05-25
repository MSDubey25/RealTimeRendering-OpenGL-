#include<windows.h>
#include<stdio.h>
#include<iostream>
#include<gl/glew.h>
#include<gl/GL.h>
#include"vmath.h"
#include"Sphere.h"
#include<filesystem>

#pragma comment(lib,"glew32.lib")
#pragma comment(lib,"opengl32.lib")
#pragma comment(lib, "Sphere.lib")
#pragma comment(lib, "user32.lib")
#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "kernel32.lib")

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

unsigned int gNumVertices = 0;
unsigned int gNumElements = 0;

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

GLuint vao_sphere;
GLuint vbo_position_sphere;
GLuint vbo_normal_sphere;
GLuint vbo_elements_sphere;

float sphere_vertices[1146];
float sphere_normals[1146];
float sphere_textures[764];
unsigned short sphere_elements[2280];


GLuint mUniform;
GLuint vUniform;
GLuint pUniform;

mat4 perspectiveProjectionMatrix;

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpszCmdLine, int iCmdShow)
{
	//variable declarations
	WNDCLASSEX wndclass;
	TCHAR szAppName[] = TEXT("SpotLight");
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
		TEXT("SpotLight"),
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
		if (result != GLEW_OK)
		{
			fprintf(gpFile, "GLEW INIT FAILED\n");
			uninitialize();
			DestroyWindow(ghwnd);
		}

		//Define vertex shader object
		gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);
		//write vertex code
		const GLchar* vertexShaderSourceCode =
			"#version 410 core"\
			"\n"\
			"in vec3 vPosition;"\
			"in vec3 vNormal;"\
			"out vec3 FragPos;"\
			"out vec3 Normal;"\
			"uniform mat4 u_m_matrix;"\
			"uniform mat4 u_v_matrix;"\
			"uniform mat4 u_p_matrix;"\
			"void main()"\
			"{"\
			"    FragPos = vec3(u_m_matrix * vec4(vPosition, 1.0));"\
			"    Normal = mat3(transpose(inverse(u_m_matrix))) * vNormal;"\
			"    gl_Position = u_p_matrix * u_v_matrix * vec4(FragPos, 1.0);"\
			"}";

		glShaderSource(gVertexShaderObject, 1, (const GLchar**)&vertexShaderSourceCode, NULL);

		//compile the vertex shader
		glCompileShader(gVertexShaderObject);

		GLint iShaderCompileStatus = 0;
		GLint iInfoLogLength = 0;
		char *szInfoLog = NULL;
		glGetShaderiv(gVertexShaderObject, GL_COMPILE_STATUS, &iShaderCompileStatus);
		if (iShaderCompileStatus == GL_FALSE)
		{
			glGetShaderiv(gVertexShaderObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);
			if (iInfoLogLength > 0)
			{

				szInfoLog = (char *)malloc(sizeof(iInfoLogLength));
				if (szInfoLog != NULL)
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
			"#version 410 core"\
			"\n"\
			"out vec4 FragColor;"\
			"float Materialshininess = 32.0;"\
			"vec3 Lightposition = vec3(0.0, 0.0, 1.0);"\
			"vec3 Lightdirection = vec3(0.0, 1.0, 0.0);"\
			"float LightcutOff = cos(50.5 * 3.1428 / 180.0);"\
			"vec3 Lightambient = vec3(0.1, 0.1, 0.1);"\
			"vec3 Lightdiffuse = vec3(1.0, 0.0, 0.0);"\
			"vec3 Lightspecular = vec3(1.0, 0.0, 0.0);"\
			"float Lightconstant = 1.0;"\
			"float Lightlinear = 0.09;"\
			"float Lightquadratic = 0.032;"\
			"in vec3 FragPos;"\
			"in vec3 Normal;"\
			"vec3 viewPos = vec3(10.0, 10.0, 10.0);"\
			"void main()"\
			"{"\
			"	vec3 lightDir = normalize(Lightposition - FragPos);"\
			"	float theta = dot(lightDir, normalize(-Lightdirection));"\
			"	if(theta < LightcutOff)"\
			"	{"\
			"		vec3 ambient = Lightambient;"\
			"		vec3 norm = normalize(Normal);"\
			"		float diff = max(dot(norm, lightDir), 0.0);"\
			"		vec3 diffuse = Lightdiffuse * diff;"\
			"		vec3 viewDir = normalize(viewPos - FragPos);"\
			"		vec3 reflectDir = reflect(-lightDir, norm);"\
			"		float spec = pow(max(dot(viewDir, reflectDir), 0.0), Materialshininess);"\
			"		vec3 specular = Lightspecular * spec;"\
			"		float distance    = length(Lightposition - FragPos);"\
			"		float attenuation = 1.0 / (Lightconstant + Lightlinear * distance + Lightquadratic * (distance * distance));"\
			"		float spotAttenuation = pow(theta, 10.0); attenuation *= 1; "\
			"		diffuse = diffuse * attenuation;"\
			"		specular = specular * attenuation;"\
			"		vec3 light = ambient + diffuse + specular;"\
			"		FragColor = vec4(light, 1.0);"\
			"	}"\
			"	else "\
			"	{"\
			"		FragColor = vec4(0.0, 1.0, 0.0, 1.0);"\
			"	}"\
			"}";

		glShaderSource(gFragmentShaderObject, 1, (const GLchar**)&fragmentShaderSourceCode, NULL);

		//compile the fragment shader
		glCompileShader(gFragmentShaderObject);

		iShaderCompileStatus = 0;
		iInfoLogLength = 0;
		szInfoLog = NULL;
		glGetShaderiv(gFragmentShaderObject, GL_COMPILE_STATUS, &iShaderCompileStatus);
		if (iShaderCompileStatus == GL_FALSE)
		{
			glGetShaderiv(gFragmentShaderObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);
			if (iInfoLogLength > 0)
			{

				szInfoLog = (char *)malloc(sizeof(iInfoLogLength));
				if (szInfoLog != NULL)
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
		glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_NORMAL, "vNormal");

		//link shader program
		glLinkProgram(gShaderProgramObject);

		GLint iProgramLinkStatus = 0;
		iInfoLogLength = 0;
		szInfoLog = NULL;
		glGetProgramiv(gShaderProgramObject, GL_LINK_STATUS, &iProgramLinkStatus);
		if (iProgramLinkStatus == GL_FALSE)
		{
			glGetProgramiv(gShaderProgramObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);
			if (iInfoLogLength > 0)
			{
				szInfoLog = (char *)malloc(iInfoLogLength);
				if (szInfoLog != NULL)
				{
					GLsizei written;
					glGetProgramInfoLog(gShaderProgramObject, iInfoLogLength, &written, szInfoLog);
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

		getSphereVertexData(sphere_vertices, sphere_normals, sphere_textures, sphere_elements);
		gNumVertices = getNumberOfSphereVertices();
		gNumElements = getNumberOfSphereElements();

		glGenVertexArrays(1, &vao_sphere);
		glBindVertexArray(vao_sphere);

		glGenBuffers(1, &vbo_position_sphere);
		glBindBuffer(GL_ARRAY_BUFFER, vbo_position_sphere);
		glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_vertices), sphere_vertices, GL_STATIC_DRAW);
		glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_TRUE, 0, NULL);
		glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
		glBindBuffer(GL_ARRAY_BUFFER, 0);

		glGenBuffers(1, &vbo_normal_sphere);
		glBindBuffer(GL_ARRAY_BUFFER, vbo_normal_sphere);
		glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_normals), sphere_normals, GL_STATIC_DRAW);
		glVertexAttribPointer(AMC_ATTRIBUTE_NORMAL, 3, GL_FLOAT, GL_TRUE, 0, NULL);
		glEnableVertexAttribArray(AMC_ATTRIBUTE_NORMAL);
		glBindBuffer(GL_ARRAY_BUFFER, 0);

		glGenBuffers(1, &vbo_elements_sphere);
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_elements_sphere);
		glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphere_elements), sphere_elements, GL_STATIC_DRAW);
		glBindBuffer(GL_ARRAY_BUFFER, 0);

		glBindVertexArray(0);


		if (remove("three.txt") != 0)
		{
			fprintf(gpFile, "error deleting file\n");
		}
		else
		{
			fprintf(gpFile, "success deleting file\n");
		}

		glDisable(GL_CULL_FACE);
		glClearDepth(1.0f);
		glEnable(GL_DEPTH_TEST);
		glDepthFunc(GL_LEQUAL);
		glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
		perspectiveProjectionMatrix = mat4::identity();
		resize(WIN_WIDTH, WIN_HEIGHT);
		return 0;
	}
}

void resize(int width, int height)
{
	if (height == 0)
		height = 1;
	glViewport(0, 0, (GLsizei)width, (GLsizei)height);
	perspectiveProjectionMatrix = perspective(45.0f, (GLfloat)width / (GLfloat)height, 0.1f, 100.0f);
}

void display()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);

	//declarations of matrices
	mat4 translationMatrix;
	mat4 modelMatrix;
	mat4 viewMatrix;

	modelMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	translationMatrix = mat4::identity();
	//do necessary matrix multiplications
	translationMatrix = translate(0.0f, 0.0f, -3.0f);
	viewMatrix = translationMatrix;

	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, perspectiveProjectionMatrix);

	glBindVertexArray(vao_sphere);

	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_elements_sphere);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);

	//unbind vao
	glBindVertexArray(0);
	//unuse program
	glUseProgram(0);
	SwapBuffers(ghdc);

}

void update()
{


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

	if (vbo_normal_sphere)
	{
		glDeleteBuffers(1, &vbo_normal_sphere);
		vbo_normal_sphere = 0;
	}
	if (vbo_position_sphere)
	{
		glDeleteBuffers(1, &vbo_position_sphere);
		vbo_position_sphere = 0;
	}
	if (vao_sphere)
	{
		glDeleteVertexArrays(1, &vao_sphere);
		vao_sphere = 0;
	}



	GLsizei shaderCount, shaderNumber;
	if (gShaderProgramObject)
	{

		glUseProgram(gShaderProgramObject);
		glGetProgramiv(gShaderProgramObject, GL_ATTACHED_SHADERS, &shaderCount);
		GLuint *pShaders = (GLuint *)malloc(shaderCount * sizeof(GLuint));
		if (pShaders)
		{
			glGetAttachedShaders(gShaderProgramObject, shaderCount, &shaderCount, pShaders);
			for (shaderNumber = 0; shaderNumber < shaderCount; shaderNumber++)
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
