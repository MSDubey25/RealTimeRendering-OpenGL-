//
//  GLESView.m
//  25-Soloar_System_Moon
//
//  Created by Ajay Arun Pawar on 29/01/20.
//

#import <OpenGLES/ES3/gl.h>
#import <OpenGLES/ES3/glext.h>
#import "GLESView.h"
#import "vmath.h"
#import "Sphere.h"
#define num 1000

enum {
    AMC_ATTRIBUTE_POSITION=0,
    AMC_ATTRIBUTE_COLOR,
    AMC_ATTRIBUTE_NORMAL,
    AMC_ATTRIBUTE_TEXCOORD0
};
class Stack
{
public:
    // ctor/dtor
    Stack();
    
    
    void pushMatrix(vmath::mat4 data);
    vmath::mat4 popMatrix();
    
private:
    struct Node
    {
        vmath::mat4 data = vmath::mat4::identity();
        struct Node *next = NULL;
    }
    
    *top = NULL;
    
    
}sp;
Stack::Stack()
{
    top = NULL;
}

// to empty and destroy the MatrixStack


// to insert elements in MatrixStack
void Stack::pushMatrix(vmath::mat4 val)
{
    struct Node *temp;
    temp = (struct Node*)malloc(sizeof(struct Node));
    temp->data = val;
    temp->next = top;
    top = temp;
}

// to delete elements from MatrixStack
vmath::mat4 Stack::popMatrix()
{
    struct Node *temp;
    vmath::mat4 val;
    val.identity();
    if (top == NULL)
    {
        
    }
    else
    {
        temp = top;
        top = top->next;
        val = temp->data;
        free(temp);
    }
    return val;
}

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
    
    GLuint msd_mUniform;
     GLuint msd_vUniform;
    GLuint msd_pUniform;
    GLuint msd_ldUniform;
    GLuint msd_kdUniform;
    GLuint msd_lightPositionUniform;
    GLfloat msd_isLkeyPressedUniform_vertex;
    GLfloat msd_isLkeyPressedUniform_fragment;
    vmath::mat4 msd_projectionMatrix;
    vmath::mat4 msd_modelMatrix;
    vmath::mat4 msd_viewMatrix;
    
    GLfloat msd_angle_rect;
    bool msd_gbIsLighting;
    bool msd_gbIsAnimation;
    Sphere *msd_sphere;
    
    GLuint msd_vao_sphere;
    GLuint msd_vbo_sphere_position;
    GLuint msd_vbo_sphere_normal;
    GLuint msd_vbo_sphere_element;
    
    float msd_sphere_vertices[1146];
    float msd_sphere_normals[1146];
    float msd_sphere_textures[746];
    short msd_sphere_elements[2280];

    int msd_numVertices;
    int msd_numElements;
    
    int year;
    int day;
}
- (id)initWithFrame:(CGRect)frame
{
    self=[super initWithFrame:frame];
    msd_angle_rect = 0.0f;
    msd_gbIsLighting = false;
    msd_gbIsAnimation = false;
    msd_sphere=[Sphere alloc];

    [msd_sphere getSphereVertexData:msd_sphere_vertices andArray1:msd_sphere_normals andArray2:msd_sphere_textures andArray3:msd_sphere_elements];
    
    
    msd_numVertices=[msd_sphere getNumberOfSphereVertices];
    msd_numElements=[msd_sphere getNumberOfSphereElements];
    
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
        "out vec4 out_vColor;" \
        "uniform mat4 u_m_matrix;" \
        "uniform mat4 u_v_matrix;" \
        "uniform mat4 u_p_matrix;" \
        "void main(void)" \
        "{" \
        "out_vColor=vColor;" \
        "gl_Position=u_p_matrix * u_v_matrix * u_m_matrix * vPosition;" \
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
        "in vec4 out_vColor;" \
        "out vec4 FragColor;" \
        "void main(void)" \
        "{" \
        "FragColor=out_vColor;" \
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
        //post linking retrieving uniform location
        msd_mUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_m_matrix");
        msd_pUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_p_matrix");
        msd_vUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_v_matrix");
        
        glGenVertexArrays(1, &msd_vao_sphere);
        glBindVertexArray(msd_vao_sphere);
        glGenBuffers(1, &msd_vbo_sphere_position);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_sphere_position);
        glBufferData(GL_ARRAY_BUFFER, sizeof(msd_sphere_vertices), msd_sphere_vertices, GL_STATIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        
        
        glGenBuffers(1, &msd_vbo_sphere_normal);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_sphere_normal);
        glBufferData(GL_ARRAY_BUFFER, sizeof(msd_sphere_normals), msd_sphere_normals, GL_STATIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_NORMAL);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        
        glGenBuffers(1, &msd_vbo_sphere_element);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(msd_sphere_elements), msd_sphere_elements, GL_STATIC_DRAW);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
        
        glBindVertexArray(0);
        /////////////////////////////////////////////////////////
        glClearDepthf(1.0f);
        msd_projectionMatrix = vmath::mat4::identity();
        msd_modelMatrix = vmath::mat4::identity();
        msd_viewMatrix = vmath::mat4::identity();
        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        
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
    
    //declaration of matrices
    vmath::mat4 msd_translationMatrix;
    vmath::mat4 msd_rotationMatrix;
    vmath::mat4 msd_scaleMatrix;
    
    msd_modelMatrix = vmath::mat4::identity();
    //initialize above to identity
    msd_translationMatrix = vmath::mat4::identity();
    msd_rotationMatrix = vmath::mat4::identity();
    msd_scaleMatrix = vmath::mat4::identity();
    msd_translationMatrix = vmath::translate(0.0f, 0.0f, -5.0f);
    msd_modelMatrix = msd_translationMatrix * msd_modelMatrix;
    sp.pushMatrix(msd_modelMatrix);
    //do necessary transformation
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    glVertexAttrib3f(AMC_ATTRIBUTE_COLOR, 1.0f, 1.0f, 0.0f);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_sphere_position);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_sphere_vertices),
                 msd_sphere_vertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    // normal vbo
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_sphere_normal);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_sphere_normals), msd_sphere_normals, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    // element vbo
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(msd_sphere_elements), msd_sphere_elements, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
    
    //glVertexAttrib3f(AMC_ATTRIBUTE_COLOR, 0.0f, 0.0f, 1.0f);
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    sp.popMatrix();
    
    //EARTH
    msd_translationMatrix = vmath::mat4::identity();
    msd_rotationMatrix = vmath::mat4::identity();
    msd_scaleMatrix = vmath::mat4::identity();
    
    msd_rotationMatrix = vmath::rotate(GLfloat(year), 0.0f, 1.0f, 0.0f);//make z-axis of sphere as y
    msd_modelMatrix = msd_modelMatrix * msd_rotationMatrix;
    
    msd_translationMatrix = vmath::translate(1.5f, 0.0f, 0.0f);
    msd_modelMatrix = msd_modelMatrix * msd_translationMatrix;
    msd_rotationMatrix = vmath::mat4::identity();
    msd_rotationMatrix = vmath::rotate(GLfloat(day), 0.0f, 1.0f, 0.0f);//make z-axis of sphere as y
    msd_modelMatrix = msd_modelMatrix * msd_rotationMatrix;
    
    msd_scaleMatrix = vmath::scale(0.60f, 0.6f, 0.6f);
    msd_modelMatrix = msd_modelMatrix * msd_scaleMatrix;
    
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    glVertexAttrib3f(AMC_ATTRIBUTE_COLOR, 0.0f, 0.0f, 1.0f);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_sphere_position);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_sphere_vertices),
                 msd_sphere_vertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    // normal vbo
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_sphere_normal);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_sphere_normals), msd_sphere_normals, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    // element vbo
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(msd_sphere_elements), msd_sphere_elements, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    sp.popMatrix();
    
    //MOON
    msd_translationMatrix=vmath::mat4::identity();
    msd_rotationMatrix = vmath::mat4::identity();
    msd_scaleMatrix = vmath::mat4::identity();
    
    msd_translationMatrix = vmath::translate(1.0f, 0.0f, 0.0f);
    msd_modelMatrix = msd_modelMatrix * msd_translationMatrix;
    msd_scaleMatrix = vmath::scale(0.5f, 0.5f, 0.5f);
    msd_modelMatrix = msd_modelMatrix * msd_scaleMatrix;
    
    msd_rotationMatrix = vmath::rotate(GLfloat(day), 0.0f, 0.0f, 1.0f);//make z-axis of sphere as y
    msd_modelMatrix = msd_modelMatrix * msd_rotationMatrix;
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    glVertexAttrib3f(AMC_ATTRIBUTE_COLOR, 1.0f, 1.0f, 1.0f);
    
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_sphere_position);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_sphere_vertices),
                 msd_sphere_vertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    // normal vbo
    glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_sphere_normal);
    glBufferData(GL_ARRAY_BUFFER, sizeof(msd_sphere_normals), msd_sphere_normals, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    // element vbo
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(msd_sphere_elements), msd_sphere_elements, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
    
    //glVertexAttrib3f(AMC_ATTRIBUTE_COLOR, 0.0f, 0.0f, 1.0f);
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    sp.popMatrix();
    //unuse program
    glUseProgram(0);
    [self update];
    glBindRenderbuffer(GL_RENDERBUFFER, colorRenderBuffer);
    [eaglContext presentRenderbuffer:GL_RENDERBUFFER];

}
-(void)update{
    if(msd_gbIsAnimation==true)
    {
        day = (day + 3) % 360;
        
        year = (year + 1) % 360;
        
    }
    
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
    msd_projectionMatrix=vmath::perspective(45.0f,
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
    if (msd_gbIsAnimation == false)
    {
        msd_gbIsAnimation = true;
    }
    else
    {
        msd_gbIsAnimation = false;
    }
    
    
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
    if (msd_vbo_sphere_normal)
    {
        glDeleteBuffers(1, &msd_vbo_sphere_normal);
        msd_vbo_sphere_normal = 0;
    }
    if (msd_vbo_sphere_element)
    {
        glDeleteBuffers(1, &msd_vbo_sphere_element);
        msd_vbo_sphere_element = 0;
    }
    
    if (msd_vbo_sphere_position)
    {
        glDeleteBuffers(1, &msd_vbo_sphere_position);
        msd_vbo_sphere_position = 0;
    }
    
    
    if (msd_vao_sphere)
    {
        glDeleteVertexArrays(1, &msd_vao_sphere);
        msd_vao_sphere = 0;
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
