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
    [window setTitle:@"macOS 3D Texture Stone Kundali"];
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
    GLuint vbo_texture_pyramid;
    GLuint vbo_texture_cube;
    GLuint mvpUniform;
    GLuint samplerUniform;
    
    GLuint pyramid_texture;
    GLuint cube_texture;
    GLfloat angle_pyramid;
    GLfloat angle_cube;
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
    angle_pyramid = 0.0f;
    angle_cube = 0.0f;
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
    "in vec2 vTexCoord;" \
    "uniform mat4 u_mvp_matrix;" \
    "out vec2 out_TexCoord;" \
    "void main(void)" \
    "{" \
    "gl_Position=u_mvp_matrix * vPosition;" \
    "out_TexCoord=vTexCoord;" \
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
    "in vec2 out_TexCoord;" \
    "uniform sampler2D u_sampler;" \
    "out vec4 FragColor;" \
    "void main(void)" \
    "{" \
    "FragColor=texture(u_sampler,out_TexCoord);" \
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
    glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_TEXCOORD0, "vTexCoord");
    
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
    samplerUniform = glGetUniformLocation(gShaderProgramObject, "u_sampler");
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
        -1.0f,-1.0f,1.0f
    };
    const GLfloat pyramidVerticesTexCoord[] = { 0.5f,1.0f,//a
        0.0f,0.0f,//l
        1.0f,0.0f,//r
        0.5f,1.0f,//a
        0.0f,0.0f,//l
        1.0f,0.0f,//r
        0.5f,1.0f,//a
        0.0f,0.0f,//l
        1.0f,0.0f,//r
        0.5f,1.0f,//a
        0.0f,0.0f,//l
        1.0f,0.0f//r
    };
    const GLfloat cubeVertices[] = {
        1.0f, 1.0f, -1.0f,//top
        -1.0f, 1.0f, -1.0f,
        -1.0f, 1.0f, 1.0f,
        1.0f, 1.0f, 1.0f,
        
        1.0f, -1.0f, 1.0f,//bottom
        -1.0f, -1.0f, 1.0f,
        -1.0f, -1.0f, -1.0f,
        1.0f, -1.0f, -1.0f,
        
        1.0f, 1.0f, 1.0f,//front
        -1.0f, 1.0f, 1.0f,
        -1.0f, -1.0f, 1.0f,
        1.0f, -1.0f, 1.0f,
        
        1.0f, -1.0f, -1.0f,//back
        -1.0f, -1.0f, -1.0f,
        -1.0f, 1.0f, -1.0f,
        1.0f, 1.0f, -1.0f,
        
        -1.0f, 1.0f, 1.0f,//right
        -1.0f, 1.0f, -1.0f,
        -1.0f, -1.0f, -1.0f,
        -1.0f, -1.0f, 1.0f,
        
        1.0f, 1.0f, -1.0f,//left
        1.0f, 1.0f, 1.0f,
        1.0f, -1.0f, 1.0f,
        1.0f, -1.0f, -1.0f
    };
    const GLfloat cubeVerticesTexCoord[] = {
        0.0f,1.0f,//tr bottom
        1.0f,1.0f,//bl
        1.0f,0.0f,//br
        0.0f,0.0f,//tr
        0.0f,1.0f,//tr bottom
        1.0f,1.0f,//bl
        1.0f,0.0f,//br
        0.0f,0.0f,//tr
        0.0f,1.0f,//tr bottom
        1.0f,1.0f,//bl
        1.0f,0.0f,//br
        0.0f,0.0f,//tr
        0.0f,1.0f,//tr bottom
        1.0f,1.0f,//bl
        1.0f,0.0f,//br
        0.0f,0.0f,//tr
        0.0f,1.0f,//tr bottom
        1.0f,1.0f,//bl
        1.0f,0.0f,//br
        0.0f,0.0f,//tr
        0.0f,1.0f,//tr bottom
        1.0f,1.0f,//bl
        1.0f,0.0f,//br
        0.0f,0.0f//tr
        
    };
    
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
    //for texture
    glGenBuffers(1, &vbo_texture_pyramid);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_texture_pyramid);
    glBufferData(GL_ARRAY_BUFFER, sizeof(pyramidVerticesTexCoord),
                 pyramidVerticesTexCoord, GL_STATIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_TEXCOORD0, 2, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_TEXCOORD0);
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
    //for texture
    glGenBuffers(1, &vbo_texture_cube);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_texture_cube);
    glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVerticesTexCoord),
                 cubeVerticesTexCoord, GL_STATIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_TEXCOORD0, 2, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_TEXCOORD0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
    /////////////////////////////////////////////////////////
    
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClearDepth(1.0f);
    perspectiveProjectionMatrix = vmath::mat4::identity();
    [self reshape];
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LEQUAL);

    pyramid_texture=[self loadTextureFromBMPFile:"Stone.bmp"];
    cube_texture=[self loadTextureFromBMPFile:"Vijay_Kundali.bmp"];
    glEnable(GL_TEXTURE_2D);
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
    
    glUseProgram(gShaderProgramObject);
    
    //declaration of matrices
    vmath::mat4 modelViewMatrix;
    vmath::mat4 modelViewProjectionMatrix;
    vmath::mat4 translationMatrix;
    vmath::mat4 rotationMatrix;
    vmath::mat4 scaleMatrix;
    //initialize above to identity
    //bind with vao
    glBindTexture(GL_TEXTURE_2D,pyramid_texture);
    glBindVertexArray(vao_pyramid);
    //initialize above to identity
    modelViewMatrix = vmath::mat4::identity();
    modelViewProjectionMatrix = vmath::mat4::identity();
    translationMatrix = vmath::mat4::identity();
    rotationMatrix = vmath::mat4::identity();
    scaleMatrix = vmath::mat4::identity();
    //do necessary transformation
    translationMatrix = vmath::translate(-2.0f,0.0f,-6.0f);
    rotationMatrix = vmath::rotate(angle_pyramid,0.0f,1.0f,0.0f);
    modelViewMatrix = translationMatrix*rotationMatrix;
    //do necessary matrix multiplication
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    
    //similarly bind with textures if any
    
    //draw necessary scene
    glDrawArrays(GL_TRIANGLES, 0, 12);
    
    //unbind vao
    glBindVertexArray(0);
    //bind with vao
    glBindTexture(GL_TEXTURE_2D,cube_texture);
    glBindVertexArray(vao_cube);
    modelViewMatrix = vmath::mat4::identity();
    //modelViewProjectionMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    rotationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(2.0f, 0.0f, -6.0f);
    rotationMatrix = vmath::rotate(angle_cube, angle_cube, angle_cube);
    scaleMatrix= vmath::scale(0.75f,0.75f,0.75f);
    modelViewMatrix = translationMatrix*scaleMatrix*rotationMatrix;
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    glVertexAttrib3f(AMC_ATTRIBUTE_COLOR,0.0f,0.0f,1.0f);

    
    //similarly bind with textures if any
    
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 12, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 16, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 20, 4);
    
    //unbind vao
    glBindVertexArray(0);
    
    //unuse program
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
-(GLuint)loadTextureFromBMPFile:(const char *)texFileName
{
    NSBundle *mainBundle=[NSBundle mainBundle];
    NSString *appDirName=[mainBundle bundlePath];
    NSString *parentDirPath=[appDirName stringByDeletingLastPathComponent];
    NSString *textureFileNameWithPath=[NSString stringWithFormat:@"%@/%s",parentDirPath,texFileName];
    
    NSImage *bmpImage=[[NSImage alloc]initWithContentsOfFile:textureFileNameWithPath];
    if(!bmpImage)
    {
        NSLog(@"can't find %@",textureFileNameWithPath);
        return 0;
    }
    
    CGImageRef cgImage=[bmpImage CGImageForProposedRect:nil context:nil hints:nil];
    
    int w=(int)CGImageGetWidth(cgImage);
    int h=(int)CGImageGetHeight(cgImage);
    
    CFDataRef imageData=CGDataProviderCopyData(CGImageGetDataProvider(cgImage));
    void* pixels=(void*)CFDataGetBytePtr(imageData);
    
    GLuint bmpTexture;
    glGenTextures(1, &bmpTexture);
    glBindTexture(GL_TEXTURE_2D, bmpTexture);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA,
                 GL_UNSIGNED_BYTE, pixels);
    glGenerateMipmap(GL_TEXTURE_2D);
    CFRelease(imageData);
    return (bmpTexture);
    
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
   
    if(pyramid_texture)
    {
        glDeleteTextures(1,&pyramid_texture);
        pyramid_texture=0;
    }
    if(cube_texture)
    {
        glDeleteTextures(1,&cube_texture);
        cube_texture=0;
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
