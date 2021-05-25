//
//  GLESView.m
//  18-Two_Lights_On_Rotating_Pyramid
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
    
    GLuint msd_vao_pyramid;
    GLuint msd_vbo_position_pyramid;
    GLuint msd_vbo_normal_pyramid;
    GLuint msd_mUniform;
    GLuint msd_vUniform;
    GLuint msd_pUniform;
    GLuint msd_laRedUniform;
    GLuint msd_ldRedUniform;
    GLuint msd_lsRedUniform;
    GLuint msd_lightPositionRedUniform;
    GLuint msd_laBlueUniform;
    GLuint msd_ldBlueUniform;
    GLuint msd_lsBlueUniform;
    GLuint msd_lightPositionBlueUniform;
    GLuint msd_kaUniform;
    GLuint msd_kdUniform;
    GLuint msd_ksUniform;
    GLuint msd_materialShininessUniform;
    GLuint msd_isLkeyPressedUniform;
    
    
    vmath::mat4 msd_projectionMatrix;
    vmath::mat4 msd_modelMatrix;
    vmath::mat4 msd_viewMatrix;

    GLfloat msd_angle_rect;
    bool msd_gbIsLighting;
    bool msd_gbIsAnimation;
    
    float msd_light_ambient_red[4];
    float msd_light_diffuse_red[4];
    float msd_light_specular_red[4];
    float msd_light_position_red[4];
    
    float msd_light_ambient_blue[4];
    float msd_light_diffuse_blue[4];
    float msd_light_specular_blue[4];
    float msd_light_position_blue[4];
    
    
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
    msd_light_ambient_red[0]=0.0f;
    msd_light_ambient_red[1]=0.0f;
    msd_light_ambient_red[2]=0.0f;
    msd_light_ambient_red[3]=1.0f;
    msd_light_diffuse_red[0]=1.0f;
    msd_light_diffuse_red[1]=0.0f;
    msd_light_diffuse_red[2]=0.0f;
    msd_light_diffuse_red[3]=1.0f;
    msd_light_specular_red[0]=1.0f;
    msd_light_specular_red[1]=0.0f;
    msd_light_specular_red[2]=0.0f;
    msd_light_specular_red[3]=1.0f;
    msd_light_position_red[0]=-2.0f;
    msd_light_position_red[1]=0.0f;
    msd_light_position_red[2]=0.0f;
    msd_light_position_red[3]=1.0f;
    
    msd_light_ambient_blue[0]=0.0f;
    msd_light_ambient_blue[1]=0.0f;
    msd_light_ambient_blue[2]=0.0f;
    msd_light_ambient_blue[3]=1.0f;
    msd_light_diffuse_blue[0]=0.0f;
    msd_light_diffuse_blue[1]=0.0f;
    msd_light_diffuse_blue[2]=1.0f;
    msd_light_diffuse_blue[3]=1.0f;
    msd_light_specular_blue[0]=0.0f;
    msd_light_specular_blue[1]=0.0f;
    msd_light_specular_blue[2]=1.0f;
    msd_light_specular_blue[3]=1.0f;
    msd_light_position_blue[0]=2.0f;
    msd_light_position_blue[1]=0.0f;
    msd_light_position_blue[2]=0.0f;
    msd_light_position_blue[3]=1.0f;
    
    msd_material_ambient[0]=0.5f;
    msd_material_ambient[1]=0.5f;
    msd_material_ambient[2]=0.5f;
    msd_material_ambient[3]=1.0f;
    msd_material_diffuse[0]=1.0f;
    msd_material_diffuse[1]=1.0f;
    msd_material_diffuse[2]=1.0f;
    msd_material_diffuse[3]=1.0f;
    msd_material_specular[0]=1.0f;
    msd_material_specular[1]=1.0f;
    msd_material_specular[2]=1.0f;
    msd_material_specular[3]=1.0f;
    msd_material_shininess[0]=128.0f;

    
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
        "uniform mat4 u_m_matrix;" \
        "uniform mat4 u_v_matrix;" \
        "uniform mat4 u_p_matrix;" \
        "uniform vec4 u_lightPosition;" \
        "uniform vec4 u_lightPosition_blue;" \
        "uniform float u_LkeyIsPressed;" \
        "out vec3 light_direction;" \
        "out vec3 reflection_vector;" \
        "out vec3 light_direction_blue;" \
        "out vec3 reflection_vector_blue;" \
        "out vec3 viewer_vector;" \
        "out vec3 viewer_vector_blue;" \
        "out vec3 transformedNormal;" \
        "out vec3 white;" \
        "void main(void)" \
        "{" \
        "    if(u_LkeyIsPressed==1.0)" \
        "    {" \
        "        vec4 eyeCoordinates=u_v_matrix*u_m_matrix*vPosition;" \
        "        transformedNormal=normalize(mat3(u_v_matrix*u_m_matrix)*vNormal);" \
        "        light_direction=vec3(u_lightPosition-eyeCoordinates);" \
        "        reflection_vector=reflect(-light_direction,transformedNormal);" \
        "        viewer_vector=vec3(-eyeCoordinates);" \
        "        " \
        "        light_direction_blue=vec3(u_lightPosition_blue-eyeCoordinates);" \
        "        reflection_vector_blue=reflect(-light_direction_blue,transformedNormal);" \
        "        viewer_vector_blue=vec3(-eyeCoordinates);" \
        "    }" \
        "    else" \
        "    {" \
        "        white=vec3(1.0,1.0,1.0);" \
        "    }" \
        "gl_Position=u_p_matrix *u_v_matrix*u_m_matrix * vPosition;" \
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
        "in vec3 light_direction;" \
        "in vec3 reflection_vector;" \
        "in vec3 viewer_vector;" \
        "in vec3 light_direction_blue;" \
        "in vec3 reflection_vector_blue;" \
        "in vec3 viewer_vector_blue;" \
        "in vec3 transformedNormal;" \
        "in vec3 white;" \
        "uniform vec3 u_la;" \
        "uniform vec3 u_ld;" \
        "uniform vec3 u_ls;" \
        "uniform vec3 u_la_blue;" \
        "uniform vec3 u_ld_blue;" \
        "uniform vec3 u_ls_blue;" \
        "uniform vec3 u_ka;" \
        "uniform vec3 u_kd;" \
        "uniform vec3 u_ks;" \
        "uniform float u_materialShininess;" \
        "uniform float u_LkeyIsPressed;" \
        "out vec4 FragColor;" \
        "void main(void)" \
        "{" \
        "    if(u_LkeyIsPressed==1.0)" \
        "    {" \
        "        vec3 normalized_tNormal=normalize(transformedNormal);" \
        "        vec3 normalized_light_direction=normalize(light_direction);" \
        "        vec3 normalized_reflection_vector=normalize(reflection_vector);" \
        "        vec3 normalized_viewer_vector=normalize(viewer_vector);" \
        "        vec3 normalized_light_direction_blue=normalize(light_direction_blue);" \
        "        vec3 normalized_reflection_vector_blue=normalize(reflection_vector_blue);" \
        "        vec3 normalized_viewer_vector_blue=normalize(viewer_vector_blue);" \
        "        " \
        "        float tn_dot_lightdirection=max(dot(normalized_light_direction,normalized_tNormal),0.0f);" \
        "        vec3 ambient=u_la*u_ka;" \
        "        vec3 diffuse=u_ld*u_kd*tn_dot_lightdirection;" \
        "        vec3 specular=u_ls*u_ks*pow(max(dot(normalized_reflection_vector,normalized_viewer_vector),0.0f),u_materialShininess);" \
        "        vec3 phong_ads_light=ambient+diffuse+specular;" \
        "        " \
        "        tn_dot_lightdirection=max(dot(normalized_light_direction_blue,normalized_tNormal),0.0f);" \
        "        ambient=u_la_blue*u_ka;" \
        "        diffuse=u_ld_blue*u_kd*tn_dot_lightdirection;" \
        "        specular=u_ls_blue*u_ks*pow(max(dot(normalized_reflection_vector_blue,normalized_viewer_vector),0.0f),u_materialShininess);" \
        "        phong_ads_light=phong_ads_light+(ambient+diffuse+specular);" \
        "        FragColor=vec4(phong_ads_light,1.0);" \
        "    }" \
        "    else" \
        "    {" \
        "        FragColor=vec4(white,1.0);" \
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
        msd_mUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_m_matrix");
        msd_vUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_v_matrix");
        msd_pUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_p_matrix");
        msd_laRedUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_la");
        msd_ldRedUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ld");
        msd_lsRedUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ls");
        msd_lightPositionRedUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_lightPosition");
        msd_laBlueUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_la_blue");
        msd_ldBlueUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ld_blue");
        msd_lsBlueUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ls_blue");
        msd_lightPositionBlueUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_lightPosition_blue");
        msd_kaUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ka");
        msd_kdUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_kd");
        msd_ksUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_ks");
        msd_materialShininessUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_materialShininess");
        msd_isLkeyPressedUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_LkeyIsPressed");
        const GLfloat msd_pyramidVertices[] = { 0.0f,1.0f,0.0f,//front
            -1.0f,-1.0f,1.0f,
            1.0f,-1.0f,1.0f,
            0.0f,1.0f,0.0f,//right
            1.0f,-1.0f,1.0f,
            1.0f,-1.0f,-1.0f,
            0.0f,1.0f,0.0f,//back
            1.0f,-1.0f,-1.0f,
            -1.0f,-1.0f,-1.0f,
            0.0f,1.0f,0.0f,//left
            -1.0f,-1.0f,-1.0f,
            -1.0f,-1.0f,1.0f
        };
        const GLfloat msd_Normals[] = { 0.0f, 0.447214f, 0.894427f,//front
            0.0f, 0.447214f, 0.894427f,//front
            0.0f, 0.447214f, 0.894427f,//front
            0.894427f, 0.447214f, 0.0f,//right
            0.894427f, 0.447214f, 0.0f,//right
            0.894427f, 0.447214f, 0.0f,//right
            0.0f, 0.447214f, -0.894427f,//back
            0.0f, 0.447214f, -0.894427f,//back
            0.0f, 0.447214f, -0.894427f,//back
            -0.894427f, 0.447214f, 0.0f,//left
            - 0.894427f, 0.447214f, 0.0f,//left
            - 0.894427f, 0.447214f, 0.0f//left
        };
        //create vao
        glGenVertexArrays(1, &msd_vao_pyramid);
        glBindVertexArray(msd_vao_pyramid);
        //for position
        glGenBuffers(1, &msd_vbo_position_pyramid);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_position_pyramid);
        glBufferData(GL_ARRAY_BUFFER, sizeof(msd_pyramidVertices),
                     msd_pyramidVertices, GL_STATIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        
        //for normal
        glGenBuffers(1, &msd_vbo_normal_pyramid);
        glBindBuffer(GL_ARRAY_BUFFER, msd_vbo_normal_pyramid);
        glBufferData(GL_ARRAY_BUFFER, sizeof(msd_Normals),
                     msd_Normals, GL_STATIC_DRAW);
        glVertexAttribPointer(AMC_ATTRIBUTE_NORMAL, 3, GL_FLOAT, GL_FALSE, 0, NULL);
        glEnableVertexAttribArray(AMC_ATTRIBUTE_NORMAL);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindVertexArray(0);
        /////////////////////////////////////////////////////////
        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        glClearDepthf(1.0f);
        msd_projectionMatrix = vmath::mat4::identity();
        msd_viewMatrix = vmath::mat4::identity();
        msd_modelMatrix = vmath::mat4::identity();
        
        
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
    msd_translationMatrix = vmath::translate(0.0f,0.0f,-6.0f);
    //rotationMatrix = rotate(angle_rect,1.0f,0.0f,0.0f);
    msd_rotationMatrix = msd_rotationMatrix* vmath::rotate(msd_angle_rect, 0.0f, 1.0f, 0.0f);
    //rotationMatrix = rotationMatrix*rotate(angle_rect, 0.0f, 0.0f, 1.0f);
    //scaleMatrix = scale(0.5f,0.5f,0.5f);
    msd_modelMatrix = msd_translationMatrix*msd_rotationMatrix;
    //do necessary matrix multiplication
    if (msd_gbIsLighting == true)
    {
        glUniform1f(msd_isLkeyPressedUniform, 1.0f);
        glUniform3fv(msd_laRedUniform, 1, msd_light_ambient_red);
        glUniform3fv(msd_ldRedUniform, 1, msd_light_diffuse_red);
        glUniform3fv(msd_lsRedUniform, 1, msd_light_specular_red);
        glUniform4fv(msd_lightPositionRedUniform, 1,msd_light_position_red);
        glUniform3fv(msd_laBlueUniform, 1, msd_light_ambient_blue);
        glUniform3fv(msd_ldBlueUniform, 1, msd_light_diffuse_blue);
        glUniform3fv(msd_lsBlueUniform, 1, msd_light_specular_blue);
        glUniform4fv(msd_lightPositionBlueUniform, 1, msd_light_position_blue);
        glUniform3fv(msd_kaUniform, 1, msd_material_ambient);
        glUniform3fv(msd_kdUniform, 1, msd_material_diffuse);
        glUniform3fv(msd_ksUniform, 1, msd_material_specular);
        glUniform1fv(msd_materialShininessUniform, 1, msd_material_shininess);
    }
    else
    {
        glUniform1f(msd_isLkeyPressedUniform, 0.0f);
    }
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_pyramid);
    
    glDrawArrays(GL_TRIANGLES, 0, 12);
    
    //unbind vao
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
    if (msd_vbo_position_pyramid)
    {
        glDeleteBuffers(1, &msd_vbo_position_pyramid);
        msd_vbo_position_pyramid = 0;
    }
    if (msd_vao_pyramid)
    {
        glDeleteBuffers(1, &msd_vao_pyramid);
        msd_vao_pyramid = 0;
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
