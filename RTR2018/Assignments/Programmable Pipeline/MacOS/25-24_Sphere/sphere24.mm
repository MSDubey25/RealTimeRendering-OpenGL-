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
    [window setTitle:@"macOS Diffuse 24 Sphere"];
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
    GLuint laUniform;
    GLuint ldUniform;
    GLuint lsUniform;
    GLuint lightPositionUniform;
    GLuint kaUniform;
    GLuint kdUniform;
    GLuint ksUniform;
    GLuint MaterialShininessUniform;
    GLuint isLkeyPressedUniform;

    vmath::mat4 translationMatrix;
    vmath::mat4 scaleMatrix;
    vmath::mat4 rotationMatrix;
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

    float light_ambient[4];
    float light_diffuse[4];
    float light_specular[4];
    float light_position[4];
    
    float material_ambient[4];
    float material_diffuse[4];
    float material_specular[4];
    float material_shininess[1];
    
    bool gbIsVertexShader;
    bool gbIsFragmentShader;
    
    int currentWidth;
    int currentHeight;
    
    GLint keyPress;
    GLfloat angleOfXRotation;
    GLfloat angleOfYRotation;
    GLfloat angleOfZRotation;

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
    "#version 410 core" \
    "\n" \
    "in vec4 vPosition;" \
    "in vec3 vNormal;" \
    "uniform mat4 u_m_matrix;" \
    "uniform mat4 u_v_matrix;" \
    "uniform mat4 u_p_matrix;" \
    "uniform vec4 u_lightPosition;" \
    "uniform int u_LkeyIsPressed;" \
    "out vec3 light_direction;" \
    "out vec3 reflection_vector;" \
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
    "        light_direction=vec3(u_lightPosition-eyeCoordinates);" \
    "        reflection_vector=reflect(-light_direction,transformedNormal);" \
    "        viewer_vector=vec3(-eyeCoordinates);" \
    "    }" \
    "    else" \
    "    {" \
    "        white=vec3(1.0,1.0,1.0);" \
    "    }" \
    "gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" \
    "}";
    
    const GLchar *vertexShaderSourceCodePerVertex =
    "#version 410 core" \
    "\n" \
    "in vec4 vPosition;" \
    "in vec3 vNormal;" \
    "uniform mat4 u_m_matrix;" \
    "uniform mat4 u_v_matrix;" \
    "uniform mat4 u_p_matrix;" \
    "uniform vec3 u_la;" \
    "uniform vec3 u_ld;" \
    "uniform vec3 u_ls;" \
    "uniform vec4 u_lightPosition;" \
    "uniform vec3 u_ka;" \
    "uniform vec3 u_kd;" \
    "uniform vec3 u_ks;" \
    "uniform float u_MaterialShininess;" \
    "uniform int u_LkeyIsPressed;" \
    "out vec3 phong_ads_light;" \
    "void main(void)" \
    "{" \
    "    if(u_LkeyIsPressed==1)" \
    "    {" \
    "        vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" \
    /*"        mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" \
     "        vec3 transformedNormal=normalize(normalMatrix*vNormal);" \*/
    "        vec3 transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);" \
    "        vec3 light_direction=normalize(vec3(u_lightPosition-eyeCoordinates));" \
    "        float tn_dot_lightdirection=max(dot(light_direction,transformedNormal),0.0f);" \
    "        vec3 reflection_vector=reflect(-light_direction,transformedNormal);" \
    "        vec3 viewer_vector=normalize(vec3(-eyeCoordinates));" \
    "        vec3 ambient=u_la*u_ka;" \
    "        vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;" \
    "        vec3 specular=u_ls*u_ks*pow(max(dot(reflection_vector,viewer_vector),0.0f),u_MaterialShininess);" \
    "        phong_ads_light=ambient+diffuse+specular;" \
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
    "#version 410 core" \
    "\n" \
    "in vec3 light_direction;" \
    "in vec3 reflection_vector;" \
    "in vec3 viewer_vector;" \
    "in vec3 transformedNormal;" \
    "in vec3 white;" \
    "uniform vec3 u_la;" \
    "uniform vec3 u_ld;" \
    "uniform vec3 u_ls;" \
    "uniform vec3 u_ka;" \
    "uniform vec3 u_kd;" \
    "uniform vec3 u_ks;" \
    "uniform float u_MaterialShininess;" \
    "uniform int u_LkeyIsPressed;" \
    "out vec4 FragColor;" \
    "void main(void)" \
    "{" \
    "    if(u_LkeyIsPressed==1)" \
    "    {" \
    "        vec3 normalized_tNormal=normalize(transformedNormal);" \
    "        vec3 normalized_light_direction=normalize(light_direction);" \
    "        vec3 normalized_reflection_vector=normalize(reflection_vector);" \
    "        vec3 normalized_viewer_vector=normalize(viewer_vector);" \
    "        float tn_dot_lightdirection=max(dot(normalized_light_direction,normalized_tNormal),0.0f);" \
    "        vec3 ambient=u_la*u_ka;" \
    "        vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;" \
    "        vec3 specular=u_ls*u_ks*pow(max(dot(normalized_reflection_vector,normalized_viewer_vector),0.0f),u_MaterialShininess);" \
    "        vec3 phong_ads_light=ambient+diffuse+specular;" \
    "        FragColor=vec4(phong_ads_light,1.0);" \
    "    }" \
    "    else" \
    "    {" \
    "        FragColor=vec4(white,1.0);" \
    "    }" \
    "}";
    
    const GLchar *fragmentShaderSourceCodePerVertex =
    "#version 410 core" \
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
    "}";    //specify above source code to FragmentShaderObject
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
    laUniform = glGetUniformLocation(gShaderProgramObject, "u_la");
    ldUniform = glGetUniformLocation(gShaderProgramObject, "u_ld");
    lsUniform = glGetUniformLocation(gShaderProgramObject, "u_ls");
    lightPositionUniform = glGetUniformLocation(gShaderProgramObject, "u_lightPosition");
    kaUniform = glGetUniformLocation(gShaderProgramObject, "u_ka");
    kdUniform = glGetUniformLocation(gShaderProgramObject, "u_kd");
    ksUniform = glGetUniformLocation(gShaderProgramObject, "u_ks");
    MaterialShininessUniform = glGetUniformLocation(gShaderProgramObject, "u_MaterialShininess");
    isLkeyPressedUniform = glGetUniformLocation(gShaderProgramObject, "u_LkeyIsPressed");
}

-(void)prepareOpenGL
{

    keyPress=0;
    angleOfXRotation = 0.0f;
    angleOfYRotation = 0.0f;
    angleOfZRotation = 0.0f;
    angle_rect = 0.0f;
    gbIsLighting = false;
    gbIsAnimation = false;
    gbIsVertexShader=true;
    gbIsFragmentShader=false;
    
    light_ambient[0]=0.5f;
    light_ambient[1]=0.5f;
    light_ambient[2]=0.5f;
    light_ambient[3]=0.0f;
    
    light_diffuse[0]=1.0f;
    light_diffuse[1]=1.0f;
    light_diffuse[2]=1.0f;
    light_diffuse[3]=1.0f;
    
    light_specular[0]=1.0f;
    light_specular[1]=1.0f;
    light_specular[2]=1.0f;
    light_specular[3]=1.0f;
    
    light_position[0]=0.0f;
    light_position[1]=0.0f;
    light_position[2]=0.0f;
    light_position[3]=1.0f;
    
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
    
    glClearColor(0.25f, 0.25f, 0.25f, 1.0f);
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
    currentWidth = width;
    currentHeight = height;
    
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
    //initialize above to identity
    translationMatrix = vmath::mat4::identity();
    scaleMatrix = vmath::mat4::identity();
    rotationMatrix = vmath::mat4::identity();
    //do necessary transformation
    //scaleMatrix = scale(2.25f,2.25f,2.25f);
    translationMatrix = vmath::translate(0.0f,0.0f,-10.0f);
    modelMatrix = translationMatrix*scaleMatrix;
    //do necessary matrix multiplication
    if (gbIsLighting == true)
    {
        glUniform1i(isLkeyPressedUniform, 1);
        glUniform3fv(laUniform, 1, light_ambient);
        glUniform3fv(ldUniform, 1, light_diffuse);
        glUniform3fv(lsUniform, 1, light_specular);
        
        glUniform3fv(kaUniform, 1, material_ambient);
        glUniform3fv(kdUniform, 1, material_diffuse);
        glUniform3fv(ksUniform, 1, material_specular);
        glUniform1fv(MaterialShininessUniform, 1, material_shininess);
        //glLightModelfv(GL_LIGHT_MODEL_AMBIENT, light_Model_Ambient);
        //glLightModelfv(GL_LIGHT_MODEL_LOCAL_VIEWER, light_Model_Local_Viewer);
        if (keyPress == 1 || keyPress==0)
        {
            //rotationMatrix = rotate(angleOfXRotation, 1.0f, 0.0f, 0.0f);
            light_position[0] = 0.0f;
            light_position[1] = 100.0f*sin(angleOfYRotation);
            light_position[2] = 100.0f*cos(angleOfYRotation);
            light_position[3] = 1.0f;
        }
        else if (keyPress == 2)
        {
            //rotationMatrix=rotate(angleOfYRotation, 0.0f, 1.0f, 0.0f);
            light_position[0] = 100.0f*sin(angleOfYRotation);
            light_position[1] = 0.0f;
            light_position[2] = 100.0f*cos(angleOfYRotation);
            light_position[3] = 1.0f;
        }
        else if (keyPress == 3)
        {
            //rotationMatrix = rotate(angleOfZRotation, 0.0f, 0.0f, 1.0f);
            light_position[0] = 100.0f*sin(angleOfYRotation);
            light_position[1] = 100.0f*cos(angleOfYRotation);
            light_position[2] = 0.0f;
            light_position[3] = 1.0f;
        }
        glUniform4fv(lightPositionUniform, 1, light_position);
    }
    else
    {
        glUniform1i(isLkeyPressedUniform, 0);
    }
    
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    [self draw24Sphere];

    //unuse program
    glUseProgram(0);

    [self update];
    CGLFlushDrawable((CGLContextObj)[[self openGLContext]CGLContextObj]);
    CGLUnlockContext((CGLContextObj)[[self openGLContext]CGLContextObj]);
    
}
-(void)draw24Sphere
{
    float MaterialAmbience[4];
    float MaterialDiffuse[4];
    float MaterialSpecular[4];
    float MaterialShininess[1];
    
    //1st sphere on 1st column Emerald
    MaterialAmbience[0] = 0.0215f;
    MaterialAmbience[1] = 0.1745f;
    MaterialAmbience[2] = 0.0215f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.7568f;
    MaterialDiffuse[1] = 0.61424f;
    MaterialDiffuse[2] = 0.07568f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.633f;
    MaterialSpecular[1] = 0.727811f;
    MaterialSpecular[2] = 0.633f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.6*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    scaleMatrix = vmath::mat4::identity();
    translationMatrix = vmath::mat4::identity();
    //translationMatrix = translate(-150.0f, 80.0f, -10.0f);
    translationMatrix = vmath::translate(-0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(20.0f, 20.0f, 20.0f);
    glViewport(0, 700, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
  
    // *** bind vao ***z
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //2nd sphere on 1st column jade
    MaterialAmbience[0] = 0.135f;
    MaterialAmbience[1] = 0.2225f;
    MaterialAmbience[2] = 0.1575f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.54f;
    MaterialDiffuse[1] = 0.89f;
    MaterialDiffuse[2] = 0.63f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.316228f;
    MaterialSpecular[1] = 0.316228f;
    MaterialSpecular[2] = 0.316228f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.1*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(0, 575, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    //    glViewport(600, 100, 220, 220);
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    
    //3rd sphere on 1st column obsidien
    MaterialAmbience[0] = 0.05375f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.06625f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.18275f;
    MaterialDiffuse[1] = 0.17f;
    MaterialDiffuse[2] = 0.22525f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.332741f;
    MaterialSpecular[1] = 0.328634f;
    MaterialSpecular[2] = 0.346435f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.3*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(0, 450, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //4th sphere on 1st column pearl
    MaterialAmbience[0] = 0.25f;
    MaterialAmbience[1] = 0.20725f;
    MaterialAmbience[2] = 0.20725f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 1.0f;
    MaterialDiffuse[1] = 0.829f;
    MaterialDiffuse[2] = 0.829f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.296648f;
    MaterialSpecular[1] = 0.296648f;
    MaterialSpecular[2] = 0.296648f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.088*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(0, 325, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //5th sphere on 1st column ruby
    MaterialAmbience[0] = 0.1745f;
    MaterialAmbience[1] = 0.01175f;
    MaterialAmbience[2] = 0.01175f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.61424f;
    MaterialDiffuse[1] = 0.04136f;
    MaterialDiffuse[2] = 0.04136f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.727811f;
    MaterialSpecular[1] = 0.626959f;
    MaterialSpecular[2] = 0.626959f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.6*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(0, 200, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //6th sphere on 1st column turquoise
    MaterialAmbience[0] = 0.1f;
    MaterialAmbience[1] = 0.18725f;
    MaterialAmbience[2] = 0.1745f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.396f;
    MaterialDiffuse[1] = 0.74151f;
    MaterialDiffuse[2] = 0.69102f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.297254f;
    MaterialSpecular[1] = 0.30829f;
    MaterialSpecular[2] = 0.306678f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.1*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    glViewport(0, 75, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //1st sphere on 2nd column brass
    MaterialAmbience[0] = 0.329412f;
    MaterialAmbience[1] = 0.223529f;
    MaterialAmbience[2] = 0.027451f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.780392f;
    MaterialDiffuse[1] = 0.568627f;
    MaterialDiffuse[2] = 0.113725f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.992157f;
    MaterialSpecular[1] = 0.941176f;
    MaterialSpecular[2] = 0.807843f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.21794872*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(350, 700, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
        // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //2nd sphere on 2nd column bronze
    MaterialAmbience[0] = 0.2125f;
    MaterialAmbience[1] = 0.1275f;
    MaterialAmbience[2] = 0.054f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.714f;
    MaterialDiffuse[1] = 0.4284f;
    MaterialDiffuse[2] = 0.18144f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.393548f;
    MaterialSpecular[1] = 0.271906f;
    MaterialSpecular[2] = 0.166721f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialShininess[0] = 0.2*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(350, 575, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
   
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //3rd sphere on 2nd column chrome
    MaterialAmbience[0] = 0.25f;
    MaterialAmbience[1] = 0.25f;
    MaterialAmbience[2] = 0.25f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.4f;
    MaterialDiffuse[1] = 0.4f;
    MaterialDiffuse[2] = 0.4f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.774597f;
    MaterialSpecular[1] = 0.774597f;
    MaterialSpecular[2] = 0.774597f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.6*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(350, 450, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
  
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //4th sphere on 2nd column copper
    MaterialAmbience[0] = 0.19125f;
    MaterialAmbience[1] = 0.0735f;
    MaterialAmbience[2] = 0.0225f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.7038f;
    MaterialDiffuse[1] = 0.27048f;
    MaterialDiffuse[2] = 0.0828f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.256777f;
    MaterialSpecular[1] = 0.137622f;
    MaterialSpecular[2] = 0.086014f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.1*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(350, 325, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
  
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //5th sphere on 2nd column gold
    MaterialAmbience[0] = 0.24725f;
    MaterialAmbience[1] = 0.1995f;
    MaterialAmbience[2] = 0.0745f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.75164f;
    MaterialDiffuse[1] = 0.60648f;
    MaterialDiffuse[2] = 0.22648f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.628281f;
    MaterialSpecular[1] = 0.555802f;
    MaterialSpecular[2] = 0.366065f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.4*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(350, 200, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //6th sphere on 2nd column silver
    MaterialAmbience[0] = 0.19225f;
    MaterialAmbience[1] = 0.19225f;
    MaterialAmbience[2] = 0.19225f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.50754f;
    MaterialDiffuse[1] = 0.50754f;
    MaterialDiffuse[2] = 0.50754f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.508273f;
    MaterialSpecular[1] = 0.508273f;
    MaterialSpecular[2] = 0.508273f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.4*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(350, 75, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //1st sphere on 3rd column black plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.01f;
    MaterialDiffuse[1] = 0.01f;
    MaterialDiffuse[2] = 0.01f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.50f;
    MaterialSpecular[1] = 0.50f;
    MaterialSpecular[2] = 0.50f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(700, 700, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //2nd sphere on 3rd column cyan plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.1f;
    MaterialAmbience[2] = 0.06f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.0f;
    MaterialDiffuse[1] = 0.50980392f;
    MaterialDiffuse[2] = 0.50980392f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.50196078f;
    MaterialSpecular[1] = 0.50196078f;
    MaterialSpecular[2] = 0.50196078f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(700, 575, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
   
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //3rd sphere on 3rd column green plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.1f;
    MaterialDiffuse[1] = 0.35f;
    MaterialDiffuse[2] = 0.1f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.45f;
    MaterialSpecular[1] = 0.55f;
    MaterialSpecular[2] = 0.45f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(700, 450, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //4th sphere on 3rd column red plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.0f;
    MaterialDiffuse[2] = 0.0f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.7f;
    MaterialSpecular[1] = 0.6f;
    MaterialSpecular[2] = 0.6f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(700, 325, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //5th sphere on 3rd column white plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.55f;
    MaterialDiffuse[1] = 0.55f;
    MaterialDiffuse[2] = 0.55f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.70f;
    MaterialSpecular[1] = 0.70f;
    MaterialSpecular[2] = 0.70f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(700, 200, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //6th sphere on 3rd column yellow plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.0f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.60f;
    MaterialSpecular[1] = 0.60f;
    MaterialSpecular[2] = 0.50f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(700, 75, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //1st sphere on 4th column black rubber
    MaterialAmbience[0] = 0.02f;
    MaterialAmbience[1] = 0.02f;
    MaterialAmbience[2] = 0.02f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.01f;
    MaterialDiffuse[1] = 0.01f;
    MaterialDiffuse[2] = 0.01f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.40f;
    MaterialSpecular[1] = 0.40f;
    MaterialSpecular[2] = 0.40f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(1050, 700, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //2nd sphere on 4th column cyan rubber
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.05f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.4f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.5f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.04f;
    MaterialSpecular[1] = 0.7f;
    MaterialSpecular[2] = 0.7f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(1050, 575, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //3rd sphere on 4th column green rubber
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.4f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.4f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.04f;
    MaterialSpecular[1] = 0.7f;
    MaterialSpecular[2] = 0.04f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(1050, 450, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //4th sphere on 4th column red rubber
    MaterialAmbience[0] = 0.05f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.4f;
    MaterialDiffuse[2] = 0.4f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.7f;
    MaterialSpecular[1] = 0.04f;
    MaterialSpecular[2] = 0.04f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(1050, 325, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //5th sphere on 4th column white rubber
    MaterialAmbience[0] = 0.05f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.05f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.5f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.70f;
    MaterialSpecular[1] = 0.70f;
    MaterialSpecular[2] = 0.70f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(1050, 200, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //6th sphere on 4th column yellow rubber
    MaterialAmbience[0] = 0.05f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.4f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.7f;
    MaterialSpecular[1] = 0.7f;
    MaterialSpecular[2] = 0.04f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    modelMatrix = vmath::mat4::identity();
    viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(1050, 75, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mUniform, 1, GL_FALSE, modelMatrix);
    glUniformMatrix4fv(vUniform, 1, GL_FALSE, viewMatrix);
    glUniformMatrix4fv(pUniform, 1, GL_FALSE, projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
}

-(void)update
{
    if (angleOfYRotation >= 360.0f)
        angleOfYRotation = 0.0f;
    else
        angleOfYRotation += 0.1f;}

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
        case 'X':case 'x':
            keyPress = 1;
            angleOfXRotation = 0.0f;
            break;
        case 'Y':case 'y':
            keyPress = 2;
            angleOfYRotation = 0.0f;
            break;
        case 'Z':case 'z':
            keyPress = 3;
            angleOfZRotation = 0.0f;
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
