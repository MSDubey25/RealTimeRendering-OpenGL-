#include<Windows.h>
#include<stdio.h>
#include<vector>

#include<d3d11.h>
#include<d3dcompiler.h>
#include "WICTextureLoader.h"
#pragma warning(disable:4838)
#include"XNAMath/xnamath.h"
#pragma comment(lib,"d3d11.lib")
#pragma comment(lib,"D3dcompiler.lib")
#pragma comment(lib,"DirectXTK.lib")

#define WIN_WIDTH 800
#define WIN_HEIGHT 600

#define CHECKIMAGEHEIGHT 64
#define CHECKIMAGEWIDTH 64

using namespace DirectX;
using namespace std;

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

FILE * msd_gpFile = NULL;

char gszLogFileName[] = "Log.txt";


HWND gHwnd = NULL;

DWORD dwStyle;
WINDOWPLACEMENT wpPrev = { sizeof(WINDOWPLACEMENT) };

bool gbActiveWindow = false;
bool bIsFullScreen = false;
bool gbEscapeKeyIsPressed = false;

float gClearColor[4];
IDXGISwapChain *gpIDXGISwapChain = NULL;
ID3D11Device *msd_gpID3D11Device = NULL;
ID3D11DeviceContext *msd_gpID3D11DeviceContext = NULL;
ID3D11RenderTargetView *msd_gpID3D11RenderTargetView = NULL;

ID3D11VertexShader *gpID3D11VertexShader = NULL;
ID3D11PixelShader *gpID3D11PixelShader = NULL;
ID3D11Buffer *gpID3D11Buffer_vertexBuffer_position_checkerBoard = NULL;
ID3D11Buffer *gpID3D11Buffer_vertexBuffer_texture_checkerBoard = NULL;

ID3D11InputLayout *gpID3D11InputLayout = NULL;
ID3D11Buffer *gpID3D11Buffer_ConstantBuffer = NULL;
ID3D11RasterizerState *gpID3D11RasterizerState = NULL;

ID3D11DepthStencilView *gpID3D11DepthStencilView = NULL;

ID3D11ShaderResourceView *gpID3D11ShaderResourceView_Texture_checkerBoard = NULL;
ID3D11SamplerState *gpID3D11SamplerState_Texture_checkerBoard = NULL;

uint8_t checkImage[CHECKIMAGEWIDTH][CHECKIMAGEHEIGHT][4];

const wchar_t *checkerboardTextureFile;

void addLog(const char* logText)

{
	fopen_s(&msd_gpFile, gszLogFileName, "a+");
	fprintf_s(msd_gpFile, logText);
	fclose(msd_gpFile);
}

struct CBUFFER
{
	XMMATRIX WorldViewProjectionMatrx;
};

XMMATRIX gPerspectiveProjectionMatrix;
float gAngleTriangle = 0.0f;

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpszCmdLine, int iCmdShow)
{

	HRESULT initialize(void);

	void display();
	void uninitialize();
	void Update();
	MSG msg;
	HWND hwnd;
	TCHAR szAppName[] = TEXT("3D-Rotation");
	bool bDone = false;
	WNDCLASSEX wndclass;

	if (fopen_s(&msd_gpFile, gszLogFileName, "w") != 0)
	{
		MessageBox(NULL, TEXT("Log File cannot be created"), TEXT("Error"), MB_OK);
		exit(0);
	}
	else
	{
		fprintf_s(msd_gpFile, "Log File is successfully opened\n");
		fclose(msd_gpFile);
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


	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("Checker Board"), WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE, 100, 100, WIN_WIDTH, WIN_HEIGHT, NULL, NULL, hInstance, NULL);

	gHwnd = hwnd;

	ShowWindow(hwnd, iCmdShow);
	SetForegroundWindow(hwnd);
	SetFocus(hwnd);


	HRESULT hr;
	hr = initialize();

	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "initialize() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		DestroyWindow(hwnd);
		hwnd = NULL;
	}

	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "initialize() succeeded");
		fclose(msd_gpFile);
	}


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

			Update();
			display();

			if (gbActiveWindow == true)
			{
				if (gbEscapeKeyIsPressed == true)
					bDone = true;
			}

		}
	}

	uninitialize();

	return((int)msg.wParam);
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT iMsg, WPARAM wParam, LPARAM lParam)
{
	HRESULT resize(int, int);
	void ToggleFullScreen();
	void uninitialize();
	HRESULT hr;
	switch (iMsg)
	{


	case WM_ACTIVATE:
		if (HIWORD(wParam) == 0)
			gbActiveWindow = true;
		else
			gbActiveWindow = false;
		break;

	case WM_ERASEBKGND:
		return(0);
		break;



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
		if (msd_gpID3D11DeviceContext)
		{
			hr = resize(LOWORD(lParam), HIWORD(lParam));

			if (FAILED(hr))
			{
				fopen_s(&msd_gpFile, gszLogFileName, "a+");
				fprintf_s(msd_gpFile, "resize() Failed. Exitting Now..\n");
				fclose(msd_gpFile);
				return(hr);
			}
			else
			{
				fopen_s(&msd_gpFile, gszLogFileName, "a+");
				fprintf_s(msd_gpFile, "resize() Succeeded. Exitting Now..\n");
				fclose(msd_gpFile);
			}
		}
		break;

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

void makeCheckImage(const wchar_t **checkerboardTextureFile)
{
	int offset, c;

	*checkerboardTextureFile = L"Checkerboard.bmp";
	const char *checkerboardTextureFileName = "Checkerboard.bmp";

	FILE *hfCheckerboardBMPFile;
	unsigned char *checkImage = NULL;


	int filesize = 54 + (3 * CHECKIMAGEHEIGHT*CHECKIMAGEWIDTH);
	checkImage = (unsigned char*)malloc(3 * CHECKIMAGEHEIGHT * CHECKIMAGEWIDTH);
	memset(checkImage, 0, 3 * CHECKIMAGEHEIGHT*CHECKIMAGEWIDTH);
	
	for (int i = 0; i < CHECKIMAGEHEIGHT; i++)
	{
		for (int j = 0; j < CHECKIMAGEWIDTH; j++)
		{
			c = (((i & 0x8) == 0) ^ ((j & 0x8) == 0)) * 255;

			offset = (CHECKIMAGEHEIGHT - 1) - j;
			checkImage[(i + offset * CHECKIMAGEWIDTH) * 3 + 2] = (unsigned char)(c);
			checkImage[(i + offset * CHECKIMAGEWIDTH) * 3 + 1] = (unsigned char)(c);
			checkImage[(i + offset * CHECKIMAGEWIDTH) * 3 + 0] = (unsigned char)(c);
		}
	}

	unsigned char bmpfileheader[14];
	unsigned char bmpinfoheader[40];
	unsigned char bmppad[3] = { 0, 0, 0 };

	ZeroMemory(&bmpfileheader, sizeof(bmpfileheader));
	ZeroMemory(&bmpinfoheader, sizeof(bmpinfoheader));

	bmpfileheader[0] = 'B';
	bmpfileheader[1] = 'M';

	bmpfileheader[2] = (unsigned char)(filesize);
	bmpfileheader[3] = (unsigned char)(filesize >> 8);
	bmpfileheader[4] = (unsigned char)(filesize >> 16);
	bmpfileheader[5] = (unsigned char)(filesize >> 24);

	bmpfileheader[10] = 54;


	bmpinfoheader[0] = 40;

	bmpinfoheader[4] = (unsigned char)(CHECKIMAGEWIDTH);
	bmpinfoheader[5] = (unsigned char)(CHECKIMAGEWIDTH >> 8);
	bmpinfoheader[6] = (unsigned char)(CHECKIMAGEWIDTH >> 16);
	bmpinfoheader[7] = (unsigned char)(CHECKIMAGEWIDTH >> 24);
	bmpinfoheader[8] = (unsigned char)(CHECKIMAGEHEIGHT);
	bmpinfoheader[9] = (unsigned char)(CHECKIMAGEHEIGHT >> 8);
	bmpinfoheader[10] = (unsigned char)(CHECKIMAGEHEIGHT >> 16);
	bmpinfoheader[11] = (unsigned char)(CHECKIMAGEHEIGHT >> 24);

	bmpinfoheader[12] = 1;
	bmpinfoheader[14] = 24;

	fopen_s(&hfCheckerboardBMPFile, checkerboardTextureFileName, "wb");
	fwrite(bmpfileheader, 1, 14, hfCheckerboardBMPFile);
	fwrite(bmpinfoheader, 1, 40, hfCheckerboardBMPFile);
	for (int i = 0; i < CHECKIMAGEHEIGHT; i++)
	{
		fwrite(checkImage + (CHECKIMAGEWIDTH*(CHECKIMAGEHEIGHT - i - 1) * 3), 3, CHECKIMAGEWIDTH, hfCheckerboardBMPFile);
		fwrite(bmppad, 1, (4 - (CHECKIMAGEWIDTH * 3) % 4) % 4, hfCheckerboardBMPFile);
	}

	free(checkImage);
	fclose(hfCheckerboardBMPFile);

}

HRESULT initialize()
{
	HRESULT resize(int, int);
	void uninitialize();

	HRESULT hr;

	HRESULT LoadD3DTexture(ID3D11ShaderResourceView **);

	D3D_DRIVER_TYPE d3dDriverType;
	D3D_DRIVER_TYPE d3dDriverTypes[] =
	{
		D3D_DRIVER_TYPE_HARDWARE,D3D_DRIVER_TYPE_WARP,D3D_DRIVER_TYPE_REFERENCE,
	};

	D3D_FEATURE_LEVEL d3dFeatureLevel_required = D3D_FEATURE_LEVEL_11_0;
	D3D_FEATURE_LEVEL d3dFeatureLevel_acquired = D3D_FEATURE_LEVEL_10_0;

	UINT createDeviceFlags = 0;
	UINT numDriverTypes = 0;
	UINT numFeatureLevels = 1;

	numDriverTypes = sizeof(d3dDriverTypes) / sizeof(d3dDriverTypes[0]);

	DXGI_SWAP_CHAIN_DESC dxgiSwapChainDesc;
	ZeroMemory((void *)&dxgiSwapChainDesc, sizeof(DXGI_SWAP_CHAIN_DESC));
	dxgiSwapChainDesc.BufferCount = 1;
	dxgiSwapChainDesc.BufferDesc.Width = WIN_WIDTH;
	dxgiSwapChainDesc.BufferDesc.Height = WIN_HEIGHT;
	dxgiSwapChainDesc.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
	dxgiSwapChainDesc.BufferDesc.RefreshRate.Numerator = 60;
	dxgiSwapChainDesc.BufferDesc.RefreshRate.Denominator = 1;
	dxgiSwapChainDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
	dxgiSwapChainDesc.OutputWindow = gHwnd;
	dxgiSwapChainDesc.SampleDesc.Count = 1;
	dxgiSwapChainDesc.SampleDesc.Quality = 0;
	dxgiSwapChainDesc.Windowed = TRUE;

	for (UINT driverTypeIndex = 0; driverTypeIndex < numDriverTypes; driverTypeIndex++)
	{
		d3dDriverType = d3dDriverTypes[driverTypeIndex];
		hr = D3D11CreateDeviceAndSwapChain(
			NULL,
			d3dDriverType,
			NULL,
			createDeviceFlags,
			&d3dFeatureLevel_required,
			numFeatureLevels,
			D3D11_SDK_VERSION,
			&dxgiSwapChainDesc,
			&gpIDXGISwapChain,
			&msd_gpID3D11Device,
			&d3dFeatureLevel_acquired,
			&msd_gpID3D11DeviceContext
		);

		if (SUCCEEDED(hr))
			break;

	}
	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "Initialize() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		return(hr);
	}

	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "Initialize() Succeeded. Exitting Now..\n");
		//fclose(msd_gpFile);

		if (d3dDriverType == D3D_DRIVER_TYPE_HARDWARE)
		{
			fprintf_s(msd_gpFile, "Hardware Type\n.");
		}
		else if (d3dDriverType == D3D_DRIVER_TYPE_WARP)
		{
			fprintf_s(msd_gpFile, "Warp Type\n.");
		}
		else if (d3dDriverType == D3D_DRIVER_TYPE_REFERENCE)
		{
			fprintf_s(msd_gpFile, "Reference Type\n.");
		}
		else
		{
			fprintf_s(msd_gpFile, "Unknown Type\n.");
		}

		fprintf_s(msd_gpFile, "The Supported Highest Feature Level Is");
		if (d3dFeatureLevel_acquired == D3D_FEATURE_LEVEL_11_0)
		{
			fprintf_s(msd_gpFile, "11.0\n.");
		}

		else if (d3dFeatureLevel_acquired == D3D_FEATURE_LEVEL_10_1)
		{
			fprintf_s(msd_gpFile, "10.1\n.");
		}
		else if (d3dFeatureLevel_acquired == D3D_FEATURE_LEVEL_10_0)
		{
			fprintf_s(msd_gpFile, "10.0\n.");
		}
		else
		{
			fprintf_s(msd_gpFile, "Unknown\n.");

		}

		fclose(msd_gpFile);
	}


	const char *vertexShaderSourceCode =
		"cbuffer ConstantBuffer"\
		"{"\
		"float4x4 worldViewProjectionMatrix;"\
		"}"\
		"struct vertex_output"\
		"{"\
		"float4 position : SV_POSITION;"\
		"float2 texcoord : TEXCOORD;"\
		"};"\
		"vertex_output main(float4 pos:POSITION, float2 texcoord:TEXCOORD)"\
		"{"\
		"vertex_output output;"\
		"output.texcoord=texcoord;"\
		"output.position=mul(worldViewProjectionMatrix,pos);"\
		"return output;"\
		"}";

	ID3DBlob *pID3Blob_VertexShaderCode = NULL;
	ID3DBlob *pID3DBlob_Error = NULL;

	hr = D3DCompile(vertexShaderSourceCode,
		lstrlenA(vertexShaderSourceCode) + 1,
		"VS",
		NULL,
		D3D_COMPILE_STANDARD_FILE_INCLUDE,
		"main",
		"vs_5_0",
		0,
		0,
		&pID3Blob_VertexShaderCode,
		&pID3DBlob_Error);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error != NULL)
		{
			fopen_s(&msd_gpFile, gszLogFileName, "a+");
			fprintf_s(msd_gpFile, "D3DCompile() Failed For Vertex Shader :%s.\n", (char *)pID3DBlob_Error->GetBufferPointer());
			fclose(msd_gpFile);
		}
	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "D3DCompile() Succeeded For Vertex Shader .\n");
		fclose(msd_gpFile);
	}

	hr = msd_gpID3D11Device->CreateVertexShader(pID3Blob_VertexShaderCode->GetBufferPointer(),
		pID3Blob_VertexShaderCode->GetBufferSize(), NULL, &gpID3D11VertexShader);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error != NULL)
		{
			fopen_s(&msd_gpFile, gszLogFileName, "a+");
			fprintf_s(msd_gpFile, "ID3D11Device::CreateVertexShader() Failed For Vertex Shader .\n");
			fclose(msd_gpFile);
		}
	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateVertexShader() Succeeded For Vertex Shader .\n");
		fclose(msd_gpFile);
	}

	msd_gpID3D11DeviceContext->VSSetShader(gpID3D11VertexShader, 0, 0);

	const char *pixelShaderSourceCode =
		"Texture2D myTexture2D;"\
		"SamplerState mySamplerState;"\
		"float4 main(float4 pos:POSITION,float2 texcoord:TEXCOORD):SV_TARGET"\
		"{"\
		"float4 color=myTexture2D.Sample(mySamplerState,texcoord);"\
		"return color;"\
		"}";


	ID3DBlob *pID3Blob_PixelShaderCode = NULL;
	pID3DBlob_Error = NULL;

	hr = D3DCompile(pixelShaderSourceCode,
		lstrlenA(pixelShaderSourceCode) + 1,
		"PS",
		NULL,
		D3D_COMPILE_STANDARD_FILE_INCLUDE,
		"main",
		"ps_5_0",
		0,
		0,
		&pID3Blob_PixelShaderCode,
		&pID3DBlob_Error);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error != NULL)
		{
			fopen_s(&msd_gpFile, gszLogFileName, "a+");
			fprintf_s(msd_gpFile, "D3DCompile() Failed For Pixel Shader :%s.\n", (char *)pID3DBlob_Error->GetBufferPointer());
			fclose(msd_gpFile);
			pID3DBlob_Error->Release();
			pID3DBlob_Error = NULL;
			return(hr);
		}
	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "D3DCompile() Succeeded For Pixel Shader .\n");
		fclose(msd_gpFile);
	}

	hr = msd_gpID3D11Device->CreatePixelShader(pID3Blob_PixelShaderCode->GetBufferPointer(),
		pID3Blob_PixelShaderCode->GetBufferSize(), NULL, &gpID3D11PixelShader);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error != NULL)
		{
			fopen_s(&msd_gpFile, gszLogFileName, "a+");
			fprintf_s(msd_gpFile, "ID3D11Device::CreateVertexShader() Failed For Vertex Shader .\n");
			fclose(msd_gpFile);
		}
	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateVertexShader() Succeeded For Vertex Shader .\n");
		fclose(msd_gpFile);
	}

	msd_gpID3D11DeviceContext->PSSetShader(gpID3D11PixelShader, 0, 0);

	/*float vertices_square[] =
	{
		-1.0f,1.0f,0.0f,
		1.0f,1.0f,0.0f,
		-1.0f,-1.0f,0.0f,

		-1.0f,-1.0f,0.0f,
		1.0f,1.0f,0.0f,
		1.0f,-1.0f,0.0f



	};*/

	float texcoord_square[] =
	{
		0.0f,0.0f,
		0.0f,1.0f,
		1.0f,0.0f,

		1.0f,0.0f,
		0.0f,1.0f,
		1.0f,1.0f,


	};

	D3D11_BUFFER_DESC bufferDesc_Vertexbuffer_position_checkerBoard;
	ZeroMemory(&bufferDesc_Vertexbuffer_position_checkerBoard, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_Vertexbuffer_position_checkerBoard.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_Vertexbuffer_position_checkerBoard.ByteWidth = sizeof(float) * 18;
	bufferDesc_Vertexbuffer_position_checkerBoard.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_Vertexbuffer_position_checkerBoard.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_Vertexbuffer_position_checkerBoard,
		NULL, &gpID3D11Buffer_vertexBuffer_position_checkerBoard);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Failed For Vertex Buffer Position.\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Succeeded For Vertex Buffer Position.\n");
		fclose(msd_gpFile);
	}


	D3D11_BUFFER_DESC bufferDesc_Vertexbuffer_texcoord_checkerBoard;


	ZeroMemory(&bufferDesc_Vertexbuffer_texcoord_checkerBoard, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_Vertexbuffer_texcoord_checkerBoard.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_Vertexbuffer_texcoord_checkerBoard.ByteWidth = sizeof(float)*ARRAYSIZE(texcoord_square);
	bufferDesc_Vertexbuffer_texcoord_checkerBoard.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_Vertexbuffer_texcoord_checkerBoard.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_Vertexbuffer_texcoord_checkerBoard, NULL, &gpID3D11Buffer_vertexBuffer_texture_checkerBoard);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Failed For Vertex Buffer Color.\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Succeeded For Vertex Buffer Color.\n");
		fclose(msd_gpFile);
	}


	//====


	//==
/*	D3D11_MAPPED_SUBRESOURCE mappedSubresource_vertex_staticSmiley;

	ZeroMemory(&mappedSubresource_vertex_staticSmiley, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_position_checkerBoard, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_vertex_staticSmiley);
	memcpy(mappedSubresource_vertex_staticSmiley.pData, vertices_square, sizeof(vertices_square));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_position_checkerBoard, NULL);*/



	D3D11_MAPPED_SUBRESOURCE mappedSubresource_texture_chekerBoard;
	ZeroMemory(&mappedSubresource_texture_chekerBoard, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_texture_checkerBoard, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_texture_chekerBoard);
	memcpy(mappedSubresource_texture_chekerBoard.pData, texcoord_square, sizeof(texcoord_square));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_texture_checkerBoard, NULL);

	//===


	//==============================================================================================================



	//====================================================================================================================
	D3D11_INPUT_ELEMENT_DESC inputElementDesc[2];

	inputElementDesc[0].SemanticName = "POSITION";
	inputElementDesc[0].SemanticIndex = 0;
	inputElementDesc[0].Format = DXGI_FORMAT_R32G32B32_FLOAT;
	inputElementDesc[0].InputSlot = 0;
	inputElementDesc[0].AlignedByteOffset = 0;
	inputElementDesc[0].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[0].InstanceDataStepRate = 0;

	inputElementDesc[1].SemanticName = "TEXCOORD";
	inputElementDesc[1].SemanticIndex = 0;
	inputElementDesc[1].Format = DXGI_FORMAT_R32G32_FLOAT;
	inputElementDesc[1].InputSlot = 1;
	inputElementDesc[1].AlignedByteOffset = D3D11_APPEND_ALIGNED_ELEMENT;
	inputElementDesc[1].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[1].InstanceDataStepRate = 0;

	hr = msd_gpID3D11Device->CreateInputLayout(inputElementDesc, _ARRAYSIZE(inputElementDesc),
		pID3Blob_VertexShaderCode->GetBufferPointer(), pID3Blob_VertexShaderCode->GetBufferSize(), &gpID3D11InputLayout);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateInputLayout() Failed For Vertex Buffer .\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateInputLayout() Succeeded For Vertex Buffer .\n");
		fclose(msd_gpFile);
	}

	msd_gpID3D11DeviceContext->IASetInputLayout(gpID3D11InputLayout);
	pID3Blob_VertexShaderCode->Release();
	pID3Blob_VertexShaderCode = NULL;
	pID3Blob_PixelShaderCode->Release();
	pID3Blob_PixelShaderCode = NULL;

	D3D11_BUFFER_DESC bufferDesc_ConstantBuffer;
	ZeroMemory(&bufferDesc_ConstantBuffer, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_ConstantBuffer.Usage = D3D11_USAGE_DEFAULT;
	bufferDesc_ConstantBuffer.ByteWidth = sizeof(CBUFFER);
	bufferDesc_ConstantBuffer.BindFlags = D3D11_BIND_CONSTANT_BUFFER;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_ConstantBuffer, nullptr, &gpID3D11Buffer_ConstantBuffer);


	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Failed For Constant Buffer .\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Succeeded For Constant Buffer .\n");
		fclose(msd_gpFile);
	}


	msd_gpID3D11DeviceContext->VSSetConstantBuffers(0, 1, &gpID3D11Buffer_ConstantBuffer);

	D3D11_RASTERIZER_DESC rasterizerDesc;
	ZeroMemory((void *)&rasterizerDesc, sizeof(D3D11_RASTERIZER_DESC));
	rasterizerDesc.AntialiasedLineEnable = FALSE;
	rasterizerDesc.CullMode = D3D11_CULL_NONE;
	rasterizerDesc.DepthBias = 0;
	rasterizerDesc.DepthBiasClamp = 0.0f;
	rasterizerDesc.DepthClipEnable = TRUE;
	rasterizerDesc.FillMode = D3D11_FILL_SOLID;
	rasterizerDesc.FrontCounterClockwise = FALSE;
	rasterizerDesc.MultisampleEnable = FALSE;
	rasterizerDesc.ScissorEnable = FALSE;
	rasterizerDesc.SlopeScaledDepthBias = 0.0f;
	hr = msd_gpID3D11Device->CreateRasterizerState(&rasterizerDesc, &gpID3D11RasterizerState);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateRasterizerState() Failed For Culling.\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateRasterizerState() Succeeded For Culling .\n");
		fclose(msd_gpFile);
	}

	msd_gpID3D11DeviceContext->RSSetState(gpID3D11RasterizerState);


	hr = LoadD3DTexture(&gpID3D11ShaderResourceView_Texture_checkerBoard);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::LoadD3DTexture() Failed For Culling.\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::LoadD3DTexture() Succeeded For Culling .\n");
		fclose(msd_gpFile);
	}


	D3D11_SAMPLER_DESC samplerDesc;

	ZeroMemory(&samplerDesc, sizeof(D3D11_SAMPLER_DESC));
	samplerDesc.Filter = D3D11_FILTER_MIN_MAG_MIP_LINEAR;
	samplerDesc.AddressU = D3D11_TEXTURE_ADDRESS_WRAP;
	samplerDesc.AddressV = D3D11_TEXTURE_ADDRESS_WRAP;
	samplerDesc.AddressW = D3D11_TEXTURE_ADDRESS_WRAP;

	hr = msd_gpID3D11Device->CreateSamplerState(&samplerDesc, &gpID3D11SamplerState_Texture_checkerBoard);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateSamplerState() Failed For Culling.\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateSamplerState() Succeeded For Culling .\n");
		fclose(msd_gpFile);
	}




	gClearColor[0] = 0.0f;
	gClearColor[1] = 0.0f;
	gClearColor[2] = 0.0f;
	gClearColor[3] = 1.0f;


	gPerspectiveProjectionMatrix = XMMatrixIdentity();

	hr = resize(WIN_WIDTH, WIN_HEIGHT);
	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "resize() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "resize() Succeeded. Exitting Now..\n");
		fclose(msd_gpFile);
	}


	return(S_OK);

}


HRESULT LoadD3DTexture(ID3D11ShaderResourceView **ppID3D11ShaderResourceView)
{
	HRESULT hr;

	makeCheckImage(&checkerboardTextureFile);


	hr = DirectX::CreateWICTextureFromFile(msd_gpID3D11Device, msd_gpID3D11DeviceContext, checkerboardTextureFile, NULL, ppID3D11ShaderResourceView);
	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "CreateWICTextureFromFile() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "CreateWICTextureFromFile() Succeeded. Exitting Now..\n");
		fclose(msd_gpFile);
	}

	return(hr);

}

HRESULT resize(int width, int height)
{
	HRESULT hr;

	if (gpID3D11DepthStencilView)
	{
		gpID3D11DepthStencilView->Release();
		gpID3D11DepthStencilView = NULL;
	}

	if (msd_gpID3D11RenderTargetView)
	{
		msd_gpID3D11RenderTargetView->Release();
		msd_gpID3D11RenderTargetView = NULL;
	}



	gpIDXGISwapChain->ResizeBuffers(1, width, height, DXGI_FORMAT_R8G8B8A8_UNORM, 0);
	ID3D11Texture2D *pID3D11Texture2D_BackBuffer;
	gpIDXGISwapChain->GetBuffer(0, __uuidof(ID3D11Texture2D), (LPVOID*)&pID3D11Texture2D_BackBuffer);

	hr = msd_gpID3D11Device->CreateRenderTargetView(pID3D11Texture2D_BackBuffer, NULL, &msd_gpID3D11RenderTargetView);

	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3DDevice::CreateRenderTargetView() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3DDevice::CreateRenderTargetView() Succeeded. Exitting Now..\n");
		fclose(msd_gpFile);
	}

	pID3D11Texture2D_BackBuffer->Release();
	pID3D11Texture2D_BackBuffer = NULL;

	D3D11_TEXTURE2D_DESC textureDesc;
	ZeroMemory(&textureDesc, sizeof(D3D11_TEXTURE2D_DESC));
	textureDesc.Width = (UINT)width;
	textureDesc.Height = (UINT)height;
	textureDesc.ArraySize = 1;
	textureDesc.MipLevels = 1;
	textureDesc.SampleDesc.Count = 1;
	textureDesc.SampleDesc.Quality = 0;
	textureDesc.Format = DXGI_FORMAT_D32_FLOAT;
	textureDesc.Usage = D3D11_USAGE_DEFAULT;
	textureDesc.BindFlags = D3D11_BIND_DEPTH_STENCIL;
	textureDesc.CPUAccessFlags = 0;
	textureDesc.MiscFlags = 0;
	ID3D11Texture2D *pID3D11Texture2D_DepthBuffer;
	msd_gpID3D11Device->CreateTexture2D(&textureDesc, NULL, &pID3D11Texture2D_DepthBuffer);


	D3D11_DEPTH_STENCIL_VIEW_DESC depthStencilView;
	ZeroMemory(&depthStencilView, sizeof(D3D11_DEPTH_STENCIL_VIEW_DESC));
	depthStencilView.Format = DXGI_FORMAT_D32_FLOAT;
	depthStencilView.ViewDimension = D3D11_DSV_DIMENSION_TEXTURE2DMS;
	hr = msd_gpID3D11Device->CreateDepthStencilView(pID3D11Texture2D_DepthBuffer, &depthStencilView, &gpID3D11DepthStencilView);


	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3DDevice::CreateDepthStencilView() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3DDevice::CreateDepthStencilView() Succeeded. Exitting Now..\n");
		fclose(msd_gpFile);
	}

	pID3D11Texture2D_DepthBuffer->Release();
	pID3D11Texture2D_DepthBuffer = NULL;

	msd_gpID3D11DeviceContext->OMSetRenderTargets(1, &msd_gpID3D11RenderTargetView, gpID3D11DepthStencilView);

	D3D11_VIEWPORT d3dViewPort;
	d3dViewPort.TopLeftX = 0.0f;
	d3dViewPort.TopLeftY = 0.0f;
	d3dViewPort.Width = (float)width;
	d3dViewPort.Height = (float)height;
	d3dViewPort.MinDepth = 0.0f;
	d3dViewPort.MaxDepth = 1.0f;
	msd_gpID3D11DeviceContext->RSSetViewports(1, &d3dViewPort);



	gPerspectiveProjectionMatrix = XMMatrixPerspectiveFovLH(XMConvertToRadians(45.0f), (float)width / (float)height, 0.1f, 100.0f);

	return(hr);


}

void display()
{
	msd_gpID3D11DeviceContext->ClearRenderTargetView(msd_gpID3D11RenderTargetView, gClearColor);
	msd_gpID3D11DeviceContext->ClearDepthStencilView(gpID3D11DepthStencilView, D3D11_CLEAR_DEPTH, 1.0f, 0);
	XMMATRIX worldMatrix = XMMatrixIdentity();
	XMMATRIX viewMatrix = XMMatrixIdentity();
	XMMATRIX translationMatrix = XMMatrixIdentity();
	XMMATRIX rotationMatrix = XMMatrixIdentity();
	XMMATRIX wvpMatrix;
	CBUFFER constantBuffer;

	float vertices_square[] =
	{
		-2.0f,  1.0f, 0.0f,
		0.0f, 1.0f, 0.0f,
		-2.0f, -1.0f, 0.0f,

		-2.0f, -1.0f, 0.0f,
		0.0f, 1.0f, 0.0f,
		0.0f, -1.0f, 0.0f,
	};


	UINT stride = sizeof(float) * 3;
	UINT offset = 0;


	D3D11_MAPPED_SUBRESOURCE mappedSubresource_vertex_checkerBoard;

	ZeroMemory(&mappedSubresource_vertex_checkerBoard, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_position_checkerBoard, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_vertex_checkerBoard);
	memcpy(mappedSubresource_vertex_checkerBoard.pData, vertices_square, sizeof(vertices_square));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_position_checkerBoard, NULL);

	msd_gpID3D11DeviceContext->IASetVertexBuffers(0, 1, &gpID3D11Buffer_vertexBuffer_position_checkerBoard, &stride, &offset);

	stride = sizeof(float) * 2;
	offset = 0;
	msd_gpID3D11DeviceContext->IASetVertexBuffers(1, 1, &gpID3D11Buffer_vertexBuffer_texture_checkerBoard, &stride, &offset);

	msd_gpID3D11DeviceContext->PSSetShaderResources(0, 1, &gpID3D11ShaderResourceView_Texture_checkerBoard);
	msd_gpID3D11DeviceContext->PSSetSamplers(0, 1, &gpID3D11SamplerState_Texture_checkerBoard);



	msd_gpID3D11DeviceContext->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);


	translationMatrix = XMMatrixTranslation(0.0f, 0.0f, 6.0f);
	worldMatrix = rotationMatrix * translationMatrix * worldMatrix;
	wvpMatrix = worldMatrix * viewMatrix*gPerspectiveProjectionMatrix;


	constantBuffer.WorldViewProjectionMatrx = wvpMatrix;
	msd_gpID3D11DeviceContext->UpdateSubresource(gpID3D11Buffer_ConstantBuffer, 0,
		NULL, &constantBuffer, 0, 0);
	msd_gpID3D11DeviceContext->Draw(6, 0);

	//====2nd Checker Board


	 worldMatrix = XMMatrixIdentity();
	 viewMatrix = XMMatrixIdentity();
	 rotationMatrix = XMMatrixIdentity();
	 wvpMatrix =XMMatrixIdentity();

	float vertices_square2[] =
	{
		1.0f, 1.0f,	0.0f,
		2.41421f, 1.0f,	1.41421f,
		1.0f, -1.0f, 0.0f,

		1.0f, -1.0f, 0.0f,
		2.41421f, 1.0f, 1.41421f,
		2.41421f, -1.0f, 1.41421f,
	};

	UINT stride1 = sizeof(float) * 3;
	UINT offset1 = 0;



	ZeroMemory(&mappedSubresource_vertex_checkerBoard, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_position_checkerBoard, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_vertex_checkerBoard);
	memcpy(mappedSubresource_vertex_checkerBoard.pData, vertices_square2, sizeof(vertices_square2));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_position_checkerBoard, NULL);

	msd_gpID3D11DeviceContext->IASetVertexBuffers(0, 1, &gpID3D11Buffer_vertexBuffer_position_checkerBoard, &stride1, &offset1);

	stride1 = sizeof(float) * 2;
	offset1 = 0;


	msd_gpID3D11DeviceContext->IASetVertexBuffers(1, 1, &gpID3D11Buffer_vertexBuffer_texture_checkerBoard, &stride1, &offset1);

	msd_gpID3D11DeviceContext->PSSetShaderResources(0, 1, &gpID3D11ShaderResourceView_Texture_checkerBoard);
	msd_gpID3D11DeviceContext->PSSetSamplers(0, 1, &gpID3D11SamplerState_Texture_checkerBoard);



	msd_gpID3D11DeviceContext->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);


	translationMatrix = XMMatrixTranslation(0.0f, 0.0f, 6.0f);
	worldMatrix = rotationMatrix * translationMatrix * worldMatrix;
	wvpMatrix = worldMatrix * viewMatrix*gPerspectiveProjectionMatrix;


	constantBuffer.WorldViewProjectionMatrx = wvpMatrix;
	msd_gpID3D11DeviceContext->UpdateSubresource(gpID3D11Buffer_ConstantBuffer, 0,
		NULL, &constantBuffer, 0, 0);
	msd_gpID3D11DeviceContext->Draw(6, 0);

	//====


	gpIDXGISwapChain->Present(0, 0);

}

void Update()
{
	gAngleTriangle = gAngleTriangle + 0.001f;

	if (gAngleTriangle > 360.0f)
	{
		gAngleTriangle = 0.0f;
	}
}

void uninitialize()
{

	if (gpID3D11Buffer_ConstantBuffer)
	{
		gpID3D11Buffer_ConstantBuffer->Release();
		gpID3D11Buffer_ConstantBuffer = NULL;
	}

	if (gpID3D11RasterizerState)
	{
		gpID3D11RasterizerState->Release();
		gpID3D11RasterizerState = NULL;
	}

	if (gpID3D11InputLayout)
	{
		gpID3D11InputLayout->Release();
		gpID3D11InputLayout = NULL;
	}

	if (gpID3D11Buffer_vertexBuffer_texture_checkerBoard)
	{
		gpID3D11Buffer_vertexBuffer_texture_checkerBoard->Release();
		gpID3D11Buffer_vertexBuffer_texture_checkerBoard = NULL;
	}

	if (gpID3D11Buffer_vertexBuffer_position_checkerBoard)
	{
		gpID3D11Buffer_vertexBuffer_position_checkerBoard->Release();
		gpID3D11Buffer_vertexBuffer_position_checkerBoard = NULL;
	}



	if (msd_gpID3D11RenderTargetView)
	{
		msd_gpID3D11RenderTargetView->Release();
		msd_gpID3D11RenderTargetView = NULL;
	}

	if (gpIDXGISwapChain)
	{
		gpIDXGISwapChain->Release();
		gpIDXGISwapChain = NULL;
	}

	if (msd_gpID3D11DeviceContext)
	{
		msd_gpID3D11DeviceContext->Release();
		msd_gpID3D11DeviceContext = NULL;
	}
	if (msd_gpID3D11Device)
	{
		msd_gpID3D11Device->Release();
		msd_gpID3D11Device = NULL;
	}
	if (msd_gpFile)
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "uninitialize() Succeeded");
		fprintf_s(msd_gpFile, "Log File closed successfully");
		fclose(msd_gpFile);
		msd_gpFile = NULL;
	}

}


