//
//  GLESView.m
//  06-Two_3D-Shapes_Animation
//
//  Created by Ajay Arun Pawar on 16/01/20.
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
    
    GLuint msd_vao_pyramid;
    GLuint msd_vao_cube;
    GLuint msd_vbo_position_pyramid;
    GLuint msd_vbo_position_cube;
    GLuint msd_vbo_color_pyramid;
    GLuint msd_vbo_color_cube;
    GLuint msd_mvpUniform;
    
    GLfloat msd_angle_pyramid;
    GLfloat msd_angle_cube;
    
    
    vmath::mat4 msd_perspectiveProjectionMatrix;
}
- (id)initWithFrame:(CGRect)frame
{
    self=[super initWithFrame:frame];
    msd_angle_pyramid=0.0f;
    msd_angle_cube=0.0f;
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
            0.0f,1.0f,0.0f//g
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
        
        //create vao
        glGenVertexArrays(1, &msd_vao_pyramid);
        glBindVertexArray(msd_vao_pyramid);
        glGenBuffers(1, &msd_vbo_position_pyramid);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_pyramid);
        glBufferData(GL_ARRAY_BUFFER, sizeof(pyramidVertices),
                     pyramidVertices, GL_STATIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        //for color
        glGenBuffers(1, &msd_vbo_color_pyramid);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_pyramid);
        glBufferData(GL_ARRAY_BUFFER, sizeof(pyramidVerticesColor),
                     pyramidVerticesColor, GL_STATIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_COLOR, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_COLOR);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindVertexArray(0);
        /////////////////////////////////////////////////////////
        
        //create vao
        glGenVertexArrays(1, &msd_vao_cube);
        glBindVertexArray(msd_vao_cube);
        glGenBuffers(1, &msd_vbo_position_cube);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_cube);
        glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVertices),
                     cubeVertices, GL_STATIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        //for color
        glGenBuffers(1, &msd_vbo_color_cube);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_cube);
        glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVerticesColor),
                     cubeVerticesColor, GL_STATIC_DRAW);
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
    glUseProgram(msd_gShaderProgramObject);
    
    glUseProgram(msd_gShaderProgramObject);
    
    //declaration of matrices
    vmath::mat4 msd_modelViewMatrix;
    vmath::mat4 msd_modelViewProjectionMatrix;
    vmath::mat4 msd_translationMatrix;
    vmath::mat4 msd_rotationMatrix;
    vmath::mat4 msd_scaleMatrix;
    //initialize above to identity
    //bind with vao
    glBindVertexArray(msd_vao_pyramid);
    //initialize above to identity
    msd_modelViewMatrix = vmath::mat4::identity();
    msd_modelViewProjectionMatrix = vmath::mat4::identity();
    msd_translationMatrix = vmath::mat4::identity();
    msd_rotationMatrix = vmath::mat4::identity();
    msd_scaleMatrix = vmath::mat4::identity();
    //do necessary transformation
    msd_translationMatrix = vmath::translate(-2.0f,0.0f,-6.0f);
    msd_rotationMatrix = vmath::rotate(msd_angle_pyramid,0.0f,1.0f,0.0f);
    msd_modelViewMatrix = msd_translationMatrix*msd_rotationMatrix;
    //do necessary matrix multiplication
    msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
    
    //similarly bind with textures if any
    
    //draw necessary scene
    glDrawArrays(GL_TRIANGLES, 0, 12);
    
    //unbind vao
    glBindVertexArray(0);
    //bind with vao
    glBindVertexArray(msd_vao_cube);
    msd_modelViewMatrix = vmath::mat4::identity();
    //modelViewProjectionMatrix = mat4::identity();
    msd_translationMatrix = vmath::mat4::identity();
    msd_rotationMatrix = vmath::mat4::identity();
    msd_translationMatrix = vmath::translate(2.0f, 0.0f, -6.0f);
    msd_scaleMatrix=vmath::scale(0.75f, 0.75f, 0.75f);
    msd_rotationMatrix = vmath::rotate(msd_angle_cube, 1.0f, 0.0f, 0.0f);
    msd_rotationMatrix = msd_rotationMatrix*vmath::rotate(msd_angle_cube, 0.0f, 1.0f, 0.0f);
    msd_rotationMatrix = msd_rotationMatrix*vmath::rotate(msd_angle_cube, 0.0f, 0.0f, 1.0f);
    msd_modelViewMatrix = msd_translationMatrix*msd_scaleMatrix*msd_rotationMatrix;
    msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
    
    glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
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
    glBindRenderbuffer(GL_RENDERBUFFER, colorRenderBuffer);
    [eaglContext presentRenderbuffer:GL_RENDERBUFFER];
    msd_angle_pyramid += 0.5f;
    if (msd_angle_pyramid >= 360.0f)
        msd_angle_pyramid = 0;
    msd_angle_cube += 0.5f;
    if (msd_angle_cube >= 360.0f)
        msd_angle_cube = 0;
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
    if (msd_vbo_position_pyramid)
    {
        glDeleteBuffers(1, &msd_vbo_position_pyramid);
        msd_vbo_position_pyramid = 0;
    }
    if (msd_vao_pyramid)
    {
        glDeleteBuffers(1, &msd_vao_pyramid);
        msd_vao_pyramid= 0;
    }
    if (msd_vbo_color_pyramid)
    {
        glDeleteBuffers(1, &msd_vbo_color_pyramid);
        msd_vbo_color_pyramid = 0;
    }
    if (msd_vbo_position_cube)
    {
        glDeleteBuffers(1, &msd_vbo_position_cube);
        msd_vbo_position_cube = 0;
    }
    if (msd_vbo_color_cube)
    {
        glDeleteBuffers(1, &msd_vbo_color_cube);
        msd_vbo_color_cube = 0;
    }
    if (msd_vao_cube)
    {
        glDeleteBuffers(1, &msd_vao_cube);
        msd_vao_cube = 0;
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
