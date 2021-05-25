#include<Windows.h>
#include<gl/GL.h>
#include<gl/GLU.h>
#include<stdio.h>

#pragma comment(lib,"opengl32.lib")
#pragma comment(lib,"glu32.lib")
#define WIN_WIDTH 800
#define WIN_HEIGHT 600

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

bool bFullScreen = false;
HWND ghHwnd = NULL;
DWORD dwStyle;
WINDOWPLACEMENT wpPrev = { sizeof(WINDOWPLACEMENT) };
HDC ghdc = NULL;
HGLRC ghrc = NULL;
bool gbActiveWindow = false;
FILE *gpFile = NULL;
int height = WIN_HEIGHT;
int width = WIN_WIDTH;
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpszCmdLine, int iCmdShow)
{
	//function Declarations
	int initialize(void);
	void ToggleFullScreen();
	void Display();
	bool bDone = false;
	int iRet = 0;
	WNDCLASSEX wndclass;
	HWND hwnd;
	MSG msg;
	TCHAR szAppName[] = TEXT("My Application");
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
	//ToggleFullScreen();
	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("FullScreen DoubleBuffer"),
		WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE,
		100,
		100,
		height,
		width,
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
	case WM_KEYDOWN:
		switch (wParam)
		{
		case VK_ESCAPE:
			DestroyWindow(hwnd);
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
				width = mi.rcMonitor.right - mi.rcMonitor.left;
				height = mi.rcMonitor.bottom - mi.rcMonitor.top;
				SetWindowLong(ghHwnd, GWL_STYLE, dwStyle & ~WS_OVERLAPPEDWINDOW);
				SetWindowPos(ghHwnd,
					HWND_TOP,
					mi.rcMonitor.left,
					mi.rcMonitor.top,
					width,
					height,
					SWP_NOZORDER | SWP_FRAMECHANGED);
			}
		}
		ShowCursor(FALSE);
		bFullScreen = true;
	}
	
}
int initialize(void)
{
	void Resize(int, int);
	void ToggleFullScreen();
	PIXELFORMATDESCRIPTOR pfd;
	int iPixelFormatIndex;

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
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	Resize(height, width);
	ToggleFullScreen();
	return 0;
}
void Resize(int width, int height)
{
	//glViewport(0, 0, GLsizei(width), GLsizei(height));
	if (height == 0)
		height = 1;
	glViewport(0, 0, GLsizei(width), GLsizei(height));
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(45.0f,
		(GLfloat)width / (GLfloat)height,
		0.1f,
		100.0f);
}
void Display(void)
{
	glClear(GL_COLOR_BUFFER_BIT);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(0.0f, 0.0f, -3.0f);
	glScalef(0.8f, 0.9f, 0.0f);
	/*	glBegin(GL_LINES);
		glColor3f(1.0f, 0.0f, 0.0f);
		glVertex2f(-2.2f,0.0f);
		glVertex2f(2.2f, 0.0f);

		glVertex2f(-2.2f, 0.75f);
		glVertex2f(2.2f, 0.75f);

		glVertex2f(-2.2f, -0.75f);
		glVertex2f(2.2f, -0.75f);

		glVertex2f(0.0f, 1.25f);
		glVertex2f(0.0f, -1.25f);

		glVertex2f(-1.75f, 1.25f);
		glVertex2f(-1.75f, -1.25f);

		glVertex2f(1.75f, 1.25f);
		glVertex2f(1.75f, -1.25f);

		glEnd();*/
		//for Letter I

	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-1.75f, 0.75f);
	glVertex2f(-1.75f, 0.65f);
	glVertex2f(-1.25f, 0.65f);
	glVertex2f(-1.25f, 0.75f);


	glVertex2f(-1.35f, 0.65f);
	glVertex2f(-1.65f, 0.65f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-1.65f, -0.65f);
	glVertex2f(-1.35f, -0.65f);

	glVertex2f(-1.75f, -0.65f);
	glVertex2f(-1.75f, -0.75f);
	glVertex2f(-1.25f, -0.75f);
	glVertex2f(-1.25f, -0.65f);
	glEnd();
	//for Letter N
	glTranslatef(0.2f, 0.0f, 0.0f);

	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-1.10f, 0.75f);
	glVertex2f(-1.25f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-1.25f, -0.75f);
	glVertex2f(-1.10f, -0.75f);

	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-1.10f, 0.75f);
	glVertex2f(-1.25f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.95f, -0.75f);
	glVertex2f(-0.8f, -0.75f);

	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-0.80f, 0.75f);
	glVertex2f(-0.95f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.95f, -0.75f);
	glVertex2f(-0.80f, -0.75f);
	glEnd();


	//for Letter D

	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-0.0f, 0.75f);
	glVertex2f(-0.60f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.60f, -0.75f);
	glVertex2f(0.0f, -0.75f);

	glColor3f(0.0f, 0.0f, 0.0f);

	glVertex2f(-0.15f, 0.60f);
	glVertex2f(-0.35f, 0.60f);
	glVertex2f(-0.35f, -0.60f);
	glVertex2f(-0.15f, -0.60f);

	glVertex2f(-0.5f, 0.60f);
	glVertex2f(-0.60f, 0.60f);
	glVertex2f(-0.60f, -0.60f);
	glVertex2f(-0.5f, -0.60f);

	glEnd();

	//Letter A
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(1.25f, 0.75f);
	glVertex2f(1.1f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(0.9f, -0.75f);
	glVertex2f(1.55f, -0.75f);

	glEnd();
	glColor3f(0.0f, 0.0f, 0.0f);
	glBegin(GL_TRIANGLES);
	glVertex2f(1.18f, 0.5f);
	glVertex2f(1.05f, -0.75f);
	glVertex2f(1.40f, -0.75f);
	glEnd();


	//Letter I
	glTranslatef(1.95f, 0.0f, 0.0f);
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-1.75f, 0.75f);
	glVertex2f(-1.75f, 0.65f);
	glVertex2f(-1.25f, 0.65f);
	glVertex2f(-1.25f, 0.75f);


	glVertex2f(-1.35f, 0.65f);
	glVertex2f(-1.65f, 0.65f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-1.65f, -0.65f);
	glVertex2f(-1.35f, -0.65f);

	glVertex2f(-1.75f, -0.65f);
	glVertex2f(-1.75f, -0.75f);
	glVertex2f(-1.25f, -0.75f);
	glVertex2f(-1.25f, -0.65f);
	glEnd();
	glTranslatef(-0.625f,0.0f,-3.0f);
	glBegin(GL_QUADS);
	
	glColor3f(1.0f, 1.0f, 1.0f);//white
	glVertex2f(-0.057f, 0.0f);//tr
	glVertex2f(-0.203f, 0.0f);//tl
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.205f, -0.05f);//bl
	glVertex2f(-0.045f, -0.05f);//br


	glColor3f(1.0f, 1.0f, 1.0f);//white
	glVertex2f(-0.057f, 0.0f);//br
	glVertex2f(-0.2029f, 0.0f);//bl
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-0.195f, 0.05f);//tl
	glVertex2f(-0.065f, 0.05f);//tr
	glEnd();
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













