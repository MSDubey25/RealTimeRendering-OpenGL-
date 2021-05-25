//
//  GLESView.m
//  19-Diffuse_Light_On_Sphere_Per_Vertex
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
    
    GLuint msd_mvUniform;
    GLuint msd_pUniform;
    GLuint msd_laUniform;
    GLuint msd_ldUniform;
    GLuint msd_lsUniform;
    GLuint msd_lightPositionUniform;
    GLuint msd_kaUniform;
    GLuint msd_kdUniform;
    GLuint msd_ksUniform;
    GLuint msd_materialShininessUniform;
    GLfloat msd_isLkeyPressedUniform_vertex;
    GLfloat msd_isLkeyPressedUniform_fragment;
    vmath::mat4 msd_perspectiveProjectionMatrix;
    vmath::mat4 msd_modelViewMatrix;
    
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
    
    float msd_light_ambient[4];
    float msd_light_diffuse[4];
    float msd_light_specular[4];
    float msd_light_position[4];
    
    float msd_material_ambient[4];
    float msd_material_diffuse[4];
    float msd_material_specular[4];
    float msd_material_shininess[1];
}
- (id)initWithFrame:(CGRect)frame
{
    self=[super initWithFrame:frame];
    msd_angle_rect = 0.0f;
    msd_gbIsLighting = false;
    msd_gbIsAnimation = false;
    msd_sphere=[Sphere alloc];
    msd_light_ambient[0]=0.0f;
    msd_light_ambient[1]=0.0f;
    msd_light_ambient[2]=0.0f;
    msd_light_ambient[3]=0.0f;
    
    msd_light_diffuse[0]=1.0f;
    msd_light_diffuse[1]=1.0f;
    msd_light_diffuse[2]=1.0f;
    msd_light_diffuse[3]=1.0f;
    
    msd_light_specular[0]=1.0f;
    msd_light_specular[1]=1.0f;
    msd_light_specular[2]=1.0f;
    msd_light_specular[3]=1.0f;
    
    msd_light_position[0]=100.0f;
    msd_light_position[1]=100.0f;
    msd_light_position[2]=100.0f;
    msd_light_position[3]=1.0f;
    
    msd_material_ambient[0]=0.0f;
    msd_material_ambient[1]=0.0f;
    msd_material_ambient[2]=0.0f;
    msd_material_ambient[3]=0.0f;
    
    msd_material_diffuse[0]=1.0f;
    msd_material_diffuse[1]=1.0f;
    msd_material_diffuse[2]=1.0f;
    msd_material_diffuse[3]=1.0f;
    
    msd_material_specular[0]=1.0f;
    msd_material_specular[1]=1.0f;
    msd_material_specular[2]=1.0f;
    msd_material_specular[3]=1.0f;
    
    msd_material_shininess[0]=128.0f;

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
        "in vec3 vNormal;" \
        "uniform mat4 u_mv_matrix;" \
        "uniform mat4 u_p_matrix;" \
        "uniform vec3 u_la;" \
        "uniform vec3 u_ld;" \
        "uniform vec3 u_ls;" \
        "uniform vec4 u_lightPosition;" \
        "uniform vec3 u_ka;" \
        "uniform vec3 u_kd;" \
        "uniform vec3 u_ks;" \
        "uniform float u_materialShininess;" \
        "uniform float u_LkeyIsPressed_vertex;" \
        "out vec3 phong_ads_light;" \
        "void main(void)" \
        "{" \
        "    if(u_LkeyIsPressed_vertex==1.0)" \
        "    {" \
        "        vec4 eyeCoordinates=u_mv_matrix*vPosition;" \
        /*"        mat3 normalMatrix= mat3(transpose(inverse(u_v_matrix*u_m_matrix)));" \
         "        vec3 transformedNormal=normalize(normalMatrix*vNormal);" \*/
        "        vec3 transformedNormal=normalize(mat3(u_mv_matrix)*vNormal);" \
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
        "gl_Position=u_p_matrix *u_mv_matrix * vPosition;" \
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
        "in vec3 phong_ads_light;" \
        "uniform float u_LkeyIsPressed_fragment;" \
        "out vec4 FragColor;" \
        "void main(void)" \
        "{" \
        "    if(u_LkeyIsPressed_fragment==1.0)" \
        "    {" \
        "        FragColor=vec4(phong_ads_light,1.0);" \
        "    }" \
        "    else" \
        "    {" \
        "        FragColor=vec4(1.0,1.0,1.0,1.0);" \
        "    }" \
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
        glBindAttribLocation(msd_gShaderProgramObject, AMC_ATTRIBUTE_NORMAL, "vNormal");
        
        
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
        msd_mvUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_mv_matrix");
        msd_pUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_p_matrix");
        
        msd_laUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_la");
        msd_ldUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ld");
        msd_lsUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ls");
        msd_lightPositionUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_lightPosition");
        msd_kaUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ka");
        msd_kdUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_kd");
        msd_ksUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ks");
        msd_materialShininessUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_materialShininess");
        msd_isLkeyPressedUniform_vertex = glGetUniformLocation(msd_gShaderProgramObject, "u_LkeyIsPressed_vertex");
        msd_isLkeyPressedUniform_fragment = glGetUniformLocation(msd_gShaderProgramObject, "u_LkeyIsPressed_fragment");
        
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
        msd_perspectiveProjectionMatrix = vmath::mat4::identity();
        msd_modelViewMatrix = vmath::mat4::identity();
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
    //bind with vao
    //modelViewProjectionMatrix = mat4::identity();
    msd_translationMatrix = vmath::mat4::identity();
    msd_rotationMatrix = vmath::mat4::identity();
    msd_translationMatrix = vmath::translate(0.0f, 0.0f, -3.0f);
    msd_modelViewMatrix = msd_translationMatrix;
   /* msd_rotationMatrix = vmath::rotate(msd_angle_rect,1.0f,0.0f,0.0f);
    msd_modelViewMatrix = msd_modelViewMatrix * msd_rotationMatrix;
    msd_rotationMatrix = vmath::rotate(msd_angle_rect, 0.0f, 1.0f, 0.0f);
    msd_modelViewMatrix = msd_modelViewMatrix * msd_rotationMatrix;
    msd_rotationMatrix = vmath::rotate(msd_angle_rect, 0.0f, 0.0f, 1.0f);*/
    msd_modelViewMatrix = msd_modelViewMatrix * msd_rotationMatrix;
    //modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    if (msd_gbIsLighting == true)
    {
        glUniform1f(msd_isLkeyPressedUniform_vertex, 1.0f);
        glUniform1f(msd_isLkeyPressedUniform_fragment, 1.0f);
        glUniform3fv(msd_laUniform,1, msd_light_ambient);
        glUniform3fv(msd_ldUniform,1, msd_light_diffuse);
        glUniform3fv(msd_lsUniform,1, msd_light_specular);
        glUniform4fv(msd_lightPositionUniform,1,msd_light_position);
        glUniform3fv(msd_kaUniform,1, msd_material_ambient);
        glUniform3fv(msd_kdUniform,1, msd_material_diffuse);
        glUniform3fv(msd_ksUniform,1, msd_material_specular);
        glUniform1fv(msd_materialShininessUniform,1, msd_material_shininess);
        
    }
    else
    {
        glUniform1f(msd_isLkeyPressedUniform_fragment, 0.0f);
        glUniform1f(msd_isLkeyPressedUniform_vertex, 0.0f);
    }
    
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_perspectiveProjectionMatrix);
    glUniformMatrix4fv(msd_mvUniform, 1, GL_FALSE, msd_modelViewMatrix);
    
    //similarly bind with textures if any
    
    //draw necessary scene
    glBindVertexArray(msd_vao_sphere);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    glBindVertexArray(0);
    //unuse program
    glUseProgram(0);
    
    glBindRenderbuffer(GL_RENDERBUFFER, colorRenderBuffer);
    [eaglContext presentRenderbuffer:GL_RENDERBUFFER];
    if (msd_gbIsAnimation == true)
    {
        msd_angle_rect += 0.5f;
        if (msd_angle_rect >= 360.0f)
            msd_angle_rect = 0;
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
    if (msd_gbIsLighting == false)
    {
        msd_gbIsLighting = true;
    }
    else
    {
        msd_gbIsLighting = false;
        //glUniform1i(isLkeyPressedUniform, 0);
    }
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
