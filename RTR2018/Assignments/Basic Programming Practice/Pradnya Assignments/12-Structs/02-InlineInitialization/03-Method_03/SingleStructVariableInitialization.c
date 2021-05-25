#include <stdio.h>

int main(void)
{
	//DEFINING STRUCT
	struct MyData
	{
		int i;
		float f;
		double d;
		char c;
	} data = { 5, 9.1f, 3.78623, 'N' };

	//Displaying Values Of The Data Members Of 'struct MyData'
	printf("\n\n");
	printf("DATA MEMBERS OF 'struct MyData' ARE : \n\n");
	printf("i = %d\n", data.i);
	printf("f = %f\n", data.f);
	printf("d = %lf\n", data.d);
	printf("c = %c\n\n", data.c);
	return(0);
}


