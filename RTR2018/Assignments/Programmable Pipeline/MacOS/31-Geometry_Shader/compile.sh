mkdir -p 'Geometry Shader'.app/Contents/MacOS

Clang -o 'Geometry Shader'.app/Contents/MacOS/'Geometry Shader' 'Geometry Shader'.mm -framework Cocoa -framework QuartzCore -framework OpenGL

