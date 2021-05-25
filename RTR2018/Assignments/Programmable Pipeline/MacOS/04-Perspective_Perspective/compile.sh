mkdir -p Perspective_Projection.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Perspective_Projection.app/Contents/MacOS/Perspective_Projection perspective.mm -framework Cocoa -framework QuartzCore -framework OpenGL
