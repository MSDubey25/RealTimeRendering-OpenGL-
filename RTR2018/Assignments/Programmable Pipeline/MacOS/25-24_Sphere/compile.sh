mkdir -p Twenty4_Sphere.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Twenty4_Sphere.app/Contents/MacOS/Twenty4_Sphere Sphere.mm sphere24.mm -framework Cocoa -framework QuartzCore -framework OpenGL
