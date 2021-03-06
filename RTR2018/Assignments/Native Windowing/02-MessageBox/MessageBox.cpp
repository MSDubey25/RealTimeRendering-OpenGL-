#include<Windows.h>

LRESULT CALLBACK WndProc(HWND,UINT,WPARAM,LPARAM);

int WINAPI WinMain(HINSTANCE hInstance,HINSTANCE hPrevInstance,LPSTR lpszCmdLine,int iCmdShow)
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

	hwnd = CreateWindow(szAppName,TEXT("MessageBox Window- Manikant"),
			WS_OVERLAPPEDWINDOW,
			CW_USEDEFAULT,
			CW_USEDEFAULT,
			CW_USEDEFAULT,
			CW_USEDEFAULT,
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
		MessageBox(hwnd,TEXT("Message WM_CREATE"),TEXT("Information"),MB_OK);
		break;
	case WM_KEYDOWN:
		switch (wParam)
		{
		case VK_ESCAPE:
			MessageBox(hwnd, TEXT("Message WM_ESCAPE - esc key is pressed"), TEXT("Information"), MB_OK);
			DestroyWindow(hwnd);
			break;
		case 0x46:
			MessageBox(hwnd, TEXT("Message WM_F - F key is pressed"), TEXT("Information"), MB_OK);
			break;
		}
		break;
	case WM_LBUTTONDOWN:
		MessageBox(hwnd, TEXT("Message WM_LBUTTONDOWN - mouse left click"), TEXT("Information"), MB_OK );
		break;
	case WM_RBUTTONDOWN:
		MessageBox(hwnd, TEXT("Message WM_RBUTTONDOWN - mouse Right click"), TEXT("Information"), MB_OK);
		break;
	case WM_DESTROY:
		MessageBox(hwnd, TEXT("Message WM_Destroy"), TEXT("Information"), MB_OK);
		PostQuitMessage(0);
		break;
	}
	return DefWindowProc(hwnd,iMsg,wParam,lParam);
}

















