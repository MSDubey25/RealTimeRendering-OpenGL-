//
//  GLESView.m
//  22-Shader_Toggle
//
//  Created by Ajay Arun Pawar on 04/02/20.
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
    
    GLuint msd_gVertexShaderObject1;
    GLuint msd_gFragmentShaderObject1;
    GLuint msd_gShaderProgramObject1;
    
    GLuint msd_mUniform;
    GLuint msd_vUniform;
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
    
    
    vmath::mat4 translationMatrix;
    vmath::mat4 scaleMatrix;
    vmath::mat4 rotationMatrix;
    vmath::mat4 msd_projectionMatrix;
    vmath::mat4 msd_modelMatrix;
    vmath::mat4 msd_viewMatrix;
    
    GLfloat msd_angle_rect;
    bool msd_gbIsLighting;
    bool msd_gbIsAnimation;
    bool msd_isVertexShader;
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
    
    
    int currentWidth;
    int currentHeight;
    
    GLint keyPress;
    GLfloat angleOfXRotation;
    GLfloat angleOfYRotation;
    GLfloat angleOfZRotation;
}
-(void)shaderTogglePerFragment
{
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
    "uniform float u_LkeyIsPressed_vertex;" \
    "uniform vec3 u_la;" \
    "uniform vec3 u_ld;" \
    "uniform vec3 u_ls;" \
    "uniform vec3 u_ka;" \
    "uniform vec3 u_kd;" \
    "uniform vec3 u_ks;" \
    "uniform float u_materialShininess;" \
    "out vec3 light_direction;" \
    "out vec3 reflection_vector;" \
    "out vec3 viewer_vector;" \
    "out vec3 transformedNormal;" \
    "out vec3 white;" \
    "void main(void)" \
    "{" \
    "    if(u_LkeyIsPressed_vertex==1.0)" \
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
    "gl_Position=u_p_matrix *u_v_matrix*u_m_matrix*vPosition;" \
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
    "in vec3 transformedNormal;" \
    "in vec3 white;" \
    "uniform vec3 u_la;" \
    "uniform vec3 u_ld;" \
    "uniform vec3 u_ls;" \
    "uniform vec3 u_ka;" \
    "uniform vec3 u_kd;" \
    "uniform vec3 u_ks;" \
    "uniform float u_materialShininess;" \
    "uniform float u_LkeyIsPressed_fragment;" \
    "out vec4 FragColor;" \
    "void main(void)" \
    "{" \
    "    if(u_LkeyIsPressed_fragment==1.0)" \
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
    msd_mUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_m_matrix");
    msd_vUniform = glGetUniformLocation(msd_gShaderProgramObject, "u_v_matrix");
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
    
}
-(void)shaderTogglePerVertex
{
    //Vertex Shader
    msd_gVertexShaderObject1 = glCreateShader(GL_VERTEX_SHADER);
    
    //write vertex shader code
    const GLchar *vertexShaderSourceCode =
    "#version 300 es" \
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
    "uniform float u_LkeyIsPressed_vertex;" \
    "out vec3 phong_ads_light;" \
    "void main(void)" \
    "{" \
    "    if(u_LkeyIsPressed_vertex==1.0)" \
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
    glShaderSource(msd_gVertexShaderObject1, 1,
                   (const GLchar**)&vertexShaderSourceCode,
                   NULL);
    glCompileShader(msd_gVertexShaderObject1);
    GLint iShaderCompileStatus = 0;
    GLint iInfoLogLength = 0;
    GLchar *szInfoLog = NULL;
    
    glGetShaderiv(msd_gVertexShaderObject1,
                  GL_COMPILE_STATUS,
                  &iShaderCompileStatus);
    printf("Value of ivertex shader compile Status is : %d", iShaderCompileStatus);
    if (iShaderCompileStatus == GL_FALSE)
    {
        glGetShaderiv(msd_gVertexShaderObject1,
                      GL_INFO_LOG_LENGTH,
                      &iInfoLogLength);
        if (iInfoLogLength > 0)
        {
            szInfoLog = (GLchar*)malloc(iInfoLogLength);
            if (szInfoLog != NULL)
            {
                GLsizei writtened;
                glGetShaderInfoLog(msd_gVertexShaderObject1,
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
    msd_gFragmentShaderObject1 = glCreateShader(GL_FRAGMENT_SHADER);
    
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
    glShaderSource(msd_gFragmentShaderObject1, 1,
                   (const GLchar**)&fragmentShaderSourceCode,
                   NULL);
    glCompileShader(msd_gFragmentShaderObject1);
    
    iShaderCompileStatus = 0;
    iInfoLogLength = 0;
    szInfoLog = NULL;
    
    glGetShaderiv(msd_gFragmentShaderObject1,
                  GL_COMPILE_STATUS,
                  &iShaderCompileStatus);
    printf("Value of ifragment shader compile Status is : %d", iShaderCompileStatus);
    if (iShaderCompileStatus == GL_FALSE)
    {
        glGetShaderiv(msd_gFragmentShaderObject1,
                      GL_INFO_LOG_LENGTH,
                      &iInfoLogLength);
        if (iInfoLogLength > 0)
        {
            szInfoLog = (GLchar*)malloc(iInfoLogLength);
            if (szInfoLog != NULL)
            {
                GLsizei writtened;
                glGetShaderInfoLog(msd_gFragmentShaderObject1,
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
    msd_gShaderProgramObject1 = glCreateProgram();
    
    //attach vertex/fragment shaders
    glAttachShader(msd_gShaderProgramObject1,
                   msd_gVertexShaderObject1);
    glAttachShader(msd_gShaderProgramObject1,
                   msd_gFragmentShaderObject1);
    
    //prelinking binding to vertex attributes
    glBindAttribLocation(msd_gShaderProgramObject1,AMC_ATTRIBUTE_POSITION,"vPosition");
    glBindAttribLocation(msd_gShaderProgramObject1, AMC_ATTRIBUTE_NORMAL, "vNormal");
    
    
    //Link the shader program
    printf("attach comp\n");
    glLinkProgram(msd_gShaderProgramObject1);
    //ErrorCheck for linking
    
    GLint iProgramLinkStatus = 0;
    iInfoLogLength = 0;
    szInfoLog = NULL;
    
    glGetProgramiv(msd_gShaderProgramObject1,
                   GL_LINK_STATUS,
                   &iProgramLinkStatus);
    printf("Value of iProgramLinkStatus is : %d", iProgramLinkStatus);
    if (iProgramLinkStatus == GL_FALSE)
    {
        glGetProgramiv(msd_gShaderProgramObject1,
                       GL_INFO_LOG_LENGTH,
                       &iInfoLogLength);
        if (iInfoLogLength > 0)
        {
            szInfoLog = (GLchar*)malloc(iInfoLogLength);
            if (szInfoLog != NULL)
            {
                GLsizei writtened;
                glGetProgramInfoLog(msd_gShaderProgramObject1,
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
    msd_mUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_m_matrix");
    msd_vUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_v_matrix");
    msd_pUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_p_matrix");
    
    msd_laUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_la");
    msd_ldUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_ld");
    msd_lsUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_ls");
    msd_lightPositionUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_lightPosition");
    msd_kaUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_ka");
    msd_kdUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_kd");
    msd_ksUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_ks");
    msd_materialShininessUniform = glGetUniformLocation(msd_gShaderProgramObject1, "u_materialShininess");
    msd_isLkeyPressedUniform_vertex = glGetUniformLocation(msd_gShaderProgramObject1, "u_LkeyIsPressed_vertex");
    msd_isLkeyPressedUniform_fragment = glGetUniformLocation(msd_gShaderProgramObject1, "u_LkeyIsPressed_fragment");
    
}
- (id)initWithFrame:(CGRect)frame
{
    self=[super initWithFrame:frame];
    keyPress=0;
    angleOfXRotation = 0.0f;
    angleOfYRotation = 0.0f;
    angleOfZRotation = 0.0f;
    msd_angle_rect = 0.0f;
    msd_gbIsLighting = false;
    msd_gbIsAnimation = false;
    msd_isVertexShader=true;
    msd_sphere=[Sphere alloc];
    msd_light_ambient[0]=0.5f;
    msd_light_ambient[1]=0.5f;
    msd_light_ambient[2]=0.5f;
    msd_light_ambient[3]=0.0f;
    
    msd_light_diffuse[0]=1.0f;
    msd_light_diffuse[1]=1.0f;
    msd_light_diffuse[2]=1.0f;
    msd_light_diffuse[3]=1.0f;
    
    msd_light_specular[0]=1.0f;
    msd_light_specular[1]=1.0f;
    msd_light_specular[2]=1.0f;
    msd_light_specular[3]=1.0f;
    
    msd_light_position[0]=4.0f;
    msd_light_position[1]=4.0f;
    msd_light_position[2]=4.0f;
    msd_light_position[3]=1.0f;
    
    msd_material_ambient[0]=0.5f;
    msd_material_ambient[1]=0.5f;
    msd_material_ambient[2]=0.5f;
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
        [self shaderTogglePerVertex];
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
        
        glClearColor(0.25f, 0.25f, 0.25f, 1.0f);
        
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
    
    if(msd_isVertexShader==true)
    {
        glUseProgram(msd_gShaderProgramObject1);
    }
    else
    {
        glUseProgram(msd_gShaderProgramObject);
    }
    //declaration of matrices
    //bind with vao
    //modelViewProjectionMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    rotationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -2.0f);
    msd_modelMatrix = translationMatrix;
    /* msd_rotationMatrix = vmath::rotate(msd_angle_rect,1.0f,0.0f,0.0f);
     msd_modelViewMatrix = msd_modelViewMatrix * msd_rotationMatrix;
     msd_rotationMatrix = vmath::rotate(msd_angle_rect, 0.0f, 1.0f, 0.0f);
     msd_modelViewMatrix = msd_modelViewMatrix * msd_rotationMatrix;
     msd_rotationMatrix = vmath::rotate(msd_angle_rect, 0.0f, 0.0f, 1.0f);*/
    msd_modelMatrix = msd_modelMatrix * rotationMatrix;
    //modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    
    float MaterialAmbience[4];
    float MaterialDiffuse[4];
    float MaterialSpecular[4];
    float MaterialShininess[1];
    
    //1st sphere on 1st column Emerald
    MaterialAmbience[0] = 0.0215f;
    MaterialAmbience[1] = 0.1745f;
    MaterialAmbience[2] = 0.0215f;
    MaterialAmbience[3] = 1.0f;
   // glUniform3fv(kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.7568f;
    MaterialDiffuse[1] = 0.61424f;
    MaterialDiffuse[2] = 0.07568f;
    MaterialDiffuse[3] = 1.0f;
    //glUniform3fv(kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.633f;
    MaterialSpecular[1] = 0.727811f;
    MaterialSpecular[2] = 0.633f;
    MaterialSpecular[3] = 1.0f;
    //glUniform3fv(ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.6*128.0f;
    //glUniform3fv(MaterialShininessUniform, 1, MaterialShininess);
    
    if (msd_gbIsLighting == true)
    {
        glUniform1f(msd_isLkeyPressedUniform_vertex, 1.0f);
        glUniform1f(msd_isLkeyPressedUniform_fragment, 1.0f);
        glUniform3fv(msd_laUniform,1, msd_light_ambient);
        glUniform3fv(msd_ldUniform,1, msd_light_diffuse);
        glUniform3fv(msd_lsUniform,1, msd_light_specular);
        
      //  glUniform3fv(msd_kaUniform,1, msd_material_ambient);
       // glUniform3fv(msd_kdUniform,1, msd_material_diffuse);
       // glUniform3fv(msd_ksUniform,1, msd_material_specular);
       // glUniform1fv(msd_materialShininessUniform,1, msd_material_shininess);
        glUniform3fv(msd_kaUniform,1, MaterialAmbience);
        glUniform3fv(msd_kdUniform,1, MaterialDiffuse);
        glUniform3fv(msd_ksUniform,1, MaterialSpecular);
        glUniform1fv(msd_materialShininessUniform,1, MaterialShininess);
        if (keyPress == 1 || keyPress==0)
        {
            //rotationMatrix = rotate(angleOfXRotation, 1.0f, 0.0f, 0.0f);
            msd_light_position[0] = 0.0f;
            msd_light_position[1] = 100.0f*sin(angleOfYRotation);
            msd_light_position[2] = 100.0f*cos(angleOfYRotation);
            msd_light_position[3] = 1.0f;
        }
        else if (keyPress == 2)
        {
            //rotationMatrix=rotate(angleOfYRotation, 0.0f, 1.0f, 0.0f);
            msd_light_position[0] = 100.0f*sin(angleOfYRotation);
            msd_light_position[1] = 0.0f;
            msd_light_position[2] = 100.0f*cos(angleOfYRotation);
            msd_light_position[3] = 1.0f;
        }
        else if (keyPress == 3)
        {
            //rotationMatrix = rotate(angleOfZRotation, 0.0f, 0.0f, 1.0f);
            msd_light_position[0] = 100.0f*sin(angleOfYRotation);
            msd_light_position[1] = 100.0f*cos(angleOfYRotation);
            msd_light_position[2] = 0.0f;
            msd_light_position[3] = 1.0f;
        }
        glUniform4fv(msd_lightPositionUniform,1,msd_light_position);
        
    }
    else
    {
        glUniform1f(msd_isLkeyPressedUniform_fragment, 0.0f);
        glUniform1f(msd_isLkeyPressedUniform_vertex, 0.0f);
    }
    
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    
    //similarly bind with textures if any
    [self draw24Sphere];
    //unuse program
    glUseProgram(0);
    
    [self update];
    glBindRenderbuffer(GL_RENDERBUFFER, colorRenderBuffer);
    [eaglContext presentRenderbuffer:GL_RENDERBUFFER];
    
}

-(void)draw24Sphere
{
    float MaterialAmbience[4];
    float MaterialDiffuse[4];
    float MaterialSpecular[4];
    float MaterialShininess[1];
    
    //1st sphere on 1st column Emerald
    MaterialAmbience[0] = 0.0215f;
    MaterialAmbience[1] = 0.1745f;
    MaterialAmbience[2] = 0.0215f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.7568f;
    MaterialDiffuse[1] = 0.61424f;
    MaterialDiffuse[2] = 0.07568f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.633f;
    MaterialSpecular[1] = 0.727811f;
    MaterialSpecular[2] = 0.633f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.6*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    scaleMatrix = vmath::mat4::identity();
    translationMatrix = vmath::mat4::identity();
    //translationMatrix = translate(-150.0f, 80.0f, -10.0f);
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(20.0f, 20.0f, 20.0f);
    glViewport(0, 250, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***z
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //2nd sphere on 1st row jade
    MaterialAmbience[0] = 0.135f;
    MaterialAmbience[1] = 0.2225f;
    MaterialAmbience[2] = 0.1575f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.54f;
    MaterialDiffuse[1] = 0.89f;
    MaterialDiffuse[2] = 0.63f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.316228f;
    MaterialSpecular[1] = 0.316228f;
    MaterialSpecular[2] = 0.316228f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.1*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(100, 250, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    //    glViewport(600, 100, 220, 220);
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    
    //3rd sphere on 1st row obsidien
    MaterialAmbience[0] = 0.05375f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.06625f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.18275f;
    MaterialDiffuse[1] = 0.17f;
    MaterialDiffuse[2] = 0.22525f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.332741f;
    MaterialSpecular[1] = 0.328634f;
    MaterialSpecular[2] = 0.346435f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.3*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(200, 250, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //4th sphere on 1st row pearl
    MaterialAmbience[0] = 0.25f;
    MaterialAmbience[1] = 0.20725f;
    MaterialAmbience[2] = 0.20725f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 1.0f;
    MaterialDiffuse[1] = 0.829f;
    MaterialDiffuse[2] = 0.829f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.296648f;
    MaterialSpecular[1] = 0.296648f;
    MaterialSpecular[2] = 0.296648f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.088*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(300, 250, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //5th sphere on 1st row ruby
    MaterialAmbience[0] = 0.1745f;
    MaterialAmbience[1] = 0.01175f;
    MaterialAmbience[2] = 0.01175f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.61424f;
    MaterialDiffuse[1] = 0.04136f;
    MaterialDiffuse[2] = 0.04136f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.727811f;
    MaterialSpecular[1] = 0.626959f;
    MaterialSpecular[2] = 0.626959f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.6*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(400, 250, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //6th sphere on 1st row turquoise
    MaterialAmbience[0] = 0.1f;
    MaterialAmbience[1] = 0.18725f;
    MaterialAmbience[2] = 0.1745f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.396f;
    MaterialDiffuse[1] = 0.74151f;
    MaterialDiffuse[2] = 0.69102f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.297254f;
    MaterialSpecular[1] = 0.30829f;
    MaterialSpecular[2] = 0.306678f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.1*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    glViewport(480, 250, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
 
    //1st sphere on 2nd row brass
    MaterialAmbience[0] = 0.329412f;
    MaterialAmbience[1] = 0.223529f;
    MaterialAmbience[2] = 0.027451f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.780392f;
    MaterialDiffuse[1] = 0.568627f;
    MaterialDiffuse[2] = 0.113725f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.992157f;
    MaterialSpecular[1] = 0.941176f;
    MaterialSpecular[2] = 0.807843f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.21794872*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(0, 170, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //2nd sphere on 2nd row bronze
    MaterialAmbience[0] = 0.2125f;
    MaterialAmbience[1] = 0.1275f;
    MaterialAmbience[2] = 0.054f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.714f;
    MaterialDiffuse[1] = 0.4284f;
    MaterialDiffuse[2] = 0.18144f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.393548f;
    MaterialSpecular[1] = 0.271906f;
    MaterialSpecular[2] = 0.166721f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialShininess[0] = 0.2*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(100, 170, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //3rd sphere on 2nd row chrome
    MaterialAmbience[0] = 0.25f;
    MaterialAmbience[1] = 0.25f;
    MaterialAmbience[2] = 0.25f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.4f;
    MaterialDiffuse[1] = 0.4f;
    MaterialDiffuse[2] = 0.4f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.774597f;
    MaterialSpecular[1] = 0.774597f;
    MaterialSpecular[2] = 0.774597f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.6*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(200, 170, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //4th sphere on 2nd row copper
    MaterialAmbience[0] = 0.19125f;
    MaterialAmbience[1] = 0.0735f;
    MaterialAmbience[2] = 0.0225f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.7038f;
    MaterialDiffuse[1] = 0.27048f;
    MaterialDiffuse[2] = 0.0828f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.256777f;
    MaterialSpecular[1] = 0.137622f;
    MaterialSpecular[2] = 0.086014f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.1*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
   translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(300, 170, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //5th sphere on 2nd row gold
    MaterialAmbience[0] = 0.24725f;
    MaterialAmbience[1] = 0.1995f;
    MaterialAmbience[2] = 0.0745f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.75164f;
    MaterialDiffuse[1] = 0.60648f;
    MaterialDiffuse[2] = 0.22648f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.628281f;
    MaterialSpecular[1] = 0.555802f;
    MaterialSpecular[2] = 0.366065f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.4*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
   translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(400, 170, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //6th sphere on 2nd row silver
    MaterialAmbience[0] = 0.19225f;
    MaterialAmbience[1] = 0.19225f;
    MaterialAmbience[2] = 0.19225f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.50754f;
    MaterialDiffuse[1] = 0.50754f;
    MaterialDiffuse[2] = 0.50754f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.508273f;
    MaterialSpecular[1] = 0.508273f;
    MaterialSpecular[2] = 0.508273f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.4*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(480, 170, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);

    //1st sphere on 3rd row black plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.01f;
    MaterialDiffuse[1] = 0.01f;
    MaterialDiffuse[2] = 0.01f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.50f;
    MaterialSpecular[1] = 0.50f;
    MaterialSpecular[2] = 0.50f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(0, 90, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //2nd sphere on 3rd row cyan plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.1f;
    MaterialAmbience[2] = 0.06f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.0f;
    MaterialDiffuse[1] = 0.50980392f;
    MaterialDiffuse[2] = 0.50980392f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.50196078f;
    MaterialSpecular[1] = 0.50196078f;
    MaterialSpecular[2] = 0.50196078f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(100, 90, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //3rd sphere on 3rd row green plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.1f;
    MaterialDiffuse[1] = 0.35f;
    MaterialDiffuse[2] = 0.1f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.45f;
    MaterialSpecular[1] = 0.55f;
    MaterialSpecular[2] = 0.45f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(200, 90, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //4th sphere on 3rd row red plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.0f;
    MaterialDiffuse[2] = 0.0f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.7f;
    MaterialSpecular[1] = 0.6f;
    MaterialSpecular[2] = 0.6f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(300, 90, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //5th sphere on 3rd row white plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.55f;
    MaterialDiffuse[1] = 0.55f;
    MaterialDiffuse[2] = 0.55f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.70f;
    MaterialSpecular[1] = 0.70f;
    MaterialSpecular[2] = 0.70f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(400, 90, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //6th sphere on 3rd row yellow plastic
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.0f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.60f;
    MaterialSpecular[1] = 0.60f;
    MaterialSpecular[2] = 0.50f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.25*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(480, 90, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //1st sphere on 4th row black rubber
    MaterialAmbience[0] = 0.02f;
    MaterialAmbience[1] = 0.02f;
    MaterialAmbience[2] = 0.02f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.01f;
    MaterialDiffuse[1] = 0.01f;
    MaterialDiffuse[2] = 0.01f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.40f;
    MaterialSpecular[1] = 0.40f;
    MaterialSpecular[2] = 0.40f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(0, 10, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //2nd sphere on 4th row cyan rubber
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.05f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.4f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.5f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.04f;
    MaterialSpecular[1] = 0.7f;
    MaterialSpecular[2] = 0.7f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(100, 10, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    //3rd sphere on 4th row green rubber
    MaterialAmbience[0] = 0.0f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.4f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.4f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.04f;
    MaterialSpecular[1] = 0.7f;
    MaterialSpecular[2] = 0.04f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(200, 10, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //4th sphere on 4th row red rubber
    MaterialAmbience[0] = 0.05f;
    MaterialAmbience[1] = 0.0f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.4f;
    MaterialDiffuse[2] = 0.4f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.7f;
    MaterialSpecular[1] = 0.04f;
    MaterialSpecular[2] = 0.04f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(300, 10, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //5th sphere on 4th row white rubber
    MaterialAmbience[0] = 0.05f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.05f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.5f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.70f;
    MaterialSpecular[1] = 0.70f;
    MaterialSpecular[2] = 0.70f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(400, 10, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
    
    //6th sphere on 4th row yellow rubber
    MaterialAmbience[0] = 0.05f;
    MaterialAmbience[1] = 0.05f;
    MaterialAmbience[2] = 0.0f;
    MaterialAmbience[3] = 1.0f;
    glUniform3fv(msd_kaUniform, 1, MaterialAmbience);
    
    MaterialDiffuse[0] = 0.5f;
    MaterialDiffuse[1] = 0.5f;
    MaterialDiffuse[2] = 0.4f;
    MaterialDiffuse[3] = 1.0f;
    glUniform3fv(msd_kdUniform, 1, MaterialDiffuse);
    
    MaterialSpecular[0] = 0.7f;
    MaterialSpecular[1] = 0.7f;
    MaterialSpecular[2] = 0.04f;
    MaterialSpecular[3] = 1.0f;
    glUniform3fv(msd_ksUniform, 1, MaterialSpecular);
    
    MaterialShininess[0] = 0.078125*128.0f;
    glUniform1fv(msd_materialShininessUniform, 1, MaterialShininess);
    
    msd_modelMatrix = vmath::mat4::identity();
    msd_viewMatrix = vmath::mat4::identity();
    //scaleMatrix = mat4::identity();
    translationMatrix = vmath::mat4::identity();
    translationMatrix = vmath::translate(0.0f, 0.0f, -1.5f);
    //scaleMatrix = scale(0.25f, 0.25f, 0.25f);
    glViewport(480, 10, (GLsizei)currentWidth / 6, (GLsizei)currentHeight / 6);
    msd_modelMatrix = translationMatrix * scaleMatrix*rotationMatrix;
    //do necessary matrix multiplication
    
    //send necessary matrices to shaders in respective uniforms
    glUniformMatrix4fv(msd_mUniform, 1, GL_FALSE, msd_modelMatrix);
    glUniformMatrix4fv(msd_vUniform, 1, GL_FALSE, msd_viewMatrix);
    glUniformMatrix4fv(msd_pUniform, 1, GL_FALSE, msd_projectionMatrix);
    
    // *** bind vao ***
    glBindVertexArray(msd_vao_sphere);
    // *** draw, either by glDrawTriangles() or glDrawArrays() or glDrawElements()
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, msd_vbo_sphere_element);
    glDrawElements(GL_TRIANGLES, msd_numElements, GL_UNSIGNED_SHORT, 0);
    // unbind vao
    glBindVertexArray(0);
}
-(void)update
{
    if (angleOfYRotation >= 360.0f)
        angleOfYRotation = 0.0f;
    else
        angleOfYRotation += 0.1f;
    
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
    currentWidth = width;
    currentHeight = height;
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
    if (msd_isVertexShader == false)
    {
        msd_isVertexShader = true;
        [self shaderTogglePerVertex];
    }
    else
    {
        msd_isVertexShader = false;
        [self shaderTogglePerFragment];
    }
    
    
}

-(void)onSwipe:(UISwipeGestureRecognizer *)gr
{
    [self release];
    exit(0);
}
-(void)onLongPress:(UILongPressGestureRecognizer *)gr
{
    keyPress++;
    if(keyPress>3)
        keyPress=0;
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
    glUseProgram(msd_gShaderProgramObject1);
    glDetachShader(msd_gShaderProgramObject1, GL_FRAGMENT_SHADER);
    glDetachShader(msd_gShaderProgramObject1, GL_VERTEX_SHADER);
    glDeleteShader(msd_gFragmentShaderObject1);
    msd_gFragmentShaderObject1 = 0;
    glDeleteShader(msd_gVertexShaderObject1);
    msd_gVertexShaderObject1 = 0;
    glDeleteProgram(msd_gShaderProgramObject1);
    msd_gShaderProgramObject1 = 0;
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
