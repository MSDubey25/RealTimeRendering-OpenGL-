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
GLuint laUniform_red;
GLuint ldUniform_red;
GLuint lsUniform_red;
GLuint lightPositionUniform_red;
GLuint laUniform_blue;
GLuint ldUniform_blue;
GLuint lsUniform_blue;
GLuint lightPositionUniform_blue;
GLuint laUniform_green;
GLuint ldUniform_green;
GLuint lsUniform_green;
GLuint lightPositionUniform_green;
GLuint kaUniform;
GLuint kdUniform;
GLuint ksUniform;
GLuint materialShininessUniform;
GLuint isLkeyPressedUniform;


mat4 projectionMatrix;
mat4 modelMatrix;
mat4 viewMatrix;
//for sphere
float sphere_vertices[1146];
float sphere_normals[1146];
float sphere_textures[764];
unsigned short sphere_elements[2280];

bool gbIsLighting = false;
bool gbIsVertexShader = true;
bool gbIsFragmentShader = false;

struct Light {
	GLfloat LightAmbience[4];
	GLfloat LightDiffuse[4];
	GLfloat LightSpecular[4];
	GLfloat LightPosition[4];
	GLfloat angle = 0.0f;
};

Light lights[3];
//float light_ambient[4] = {0.0f,0.0f,0.0f,0.0f};
//float light_diffuse[4] = { 0.35f,0.0f,0.5f,1.0f };
//float light_specular[4] = { 0.35f,0.0f,0.5f,1.0f };
//float light_position[4] = { 100.0f,100.0f,100.0f,1.0f };

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

	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("Three Rotating Lights on Steady Sphere"),
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
			/*else
			{
				gbIsFragmentShader = false; 
				gbIsVertexShader = true;
			}*/
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
			/*else
			{
				gbIsVertexShader = false;
				gbIsFragmentShader = true;
			}*/
			fprintf(gpFile, "\nV key is pressed\n");
			ShadersToggle();
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
		"uniform vec4 u_lightPosition_red;" \
		"uniform vec4 u_lightPosition_blue;" \
		"uniform vec4 u_lightPosition_green;" \
		"uniform int u_LkeyIsPressed;" \
		"out vec3 light_direction_red;" \
		"out vec3 light_direction_blue;" \
		"out vec3 light_direction_green;" \
		"out vec3 reflection_vector_red;" \
		"out vec3 reflection_vector_blue;" \
		"out vec3 reflection_vector_green;" \
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
		"		light_direction_red=vec3(u_lightPosition_red-eyeCoordinates);" \
		"		reflection_vector_red=reflect(-light_direction_red,transformedNormal);" \
		"		light_direction_blue=vec3(u_lightPosition_blue-eyeCoordinates);" \
		"		reflection_vector_blue=reflect(-light_direction_blue,transformedNormal);" \
		"		light_direction_green=vec3(u_lightPosition_green-eyeCoordinates);" \
		"		reflection_vector_green=reflect(-light_direction_green,transformedNormal);" \
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
		"uniform vec3 u_la_red;" \
		"uniform vec3 u_ld_red;" \
		"uniform vec3 u_ls_red;" \
		"uniform vec4 u_lightPosition_red;" \
		"uniform vec3 u_la_blue;" \
		"uniform vec3 u_ld_blue;" \
		"uniform vec3 u_ls_blue;" \
		"uniform vec4 u_lightPosition_blue;" \
		"uniform vec3 u_la_green;" \
		"uniform vec3 u_ld_green;" \
		"uniform vec3 u_ls_green;" \
		"uniform vec4 u_lightPosition_green;" \
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
		"		mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" \
		"		vec3 transformedNormal=normalize(normalMatrix*vNormal);" \
		/*"		vec3 transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);" \*/
		"		vec3 light_direction_red=normalize(vec3(u_lightPosition_red-eyeCoordinates));" \
		"		float tn_dot_lightdirection_red=max(dot(light_direction_red,transformedNormal),0.0f);" \
		"		vec3 reflection_vector_red=reflect(-light_direction_red,transformedNormal);" \
		"		vec3 light_direction_blue=normalize(vec3(u_lightPosition_blue-eyeCoordinates));" \
		"		float tn_dot_lightdirection_blue=max(dot(light_direction_blue,transformedNormal),0.0f);" \
		"		vec3 reflection_vector_blue=reflect(-light_direction_blue,transformedNormal);" \
		"		vec3 light_direction_green=normalize(vec3(u_lightPosition_green-eyeCoordinates));" \
		"		float tn_dot_lightdirection_green=max(dot(light_direction_green,transformedNormal),0.0f);" \
		"		vec3 reflection_vector_green=reflect(-light_direction_green,transformedNormal);" \
		"		vec3 viewer_vector=normalize(vec3(-eyeCoordinates));" \
		"		vec3 ambient=u_la_red*u_ka;" \
		"		vec3 diffuse=u_ld_red*u_kd*tn_dot_lightdirection_red;" \
		"		vec3 specular=u_ls_red*u_ks*pow(max(dot(reflection_vector_red,viewer_vector),0.0f),u_materialShininess);" \
		"		phong_ads_light=ambient+diffuse+specular;" \
		"		ambient=u_la_blue*u_ka;" \
		"		diffuse=u_ld_blue*u_kd*tn_dot_lightdirection_blue;" \
		"		specular=u_ls_blue*u_ks*pow(max(dot(reflection_vector_blue,viewer_vector),0.0f),u_materialShininess);" \
		"		phong_ads_light=phong_ads_light+(ambient+diffuse+specular);" \
		"		ambient=u_la_green*u_ka;" \
		"		diffuse=u_ld_green*u_kd*tn_dot_lightdirection_green;" \
		"		specular=u_ls_green*u_ks*pow(max(dot(reflection_vector_green,viewer_vector),0.0f),u_materialShininess);" \
		"		phong_ads_light=phong_ads_light+(ambient+diffuse+specular);" \
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
		"in vec3 light_direction_red;" \
		"in vec3 light_direction_blue;" \
		"in vec3 light_direction_green;" \
		"in vec3 reflection_vector_red;" \
		"in vec3 reflection_vector_blue;" \
		"in vec3 reflection_vector_green;" \
		"in vec3 viewer_vector;" \
		"in vec3 transformedNormal;" \
		"in vec3 white;" \
		"uniform vec3 u_la_red;" \
		"uniform vec3 u_ld_red;" \
		"uniform vec3 u_ls_red;" \
		"uniform vec3 u_la_blue;" \
		"uniform vec3 u_ld_blue;" \
		"uniform vec3 u_ls_blue;" \
		"uniform vec3 u_la_green;" \
		"uniform vec3 u_ld_green;" \
		"uniform vec3 u_ls_green;" \
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
		"		vec3 normalized_light_direction_red=normalize(light_direction_red);" \
		"		vec3 normalized_reflection_vector_red=normalize(reflection_vector_red);" \
		"		vec3 normalized_light_direction_blue=normalize(light_direction_blue);" \
		"		vec3 normalized_reflection_vector_blue=normalize(reflection_vector_blue);" \
		"		vec3 normalized_light_direction_green=normalize(light_direction_green);" \
		"		vec3 normalized_reflection_vector_green=normalize(reflection_vector_green);" \
		"		vec3 normalized_viewer_vector=normalize(viewer_vector);" \
		"		float tn_dot_lightdirection_red=max(dot(normalized_light_direction_red,normalized_tNormal),0.0f);" \
		"		float tn_dot_lightdirection_blue=max(dot(normalized_light_direction_blue,normalized_tNormal),0.0f);" \
		"		float tn_dot_lightdirection_green=max(dot(normalized_light_direction_green,normalized_tNormal),0.0f);" \
		"		vec3 ambient=u_la_red*u_ka+u_la_blue*u_ka+u_la_green*u_ka;" \
		"		vec3 diffuse=u_ld_red*u_kd*tn_dot_lightdirection_red+u_ld_blue*u_kd*tn_dot_lightdirection_blue+u_ld_green*u_kd*tn_dot_lightdirection_green;" \
		"		vec3 specular=u_ls_red*u_ks*pow(max(dot(normalized_reflection_vector_red,normalized_viewer_vector),0.0f),u_materialShininess)+u_ls_blue*u_ks*pow(max(dot(normalized_reflection_vector_blue,normalized_viewer_vector),0.0f),u_materialShininess)+u_ls_green*u_ks*pow(max(dot(normalized_reflection_vector_green,normalized_viewer_vector),0.0f),u_materialShininess);" \
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
	laUniform_red = glGetUniformLocation(gShaderProgramObject, "u_la_red");
	ldUniform_red = glGetUniformLocation(gShaderProgramObject, "u_ld_red");
	lsUniform_red = glGetUniformLocation(gShaderProgramObject, "u_ls_red");
	lightPositionUniform_red = glGetUniformLocation(gShaderProgramObject, "u_lightPosition_red");
	laUniform_blue = glGetUniformLocation(gShaderProgramObject, "u_la_blue");
	ldUniform_blue = glGetUniformLocation(gShaderProgramObject, "u_ld_blue");
	lsUniform_blue = glGetUniformLocation(gShaderProgramObject, "u_ls_blue");
	lightPositionUniform_blue = glGetUniformLocation(gShaderProgramObject, "u_lightPosition_blue");
	laUniform_green = glGetUniformLocation(gShaderProgramObject, "u_la_green");
	ldUniform_green = glGetUniformLocation(gShaderProgramObject, "u_ld_green");
	lsUniform_green = glGetUniformLocation(gShaderProgramObject, "u_ls_green");
	lightPositionUniform_green = glGetUniformLocation(gShaderProgramObject, "u_lightPosition_green");
	kaUniform = glGetUniformLocation(gShaderProgramObject, "u_ka");
	kdUniform = glGetUniformLocation(gShaderProgramObject, "u_kd");
	ksUniform = glGetUniformLocation(gShaderProgramObject, "u_ks");
	materialShininessUniform = glGetUniformLocation(gShaderProgramObject, "u_materialShininess");
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
	lights[0].LightAmbience[0] = 0.0f;
	lights[0].LightAmbience[1] = 0.0f;
	lights[0].LightAmbience[2] = 0.0f;
	lights[0].LightAmbience[3] = 1.0f;

	lights[0].LightDiffuse[0] = 1.0f;
	lights[0].LightDiffuse[1] = 0.0f;
	lights[0].LightDiffuse[2] = 0.0f;
	lights[0].LightDiffuse[3] = 1.0f;

	lights[0].LightSpecular[0] = 1.0f;
	lights[0].LightSpecular[1] = 0.0f;
	lights[0].LightSpecular[2] = 0.0f;
	lights[0].LightSpecular[3] = 1.0f;

	lights[1].LightAmbience[0] = 0.0f;
	lights[1].LightAmbience[1] = 0.0f;
	lights[1].LightAmbience[2] = 0.0f;
	lights[1].LightAmbience[3] = 1.0f;

	lights[1].LightDiffuse[0] = 0.0f;
	lights[1].LightDiffuse[1] = 1.0f;
	lights[1].LightDiffuse[2] = 0.0f;
	lights[1].LightDiffuse[3] = 1.0f;

	lights[1].LightSpecular[0] = 0.0f;
	lights[1].LightSpecular[1] = 1.0f;
	lights[1].LightSpecular[2] = 0.0f;
	lights[1].LightSpecular[3] = 1.0f;

	lights[2].LightAmbience[0] = 0.0f;
	lights[2].LightAmbience[1] = 0.0f;
	lights[2].LightAmbience[2] = 0.0f;
	lights[2].LightAmbience[3] = 1.0f;

	lights[2].LightDiffuse[0] = 0.0f;
	lights[2].LightDiffuse[1] = 0.0f;
	lights[2].LightDiffuse[2] = 1.0f;
	lights[2].LightDiffuse[3] = 1.0f;

	lights[2].LightSpecular[0] = 0.0f;
	lights[2].LightSpecular[1] = 0.0f;
	lights[2].LightSpecular[2] = 1.0f;
	lights[2].LightSpecular[3] = 1.0f;

	////////////////////////////////////////////////////////
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
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
	void update();
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);

	//declaration of matrices
	//viewMatrix[0] = 1.0f;
	//viewMatrix[5] = 1.0f;
	//viewMatrix[11] = 1.0f;
	mat4 translationMatrix;
	mat4 rotationMatrix;
	//initialize above to identity
	translationMatrix = mat4::identity();
	rotationMatrix = mat4::identity();
	//do necessary transformation
	translationMatrix = translate(0.0f,0.0f,-3.0f);
	modelMatrix = translationMatrix;
	//do necessary matrix multiplication
	if (gbIsLighting == true)
	{
		glUniform1i(isLkeyPressedUniform, 1);
		//rotationMatrix=rotate(lights[0].angle, 1.0f, 0.0f, 0.0f);
		/*lights[0].LightPosition[2] = cos(lights[0].angle) + sin(lights[0].angle);
		lights[0].LightPosition[1] = cos(lights[0].angle)- sin(lights[0].angle);
		lights[0].LightPosition[0] = 1.0f;
		lights[0].LightPosition[3] = 1.0f;*/
		/*lights[0].LightPosition[1] = 100.0f*cos(lights[0].angle);
		lights[0].LightPosition[2] = 100.0f + lights[1].angle;*/
		lights[0].LightPosition[0] = 0.0f;
		lights[0].LightPosition[1] = 100.0f*sin(lights[0].angle);
		lights[0].LightPosition[2] = 100.0f*cos(lights[0].angle);
		lights[0].LightPosition[3] = 1.0f;
		glUniform3fv(laUniform_red, 1, lights[0].LightAmbience);
		glUniform3fv(ldUniform_red, 1, lights[0].LightDiffuse);
		glUniform3fv(lsUniform_red, 1, lights[0].LightSpecular);
		glUniform4fv(lightPositionUniform_red, 1,lights[0].LightPosition);
		//rotationMatrix = rotationMatrix +rotate(lights[1].angle, 0.0f, 1.0f, 0.0f);
		/*lights[1].LightPosition[1] = 1.0f;
		lights[1].LightPosition[3] = 1.0f;
		lights[1].LightPosition[0] =-sin(lights[1].angle)+ cos(lights[1].angle);
		lights[1].LightPosition[2] = sin(lights[1].angle) + cos(lights[1].angle);*/
		/*lights[1].LightPosition[2] = 100.0f*sin(lights[1].angle);
		lights[1].LightPosition[0] = 100.0f + lights[1].angle;*/
		lights[1].LightPosition[0] = 100.0f*sin(lights[1].angle);
		lights[1].LightPosition[1] = 0.0f;
		lights[1].LightPosition[2] = 100.0f*cos(lights[1].angle);
		lights[1].LightPosition[3] = 1.0f;
		glUniform3fv(laUniform_blue, 1, lights[1].LightAmbience);
		glUniform3fv(ldUniform_blue, 1, lights[1].LightDiffuse);
		glUniform3fv(lsUniform_blue, 1, lights[1].LightSpecular);
		glUniform4fv(lightPositionUniform_blue, 1, lights[1].LightPosition);
		//rotationMatrix= rotationMatrix +rotate(lights[2].angle, 0.0f, 0.0f, 1.0f);
		/*lights[2].LightPosition[2] = 1.0f;
		lights[2].LightPosition[3] = 1.0f;
		lights[2].LightPosition[0] = cos(lights[2].angle)+sin(lights[2].angle);
		lights[2].LightPosition[1] = sin(lights[2].angle) + cos(lights[2].angle);*/
		/*lights[2].LightPosition[0] = 100.0f*(sin(lights[2].angle)* cos(lights[2].angle));
		lights[2].LightPosition[1] = 100.0f+lights[1].angle;*/
		lights[2].LightPosition[0] = 100.0f*sin(lights[2].angle);
		lights[2].LightPosition[1] = 100.0f*cos(lights[2].angle);
		lights[2].LightPosition[2] = 0.0f;
		lights[2].LightPosition[3] = 1.0f;
		glUniform3fv(laUniform_green, 1, lights[2].LightAmbience);
		glUniform3fv(ldUniform_green, 1, lights[2].LightDiffuse);
		glUniform3fv(lsUniform_green, 1, lights[2].LightSpecular);
		glUniform4fv(lightPositionUniform_green, 1, lights[2].LightPosition);
		glUniform3fv(kaUniform, 1, material_ambient);
		glUniform3fv(kdUniform, 1, material_diffuse);
		glUniform3fv(ksUniform, 1, material_specular);
		glUniform1fv(materialShininessUniform, 1, material_shininess);
		//modelMatrix = modelMatrix * rotationMatrix;
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
	glBindVertexArray(vao_sphere);

	// *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
	glDrawElements(GL_TRIANGLES, gNumElements, GL_UNSIGNED_SHORT, 0);

	// *** unbind vao ***
	glBindVertexArray(0);

	//unuse program
	glUseProgram(0);
	SwapBuffers(ghdc);
	
	
	update();
}
void update()
{
	if (lights[0].angle >= 360.0f)
		lights[0].angle = 0.0f;
	else
		lights[0].angle += 0.001f;

	if (lights[1].angle >= 360.0f)
		lights[1].angle = 0.0f;
	else
		lights[1].angle += 0.001f;

	if (lights[2].angle >= 360.0f)
		lights[2].angle = 0.0f;
	else
		lights[2].angle += 0.001f;
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














