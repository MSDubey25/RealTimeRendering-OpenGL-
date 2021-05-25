mkdir -p Two_2D_Shapes_Color.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Two_2D_Shapes_Color.app/Contents/MacOS/Two_2D_Shapes_Color two_2d_shapes_color.mm -framework Cocoa -framework QuartzCore -framework OpenGL
