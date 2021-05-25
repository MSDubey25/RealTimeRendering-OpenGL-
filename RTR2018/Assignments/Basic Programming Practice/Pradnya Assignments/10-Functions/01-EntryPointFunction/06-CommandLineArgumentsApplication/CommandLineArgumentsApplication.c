#include <stdio.h>
#include <ctype.h>
int main(int argc, char *argv[], char *envp[])
{
	int i;
	int num;
	int sum = 0;
	printf("\n\n");
	printf("Sum Of All Integer Command Line Arguments Is : \n\n");
	for (i = 1; i < argc; i++)
	{
		num = atoi(argv[i]);
		sum = sum + num;
	}
	printf("Sum = %d\n\n", sum);
	return(0);
}
