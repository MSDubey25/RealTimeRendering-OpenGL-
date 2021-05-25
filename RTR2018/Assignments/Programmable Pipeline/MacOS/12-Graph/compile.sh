mkdir -p Graph.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Graph.app/Contents/MacOS/Graph graph.mm -framework Cocoa -framework QuartzCore -framework OpenGL
