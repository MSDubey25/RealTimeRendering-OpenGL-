mkdir -p Deathly_Hollow.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Deathly_Hollow.app/Contents/MacOS/Deathly_Hollow deathly_hollow.mm -framework Cocoa -framework QuartzCore -framework OpenGL
