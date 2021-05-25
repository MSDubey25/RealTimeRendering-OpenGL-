mkdir -p Diffuse_Light.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Diffuse_Light.app/Contents/MacOS/Diffuse_Light diffuse_light.mm -framework Cocoa -framework QuartzCore -framework OpenGL
