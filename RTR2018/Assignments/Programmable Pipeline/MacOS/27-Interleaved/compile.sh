mkdir -p Interleaved.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Interleaved.app/Contents/MacOS/Interleaved interleaved.mm -framework Cocoa -framework QuartzCore -framework OpenGL
