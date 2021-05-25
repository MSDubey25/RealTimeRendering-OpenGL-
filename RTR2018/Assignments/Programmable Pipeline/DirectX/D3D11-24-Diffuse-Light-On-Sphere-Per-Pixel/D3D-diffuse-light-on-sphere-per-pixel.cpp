#include<Windows.h>
#include<stdio.h>

#include<d3d11.h>
#include<d3dcompiler.h>

#pragma warning(disable:4838)
#include "XNAMath/xnamath.h"
#pragma comment(lib,"d3d11.lib")
#pragma comment(lib,"D3dcompiler.lib")
#pragma comment(lib,"Sphere.lib")


#include "Sphere.h"

#define WIN_WIDTH 800
#define WIN_HEIGHT 600


LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

FILE * gpFile = NULL;

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
ID3D11Buffer *gpID3D11Buffer_vertexBuffer_vertices_sphere = NULL;
ID3D11Buffer *gpID3D11Buffer_vertexBuffer_normal_sphere = NULL;
ID3D11Buffer *gpID3D11Buffer_IndexBuffer = NULL;
ID3D11InputLayout *gpID3D11InputLayout = NULL;
ID3D11Buffer *gpID3D11Buffer_ConstantBuffer = NULL;
ID3D11RasterizerState *gpID3D11RasterizerState = NULL;

ID3D11DepthStencilView *gpID3D11DepthStencilView = NULL;




float sphere_vertices[1146];
float sphere_normals[1146];
float sphere_textures[764];
unsigned short sphere_elements[2280];
unsigned int gNumElements;
unsigned int gNumVertices;


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

bool gbIsLight = false;

XMMATRIX gPerspectiveProjectionMatrix;
float gAngleTriangle = 0.0f;

float lightAmbient[] = { 0.0f,0.0f,0.0f,1.0 };
float lightDiffuse[] = { 1.0f,1.0f,1.0f,1.0f };
float lightSpecular[] = { 1.0f,1.0f,1.0f,1.0f };
float lightPosition[] = { 100.0f,100.0,-100.0,1.0 };

float materialAmbient[] = { 0.0f,0.0f,0.0f,1.0f };
float materialDiffuse[] = { 1.0f,1.0f,1.0f,1.0f };
float materialSpecular[] = { 1.0f,1.0f,1.0f,1.0f };
float materialShininess = 128.0f;


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

	if (fopen_s(&gpFile, gszLogFileName, "w") != 0)
	{
		MessageBox(NULL, TEXT("Log File cannot be created"), TEXT("Error"), MB_OK);
		exit(0);
	}
	else
	{
		fprintf_s(gpFile, "Log File is successfully opened\n");
		fclose(gpFile);
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

	hwnd = CreateWindowEx(WS_EX_APPWINDOW, szAppName, TEXT("D3D11 Diffuse Light On Sphere Per Pixel"), WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE, 100, 100, WIN_WIDTH, WIN_HEIGHT, NULL, NULL, hInstance, NULL);

	gHwnd = hwnd;

	ShowWindow(hwnd, iCmdShow);
	SetForegroundWindow(hwnd);
	SetFocus(hwnd);


	HRESULT hr;
	hr = initialize();

	if (FAILED(hr))
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "initialize() Failed. Exitting Now..\n");
		fclose(gpFile);
		DestroyWindow(hwnd);
		hwnd = NULL;
	}

	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "initialize() succeeded");
		fclose(gpFile);
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
				fopen_s(&gpFile, gszLogFileName, "a+");
				fprintf_s(gpFile, "resize() Failed. Exitting Now..\n");
				fclose(gpFile);
				return(hr);
			}
			else
			{
				fopen_s(&gpFile, gszLogFileName, "a+");
				fprintf_s(gpFile, "resize() Succeeded. Exitting Now..\n");
				fclose(gpFile);
			}
		}
		break;

	case WM_DESTROY:
		uninitialize();
		PostQuitMessage(0);
		break;
	case WM_CHAR:
		switch (wParam) {
		case 'L':
		case 'l':
			if (gbIsLight == false)
				gbIsLight = true;
			else
				gbIsLight = false;
			break;
		}

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
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "Initialize() Failed. Exitting Now..\n");
		fclose(gpFile);
		return(hr);
	}

	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "Initialize() Succeeded. Exitting Now..\n");
		//fclose(gpFile);

		if (d3dDriverType == D3D_DRIVER_TYPE_HARDWARE)
		{
			fprintf_s(gpFile, "Hardware Type\n.");
		}
		else if (d3dDriverType == D3D_DRIVER_TYPE_WARP)
		{
			fprintf_s(gpFile, "Warp Type\n.");
		}
		else if (d3dDriverType == D3D_DRIVER_TYPE_REFERENCE)
		{
			fprintf_s(gpFile, "Reference Type\n.");
		}
		else
		{
			fprintf_s(gpFile, "Unknown Type\n.");
		}

		fprintf_s(gpFile, "The Supported Highest Feature Level Is");
		if (d3dFeatureLevel_acquired == D3D_FEATURE_LEVEL_11_0)
		{
			fprintf_s(gpFile, "11.0\n.");
		}

		else if (d3dFeatureLevel_acquired == D3D_FEATURE_LEVEL_10_1)
		{
			fprintf_s(gpFile, "10.1\n.");
		}
		else if (d3dFeatureLevel_acquired == D3D_FEATURE_LEVEL_10_0)
		{
			fprintf_s(gpFile, "10.0\n.");
		}
		else
		{
			fprintf_s(gpFile, "Unknown\n.");

		}

		fclose(gpFile);
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

		"};" \
		"vertex_output main(float4 pos:POSITION, float4 normal :NORMAL)" \
		"{" \
		"vertex_output output;" \
		"if(keypressed==1)" \
		"{" \
		"float4 eyeCoordinate=mul(worldMatrix,pos);" \
		"eyeCoordinate=mul(viewMatrix,eyeCoordinate);"\
		"output.tnorm=mul((float3x3)worldMatrix,(float3)normal);" \
		"output.lightDirection=(float3)lightPosition-(float3)eyeCoordinate;" \
		"output.viewVector=-eyeCoordinate.xyz;"\
		"}" \
		"else" \
		"{" \
		"}" \
		"float4 position=mul(worldMatrix,pos);" \
		"position=mul(viewMatrix,position);"\
		"position=mul(projectionMatrix,position);"\
		"output.position=position;"\
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
			fopen_s(&gpFile, gszLogFileName, "a+");
			fprintf_s(gpFile, "D3DCompile() Failed For Vertex Shader :%s.\n", (char *)pID3DBlob_Error->GetBufferPointer());
			fclose(gpFile);
		}
	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "D3DCompile() Succeeded For Vertex Shader .\n");
		fclose(gpFile);
	}

	hr = msd_gpID3D11Device->CreateVertexShader(pID3Blob_VertexShaderCode->GetBufferPointer(),
		pID3Blob_VertexShaderCode->GetBufferSize(), NULL, &gpID3D11VertexShader);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error != NULL)
		{
			fopen_s(&gpFile, gszLogFileName, "a+");
			fprintf_s(gpFile, "ID3D11Device::CreateVertexShader() Failed For Vertex Shader .\n");
			fclose(gpFile);
		}
	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateVertexShader() Succeeded For Vertex Shader .\n");
		fclose(gpFile);
	}

	msd_gpID3D11DeviceContext->VSSetShader(gpID3D11VertexShader, 0, 0);

	const char *pixelShaderSourceCode =
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
		"float4 main(float4 pos:SV_POSITION, float3 lightDirection:NORMAL0, float3 tnorm:NORMAL1, float3 viewVector:NORMAL2): SV_TARGET" \
		"{" \
		"float4 color;"\
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
		"color=phong_ads_light;"
		"}"\
		"else"\
		"{"\
		"color = float4(1.0, 1.0, 1.0, 1.0); " \
		"}"\
		"return color; " \
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
			fopen_s(&gpFile, gszLogFileName, "a+");
			fprintf_s(gpFile, "D3DCompile() Failed For Pixel Shader :%s.\n", (char *)pID3DBlob_Error->GetBufferPointer());
			fclose(gpFile);
			pID3DBlob_Error->Release();
			pID3DBlob_Error = NULL;
			return(hr);
		}
	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "D3DCompile() Succeeded For Pixel Shader .\n");
		fclose(gpFile);
	}

	hr = msd_gpID3D11Device->CreatePixelShader(pID3Blob_PixelShaderCode->GetBufferPointer(),
		pID3Blob_PixelShaderCode->GetBufferSize(), NULL, &gpID3D11PixelShader);

	if (FAILED(hr))
	{
		if (pID3DBlob_Error != NULL)
		{
			fopen_s(&gpFile, gszLogFileName, "a+");
			fprintf_s(gpFile, "ID3D11Device::CreateVertexShader() Failed For Vertex Shader .\n");
			fclose(gpFile);
		}
	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateVertexShader() Succeeded For Vertex Shader .\n");
		fclose(gpFile);
	}

	msd_gpID3D11DeviceContext->PSSetShader(gpID3D11PixelShader, 0, 0);
	getSphereVertexData(sphere_vertices, sphere_normals, sphere_textures, sphere_elements);
	gNumVertices = getNumberOfSphereVertices();
	gNumElements = getNumberOfSphereElements();

	fopen_s(&gpFile, gszLogFileName, "a+");
	fprintf_s(gpFile, "no of vertices of sphere : %d...\n", gNumVertices);
	fprintf_s(gpFile, "no of Elements of sphere : %d...\n", gNumElements);
	fclose(gpFile);

	D3D11_BUFFER_DESC bufferDesc_Vertexbuffer_position_sphere;
	ZeroMemory(&bufferDesc_Vertexbuffer_position_sphere, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_Vertexbuffer_position_sphere.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_Vertexbuffer_position_sphere.ByteWidth = sizeof(float)*_ARRAYSIZE(sphere_vertices);
	bufferDesc_Vertexbuffer_position_sphere.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_Vertexbuffer_position_sphere.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_Vertexbuffer_position_sphere, NULL,
		&gpID3D11Buffer_vertexBuffer_vertices_sphere);

	if (FAILED(hr))
	{

		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateBuffer() Failed For Vertex Buffer position sphere.\n");
		fclose(gpFile);

	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateBuffer() Succeeded For Vertex Buffer position sphere.\n");
		fclose(gpFile);
	}


	D3D11_MAPPED_SUBRESOURCE mappedSubresource_vertex_sphere;

	ZeroMemory(&mappedSubresource_vertex_sphere, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_vertices_sphere, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_vertex_sphere);
	memcpy(mappedSubresource_vertex_sphere.pData, sphere_vertices, sizeof(sphere_vertices));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_vertices_sphere, NULL);



	D3D11_BUFFER_DESC bufferDesc_Vertexbuffer_normals_sphere;


	ZeroMemory(&bufferDesc_Vertexbuffer_normals_sphere, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_Vertexbuffer_normals_sphere.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_Vertexbuffer_normals_sphere.ByteWidth = sizeof(float)*ARRAYSIZE(sphere_normals);
	bufferDesc_Vertexbuffer_normals_sphere.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bufferDesc_Vertexbuffer_normals_sphere.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_Vertexbuffer_normals_sphere, NULL,
		&gpID3D11Buffer_vertexBuffer_normal_sphere);

	if (FAILED(hr))
	{

		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateBuffer() Failed For Vertex Buffer Color Rectangle.\n");
		fclose(gpFile);

	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateBuffer() Succeeded For Vertex Buffer Color Rectangle.\n");
		fclose(gpFile);
	}




	D3D11_MAPPED_SUBRESOURCE mappedSubresource_normal_sphere;
	ZeroMemory(&mappedSubresource_normal_sphere, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_vertexBuffer_normal_sphere, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_normal_sphere);
	memcpy(mappedSubresource_normal_sphere.pData, sphere_normals, sizeof(sphere_normals));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_vertexBuffer_normal_sphere, NULL);



	D3D11_BUFFER_DESC bufferDesc_Vertexbuffer_elements_sphere;
	ZeroMemory(&bufferDesc_Vertexbuffer_elements_sphere, sizeof(D3D11_BUFFER_DESC));
	bufferDesc_Vertexbuffer_elements_sphere.Usage = D3D11_USAGE_DYNAMIC;
	bufferDesc_Vertexbuffer_elements_sphere.ByteWidth = gNumElements * sizeof(short);
	bufferDesc_Vertexbuffer_elements_sphere.BindFlags = D3D11_BIND_INDEX_BUFFER;
	bufferDesc_Vertexbuffer_elements_sphere.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;

	hr = msd_gpID3D11Device->CreateBuffer(&bufferDesc_Vertexbuffer_elements_sphere,
		NULL, &gpID3D11Buffer_IndexBuffer);

	if (FAILED(hr))
	{

		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateBuffer() Failed For Vertex Buffer Position Sphere.\n");
		fclose(gpFile);

	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateBuffer() Succeeded For Vertex Buffer Position Sphere.\n");
		fclose(gpFile);
	}

	D3D11_MAPPED_SUBRESOURCE mappedSubresource_indices_sphere;
	ZeroMemory(&mappedSubresource_indices_sphere, sizeof(D3D11_MAPPED_SUBRESOURCE));
	msd_gpID3D11DeviceContext->Map(gpID3D11Buffer_IndexBuffer, 0, D3D11_MAP_WRITE_DISCARD, 0, &mappedSubresource_indices_sphere);
	memcpy(mappedSubresource_indices_sphere.pData, sphere_elements, gNumElements * sizeof(short));
	msd_gpID3D11DeviceContext->Unmap(gpID3D11Buffer_IndexBuffer, NULL);
	D3D11_INPUT_ELEMENT_DESC inputElementDesc[2];

	inputElementDesc[0].SemanticName = "POSITION";
	inputElementDesc[0].SemanticIndex = 0;
	inputElementDesc[0].Format = DXGI_FORMAT_R32G32B32_FLOAT;
	inputElementDesc[0].InputSlot = 0;
	inputElementDesc[0].AlignedByteOffset = 0;
	inputElementDesc[0].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[0].InstanceDataStepRate = 0;

	inputElementDesc[1].SemanticName = "NORMAL";
	inputElementDesc[1].SemanticIndex = 0;
	inputElementDesc[1].Format = DXGI_FORMAT_R32G32B32_FLOAT;
	inputElementDesc[1].InputSlot = 1;
	inputElementDesc[1].AlignedByteOffset = 0;
	inputElementDesc[1].InputSlotClass = D3D11_INPUT_PER_VERTEX_DATA;
	inputElementDesc[1].InstanceDataStepRate = 0;

	hr = msd_gpID3D11Device->CreateInputLayout(inputElementDesc, 2,
		pID3Blob_VertexShaderCode->GetBufferPointer(), pID3Blob_VertexShaderCode->GetBufferSize(), &gpID3D11InputLayout);

	if (FAILED(hr))
	{

		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateInputLayout() Failed For Vertex Buffer .\n");
		fclose(gpFile);

	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateInputLayout() Succeeded For Vertex Buffer .\n");
		fclose(gpFile);
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

		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateBuffer() Failed For Constant Buffer .\n");
		fclose(gpFile);

	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateBuffer() Succeeded For Constant Buffer .\n");
		fclose(gpFile);
	}


	msd_gpID3D11DeviceContext->VSSetConstantBuffers(0, 1, &gpID3D11Buffer_ConstantBuffer);
	msd_gpID3D11DeviceContext->PSSetConstantBuffers(0, 1, &gpID3D11Buffer_ConstantBuffer);

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

		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateRasterizerState() Failed For Culling.\n");
		fclose(gpFile);

	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3D11Device::CreateRasterizerState() Succeeded For Culling .\n");
		fclose(gpFile);
	}

	msd_gpID3D11DeviceContext->RSSetState(gpID3D11RasterizerState);

	gClearColor[0] = 0.0f;
	gClearColor[1] = 0.0f;
	gClearColor[2] = 0.0f;
	gClearColor[3] = 1.0f;


	gPerspectiveProjectionMatrix = XMMatrixIdentity();

	hr = resize(WIN_WIDTH, WIN_HEIGHT);
	if (FAILED(hr))
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "resize() Failed. Exitting Now..\n");
		fclose(gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "resize() Succeeded. Exitting Now..\n");
		fclose(gpFile);
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
	ID3D11Texture2D *pID3D11Texture2D_BackBuffer;
	msd_gpIDXGISwapChain->GetBuffer(0, __uuidof(ID3D11Texture2D), (LPVOID*)&pID3D11Texture2D_BackBuffer);

	hr = msd_gpID3D11Device->CreateRenderTargetView(pID3D11Texture2D_BackBuffer, NULL, &msd_gpID3D11RenderTargetView);

	if (FAILED(hr))
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3DDevice::CreateRenderTargetView() Failed. Exitting Now..\n");
		fclose(gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3DDevice::CreateRenderTargetView() Succeeded. Exitting Now..\n");
		fclose(gpFile);
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


	D3D11_DEPTH_STENCIL_VIEW_DESC depthStencilViewDesc;
	ZeroMemory(&depthStencilViewDesc, sizeof(D3D11_DEPTH_STENCIL_VIEW_DESC));
	depthStencilViewDesc.Format = DXGI_FORMAT_D32_FLOAT;
	depthStencilViewDesc.ViewDimension = D3D11_DSV_DIMENSION_TEXTURE2DMS;
	hr = msd_gpID3D11Device->CreateDepthStencilView(pID3D11Texture2D_DepthBuffer, &depthStencilViewDesc,
		&gpID3D11DepthStencilView);


	if (FAILED(hr))
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3DDevice::CreateDepthStencilView() Failed. Exitting Now..\n");
		fclose(gpFile);
		return(hr);
	}
	else
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "ID3DDevice::CreateDepthStencilView() Succeeded. Exitting Now..\n");
		fclose(gpFile);
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
	XMMATRIX wMatrix;
	XMMATRIX vMatrix;
	XMMATRIX pMatrix;


	CBUFFER constantBuffer;

	UINT stride1 = sizeof(float) * 3;
	UINT offset1 = 0;


	msd_gpID3D11DeviceContext->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);

	worldMatrix = XMMatrixIdentity();
	viewMatrix = XMMatrixIdentity();
	rotationMatrix = XMMatrixIdentity();
	worldMatrix = XMMatrixTranslation(0.0f, 0.0f, 2.0f);
	wMatrix = worldMatrix;
	vMatrix = viewMatrix;
	pMatrix = gPerspectiveProjectionMatrix;


	constantBuffer.WorldMatrix = wMatrix;
	constantBuffer.viewMatrix = vMatrix;
	constantBuffer.projectionMatrix = pMatrix;

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

	//====
	msd_gpID3D11DeviceContext->UpdateSubresource(gpID3D11Buffer_ConstantBuffer, 0, NULL, &constantBuffer, 0, 0);
	msd_gpID3D11DeviceContext->IASetVertexBuffers(0, 1, &gpID3D11Buffer_vertexBuffer_vertices_sphere, &stride1, &offset1);
	msd_gpID3D11DeviceContext->IASetVertexBuffers(1, 1, &gpID3D11Buffer_vertexBuffer_normal_sphere, &stride1, &offset1);
	msd_gpID3D11DeviceContext->IASetIndexBuffer(gpID3D11Buffer_IndexBuffer, DXGI_FORMAT_R16_UINT, 0);

	msd_gpID3D11DeviceContext->DrawIndexed(gNumElements, 0, 0);

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

	if (gpID3D11Buffer_IndexBuffer)
	{
		gpID3D11Buffer_IndexBuffer->Release();
		gpID3D11Buffer_IndexBuffer = NULL;
	}


	if (gpID3D11Buffer_vertexBuffer_normal_sphere)
	{
		gpID3D11Buffer_vertexBuffer_normal_sphere->Release();
		gpID3D11Buffer_vertexBuffer_normal_sphere = NULL;
	}

	if (gpID3D11Buffer_vertexBuffer_vertices_sphere)
	{
		gpID3D11Buffer_vertexBuffer_vertices_sphere->Release();
		gpID3D11Buffer_vertexBuffer_vertices_sphere = NULL;
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
	if (gpFile)
	{
		fopen_s(&gpFile, gszLogFileName, "a+");
		fprintf_s(gpFile, "uninitialize() Succeeded");
		fprintf_s(gpFile, "Log File closed successfully");
		fclose(gpFile);
		gpFile = NULL;
	}

}


