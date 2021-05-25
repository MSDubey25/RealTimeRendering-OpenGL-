
#include<GL/freeglut.h>
bool bIsFullScreen = false;
int year = 0;
int day = 0;
int main(int argc, char *argv[])
{
	//function declarations
	void Initialize();
	void UnInitialize();
	void display();
	void reshape(int, int);
	void keyboard(unsigned char, int, int);
	void mouse(int, int, int, int);
	void Update();
	//code

	glutInit(&argc, argv);
	glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA | GLUT_DEPTH);
	glutInitWindowSize(800, 600);
	glutInitWindowPosition(100, 100);
	glutCreateWindow("Solar System");

	Initialize();

	//callbacks
	glutDisplayFunc(display);
	glutReshapeFunc(reshape);
	glutKeyboardFunc(keyboard);
	glutMouseFunc(mouse);
	glutCloseFunc(UnInitialize);
	glutIdleFunc(Update);
	glutMainLoop();
	//	return 0; //already returned in glutMainLoop()
}

void Initialize()
{
	glShadeModel(GL_FLAT);
	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	glClearDepth(1.0f);
	//glutReshapeFunc(reshape);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);

}
void UnInitialize()
{

}

void display()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	gluLookAt(0.0f,0.0f,5.0f,0.0f,0.0f,0.0f,0.0f,1.0f,0.0f);
	glPushMatrix();
	glutWireSphere(1.0f,20.0f,16.0f);
	glRotatef(GLfloat(year),0.0f,1.0f,0.0f);//revolution
	glTranslatef(2.0f,0.0f,0.0f);
	glRotatef(GLfloat(day),0.0f,1.0f,0.0f);//rotation
	glutWireSphere(0.2f,10.0f,8.0f);
	glPopMatrix();
	glutSwapBuffers();
}
void reshape(int width, int height)
{
	if (height == 0)
		height = 1;
	glViewport(0, 0, GLsizei(width), GLsizei(height));
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(60.0f,
		(GLfloat)width / (GLfloat)height,
		1.0f,
		20.0f);
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
	case 'Y':
		year = (year + 5) % 360;
		glutPostRedisplay();
		break;
	case 'y':
		year = (year - 5) % 360;
		glutPostRedisplay();
		break;
	case 'D':
		day = (day + 10) % 360;
		glutPostRedisplay();
		break;
	case 'd':
		day = (day - 10) % 360;
		glutPostRedisplay();
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
void Update()
{
	//year = (year + 5) % 360;
	
	//day = (day + 10) % 360;
	glutPostRedisplay();
}

