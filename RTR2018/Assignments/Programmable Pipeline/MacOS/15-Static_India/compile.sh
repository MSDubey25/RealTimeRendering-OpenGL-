mkdir -p Static_India.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Static_India.app/Contents/MacOS/Static_India static_india.mm -framework Cocoa -framework QuartzCore -framework OpenGL
