mkdir -p 'TessellationShader'.app/Contents/MacOS

Clang -o 'TessellationShader'.app/Contents/MacOS/'TessellationShader' 'TessellationShader'.mm -framework Cocoa -framework QuartzCore -framework OpenGL

