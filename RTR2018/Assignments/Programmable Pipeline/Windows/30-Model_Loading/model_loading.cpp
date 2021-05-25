#include<Windows.h>
#include<stdio.h>
#include<GL/glew.h>
#include<gl/GL.h>
#include"vmath.h"

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

//Global variables

GLuint vao;
GLuint vbo;
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

//Shaders variable

GLint gVertexShaderObject;
GLint gFragmentShaderObject;
GLint gShaderProgramObject;

FILE * gpFile = NULL;

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

struct vec_int {
	int *p;
	int size;
};

struct vec_float {
	float *pf;
	int size;
};

char buffer[BUFFER_SIZE];

FILE *gp_mesh_file;
struct vec_float *gp_vertex, *gp_texture, *gp_normal;
struct vec_float *gp_vertex_sorted, *gp_texture_sorted, *gp_normal_sorted;
struct vec_int *gp_vertex_indices, *gp_texture_indices, *gp_normal_indices;

GLuint gElementBuffer;

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


	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("Monkey Head"), WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE, 100, 100, WIN_WIDTH, WIN_HEIGHT, NULL, NULL, hInstance, NULL);

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
	void load_mesh();

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
		"#version 440 core" \
		"\n" \
		"in vec4 vPosition;" \
		"uniform mat4 u_mvp_matrix;" \
		"void main(void)" \
		"{" \
		"gl_Position=u_mvp_matrix*vPosition;" \
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
		"#version 440 core" \
		"\n" \
		"out vec4 FragColor;" \
		"void main(void)" \
		"{" \
		"FragColor=vec4(1.0,1.0,0.0,1.0);" \
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

	load_mesh();

	
	glGenVertexArrays(1, &vao);
	glBindVertexArray(vao);
	glGenBuffers(1, &vbo);
	glBindBuffer(GL_ARRAY_BUFFER, vbo);
	glBufferData(GL_ARRAY_BUFFER, (gp_vertex_sorted->size) * sizeof(GLfloat), gp_vertex_sorted->pf, GL_STATIC_DRAW);
	glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
	glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glGenBuffers(1, &gElementBuffer);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, gElementBuffer);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, gp_vertex_indices->size * sizeof(int), gp_vertex_indices->p,GL_STATIC_DRAW);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
		
	glBindVertexArray(0);

	//
	glShadeModel(GL_SMOOTH);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);
	glClearDepth(1.0f);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
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
	perspectiveProjectionMatrix = perspective(45.0f, (GLfloat)width / (GLfloat)height, 0.1f, 100.0f);
}

void display()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(gShaderProgramObject);

	mat4 modelViewMatrix;
	mat4 modelViewProjectionMatrix;

	modelViewMatrix = mat4::identity();
	modelViewProjectionMatrix = mat4::identity();
	modelViewMatrix = translate(0.0f, 0.0f, -6.0f);
	modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
	glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
	glBindVertexArray(vao);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, gElementBuffer);
	glDrawElements(GL_TRIANGLES, (gp_vertex_indices->size), GL_UNSIGNED_INT, NULL);
	glBindVertexArray(0);
	glUseProgram(0);
	SwapBuffers(gHdc);
}



void uninitialize()
{
	if (vbo)
	{
		glDeleteBuffers(1, &vbo);
		vbo = 0;
	}
	if (vao)
	{
		glDeleteVertexArrays(1, &vao);
		vao = 0;
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


void load_mesh(void)
{
	void uninitialize(void);

	struct vec_int *create_vec_int();
	struct vec_float *create_vec_float();
	int push_back_vec_int(struct vec_int *p_vec_int, int data);
	int push_back_vec_float(struct vec_float *p_vec_float, float data);
	void show_vec_float(struct vec_float *p_vec_float);
	void show_vec_int(struct vec_int *p_vec_int);
	int destroy_vec_float(struct vec_float *p_vec_float);

	char *first_token = NULL;
	char *token = NULL;
	const char *space = " ";
	const char *slash = "/";
	char* f_entries[3] = { NULL, NULL, NULL };
	char* next_token = NULL;

	int nr_pos_cords = 0, nr_tex_cords = 0, nr_normal_cords = 0, nr_faces = 0;

	fopen_s(&gp_mesh_file, "MonkeyHead.OBJ", "r");
	if (gp_mesh_file == NULL)
	{
		fprintf(stderr, "error in opening file\n");
		exit(EXIT_FAILURE);
	}

	gp_vertex = create_vec_float();
	if (gp_vertex == NULL)
	{
		fprintf(gpFile, "Failed to allocate memory to vertices vector\n");
		uninitialize();
		exit(0);
	}
	gp_normal = create_vec_float();
	if (gp_normal == NULL)
	{
		fprintf(gpFile, "Failed to allocate memory to vertices vector\n");
		uninitialize();
		exit(0);
	}
	gp_texture = create_vec_float();
	if (gp_texture == NULL)
	{
		fprintf(gpFile, "Failed to allocate memory to vertices vector\n");
		uninitialize();
		exit(0);
	}

	gp_vertex_indices= create_vec_int();
	if (gp_vertex_indices == NULL)
	{
		fprintf(gpFile, "Failed to allocate memory to vertices vector\n");
		uninitialize();
		exit(0);
	}
	gp_normal_indices = create_vec_int();
	if (gp_normal_indices == NULL)
	{
		fprintf(gpFile, "Failed to allocate memory to vertices vector\n");
		uninitialize();
		exit(0);
	}
	gp_texture_indices = create_vec_int();
	if (gp_texture_indices == NULL)
	{
		fprintf(gpFile, "Failed to allocate memory to vertices vector\n");
		uninitialize();
		exit(0);
	}

	while ((fgets(buffer, BUFFER_SIZE, gp_mesh_file) != NULL) && !feof(gp_mesh_file))
	{
		first_token = strtok_s(buffer, space, &next_token);

		if (strcmp(first_token, "v") == 0)
		{
			nr_pos_cords++;
			while ((token = strtok_s(NULL, space, &next_token)) != NULL)
				push_back_vec_float(gp_vertex, (float)atof(token));
		}
		else if (strcmp(first_token, "vt") == 0)
		{
			nr_tex_cords++;
			while ((token = strtok_s(NULL, space, &next_token)) != NULL)
				push_back_vec_float(gp_texture, (float)atof(token));
		}
		else if (strcmp(first_token, "vn") == 0)
		{
			nr_normal_cords++;
			while ((token = strtok_s(NULL, space, &next_token)) != NULL)
				push_back_vec_float(gp_normal, (float)atof(token));
		}
		else if (strcmp(first_token, "f") == 0)
		{
			nr_faces++;
			for (int i = 0; i < 3; i++)
			{
				f_entries[i] = strtok_s(NULL, space, &next_token);
			}

			for (int i = 0; i < 3; i++)
			{
				token = strtok_s(f_entries[i], slash, &next_token);
				push_back_vec_int(gp_vertex_indices, atoi(token) - 1);
				token = strtok_s(NULL, slash, &next_token);
				push_back_vec_int(gp_texture_indices, atoi(token) - 1);
				token = strtok_s(NULL, slash, &next_token);
				push_back_vec_int(gp_normal_indices, atoi(token) - 1);
			}
		}
	}

	gp_vertex_sorted = create_vec_float();
	if (gp_vertex_sorted == NULL)
	{
		fprintf(gpFile, "Failed to allocate memory to vertices vector\n");
		uninitialize();
		exit(0);
	}
	for (int i = 0; i < gp_vertex_indices->size; i++)
		push_back_vec_float(gp_vertex_sorted, gp_vertex->pf[i]);

	gp_normal_sorted = create_vec_float();
	if (gp_normal_sorted == NULL)
	{
		fprintf(gpFile, "Failed to allocate memory to vertices vector\n");
		uninitialize();
		exit(0);
	}
	for (int i = 0; i < gp_normal_indices->size; i++)
		push_back_vec_float(gp_normal_sorted, gp_normal->pf[i]);

	gp_texture_sorted = create_vec_float();
	if (gp_texture_sorted == NULL)
	{
		fprintf(gpFile, "Failed to allocate memory to vertices vector\n");
		uninitialize();
		exit(0);
	}
	for (int i = 0; i < gp_texture_indices->size; i++)
		push_back_vec_float(gp_texture_sorted, gp_texture->pf[i]);

	fclose(gp_mesh_file);
	gp_mesh_file = NULL;


}


struct vec_int *create_vec_int()
{
	struct vec_int *p = (struct vec_int*)malloc(sizeof(struct vec_int));
	memset(p, 0, sizeof(struct vec_int));
	return p;
}

struct vec_float *create_vec_float()
{
	struct vec_float *p = (struct vec_float*)malloc(sizeof(struct vec_float));
	memset(p, 0, sizeof(struct vec_float));
	return p;
}

int push_back_vec_int(struct vec_int *p_vec_int, int data)
{
	p_vec_int->p = (int*)realloc(p_vec_int->p, (p_vec_int->size + 1) * sizeof(int));
	p_vec_int->size = p_vec_int->size + 1;
	p_vec_int->p[p_vec_int->size - 1] = data;
	return (0);
}

int push_back_vec_float(struct vec_float *p_vec_float, float data)
{
	p_vec_float->pf = (float*)realloc(p_vec_float->pf, (p_vec_float->size + 1) * sizeof(float));
	p_vec_float->size = p_vec_float->size + 1;
	p_vec_float->pf[p_vec_float->size - 1] = data;
	return (0);
}

int destroy_vec_int(struct vec_int *p_vec_int)
{
	free(p_vec_int->p);
	free(p_vec_int);
	return (0);
}

int destroy_vec_float(struct vec_float *p_vec_float)
{
	free(p_vec_float->pf);
	free(p_vec_float);
	return (0);
}

void show_vec_float(struct vec_float *p_vec_float)
{
	int i;
	for (i = 0; i < p_vec_float->size; i++)
		fprintf(gpFile, "%f\n", p_vec_float->pf[i]);
}

void show_vec_int(struct vec_int *p_vec_int)
{
	int i;
	for (i = 0; i < p_vec_int->size; i++)
		fprintf(gpFile, "%d\n", p_vec_int->p[i]);
}
