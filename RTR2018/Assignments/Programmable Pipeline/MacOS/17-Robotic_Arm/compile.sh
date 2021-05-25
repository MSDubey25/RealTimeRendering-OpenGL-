mkdir -p Robotic_Arm.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o Robotic_Arm.app/Contents/MacOS/Robotic_Arm Sphere.mm robotic_arm.mm -framework Cocoa -framework QuartzCore -framework OpenGL
