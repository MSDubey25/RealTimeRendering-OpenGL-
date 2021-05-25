#include<Windows.h>

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

bool bFullScreen = false;
HWND ghwnd;
DWORD dwStyle;
WINDOWPLACEMENT wpPrev = { sizeof(WINDOWPLACEMENT) };
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
	ghwnd = hwnd;
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
	void ToggleFullScreen();
	switch (iMsg)
	{
	case WM_KEYDOWN:
		switch (wParam)
		{
		case VK_ESCAPE:
			if (bFullScreen == true)
			{
				ChangeDisplaySettings(NULL, 0);
			}
			DestroyWindow(hwnd);
			break;
		case 0x46:

			ToggleFullScreen();
			if (bFullScreen == true)
				MessageBox(hwnd, TEXT("Press F to exit fullscreen or press Escape"), TEXT("Message"), MB_OK);
			break;
		}
		break;
	case WM_DESTROY:
		PostQuitMessage(0);
		break;
	}
	return DefWindowProc(hwnd, iMsg, wParam, lParam);
}
void ToggleFullScreen()
{
	DEVMODE dm;
	DISPLAY_DEVICE dd;
	dd.cb = sizeof(DISPLAY_DEVICE);
	//dd.StateFlags = DISPLAY_DEVICE_PRIMARY_DEVICE;
	dm.dmSize = sizeof(DEVMODE);
	dm.dmDriverExtra = sizeof(DEVMODE);
	dm.dmFields = DM_DISPLAYFLAGS;
	MONITORINFO mi;
	if (bFullScreen == false)
	{
		dwStyle = GetWindowLong(ghwnd, GWL_STYLE);
		if (dwStyle & WS_OVERLAPPEDWINDOW)
		{
			mi = { sizeof(MONITORINFO) };
			if (GetWindowPlacement(ghwnd, &wpPrev) && GetMonitorInfo(MonitorFromWindow(ghwnd, MONITORINFOF_PRIMARY), &mi))
			{
				SetWindowLong(ghwnd, GWL_STYLE, dwStyle & ~WS_OVERLAPPEDWINDOW);

				if (EnumDisplayDevices(NULL, 0, &dd, 0))
				{
					//MessageBox(ghwnd, TEXT("enumdisplaydevices"), TEXT("Message"), MB_OK);
					if (EnumDisplaySettings(NULL, 0, &dm))
					{
						//MessageBox(ghwnd, TEXT("enumdisplaySettings"), TEXT("Message"), MB_OK);
						if (bFullScreen == false)
						{
							//MessageBox(ghwnd, TEXT("bfullscreen is false"), TEXT("Message"), MB_OK);

							ChangeDisplaySettings(&dm, 0);
							//ChangeDisplaySettings(&dm, CDS_FULLSCREEN);
							ShowCursor(FALSE);
							bFullScreen = true;
						}
					}

				}
			}
		}
		ShowCursor(FALSE);
		bFullScreen = true;
	}
	else
	{
		ChangeDisplaySettings(NULL, 0);
		ShowCursor(TRUE);
		SetWindowLong(ghwnd, GWL_STYLE, dwStyle | WS_OVERLAPPEDWINDOW);
		SetWindowPlacement(ghwnd, &wpPrev);
		SetWindowPos(ghwnd,
			HWND_TOP,
			0,
			0,
			0,
			0,
			SWP_NOZORDER | SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOOWNERZORDER);
		//ShowCursor(TRUE);
		bFullScreen = false;
	}
}
















