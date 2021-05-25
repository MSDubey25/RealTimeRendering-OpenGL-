#include<Windows.h>
#include<stdio.h>

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


using namespace DirectX;

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
IDXGISwapChain *msd_gpIDXGISwapChain = NULL;
ID3D11Device *msd_gpID3D11Device = NULL;
ID3D11DeviceContext *msd_gpID3D11DeviceContext = NULL;
ID3D11RenderTargetView *msd_gpID3D11RenderTargetView = NULL;

ID3D11VertexShader *gpID3D11VertexShader = NULL;
ID3D11PixelShader *gpID3D11PixelShader = NULL;
ID3D11Buffer *gpID3D11Buffer_vertexBuffer_position_cube = NULL;
ID3D11Buffer *gpID3D11Buffer_vertexBuffer_texture_cube = NULL;
ID3D11Buffer *gpID3D11Buffer_vertexBuffer_normal_cube = NULL;
ID3D11Buffer *gpID3D11Buffer_vertexBuffer_color_cube = NULL;

ID3D11InputLayout *gpID3D11InputLayout = NULL;
ID3D11Buffer *gpID3D11Buffer_ConstantBuffer = NULL;
ID3D11RasterizerState *gpID3D11RasterizerState = NULL;

ID3D11DepthStencilView *gpID3D11DepthStencilView = NULL;

ID3D11ShaderResourceView *gpID3D11ShaderResourceView_Texture_Cube = NULL;
ID3D11SamplerState *gpID3D11SamplerState_Texture_Cube = NULL;


struct CBUFFER
{
	XMMATRIX WorldMatrix;
	XMMATRIX viewMatrix;
	XMMATRIX projectionMatrix;
	XMVECTOR la;
	XMVECTOR ld;
	XMVECTOR ls;
	XMVECTOR ka;
	XMVECTOR kd;
	XMVECTOR ks;
	XMVECTOR lightPosition;
	float materialShininess;
	unsigned int keyPressed;
};

XMMATRIX gPerspectiveProjectionMatrix;
float gAngleTriangle = 0.0f;

bool gbIsLight = false;
float lightAmbient[] = { 0.0f,0.0f,0.0f,1.0 };
float lightDiffuse[] = { 1.0f,1.0f,1.0f,1.0f };
float lightSpecular[] = { 1.0f,1.0f,1.0f,1.0f };
float lightPosition[] = { 100.0f,100.0,-100.0,1.0 };

float materialAmbient[] = { 0.0f,0.0f,0.0f,1.0f };
float materialDiffuse[] = { 1.0f,1.0f,1.0f,1.0f };
float materialSpecular[] = { 1.0f,1.0f,1.0f,1.0f };
float materialShininess = 50.0f;
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


	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("D3D11 Interleaved"), WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE, 100, 100, WIN_WIDTH, WIN_HEIGHT, NULL, NULL, hInstance, NULL);

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
		case 'L':
		case 'l':
			if (gbIsLight == false)
				gbIsLight = true;
			else
				gbIsLight = false;
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

HRESULT initialize()
{
	HRESULT resize(int, int);
	void uninitialize();

	HRESULT hr;

	HRESULT LoadD3DTexture(const wchar_t *, ID3D11ShaderResourceView **);

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
			&msd_gpIDXGISwapChain,
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
		"cbuffer ConstantBuffer" \
		"{" \
		"float4x4 worldMatrix;" \
		"float4x4 viewMatrix;"\
		"float4x4 projectionMatrix;" \
		"float4 la;"\
		"float4 ld;" \
		"float4 ls;"\
		"float4 ka;"\
		"float4 kd;" \
		"float4 ks;"\
		"float4 lightPosition;" \
		"float material_shininess;"\
		"uint keypressed;" \
		"}" \
		"struct vertex_output" \
		"{" \
		"float4 position : SV_POSITION;" \
		"float3 lightDirection:NOMRAL0;"\
		"float3 tnorm:NORMAL1;"\
		"float3 viewVector:NORMAL2;"\
		"float4 color : COLOR;"\
		"float2 texcoord : TEXCOORD;"\
		"};" \
		"vertex_output main(float4 pos:POSITION, float4 normal :NORMAL,float2 texcoord:TEXCOORD, float4 color:COLOR)" \
		"{" \
		"vertex_output output;" \
		"if(keypressed==1)" \
		"{" \
		"	float4 eyeCoordinate=mul(worldMatrix,pos);" \
		"	eyeCoordinate=mul(viewMatrix,eyeCoordinate);"\
		"	output.tnorm=mul((float3x3)worldMatrix,(float3)normal);" \
		"	output.lightDirection=(float3)lightPosition-(float3)eyeCoordinate;" \
		"	output.viewVector=-eyeCoordinate.xyz;"\
		"}" \
		"else" \
		"{" \
		"color=float4(1.0,1.0,1.0,1.0);" \
		"}" \
		"float4 position=mul(worldMatrix,pos);" \
		"position=mul(viewMatrix,position);"\
		"position=mul(projectionMatrix,position);"\
		"output.position=position;"\
		"output.texcoord=texcoord;"\
		"output.color=color;"\
		"return output;" \
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
		"cbuffer ConstantBuffer" \
		"{" \
		"float4x4 worldMatrix;" \
		"float4x4 viewMatrix;"\
		"float4x4 projectionMatrix;" \
		"float4 la;"\
		"float4 ld;" \
		"float4 ls;"\
		"float4 ka;"\
		"float4 kd;" \
		"float4 ks;"\
		"float4 lightPosition;" \
		"float material_shininess;"\
		"uint keypressed;" \
		"}" \
		"float4 main(float4 pos:SV_POSITION, float3 lightDirection:NORMAL0, float3 tnorm:NORMAL1, float3 viewVector:NORMAL2,float4 color:COLOR,float2 texcoord:TEXCOORD): SV_TARGET" \
		"{" \
		"float4 col;" \
		"if(keypressed==1)"\
		"{"
		"float3 tdnorm=normalize(tnorm);"\
		"float3 light_direction=normalize(lightDirection);"\
		"float tn_dot_ld=max(dot(light_direction,tdnorm),0.0);"\
		"float3 reflectionVector=reflect(-light_direction,tdnorm);"\
		"float3 viewerVector=normalize(viewVector);"\
		"float4 ambient = la * ld; "\
		"float4 diffuse = ld * kd*tn_dot_ld; "\
		"float4 specular = ls * ks*pow(max(dot(reflectionVector, viewerVector), 0.0), material_shininess);" \
		"float4 phong_ads_light=ambient+diffuse+specular;"\
		"col=myTexture2D.Sample(mySamplerState,texcoord)*color*phong_ads_light;"
		"}"\
		"else"\
		"{"\
		"	col=color*myTexture2D.Sample(mySamplerState,texcoord);" \
		"}"\
		"return col; " \
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

	float VCNT[] =
	{
		-1.0f, 1.0f, 1.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f, 0.0f,0.0f, 0.0f,
		 1.0f, 1.0f, 1.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f, 0.0f,0.0f, 1.0f,
		-1.0f, 1.0f,-1.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f, 0.0f,1.0f, 0.0f,
		-1.0f, 1.0f,-1.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f, 0.0f,1.0f, 0.0f,
		 1.0f, 1.0f, 1.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f, 0.0f,0.0f, 1.0f,
		 1.0f, 1.0f,-1.0f,1.0f,0.0f,0.0f, 0.0f, 1.0f, 0.0f,1.0f, 1.0f,
		 1.0f,-1.0f,-1.0f,0.0f,0.0f,1.0f, 0.0f,-1.0f, 0.0f,0.0f ,0.0f,
		 1.0f,-1.0f, 1.0f,0.0f,0.0f,1.0f, 0.0f,-1.0f, 0.0f,0.0f, 1.0f,
		-1.0f,-1.0f,-1.0f,0.0f,0.0f,1.0f, 0.0f,-1.0f, 0.0f,1.0f, 0.0f,
		-1.0f,-1.0f,-1.0f,0.0f,0.0f,1.0f, 0.0f,-1.0f, 0.0f,1.0f, 0.0f,
		 1.0f,-1.0f, 1.0f,0.0f,0.0f,1.0f, 0.0f,-1.0f, 0.0f,0.0f, 1.0f,
		-1.0f,-1.0f, 1.0f,0.0f,0.0f,1.0f, 0.0f,-1.0f, 0.0f,1.0f, 1.0f,
		-1.0f, 1.0f,-1.0f,0.0f,1.0f,0.0f, 0.0f, 0.0f,-1.0f,0.0f ,0.0f,
		 1.0f, 1.0f,-1.0f,0.0f,1.0f,0.0f, 0.0f, 0.0f,-1.0f,0.0f, 1.0f,
		-1.0f,-1.0f,-1.0f,0.0f,1.0f,0.0f, 0.0f, 0.0f,-1.0f,1.0f, 0.0f,
		-1.0f,-1.0f,-1.0f,0.0f,1.0f,0.0f, 0.0f, 0.0f,-1.0f,1.0f, 0.0f,
		 1.0f, 1.0f,-1.0f,0.0f,1.0f,0.0f, 0.0f, 0.0f,-1.0f,0.0f, 1.0f,
		 1.0f,-1.0f,-1.0f,0.0f,1.0f,0.0f, 0.0f, 0.0f,-1.0f,1.0f, 1.0f,
		 1.0f,-1.0f, 1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f, 1.0f,0.0f ,0.0f,
		 1.0f, 1.0f, 1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f, 1.0f,0.0f, 1.0f,
		-1.0f,-1.0f, 1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f, 1.0f,1.0f, 0.0f,
		-1.0f,-1.0f, 1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f, 1.0f,1.0f, 0.0f,
		 1.0f, 1.0f, 1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f, 1.0f,0.0f, 1.0f,
		-1.0f, 1.0f, 1.0f,0.0f,1.0f,1.0f, 0.0f, 0.0f, 1.0f,1.0f, 1.0f,
		-1.0f, 1.0f, 1.0f,1.0f,0.0f,1.0f,-1.0f, 0.0f, 0.0f,0.0f ,0.0f,
		-1.0f, 1.0f,-1.0f,1.0f,0.0f,1.0f,-1.0f, 0.0f, 0.0f,0.0f, 1.0f,
		-1.0f,-1.0f, 1.0f,1.0f,0.0f,1.0f,-1.0f, 0.0f, 0.0f,1.0f, 0.0f,
		-1.0f,-1.0f, 1.0f,1.0f,0.0f,1.0f,-1.0f, 0.0f, 0.0f,1.0f, 0.0f,
		-1.0f, 1.0f,-1.0f,1.0f,0.0f,1.0f,-1.0f, 0.0f, 0.0f,0.0f, 1.0f,
		-1.0f,-1.0f,-1.0f,1.0f,0.0f,1.0f,-1.0f, 0.0f, 0.0f,1.0f, 1.0f,
		 1.0f,-1.0f,-1.0f,1.0f,1.0f,0.0f, 1.0f, 0.0f, 0.0f,0.0f ,0.0f,
		 1.0f, 1.0f,-1.0f,1.0f,1.0f,0.0f, 1.0f, 0.0f, 0.0f,0.0f, 1.0f,
		 1.0f,-1.0f, 1.0f,1.0f,1.0f,0.0f, 1.0f, 0.0f, 0.0f,1.0f, 0.0f,
		 1.0f,-1.0f, 1.0f,1.0f,1.0f,0.0f, 1.0f, 0.0f, 0.0f,1.0f, 0.0f,
		 1.0f, 1.0f,-1.0f,1.0f,1.0f,0.0f, 1.0f, 0.0f, 0.0f,0.0f, 1.0f,
		 1.0f, 1.0f, 1.0f,1.0f,1.0f,0.0f, 1.0f, 0.0f, 0.0f,1.0f, 1.0f


	};

	D3D11_BUFFER_DESC bufferDesc_Vertexbuffer_position_cube;
	ZeroMemory(&bufferDesc_Vertexbuffer_position_cube, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_Vertexbuffer_position_cube.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_Vertexbuffer_position_cube.ByteWidth = sizeof(float)*_ARRAYSIZE(VCNT);
	bufferDesc_Vertexbuffer_position_cube.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_Vertexbuffer_position_cube.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_Vertexbuffer_position_cube,
		NULL, &gpID3D11Buffer_vertexBuffer_position_cube);

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

	D3D11_MAPPED_SUBRESOURCE mappedSubresource_vertex_cube;

	ZeroMemory(&mappedSubresource_vertex_cube, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_position_cube, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_vertex_cube);
	memcpy(mappedSubresource_vertex_cube.pData, VCNT, sizeof(VCNT));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_position_cube, NULL);


	//
	D3D11_BUFFER_DESC bufferDesc_Vertexbuffer_color_cube;
	ZeroMemory(&bufferDesc_Vertexbuffer_color_cube, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_Vertexbuffer_color_cube.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_Vertexbuffer_color_cube.ByteWidth = sizeof(float)*_ARRAYSIZE(VCNT);
	bufferDesc_Vertexbuffer_color_cube.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_Vertexbuffer_color_cube.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_Vertexbuffer_color_cube,
		NULL, &gpID3D11Buffer_vertexBuffer_color_cube);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Failed For Vertex Buffer color.\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Succeeded For Vertex Buffer color.\n");
		fclose(msd_gpFile);
	}

	D3D11_MAPPED_SUBRESOURCE mappedSubresource_color_cube;

	ZeroMemory(&mappedSubresource_color_cube, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_color_cube, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_color_cube);
	memcpy(mappedSubresource_color_cube.pData, VCNT, sizeof(VCNT));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_color_cube, NULL);


	//

	D3D11_BUFFER_DESC bufferDesc_Vertexbuffer_normal_cube;
	ZeroMemory(&bufferDesc_Vertexbuffer_normal_cube, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_Vertexbuffer_normal_cube.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_Vertexbuffer_normal_cube.ByteWidth = sizeof(float)*_ARRAYSIZE(VCNT);
	bufferDesc_Vertexbuffer_normal_cube.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_Vertexbuffer_normal_cube.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_Vertexbuffer_normal_cube,
		NULL, &gpID3D11Buffer_vertexBuffer_normal_cube);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Failed For Vertex Buffer color.\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Succeeded For Vertex Buffer color.\n");
		fclose(msd_gpFile);
	}

	D3D11_MAPPED_SUBRESOURCE mappedSubresource_normal_cube;

	ZeroMemory(&mappedSubresource_normal_cube, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_normal_cube, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_normal_cube);
	memcpy(mappedSubresource_normal_cube.pData, VCNT, sizeof(VCNT));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_normal_cube, NULL);



	//


	D3D11_BUFFER_DESC bufferDesc_Vertexbuffer_texcoord_cube;


	ZeroMemory(&bufferDesc_Vertexbuffer_texcoord_cube, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_Vertexbuffer_texcoord_cube.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_Vertexbuffer_texcoord_cube.ByteWidth = sizeof(float)*ARRAYSIZE(VCNT);
	bufferDesc_Vertexbuffer_texcoord_cube.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_Vertexbuffer_texcoord_cube.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_Vertexbuffer_texcoord_cube, NULL, &gpID3D11Buffer_vertexBuffer_texture_cube);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Failed For Vertex Buffer texture.\n");
		fclose(msd_gpFile);

	}
	else
	{
		fopen_s(&msd_gpFile, gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Succeeded For Vertex Buffer texture.\n");
		fclose(msd_gpFile);
	}



	D3D11_MAPPED_SUBRESOURCE mappedSubresource_texture_cube;
	ZeroMemory(&mappedSubresource_texture_cube, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_texture_cube, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_texture_cube);
	memcpy(mappedSubresource_texture_cube.pData, VCNT, sizeof(VCNT));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_texture_cube, NULL);

	D3D11_INPUT_ELEMENT_DESC inputElementDesc[4];
	inputElementDesc[0].SemanticName = "POSITION";
	inputElementDesc[0].SemanticIndex = 0;
	inputElementDesc[0].Format = DXGI_FORMAT_R32G32B32_FLOAT;
	inputElementDesc[0].InputSlot = 0;
	inputElementDesc[0].AlignedByteOffset = 0;
	inputElementDesc[0].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[0].InstanceDataStepRate = 0;

	inputElementDesc[1].SemanticName = "COLOR";
	inputElementDesc[1].SemanticIndex = 0;
	inputElementDesc[1].Format = DXGI_FORMAT_R32G32B32_FLOAT;
	inputElementDesc[1].InputSlot = 1;
	inputElementDesc[1].AlignedByteOffset = 0;
	inputElementDesc[1].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[1].InstanceDataStepRate = 0;

	inputElementDesc[2].SemanticName = "NORMAL";
	inputElementDesc[2].SemanticIndex = 0;
	inputElementDesc[2].Format = DXGI_FORMAT_R32G32B32_FLOAT;
	inputElementDesc[2].InputSlot = 2;
	inputElementDesc[2].AlignedByteOffset = 0;
	inputElementDesc[2].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[2].InstanceDataStepRate = 0;

	inputElementDesc[3].SemanticName = "TEXCOORD";
	inputElementDesc[3].SemanticIndex = 0;
	inputElementDesc[3].Format = DXGI_FORMAT_R32G32_FLOAT;
	inputElementDesc[3].InputSlot = 3;
	inputElementDesc[3].AlignedByteOffset = D3D11_APPEND_ALIGNED_ELEMENT;
	inputElementDesc[3].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[3].InstanceDataStepRate = 0;

	hr = msd_gpID3D11Device->CreateInputLayout(inputElementDesc, 4,
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


	hr = LoadD3DTexture(L"marble.bmp", &gpID3D11ShaderResourceView_Texture_Cube);

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

	hr = msd_gpID3D11Device->CreateSamplerState(&samplerDesc, &gpID3D11SamplerState_Texture_Cube);
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

HRESULT LoadD3DTexture(const wchar_t *textureFileName, ID3D11ShaderResourceView **ppID3D11ShaderResourceView)
{
	HRESULT hr;

	hr = DirectX::CreateWICTextureFromFile(msd_gpID3D11Device, msd_gpID3D11DeviceContext, textureFileName, NULL, ppID3D11ShaderResourceView);
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



	msd_gpIDXGISwapChain->ResizeBuffers(1, width, height, DXGI_FORMAT_R8G8B8A8_UNORM, 0);
	ID3D11Texture2D *pID3D11Texture2D_BackBuffer;
	msd_gpIDXGISwapChain->GetBuffer(0, __uuidof(ID3D11Texture2D), (LPVOID*)&pID3D11Texture2D_BackBuffer);

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
	UINT stride = sizeof(float) * 11;
	UINT offset = sizeof(float) * 0;
	msd_gpID3D11DeviceContext->IASetVertexBuffers(0, 1, &gpID3D11Buffer_vertexBuffer_position_cube, &stride, &offset);
	offset = sizeof(float) * 3;
	msd_gpID3D11DeviceContext->IASetVertexBuffers(1, 1, &gpID3D11Buffer_vertexBuffer_color_cube, &stride, &offset);
	offset = sizeof(float) * 6;
	msd_gpID3D11DeviceContext->IASetVertexBuffers(2, 1, &gpID3D11Buffer_vertexBuffer_normal_cube, &stride, &offset);
	offset = sizeof(float) * 9;
	msd_gpID3D11DeviceContext->IASetVertexBuffers(3, 1, &gpID3D11Buffer_vertexBuffer_texture_cube, &stride, &offset);


	msd_gpID3D11DeviceContext->PSSetShaderResources(0, 1, &gpID3D11ShaderResourceView_Texture_Cube);
	msd_gpID3D11DeviceContext->PSSetSamplers(0, 1, &gpID3D11SamplerState_Texture_Cube);

	msd_gpID3D11DeviceContext->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);


	XMMATRIX worldMatrix = XMMatrixIdentity();
	XMMATRIX viewMatrix = XMMatrixIdentity();
	XMMATRIX translationMatrix = XMMatrixIdentity();
	XMMATRIX rotationMatrix = XMMatrixIdentity();
	translationMatrix = XMMatrixTranslation(0.0f, 0.0f, 6.0f);
	rotationMatrix = XMMatrixRotationX(-gAngleTriangle);
	rotationMatrix = rotationMatrix * XMMatrixRotationY(-gAngleTriangle);
	rotationMatrix = rotationMatrix * XMMatrixRotationZ(-gAngleTriangle);
	worldMatrix = rotationMatrix * translationMatrix * worldMatrix;
	XMMATRIX wMatrix = worldMatrix;
	XMMATRIX vMatrix = viewMatrix;
	CBUFFER constantBuffer;
	constantBuffer.WorldMatrix = wMatrix;
	constantBuffer.viewMatrix = vMatrix;
	constantBuffer.projectionMatrix = gPerspectiveProjectionMatrix;
	if (gbIsLight == true)
	{
		constantBuffer.keyPressed = 1;
		constantBuffer.la = XMVectorSet(lightAmbient[0], lightAmbient[1], lightAmbient[2], lightAmbient[3]);
		constantBuffer.ld = XMVectorSet(lightDiffuse[0], lightDiffuse[1], lightDiffuse[2], lightDiffuse[3]);
		constantBuffer.ls = XMVectorSet(lightSpecular[0], lightSpecular[1], lightSpecular[2], lightSpecular[3]);
		constantBuffer.ka = XMVectorSet(materialAmbient[0], materialAmbient[1], materialAmbient[2], materialAmbient[3]);
		constantBuffer.kd = XMVectorSet(materialDiffuse[0], materialDiffuse[1], materialDiffuse[2], materialDiffuse[3]);
		constantBuffer.ks = XMVectorSet(materialSpecular[0], materialSpecular[1], materialSpecular[2], materialSpecular[3]);
		constantBuffer.lightPosition = XMVectorSet(lightPosition[0], lightPosition[1], lightPosition[2], lightPosition[3]);
		constantBuffer.materialShininess = materialShininess;
	}
	else
	{
		constantBuffer.keyPressed = 0;
	}
	msd_gpID3D11DeviceContext->UpdateSubresource(gpID3D11Buffer_ConstantBuffer, 0, NULL, &constantBuffer, 0, 0);
	msd_gpID3D11DeviceContext->Draw(6, 0);
	msd_gpID3D11DeviceContext->Draw(6, 6);
	msd_gpID3D11DeviceContext->Draw(6, 12);
	msd_gpID3D11DeviceContext->Draw(6, 18);
	msd_gpID3D11DeviceContext->Draw(6, 24);
	msd_gpID3D11DeviceContext->Draw(6, 30);
	msd_gpID3D11DeviceContext->Draw(6, 30);

	msd_gpIDXGISwapChain->Present(0, 0);

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

	if (gpID3D11Buffer_vertexBuffer_texture_cube)
	{
		gpID3D11Buffer_vertexBuffer_texture_cube->Release();
		gpID3D11Buffer_vertexBuffer_texture_cube = NULL;
	}


	if (gpID3D11Buffer_vertexBuffer_normal_cube)
	{
		gpID3D11Buffer_vertexBuffer_normal_cube->Release();
		gpID3D11Buffer_vertexBuffer_normal_cube = NULL;
	}

	if (gpID3D11Buffer_vertexBuffer_color_cube)
	{
		gpID3D11Buffer_vertexBuffer_color_cube->Release();
		gpID3D11Buffer_vertexBuffer_color_cube = NULL;
	}

	if (gpID3D11Buffer_vertexBuffer_position_cube)
	{
		gpID3D11Buffer_vertexBuffer_position_cube->Release();
		gpID3D11Buffer_vertexBuffer_position_cube = NULL;
	}



	if (msd_gpID3D11RenderTargetView)
	{
		msd_gpID3D11RenderTargetView->Release();
		msd_gpID3D11RenderTargetView = NULL;
	}

	if (msd_gpIDXGISwapChain)
	{
		msd_gpIDXGISwapChain->Release();
		msd_gpIDXGISwapChain = NULL;
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


