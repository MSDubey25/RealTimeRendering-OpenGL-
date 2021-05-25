#import<Foundation/Foundation.h>
#import<Cocoa/Cocoa.h>

#import<QuartzCore/CVDisplayLink.h>

#import<OpenGL/gl3.h>
#import<OpenGL/gl3ext.h>
#import "vmath.h"

enum {
    AMC_ATTRIBUTE_POSITION=0,
    AMC_ATTRIBUTE_COLOR,
    AMC_ATTRIBUTE_NORMAL,
    AMC_ATTRIBUTE_TEXCOORD0
};

CVReturn MyDisplayLinkCallback(CVDisplayLinkRef, const CVTimeStamp *,const CVTimeStamp *,CVOptionFlags,CVOptionFlags *,void *);

FILE *gpFile=NULL;


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
    [window setTitle:@"macOS Render to Texture"];
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
    
    GLuint vao_pyramid;
    GLuint vao_cube;
    GLuint vbo_position_pyramid;
    GLuint vbo_position_cube;
    GLuint vbo_color_pyramid;
    GLuint vbo_color_cube;
    GLuint mvpUniform;
    
    GLfloat angle_pyramid;
    GLfloat angle_cube;
    vmath::mat4 perspectiveProjectionMatrix;
    
    //Addition
    GLint gShaderProgramObject_FBO;
    GLuint gVertexShaderObject_FBO;
    GLuint gFragmentShaderObject_FBO;
    GLuint mvpUniform_FBO;
    GLuint samplerUniform_FBO;
    GLuint vbo_texCoord_Cube;
    GLuint FBO;
    GLuint texture_FBO;
    
    int windowWidth;
    int windowHeight;
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


-(void)prepareOpenGL
{
    angle_pyramid = 0.0f;
    angle_cube = 0.0f;
    fprintf(gpFile,"OpenGL Version : %s\n",glGetString(GL_VERSION));
    fprintf(gpFile,"GLSL Version : %s\n",glGetString(GL_SHADING_LANGUAGE_VERSION));
    
    [[self openGLContext]makeCurrentContext];
    
    GLint swapInt=1;
    [[self openGLContext]setValues:&swapInt forParameter:NSOpenGLCPSwapInterval];
    
    ///FBO shaders
    gVertexShaderObject_FBO = glCreateShader(GL_VERTEX_SHADER);
    
    //Vertex Shader Code
    const GLchar* vertextShaderSourceCodeN =
    "#version 410 core " \
    "\n " \
    "in vec4 vPosition;" \
    "in vec2 vTexCoord;" \
    "uniform mat4 u_mvp_matrix;" \
    "out vec2 out_TexCoord;" \
    "void main(void)" \
    "{" \
    "gl_Position=u_mvp_matrix * vPosition;" \
    "out_TexCoord=vTexCoord;"\
    "} ";
    
    //"in vec4 vColor;" \
    //"out vec4 out_color;" \
    //"out_color=vColor;"\
    
    //Shader object and source code mapping
    glShaderSource(gVertexShaderObject_FBO, 1, &vertextShaderSourceCodeN, NULL);
    
    //Compile Shader
    glCompileShader(gVertexShaderObject_FBO);
    
    //Error Checking
    GLint iShaderCompileStatusN = 0;
    GLint iInfoLogLengthN = 0;
    GLchar * szInfoLogN = NULL;
    
    glGetShaderiv(gVertexShaderObject_FBO, GL_COMPILE_STATUS, &iShaderCompileStatusN);
    
    if (iShaderCompileStatusN == GL_FALSE) {
        glGetShaderiv(gVertexShaderObject_FBO, GL_INFO_LOG_LENGTH, &iInfoLogLengthN);
        if (iInfoLogLengthN > 0) {
            szInfoLogN = (GLchar *)malloc(iInfoLogLengthN);
            if (szInfoLogN != NULL) {
                GLsizei written;
                glGetShaderInfoLog(gVertexShaderObject_FBO,
                                   iInfoLogLengthN,
                                   &written,
                                   szInfoLogN);
                fprintf(gpFile, "Vertex Shader Compilation Log %s\n", szInfoLogN);
                free(szInfoLogN);
                [self dealloc];
            }
        }
    }
    
    //Fragement Shader
    //Define Shader Object
    gFragmentShaderObject_FBO = glCreateShader(GL_FRAGMENT_SHADER);
    
    //Fragement Shader Code
    const GLchar* fragmentShaderSourceCodeN =
    "#version 410 core " \
    "\n " \
    "in vec2 out_TexCoord;"
    "uniform sampler2D u_sampler;"
    "out vec4 fragColor;"
    "void main(void)" \
    "{" \
    "fragColor=texture(u_sampler,out_TexCoord);" \
    "} ";
    
    
    //"in vec4 out_color;"\
    //"fragColor=out_color;" \
    
    //Shader object and source code mapping
    glShaderSource(gFragmentShaderObject_FBO, 1, &fragmentShaderSourceCodeN, NULL);
    
    //Compile Shader
    glCompileShader(gFragmentShaderObject_FBO);
    
    //Error Checking
    iShaderCompileStatusN = 0;
    iInfoLogLengthN = 0;
    szInfoLogN = NULL;
    
    glGetShaderiv(gFragmentShaderObject_FBO, GL_COMPILE_STATUS, &iShaderCompileStatusN);
    
    if (iShaderCompileStatusN == GL_FALSE) {
        glGetShaderiv(gFragmentShaderObject_FBO, GL_INFO_LOG_LENGTH, &iInfoLogLengthN);
        if (iInfoLogLengthN > 0) {
            szInfoLogN = (GLchar *)malloc(iInfoLogLengthN);
            if (szInfoLogN != NULL) {
                GLsizei written;
                glGetShaderInfoLog(gFragmentShaderObject_FBO,
                                   iInfoLogLengthN,
                                   &written,
                                   szInfoLogN);
                fprintf(gpFile, "Fragement Shader Compilation Log %s\n", szInfoLogN);
                free(szInfoLogN);
               [self dealloc];
            }
        }
    }
    
    //Program Object
    gShaderProgramObject_FBO = glCreateProgram();
    //Attach Shaders
    glAttachShader(gShaderProgramObject_FBO, gVertexShaderObject_FBO);
    glAttachShader(gShaderProgramObject_FBO, gFragmentShaderObject_FBO);
    
    //Prelinking
    //Binding to attribute
    glBindAttribLocation(gShaderProgramObject_FBO,
                         AMC_ATTRIBUTE_POSITION,
                         "vPosition");
    
    glBindAttribLocation(gShaderProgramObject_FBO,
                         AMC_ATTRIBUTE_TEXCOORD0,
                         "vTexCoord");
    /*glBindAttribLocation(gShaderProgramObject_FBO,
     AMC_ATTRIBUTE_COLOR,
     "vColor");*/
    
    //Link Shader Program
    glLinkProgram(gShaderProgramObject_FBO);
    
    //Error Checking
    GLint iShaderLinkStatusN = 0;
    
    glGetProgramiv(gShaderProgramObject_FBO, GL_LINK_STATUS, &iShaderLinkStatusN);
    
    if (iShaderLinkStatusN == GL_FALSE) {
        glGetProgramiv(gShaderProgramObject_FBO, GL_INFO_LOG_LENGTH, &iInfoLogLengthN);
        if (iInfoLogLengthN > 0) {
            szInfoLogN = (GLchar *)malloc(iInfoLogLengthN);
            if (szInfoLogN != NULL) {
                GLsizei written;
                glGetProgramInfoLog(gShaderProgramObject_FBO,
                                    iInfoLogLengthN,
                                    &written,
                                    szInfoLogN);
                fprintf(gpFile, "Program Link Log %s\n", szInfoLogN);
                free(szInfoLogN);
                [self dealloc];
            }
        }
    }
    
    //Post Linking
    //Retriving Uniform Location
    mvpUniform_FBO = glGetUniformLocation(gShaderProgramObject_FBO,
                                          "u_mvp_matrix");
    
    samplerUniform_FBO = glGetUniformLocation(gShaderProgramObject_FBO,
                                              "u_sampler");
    
    
    

    
    //Vertex Shader
    gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);
    
    //write vertex shader code
    const GLchar *vertexShaderSourceCode =
    "#version 410 core" \
    "\n" \
    "in vec4 vPosition;" \
    "in vec4 vColor;" \
    "uniform mat4 u_mvp_matrix;" \
    "out vec4 out_color;" \
    "void main(void)" \
    "{" \
    "gl_Position=u_mvp_matrix * vPosition;" \
    "out_color=vColor;" \
    "}";
    
    //specify above source code to vertexShaderObject
    glShaderSource(gVertexShaderObject, 1,
                   (const GLchar**)&vertexShaderSourceCode,
                   NULL);
    glCompileShader(gVertexShaderObject);
    GLint iShaderCompileStatus = 0;
    GLint iInfoLogLength = 0;
    GLchar *szInfoLog = NULL;
    
    glGetShaderiv(gVertexShaderObject,
                  GL_COMPILE_STATUS,
                  &iShaderCompileStatus);
    fprintf(gpFile,"Value of ivertex shader compile Status is : %d", iShaderCompileStatus);
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
                fprintf(gpFile,"Error in compiling vertex Shader : %hs", szInfoLog);
                free(szInfoLog);
                
                [self dealloc];
            }
        }
    }
    
    //define Fragment shader object
    gFragmentShaderObject = glCreateShader(GL_FRAGMENT_SHADER);
    
    //write fragment shader code
    const GLchar *fragmentShaderSourceCode =
    "#version 410 core" \
    "\n" \
    "in vec4 out_color;" \
    "out vec4 FragColor;" \
    "void main(void)" \
    "{" \
    "FragColor=out_color;" \
    "}";
    
    //specify above source code to FragmentShaderObject
    glShaderSource(gFragmentShaderObject, 1,
                   (const GLchar**)&fragmentShaderSourceCode,
                   NULL);
    glCompileShader(gFragmentShaderObject);
    
    iShaderCompileStatus = 0;
    iInfoLogLength = 0;
    szInfoLog = NULL;
    
    glGetShaderiv(gFragmentShaderObject,
                  GL_COMPILE_STATUS,
                  &iShaderCompileStatus);
    fprintf(gpFile,"Value of ifragment shader compile Status is : %d", iShaderCompileStatus);
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
                fprintf(gpFile,"Error in compiling Fragment Shader : %hs", szInfoLog);
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
    glBindAttribLocation(gShaderProgramObject,AMC_ATTRIBUTE_POSITION,"vPosition");
    glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_COLOR, "vColor");
    
    //Link the shader program
    fprintf(gpFile,"attach comp\n");
    glLinkProgram(gShaderProgramObject);
    //ErrorCheck for linking
    
    GLint iProgramLinkStatus = 0;
    iInfoLogLength = 0;
    szInfoLog = NULL;
    
    glGetProgramiv(gShaderProgramObject,
                   GL_LINK_STATUS,
                   &iProgramLinkStatus);
    fprintf(gpFile,"Value of iProgramLinkStatus is : %d", iProgramLinkStatus);
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
                fprintf(gpFile,"Error in Linking Shader : %hs", szInfoLog);
                free(szInfoLog);
                [self dealloc];
                //DestroyWindow(ghHwnd);
            }
        }
    }
    
    //post linking retrieving uniform location
    mvpUniform = glGetUniformLocation(gShaderProgramObject,"u_mvp_matrix");
    
    const GLfloat pyramidVertices[] = { 0.0f,1.0f,0.0f,//
        -1.0f,-1.0f,1.0f,
        1.0f,-1.0f,1.0f,
        0.0f,1.0f,0.0f,//
        1.0f,-1.0f,1.0f,
        1.0f,-1.0f,-1.0f,
        0.0f,1.0f,0.0f,//
        1.0f,-1.0f,-1.0f,
        -1.0f,-1.0f,-1.0f,
        0.0f,1.0f,0.0f,//
        -1.0f,-1.0f,-1.0f,
        -1.0f,-1.0f,1.0f,
        -1.0f, -1.0f, -1.0f,//bottom
        -1.0f, -1.0f, 1.0f,
        1.0f, -1.0f, 1.0f,
        1.0f, -1.0f, -1.0f
        
    };
    const GLfloat pyramidVerticesColor[] = { 1.0f,0.0f,0.0f,//r
        0.0f,1.0f,0.0f,//g
        0.0f,0.0f,1.0f,//b
        1.0f,0.0f,0.0f,//r
        0.0f,0.0f,1.0f,//b
        0.0f,1.0f,0.0f,//g
        1.0f,0.0f,0.0f,//r
        0.0f,1.0f,0.0f,//g
        0.0f,0.0f,1.0f,//b
        1.0f,0.0f,0.0f,//r
        0.0f,0.0f,1.0f,//b
        0.0f,1.0f,0.0f,//g
        1.0f,0.0f,0.0f,//r
        1.0f,0.0f,0.0f,//r
        1.0f,0.0f,0.0f,//r
        1.0f,0.0f,0.0f //r
    };
    const GLfloat cubeVertices[] = { -1.0f, 1.0f, -1.0f,//top
        -1.0f, 1.0f, 1.0f,
        1.0f, 1.0f, 1.0f,
        1.0f, 1.0f, -1.0f,
        -1.0f, -1.0f, -1.0f,//bottom
        -1.0f, -1.0f, 1.0f,
        1.0f, -1.0f, 1.0f,
        1.0f, -1.0f, -1.0f,
        1.0f, 1.0f, 1.0f,//front
        -1.0f, 1.0f, 1.0f,
        -1.0f, -1.0f, 1.0f,
        1.0f, -1.0f, 1.0f,
        -1.0f, 1.0f, -1.0f,//back
        1.0f, 1.0f, -1.0f,
        1.0f, -1.0f, -1.0f,
        -1.0f, -1.0f, -1.0f,
        1.0f, 1.0f, -1.0f,//right
        1.0f, 1.0f, 1.0f,
        1.0f, -1.0f, 1.0f,
        1.0f, -1.0f, -1.0f,
        -1.0f, 1.0f, 1.0f,//left
        -1.0f, 1.0f, -1.0f,
        -1.0f, -1.0f, -1.0f,
        -1.0f, -1.0f, 1.0f
    };
    const GLfloat cubeVerticesColor[] = { 1.0f,0,0.0f,//r
        1.0f,0,0.0f,//r
        1.0f,0,0.0f,//r
        1.0f,0,0.0f,//r
        0.0f,0.0f,1.0f,//b
        0.0f,0.0f,1.0f,//b
        0.0f,0.0f,1.0f,//b
        0.0f,0.0f,1.0f,//b
        0.0f,1.0f,0.0f,//g
        0.0f,1.0f,0.0f,//g
        0.0f,1.0f,0.0f,//g
        0.0f,1.0f,0.0f,//g
        0.0f,1.0f,1.0f,//c
        0.0f,1.0f,1.0f,//c
        0.0f,1.0f,1.0f,//c
        0.0f,1.0f,1.0f,//c
        1.0f,0.0f,1.0f,//m
        1.0f,0.0f,1.0f,//m
        1.0f,0.0f,1.0f,//m
        1.0f,0.0f,1.0f,//m
        1.0f,1.0f,0.0f,//y
        1.0f,1.0f,0.0f,//y
        1.0f,1.0f,0.0f,//y
        1.0f,1.0f,0.0f,//y
    };
    const GLfloat cubeTexCoord[] =
    { 0.0f, 1.0f,
        0.0f, 0.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,
        1.0f, 1.0f,
        0.0f, 1.0f,
        0.0f, 0.0f,
        1.0f, 0.0f,
        0.0f, 0.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f,
        0.0f, 0.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f,
        0.0f, 0.0f,
        0.0f, 0.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f };
    //create vao
    glGenVertexArrays(1, &vao_pyramid);
    glBindVertexArray(vao_pyramid);
    //for position
    glGenBuffers(1, &vbo_position_pyramid);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_pyramid);
    glBufferData(GL_ARRAY_BUFFER, sizeof(pyramidVertices),
                 pyramidVertices, GL_STATIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    //for color
    glGenBuffers(1, &vbo_color_pyramid);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_pyramid);
    glBufferData(GL_ARRAY_BUFFER, sizeof(pyramidVerticesColor),
                 pyramidVerticesColor, GL_STATIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_COLOR, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_COLOR);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
    /////////////////////////////////////////////////////////
    
    //create vao
    glGenVertexArrays(1, &vao_cube);
    glBindVertexArray(vao_cube);
    //for position
    glGenBuffers(1, &vbo_position_cube);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_cube);
    glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVertices),
                 cubeVertices, GL_STATIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    //for color
    /*
    glGenBuffers(1, &vbo_color_cube);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_cube);
    glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVerticesColor),
                 cubeVerticesColor, GL_STATIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_COLOR, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_COLOR);
    glBindBuffer(GL_ARRAY_BUFFER, 0);*/
    //glBindVertexArray(0);
    
    //Generate Buffer
    glGenBuffers(1, &vbo_texCoord_Cube);
    //Bind Generated Buffer
    glBindBuffer(GL_ARRAY_BUFFER,
                 vbo_texCoord_Cube);
    //Fill Buffer
    glBufferData(GL_ARRAY_BUFFER,
                 sizeof(cubeTexCoord),
                 cubeTexCoord,
                 GL_STATIC_DRAW);
    //Set Vertex Attrib Pointer
    glVertexAttribPointer(AMC_ATTRIBUTE_TEXCOORD0,
                          2,
                          GL_FLOAT,
                          GL_FALSE,
                          0,
                          NULL);
    //Enable Vertex Attrib Array
    glEnableVertexAttribArray(AMC_ATTRIBUTE_TEXCOORD0);
    //Unbind Buffer
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //Unbind array
    glBindVertexArray(0);
    
    //Now from here onward add Frame Buffer Facility
    glGenFramebuffers(1,&FBO);
    glBindFramebuffer(GL_FRAMEBUFFER,FBO);//Read/Draw
    
    glGenTextures(1,&texture_FBO);
    glBindTexture(GL_TEXTURE_2D,texture_FBO);
    
    glTexStorage2D(GL_TEXTURE_2D,1,GL_RGBA8,1024,1024);
    
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
    glFramebufferTexture(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,texture_FBO,0);
    //Turn Off Mipmaps 4th 0
    
    static const GLenum draw_Buffers[] = { GL_COLOR_ATTACHMENT0 };
    
    glDrawBuffers(1,draw_Buffers);
    
    glBindFramebuffer(GL_FRAMEBUFFER,0);
    
    fprintf(gpFile,"Done with framebuffer facility");
    /////////////////////////////////////////////////////////
    
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClearDepth(1.0f);
    glEnable(GL_TEXTURE_2D);
    perspectiveProjectionMatrix = vmath::mat4::identity();
    [self reshape];
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_DEPTH_STENCIL);
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
    windowWidth=width;
    windowHeight=height;
    
    if(height==0)
        height=1;
    
    glViewport(0,0,(GLsizei)width,(GLsizei)height);
    perspectiveProjectionMatrix=vmath::perspective(45.0f,
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
    
    vmath::mat4 modelViewMatrix;
    vmath::mat4 modelViewProjectionMatrix;
    vmath::mat4 translationMatrix;
    vmath::mat4 rotationMatrix;
    vmath::mat4 scaleMatrix;
    
    //Pyramid
    modelViewMatrix = vmath::mat4::identity();
    modelViewProjectionMatrix = vmath::mat4::identity();
    translationMatrix = vmath::mat4::identity();
    rotationMatrix = vmath::mat4::identity();
    scaleMatrix = vmath::mat4::identity();
    
    
    glBindFramebuffer(GL_FRAMEBUFFER, FBO);
    glViewport(0, 0, 1024, 1024);
    glClearColor(0.5, 0.5, 0.5, 1.0);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT |GL_STENCIL_BUFFER_BIT);
    
    translationMatrix = vmath::translate(0.0f, 0.15f, -4.0f);
    scaleMatrix = vmath::scale(0.75f, 0.75f, 0.75f);
    rotationMatrix = vmath::rotate(angle_pyramid, 0.0f, 1.0f, 0.0f);
    
    modelViewMatrix = translationMatrix *scaleMatrix* rotationMatrix;
    
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;

    glUniformMatrix4fv(mvpUniform_FBO,
                       1,
                       GL_FALSE,
                       modelViewProjectionMatrix);
    
    //Bind with vao
    
    glBindVertexArray(vao_pyramid);
    
    glDrawArrays(GL_TRIANGLES,0,12);
    glDrawArrays(GL_TRIANGLE_FAN,12,4);
    //Unbind vao
    glBindVertexArray(0);
    
    glBindFramebuffer(GL_FRAMEBUFFER, 0);//Test
    
    glUseProgram(0);
    
    glClearColor(0.0, 0.0, 0.0, 1.0);
    glViewport(0, 0, (GLsizei)windowWidth, (GLsizei)windowHeight);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    
    glUseProgram(gShaderProgramObject_FBO);
    //CUBE
    modelViewMatrix = vmath::mat4::identity();
    modelViewProjectionMatrix = vmath::mat4::identity();
    translationMatrix = vmath::mat4::identity();
    rotationMatrix = vmath::mat4::identity();
    scaleMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -5.0f);
    //scaleMatrix = scale(0.75f, 0.75f, 0.75f);
    rotationMatrix = vmath::rotate(angle_cube,angle_cube,angle_cube);
    //rotationMatrix = vmath::rotate(0.0f,angle_cube,0.0f);
    
    modelViewMatrix = translationMatrix * scaleMatrix * rotationMatrix;
    
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    glUniformMatrix4fv(mvpUniform,1,GL_FALSE,modelViewProjectionMatrix);
    
    glUniform1i(samplerUniform_FBO, 0);
    
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D,texture_FBO);
    //Bind with vao
    
    glBindVertexArray(vao_cube);
    //6Faces
    glDrawArrays(GL_TRIANGLE_FAN,0,4);
    glDrawArrays(GL_TRIANGLE_FAN,4,4);
    glDrawArrays(GL_TRIANGLE_FAN,8,4);
    glDrawArrays(GL_TRIANGLE_FAN,12,4);
    glDrawArrays(GL_TRIANGLE_FAN,16,4);
    glDrawArrays(GL_TRIANGLE_FAN,20,4);
    //Unbind vao
    glBindVertexArray(0);
    glBindTexture(GL_TEXTURE_2D, 0);
    glUseProgram(0);

    CGLFlushDrawable((CGLContextObj)[[self openGLContext]CGLContextObj]);
    angle_pyramid += 0.5f;
    if (angle_pyramid >= 360.0f)
        angle_pyramid = 0;
    angle_cube += 0.5f;
    if (angle_cube >= 360.0f)
        angle_cube = 0;
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
        case 27:
            [self release];
            [NSApp terminate:self];
            break;
            
        case 'F':
        case 'f':
            [[self window]toggleFullScreen:self];
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
    
    if (vbo_position_pyramid)
    {
        glDeleteBuffers(1, &vbo_position_pyramid);
        vbo_position_pyramid = 0;
    }
    if (vao_pyramid)
    {
        glDeleteBuffers(1, &vao_pyramid);
        vao_pyramid = 0;
    }
    if (vbo_position_cube)
    {
        glDeleteBuffers(1, &vbo_position_cube);
        vbo_position_cube = 0;
    }
    if (vbo_color_pyramid)
    {
        glDeleteBuffers(1, &vbo_color_pyramid);
        vbo_color_pyramid = 0;
    }
    if (vao_cube)
    {
        glDeleteBuffers(1, &vao_cube);
        vao_cube = 0;
    }
    if (FBO)
    {
        glDeleteBuffers(1, &FBO);
        FBO = 0;
    }
    if (vbo_texCoord_Cube)
    {
        glDeleteBuffers(1, &vbo_texCoord_Cube);
        vbo_texCoord_Cube = 0;
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
    
    glUseProgram(gShaderProgramObject_FBO);
    glDetachShader(gShaderProgramObject_FBO, GL_FRAGMENT_SHADER);
    glDetachShader(gShaderProgramObject_FBO, GL_VERTEX_SHADER);
    glDeleteShader(gFragmentShaderObject_FBO);
    gFragmentShaderObject_FBO = 0;
    glDeleteShader(gVertexShaderObject_FBO);
    gVertexShaderObject_FBO = 0;
    glDeleteProgram(gShaderProgramObject_FBO);
    gShaderProgramObject_FBO = 0;
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
