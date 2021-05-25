mkdir -p Two_2D_Shapes_BW.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Two_2D_Shapes_BW.app/Contents/MacOS/Two_2D_Shapes_BW two_2d_shapes_bw.mm -framework Cocoa -framework QuartzCore -framework OpenGL
