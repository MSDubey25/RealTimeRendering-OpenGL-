//Headers
#import <Foundation/Foundation.h>
#import <Cocoa/Cocoa.h>
#import <QuartzCore/CVDisplayLink.h>
#import <OpenGL/gl3.h>
#import <OpenGL/gl3ext.h>

//C style global function declaration
CVReturn MyDisplayLinkCallback(CVDisplayLinkRef,const CVTimeStamp *,const CVTimeStamp *,
															CVOptionFlags,CVOptionFlags * ,void *);

//global declarations
FILE *gpFile=NULL;

//interface declaration
@interface AppDelegate : NSObject <NSApplicationDelegate, NSWindowDelegate>
@end

@interface GLView : NSOpenGLView
@end

//Entry Point Function
int main(int argc, const char * argv[])
{
	//code
	NSAutoreleasePool *pPool=[[NSAutoreleasePool alloc]init];
	NSApp=[NSApplication sharedApplication];
	[NSApp setDelegate : [[AppDelegate alloc]init]];
	[NSApp run];
	[pPool release];
return (0);
}

//interface implementation
@implementation AppDelegate
{
@private
	NSWindow *window;
	GLView *glView;
}

-(void) applicationDidFinishLaunching:(NSNotification *)aNotification
{
	//code

	//for log file
	NSBundle *mainBundle=[NSBundle mainBundle];//1
	NSString *appDirName=[mainBundle bundlePath];
	NSString *parentDirPath=[appDirName stringByDeletingLastPathComponent];
	NSString *logFileNameWithPath=[NSString stringWithFormat:@"%@/Log.txt",parentDirPath];
	const char *pszLogFileNameWithPath=[logFileNameWithPath cStringUsingEncoding:NSASCIIStringEncoding];
	gpFile=fopen(pszLogFileNameWithPath,"w");
	if(gpFile==NULL)
	{
		printf("can not create log file.\nExitting...\n");
		[self release];
		[NSApp terminate:self];
	}
	fprintf(gpFile, "Program started successfully\n");
	//window
	NSRect win_rect;
	win_rect=NSMakeRect(0.0,0.0,800.0,600.0);

	//create Simple Window
	window=[[NSWindow alloc] initWithContentRect:win_rect styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable backing:NSBackingStoreBuffered defer:NO];
	[window setTitle:@"macOS Window Bluescreen"];
	[window center];

	glView=[[GLView alloc]initWithFrame:win_rect];

	[window setContentView:glView];
	[window setDelegate:self];
	[window makeKeyAndOrderFront:self];
}

-(void)applicationWillTerminate:(NSNotification *)notification
{
	fprintf(gpFile, "Program is terminated successfully\n");
	if (gpFile) {
		/* code */
		fclose(gpFile);
		gpFile=NULL;
	}
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
}

-(id)initWithFrame:(NSRect)frame
{
	self=[super initWithFrame:frame];
	if(self)
	{
		[[self window]setContentView:self];

		NSOpenGLPixelFormatAttribute attrs[]=
		{
			//must specify the 4.1 core profile to use openGL 4.1
			NSOpenGLPFAOpenGLProfile,NSOpenGLProfileVersion4_1Core,
			//specify the display ID to associate the GL Context with main display for now
			NSOpenGLPFAScreenMask,CGDisplayIDToOpenGLDisplayMask(kCGDirectMainDisplay),
            NSOpenGLPFANoRecovery,
            NSOpenGLPFAAccelerated,
            NSOpenGLPFAColorSize,24,
			NSOpenGLPFADepthSize,24,
			NSOpenGLPFAAlphaSize,8,
			NSOpenGLPFADoubleBuffer,0
		};//last must be zero

		NSOpenGLPixelFormat *pixelFormat=[[[NSOpenGLPixelFormat alloc]initWithAttributes:attrs]autorelease];

		if(pixelFormat==nil)
		{
			fprintf(gpFile, "No valid openGL pixel format is available\nExitting...\n");
			[self release];
			[NSApp terminate:self];
		}

		NSOpenGLContext *glContext=[[[NSOpenGLContext alloc]initWithFormat:pixelFormat shareContext:nil]autorelease];

		[self setPixelFormat:pixelFormat];
		[self setOpenGLContext:glContext];//it automatically releases the older context

	}
return (self);
}

-(CVReturn)getFrameForTime:(const CVTimeStamp *)pOutputTime
{
	//code
	NSAutoreleasePool *pool=[[NSAutoreleasePool alloc]init];
	[self drawView];
	[pool release];
	return (kCVReturnSuccess);
}

-(void)prepareopenGL
{
	//code
	//OpenGL Info
	fprintf(gpFile, "OpenGL Version : %s\n",glGetString(GL_VERSION) );
	fprintf(gpFile, "GLSL Version : %s\n",glGetString(GL_SHADING_LANGUAGE_VERSION) );

	[[self openGLContext]makeCurrentContext];

	GLint swapInt=1;
	[[self openGLContext]setValues:&swapInt forParameter:NSOpenGLContextParameterSwapInterval];

	//set background color
	glClearColor(0.0f,0.0f,1.0f,0.0f);

	CVDisplayLinkCreateWithActiveCGDisplays(&displayLink);
	CVDisplayLinkSetOutputCallback(displayLink,&MyDisplayLinkCallback,self);
	CGLContextObj cglContext=(CGLContextObj)[[self openGLContext]CGLContextObj];
	CGLPixelFormatObj cglPixelFormat=(CGLPixelFormatObj)[[self pixelFormat]CGLPixelFormatObj];
	CVDisplayLinkSetCurrentCGDisplayFromOpenGLContext(displayLink,cglContext,cglPixelFormat);
	CVDisplayLinkStart(displayLink);
}

-(void)reshape
{
	//code
	CGLLockContext((CGLContextObj)[[self openGLContext]CGLContextObj]);
	NSRect rect=[self bounds];
	GLfloat width=rect.size.width;
	GLfloat height=rect.size.height;

	if(height==0)
		height=1;
	glViewport(0,0,(GLsizei)width,(GLsizei)height);

	CGLUnlockContext((CGLContextObj)[[self openGLContext]CGLContextObj]);
}

-(void)drawRect:(NSRect)dirtyRect
{
	//code
		[self drawView];
}

-(void)drawView
{
	//code
	[[self openGLContext]makeCurrentContext];
	CGLLockContext((CGLContextObj)[[self openGLContext]CGLContextObj]);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	CGLFlushDrawable((CGLContextObj)[[self openGLContext]CGLContextObj]);
	CGLUnlockContext((CGLContextObj)[[self openGLContext]CGLContextObj]);
}

-(BOOL)acceptsFirstResponder
{
	//code
	[[self window]makeFirstResponder:self];
	return (YES);
}

-(void)keyDown:(NSEvent *)theEvent
{
	int key=(int)[[theEvent characters]characterAtIndex:0];
	switch(key)
	{
		case 27://ESC key
			[self release];
			[NSApp terminate:self];
			break;
		case 'F':case 'f':
			[[self window]toggleFullScreen : self];//repainting occurs
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

-(void) dealloc
{
	CVDisplayLinkStop(displayLink);
	CVDisplayLinkRelease(displayLink);
	[super dealloc];
}
@end

CVReturn MyDisplayLinkCallback(CVDisplayLinkRef displayLink,const CVTimeStamp *pNow,const CVTimeStamp *pOutputTime,
															CVOptionFlags flagsIn,CVOptionFlags *pFlagsOut,void *pDisplayLinkContext )
{
	CVReturn result=[(GLView *)pDisplayLinkContext getFrameForTime:pOutputTime];
	return (result);
}
