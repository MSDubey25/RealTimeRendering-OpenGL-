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
    GLuint laUniform;
    GLuint ldUniform;
    GLuint lsUniform;
    GLuint lightPositionUniform;
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
    "#version 330 core" \
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
    "uniform float u_materialShininess;" \
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
    "        vec3 specular=u_ls*u_ks*pow(max(dot(reflection_vector,viewer_vector),0.0f),u_materialShininess);" \
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
    "#version 330 core" \
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
    "uniform float u_materialShininess;" \
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
    "        vec3 specular=u_ls*u_ks*pow(max(dot(normalized_reflection_vector,normalized_viewer_vector),0.0f),u_materialShininess);" \
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
    laUniform = glGetUniformLocation(gShaderProgramObject, "u_la");
    ldUniform = glGetUniformLocation(gShaderProgramObject, "u_ld");
    lsUniform = glGetUniformLocation(gShaderProgramObject, "u_ls");
    lightPositionUniform = glGetUniformLocation(gShaderProgramObject, "u_lightPosition");
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
    
    light_ambient[0]=0.0f;
    light_ambient[1]=0.0f;
    light_ambient[2]=0.0f;
    light_ambient[3]=0.0f;
    
    light_diffuse[0]=1.0f;
    light_diffuse[1]=1.0f;
    light_diffuse[2]=1.0f;
    light_diffuse[3]=1.0f;
    
    light_specular[0]=1.0f;
    light_specular[1]=1.0f;
    light_specular[2]=1.0f;
    light_specular[3]=1.0f;
    
    light_position[0]=100.0f;
    light_position[1]=100.0f;
    light_position[2]=100.0f;
    light_position[3]=1.0f;
    
    material_ambient[0]=0.0f;
    material_ambient[1]=0.0f;
    material_ambient[2]=0.0f;
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
    //initialize above to identity
    translationMatrix = vmath::mat4::identity();
    //do necessary transformation
    translationMatrix = vmath::translate(0.0f,0.0f,-4.0f);
    modelMatrix = translationMatrix;
    //do necessary matrix multiplication
    if (gbIsLighting == true)
    {
        glUniform1i(isLkeyPressedUniform, 1);
        glUniform3fv(laUniform, 1, light_ambient);
        glUniform3fv(ldUniform, 1, light_diffuse);
        glUniform3fv(lsUniform, 1, light_specular);
        glUniform4fv(lightPositionUniform, 1,light_position);
        glUniform3fv(kaUniform, 1, material_ambient);
        glUniform3fv(kdUniform, 1, material_diffuse);
        glUniform3fv(ksUniform, 1, material_specular);
        glUniform1fv(materialShininessUniform, 1.0f, material_shininess);
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

    
    CGLFlushDrawable((CGLContextObj)[[self openGLContext]CGLContextObj]);
    CGLUnlockContext((CGLContextObj)[[self openGLContext]CGLContextObj]);
    
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
