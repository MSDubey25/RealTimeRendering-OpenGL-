mkdir -p Dynamic_India.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Dynamic_India.app/Contents/MacOS/Dynamic_India dynamic_india.mm -framework Cocoa -framework QuartzCore -framework OpenGL
