#import<Foundation/Foundation.h>
#import<Cocoa/Cocoa.h>

#import<QuartzCore/CVDisplayLink.h>

#import<OpenGL/gl3.h>
#import<OpenGL/gl3ext.h>
#import "vmath.h"
#import "Sphere.h"
enum {
    AMC_ATTRIBUTE_POSITION=0,
    AMC_ATTRIBUTE_COLOR,
    AMC_ATTRIBUTE_NORMAL,
    AMC_ATTRIBUTE_TEXCOORD0
};

struct Light {
    GLfloat LightAmbience[4];
    GLfloat LightDiffuse[4];
    GLfloat LightSpecular[4];
    GLfloat LightPosition[4];
    GLfloat angle = 0.0f;
};

CVReturn MyDisplayLinkCallback(CVDisplayLinkRef, const CVTimeStamp *,const CVTimeStamp *,CVOptionFlags,CVOptionFlags *,void *);

FILE *gpFile=NULL;
Sphere *sphere=[Sphere alloc];
@interface AppDelegate : NSObject <NSApplicationDelegate, NSWindowDelegate>
@end

@interface GLView : NSOpenGLView
@end

int main(int argc, const char * argv[])
{
    NSAutoreleasePool *pPool=[[NSAutoreleasePool alloc]init];
    
    NSApp=[NSApplication sharedApplication];
    [NSApp setDelegate:[[AppDelegate alloc]init]];
    
    [NSApp run];
    [pPool release];
    return(0);
}

@implementation AppDelegate
{
@private
    NSWindow *window;
    GLView *glView;
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    
    
    // log file
    
    NSBundle *mainBundle=[NSBundle mainBundle];
    NSString *appDirName=[mainBundle bundlePath];
    NSString *parentDirPath=[appDirName stringByDeletingLastPathComponent];
    NSString *logFileNameWithPath=[NSString stringWithFormat:@"%@/Log.txt",parentDirPath];
    const char *pszLogFileNameWithPath=[logFileNameWithPath cStringUsingEncoding:NSASCIIStringEncoding];
    gpFile=fopen(pszLogFileNameWithPath,"w");
    
    if(gpFile==NULL)
    {
        printf("Cannot create log file\n");
        [self release];
        [NSApp terminate:self];
    }
    
    fprintf(gpFile,"Program is started successfully");
    
    
    NSRect win_rect;
    win_rect=NSMakeRect(0.0,0.0,800.0,600.0);
    
    window=[[NSWindow alloc] initWithContentRect:win_rect
                                       styleMask:NSWindowStyleMaskTitled |
            NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable |
            NSWindowStyleMaskResizable
                                         backing:NSBackingStoreBuffered
                                           defer:NO];
    [window setTitle:@"macOS Diffuse Light on Sphere Per Vertex Per Fragment Toggle"];
    [window center];
    
    glView=[[GLView alloc]initWithFrame:win_rect];
    
    [window setContentView:glView];
    [window setDelegate:self];
    [window makeKeyAndOrderFront:self];
}

-(void)applicationWillTerminate:(NSNotification *)notification
{
    fprintf(gpFile,"Program is terminated successfully");
    
    if(gpFile)
    {
        fclose(gpFile);
        gpFile=NULL;
    }
    
    //code
}

-(void)windowWillClose:(NSNotification *)notification
{
    [NSApp terminate:self];
}

-(void)dealloc
{
    [glView release];
    [window release];
    [super dealloc];
}
@end

@implementation GLView
{
@private
    CVDisplayLinkRef displayLink;
    
    GLuint gVertexShaderObject;
    GLuint gFragmentShaderObject;
    GLuint gShaderProgramObject;
    
    GLuint vao_rectangle;
    GLuint vbo_position_rectangle;
    GLuint vbo_normal_rectangle;
    GLuint mUniform;
    GLuint vUniform;
    GLuint pUniform;
    GLuint laUniform_red;
    GLuint ldUniform_red;
    GLuint lsUniform_red;
    GLuint lightPositionUniform_red;
    GLuint laUniform_blue;
    GLuint ldUniform_blue;
    GLuint lsUniform_blue;
    GLuint lightPositionUniform_blue;
    GLuint laUniform_green;
    GLuint ldUniform_green;
    GLuint lsUniform_green;
    GLuint lightPositionUniform_green;
    GLuint kaUniform;
    GLuint kdUniform;
    GLuint ksUniform;
    GLuint materialShininessUniform;
    GLuint isLkeyPressedUniform;
    vmath::mat4 projectionMatrix;
    vmath::mat4 modelMatrix;
    vmath::mat4 viewMatrix;
    
    GLfloat angle_rect;
    bool gbIsLighting;
    bool gbIsAnimation;
    
    GLuint vao_sphere;
    GLuint vbo_sphere_position;
    GLuint vbo_sphere_normal;
    GLuint vbo_sphere_element;

    float sphere_vertices[1146];
    float sphere_normals[1146];
    float sphere_textures[746];
    short sphere_elements[2280];
    
    int numVertices;
    int numElements;

    float material_ambient[4];
    float material_diffuse[4];
    float material_specular[4];
    float material_shininess[1];
    
    bool gbIsVertexShader;
    bool gbIsFragmentShader;
    
    Light lights[3];
}

-(id)initWithFrame:(NSRect)frame;
{
    self=[super initWithFrame:frame];
    
    if(self)
    {
        [[self window]setContentView:self];
        
        NSOpenGLPixelFormatAttribute attrs[]=
        {
            NSOpenGLPFAOpenGLProfile,
            NSOpenGLProfileVersion4_1Core,
            NSOpenGLPFAScreenMask,CGDisplayIDToOpenGLDisplayMask(kCGDirectMainDisplay),
            NSOpenGLPFANoRecovery,
            NSOpenGLPFAAccelerated,
            NSOpenGLPFAColorSize,24,
            NSOpenGLPFADepthSize,24,
            NSOpenGLPFAAlphaSize,8,
            NSOpenGLPFADoubleBuffer,
            0
        };//last 0 is must
        
        NSOpenGLPixelFormat *pixelFormat=[[[NSOpenGLPixelFormat alloc]initWithAttributes:attrs]autorelease];
        
        if(pixelFormat==nil)
        {
            fprintf(gpFile,"\nNo Valid OpenGL Pixel Format Is Available");
            [self release];
            [NSApp terminate:self];
        }
        
        NSOpenGLContext *glContext=[[[NSOpenGLContext alloc]initWithFormat:pixelFormat shareContext:nil]autorelease];
        
        [self setPixelFormat:pixelFormat];
        
        [self setOpenGLContext:glContext];
        
    }
    return(self);
}


-(CVReturn)getFrameForTime:(const CVTimeStamp *)pOutputTime

{
    NSAutoreleasePool *pool=[[NSAutoreleasePool alloc]init];
    [self drawView];
    [pool release];
    
    return(kCVReturnSuccess);
}

-(void)ShadersToggle
{
    //define vertex shader object
    gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);
    
    //write vertex shader code
    const GLchar *vertexShaderSourceCodePerFragment =
    "#version 330 core" \
    "\n" \
    "in vec4 vPosition;" \
    "in vec3 vNormal;" \
    "uniform mat4 u_m_matrix;" \
    "uniform mat4 u_v_matrix;" \
    "uniform mat4 u_p_matrix;" \
    "uniform vec4 u_lightPosition_red;" \
    "uniform vec4 u_lightPosition_blue;" \
    "uniform vec4 u_lightPosition_green;" \
    "uniform int u_LkeyIsPressed;" \
    "out vec3 light_direction_red;" \
    "out vec3 light_direction_blue;" \
    "out vec3 light_direction_green;" \
    "out vec3 reflection_vector_red;" \
    "out vec3 reflection_vector_blue;" \
    "out vec3 reflection_vector_green;" \
    "out vec3 viewer_vector;" \
    "out vec3 transformedNormal;" \
    "out vec3 white;" \
    "void main(void)" \
    "{" \
    "    if(u_LkeyIsPressed==1)" \
    "    {" \
    "        vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" \
    "        mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" \
    "        transformedNormal=normalMatrix*vNormal;" \
    "        light_direction_red=vec3(u_lightPosition_red-eyeCoordinates);" \
    "        reflection_vector_red=reflect(-light_direction_red,transformedNormal);" \
    "        light_direction_blue=vec3(u_lightPosition_blue-eyeCoordinates);" \
    "        reflection_vector_blue=reflect(-light_direction_blue,transformedNormal);" \
    "        light_direction_green=vec3(u_lightPosition_green-eyeCoordinates);" \
    "        reflection_vector_green=reflect(-light_direction_green,transformedNormal);" \
    "        viewer_vector=vec3(-eyeCoordinates);" \
    "    }" \
    "    else" \
    "    {" \
    "        white=vec3(1.0,1.0,1.0);" \
    "    }" \
    "gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" \
    "}";

    
    const GLchar *vertexShaderSourceCodePerVertex =
    "#version 330 core" \
    "\n" \
    "in vec4 vPosition;" \
    "in vec3 vNormal;" \
    "uniform mat4 u_m_matrix;" \
    "uniform mat4 u_v_matrix;" \
    "uniform mat4 u_p_matrix;" \
    "uniform vec3 u_la_red;" \
    "uniform vec3 u_ld_red;" \
    "uniform vec3 u_ls_red;" \
    "uniform vec4 u_lightPosition_red;" \
    "uniform vec3 u_la_blue;" \
    "uniform vec3 u_ld_blue;" \
    "uniform vec3 u_ls_blue;" \
    "uniform vec4 u_lightPosition_blue;" \
    "uniform vec3 u_la_green;" \
    "uniform vec3 u_ld_green;" \
    "uniform vec3 u_ls_green;" \
    "uniform vec4 u_lightPosition_green;" \
    "uniform vec3 u_ka;" \
    "uniform vec3 u_kd;" \
    "uniform vec3 u_ks;" \
    "uniform float u_materialShininess;" \
    "uniform int u_LkeyIsPressed;" \
    "out vec3 phong_ads_light;" \
    "void main(void)" \
    "{" \
    "    if(u_LkeyIsPressed==1)" \
    "    {" \
    "        vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" \
    "        mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" \
    "        vec3 transformedNormal=normalize(normalMatrix*vNormal);" \
    /*"        vec3 transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);" \*/
    "        vec3 light_direction_red=normalize(vec3(u_lightPosition_red-eyeCoordinates));" \
    "        float tn_dot_lightdirection_red=max(dot(light_direction_red,transformedNormal),0.0f);" \
    "        vec3 reflection_vector_red=reflect(-light_direction_red,transformedNormal);" \
    "        vec3 light_direction_blue=normalize(vec3(u_lightPosition_blue-eyeCoordinates));" \
    "        float tn_dot_lightdirection_blue=max(dot(light_direction_blue,transformedNormal),0.0f);" \
    "        vec3 reflection_vector_blue=reflect(-light_direction_blue,transformedNormal);" \
    "        vec3 light_direction_green=normalize(vec3(u_lightPosition_green-eyeCoordinates));" \
    "        float tn_dot_lightdirection_green=max(dot(light_direction_green,transformedNormal),0.0f);" \
    "        vec3 reflection_vector_green=reflect(-light_direction_green,transformedNormal);" \
    "        vec3 viewer_vector=normalize(vec3(-eyeCoordinates));" \
    "        vec3 ambient=u_la_red*u_ka;" \
    "        vec3 diffuse=u_ld_red*u_kd*tn_dot_lightdirection_red;" \
    "        vec3 specular=u_ls_red*u_ks*pow(max(dot(reflection_vector_red,viewer_vector),0.0f),u_materialShininess);" \
    "        phong_ads_light=ambient+diffuse+specular;" \
    "        ambient=u_la_blue*u_ka;" \
    "        diffuse=u_ld_blue*u_kd*tn_dot_lightdirection_blue;" \
    "        specular=u_ls_blue*u_ks*pow(max(dot(reflection_vector_blue,viewer_vector),0.0f),u_materialShininess);" \
    "        phong_ads_light=phong_ads_light+(ambient+diffuse+specular);" \
    "        ambient=u_la_green*u_ka;" \
    "        diffuse=u_ld_green*u_kd*tn_dot_lightdirection_green;" \
    "        specular=u_ls_green*u_ks*pow(max(dot(reflection_vector_green,viewer_vector),0.0f),u_materialShininess);" \
    "        phong_ads_light=phong_ads_light+(ambient+diffuse+specular);" \
    "    }" \
    "    else" \
    "    {" \
    "        phong_ads_light=vec3(1.0,1.0,1.0);" \
    "    }" \
    "gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" \
    "}";
    //specify above source code to vertexShaderObject
    if (gbIsVertexShader == false)
    {
        glShaderSource(gVertexShaderObject, 1,
                       (const GLchar**)&vertexShaderSourceCodePerFragment,
                       NULL);
        fprintf(gpFile,"\nvertexShaderSourceCodePerFragment attached to the shader source\n");
    }
    else
    {
        glShaderSource(gVertexShaderObject, 1,
                       (const GLchar**)&vertexShaderSourceCodePerVertex,
                       NULL);
        fprintf(gpFile,"\nvertexShaderSourceCodePerVertex attached to the shader source\n");
    }
    
    
    glCompileShader(gVertexShaderObject);
    GLint iShaderCompileStatus = 0;
    GLint iInfoLogLength = 0;
    GLchar *szInfoLog = NULL;
    
    glGetShaderiv(gVertexShaderObject,
                  GL_COMPILE_STATUS,
                  &iShaderCompileStatus);
    fprintf(gpFile,"\nValue of ivertex shader compile Status is : %d\n", iShaderCompileStatus);
    if (iShaderCompileStatus == GL_FALSE)
    {
        glGetShaderiv(gVertexShaderObject,
                      GL_INFO_LOG_LENGTH,
                      &iInfoLogLength);
        if (iInfoLogLength > 0)
        {
            szInfoLog = (GLchar*)malloc(iInfoLogLength);
            if (szInfoLog != NULL)
            {
                GLsizei writtened;
                glGetShaderInfoLog(gVertexShaderObject,
                                   iInfoLogLength,
                                   &writtened,
                                   szInfoLog);
                fprintf(gpFile,"Error in compiling vertex Shader : %hs\n", szInfoLog);
                free(szInfoLog);
                [self dealloc];
            }
        }
    }
    
    //define Fragment shader object
    gFragmentShaderObject = glCreateShader(GL_FRAGMENT_SHADER);
    
    //write fragment shader code
    const GLchar *fragmentShaderSourceCodePerFragment =
    "#version 330 core" \
    "\n" \
    "in vec3 light_direction_red;" \
    "in vec3 light_direction_blue;" \
    "in vec3 light_direction_green;" \
    "in vec3 reflection_vector_red;" \
    "in vec3 reflection_vector_blue;" \
    "in vec3 reflection_vector_green;" \
    "in vec3 viewer_vector;" \
    "in vec3 transformedNormal;" \
    "in vec3 white;" \
    "uniform vec3 u_la_red;" \
    "uniform vec3 u_ld_red;" \
    "uniform vec3 u_ls_red;" \
    "uniform vec3 u_la_blue;" \
    "uniform vec3 u_ld_blue;" \
    "uniform vec3 u_ls_blue;" \
    "uniform vec3 u_la_green;" \
    "uniform vec3 u_ld_green;" \
    "uniform vec3 u_ls_green;" \
    "uniform vec3 u_ka;" \
    "uniform vec3 u_kd;" \
    "uniform vec3 u_ks;" \
    "uniform float u_materialShininess;" \
    "uniform int u_LkeyIsPressed;" \
    "out vec4 FragColor;" \
    "void main(void)" \
    "{" \
    "    if(u_LkeyIsPressed==1)" \
    "    {" \
    "        vec3 normalized_tNormal=normalize(transformedNormal);" \
    "        vec3 normalized_light_direction_red=normalize(light_direction_red);" \
    "        vec3 normalized_reflection_vector_red=normalize(reflection_vector_red);" \
    "        vec3 normalized_light_direction_blue=normalize(light_direction_blue);" \
    "        vec3 normalized_reflection_vector_blue=normalize(reflection_vector_blue);" \
    "        vec3 normalized_light_direction_green=normalize(light_direction_green);" \
    "        vec3 normalized_reflection_vector_green=normalize(reflection_vector_green);" \
    "        vec3 normalized_viewer_vector=normalize(viewer_vector);" \
    "        float tn_dot_lightdirection_red=max(dot(normalized_light_direction_red,normalized_tNormal),0.0f);" \
    "        float tn_dot_lightdirection_blue=max(dot(normalized_light_direction_blue,normalized_tNormal),0.0f);" \
    "        float tn_dot_lightdirection_green=max(dot(normalized_light_direction_green,normalized_tNormal),0.0f);" \
    "        vec3 ambient=u_la_red*u_ka+u_la_blue*u_ka+u_la_green*u_ka;" \
    "        vec3 diffuse=u_ld_red*u_kd*tn_dot_lightdirection_red+u_ld_blue*u_kd*tn_dot_lightdirection_blue+u_ld_green*u_kd*tn_dot_lightdirection_green;" \
    "        vec3 specular=u_ls_red*u_ks*pow(max(dot(normalized_reflection_vector_red,normalized_viewer_vector),0.0f),u_materialShininess)+u_ls_blue*u_ks*pow(max(dot(normalized_reflection_vector_blue,normalized_viewer_vector),0.0f),u_materialShininess)+u_ls_green*u_ks*pow(max(dot(normalized_reflection_vector_green,normalized_viewer_vector),0.0f),u_materialShininess);" \
    "        vec3 phong_ads_light=ambient+diffuse+specular;" \
    "        FragColor=vec4(phong_ads_light,1.0);" \
    "    }" \
    "    else" \
    "    {" \
    "        FragColor=vec4(white,1.0);" \
    "    }" \
    "}";
    const GLchar *fragmentShaderSourceCodePerVertex =
    "#version 330 core" \
    "\n" \
    "in vec3 phong_ads_light;" \
    "uniform int u_LkeyIsPressed;" \
    "out vec4 FragColor;" \
    "void main(void)" \
    "{" \
    "    if(u_LkeyIsPressed==1)" \
    "    {" \
    "        FragColor=vec4(phong_ads_light,1.0);" \
    "    }" \
    "    else" \
    "    {" \
    "        FragColor=vec4(1.0,1.0,1.0,1.0);" \
    "    }" \
    "}";
    //specify above source code to FragmentShaderObject
    if (gbIsFragmentShader == false)
    {
        glShaderSource(gFragmentShaderObject, 1,
                       (const GLchar**)&fragmentShaderSourceCodePerVertex,
                       NULL);
        fprintf(gpFile,"\nfragmentShaderSourceCodePerVertex attached to the shader source\n");
    }
    else
    {
        glShaderSource(gFragmentShaderObject, 1,
                       (const GLchar**)&fragmentShaderSourceCodePerFragment,
                       NULL);
        fprintf(gpFile,"\nfragmentShaderSourceCodePerFragment attached to the shader source\n");
    }
    
    /*glShaderSource(gFragmentShaderObject, 1,
     (const GLchar**)&fragmentShaderSourceCodePerFragment,
     NULL);*/
    glCompileShader(gFragmentShaderObject);
    
    iShaderCompileStatus = 0;
    iInfoLogLength = 0;
    szInfoLog = NULL;
    
    glGetShaderiv(gFragmentShaderObject,
                  GL_COMPILE_STATUS,
                  &iShaderCompileStatus);
    fprintf(gpFile,"Value of ifragment shader compile Status is : %d\n", iShaderCompileStatus);
    if (iShaderCompileStatus == GL_FALSE)
    {
        glGetShaderiv(gFragmentShaderObject,
                      GL_INFO_LOG_LENGTH,
                      &iInfoLogLength);
        if (iInfoLogLength > 0)
        {
            szInfoLog = (GLchar*)malloc(iInfoLogLength);
            if (szInfoLog != NULL)
            {
                GLsizei writtened;
                glGetShaderInfoLog(gFragmentShaderObject,
                                   iInfoLogLength,
                                   &writtened,
                                   szInfoLog);
                fprintf(gpFile,"Error in compiling Fragment Shader : %s\n", szInfoLog);
                free(szInfoLog);
                [self dealloc];
                //DestroyWindow(ghHwnd);
            }
        }
    }
    
    //create Shader program object
    gShaderProgramObject = glCreateProgram();
    
    //attach vertex/fragment shaders
    glAttachShader(gShaderProgramObject,
                   gVertexShaderObject);
    glAttachShader(gShaderProgramObject,
                   gFragmentShaderObject);
    
    //prelinking binding to vertex attributes
    glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_POSITION, "vPosition");
    glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_NORMAL, "vNormal");
    
    //Link the shader program
    fprintf(gpFile,"\nattach comp\n");
    glLinkProgram(gShaderProgramObject);
    //ErrorCheck for linking
    
    GLint iProgramLinkStatus = 0;
    iInfoLogLength = 0;
    szInfoLog = NULL;
    
    glGetProgramiv(gShaderProgramObject,
                   GL_LINK_STATUS,
                   &iProgramLinkStatus);
    fprintf(gpFile,"Value of iProgramLinkStatus is : %d\n", iProgramLinkStatus);
    if (iProgramLinkStatus == GL_FALSE)
    {
        glGetProgramiv(gShaderProgramObject,
                       GL_INFO_LOG_LENGTH,
                       &iInfoLogLength);
        if (iInfoLogLength > 0)
        {
            szInfoLog = (GLchar*)malloc(iInfoLogLength);
            if (szInfoLog != NULL)
            {
                GLsizei writtened;
                glGetProgramInfoLog(gShaderProgramObject,
                                    iInfoLogLength,
                                    &writtened,
                                    szInfoLog);
                fprintf(gpFile,"Error in Linking Shader : %s\n", szInfoLog);
                free(szInfoLog);
               [self dealloc];
                //DestroyWindow(ghHwnd);
            }
        }
    }
    //post linking retrieving uniform location
    mUniform = glGetUniformLocation(gShaderProgramObject, "u_m_matrix");
    vUniform = glGetUniformLocation(gShaderProgramObject, "u_v_matrix");
    pUniform = glGetUniformLocation(gShaderProgramObject, "u_p_matrix");
    laUniform_red = glGetUniformLocation(gShaderProgramObject, "u_la_red");
    ldUniform_red = glGetUniformLocation(gShaderProgramObject, "u_ld_red");
    lsUniform_red = glGetUniformLocation(gShaderProgramObject, "u_ls_red");
    lightPositionUniform_red = glGetUniformLocation(gShaderProgramObject, "u_lightPosition_red");
    laUniform_blue = glGetUniformLocation(gShaderProgramObject, "u_la_blue");
    ldUniform_blue = glGetUniformLocation(gShaderProgramObject, "u_ld_blue");
    lsUniform_blue = glGetUniformLocation(gShaderProgramObject, "u_ls_blue");
    lightPositionUniform_blue = glGetUniformLocation(gShaderProgramObject, "u_lightPosition_blue");
    laUniform_green = glGetUniformLocation(gShaderProgramObject, "u_la_green");
    ldUniform_green = glGetUniformLocation(gShaderProgramObject, "u_ld_green");
    lsUniform_green = glGetUniformLocation(gShaderProgramObject, "u_ls_green");
    lightPositionUniform_green = glGetUniformLocation(gShaderProgramObject, "u_lightPosition_green");
    kaUniform = glGetUniformLocation(gShaderProgramObject, "u_ka");
    kdUniform = glGetUniformLocation(gShaderProgramObject, "u_kd");
    ksUniform = glGetUniformLocation(gShaderProgramObject, "u_ks");
    materialShininessUniform = glGetUniformLocation(gShaderProgramObject, "u_materialShininess");
    isLkeyPressedUniform = glGetUniformLocation(gShaderProgramObject, "u_LkeyIsPressed");
    
}

-(void)prepareOpenGL
{

    angle_rect = 0.0f;
    gbIsLighting = false;
    gbIsAnimation = false;
    gbIsVertexShader=true;
    gbIsFragmentShader=false;
    
    material_ambient[0]=0.5f;
    material_ambient[1]=0.5f;
    material_ambient[2]=0.5f;
    material_ambient[3]=0.0f;
    
    material_diffuse[0]=1.0f;
    material_diffuse[1]=1.0f;
    material_diffuse[2]=1.0f;
    material_diffuse[3]=1.0f;
    
    material_specular[0]=1.0f;
    material_specular[1]=1.0f;
    material_specular[2]=1.0f;
    material_specular[3]=1.0f;
    
    material_shininess[0]=128.0f;
    
    
    [sphere getSphereVertexData:sphere_vertices andArray1:sphere_normals andArray2:sphere_textures andArray3:sphere_elements];
    
    
    numVertices=[sphere getNumberOfSphereVertices];
    numElements=[sphere getNumberOfSphereElements];
    fprintf(gpFile,"OpenGL Version : %s\n",glGetString(GL_VERSION));
    fprintf(gpFile,"GLSL Version : %s\n",glGetString(GL_SHADING_LANGUAGE_VERSION));
    
    [[self openGLContext]makeCurrentContext];
    
    GLint swapInt=1;
    [[self openGLContext]setValues:&swapInt forParameter:NSOpenGLCPSwapInterval];
     
     [self ShadersToggle];
    glGenVertexArrays(1, &vao_sphere);
    glBindVertexArray(vao_sphere);
    glGenBuffers(1, &vbo_sphere_position);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_sphere_position);
    glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_vertices), sphere_vertices, GL_STATIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    
    glGenBuffers(1, &vbo_sphere_normal);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_sphere_normal);
    glBufferData(GL_ARRAY_BUFFER, sizeof(sphere_normals), sphere_normals, GL_STATIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_NORMAL);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glGenBuffers(1, &vbo_sphere_element);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphere_elements), sphere_elements, GL_STATIC_DRAW);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
    
    glBindVertexArray(0);
    /////////////////////////////////////////////////////////
    lights[0].LightAmbience[0] = 0.0f;
    lights[0].LightAmbience[1] = 0.0f;
    lights[0].LightAmbience[2] = 0.0f;
    lights[0].LightAmbience[3] = 1.0f;
    
    lights[0].LightDiffuse[0] = 1.0f;
    lights[0].LightDiffuse[1] = 0.0f;
    lights[0].LightDiffuse[2] = 0.0f;
    lights[0].LightDiffuse[3] = 1.0f;
    
    lights[0].LightSpecular[0] = 1.0f;
    lights[0].LightSpecular[1] = 0.0f;
    lights[0].LightSpecular[2] = 0.0f;
    lights[0].LightSpecular[3] = 1.0f;
    
    lights[1].LightAmbience[0] = 0.0f;
    lights[1].LightAmbience[1] = 0.0f;
    lights[1].LightAmbience[2] = 0.0f;
    lights[1].LightAmbience[3] = 1.0f;
    
    lights[1].LightDiffuse[0] = 0.0f;
    lights[1].LightDiffuse[1] = 1.0f;
    lights[1].LightDiffuse[2] = 0.0f;
    lights[1].LightDiffuse[3] = 1.0f;
    
    lights[1].LightSpecular[0] = 0.0f;
    lights[1].LightSpecular[1] = 1.0f;
    lights[1].LightSpecular[2] = 0.0f;
    lights[1].LightSpecular[3] = 1.0f;
    
    lights[2].LightAmbience[0] = 0.0f;
    lights[2].LightAmbience[1] = 0.0f;
    lights[2].LightAmbience[2] = 0.0f;
    lights[2].LightAmbience[3] = 1.0f;
    
    lights[2].LightDiffuse[0] = 0.0f;
    lights[2].LightDiffuse[1] = 0.0f;
    lights[2].LightDiffuse[2] = 1.0f;
    lights[2].LightDiffuse[3] = 1.0f;
    
    lights[2].LightSpecular[0] = 0.0f;
    lights[2].LightSpecular[1] = 0.0f;
    lights[2].LightSpecular[2] = 1.0f;
    lights[2].LightSpecular[3] = 1.0f;
    
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClearDepth(1.0f);
    projectionMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    modelMatrix = vmath::mat4::identity();
    [self reshape];
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LEQUAL);

    
    CVDisplayLinkCreateWithActiveCGDisplays(&displayLink);
    CVDisplayLinkSetOutputCallback(displayLink,&MyDisplayLinkCallback,self);
    CGLContextObj cglContext=(CGLContextObj)[[self openGLContext]CGLContextObj];
    CGLPixelFormatObj cglPixelFormat=(CGLPixelFormatObj)[[self pixelFormat]CGLPixelFormatObj];
    CVDisplayLinkSetCurrentCGDisplayFromOpenGLContext(displayLink,cglContext,cglPixelFormat);
    CVDisplayLinkStart(displayLink);
}


-(void)reshape
{
    CGLLockContext((CGLContextObj)[[self openGLContext]CGLContextObj]);
    
    NSRect rect=[self bounds];
    
    GLfloat width=rect.size.width;
    GLfloat height=rect.size.height;
    
    if(height==0)
        height=1;
    
    glViewport(0,0,(GLsizei)width,(GLsizei)height);
    projectionMatrix=vmath::perspective(45.0f,
                                            (GLfloat)width / (GLfloat)height,
                                            0.1f,
                                            100.0f);
    CGLUnlockContext((CGLContextObj)[[self openGLContext] CGLContextObj]);
}

-(void)drawRect:(NSRect)dirtyRect
{
    [self drawView];
}


-(void)drawView
{
    [[self openGLContext]makeCurrentContext];
    CGLLockContext((CGLContextObj)[[self openGLContext]CGLContextObj]);
    glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT);
    
    glUseProgram(gShaderProgramObject);
    //declaration of matrices
    vmath::mat4 translationMatrix;
    vmath::mat4 rotationMatrix;
    //initialize above to identity
    translationMatrix = vmath::mat4::identity();
    rotationMatrix = vmath::mat4::identity();
    //do necessary transformation
    translationMatrix = vmath::translate(0.0f,0.0f,-3.0f);
    modelMatrix = translationMatrix;
    //do necessary matrix multiplication
    if (gbIsLighting == true)
    {
        glUniform1i(isLkeyPressedUniform, 1);
        //rotationMatrix=rotate(lights[0].angle, 1.0f, 0.0f, 0.0f);
        /*lights[0].LightPosition[2] = cos(lights[0].angle) + sin(lights[0].angle);
         lights[0].LightPosition[1] = cos(lights[0].angle)- sin(lights[0].angle);
         lights[0].LightPosition[0] = 1.0f;
         lights[0].LightPosition[3] = 1.0f;*/
        /*lights[0].LightPosition[1] = 100.0f*cos(lights[0].angle);
         lights[0].LightPosition[2] = 100.0f + lights[1].angle;*/
        lights[0].LightPosition[0] = 0.0f;
        lights[0].LightPosition[1] = 100.0f*sin(lights[0].angle);
        lights[0].LightPosition[2] = 100.0f*cos(lights[0].angle);
        lights[0].LightPosition[3] = 1.0f;
        glUniform3fv(laUniform_red, 1, lights[0].LightAmbience);
        glUniform3fv(ldUniform_red, 1, lights[0].LightDiffuse);
        glUniform3fv(lsUniform_red, 1, lights[0].LightSpecular);
        glUniform4fv(lightPositionUniform_red, 1,lights[0].LightPosition);
        //rotationMatrix = rotationMatrix +rotate(lights[1].angle, 0.0f, 1.0f, 0.0f);
        /*lights[1].LightPosition[1] = 1.0f;
         lights[1].LightPosition[3] = 1.0f;
         lights[1].LightPosition[0] =-sin(lights[1].angle)+ cos(lights[1].angle);
         lights[1].LightPosition[2] = sin(lights[1].angle) + cos(lights[1].angle);*/
        /*lights[1].LightPosition[2] = 100.0f*sin(lights[1].angle);
         lights[1].LightPosition[0] = 100.0f + lights[1].angle;*/
        lights[1].LightPosition[0] = 100.0f*sin(lights[1].angle);
        lights[1].LightPosition[1] = 0.0f;
        lights[1].LightPosition[2] = 100.0f*cos(lights[1].angle);
        lights[1].LightPosition[3] = 1.0f;
        glUniform3fv(laUniform_blue, 1, lights[1].LightAmbience);
        glUniform3fv(ldUniform_blue, 1, lights[1].LightDiffuse);
        glUniform3fv(lsUniform_blue, 1, lights[1].LightSpecular);
        glUniform4fv(lightPositionUniform_blue, 1, lights[1].LightPosition);
        //rotationMatrix= rotationMatrix +rotate(lights[2].angle, 0.0f, 0.0f, 1.0f);
        /*lights[2].LightPosition[2] = 1.0f;
         lights[2].LightPosition[3] = 1.0f;
         lights[2].LightPosition[0] = cos(lights[2].angle)+sin(lights[2].angle);
         lights[2].LightPosition[1] = sin(lights[2].angle) + cos(lights[2].angle);*/
        /*lights[2].LightPosition[0] = 100.0f*(sin(lights[2].angle)* cos(lights[2].angle));
         lights[2].LightPosition[1] = 100.0f+lights[1].angle;*/
        lights[2].LightPosition[0] = 100.0f*sin(lights[2].angle);
        lights[2].LightPosition[1] = 100.0f*cos(lights[2].angle);
        lights[2].LightPosition[2] = 0.0f;
        lights[2].LightPosition[3] = 1.0f;
        glUniform3fv(laUniform_green, 1, lights[2].LightAmbience);
        glUniform3fv(ldUniform_green, 1, lights[2].LightDiffuse);
        glUniform3fv(lsUniform_green, 1, lights[2].LightSpecular);
        glUniform4fv(lightPositionUniform_green, 1, lights[2].LightPosition);
        glUniform3fv(kaUniform, 1, material_ambient);
        glUniform3fv(kdUniform, 1, material_diffuse);
        glUniform3fv(ksUniform, 1, material_specular);
        glUniform1fv(materialShininessUniform, 1, material_shininess);
        //modelMatrix = modelMatrix * rotationMatrix;
    }
    else
    {
        glUniform1i(isLkeyPressedUniform, 0);
    }
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    
    // *** unbind vao ***
    glBindVertexArray(0);
    //unuse program
    glUseProgram(0);

    [self update];
    CGLFlushDrawable((CGLContextObj)[[self openGLContext]CGLContextObj]);
    CGLUnlockContext((CGLContextObj)[[self openGLContext]CGLContextObj]);
    
}

-(void)update
{
    if (lights[0].angle >= 360.0f)
        lights[0].angle = 0.0f;
    else
        lights[0].angle += 0.01f;
    
    if (lights[1].angle >= 360.0f)
        lights[1].angle = 0.0f;
    else
        lights[1].angle += 0.01f;
    
    if (lights[2].angle >= 360.0f)
        lights[2].angle = 0.0f;
    else
        lights[2].angle += 0.01f;
}

-(BOOL)acceptsFirstResponder
{
    [[self window]makeFirstResponder:self];
    return(YES);
    
}

-(void)keyDown:(NSEvent *)theEvent
{
    int key=(int)[[theEvent characters]characterAtIndex:0];
    switch(key)
    {
        case 'Q':
        case 'q':
            [self release];
            [NSApp terminate:self];
            break;
            
        case 27:
            [[self window]toggleFullScreen:self];
            break;
        case 'L':case 'l':
            if (gbIsLighting == false)
            {
                gbIsLighting = true;
            }
            else
            {
                gbIsLighting = false;
                //glUniform1i(isLkeyPressedUniform, 0);
            }
            break;
        case 'a':case 'A':
            if (gbIsAnimation == false)
            {
                gbIsAnimation = true;
            }
            else
            {
                gbIsAnimation = false;
            }
            break;
        case 'v':case 'V':
            if (gbIsVertexShader == false)
            {
                gbIsVertexShader = true;
                gbIsFragmentShader = false;
            }
            fprintf(gpFile, "\nV key is pressed\n");
            [self ShadersToggle];
            break;
        case 'f':case 'F':
            if (gbIsFragmentShader == false)
            {
                gbIsVertexShader = false;
                gbIsFragmentShader = true;
            }
            fprintf(gpFile, "\nV key is pressed\n");
            [self ShadersToggle];
            break;
        default:
            break;
    }
    
}

-(void)mouseDown:(NSEvent *)theEvent
{
    
}

-(void)mouseDragged:(NSEvent *)theEvent
{
    
}

-(void)rightMouseDown:(NSEvent *)theEvent
{
    
}

-(void)dealloc
{
    
    if (vbo_sphere_normal)
    {
        glDeleteBuffers(1, &vbo_sphere_normal);
        vbo_sphere_normal = 0;
    }
    if (vbo_sphere_element)
    {
        glDeleteBuffers(1, &vbo_sphere_element);
        vbo_sphere_element = 0;
    }
    
    if (vbo_sphere_position)
    {
        glDeleteBuffers(1, &vbo_sphere_position);
        vbo_sphere_position = 0;
    }
    
    
    if (vao_sphere)
    {
        glDeleteVertexArrays(1, &vao_sphere);
        vao_sphere = 0;
    }

    glUseProgram(gShaderProgramObject);
    glDetachShader(gShaderProgramObject, GL_FRAGMENT_SHADER);
    glDetachShader(gShaderProgramObject, GL_VERTEX_SHADER);
    glDeleteShader(gFragmentShaderObject);
    gFragmentShaderObject = 0;
    glDeleteShader(gVertexShaderObject);
    gVertexShaderObject = 0;
    glDeleteProgram(gShaderProgramObject);
    gShaderProgramObject = 0;
    glUseProgram(0);
    
    if (gpFile)
    {
        fprintf(gpFile, "Log File is Closed\n========================================================================\n");
        fclose(gpFile);
        gpFile = NULL;
    }
    
    
    CVDisplayLinkStop(displayLink);
    CVDisplayLinkRelease(displayLink);
    
    
    
    [super dealloc];
}

@end

CVReturn MyDisplayLinkCallback(CVDisplayLinkRef displayLink, const CVTimeStamp *pNow, const CVTimeStamp *pOutputTime,CVOptionFlags flagsIn,CVOptionFlags *pFlagsOut, void *pDisplayLinkContext)
{
    CVReturn result=[(GLView *)pDisplayLinkContext getFrameForTime:pOutputTime];
    return(result);
}
