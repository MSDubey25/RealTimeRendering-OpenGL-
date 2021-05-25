mkdir -p Window.app/Contents/MacOS

Clang -o Window.app/Contents/MacOS/Window window.m -framework Cocoa
