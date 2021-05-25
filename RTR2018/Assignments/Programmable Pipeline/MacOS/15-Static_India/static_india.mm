#import<Foundation/Foundation.h>
#import<Cocoa/Cocoa.h>

#import<QuartzCore/CVDisplayLink.h>

#import<OpenGL/gl3.h>
#import<OpenGL/gl3ext.h>
#import "vmath.h"
#define _USE_MATH_DEFINES 1;
#include<math.h>

#define num 1000

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
    [window setTitle:@"macOS Static India"];
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
    
    GLuint vao_letters;
    GLuint vao_rectangle;
    GLuint vbo_position_letters;
    GLuint vbo_position_rectangle;
    GLuint vbo_color_letters;
    GLuint mvpUniform;
    
    vmath::mat4 perspectiveProjectionMatrix;
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
    fprintf(gpFile,"OpenGL Version : %s\n",glGetString(GL_VERSION));
    fprintf(gpFile,"GLSL Version : %s\n",glGetString(GL_SHADING_LANGUAGE_VERSION));
    
    [[self openGLContext]makeCurrentContext];
    
    GLint swapInt=1;
    [[self openGLContext]setValues:&swapInt forParameter:NSOpenGLCPSwapInterval];
    
    //Vertex Shader
    gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);
    
    //write vertex shader code
    const GLchar *vertexShaderSourceCode =
    "#version 330 core" \
    "\n" \
    "in vec4 vPosition;" \
    "in vec4 vColor;" \
    "out vec4 out_vColor;" \
    "uniform mat4 u_mvp_matrix;" \
    "void main(void)" \
    "{" \
    "gl_Position=u_mvp_matrix * vPosition;" \
    "out_vColor=vColor;" \
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
    "#version 330 core" \
    "\n" \
    "in vec4 out_vColor;" \
    "out vec4 FragColor;" \
    "void main(void)" \
    "{" \
    "FragColor=out_vColor;" \
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
    
    //create vao
    glGenVertexArrays(1, &vao_letters);
    glBindVertexArray(vao_letters);
    glGenBuffers(1, &vbo_position_letters);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, 500*3*4*sizeof(GLfloat),
                 NULL, GL_DYNAMIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    //for color
    glGenBuffers(1, &vbo_color_letters);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, 500 * 3 * 4 * sizeof(GLfloat),
                 NULL, GL_DYNAMIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_COLOR, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_COLOR);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
    /////////////////////////////////////////////////////////
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClearDepth(1.0f);
    perspectiveProjectionMatrix = vmath::mat4::identity();
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
    const GLfloat IVertices[] = {
        -1.75f, 0.75f,0.0f, //for I
        -1.75f, 0.65f,0.0f,     //for I
        -1.25f, 0.65f,0.0f , //for I
        -1.25f, 0.75f ,0.0f, //for I
        -1.35f, 0.65f ,0.0f, //for I
        -1.65f, 0.65f ,0.0f, //for I
        -1.65f, -0.65f ,0.0f,//for I
        -1.35f, -0.65f ,0.0f,//for I
        -1.75f, -0.65f ,0.0f,//for I
        -1.75f, -0.75f ,0.0f,//for I
        -1.25f, -0.75f ,0.0f,//for I
        -1.25f, -0.65f ,0.0f//for I
    };
    const GLfloat NVertices[] = {
        -1.10f, 0.75f ,0.0f, //for N
        -1.25f, 0.75f ,0.0f, //for N
        -1.25f, -0.75f ,0.0f,//for N
        -1.10f, -0.75f ,0.0f,//for N
        -1.10f, 0.75f ,0.0f, //for N
        -1.25f, 0.75f ,0.0f, //for N
        -0.95f, -0.75f ,0.0f,//for N
        -0.8f, -0.75f ,0.0f, //for N
        -0.80f, 0.75f ,0.0f, //for N
        -0.95f, 0.75f ,0.0f, //for N
        -0.95f, -0.75f ,0.0f,//for N
        -0.80f, -0.75f ,0.0f//for N
    };
    const GLfloat DVertices[] = {
        -0.0f, 0.75f ,0.0,  //for D
        -0.60f, 0.75f ,0.0,    //for D
        -0.60f, -0.75f ,0.0,//for D
        0.0f, -0.75f ,0.0,    //for D
        -0.15f, 0.60f ,0.0,    //for D
        -0.35f, 0.60f ,0.0,    //for D
        -0.35f, -0.60f,0.0,    //for D
        -0.15f, -0.60f,0.0,    //for D
        -0.5f, 0.60f,0.0,    //for D
        -0.60f, 0.60f,0.0,    //for D
        -0.60f, -0.60f,0.0,    //for D
        -0.5f, -0.60f,0.0    //for D
        
    };
    const GLfloat AVertices[] = {
        1.25f, 0.75f,0.0, //A
        1.1f, 0.75f,0.0,  //A
        0.9f, -0.75f,0.0, //A
        1.55f, -0.75f,0.0,//A
        1.18f, 0.5f,0.0,//triangle A
        1.05f, -0.75f,0.0,
        1.40f, -0.75f,0.0
        
    };
    const GLfloat FlagVertices[] = {
        0.057f, 0.0f,0.0,
        0.203f, 0.0f,0.0,
        0.205f, -0.05f,0.0,
        0.045f, -0.05f,0.0,
        0.057f, 0.0f ,0.0,
        0.2029f, 0.0f,0.0,
        0.195f, 0.05f,0.0,
        0.065f, 0.05f,0.0f
    };
    
    
    const GLfloat IColor[] = {
        1.0f, 0.6f, 0.2f,    //for I
        1.0f, 0.6f, 0.2f,        //for I
        1.0f, 0.6f, 0.2f,        //for I
        1.0f, 0.6f, 0.2f ,        //for I
        1.0f, 0.6f, 0.2f ,        //for I
        1.0f, 0.6f, 0.2f,        //for I
        0.071f, 0.533f, 0.027f ,//for I
        0.071f, 0.533f, 0.027f ,//for I
        0.071f, 0.533f, 0.027f ,//for I
        0.071f, 0.533f, 0.027f ,//for I
        0.071f, 0.533f, 0.027f ,//for I
        0.071f, 0.533f, 0.027f //for I
    };
    const GLfloat NColor[] = {
        1.0f, 0.6f, 0.2f ,        //for N
        1.0f, 0.6f, 0.2f ,        //for N
        0.071f, 0.533f, 0.027f ,//for N
        0.071f, 0.533f, 0.027f ,//for N
        1.0f, 0.6f, 0.2f ,        //for N
        1.0f, 0.6f, 0.2f ,        //for N
        0.071f, 0.533f, 0.027f ,//for N
        0.071f, 0.533f, 0.027f ,//for N
        1.0f, 0.6f, 0.2f ,        //for N
        1.0f, 0.6f, 0.2f ,        //for N
        0.071f, 0.533f, 0.027f ,//for N
        0.071f, 0.533f, 0.027f  //for N
    };
    const GLfloat DColor[] = {
        1.0f, 0.6f, 0.2f ,     //for D
        1.0f, 0.6f, 0.2f ,     //for D
        0.071f, 0.533f, 0.027f , //for D
        0.071f, 0.533f, 0.027f , //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f //for D
    };
    const GLfloat AColor[] = {
        1.0f, 0.6f, 0.2f,      //A
        1.0f, 0.6f, 0.2f,       //A
        0.071f, 0.533f, 0.027f,//A
        0.071f, 0.533f, 0.027f,//A
        0.0f, 0.0f, 0.0f,       //A
        0.0f, 0.0f, 0.0f,       //A
        0.0f, 0.0f, 0.0f       //A
    };
    
    const GLfloat FlagColor[] = {
        1.0f, 1.0f, 1.0f,
        1.0f, 1.0f, 1.0f,
        0.071f, 0.533f, 0.027f,
        0.071f, 0.533f, 0.027f,
        1.0f, 1.0f, 1.0f,
        1.0f, 1.0f, 1.0f,
        1.0f, 0.6f, 0.2f,
        1.0f, 0.6f, 0.2f
    };
    glUseProgram(gShaderProgramObject);
    
    //declaration of matrices
    vmath::mat4 modelViewMatrix;
    vmath::mat4 modelViewProjectionMatrix;
    vmath::mat4 translationMatrix;
    vmath::mat4 rotationMatrix;
    vmath::mat4 scaleMatrix;
    //initialize above to identity
    modelViewMatrix = vmath::mat4::identity();
    modelViewProjectionMatrix = vmath::mat4::identity();
    translationMatrix = vmath::mat4::identity();
    rotationMatrix = vmath::mat4::identity();
    scaleMatrix = vmath::mat4::identity();
    //do necessary transformation
    translationMatrix = vmath::translate(0.0f,0.0f,-3.0f);
    scaleMatrix=vmath::scale(0.8f, 0.9f, 0.0f);
    modelViewMatrix = translationMatrix*scaleMatrix;
    //do necessary matrix multiplication
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    
    //similarly bind with textures if any
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(IVertices),
                 IVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(IColor),
                 IColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    
    translationMatrix = vmath::translate(0.2f, 0.0f, 0.0f);
    modelViewMatrix = translationMatrix*modelViewMatrix;
    //do necessary matrix multiplication
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(NVertices),
                 NVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(NColor),
                 NColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    
    translationMatrix = vmath::translate(0.05f, 0.0f, 0.0f);
    modelViewMatrix = translationMatrix * modelViewMatrix;
    //do necessary matrix multiplication
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(DVertices),
                 DVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(DColor),
                 DColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    
    translationMatrix = vmath::translate(1.6f, 0.0f, 0.0f);
    modelViewMatrix = translationMatrix * modelViewMatrix;
    //do necessary matrix multiplication
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(IVertices),
                 IVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(IColor),
                 IColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    modelViewMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.2f, 0.0f, -3.0f);
    modelViewMatrix = translationMatrix * scaleMatrix*modelViewMatrix;
    //do necessary matrix multiplication
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(AVertices),
                 AVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(AColor),
                 AColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLES, 4, 3);
    //glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    
    modelViewMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(1.055f, 0.0f, -3.0f);
    modelViewMatrix = translationMatrix * scaleMatrix*modelViewMatrix;
    //do necessary matrix multiplication
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(FlagVertices),
                 FlagVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(FlagColor),
                 FlagColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    //unbind vao
    glBindVertexArray(0);
    
    GLfloat circle[1000];
    GLfloat circleColor[1000];
    for (int i = 0; i < 998; i=i+3)
    {
        GLfloat angle = 2 * M_PI*i / num;
        circle[i] = 0.01f*cos(angle);
        circle[i+1] = 0.01f*sin(angle);
        circle[i+2] = 0.0f;
        circleColor[i] = 0.0f;
        circleColor[i+1] = 0.0f;
        circleColor[i+2] = 1.0f;
    }
    modelViewMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(1.15f, 0.0f, -3.0f);
    modelViewMatrix = translationMatrix *modelViewMatrix;
    //do necessary matrix multiplication
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(circle),
                 circle, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(circleColor),
                 circleColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(vao_letters);
    //draw necessary scene
    //glPointSize(2.0f);
    for (int i = 0; i < 998; i += 2)
    {
        glDrawArrays(GL_POINTS, i, i + 2);
    }
    //unbind vao
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
    if (vbo_position_letters)
    {
        glDeleteBuffers(1, &vbo_position_letters);
        vbo_position_letters = 0;
    }
    if (vao_letters)
    {
        glDeleteBuffers(1, &vao_letters);
        vao_letters = 0;
    }
    if (vbo_position_rectangle)
    {
        glDeleteBuffers(1, &vbo_position_rectangle);
        vbo_position_rectangle = 0;
    }
    if (vao_rectangle)
    {
        glDeleteBuffers(1, &vao_rectangle);
        vao_rectangle = 0;
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
