#include<Windows.h>
#include"Music.h"
#include<gl/GL.h>
#include<gl/GLU.h>
#include<stdio.h>
#define _USE_MATH_DEFINES 1
#include<math.h>
#define num 1000;

#pragma comment(lib,"opengl32.lib")
#pragma comment(lib,"glu32.lib")
#pragma comment(lib,"Winmm.lib")
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
HINSTANCE hInst = NULL;
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
	hInst = hInstance;
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
	//TCHAR str[255] = TEXT("F:\Mera Rang De Basanti Chola.wav");
	switch (iMsg)
	{
	case WM_CREATE:
		//sndPlaySound(str, SND_ASYNC);
		//hModule=
		PlaySound(MAKEINTRESOURCE(RangDe), hInst,SND_ASYNC|SND_FILENAME|SND_RESOURCE);
		break;
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
	void DrawPlane();
	static GLfloat counter1 = 0.0f;
	static GLfloat counter2 = 0.0f;
	static GLfloat counter3 = 0.0f;
	static GLfloat counter4 = 0.0f;
	static GLfloat counterP1 = 0.0f;
	static GLfloat xTranslate = 0.0f;
	static GLfloat timer = 0.0f;
	
	static bool flagI1=false;
	static bool flagA = false;
	static bool flagN = false;
	static bool flagI2 = false;
	static bool flagD = false;
	glClear(GL_COLOR_BUFFER_BIT);
	glMatrixMode(GL_MODELVIEW);
/*	glLoadIdentity();
	glTranslatef(0.0f, 0.0f, -4.0f);
		glBegin(GL_LINES);
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

		glVertex2f(-2.1f, 1.2f);
		glVertex2f(2.1f, 1.2f);
		glVertex2f(-2.1f, -1.2f);
		glVertex2f(2.1f, -1.2f);

		glVertex2f(-2.1f, -0.25f);
		glVertex2f(2.1f, -0.25f);
		glVertex2f(-2.1f, 0.25f);
		glVertex2f(2.1f, 0.25f);
		glEnd();
	*/	
	//for Letter I
	glLoadIdentity();
	glTranslatef(-2.0f+counter1,0.0f,-4.0f);
	//glScalef(0.8f, 0.9f, 0.0f);
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
	
	
	//Letter A 
	glLoadIdentity();
	glTranslatef(2.05f - counter2, 0.0f, -4.0f);
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
	//flag
	glLoadIdentity();
	if (xTranslate>2.09f)
	{
		glTranslatef(1.525f, 0.0f, -4.0f);
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

		glTranslatef(-0.13f, 0.0f, 0.0f);
		glColor3f(0.0f, 0.0f, 1.0f);
		glBegin(GL_LINE_LOOP);
		for (int i = 0; i < 1000; i++)
		{
			GLfloat angle = 2 * M_PI*i / num;
			glVertex3f(0.01f*cos(angle), 0.01f*sin(angle), 0.0f);
		}
		glEnd();
	}
	
	//Letter N
	glLoadIdentity();
	glTranslatef(0.2f, 6.5f-counter3, -4.0f);
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


	//Letter I
	glLoadIdentity();
	glTranslatef(2.15f, -2.5f+counter4, -4.0f);
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

	//for Letter D
	static GLfloat Cr=0.0f, Cg=0.0f, Cb=0.0f;
	static GLfloat Gr = 0.0f, Gg = 0.0f, Gb = 0.0f;
	glLoadIdentity();
	glTranslatef(0.2f, 0.0f, -4.0f);
	glBegin(GL_QUADS);
	glColor3f(Cr, Cg, Cb);//saffron
	glVertex2f(-0.0f, 0.75f);
	glVertex2f(-0.60f, 0.75f);
	glColor3f(Gr, Gg, Gb);//green
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
	
	//Center Plane
	glLoadIdentity();
	//glTranslatef(-4.5f+2.4f*counterP1 + 1.0f,0.0f,-4.0f);
	if (xTranslate < 1.25f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.0f, 0.0f, -4.0f);
	}
	else
	{
		glTranslatef(-4.5f + 2.4f*xTranslate + 1.0f, 0.0f, -4.0f);
	}
	if (xTranslate > 2.09f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.5f, 0.0f, 0.0f);
	}
	DrawPlane();	
	
	//top Plane
	glLoadIdentity();
	//glTranslatef(-4.5f +2.4f*counterP1+1.0f, -sin((counterP1*2.0f-2.0f)/2.0f)/0.5f+0.5f, -4.0f);
	if (xTranslate<=1.25f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.0f, -sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f + 0.5f, -4.0f);
	}
	else
	{
		glTranslatef(-4.5f + 2.4f*xTranslate + 1.0f, 0.0f, -4.0f);
	}
	if (xTranslate > 2.09f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.5f, -sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f + 0.5f, 0.0f);
	}
	DrawPlane();
	
	//bottom Plane
	glLoadIdentity();
	//glTranslatef(-4.5f +2.4f*counterP1 + 1.0f, sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f - 0.5f, -4.0f);
	if (xTranslate <=1.25f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.0f, sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f - 0.5f, -4.0f);
	}
	else
	{
		glTranslatef(-4.5f + 2.4f*xTranslate + 1.0f, 0.0f, -4.0f);
	}
	if(xTranslate>2.09f)
	{
		glTranslatef(-4.5f + 2.4f*counterP1 + 1.5f, sin((counterP1*2.0f - 2.0f) / 2.0f) / 0.5f - 0.5f, 0.0f);
	}
	DrawPlane();
	
/*
	static GLfloat x = 0.0f;
	static GLfloat y = 0.0f;
	static GLfloat anglePB = 270.0f;
	glLoadIdentity();
	glRotatef(anglePB, 0.0f, 0.0f, 1.0f);
	glTranslatef(-2.0f, -2.0f, 0.0f);
	//glRotatef(90.0f,0.0f,0.0f,1.0f);
	
	if (x < 1.0f)
		glTranslatef(x, 0.0f, 0.0f);
	else
	{
	//	glTranslatef(x, 0.0f, 0.0f);
	}
	//glRotatef(90.0f, 0.0f, 0.0f, 1.0f);
	DrawPlane();
	*/
	SwapBuffers(ghdc);
	if (counter1 <= 2.0f && flagI1 == false)
		counter1 = counter1 + 0.00025f;
	else
	{
		flagI1 = true;
	}
	if (counter2 <= 1.85f && flagI1 == true)
		counter2 = counter2 + 0.00025f;
	else
	{
		flagA = true;
	}
	if (counter3 <= 6.5f &&  flagA==true)
		counter3 = counter3 + 0.00025f;
	else
	{
		flagN = true;
	}
	if (counter4 <= 2.5f &&  flagN == true)
		counter4 = counter4 + 0.00025f;
	else
	{
		flagI2 = true;
	}
	if (counter4>=2.5f)
	{
		if(Cr<=1.0f)
			Cr = Cr + 0.00025f;
		if(Cg<=0.6f)
			Cg = Cg + 0.00025f;
		if(Cb<=0.2)
			Cb = Cb + 0.00025f;
		if (Gr <= 0.071f)
			Gr = Gr + 0.000025f;
		if (Gg <= 0.533f)
			Gg = Gg + 0.00025f;
		if (Gb <= 0.027)
			Gb = Gb + 0.000025f;
	}
	else
	{
		flagD = true;
	}
	if (counterP1 <= 2.9f &&   Cr > 0.99f && Gg > 0.472f)
	{
		if (xTranslate <= 1.25f)
		{
			counterP1 = counterP1 + 0.00007f;
			xTranslate += 0.00007f;
		}
		else if (xTranslate >= 1.25f && xTranslate<=2.09f)
		{
			xTranslate += 0.00007f;
		}
		else
		{
			//counterP1 = counterP1 + 0.0001f;
			timer += 0.00007f;
		}
		if (timer >= 1.92f)
		{
			counterP1 = counterP1 + 0.0001f;
			
		}
	}
		
//	if (counterP2 >= 0.0f &&  flagD == true && Cr > 0.99f && Gg>0.472f)
	//	counterP2 = counterP2 - 0.0001f;/**/
/*	if (anglePB < 360.0f && Cr > 0.99f && Gg > 0.472f)
		anglePB = anglePB + 0.009f;
	if (x < 1.0f && y < 1.0f && Cr>0.99f && Gg>0.472f)
		x = y = y + 0.001f;
	else
	{
		if (x < 3.0f && Gg>0.472f)
			x = x + 0.001f;
	}*/
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
void DrawPlane()
{
	glBegin(GL_POLYGON);
	//glColor3f(176.0f/255.0f, 224.0f / 255.0f, 230.0f / 255.0f);//powder blue
	glColor3f(70.0f / 255.0f, 130.0f / 255.0f, 180.0f / 255.0f);//steel blue
	glVertex2f(0.0f, 0.1f);
	glVertex2f(-0.05f, 0.05f);
	glVertex2f(-0.05f, -0.05f);
	glVertex2f(0.0f, -0.1f);
	glVertex2f(-0.05f, -0.2f);
	glVertex2f(0.0f, -0.25f);
	glVertex2f(0.2f, -0.1f);
	glVertex2f(0.4f, -0.05f);
	glVertex2f(0.45f, 0.0f);
	glVertex2f(0.4f, 0.05f);
	glVertex2f(0.2f, 0.1f);
	glVertex2f(0.0f, 0.25f);
	glVertex2f(-0.05f, 0.2f);

	glEnd();
	//Flag
	glBegin(GL_QUAD_STRIP);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.2f, -0.05f);
	glVertex2f(-0.05f, -0.05f);
	glColor3f(1.0f, 1.0f, 1.0f);//white
	glVertex2f(-0.2f, 0.0f);
	glVertex2f(-0.05f, 0.0f);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-0.2f, 0.05f);
	glVertex2f(-0.05f, 0.05f);
	glEnd();
	

	//Chakra
	glTranslatef(-0.13f, 0.0f, 0.0f);
	glColor3f(0.0f, 0.0f, 1.0f);
	glBegin(GL_LINE_LOOP);
	for (int i = 0; i < 1000; i++)
	{
		GLfloat angle = 2 * M_PI*i / num;
		glVertex3f(0.01f*cos(angle), 0.01f*sin(angle), 0.0f);
	}
	glEnd();
	//F
	glTranslatef(0.3f, 0.0f, 0.0f);
	glScalef(0.1f, 0.05f, 0.0f);
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(-0.0f, 0.75f);
	glVertex2f(-0.60f, 0.75f);
	glColor3f(0.071f, 0.533f, 0.027f);//green
	glVertex2f(-0.60f, -0.75f);
	glVertex2f(0.0f, -0.75f);

	glColor3f(70.0f / 255.0f, 130.0f / 255.0f, 180.0f / 255.0f);//steel blue

	glVertex2f(0.0f, 0.60f);
	glVertex2f(-0.45f, 0.60f);
	glVertex2f(-0.45f, 0.1f);
	glVertex2f(0.0f, 0.1f);

	glVertex2f(0.0f, -0.05f);
	glVertex2f(-0.45f, -0.05f);
	glVertex2f(-0.45f, -0.75f);
	glVertex2f(0.0f, -0.75f);

	glVertex2f(0.0f, 0.15f);
	glVertex2f(-0.2f, 0.15f);
	glVertex2f(-0.2f, -0.75f);
	glVertex2f(0.0f, -0.75f);

	glEnd();
	
	//I
	glTranslatef(-0.1f,0.0f,0.0f);
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
	//A
	glTranslatef(-2.0f,0.0f,0.0f);
	glBegin(GL_QUADS);
	glColor3f(1.0f, 0.6f, 0.2f);//saffron
	glVertex2f(1.2f, 0.75f);
	glVertex2f(1.05f, 0.75f);
	glColor3f(0.066f, 0.533f, 0.027f);//green
	glVertex2f(0.85f, -0.75f);
	glVertex2f(1.5f, -0.75f);
	glEnd();
	glColor3f(70.0f / 255.0f, 130.0f / 255.0f, 180.0f / 255.0f);
	glBegin(GL_TRIANGLES);
	glVertex2f(1.13f, 0.5f);
	glVertex2f(1.0f, -0.75f);
	glVertex2f(1.35f, -0.75f);
	glEnd();

	glBegin(GL_QUAD_STRIP);

	glEnd();
}
/*BOOL PlayResource(LPSTR lpName)
{
	BOOL bRtn;
	LPSTR lpRes;
	HANDLE hResInfo, hRes;

	// Find the WAVE resource. 

	hResInfo = FindResource(hInst, lpName, "WAVE");
	if (hResInfo == NULL)
		return FALSE;

	// Load the WAVE resource. 

	hRes = LoadResource(hInst, hResInfo);
	if (hRes == NULL)
		return FALSE;

	// Lock the WAVE resource and play it. 

	lpRes = LockResource(hRes);
	if (lpRes != NULL) {
		bRtn = sndPlaySound(lpRes, SND_MEMORY | SND_SYNC |
			SND_NODEFAULT);
		UnlockResource(hRes);
	}
	else
		bRtn = 0;

	// Free the WAVE resource and return success or failure. 

	FreeResource(hRes);
	return bRtn;
}*/











