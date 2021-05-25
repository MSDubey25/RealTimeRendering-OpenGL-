mkdir -p Multiple_Viewports.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Multiple_Viewports.app/Contents/MacOS/Multiple_Viewports multiple_viewports.mm -framework Cocoa -framework QuartzCore -framework OpenGL
