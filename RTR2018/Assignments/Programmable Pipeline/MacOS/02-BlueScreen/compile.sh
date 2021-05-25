mkdir -p BlueScreen.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o BlueScreen.app/Contents/MacOS/BlueScreen Bluescreen.mm -framework Cocoa -framework QuartzCore -framework OpenGL
