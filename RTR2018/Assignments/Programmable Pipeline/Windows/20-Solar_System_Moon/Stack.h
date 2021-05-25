#include "vmath.h"
using namespace vmath;

class Stack
{
public:
	// ctor/dtor
	Stack();


	void pushMatrix(mat4 data);
	mat4 popMatrix();
protected:

private:
	struct Node
	{
		mat4 data = mat4::identity();
		struct Node *next = NULL;
	}
	
	*top = NULL;


};
