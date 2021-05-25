mkdir -p Diffuse_Light_On_Sphere_Toggle.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Diffuse_Light_On_Sphere_Toggle.app/Contents/MacOS/Diffuse_Light_On_Sphere_Toggle Sphere.mm diffuse_light_on_sphere_per_vertex_per_fragment_toggle.mm -framework Cocoa -framework QuartzCore -framework OpenGL
