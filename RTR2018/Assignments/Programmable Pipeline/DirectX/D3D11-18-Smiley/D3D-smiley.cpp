#include<Windows.h>
#include<stdio.h>
#include<d3d11.h>
#include<d3dcompiler.h>
#include "WICTextureLoader.h" //for DirectX::CreateWICTextureFromFile
#pragma warning(disable:4838)
#include "XNAMath\xnamath.h"
#pragma comment(lib,"d3d11.lib")
#pragma comment(lib,"D3dcompiler.lib")
#pragma comment(lib,"DirectXTK.lib")//for DirectX::CreateWICTextureFromFile

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
ID3D11Buffer *gpID3D11Buffer_VertexBuffer_Cube = NULL;
ID3D11Buffer *gpID3D11Buffer_VertexBuffer_Texture_Cube = NULL;
ID3D11InputLayout *gpID3D11InputLayout = NULL;
ID3D11Buffer *gpID3D11Buffer_ConstantBuffer = NULL;

ID3D11RasterizerState *gpID3D11RasterizerState = NULL;
ID3D11DepthStencilView *gpID3D11DepthStencilView = NULL;

ID3D11ShaderResourceView *gpID3D11ShaderResourceView_Texture_Cube = NULL;
ID3D11SamplerState *gpID3D11SamplerState_Texture_Cube = NULL;

float msd_angle = 0.0f;
struct CBUFFER
{
	XMMATRIX WorldViewProjectionMatrix;
};

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


	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("Direct3D11 Smiley"), WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE, 100, 100, WIN_WIDTH, WIN_HEIGHT, NULL, NULL, hInstance, NULL);

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
	HRESULT LoadD3DTexture(const wchar_t *,ID3D11ShaderResourceView **);
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
		"cbuffer ConstantBuffer" \
		"{" \
		"float4x4 worldViewProjectionMatrix;" \
		"}" \
		"struct vertex_output" \
		"{" \
		"	float4 position : SV_POSITION;" \
		"	float2 texcoord : TEXCOORD;" \
		"};" \
		"vertex_output main(float4 pos:POSITION, float2 texcoord :TEXCOORD)" \
		"{" \
		"vertex_output output;" \
		"output.texcoord=texcoord;" \
		"output.position=mul(worldViewProjectionMatrix,pos);" \
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

	//pixel Shader
	const char *pixelShaderSourceCode =
		"Texture2D myTexture2D;" \
		"SamplerState mySamplerState;" \
		"float4 main(float4 pos:SV_POSITION, float2 texcoord:TEXCOORD): SV_TARGET" \
		"{" \
		"float4 color=myTexture2D.Sample(mySamplerState,texcoord);" \
		"return color;" \
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
		-1.0f, 1.0f, 0.0f,//FRONT
		1.0f, 1.0f, 0.0f,
		-1.0f, -1.0f, 0.0f,
		-1.0f, -1.0f, 0.0f,
		1.0f, 1.0f, 0.0f,
		1.0f, -1.0f, 0.0f
	};

	float verticesTexcoord[] = {
		0.0f ,0.0f,
		1.0f, 0.0f,//fl
		0.0f, 1.0f,//ft
		0.0f, 1.0f,//ft
		1.0f, 0.0f,//fl
		1.0f, 1.0f//fr
	};

	//create Vertex buffer
	D3D11_BUFFER_DESC bufferDesc_VertexBuffer_Triangle;
	ZeroMemory(&bufferDesc_VertexBuffer_Triangle, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_VertexBuffer_Triangle.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_VertexBuffer_Triangle.ByteWidth = sizeof(float)*_ARRAYSIZE(vertices);
	bufferDesc_VertexBuffer_Triangle.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_VertexBuffer_Triangle.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_VertexBuffer_Triangle, NULL, &gpID3D11Buffer_VertexBuffer_Cube);
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

	D3D11_MAPPED_SUBRESOURCE mappedSubResource_cube;
	ZeroMemory(&mappedSubResource_cube, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_VertexBuffer_Cube, 0,
		D3D11_MAP_WRITE_DISCARD, 0, &mappedSubResource_cube);
	memcpy(mappedSubResource_cube.pData, vertices, sizeof(vertices));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_VertexBuffer_Cube, NULL);

	
	//for texture
	//create Vertex buffer
	D3D11_BUFFER_DESC bufferDesc_texture;
	ZeroMemory(&bufferDesc_texture, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_texture.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_texture.ByteWidth = sizeof(float)*_ARRAYSIZE(verticesTexcoord);
	bufferDesc_texture.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_texture.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_texture, NULL, &gpID3D11Buffer_VertexBuffer_Texture_Cube);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBufferTexturePyramid() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBufferTexturePyramid() Succeded...\n");
		fclose(msd_gpFile);

	}
	D3D11_MAPPED_SUBRESOURCE mappedSubResource_tex;
	ZeroMemory(&mappedSubResource_tex, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_VertexBuffer_Texture_Cube, 0,
		D3D11_MAP_WRITE_DISCARD, 0, &mappedSubResource_tex);
	memcpy(mappedSubResource_tex.pData, verticesTexcoord, sizeof(verticesTexcoord));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_VertexBuffer_Texture_Cube, NULL);
	//create and set InputLayout
	D3D11_INPUT_ELEMENT_DESC inputElementDesc[2];
	inputElementDesc[0].SemanticName = "POSITION";
	inputElementDesc[0].SemanticIndex = 0;
	inputElementDesc[0].Format = DXGI_FORMAT_R32G32B32_FLOAT;
	inputElementDesc[0].InputSlot = 0;
	inputElementDesc[0].AlignedByteOffset = 0;
	inputElementDesc[0].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[0].InstanceDataStepRate = 0;
	//for color
	inputElementDesc[1].SemanticName = "TEXCOORD";
	inputElementDesc[1].SemanticIndex = 0;
	inputElementDesc[1].Format = DXGI_FORMAT_R32G32_FLOAT;
	inputElementDesc[1].InputSlot = 1;
	inputElementDesc[1].AlignedByteOffset = D3D11_APPEND_ALIGNED_ELEMENT;
	inputElementDesc[1].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[1].InstanceDataStepRate = 0;

	hr = msd_gpID3D11Device->CreateInputLayout(inputElementDesc,2,
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
	bufferDesc_ConstantBuffer.ByteWidth = sizeof(CBUFFER);
	bufferDesc_ConstantBuffer.BindFlags = D3D11_BIND_CONSTANT_BUFFER;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_ConstantBuffer, nullptr, &gpID3D11Buffer_ConstantBuffer);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::CreateBuffer() Succeded...\n");
		fclose(msd_gpFile);

	}

	msd_gpID3D11DeviceContext->VSSetConstantBuffers(0,1,&gpID3D11Buffer_ConstantBuffer);

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

	//loadTexture
	hr = LoadD3DTexture(L"Smiley.bmp",&gpID3D11ShaderResourceView_Texture_Cube);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "LoadD3DTexture() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "LoadD3DTexture() Succeded...\n");
		fclose(msd_gpFile);

	}
	//create the sample state
	D3D11_SAMPLER_DESC samplerDesc;
	ZeroMemory(&samplerDesc,sizeof(D3D11_SAMPLER_DESC));
	samplerDesc.Filter = D3D11_FILTER_MIN_MAG_MIP_LINEAR;
	samplerDesc.AddressU = D3D11_TEXTURE_ADDRESS_WRAP;
	samplerDesc.AddressV = D3D11_TEXTURE_ADDRESS_WRAP;
	samplerDesc.AddressW = D3D11_TEXTURE_ADDRESS_WRAP;

	hr = msd_gpID3D11Device->CreateSamplerState(&samplerDesc,&gpID3D11SamplerState_Texture_Cube);
	if (FAILED(hr))
	{

		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::createSamplerState() Failed...\n");
		fclose(msd_gpFile);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "ID3D11Device::createSamplerState() Succeded...\n");
		fclose(msd_gpFile);

	}
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
HRESULT LoadD3DTexture(const wchar_t *fileName,ID3D11ShaderResourceView **ppID3D11ShaderResourceView)
{
	HRESULT hr;
	//create texture
	hr = DirectX::CreateWICTextureFromFile(msd_gpID3D11Device, msd_gpID3D11DeviceContext,fileName,NULL,ppID3D11ShaderResourceView);
	if (FAILED(hr))
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "DirectX::CreateWICTextureFromFile Failed..\n");
		fclose(msd_gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&msd_gpFile, msd_gszLogFileName, "a+");
		fprintf_s(msd_gpFile, "DirectX::CreateWICTextureFromFile Success\n");
		fclose(msd_gpFile);
	}
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

	UINT stride = sizeof(float)*3;
	UINT offset = 0;
	msd_gpID3D11DeviceContext->IASetVertexBuffers(0,1,&gpID3D11Buffer_VertexBuffer_Cube,
		&stride,&offset);
	stride = sizeof(float) * 2;//for u and v
	offset = 0;
	msd_gpID3D11DeviceContext->IASetVertexBuffers(1, 1, &gpID3D11Buffer_VertexBuffer_Texture_Cube,
		&stride, &offset);

	//bind texture and sampler as a pixel shader resource
	msd_gpID3D11DeviceContext->PSSetShaderResources(0,1,&gpID3D11ShaderResourceView_Texture_Cube);
	msd_gpID3D11DeviceContext->PSSetSamplers(0, 1, &gpID3D11SamplerState_Texture_Cube);
	//set topology
	msd_gpID3D11DeviceContext->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);

	//translation
	XMMATRIX worldMatrix = XMMatrixIdentity();
	XMMATRIX viewMatrix = XMMatrixIdentity();
	XMMATRIX translationMatrix = XMMatrixIdentity();
	XMMATRIX rotationMatrix = XMMatrixIdentity();
	translationMatrix = XMMatrixTranslation(0.0f, 0.0f, 5.0f);
	worldMatrix =translationMatrix * worldMatrix;
	XMMATRIX wvpMatrix = worldMatrix * viewMatrix*gPerspectiveProjectionMatrix;

	CBUFFER constantBuffer;
	constantBuffer.WorldViewProjectionMatrix = wvpMatrix;
	msd_gpID3D11DeviceContext->UpdateSubresource(gpID3D11Buffer_ConstantBuffer, 0,
		NULL, &constantBuffer, 0, 0);
	msd_gpID3D11DeviceContext->Draw(6, 0);
	msd_gpIDXGISwapChain->Present(0, 0);
	
}

void uninitialize()
{
	if (gpID3D11Buffer_ConstantBuffer)
	{
		gpID3D11Buffer_ConstantBuffer->Release();
		gpID3D11Buffer_ConstantBuffer = NULL;
	}
	if (gpID3D11InputLayout)
	{
		gpID3D11InputLayout->Release();
		gpID3D11InputLayout = NULL;
	}
	if (gpID3D11Buffer_VertexBuffer_Cube)
	{
		gpID3D11Buffer_VertexBuffer_Cube->Release();
		gpID3D11Buffer_VertexBuffer_Cube = NULL;
	}
	
	if (gpID3D11Buffer_VertexBuffer_Texture_Cube)
	{
		gpID3D11Buffer_VertexBuffer_Texture_Cube->Release();
		gpID3D11Buffer_VertexBuffer_Texture_Cube = NULL;
	}
	if (gpID3D11SamplerState_Texture_Cube)
	{
		gpID3D11SamplerState_Texture_Cube->Release();
		gpID3D11SamplerState_Texture_Cube = NULL;
	}
	if (gpID3D11ShaderResourceView_Texture_Cube)
	{
		gpID3D11ShaderResourceView_Texture_Cube->Release();
		gpID3D11ShaderResourceView_Texture_Cube = NULL;
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


