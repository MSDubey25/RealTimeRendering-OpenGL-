#include <stdio.h>

int main(void)
{
	//variable declarations
	int length, breadth, area;

	struct MyPoint
	{
		int x;
		int y;
	};

	struct Rectangle
	{
		struct MyPoint point_01;
		struct MyPoint point_02;
	};

	struct Rectangle rect = { {2, 3}, {5, 6} };

	//code
	length = rect.point_02.y - rect.point_01.y;
	if (length < 0)
		length = length * -1;

	breadth = rect.point_02.x - rect.point_01.x;
	if (breadth < 0)
		breadth = breadth * -1;

	area = length * breadth;

	printf("\n\n");
	printf("Length Of Rectangle = %d\n\n", length);
	printf("Breadth Of Rectangle = %d\n\n", breadth);
	printf("Area Of Rectangle = %d\n\n", area);

	return(0);
}
