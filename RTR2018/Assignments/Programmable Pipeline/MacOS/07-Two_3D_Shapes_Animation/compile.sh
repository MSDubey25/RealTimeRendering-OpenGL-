mkdir -p Two_3D_Shapes_Animation.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Two_3D_Shapes_Animation.app/Contents/MacOS/Two_3D_Shapes_Animation two_3d_shapes_animation.mm -framework Cocoa -framework QuartzCore -framework OpenGL
