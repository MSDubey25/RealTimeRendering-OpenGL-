mkdir -p 3D_Texture_Stone_Kundali.app/Contents/MacOS

Clang++ -Wdeprecated-declarations -o 3D_Texture_Stone_Kundali.app/Contents/MacOS/3D_Texture_Stone_Kundali 3d_texture_stone_kundali.mm -framework Cocoa -framework QuartzCore -framework OpenGL
