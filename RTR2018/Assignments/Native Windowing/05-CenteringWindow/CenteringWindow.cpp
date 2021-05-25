#include<Windows.h>

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
void ClipOrCenterRectToMonitor(LPRECT, UINT);

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpszCmdLine, int iCmdShow)
{
	WNDCLASSEX wndclass;
	HWND hwnd;
	MSG msg;
	TCHAR szAppName[] = TEXT("My Application");
	wndclass.cbSize = sizeof(WNDCLASSEX);
	wndclass.style = CS_HREDRAW | CS_VREDRAW;
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

	hwnd = CreateWindow(szAppName, TEXT("FullScreen Window- Manikant"),
		WS_OVERLAPPEDWINDOW,
		100,
		100,
		600,
		400,
		NULL,
		NULL,
		hInstance,
		NULL);
	
	ShowWindow(hwnd, iCmdShow);
	UpdateWindow(hwnd);

	while (GetMessage(&msg, NULL, 0, 0))
	{
		TranslateMessage(&msg);
		DispatchMessage(&msg);
	}
	return ((int)msg.wParam);
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT iMsg, WPARAM wParam, LPARAM lParam)
{
	switch (iMsg)
	{
	
	case WM_CREATE:
		RECT prc;
		GetWindowRect(hwnd, &prc);
		ClipOrCenterRectToMonitor(&prc, iMsg);
		SetWindowPos(hwnd, NULL, prc.left, prc.top, 0, 0, SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE);
		break;
	case WM_DESTROY:
		PostQuitMessage(0);
		break;
	}
	return DefWindowProc(hwnd, iMsg, wParam, lParam);
}
void ClipOrCenterRectToMonitor(LPRECT prc, UINT flags)
{
	HMONITOR hMonitor;
	MONITORINFO mi;
	RECT        rc;
	int         w = prc->right - prc->left;
	int         h = prc->bottom - prc->top;

	//
	// get the nearest monitor to the passed rect.
	//
	hMonitor = MonitorFromRect(prc, MONITOR_DEFAULTTONEAREST);

	//
	// get the work area or entire monitor rect.
	//
	mi.cbSize = sizeof(mi);
	GetMonitorInfo(hMonitor, &mi);

		rc = mi.rcMonitor;

		prc->left = rc.left + (rc.right - rc.left - w) / 2;
		prc->top = rc.top + (rc.bottom - rc.top - h) / 2;
		prc->right = prc->left + w;
		prc->bottom = prc->top + h;

}
















