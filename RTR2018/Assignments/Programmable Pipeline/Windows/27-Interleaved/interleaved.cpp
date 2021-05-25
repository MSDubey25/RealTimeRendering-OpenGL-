#include<Windows.h>
#include<GL/glew.h>
#include<gl/GL.h>
#include<stdio.h>
#include "vmath.h"
#include "texture.h"


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

GLuint vao_pyramid;
GLuint vbo_position_pyramid;
GLuint vbo_normal_pyramid;
GLuint mUniform;
GLuint vUniform;
GLuint pUniform;
GLuint laRedUniform;
GLuint ldRedUniform;
GLuint lsRedUniform;
GLuint lightPositionRedUniform;
GLuint kaUniform;
GLuint kdUniform;
GLuint ksUniform;
GLuint materialShininessUniform;
GLuint isLkeyPressedUniform;
GLuint texture_marble;

mat4 projectionMatrix;
mat4 modelMatrix;
mat4 viewMatrix;

bool gbIsLighting = false;
bool gbIsAnimation = false;

float light_ambient_red[4] = {0.25f,0.25f,0.25f,1.0f};
float light_diffuse_red[4] = { 1.0f,1.0f,1.0f,1.0f };
float light_specular_red[4] = { 1.0f,1.0f,1.0f,1.0f };
float light_position_red[4] = { -2.0f,0.0f,0.0f,1.0f };

float material_ambient[4] = { 0.5f,0.5f,0.5f,1.0f };
float material_diffuse[4] = { 1.0f,1.0f,1.0f,1.0f };
float material_specular[4] = { 1.0f,1.0f,1.0f,1.0f };
float material_shininess[1] = { 128.0f };


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

	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("InterLeaved"),
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
		case 'a':case 'A':
			if (gbIsAnimation == false)
			{
				gbIsAnimation = true;
			}
			else
			{
				gbIsAnimation = false;
			}
			fprintf(gpFile, "\nA key is pressed\n");
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
	fwprintf(gpFile, TEXT("\nValue of ivertex shader compile Status is : %d\n"), result);
	if (result != GLEW_OK)
	{
		fprintf(gpFile, "\nGLEW Init Failed\n");
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
		"in vec3 vNormal;" \
		"in vec4 vColor;" \
		"in vec2 vTexCoord;" \
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
		"out vec4 out_vColor;" \
		"out vec2 out_TexCoord;" \
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
		"		" \
		"	}" \
		"	else" \
		"	{" \
		"		white=vec3(1.0,1.0,1.0);" \
		"	}" \
		"gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" \
		"out_vColor=vColor;" \
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
	const GLchar *fragmentShaderSourceCode =
		"#version 330 core" \
		"\n" \
		"in vec2 out_TexCoord;" \
		"in vec3 light_direction;" \
		"in vec3 reflection_vector;" \
		"in vec3 viewer_vector;" \
		"in vec3 transformedNormal;" \
		"in vec3 white;" \
		"in vec4 out_vColor;" \
		"uniform sampler2D u_sampler;" \
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
		"		" \
		"		float tn_dot_lightdirection=max(dot(normalized_light_direction,normalized_tNormal),0.0f);" \
		"		vec3 ambient=u_la*u_ka;" \
		"		vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;" \
		"		vec3 specular=u_ls*u_ks*pow(max(dot(normalized_reflection_vector,normalized_viewer_vector),0.0f),u_materialShininess);" \
		"		vec3 phong_ads_light=ambient+diffuse+specular;" \
		"		vec4 texture=texture(u_sampler,out_TexCoord);" \
		"		FragColor=vec4(vec3(out_vColor*texture)*phong_ads_light,1.0);" \
		/*"		FragColor=out_vColor;" \*/
		"	}" \
		"	else" \
		"	{" \
		"		FragColor=vec4(white,1.0);" \
		"	}" \
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
	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_COLOR, "vColor");
	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_NORMAL, "vNormal");
	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_TEXCOORD0, "vTexCoord");
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
	laRedUniform = glGetUniformLocation(gShaderProgramObject, "u_la");
	ldRedUniform = glGetUniformLocation(gShaderProgramObject, "u_ld");
	lsRedUniform = glGetUniformLocation(gShaderProgramObject, "u_ls");
	lightPositionRedUniform = glGetUniformLocation(gShaderProgramObject, "u_lightPosition");
	kaUniform = glGetUniformLocation(gShaderProgramObject, "u_ka");
	kdUniform = glGetUniformLocation(gShaderProgramObject, "u_kd");
	ksUniform = glGetUniformLocation(gShaderProgramObject, "u_ks");
	materialShininessUniform = glGetUniformLocation(gShaderProgramObject, "u_materialShininess");
	isLkeyPressedUniform = glGetUniformLocation(gShaderProgramObject, "u_LkeyIsPressed");
	
	const GLfloat VCNTArray[] = {
		-1.0f, 1.0f, -1.0f,1.0f,0.0f,0.0f,0.0f, 1.0f, 0.0f,0.0f,1.0f,
		-1.0f, 1.0f,  1.0f,1.0f,0.0f,0.0f,0.0f, 1.0f, 0.0f,0.0f,0.0f,
		 1.0f, 1.0f,  1.0f,1.0f,0.0f,0.0f,0.0f, 1.0f, 0.0f,1.0f,0.0f,
		 1.0f, 1.0f, -1.0f,1.0f,0.0f,0.0f,0.0f, 1.0f, 0.0f,1.0f,1.0f,
		-1.0f,-1.0f, -1.0f,0.0f,0.0f,1.0f,0.0f,-1.0f, 0.0f,1.0f,1.0f,
		-1.0f, -1.0f, 1.0f,0.0f,0.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,1.0f,
		 1.0f, -1.0f, 1.0f,0.0f,0.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,0.0f,
		 1.0f, -1.0f,-1.0f,0.0f,0.0f,1.0f,0.0f,-1.0f, 0.0f,1.0f,0.0f,
		 1.0f, 1.0f,  1.0f,0.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f,0.0f,0.0f,
		-1.0f, 1.0f,  1.0f,0.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f,1.0f,0.0f,
		-1.0f, -1.0f, 1.0f,0.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f,1.0f,1.0f,
		 1.0f, -1.0f, 1.0f,0.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f,0.0f,1.0f,
		-1.0f, 1.0f, -1.0f,0.0f,1.0f,1.0f,0.0f, 0.0f,-1.0f,1.0f,0.0f,
		 1.0f, 1.0f, -1.0f,0.0f,1.0f,1.0f,0.0f, 0.0f,-1.0f,1.0f,1.0f,
		 1.0f, -1.0f,-1.0f,0.0f,1.0f,1.0f,0.0f, 0.0f,-1.0f,0.0f,1.0f,
		-1.0f, -1.0f,-1.0f,0.0f,1.0f,1.0f,0.0f, 0.0f,-1.0f,0.0f,0.0f,
		 1.0f, 1.0f, -1.0f,1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f,1.0f,0.0f,
		 1.0f, 1.0f,  1.0f,1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f,1.0f,1.0f,
		 1.0f, -1.0f, 1.0f,1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f,0.0f,1.0f,
		 1.0f, -1.0f,-1.0f,1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f,0.0f,0.0f,
		-1.0f, 1.0f,  1.0f,1.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,0.0f,0.0f,
		-1.0f, 1.0f, -1.0f,1.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,1.0f,0.0f,
		-1.0f, -1.0f,-1.0f,1.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,1.0f,1.0f,
		-1.0f, -1.0f, 1.0f,1.0f,1.0f,0.0f,-1.0f, 0.0f,0.0f,0.0f,1.0f
	};
	//create vao
	glGenVertexArrays(1, &vao_pyramid);
	glBindVertexArray(vao_pyramid);
	//for position
	glGenBuffers(1, &vbo_position_pyramid);
	glBindBuffer(GL_ARRAY_BUFFER, vbo_position_pyramid);
	glBufferData(GL_ARRAY_BUFFER, sizeof(VCNTArray),
		VCNTArray, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 11*sizeof(GLfloat), (void *)(0*sizeof(GLfloat)));
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glVertexAttribPointer(AMC_ATTRIBUTE_COLOR, 3, GL_FLOAT, GL_FALSE, 11 * sizeof(GLfloat), (void *)(3 * sizeof(GLfloat)));
	glEnableVertexAttribArray(AMC_ATTRIBUTE_COLOR);
	glVertexAttribPointer(AMC_ATTRIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 11 * sizeof(GLfloat), (void *)(6 * sizeof(GLfloat)));
	glEnableVertexAttribArray(AMC_ATTRIBUTE_NORMAL);
	glVertexAttribPointer(AMC_ATTRIBUTE_TEXCOORD0, 2, GL_FLOAT, GL_FALSE, 11 * sizeof(GLfloat), (void *)(9 * sizeof(GLfloat)));
	glEnableVertexAttribArray(AMC_ATTRIBUTE_TEXCOORD0);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glBindVertexArray(0);
	/////////////////////////////////////////////////////////
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	glClearDepth(1.0f);
	projectionMatrix = mat4::identity();
	viewMatrix = mat4::identity();
	modelMatrix = mat4::identity();
	Resize(WIN_WIDTH, WIN_HEIGHT);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);
	LoadTexture(&texture_marble, MAKEINTRESOURCE(ID_MARBLE));
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
	projectionMatrix=perspective(45.0f,
		(GLfloat)width / (GLfloat)height,
		0.1f,
		100.0f);
}
void Display(void)
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);

	//declaration of matrices
	mat4 translationMatrix;
	mat4 rotationMatrix;
	mat4 scaleMatrix;
	//initialize above to identity
	translationMatrix = mat4::identity();
	rotationMatrix = mat4::identity();
	scaleMatrix = mat4::identity();
	//do necessary transformation
	translationMatrix = translate(0.0f,0.0f,-8.0f);
	rotationMatrix = rotate(angle_rect,1.0f,0.0f,0.0f);
	rotationMatrix = rotationMatrix* rotate(angle_rect, 0.0f, 1.0f, 0.0f);
	rotationMatrix = rotationMatrix*rotate(angle_rect, 0.0f, 0.0f, 1.0f);
	//scaleMatrix = scale(0.5f,0.5f,0.5f);
	modelMatrix = translationMatrix*scaleMatrix*rotationMatrix;
	//do necessary matrix multiplication
	if (gbIsLighting == true)
	{
		glUniform1i(isLkeyPressedUniform, 1);
		glUniform3fv(laRedUniform, 1, light_ambient_red);
		glUniform3fv(ldRedUniform, 1, light_diffuse_red);
		glUniform3fv(lsRedUniform, 1, light_specular_red);
		glUniform4fv(lightPositionRedUniform, 1,light_position_red);
		glUniform3fv(kaUniform, 1, material_ambient);
		glUniform3fv(kdUniform, 1, material_diffuse);
		glUniform3fv(ksUniform, 1, material_specular);
		glUniform1fv(materialShininessUniform, 1, material_shininess);
	}
	else
	{
		glUniform1i(isLkeyPressedUniform, 0);
	}

	//send necessary matrices to shaders in respective uniforms
	glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
	glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
	glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);

	// *** bind vao ***
	glBindVertexArray(vao_pyramid);

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
	if (gbIsAnimation == true)
	{
		angle_rect += 0.05f;
		if (angle_rect >= 360.0f)
			angle_rect = 0;
	}
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
	if (vbo_normal_pyramid)
	{
		glDeleteBuffers(1, &vbo_normal_pyramid);
		vbo_normal_pyramid = 0;
	}
	if (vao_pyramid)
	{
		glDeleteBuffers(1, &vao_pyramid);
		vao_pyramid = 0;
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
	glDeleteTextures(1, &texture_marble);
}














