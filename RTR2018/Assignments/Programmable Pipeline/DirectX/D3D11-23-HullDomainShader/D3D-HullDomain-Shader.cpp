#include<Windows.h>
#include<stdio.h>
#include<d3d11.h>
#include<d3dcompiler.h>
#pragma warning(disable:4838)
#include "XNAMath\xnamath.h"
#pragma comment(lib,"d3d11.lib")
#pragma comment(lib,"D3dcompiler.lib")

#define WIN_WIDTH 800
#define WIN_HEIGHT 600

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
FILE * msd_gpFile = NULL;
char msd_gszLogFileName[] = "Log.txt";
HWND msd_gHwnd = NULL;

DWORD dwStyle;
WINDOWPLACEMENT wpPrev = { sizeof(WINDOWPLACEMENT) };

bool msd_gbActiveWindow = false;
bool msd_bIsFullScreen = false;
bool msd_gbEscapeKeyIsPressed = false;

float msd_gClearColor[4];
IDXGISwapChain *msd_gpIDXGISwapChain = NULL;
ID3D11Device *msd_gpID3D11Device = NULL;
ID3D11DeviceContext *msd_gpID3D11DeviceContext = NULL;
ID3D11RenderTargetView *msd_gpID3D11RenderTargetView = NULL;

ID3D11VertexShader *gpID3D11VertexShader = NULL;
ID3D11PixelShader *gpID3D11PixelShader = NULL;
ID3D11HullShader *gpID3D11HullShader = NULL;
ID3D11DomainShader *gpID3D11DomainShader = NULL;
ID3D11Buffer *gpID3D11Buffer_VertexBuffer_Pyramid = NULL;
ID3D11Buffer *gpID3D11Buffer_ColorBuffer_Pyramid = NULL;
ID3D11InputLayout *gpID3D11InputLayout = NULL;
ID3D11Buffer *gpID3D11Buffer_ConstantBuffer_HullShader = NULL;
ID3D11Buffer *gpID3D11Buffer_ConstantBuffer_DomainShader = NULL;
ID3D11Buffer *gpID3D11Buffer_ConstantBuffer_PixelShader = NULL;

ID3D11RasterizerState *gpID3D11RasterizerState = NULL;
ID3D11DepthStencilView *gpID3D11DepthStencilView = NULL;
float msd_angle = 0.0f;

struct CBUFFER_HULL_SHADER
{
	XMVECTOR Hull_Constant_Function_Params;
};

struct CBUFFER_DOMAIN_SHADER
{
	XMMATRIX WorldViewProjectionMatrix;
};

struct CBUFFER_PIXEL_SHADER
{
	XMVECTOR LineColor;
};
unsigned int guiNumberOfLineSegments = 1;
XMMATRIX gPerspectiveProjectionMatrix;
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpszCmdLine, int iCmdShow)
{

	HRESULT initialize(void);

	void display();
	void uninitialize();

	MSG msg;
	HWND hwnd;
	TCHAR szAppName[] = TEXT("Direct3D11");
	bool bDone = false;
	WNDCLASSEX wndclass;

	if (fopen_s(&msd_gpFile, msd_gszLogFileName, "w") != 0)
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


	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("Direct3D11 HullDomain Shader"), WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE, 100, 100, WIN_WIDTH, WIN_HEIGHT, NULL, NULL, hInstance, NULL);

	msd_gHwnd = hwnd;

	ShowWindow(hwnd, iCmdShow);
	SetForegroundWindow(hwnd);
	SetFocus(hwnd);


	HRESULT hr;
	hr = initialize();

	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "initialize() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		DestroyWindow(hwnd);
		hwnd = NULL;
	}

	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "initialize() succeeded\n");
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
			display();
			if (msd_gbActiveWindow == true)
			{
				if (msd_gbEscapeKeyIsPressed == true)
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
			msd_gbActiveWindow = true;
		else
			msd_gbActiveWindow = false;
		break;

	case WM_ERASEBKGND:
		return(0);
		break;
	case WM_KEYDOWN:
		switch (wParam)
		{
		case 0x46:
			if (msd_bIsFullScreen == false)
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
		case VK_UP:
			guiNumberOfLineSegments++;
			if (guiNumberOfLineSegments >= 50)
				guiNumberOfLineSegments = 50;
			break;
		case VK_DOWN:
			guiNumberOfLineSegments--;
			if (guiNumberOfLineSegments <= 0)
				guiNumberOfLineSegments = 1;
			break;
		}
		break;
	case WM_SETFOCUS:
		msd_gbActiveWindow = true;
		break;
	case WM_KILLFOCUS:
		msd_gbActiveWindow = false;
		break;
	case WM_SIZE:
		if (msd_gpID3D11DeviceContext)
		{
			hr = resize(LOWORD(lParam), HIWORD(lParam));

			if (FAILED(hr))
			{
				fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
				fprintf_s(msd_gpFile, "resize() Failed. Exitting Now..\n");
				fclose(msd_gpFile);
				return(hr);
			}
			else
			{
				fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
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
	if (msd_bIsFullScreen == false)
	{
		dwStyle = GetWindowLong(msd_gHwnd, GWL_STYLE);
		if (dwStyle & WS_OVERLAPPEDWINDOW)
		{
			mi = { sizeof(MONITORINFO) };

			if (GetWindowPlacement(msd_gHwnd, &wpPrev) && GetMonitorInfo(MonitorFromWindow(msd_gHwnd, MONITORINFOF_PRIMARY), &mi))
			{
				SetWindowLong(msd_gHwnd, GWL_STYLE, dwStyle & ~WS_OVERLAPPEDWINDOW);
				SetWindowPos(msd_gHwnd, HWND_TOP,
					mi.rcMonitor.left,
					mi.rcMonitor.top,
					mi.rcMonitor.right - mi.rcMonitor.left,
					mi.rcMonitor.bottom - mi.rcMonitor.top,
					SWP_NOZORDER | SWP_FRAMECHANGED);
			}
		}
		ShowCursor(false);
		msd_bIsFullScreen = true;
	}

	else
	{
		SetWindowLong(msd_gHwnd, GWL_STYLE, dwStyle | WS_OVERLAPPEDWINDOW);
		SetWindowPlacement(msd_gHwnd, &wpPrev);
		SetWindowPos(msd_gHwnd,
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
		msd_bIsFullScreen = false;
	}
}

HRESULT initialize()
{
	HRESULT resize(int, int);
	void uninitialize();

	HRESULT hr;

	D3D_DRIVER_TYPE msd_d3dDriverType;
	D3D_DRIVER_TYPE msd_d3dDriverTypes[] =
	{
		D3D_DRIVER_TYPE_HARDWARE,D3D_DRIVER_TYPE_WARP,D3D_DRIVER_TYPE_REFERENCE,
	};

	D3D_FEATURE_LEVEL msd_d3dFeatureLevel_required = D3D_FEATURE_LEVEL_11_0;
	D3D_FEATURE_LEVEL msd_d3dFeatureLevel_acquired = D3D_FEATURE_LEVEL_10_0;

	UINT createDeviceFlags = 0;
	UINT numDriverTypes = 0;
	UINT numFeatureLevels = 1;

	numDriverTypes = sizeof(msd_d3dDriverTypes) / sizeof(msd_d3dDriverTypes[0]);

	DXGI_SWAP_CHAIN_DESC dxgiSwapChainDesc;
	ZeroMemory((void *)&dxgiSwapChainDesc, sizeof(DXGI_SWAP_CHAIN_DESC));
	dxgiSwapChainDesc.BufferCount = 1;
	dxgiSwapChainDesc.BufferDesc.Width = WIN_WIDTH;
	dxgiSwapChainDesc.BufferDesc.Height = WIN_HEIGHT;
	dxgiSwapChainDesc.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
	dxgiSwapChainDesc.BufferDesc.RefreshRate.Numerator = 60;
	dxgiSwapChainDesc.BufferDesc.RefreshRate.Denominator = 1;
	dxgiSwapChainDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
	dxgiSwapChainDesc.OutputWindow = msd_gHwnd;
	dxgiSwapChainDesc.SampleDesc.Count = 1;
	dxgiSwapChainDesc.SampleDesc.Quality = 0;
	dxgiSwapChainDesc.Windowed = TRUE;

	for (UINT driverTypeIndex = 0; driverTypeIndex < numDriverTypes; driverTypeIndex++)
	{
		msd_d3dDriverType = msd_d3dDriverTypes[driverTypeIndex];
		hr = D3D11CreateDeviceAndSwapChain(
			NULL,
			msd_d3dDriverType,
			NULL,
			createDeviceFlags,
			&msd_d3dFeatureLevel_required,
			numFeatureLevels,
			D3D11_SDK_VERSION,
			&dxgiSwapChainDesc,
			&msd_gpIDXGISwapChain,
			&msd_gpID3D11Device,
			&msd_d3dFeatureLevel_acquired,
			&msd_gpID3D11DeviceContext
		);
		if (SUCCEEDED(hr))
			break;

	}
	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "INitialize() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		return(hr);
	}

	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "Initialize() Succeeded. Exitting Now..\n");
		//fclose(gpFile_alk);

		if (msd_d3dDriverType == D3D_DRIVER_TYPE_HARDWARE)
		{
			fprintf_s(msd_gpFile, "Hardware Type\n.");
		}
		else if (msd_d3dDriverType == D3D_DRIVER_TYPE_WARP)
		{
			fprintf_s(msd_gpFile, "Warp Type\n.");
		}
		else if (msd_d3dDriverType == D3D_DRIVER_TYPE_REFERENCE)
		{
			fprintf_s(msd_gpFile, "Reference Type\n.");
		}
		else
		{
			fprintf_s(msd_gpFile, "Unknown Type\n.");
		}

		fprintf_s(msd_gpFile, "The Supported Highest Feature Level Is");
		if (msd_d3dFeatureLevel_acquired == D3D_FEATURE_LEVEL_11_0)
		{
			fprintf_s(msd_gpFile, "11.0\n.");
		}

		else if (msd_d3dFeatureLevel_acquired == D3D_FEATURE_LEVEL_10_1)
		{
			fprintf_s(msd_gpFile, "10.1\n.");
		}
		else if (msd_d3dFeatureLevel_acquired == D3D_FEATURE_LEVEL_10_0)
		{
			fprintf_s(msd_gpFile, "10.0\n.");
		}
		else
		{
			fprintf_s(msd_gpFile, "Unknown\n.");

		}

		fclose(msd_gpFile);
	}
	//Initialize Shaders
	const char *vertexShaderSourceCode =
		"struct vertex_output" \
		"{" \
		"	float4 position : POSITION;" \
		"};" \
		"vertex_output main(float2 pos:POSITION)" \
		"{" \
		"vertex_output output;" \
		"output.position=float4(pos,0.0f,1.0f);" \
		"return output;" \
		"}";

	ID3DBlob *pID3DBlob_VertexShaderCode = NULL;
	ID3DBlob *pID3DBlob_Error = NULL;

	hr = D3DCompile(vertexShaderSourceCode,lstrlenA(vertexShaderSourceCode)+1,
		"VS",
		NULL,
		D3D_COMPILE_STANDARD_FILE_INCLUDE,
		"main",
		"vs_5_0",
		0,
		0,
		&pID3DBlob_VertexShaderCode,
		&pID3DBlob_Error);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error!=NULL)
		{
			fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
			fprintf_s(msd_gpFile, "D3DCompile() Failed for Vertex Shader :%s.\n",(char *)pID3DBlob_Error->GetBufferPointer());
			fclose(msd_gpFile);
			pID3DBlob_Error->Release();
			pID3DBlob_Error = NULL;
			return hr;
		}
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "D3DCompile() Succeded for Vertex Shader.\n");
		fclose(msd_gpFile);

	}

	hr = msd_gpID3D11Device->CreateVertexShader(pID3DBlob_VertexShaderCode->GetBufferPointer(),
		pID3DBlob_VertexShaderCode->GetBufferSize(),
		NULL,
		&gpID3D11VertexShader);

	if (FAILED(hr))
	{
	
			fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
			fprintf_s(msd_gpFile, "ID3D11Device::CreateVertexShader() Failed...\n");
			fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateVertexShader() Succeded...\n");
		fclose(msd_gpFile);

	}

	msd_gpID3D11DeviceContext->VSSetShader(gpID3D11VertexShader,0,0);
	/////////////////////////////////////

	const char *hullShaderSourceCode =
		"cbuffer ConstantBuffer" \
		"{" \
		"float4 hull_constant_function_params;" \
		"}" \
		"struct vertex_output" \
		"{" \
		"	float4 position : POSITION;" \
		"};" \
		"struct hull_constant_output" \
		"{" \
		"	float edges[2] : SV_TESSFACTOR;" \
		"};" \
		"hull_constant_output hull_constant_function(void)" \
		"{" \
		"	hull_constant_output output;" \
		"	float numberOfStrips=hull_constant_function_params[0];" \
		"	float numberOfSegments=hull_constant_function_params[1];" \
		"	output.edges[0]=numberOfStrips;" \
		"	output.edges[1]=numberOfSegments;" \
		"	return(output);" \
		"}" \
		"struct hull_output" \
		"{" \
		"	float4 position : POSITION;" \
		"};" \
		"[domain(\"isoline\")]" \
		"[partitioning(\"integer\")]" \
		"[outputtopology(\"line\")]" \
		"[outputcontrolpoints(4)]" \
		"[patchconstantfunc(\"hull_constant_function\")]" \
		"hull_output main(InputPatch<vertex_output,4> input_patch, uint i:SV_OUTPUTCONTROLPOINTID)" \
		"{" \
		"	hull_output output;" \
		"	output.position=input_patch[i].position;" \
		"	return(output);" \
		"}";

	ID3DBlob *pID3DBlob_HullShaderCode = NULL;
	pID3DBlob_Error = NULL;

	hr = D3DCompile(hullShaderSourceCode, lstrlenA(hullShaderSourceCode) + 1,
		"HS",
		NULL,
		D3D_COMPILE_STANDARD_FILE_INCLUDE,
		"main",
		"hs_5_0",
		0,
		0,
		&pID3DBlob_HullShaderCode,
		&pID3DBlob_Error);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error != NULL)
		{
			fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
			fprintf_s(msd_gpFile, "D3DCompile() Failed for HULL Shader :%s.\n", (char *)pID3DBlob_Error->GetBufferPointer());
			fclose(msd_gpFile);
			pID3DBlob_Error->Release();
			pID3DBlob_Error = NULL;
			return hr;
		}
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "D3DCompile() Succeded for HULL Shader.\n");
		fclose(msd_gpFile);

	}

	hr = msd_gpID3D11Device->CreateHullShader(pID3DBlob_HullShaderCode->GetBufferPointer(),
		pID3DBlob_HullShaderCode->GetBufferSize(),
		NULL,
		&gpID3D11HullShader);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateHullShader() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateHullShader() Succeded...\n");
		fclose(msd_gpFile);

	}

	msd_gpID3D11DeviceContext->HSSetShader(gpID3D11HullShader, 0, 0);
	pID3DBlob_HullShaderCode->Release();
	pID3DBlob_HullShaderCode = NULL;
	/////////////////////////////////////

	const char *domainShaderSourceCode =
		"cbuffer ConstantBuffer" \
		"{" \
		"float4x4 worldViewProjectionMatrix;" \
		"}" \
		"struct hull_constant_output" \
		"{" \
		"	float edges[2] : SV_TESSFACTOR;" \
		"};" \
		"struct hull_output" \
		"{" \
		"	float4 position : POSITION;" \
		"};" \
		"struct domain_output" \
		"{" \
		"	float4 position : SV_POSITION;" \
		"};" \
		"[domain(\"isoline\")]" \
		"domain_output main(hull_constant_output input,OutputPatch<hull_output,4> output_patch,float2 tessCoord : SV_DOMAINLOCATION)" \
		"{" \
		"	domain_output output;" \
		"	float u=tessCoord.x;" \
		"	float3 p0=output_patch[0].position.xyz;" \
		"	float3 p1=output_patch[1].position.xyz;" \
		"	float3 p2=output_patch[2].position.xyz;" \
		"	float3 p3=output_patch[3].position.xyz;" \
		"	float u1=(1.0f-u);" \
		"	float u2=u*u;" \
		"	float b3=u2*u;" \
		"	float b2=3.0f*u2*u1;" \
		"	float b1=3.0f*u*u1*u1;" \
		"	float b0=u1*u1*u1;" \
		"	float3 p=p0*b0+p1*b1+p2*b2+p3*b3;" \
 		"	output.position=mul(worldViewProjectionMatrix,float4(p,1.0f));" \
		"	return(output);" \
		"}";

	ID3DBlob *pID3DBlob_DomainShaderCode = NULL;
	pID3DBlob_Error = NULL;

	hr = D3DCompile(domainShaderSourceCode, lstrlenA(domainShaderSourceCode) + 1,
		"DS",
		NULL,
		D3D_COMPILE_STANDARD_FILE_INCLUDE,
		"main",
		"ds_5_0",
		0,
		0,
		&pID3DBlob_DomainShaderCode,
		&pID3DBlob_Error);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error != NULL)
		{
			fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
			fprintf_s(msd_gpFile, "D3DCompile() Failed for Domain Shader :%s.\n", (char *)pID3DBlob_Error->GetBufferPointer());
			fclose(msd_gpFile);
			pID3DBlob_Error->Release();
			pID3DBlob_Error = NULL;
			return hr;
		}
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "D3DCompile() Succeded for Domain Shader.\n");
		fclose(msd_gpFile);

	}

	hr = msd_gpID3D11Device->CreateDomainShader(pID3DBlob_DomainShaderCode->GetBufferPointer(),
		pID3DBlob_DomainShaderCode->GetBufferSize(),
		NULL,
		&gpID3D11DomainShader);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateDomainShader() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateDomainShader() Succeded...\n");
		fclose(msd_gpFile);

	}

	msd_gpID3D11DeviceContext->DSSetShader(gpID3D11DomainShader, 0, 0);
	pID3DBlob_DomainShaderCode->Release();
	pID3DBlob_DomainShaderCode = NULL;

	//////////////////////////////////////
	//pixel Shader
	const char *pixelShaderSourceCode =
		"cbuffer ConstantBuffer" \
		"{" \
		"float4 lineColor;" \
		"};" \
		"float4 main(void): SV_TARGET" \
		"{" \
		"return lineColor;" \
		"}";

	ID3DBlob *pID3DBlob_PixelShaderCode = NULL;
	pID3DBlob_Error = NULL;

	hr = D3DCompile(pixelShaderSourceCode, lstrlenA(pixelShaderSourceCode) + 1,
		"PS",
		NULL,
		D3D_COMPILE_STANDARD_FILE_INCLUDE,
		"main",
		"ps_5_0",
		0,
		0,
		&pID3DBlob_PixelShaderCode,
		&pID3DBlob_Error);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error != NULL)
		{
			fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
			fprintf_s(msd_gpFile, "D3DCompile() Failed for Pixel Shader :%s.\n", (char *)pID3DBlob_Error->GetBufferPointer());
			fclose(msd_gpFile);
			pID3DBlob_Error->Release();
			pID3DBlob_Error = NULL;
			return hr;
		}
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "D3DCompile() Succeded for Pixel Shader.\n");
		fclose(msd_gpFile);

	}

	hr = msd_gpID3D11Device->CreatePixelShader(pID3DBlob_PixelShaderCode->GetBufferPointer(),
		pID3DBlob_PixelShaderCode->GetBufferSize(),
		NULL,
		&gpID3D11PixelShader);

	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreatePixelShader() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreatePixelShader() Succeded...\n");
		fclose(msd_gpFile);

	}
	msd_gpID3D11DeviceContext->PSSetShader(gpID3D11PixelShader,0,0);

	float vertices[] = {
		-1.0f,-1.0f,-0.5f,1.0f,0.5f,-1.0f,1.0f,1.0f
	};
	//create Vertex buffer
	D3D11_BUFFER_DESC bufferDesc_VertexBuffer_Triangle;
	ZeroMemory(&bufferDesc_VertexBuffer_Triangle, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_VertexBuffer_Triangle.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_VertexBuffer_Triangle.ByteWidth = sizeof(float)*_ARRAYSIZE(vertices);
	bufferDesc_VertexBuffer_Triangle.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_VertexBuffer_Triangle.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_VertexBuffer_Triangle, NULL, &gpID3D11Buffer_VertexBuffer_Pyramid);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBufferTriangle() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBufferTriangle() Succeded...\n");
		fclose(msd_gpFile);

	}

	D3D11_MAPPED_SUBRESOURCE mappedSubResource_pyramid;
	ZeroMemory(&mappedSubResource_pyramid, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_VertexBuffer_Pyramid, 0,
		D3D11_MAP_WRITE_DISCARD, 0, &mappedSubResource_pyramid);
	memcpy(mappedSubResource_pyramid.pData, vertices, sizeof(vertices));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_VertexBuffer_Pyramid, NULL);

	
	//create and set InputLayout
	D3D11_INPUT_ELEMENT_DESC inputElementDesc[1];
	inputElementDesc[0].SemanticName = "POSITION";
	inputElementDesc[0].SemanticIndex = 0;
	inputElementDesc[0].Format = DXGI_FORMAT_R32G32B32_FLOAT;
	inputElementDesc[0].InputSlot = 0;
	inputElementDesc[0].AlignedByteOffset = 0;
	inputElementDesc[0].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[0].InstanceDataStepRate = 0;
	
	hr = msd_gpID3D11Device->CreateInputLayout(inputElementDesc,1,
		pID3DBlob_VertexShaderCode->GetBufferPointer(),pID3DBlob_VertexShaderCode->GetBufferSize(),
		&gpID3D11InputLayout);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateInputLayout() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateInputLayout() Succeded...\n");
		fclose(msd_gpFile);

	}

	msd_gpID3D11DeviceContext->IASetInputLayout(gpID3D11InputLayout);
	pID3DBlob_VertexShaderCode->Release();
	pID3DBlob_VertexShaderCode = NULL;
	pID3DBlob_PixelShaderCode->Release();
	pID3DBlob_PixelShaderCode = NULL;

	//create Constant buffer
	D3D11_BUFFER_DESC bufferDesc_ConstantBuffer;
	ZeroMemory(&bufferDesc_ConstantBuffer, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_ConstantBuffer.Usage = D3D11_USAGE_DEFAULT;
	bufferDesc_ConstantBuffer.ByteWidth = sizeof(CBUFFER_HULL_SHADER);
	bufferDesc_ConstantBuffer.BindFlags = D3D11_BIND_CONSTANT_BUFFER;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_ConstantBuffer, nullptr, &gpID3D11Buffer_ConstantBuffer_HullShader);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Hull Shader Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Hull Shader Succeded...\n");
		fclose(msd_gpFile);

	}

	msd_gpID3D11DeviceContext->HSSetConstantBuffers(0,1,&gpID3D11Buffer_ConstantBuffer_HullShader);
	/////////////////////////////
	ZeroMemory(&bufferDesc_ConstantBuffer, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_ConstantBuffer.Usage = D3D11_USAGE_DEFAULT;
	bufferDesc_ConstantBuffer.ByteWidth = sizeof(CBUFFER_DOMAIN_SHADER);
	bufferDesc_ConstantBuffer.BindFlags = D3D11_BIND_CONSTANT_BUFFER;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_ConstantBuffer, nullptr, &gpID3D11Buffer_ConstantBuffer_DomainShader);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Domain Shader Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Domain Shader Succeded...\n");
		fclose(msd_gpFile);

	}

	msd_gpID3D11DeviceContext->DSSetConstantBuffers(0, 1, &gpID3D11Buffer_ConstantBuffer_DomainShader);
	///////////////////////////////////////
	ZeroMemory(&bufferDesc_ConstantBuffer, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_ConstantBuffer.Usage = D3D11_USAGE_DEFAULT;
	bufferDesc_ConstantBuffer.ByteWidth = sizeof(CBUFFER_PIXEL_SHADER);
	bufferDesc_ConstantBuffer.BindFlags = D3D11_BIND_CONSTANT_BUFFER;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_ConstantBuffer, nullptr, &gpID3D11Buffer_ConstantBuffer_PixelShader);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Pixel Shader Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Pixel Shader Succeded...\n");
		fclose(msd_gpFile);

	}

	msd_gpID3D11DeviceContext->PSSetConstantBuffers(0, 1, &gpID3D11Buffer_ConstantBuffer_PixelShader);


	//for depth
	//set Rasterizer State
	//in D3D culling is on by default
	//set culling off

	D3D11_RASTERIZER_DESC rasterizerDesc;
	ZeroMemory((void *)&rasterizerDesc,sizeof(D3D11_RASTERIZER_DESC));

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

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateRasterizerState() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateRasterizerState() Succeded...\n");
		fclose(msd_gpFile);

	}

	msd_gpID3D11DeviceContext->RSSetState(gpID3D11RasterizerState);

	msd_gClearColor[0] = 0.0f;
	msd_gClearColor[1] = 0.0f;
	msd_gClearColor[2] = 0.0f;
	msd_gClearColor[3] = 1.0f;
	gPerspectiveProjectionMatrix = XMMatrixIdentity();

	hr = resize(WIN_WIDTH, WIN_HEIGHT);
	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "resize() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "resize() Succeeded. Exitting Now..\n");
		fclose(msd_gpFile);
	}


	return(S_OK);

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
	ID3D11Texture2D *msd_pID3D11Texture2D_BackBuffer;
	msd_gpIDXGISwapChain->GetBuffer(0, __uuidof(ID3D11Texture2D), (LPVOID*)&msd_pID3D11Texture2D_BackBuffer);

	hr = msd_gpID3D11Device->CreateRenderTargetView(msd_pID3D11Texture2D_BackBuffer, NULL, &msd_gpID3D11RenderTargetView);

	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3DDevice::CreateRenderTargetView() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3DDevice::CreateRenderTargetView() Succeeded...\n");
		fclose(msd_gpFile);
	}

	msd_pID3D11Texture2D_BackBuffer->Release();
	msd_pID3D11Texture2D_BackBuffer = NULL;

	//create Depth Stencil Buffer
	D3D11_TEXTURE2D_DESC textureDesc;
	ZeroMemory(&textureDesc,sizeof(D3D11_TEXTURE2D_DESC));
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

	ID3D11Texture2D *pID3D11Texture2D_depthBuffer;
	msd_gpID3D11Device->CreateTexture2D(&textureDesc,NULL,&pID3D11Texture2D_depthBuffer);

	//create depth stencil view
	D3D11_DEPTH_STENCIL_VIEW_DESC depthStencilViewDesc;
	ZeroMemory(&depthStencilViewDesc,sizeof(D3D11_DEPTH_STENCIL_VIEW_DESC));
	depthStencilViewDesc.Format = DXGI_FORMAT_D32_FLOAT;
	depthStencilViewDesc.ViewDimension = D3D11_DSV_DIMENSION_TEXTURE2DMS;
	hr = msd_gpID3D11Device->CreateDepthStencilView(pID3D11Texture2D_depthBuffer,&depthStencilViewDesc, &gpID3D11DepthStencilView);


	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3DDevice::CreateDepthStencilView() Failed. Exitting Now..\n");
		fclose(msd_gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3DDevice::CreateDepthStencilView() Succeeded...\n");
		fclose(msd_gpFile);
	}
	pID3D11Texture2D_depthBuffer->Release();
	pID3D11Texture2D_depthBuffer = NULL;

	msd_gpID3D11DeviceContext->OMSetRenderTargets(1, &msd_gpID3D11RenderTargetView, gpID3D11DepthStencilView);

	D3D11_VIEWPORT d3dViewPort;
	d3dViewPort.TopLeftX = 0.0f;
	d3dViewPort.TopLeftY = 0.0f;
	d3dViewPort.Width = (float)width;
	d3dViewPort.Height = (float)height;
	d3dViewPort.MinDepth = 0.0f;
	d3dViewPort.MaxDepth = 1.0f;
	msd_gpID3D11DeviceContext->RSSetViewports(1, &d3dViewPort);
		gPerspectiveProjectionMatrix = XMMatrixPerspectiveFovLH(XMConvertToRadians(45),
			(float)width / (float)height,
			0.1f,
			100.0f);
	
	
	fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
	fprintf_s(msd_gpFile, "in resize");
	fclose(msd_gpFile);
	return(hr);


}

void display()
{
	void update();
	msd_gpID3D11DeviceContext->ClearRenderTargetView(msd_gpID3D11RenderTargetView, msd_gClearColor);
	msd_gpID3D11DeviceContext->ClearDepthStencilView(gpID3D11DepthStencilView, D3D11_CLEAR_DEPTH,1.0f,0);

	UINT stride = sizeof(float)*2;
	UINT offset = 0;
	msd_gpID3D11DeviceContext->IASetVertexBuffers(0,1,&gpID3D11Buffer_VertexBuffer_Pyramid,
		&stride,&offset);
	//set topology
	msd_gpID3D11DeviceContext->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_4_CONTROL_POINT_PATCHLIST);

	//translation
	XMMATRIX worldMatrix = XMMatrixIdentity();
	XMMATRIX viewMatrix = XMMatrixIdentity();
	XMMATRIX translationMatrix = XMMatrixIdentity();
	XMMATRIX rotationMatrix = XMMatrixIdentity();
	translationMatrix = XMMatrixTranslation(0.0f, 0.0f, 4.0f);
	//rotationMatrix = XMMatrixRotationY(-msd_angle);
	worldMatrix = rotationMatrix * translationMatrix * worldMatrix;
	XMMATRIX wvpMatrix = worldMatrix * viewMatrix*gPerspectiveProjectionMatrix;

	CBUFFER_DOMAIN_SHADER constantBuffer_domainShader;
	constantBuffer_domainShader.WorldViewProjectionMatrix = wvpMatrix;
	msd_gpID3D11DeviceContext->UpdateSubresource(gpID3D11Buffer_ConstantBuffer_DomainShader, 0,
		NULL, &constantBuffer_domainShader, 0, 0);

	CBUFFER_HULL_SHADER constantBuffer_hullShader;
	constantBuffer_hullShader.Hull_Constant_Function_Params = XMVectorSet(1.0f,(FLOAT)guiNumberOfLineSegments,0.0f,0.0f);
	msd_gpID3D11DeviceContext->UpdateSubresource(gpID3D11Buffer_ConstantBuffer_HullShader, 0,
		NULL, &constantBuffer_hullShader, 0, 0);
	TCHAR str[255];
	wsprintf(str,TEXT("DirectX11 Window [Segments =%2d ]"),guiNumberOfLineSegments);
	SetWindowText(msd_gHwnd,str);

	CBUFFER_PIXEL_SHADER constantBuffer_pixelShader;
	constantBuffer_pixelShader.LineColor = XMVectorSet(1.0f,1.0f,0.0f,1.0f);
	msd_gpID3D11DeviceContext->UpdateSubresource(gpID3D11Buffer_ConstantBuffer_PixelShader, 0,
		NULL, &constantBuffer_pixelShader, 0, 0);

	msd_gpID3D11DeviceContext->Draw(4, 0);
	msd_gpIDXGISwapChain->Present(0, 0);
	//update();
}
void update()
{
	msd_angle += 0.002f;
	if (msd_angle > 360.0f)
	{
		msd_angle = 0.0f;
	}
}


void uninitialize()
{
	if (gpID3D11Buffer_ConstantBuffer_HullShader)
	{
		gpID3D11Buffer_ConstantBuffer_HullShader->Release();
		gpID3D11Buffer_ConstantBuffer_HullShader = NULL;
	}
	if (gpID3D11Buffer_ConstantBuffer_DomainShader)
	{
		gpID3D11Buffer_ConstantBuffer_DomainShader->Release();
		gpID3D11Buffer_ConstantBuffer_DomainShader = NULL;
	}
	if (gpID3D11Buffer_ConstantBuffer_PixelShader)
	{
		gpID3D11Buffer_ConstantBuffer_PixelShader->Release();
		gpID3D11Buffer_ConstantBuffer_PixelShader = NULL;
	}
	if (gpID3D11InputLayout)
	{
		gpID3D11InputLayout->Release();
		gpID3D11InputLayout = NULL;
	}
	if (gpID3D11Buffer_VertexBuffer_Pyramid)
	{
		gpID3D11Buffer_VertexBuffer_Pyramid->Release();
		gpID3D11Buffer_VertexBuffer_Pyramid = NULL;
	}
	
	if (gpID3D11Buffer_ColorBuffer_Pyramid)
	{
		gpID3D11Buffer_ColorBuffer_Pyramid->Release();
		gpID3D11Buffer_ColorBuffer_Pyramid = NULL;
	}
	if (gpID3D11VertexShader)
	{
		gpID3D11VertexShader->Release();
		gpID3D11VertexShader = NULL;
	}
	if (gpID3D11PixelShader)
	{
		gpID3D11PixelShader->Release();
		gpID3D11PixelShader = NULL;
	}
	if (msd_gpID3D11RenderTargetView)
	{
		msd_gpID3D11RenderTargetView->Release();
		msd_gpID3D11RenderTargetView= NULL;
	}

	if (msd_gpIDXGISwapChain)
	{
		msd_gpIDXGISwapChain->Release();
		msd_gpIDXGISwapChain= NULL;
	}

	if (msd_gpID3D11DeviceContext)
	{
		msd_gpID3D11DeviceContext->Release();
		msd_gpID3D11DeviceContext= NULL;
	}
	if (msd_gpID3D11Device)
	{
		msd_gpID3D11Device->Release();
		msd_gpID3D11Device= NULL;
	}
	if (msd_gpFile)
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "uninitialize() Succeeded\n");
		fprintf_s(msd_gpFile, "Log File closed successfully\n");
		fclose(msd_gpFile);
		msd_gpFile = NULL;
	}

}


