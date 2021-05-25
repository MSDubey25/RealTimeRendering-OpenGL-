mkdir -p Diffuse_Light_On_Sphere_Per_Fragment.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Diffuse_Light_On_Sphere_Per_Fragment.app/Contents/MacOS/Diffuse_Light_On_Sphere_Per_Fragment Sphere.mm diffuse_light_on_sphere_per_fragment.mm -framework Cocoa -framework QuartzCore -framework OpenGL
