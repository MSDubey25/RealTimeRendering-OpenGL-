mkdir -p Render2Texture.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Render2Texture.app/Contents/MacOS/Render2Texture render2texture.mm -framework Cocoa -framework QuartzCore -framework OpenGL
