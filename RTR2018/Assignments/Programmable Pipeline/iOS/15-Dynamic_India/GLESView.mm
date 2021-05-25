//
//  GLESView.m
//  14-Static_India
//
//  Created by Ajay Arun Pawar on 18/01/20.
//

#import <OpenGLES/ES3/gl.h>
#import <OpenGLES/ES3/glext.h>
#import "GLESView.h"
#import "vmath.h"
#define num 1000

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
    
    GLuint msd_vao_letters;
    GLuint msd_vao_rectangle;
    GLuint msd_vbo_position_letters;
    GLuint msd_vbo_position_rectangle;
    GLuint msd_vbo_color_letters;
    GLuint msd_mvpUniform;
    
  
    vmath::mat4 msd_perspectiveProjectionMatrix;
    
    GLfloat counter1;
    GLfloat counter2;
    GLfloat counter3;
    GLfloat counter4;
    GLfloat counterP1;
    GLfloat xTranslate;
    GLfloat timer;
    
    GLfloat Cr, Cg, Cb;
    GLfloat Gr, Gg, Gb;
    
    bool flagI1;
    bool flagA;
    bool flagN;
    bool flagI2;
    bool flagD;

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
        counter1=0.0f;
        counter2=0.0f;
        counter3=0.0f;
        counter4=0.0f;
        counterP1=0.0f;
        xTranslate=0.0f;
        timer=0.0f;
        
        Cr=0.0f;
        Cg=0.0f;
        Cb=0.0f;
        Gr=0.0f;
        Gg=0.0f;
        Gb=0.0f;
        
        flagI1=false;
        flagA=false;
        flagN=false;
        flagI2=false;
        flagD=false;
        
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
        glGenVertexArrays(1, &msd_vao_letters);
        glBindVertexArray(msd_vao_letters);
        glGenBuffers(1, &msd_vbo_position_letters);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_letters);
        glBufferData(GL_ARRAY_BUFFER, 500*3*4*sizeof(GLfloat),
                     NULL, GL_DYNAMIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        //for color
        glGenBuffers(1, &msd_vbo_color_letters);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_letters);
        glBufferData(GL_ARRAY_BUFFER, 500 * 3 * 4 * sizeof(GLfloat),
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
    const GLfloat msd_IVertices[] = {
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
    const GLfloat msd_NVertices[] = {
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
    const GLfloat msd_DVertices[] = {
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
    const GLfloat msd_AVertices[] = {
        1.25f, 0.75f,0.0, //A
        1.1f, 0.75f,0.0,  //A
        0.9f, -0.75f,0.0, //A
        1.55f, -0.75f,0.0,//A
        1.18f, 0.5f,0.0,//triangle A
        1.05f, -0.75f,0.0,
        1.40f, -0.75f,0.0
        
    };
    const GLfloat msd_FlagVertices[] = {
        0.057f, 0.0f,0.0,
        0.203f, 0.0f,0.0,
        0.205f, -0.05f,0.0,
        0.045f, -0.05f,0.0,
        0.057f, 0.0f ,0.0,
        0.2029f, 0.0f,0.0,
        0.195f, 0.05f,0.0,
        0.065f, 0.05f,0.0f
    };
    
    
    const GLfloat msd_IColor[] = {
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
    const GLfloat msd_NColor[] = {
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
    const GLfloat msd_DColor[] = {
        Cr, Cg, Cb ,     //for D
        Cr, Cg, Cb ,     //for D
        Gr, Gg, Gb , //for D
        Gr, Gg, Gb , //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f ,         //for D
        0.0f, 0.0f, 0.0f //for D
    };
    const GLfloat msd_AColor[] = {
        1.0f, 0.6f, 0.2f,      //A
        1.0f, 0.6f, 0.2f,       //A
        0.071f, 0.533f, 0.027f,//A
        0.071f, 0.533f, 0.027f,//A
        0.0f, 0.0f, 0.0f,       //A
        0.0f, 0.0f, 0.0f,       //A
        0.0f, 0.0f, 0.0f       //A
    };
    
    const GLfloat msd_FlagColor[] = {
        1.0f, 1.0f, 1.0f,
        1.0f, 1.0f, 1.0f,
        0.071f, 0.533f, 0.027f,
        0.071f, 0.533f, 0.027f,
        1.0f, 1.0f, 1.0f,
        1.0f, 1.0f, 1.0f,
        1.0f, 0.6f, 0.2f,
        1.0f, 0.6f, 0.2f
    };
    glUseProgram(msd_gShaderProgramObject);
    
    //declaration of matrices
    vmath::mat4 msd_modelViewMatrix;
    vmath::mat4 msd_modelViewProjectionMatrix;
    vmath::mat4 msd_translationMatrix;
    vmath::mat4 msd_rotationMatrix;
    vmath::mat4 msd_scaleMatrix;
    //initialize above to identity
    msd_modelViewMatrix = vmath::mat4::identity();
    msd_modelViewProjectionMatrix = vmath::mat4::identity();
    msd_translationMatrix = vmath::mat4::identity();
    msd_rotationMatrix = vmath::mat4::identity();
    msd_scaleMatrix = vmath::mat4::identity();
    //do necessary transformation
    msd_translationMatrix = vmath::translate(-2.0f+counter1,0.0f,-3.0f);
    msd_scaleMatrix=vmath::scale(0.8f, 0.9f, 0.0f);
    msd_modelViewMatrix = msd_translationMatrix*msd_scaleMatrix;
    //do necessary matrix multiplication
    msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
    
    //similarly bind with textures if any
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_IVertices),
                 msd_IVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_IColor),
                 msd_IColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(msd_vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    
    msd_translationMatrix = vmath::translate(0.2f, 6.5f-counter3, 0.0f);
    msd_modelViewMatrix = msd_translationMatrix*msd_modelViewMatrix;
    //do necessary matrix multiplication
    msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_NVertices),
                 msd_NVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_NColor),
                 msd_NColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(msd_vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    
    msd_translationMatrix = vmath::translate(0.05f, 0.0f, 0.0f);
    msd_modelViewMatrix = msd_translationMatrix * msd_modelViewMatrix;
    //do necessary matrix multiplication
    msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_DVertices),
                 msd_DVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_DColor),
                 msd_DColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(msd_vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    msd_modelViewMatrix = vmath::mat4::identity();
    msd_translationMatrix = vmath::translate(1.85f, -2.5f+counter4, -3.0f);
    msd_modelViewMatrix = msd_translationMatrix *msd_scaleMatrix* msd_modelViewMatrix;
    //do necessary matrix multiplication
    msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_IVertices),
                 msd_IVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_IColor),
                 msd_IColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(msd_vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
    glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    msd_modelViewMatrix = vmath::mat4::identity();
    msd_translationMatrix = vmath::translate(2.15f - counter2, 0.0f, -3.0f);
    msd_modelViewMatrix = msd_translationMatrix * msd_scaleMatrix*msd_modelViewMatrix;
    //do necessary matrix multiplication
    msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_AVertices),
                 msd_AVertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_letters);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_AColor),
                 msd_AColor, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    //bind with vao
    glBindVertexArray(msd_vao_letters);
    //draw necessary scene
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glDrawArrays(GL_TRIANGLES, 4, 3);
    //glDrawArrays(GL_TRIANGLE_FAN, 8, 4);
    //unbind vao
    glBindVertexArray(0);
    
    
    GLfloat msd_circle[1000];
    GLfloat msd_circleColor[1000];
    for (int i = 0; i < 998; i=i+3)
    {
        GLfloat msd_angle = 2 * M_PI*i / num;
        msd_circle[i] = 0.01f*cos(msd_angle);
        msd_circle[i+1] = 0.01f*sin(msd_angle);
        msd_circle[i+2] = 0.0f;
        msd_circleColor[i] = 0.0f;
        msd_circleColor[i+1] = 0.0f;
        msd_circleColor[i+2] = 1.0f;
    }
    if(flagD==true && Gg >= 0.027 && Gg >= 0.533f && Gr >= 0.071f)
    {
        
        msd_modelViewMatrix = vmath::mat4::identity();
        msd_translationMatrix = vmath::translate(1.127f, 0.0f, -3.0f);
        msd_modelViewMatrix = msd_translationMatrix * msd_scaleMatrix*msd_modelViewMatrix;
        //do necessary matrix multiplication
        msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
        
        //send necessary matrices to shaders in respective uniforms
        glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_letters);
        glBufferData(GL_ARRAY_BUFFER, sizeof(msd_FlagVertices),
                     msd_FlagVertices, GL_DYNAMIC_DRAW);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_letters);
        glBufferData(GL_ARRAY_BUFFER, sizeof(msd_FlagColor),
                     msd_FlagColor, GL_DYNAMIC_DRAW);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        
        //bind with vao
        glBindVertexArray(msd_vao_letters);
        //draw necessary scene
        glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
        glDrawArrays(GL_TRIANGLE_FAN, 4, 4);
        //unbind vao
        glBindVertexArray(0);
        
        msd_modelViewMatrix = vmath::mat4::identity();
        msd_translationMatrix = vmath::translate(1.23f, 0.0f, -3.0f);
        msd_modelViewMatrix = msd_translationMatrix *msd_modelViewMatrix;
        //do necessary matrix multiplication
        msd_modelViewProjectionMatrix = msd_perspectiveProjectionMatrix * msd_modelViewMatrix;
        
        //send necessary matrices to shaders in respective uniforms
        glUniformMatrix4fv(msd_mvpUniform, 1, GL_FALSE, msd_modelViewProjectionMatrix);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_letters);
        glBufferData(GL_ARRAY_BUFFER, sizeof(msd_circle),
                     msd_circle, GL_DYNAMIC_DRAW);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_color_letters);
        glBufferData(GL_ARRAY_BUFFER, sizeof(msd_circleColor),
                     msd_circleColor, GL_DYNAMIC_DRAW);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        
        //bind with vao
        glBindVertexArray(msd_vao_letters);
        //draw necessary scene
        //glPointSize(2.0f);
        for (int i = 0; i < 997; i += 2)
        {
            glDrawArrays(GL_POINTS, i, i + 2);
        }
    }
    
    //unbind vao
    glBindVertexArray(0);
    //unuse program
    glUseProgram(0);
    
    
    glBindRenderbuffer(GL_RENDERBUFFER, colorRenderBuffer);
    if (counter1 <= 2.0f && flagI1 == false)
    {
        counter1 = counter1 + 0.025f;
    }
    else
    {
        flagI1 = true;
    }
    if (counter2 <= 1.85f && flagI1 == true)
    {
        counter2 = counter2 + 0.025f;
    }
    else
    {
        flagA = true;
    }
    if (counter3 <= 6.5f &&  flagA==true)
    {
        counter3 = counter3 + 0.025f;
    }
    else
    {
        flagN = true;
    }
    if (counter4 <= 2.5f &&  flagN == true)
    {
        counter4 = counter4 + 0.025f;
    }
    else
    {
        flagI2 = true;
    }
    if (counter4>=2.5f)
    {
        if(Cr<=1.0f)
        Cr = Cr + 0.025f;
        if(Cg<=0.6f)
        Cg = Cg + 0.025f;
        if(Cb<=0.2)
        Cb = Cb + 0.025f;
        if (Gr <= 0.071f)
        Gr = Gr + 0.0025f;
        if (Gg <= 0.533f)
        Gg = Gg + 0.0025f;
        if (Gb <= 0.027)
        Gb = Gb + 0.0025f;
    }
    else
    {
        flagD = true;
    }
    if (counterP1 <= 2.9f &&   Cr > 0.99f && Gg > 0.472f)
    {
        if (xTranslate <= 1.25f)
        {
            counterP1 = counterP1 + 0.00007f;
            xTranslate += 0.00007f;
        }
        else if (xTranslate >= 1.25f && xTranslate<=2.09f)
        {
            xTranslate += 0.00007f;
        }
        else
        {
            //counterP1 = counterP1 + 0.0001f;
            timer += 0.00007f;
        }
        if (timer >= 1.92f)
        {
            counterP1 = counterP1 + 0.0001f;
            
        }
    }
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
    if (msd_vbo_position_letters)
    {
        glDeleteBuffers(1, &msd_vbo_position_letters);
        msd_vbo_position_letters = 0;
    }
    if (msd_vao_letters)
    {
        glDeleteBuffers(1, &msd_vao_letters);
        msd_vao_letters = 0;
    }
    if (msd_vbo_position_rectangle)
    {
        glDeleteBuffers(1, &msd_vbo_position_rectangle);
        msd_vbo_position_rectangle = 0;
    }
    if (msd_vao_rectangle)
    {
        glDeleteBuffers(1, &msd_vao_rectangle);
        msd_vao_rectangle = 0;
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
