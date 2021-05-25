//Headers
#import <Foundation/Foundation.h>
#import <Cocoa/Cocoa.h>

//interface declaration
@interface AppDelegate : NSObject <NSApplicationDelegate, NSWindowDelegate>
@end

@interface MyView : NSView
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
	NSView *view;
}

-(void) applicationDidFinishLaunching:(NSNotification *)aNotification
{
	//code
	//window
	NSRect win_rect;
	win_rect=NSMakeRect(0.0,0.0,800.0,600.0);
	
	//create Simple Window
	window=[[NSWindow alloc] initWithContentRect:win_rect styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable backing:NSBackingStoreBuffered defer:NO];
	[window setTitle:@"macOS Window"];
	[window center];
	
	view=[[MyView alloc]initWithFrame:win_rect];
	
	[window setContentView:view];
	[window setDelegate:self];
	[window makeKeyAndOrderFront:self];
}

-(void)applicationWillTerminate:(NSNotification *)notification
{
	
}

-(void)windowWillClose:(NSNotification *)notification
{
	[NSApp terminate:self];
}

-(void)dealloc
{
	[view release];
	[window release];
	[super dealloc];
}
@end

@implementation MyView
{
	NSString *centralText;
}

-(id)initWithFrame:(NSRect)frame
{
	self=[super initWithFrame:frame];
	if(self)
	{
		[[self window]setContentView:self];
		centralText=@"Hello World !!!";
	}
return (self);
}

-(void)drawRect:(NSRect)dirtyRect
{
	//black Background
	NSColor *fillColor=[NSColor blackColor];
	[fillColor set];
	NSRectFill(dirtyRect);

	//Dictionary with kvc
	NSDictionary *dictionaryForTextAttributes=[NSDictionary dictionaryWithObjectsAndKeys:[NSFont fontWithName:@"Helvetica" size:32], NSFontAttributeName,[NSColor greenColor], NSForegroundColorAttributeName,nil];

	NSSize textSize=[centralText sizeWithAttributes:dictionaryForTextAttributes];
	
	NSPoint point;
	point.x=(dirtyRect.size.width/2)-(textSize.width/2);
	point.y=(dirtyRect.size.height/2)-(textSize.height/2)+12;
	[centralText drawAtPoint:point withAttributes:dictionaryForTextAttributes];
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
			centralText=@"'F' or 'f' key is pressed";
			[[self window]toggleFullScreen : self];//repainting occurs
			break;
		default:
			break;
	}
}

-(void)mouseDown:(NSEvent *)theEvent
{
	centralText=@"left mouse button is clicked";
	[self setNeedsDisplay : YES];//repainting
}

-(void)mouseDragged:(NSEvent *)theEvent
{
}

-(void)rightMouseDown:(NSEvent *)theEvent
{
	centralText=@"Right mouse button is clicked";
	[self setNeedsDisplay:YES];//repainting
}

-(void) dealloc
{
	[super dealloc];
}
@end
