mkdir -p CheckerBoard.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o CheckerBoard.app/Contents/MacOS/CheckerBoard checkerboard.mm -framework Cocoa -framework QuartzCore -framework OpenGL
