mkdir -p Smiley.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Smiley.app/Contents/MacOS/Smiley smiley.mm -framework Cocoa -framework QuartzCore -framework OpenGL
