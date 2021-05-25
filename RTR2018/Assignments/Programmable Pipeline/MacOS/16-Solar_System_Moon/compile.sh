mkdir -p Solar_System_Moon.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Solar_System_Moon.app/Contents/MacOS/Solar_System_Moon Sphere.mm solar_system.mm -framework Cocoa -framework QuartzCore -framework OpenGL
