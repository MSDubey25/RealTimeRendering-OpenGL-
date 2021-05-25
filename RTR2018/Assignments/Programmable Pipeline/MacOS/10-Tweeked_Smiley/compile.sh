mkdir -p TweekedSmiley.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o TweekedSmiley.app/Contents/MacOS/TweekedSmiley tweekedsmiley.mm -framework Cocoa -framework QuartzCore -framework OpenGL
