mkdir -p Orthographic_Projection.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Orthographic_Projection.app/Contents/MacOS/Orthographic_Projection Ortho.mm -framework Cocoa -framework QuartzCore -framework OpenGL
