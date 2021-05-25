//
//  MyView.m
//  Window
//
//  Created by Ajay Arun Pawar on 18/12/19.
//

#import "MyView.h"

@implementation MyView

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/
{
    @private
    NSString *centralText;
}

- (id)initWithFrame:(CGRect)frame
{
    self=[super initWithFrame:frame];
    if(self)
    {
        //initialization code here
        
        [self setBackgroundColor:[UIColor whiteColor]];
        centralText=@"Hello World !!!";
        
        //Gesture Recognition
        //Tap Gesture Code
        UITapGestureRecognizer *singleTapGestureRecognizer=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(onSingleTap:)];
        [singleTapGestureRecognizer setNumberOfTapsRequired:1];
        [singleTapGestureRecognizer setNumberOfTouchesRequired:1];//touch of 1 finger
        [singleTapGestureRecognizer setDelegate:self];
        [self addGestureRecognizer:singleTapGestureRecognizer];
        
        UITapGestureRecognizer *doubleTapGestureRecognizer=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(onDoubleTap:)];
        [doubleTapGestureRecognizer setNumberOfTapsRequired:2];
        [doubleTapGestureRecognizer setNumberOfTouchesRequired:1];//touch of 1 finger
        [doubleTapGestureRecognizer setDelegate:self];
        [self addGestureRecognizer:doubleTapGestureRecognizer];
        
        //this will allow to diffrentiate single and double tap
        [singleTapGestureRecognizer requireGestureRecognizerToFail:doubleTapGestureRecognizer];
        
        //swipe Gesture
        UISwipeGestureRecognizer *swipeGestureRecognizer=[[UISwipeGestureRecognizer alloc]initWithTarget:self action:@selector(onSwipe:)];
        [self addGestureRecognizer:swipeGestureRecognizer];
        
        //long press gesture
        UILongPressGestureRecognizer *longPressGestureRecognizer=[[UILongPressGestureRecognizer alloc]initWithTarget:self action:@selector(onLongPress:)];
        [self addGestureRecognizer:longPressGestureRecognizer];
        
    }
    return self;
}

//only override drawrect :if you perform custom drawing
-(void)drawRect:(CGRect)rect
{
    //black Backgroung
    UIColor *fillcolor=[UIColor blackColor];
    [fillcolor set];
    UIRectFill(rect);
    
    //dictionary with KVC
    NSDictionary *dictionaryForTextAttributes=[NSDictionary dictionaryWithObjectsAndKeys:[UIFont fontWithName:@"Helvetica" size:24],NSFontAttributeName,[UIColor greenColor],NSForegroundColorAttributeName, nil];
    
    
    CGSize textSize=[centralText sizeWithAttributes:dictionaryForTextAttributes];
    CGPoint point;
    point.x=(rect.size.width/2)-(textSize.width/2);
    point.y=(rect.size.height/2)-(textSize.height/2);
    
    [centralText drawAtPoint:point withAttributes:dictionaryForTextAttributes];
}

//to become first responder
-(BOOL)acceptsFirstResponder
{
    return (YES);
}

-(void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    centralText=@"'touchesBegan' Event Occured";
    [self setNeedsDisplay];//repainting
}

-(void)onSingleTap:(UITapGestureRecognizer *)gr
{
    centralText=@"'onSingleTap' Event Occured";
    [self setNeedsDisplay];
}
-(void)onDoubleTap:(UITapGestureRecognizer *)gr
{
    centralText=@"'onDoubleTap' Event Occured";
    [self setNeedsDisplay];
}

-(void)onSwipe:(UISwipeGestureRecognizer *)gr
{
    centralText=@"'onSwipe' Event Occured";
    [self setNeedsDisplay];
}
-(void)onLongPress:(UILongPressGestureRecognizer *)gr
{
    centralText=@"'onLongPress' Event Occured";
    [self setNeedsDisplay];
}

-(void)dealloc
{
    [super dealloc];
}

@end
