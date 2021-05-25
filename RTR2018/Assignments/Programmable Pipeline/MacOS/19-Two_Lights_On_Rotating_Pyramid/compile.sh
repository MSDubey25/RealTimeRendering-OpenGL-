mkdir -p Two_Lights_On_Rotating_Pyramid.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Two_Lights_On_Rotating_Pyramid.app/Contents/MacOS/Two_Lights_On_Rotating_Pyramid two_lights_on_rotating_pyramid.mm -framework Cocoa -framework QuartzCore -framework OpenGL
