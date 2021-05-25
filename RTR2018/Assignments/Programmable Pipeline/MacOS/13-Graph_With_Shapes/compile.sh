mkdir -p Graph_With_Shapes.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Graph_With_Shapes.app/Contents/MacOS/Graph_With_Shapes graph_with_shapes.mm -framework Cocoa -framework QuartzCore -framework OpenGL
