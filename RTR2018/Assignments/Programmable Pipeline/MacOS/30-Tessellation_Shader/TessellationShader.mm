#import<Foundation/Foundation.h>
#import<Cocoa/Cocoa.h>

#import<QuartzCore/CVDisplayLink.h>

#import<OpenGL/gl3.h>
#import<OpenGL/gl3ext.h>
#import "vmath.h"


enum
{
AMC_ATTRIBUTE_POSITION = 0,
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
	[window setTitle:@"Geometry Shader"];
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
    GLuint gGeometryShaderObject;
	GLuint vao_triangle;
	GLuint vbo_triangle_position;
	GLuint vbo_triangle_color;
	GLuint vao_rectangle;
	GLuint vbo_rectangle_position;
	GLuint vbo_rectangle_color;
    
    GLuint vao;
    GLuint vbo;
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

	gVertexShaderObject = glCreateShader(GL_VERTEX_SHADER);
	
	const GLchar* vertexShaderSourceCode =
		"#version 410" \
		"\n" \
        "in vec4 vPosition;" \
        "uniform mat4 u_mvp_matrix;" \
        "void main(void)" \
        "{" \
        "gl_Position=u_mvp_matrix*vPosition;" \
        "}";
		
	glShaderSource(gVertexShaderObject, 1, (const GLchar **)&vertexShaderSourceCode, NULL);
	glCompileShader(gVertexShaderObject);

	GLint iInfoLogLength=0;
	GLint iShaderCompileStatus=0;
	char *szInfolog=NULL;
	
	glGetShaderiv(gVertexShaderObject, GL_COMPILE_STATUS, &iShaderCompileStatus);

	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gVertexShaderObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);

		if (iInfoLogLength > 0)
		{
			szInfolog = (GLchar *)malloc(iInfoLogLength);
			if (szInfolog != NULL)
			{
				GLsizei written;

				glGetShaderInfoLog(gVertexShaderObject, iInfoLogLength, &written, szInfolog);
				fprintf(gpFile, "Inside Vertex Shader %s", szInfolog);
				free(szInfolog);

				[self release];
				[NSApp terminate:self];
			}
		}
	}

	
    gGeometryShaderObject = glCreateShader(GL_GEOMETRY_SHADER);
    
    //write vertex shader code.
    const GLchar* geometryShaderSourceCode =
    "#version 410" \
    "\n" \
    "layout(triangles)in;"\
    "layout(triangle_strip,max_vertices=9)out;"\
    "uniform mat4 u_mvp_matrix;"\
    "void main(void)" \
    "{" \
    "for(int vertex=0;vertex<3;vertex++)"\
    "{"\
    "gl_Position=u_mvp_matrix*(gl_in[vertex].gl_Position+vec4(0.0,1.0,0.0,0.0));"\
    "EmitVertex();"\
    "gl_Position=u_mvp_matrix*(gl_in[vertex].gl_Position+vec4(-1.0,-1.0,0.0,0.0));"\
    "EmitVertex();"\
    "gl_Position=u_mvp_matrix*(gl_in[vertex].gl_Position+vec4(1.0,-1.0,0.0,0.0));"\
    "EmitVertex();"\
    "EndPrimitive();"\
    "}"\
    "}";
    
    iInfoLogLength=0;
    iShaderCompileStatus=0;
    szInfolog=NULL;
    
    glShaderSource(gGeometryShaderObject, 1, (const GLchar **)&geometryShaderSourceCode, NULL);
    glCompileShader(gGeometryShaderObject);
    
    glGetShaderiv(gGeometryShaderObject, GL_COMPILE_STATUS, &iShaderCompileStatus);
    
    if (iShaderCompileStatus == GL_FALSE)
    {
        glGetShaderiv(gGeometryShaderObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);
        
        if (iInfoLogLength > 0)
        {
            szInfolog = (GLchar *)malloc(iInfoLogLength);
            if (szInfolog != NULL)
            {
                GLsizei written;
                
                glGetShaderInfoLog(gGeometryShaderObject, iInfoLogLength, &written, szInfolog);
                fprintf(gpFile, "Inside Geometry Shader %s", szInfolog);
                free(szInfolog);
                
                [self release];
                [NSApp terminate:self];
            }
        }
    }
    
	iInfoLogLength=0;
	iShaderCompileStatus=0;
	szInfolog=NULL;

	gFragmentShaderObject = glCreateShader(GL_FRAGMENT_SHADER);

	const GLchar* fragmentShaderSourceCode =
	"#version 410" \
	"\n" \
    "out vec4 FragColor;" \
    "void main(void)" \
    "{" \
    "FragColor=vec4(1.0,1.0,1.0,1.0);" \
    "}";
	glShaderSource(gFragmentShaderObject, 1, (const GLchar **)&fragmentShaderSourceCode, NULL);


	glCompileShader(gFragmentShaderObject);

	glGetShaderiv(gFragmentShaderObject, GL_COMPILE_STATUS, &iShaderCompileStatus);

	if (iShaderCompileStatus == GL_FALSE)
	{
		glGetShaderiv(gFragmentShaderObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);

		if (iInfoLogLength > 0)
		{
			szInfolog = (GLchar *)malloc(iInfoLogLength);
			if (szInfolog != NULL)
			{
				GLsizei written;

				glGetShaderInfoLog(gFragmentShaderObject, iInfoLogLength, &written, szInfolog);
				fprintf(gpFile, "Inside Fragment Shader %s", szInfolog);
				free(szInfolog);

				[self release];
				[NSApp terminate:self];
			}
		}
	}

	gShaderProgramObject = glCreateProgram();

	glAttachShader(gShaderProgramObject, gVertexShaderObject);
    
    glAttachShader(gShaderProgramObject, gGeometryShaderObject);

	glAttachShader(gShaderProgramObject, gFragmentShaderObject);

	glBindAttribLocation(gShaderProgramObject, AMC_ATTRIBUTE_POSITION, "vPosition");

	
	glLinkProgram(gShaderProgramObject);

	GLint iProgramLinkStatus=0;
	glGetProgramiv(gShaderProgramObject, GL_LINK_STATUS, &iProgramLinkStatus);

	if (iProgramLinkStatus == GL_FALSE)
	{
		glGetProgramiv(gShaderProgramObject, GL_INFO_LOG_LENGTH, &iInfoLogLength);

		if (iInfoLogLength > 0)
		{
			szInfolog = (GLchar *)malloc(iInfoLogLength);
			if (szInfolog != NULL)
			{
				GLsizei written;

				glGetProgramInfoLog(gShaderProgramObject, iInfoLogLength, &written, szInfolog);
				fprintf(gpFile, "Inside Linking of program %s", szInfolog);
				free(szInfolog);

				[self release];
				[NSApp terminate:self];
			}
		}
	}

	mvpUniform = glGetUniformLocation(gShaderProgramObject,"u_mvp_matrix");

    const GLfloat triangleVertices[] = { 0.0f,1.0f,0.0f,
        -1.0f,-1.0f,0.0f,
        1.0f,-1.0f,0.0f };
    
    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(triangleVertices), triangleVertices, GL_STATIC_DRAW);
    glVertexAttribPointer(AMC_ATTRIBUTE_POSITION, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(AMC_ATTRIBUTE_POSITION);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);


	glClearDepth(1.0f);	
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	glClearColor(0.0f,0.0f,0.0f,0.0f);

	perspectiveProjectionMatrix = vmath::mat4::identity();
	
	

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
	
		perspectiveProjectionMatrix=vmath::perspective(45.0f,width/height, 0.1f, 100.0f);

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
    
    modelViewMatrix =  vmath::mat4::identity();
    modelViewProjectionMatrix =  vmath::mat4::identity();
    modelViewMatrix =  vmath::translate(0.0f, 0.0f, -5.0f);
    modelViewProjectionMatrix = perspectiveProjectionMatrix * modelViewMatrix;
    glUniformMatrix4fv(mvpUniform, 1, GL_FALSE, modelViewProjectionMatrix);
    glBindVertexArray(vao);
    glDrawArrays(GL_TRIANGLES, 0, 3);
    glBindVertexArray(0);
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
	if (vbo_rectangle_position)
	{
		glDeleteBuffers(1, &vbo_rectangle_position);
		vbo_rectangle_position = 0;
	}
	if (vao_rectangle)
	{
		glDeleteVertexArrays(1, &vao_rectangle);
		vao_rectangle = 0;
	}
	if (vbo_triangle_position)
	{
		glDeleteBuffers(1, &vbo_triangle_position);
		vbo_triangle_position = 0;
	}
	if (vao_triangle)
	{
		glDeleteVertexArrays(1, &vao_triangle);
		vao_triangle = 0;
	}

	glUseProgram(gShaderProgramObject);
	glDetachShader(gShaderProgramObject, gFragmentShaderObject);
	glDetachShader(gShaderProgramObject, gVertexShaderObject);
	glDeleteShader(gFragmentShaderObject);
	gFragmentShaderObject = 0;
	glDeleteShader(gVertexShaderObject);
	gVertexShaderObject = 0;
	glDeleteProgram(gShaderProgramObject);
	gShaderProgramObject = 0;
	glUseProgram(0);
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
