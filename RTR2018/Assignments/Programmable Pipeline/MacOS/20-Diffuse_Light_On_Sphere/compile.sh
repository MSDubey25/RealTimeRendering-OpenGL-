mkdir -p Diffuse_Light_On_Sphere.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Diffuse_Light_On_Sphere.app/Contents/MacOS/Diffuse_Light_On_Sphere Sphere.mm diffuse_light_on_sphere.mm -framework Cocoa -framework QuartzCore -framework OpenGL
