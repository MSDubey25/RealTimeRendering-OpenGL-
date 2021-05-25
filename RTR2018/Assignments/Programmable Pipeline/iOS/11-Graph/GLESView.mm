//
//  GLESView.m
//  11-Graph
//
//  Created by Ajay Arun Pawar on 18/01/20.
//

#import <OpenGLES/ES3/gl.h>
#import <OpenGLES/ES3/glext.h>
#import "GLESView.h"
#import "vmath.h"

enum {
    AMC_ATTRIBUTE_POSITION=0,
    AMC_ATTRIBUTE_COLOR,
    AMC_ATTRIBUTE_NORMAL,
    AMC_ATTRIBUTE_TEXCOORD0
};

@implementation GLESView
{
@private
    EAGLContext *eaglContext;
    
    GLuint defaultFrameBuffer;
    GLuint colorRenderBuffer;
    GLuint depthRenderBuffer;
    
    id displayLink;
    NSInteger animationFrameInterval;
    BOOL isAnimating;
    
    GLuint msd_gVertexShaderObject;
    GLuint msd_gFragmentShaderObject;
    GLuint msd_gShaderProgramObject;
    
    GLuint msd_vao;
    GLuint msd_vbo_position;
    GLuint msd_vbo_color;
    GLuint msd_mvpUniform;
    
    
    vmath::mat4 msd_perspectiveProjectionMatrix;
}
- (id)initWithFrame:(CGRect)frame
{
    self=[super initWithFrame:frame];
    if(self)
    {
        CAEAGLLayer *eaglLayer=(CAEAGLLayer *)super.layer;
        eaglLayer.opaque=YES;
        eaglLayer.drawableProperties=[NSDictionary dictionaryWithObjectsAndKeys:[NSNumber numberWithBool:FALSE],
                                      kEAGLDrawablePropertyRetainedBacking,kEAGLColorFormatRGBA8,kEAGLDrawablePropertyColorFormat,nil];
        eaglContext=[[EAGLContext alloc]initWithAPI:kEAGLRenderingAPIOpenGLES3];
        if(eaglContext==nil)
        {
            [self release];
            return nil;
        }
        [EAGLContext setCurrentContext:eaglContext];
        
        glGenFramebuffers(1,&defaultFrameBuffer);
        glGenRenderbuffers(1, &colorRenderBuffer);
        glBindFramebuffer(GL_FRAMEBUFFER,defaultFrameBuffer);
        glBindRenderbuffer(GL_RENDERBUFFER, colorRenderBuffer);
        
        [eaglContext renderbufferStorage:GL_RENDERBUFFER fromDrawable:eaglLayer];
        
        glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, colorRenderBuffer);
        
        GLint backingWidth;
        GLint backingHeight;
        glGetRenderbufferParameteriv(GL_RENDERBUFFER, GL_RENDERBUFFER_WIDTH, &backingWidth);
        glGetRenderbufferParameteriv(GL_RENDERBUFFER, GL_RENDERBUFFER_HEIGHT, &backingHeight);
        
        glGenRenderbuffers(1, &depthRenderBuffer);
        glBindRenderbuffer(GL_RENDERBUFFER, depthRenderBuffer);
        glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, backingWidth, backingHeight);
        glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthRenderBuffer);
        
        if(glCheckFramebufferStatus(GL_FRAMEBUFFER)!=GL_FRAMEBUFFER_COMPLETE)
        {
            printf("Failed to create complete FrameBuffer Object %x\n",glCheckFramebufferStatus(GL_FRAMEBUFFER));
            glDeleteBuffers(1, &defaultFrameBuffer);
            glDeleteBuffers(1, &colorRenderBuffer);
            glDeleteBuffers(1, &depthRenderBuffer);
            return nil;
        }
        
        printf("Renderer : %s | GL version : %s | GLSL version : %s\n",glGetString(GL_RENDERER),glGetString(GL_VERSION),glGetString(GL_SHADING_LANGUAGE_VERSION));
        
        //herd coded initialization
        isAnimating=NO;
        animationFrameInterval=60;//default since iOS 8.2
        
        //Vertex Shader
        msd_gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);
        
        //write vertex shader code
        const GLchar *vertexShaderSourceCode =
        "#version 300 es" \
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
        glShaderSource(msd_gVertexShaderObject, 1,
                       (const GLchar**)&vertexShaderSourceCode,
                       NULL);
        glCompileShader(msd_gVertexShaderObject);
        GLint iShaderCompileStatus = 0;
        GLint iInfoLogLength = 0;
        GLchar *szInfoLog = NULL;
        
        glGetShaderiv(msd_gVertexShaderObject,
                      GL_COMPILE_STATUS,
                      &iShaderCompileStatus);
        printf("Value of ivertex shader compile Status is : %d", iShaderCompileStatus);
        if (iShaderCompileStatus == GL_FALSE)
        {
            glGetShaderiv(msd_gVertexShaderObject,
                          GL_INFO_LOG_LENGTH,
                          &iInfoLogLength);
            if (iInfoLogLength > 0)
            {
                szInfoLog = (GLchar*)malloc(iInfoLogLength);
                if (szInfoLog != NULL)
                {
                    GLsizei writtened;
                    glGetShaderInfoLog(msd_gVertexShaderObject,
                                       iInfoLogLength,
                                       &writtened,
                                       szInfoLog);
                    printf("Error in compiling vertex Shader : %s", szInfoLog);
                    free(szInfoLog);
                    
                    [self release];
                }
            }
        }
        
        //define Fragment shader object
        msd_gFragmentShaderObject = glCreateShader(GL_FRAGMENT_SHADER);
        
        //write fragment shader code
        const GLchar *fragmentShaderSourceCode =
        "#version 300 es" \
        "\n" \
        "precision highp float;" \
        "in vec4 out_color;" \
        "out vec4 FragColor;" \
        "void main(void)" \
        "{" \
        "FragColor=out_color;" \
        "}";
        
        //specify above source code to FragmentShaderObject
        glShaderSource(msd_gFragmentShaderObject, 1,
                       (const GLchar**)&fragmentShaderSourceCode,
                       NULL);
        glCompileShader(msd_gFragmentShaderObject);
        
        iShaderCompileStatus = 0;
        iInfoLogLength = 0;
        szInfoLog = NULL;
        
        glGetShaderiv(msd_gFragmentShaderObject,
                      GL_COMPILE_STATUS,
                      &iShaderCompileStatus);
        printf("Value of ifragment shader compile Status is : %d", iShaderCompileStatus);
        if (iShaderCompileStatus == GL_FALSE)
        {
            glGetShaderiv(msd_gFragmentShaderObject,
                          GL_INFO_LOG_LENGTH,
                          &iInfoLogLength);
            if (iInfoLogLength > 0)
            {
                szInfoLog = (GLchar*)malloc(iInfoLogLength);
                if (szInfoLog != NULL)
                {
                    GLsizei writtened;
                    glGetShaderInfoLog(msd_gFragmentShaderObject,
                                       iInfoLogLength,
                                       &writtened,
                                       szInfoLog);
                    printf("Error in compiling Fragment Shader : %s", szInfoLog);
                    free(szInfoLog);
                    [self release];
                    //DestroyWindow(ghHwnd);
                }
            }
        }
        
        //create Shader program object
        msd_gShaderProgramObject = glCreateProgram();
        
        //attach vertex/fragment shaders
        glAttachShader(msd_gShaderProgramObject,
                       msd_gVertexShaderObject);
        glAttachShader(msd_gShaderProgramObject,
                       msd_gFragmentShaderObject);
        
        //prelinking binding to vertex attributes
        glBindAttribLocation(msd_gShaderProgramObject,AMC_ATTRIBUTE_POSITION,"vPosition");
        glBindAttribLocation(msd_gShaderProgramObject, AMC_ATTRIBUTE_COLOR, "vColor");
        
        
        //Link the shader program
        printf("attach comp\n");
        glLinkProgram(msd_gShaderProgramObject);
        //ErrorCheck for linking
        
        GLint iProgramLinkStatus = 0;
        iInfoLogLength = 0;
        szInfoLog = NULL;
        
        glGetProgramiv(msd_gShaderProgramObject,
                       GL_LINK_STATUS,
                       &iProgramLinkStatus);
        printf("Value of iProgramLinkStatus is : %d", iProgramLinkStatus);
        if (iProgramLinkStatus == GL_FALSE)
        {
            glGetProgramiv(msd_gShaderProgramObject,
                           GL_INFO_LOG_LENGTH,
                           &iInfoLogLength);
            if (iInfoLogLength > 0)
            {
                szInfoLog = (GLchar*)malloc(iInfoLogLength);
                if (szInfoLog != NULL)
                {
                    GLsizei writtened;
                    glGetProgramInfoLog(msd_gShaderProgramObject,
                                        iInfoLogLength,
                                        &writtened,
                                        szInfoLog);
                    printf("Error in Linking Shader : %s", szInfoLog);
                    free(szInfoLog);
                    [self release];
                    //DestroyWindow(ghHwnd);
                }
            }
        }
        
        //post linking retrieving uniform location
        msd_mvpUniform = glGetUniformLocation(msd_gShaderProgramObject,"u_mvp_matrix");
        
        //create vao
        glGenVertexArrays(1, &msd_vao);
        glBindVertexArray(msd_vao);
        glGenBuffers(1, &msd_vbo_position);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position);
        glBufferData(GL_ARRAY_BUFFER, 12 * 3 * sizeof(GL_FLOAT),
                     NULL, GL_DYNAMIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        
        //for color
        glGenBuffers(1, &msd_vbo_color);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color);
        glBufferData(GL_ARRAY_BUFFER, 12 * 3 * sizeof(GL_FLOAT),
                     NULL, GL_DYNAMIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_COLOR, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_COLOR);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindVertexArray(0);
        /////////////////////////////////////////////////////////
        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        msd_perspectiveProjectionMatrix = vmath::mat4::identity();
        
        glEnable(GL_DEPTH_TEST);
        glDepthFunc(GL_LEQUAL);
        
        //GESTURE recognition
        UITapGestureRecognizer *singleTapGestureRecognizer=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(onSingleTap:)];
        [singleTapGestureRecognizer setNumberOfTapsRequired:1];
        [singleTapGestureRecognizer setNumberOfTouchesRequired:1];
        [singleTapGestureRecognizer setDelegate:self];
        [self addGestureRecognizer:singleTapGestureRecognizer];
        
        UITapGestureRecognizer *doubleTapGestureRecognizer=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(onDoubleTap:)];
        [doubleTapGestureRecognizer setNumberOfTapsRequired:2];
        [doubleTapGestureRecognizer setNumberOfTouchesRequired:1];
        [doubleTapGestureRecognizer setDelegate:self];
        [self addGestureRecognizer:doubleTapGestureRecognizer];
        
        [singleTapGestureRecognizer requireGestureRecognizerToFail:doubleTapGestureRecognizer];
        
        UISwipeGestureRecognizer *swipeGestureRecognizer=[[UISwipeGestureRecognizer alloc]initWithTarget:self action:@selector(onSwipe:)];
        [self addGestureRecognizer:swipeGestureRecognizer];
        
        UILongPressGestureRecognizer *longPressGestureRecognizer=[[UILongPressGestureRecognizer alloc]initWithTarget:self action:@selector(onLongPress:)];
        [self addGestureRecognizer:longPressGestureRecognizer];
        
        
    }
    return self;
}
+(Class)layerClass
{
    return ([CAEAGLLayer class]);
}

-(void)drawView:(id)sender
{
    [EAGLContext setCurrentContext:eaglContext];
    
    glBindFramebuffer(GL_FRAMEBUFFER, defaultFrameBuffer);
    
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
    GLfloat msd_linesCoordinates[] = { -1.0f, 0.0f, 0.0f ,
        1.0f, 0.0f, 0.0f,
        0.0f, -1.0f, 0.0f,
        0.0f, 1.0f, 0.0f
    };
    GLfloat msd_colorCoordinates[] = { 0.0f, 1.0f, 0.0f ,
        0.0f, 1.0f, 0.0f,
        0.0f, 0.0f, 1.0f,
        0.0f, 0.0f, 1.0f
    };
    glUseProgram(msd_gShaderProgramObject);
    
    //declaration of matrices
    vmath::mat4 msd_modelViewMatrix;
    vmath::mat4 msd_modelViewProjectionMatrix;
    vmath::mat4 msd_translationMatrix;
    //initialize above to identity
    msd_modelViewMatrix = vmath::mat4::identity();
    msd_modelViewProjectionMatrix = vmath::mat4::identity();
    msd_translationMatrix = vmath::mat4::identity();
    //do necessary transformation
    msd_translationMatrix = vmath::translate(0.0f,0.0f,-3.0f);
    msd_modelViewMatrix = msd_translationMatrix;
    //do necessary matrix multiplication
    msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_linesCoordinates),
                 msd_linesCoordinates, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_colorCoordinates),
                 msd_colorCoordinates, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    //bind with vao
    glBindVertexArray(msd_vao);
    //draw necessary scene
    glLineWidth(2.0f);
    glDrawArrays(GL_LINES, 0, 6);
    
    //unbind vao
    glBindVertexArray(0);
    
    float s = 0.0f;
    for (int i = 0; i < 40; i++)
    {
        if (i == 20)
            s = 0.0f;
        
        if (i < 20)
        {
            s = s - 1.0f / 20.0f;
            msd_linesCoordinates[0] = -1.0f;
            msd_linesCoordinates[1] = s;
            msd_linesCoordinates[2] = 0.0f;
            msd_linesCoordinates[3] = 1.0f;
            msd_linesCoordinates[4] = s;
            msd_linesCoordinates[5] = 0.0f;
            msd_linesCoordinates[6] = s;
            msd_linesCoordinates[7] = -1.0f;
            msd_linesCoordinates[8] = 0.0f;
            msd_linesCoordinates[9] = s;
            msd_linesCoordinates[10] = 1.0f;
            msd_linesCoordinates[11] = 0.0f;
            glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position);
            glBufferData(GL_ARRAY_BUFFER, sizeof(msd_linesCoordinates),
                         msd_linesCoordinates, GL_DYNAMIC_DRAW);
            glBindBuffer(GL_ARRAY_BUFFER, 0);
            
            glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color);
            glBufferData(GL_ARRAY_BUFFER, sizeof(msd_colorCoordinates),
                         msd_colorCoordinates, GL_DYNAMIC_DRAW);
            glBindBuffer(GL_ARRAY_BUFFER, 0);
            glBindVertexArray(msd_vao);
            glLineWidth(1.0f);
            glDrawArrays(GL_LINES, 0, 6);
            glBindVertexArray(0);
        }
        else
        {
            s = s + 1.0f / 20.0f;
            msd_linesCoordinates[0] = -1.0f;
            msd_linesCoordinates[1] = s;
            msd_linesCoordinates[2] = 0.0f;
            msd_linesCoordinates[3] = 1.0f;
            msd_linesCoordinates[4] = s;
            msd_linesCoordinates[5] = 0.0f;
            msd_linesCoordinates[6] = s;
            msd_linesCoordinates[7] = -1.0f;
            msd_linesCoordinates[8] = 0.0f;
            msd_linesCoordinates[9] = s;
            msd_linesCoordinates[10] = 1.0f;
            msd_linesCoordinates[11] = 0.0f;
            glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position);
            glBufferData(GL_ARRAY_BUFFER, sizeof(msd_linesCoordinates),
                         msd_linesCoordinates, GL_DYNAMIC_DRAW);
            glBindBuffer(GL_ARRAY_BUFFER, 0);
            
            glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color);
            glBufferData(GL_ARRAY_BUFFER, sizeof(msd_colorCoordinates),
                         msd_colorCoordinates, GL_DYNAMIC_DRAW);
            glBindBuffer(GL_ARRAY_BUFFER, 0);
            glBindVertexArray(msd_vao);
            glLineWidth(1.0f);
            glDrawArrays(GL_LINES, 0, 6);
            glBindVertexArray(0);
        }
    }
    //unuse program
    glUseProgram(0);

    glBindRenderbuffer(GL_RENDERBUFFER, colorRenderBuffer);
    [eaglContext presentRenderbuffer:GL_RENDERBUFFER];
}

-(void)layoutSubviews
{
    GLint width;
    GLint height;
    
    glBindRenderbuffer(GL_RENDERBUFFER, colorRenderBuffer);
    [eaglContext renderbufferStorage:GL_RENDERBUFFER fromDrawable:(CAEAGLLayer*)self.layer];
    glGetRenderbufferParameteriv(GL_RENDERBUFFER, GL_RENDERBUFFER_WIDTH, &width);
    glGetRenderbufferParameteriv(GL_RENDERBUFFER, GL_RENDERBUFFER_HEIGHT, &height);
    
    glGenRenderbuffers(1, &depthRenderBuffer);
    glBindRenderbuffer(GL_RENDERBUFFER, depthRenderBuffer);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, width, height);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthRenderBuffer);
    
    glViewport(0, 0, width, height);
    
    if(height==0)
        height=1;
    msd_perspectiveProjectionMatrix=vmath::perspective(45.0f,
                                                       (GLfloat)width / (GLfloat)height,
                                                       0.1f,
                                                       100.0f);
    if(glCheckFramebufferStatus(GL_FRAMEBUFFER)!=GL_FRAMEBUFFER_COMPLETE)
    {
        printf("Failed to create complete FrameBuffer Object %x\n",glCheckFramebufferStatus(GL_FRAMEBUFFER));
    }
    [self drawView:nil];
    
}

-(id)startAnimation
{
    if(!isAnimating)
    {
        displayLink=[NSClassFromString(@"CADisplayLink")displayLinkWithTarget:self selector:@selector(drawView:)];
        [displayLink setPreferredFramesPerSecond:animationFrameInterval];
        [displayLink addToRunLoop:[NSRunLoop currentRunLoop]forMode:NSDefaultRunLoopMode];
        
        isAnimating=YES;
    }
    return self;
}

-(id)stopAnimation
{
    [displayLink invalidate];
    displayLink=nil;
    isAnimating=NO;
    return self;
}

//to become first responder
-(BOOL)acceptsFirstResponder
{
    return (YES);
}

-(void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    
}

-(void)onSingleTap:(UITapGestureRecognizer *)gr
{
    
}
-(void)onDoubleTap:(UITapGestureRecognizer *)gr
{
    
}

-(void)onSwipe:(UISwipeGestureRecognizer *)gr
{
    [self release];
    exit(0);
}
-(void)onLongPress:(UILongPressGestureRecognizer *)gr
{
    
}

-(void)dealloc
{
    if (msd_vbo_position)
    {
        glDeleteBuffers(1, &msd_vbo_position);
        msd_vbo_position = 0;
    }
    if (msd_vbo_color)
    {
        glDeleteBuffers(1, &msd_vbo_color);
        msd_vbo_color = 0;
    }
    if (msd_vao)
    {
        glDeleteBuffers(1, &msd_vao);
        msd_vao = 0;
    }
    glUseProgram(msd_gShaderProgramObject);
    glDetachShader(msd_gShaderProgramObject, GL_FRAGMENT_SHADER);
    glDetachShader(msd_gShaderProgramObject, GL_VERTEX_SHADER);
    glDeleteShader(msd_gFragmentShaderObject);
    msd_gFragmentShaderObject = 0;
    glDeleteShader(msd_gVertexShaderObject);
    msd_gVertexShaderObject = 0;
    glDeleteProgram(msd_gShaderProgramObject);
    msd_gShaderProgramObject = 0;
    glUseProgram(0);
    
    //code
    if (depthRenderBuffer) {
        glDeleteRenderbuffers(1, &depthRenderBuffer);
        depthRenderBuffer=0;
    }
    if (colorRenderBuffer) {
        glDeleteRenderbuffers(1, &colorRenderBuffer);
        colorRenderBuffer=0;
    }
    if (defaultFrameBuffer) {
        glDeleteRenderbuffers(1, &defaultFrameBuffer);
        defaultFrameBuffer=0;
    }
    if ([EAGLContext currentContext]==eaglContext) {
        [EAGLContext setCurrentContext:nil];
    }
    [eaglContext release];
    eaglContext=nil;
    [super dealloc];
}
@end
