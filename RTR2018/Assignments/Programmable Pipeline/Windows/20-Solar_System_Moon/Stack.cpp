
#include <windows.h>    



#include<GL\glew.h>
#include<gl\GL.h>


#include <iostream>
#include <iomanip>
#include <cmath>
#include "Stack.h"

///////////////////////////////////////////////////////////////////////////////
// ctor
///////////////////////////////////////////////////////////////////////////////
Stack::Stack()
{
	top = NULL;
}

// to empty and destroy the MatrixStack


// to insert elements in MatrixStack
void Stack::pushMatrix(mat4 val)
{
	struct Node *temp;
	temp = (struct Node*)malloc(sizeof(struct Node));
	temp->data = val;
	temp->next = top;
	top = temp;
}

// to delete elements from MatrixStack
mat4 Stack::popMatrix()
{
	struct Node *temp;
	mat4 val;
	val.identity();
	if (top == NULL)
	{

	}
	else
	{
		temp = top;
		top = top->next;
		val = temp->data;
		free(temp);
	}
	return val;
}
