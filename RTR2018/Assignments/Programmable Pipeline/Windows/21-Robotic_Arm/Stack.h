#include "vmath.h"
using namespace vmath;

class Stack
{
public:
	// ctor/dtor
	Stack();


	void push(mat4 data);
	mat4 pop();
protected:

private:
	struct Node
	{
		mat4 data = mat4::identity();
		struct Node *next = NULL;
	}
	
	*top = NULL;


};
