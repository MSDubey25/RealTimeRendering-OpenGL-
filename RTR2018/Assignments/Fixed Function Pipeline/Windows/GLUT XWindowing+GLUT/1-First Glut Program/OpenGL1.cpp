
#include<GL/freeglut.h>
bool bIsFullScreen = false;

int main(int argc, char *argv[])
{
	//function declarations
	void Initialize();
	void UnInitialize();
	void display();
	void reshape(int, int);
	void keyboard(unsigned char, int, int);
	void mouse(int, int, int, int);

	//code

	glutInit(&argc, argv);
	glutInitDisplayMode(GLUT_SINGLE | GLUT_RGBA);
	glutInitWindowSize(800, 600);
	glutInitWindowPosition(100, 100);
	glutCreateWindow("My First OpenGL Program-Manikant");

	Initialize();

	//callbacks
	glutDisplayFunc(display);
	glutReshapeFunc(reshape);
	glutKeyboardFunc(keyboard);
	glutMouseFunc(mouse);
	glutCloseFunc(UnInitialize);

	glutMainLoop();
		return 0;
}

void Initialize()
{
	glClearColor(0.0f, 0.0f, 0.0f, 0.1f);

}
void UnInitialize()
{

}

void display()
{
	glClear(GL_COLOR_BUFFER_BIT);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();

	glBegin(GL_TRIANGLES);
	glColor3f(1.0f, 0.0f, 0.0f);
	glVertex2f(0.0f, 1.0f);

	glColor3f(0.0f, 1.0f, 0.0f);
	glVertex2f(-1.0f, -1.0f);

	glColor3f(0.0f, 0.0f, 1.0f);
	glVertex2f(1.0f, -1.0f);

	glEnd();
	glFlush();
}
void reshape(int width, int height)
{
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
}
void keyboard(unsigned char key, int x, int y)
{
	switch (key)
	{
	case 27:
		glutLeaveMainLoop();
		break;
	case 'F':
	case 'f':
		if (bIsFullScreen == false)
		{
			glutFullScreen();
			bIsFullScreen = true;
		}
		else
		{
			glutLeaveFullScreen();
			bIsFullScreen = false;
		}
		break;
	}
}
void mouse(int button, int state, int x, int y)
{
	switch (button)
	{
	case GLUT_LEFT_BUTTON:
		break;
	case GLUT_RIGHT_BUTTON:
		glutLeaveMainLoop();
		break;
	}
}


