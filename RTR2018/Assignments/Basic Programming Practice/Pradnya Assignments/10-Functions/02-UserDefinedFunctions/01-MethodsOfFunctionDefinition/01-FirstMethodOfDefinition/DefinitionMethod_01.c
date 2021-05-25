#include <stdio.h>
int main(int argc, char *argv[], char *envp[])
{
	void MyAddition(void);
	//code
	MyAddition();
	return(0);
}
void MyAddition(void)
{
	int a, b, sum;
	//code
	printf("\n\n");
	printf("Enter Integer Value For 'A' : ");
	scanf("%d", &a);

	printf("\n\n");
	printf("Enter Integer Value For 'B' : ");
	scanf("%d", &b);

	sum = a + b;

	printf("\n\n");
	printf("Sum Of %d And %d = %d\n\n", a, b, sum);
}
