mkdir -p Diffuse_Light_On_Sphere_Per_Vertex.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Diffuse_Light_On_Sphere_Per_Vertex.app/Contents/MacOS/Diffuse_Light_On_Sphere_Per_Vertex Sphere.mm diffuse_light_on_sphere_per_vertex.mm -framework Cocoa -framework QuartzCore -framework OpenGL
