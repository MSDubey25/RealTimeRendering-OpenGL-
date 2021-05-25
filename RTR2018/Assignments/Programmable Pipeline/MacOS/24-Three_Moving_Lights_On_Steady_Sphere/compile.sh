mkdir -p Three_Moving_Lights_On_Steady_Sphere.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Three_Moving_Lights_On_Steady_Sphere.app/Contents/MacOS/Three_Moving_Lights_On_Steady_Sphere Sphere.mm three_movin_lights_on_steady_sphere.mm -framework Cocoa -framework QuartzCore -framework OpenGL
