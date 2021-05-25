#include <stdio.h>
int main(int argc, char *argv[], char *envp[])
{
	void MyAddition(int, int);
	int a, b;
	//code
	printf("\n\n");
	printf("Enter Integer Value For 'A' : ");
	scanf("%d", &a);

	printf("\n\n");
	printf("Enter Integer Value For 'B' : ");
	scanf("%d", &b);

	MyAddition(a, b);

	return(0);
}
void MyAddition(int a, int b)
{
	int sum;
	//code
	sum = a + b;
	printf("\n\n");
	printf("Sum Of %d And %d = %d\n\n", a, b, sum);
}

