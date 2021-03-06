//
//  AppDelegate.m
//  20-Diffuse_Light_On_Sphere_Per_Fragment
//
//  Created by Ajay Arun Pawar on 29/01/20.
//

#import "AppDelegate.h"
#import "ViewController.h"
#import "GLESView.h"

@implementation AppDelegate
{
@private
    UIWindow *mainWindow;
    ViewController *mainViewController;
    GLESView *glesView;
}
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    //get screen bounds for fullscreen
    CGRect screenBounds=[[UIScreen mainScreen]bounds];
    
    //initialize window variable corresponding to screenbounds
    mainWindow=[[UIWindow alloc]initWithFrame:screenBounds];
    mainViewController=[[ViewController alloc]init];
    [mainWindow setRootViewController:mainViewController];
    
    glesView=[[GLESView alloc]initWithFrame:screenBounds];
    
    [mainViewController setView:glesView];
    [glesView release];
    
    [mainWindow addSubview:[mainViewController view]];
    
    [mainWindow makeKeyAndVisible];
    
    [glesView startAnimation];
    
    return YES;
}


- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    [glesView stopAnimation];
}


- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}


- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
}


- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    [glesView startAnimation];
}


- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    [glesView stopAnimation];
}

-(void)dealloc
{
    [glesView release];
    [mainViewController release];
    [mainWindow release];
    [super dealloc];
}
@end
