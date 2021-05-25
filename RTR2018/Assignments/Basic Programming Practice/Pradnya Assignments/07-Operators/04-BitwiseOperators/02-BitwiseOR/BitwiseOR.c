#include <stdio.h>

int main(void)
{
	void PrintBinaryFormOfNumber(unsigned int);

	unsigned int a;
	unsigned int b;
	unsigned int result;

	printf("\n\n");
	printf("Enter An Integer = ");
	scanf("%u", &a);

	printf("\n\n");
	printf("Enter Another Integer = ");
	scanf("%u", &b);

	printf("\n\n\n\n");
	result = a | b;
	printf("Bitwise OR-ing Of \nA = %d (Decimal), %o (Octal), %X (Hexadecimal) and \nB = %d (Decimal), %o (Octal), %X (Hexadecimal) Gives The \nResult = %d (Decimal), %o (Octal), %X (Hexadecimal).\n\n", a, a, a, b, b, b, result, result, result);
	PrintBinaryFormOfNumber(a);
	PrintBinaryFormOfNumber(b);
	PrintBinaryFormOfNumber(result);

	return(0);
}

void PrintBinaryFormOfNumber(unsigned int decimal_number)
{
	unsigned int quotient, remainder;
	unsigned int num;
	unsigned int binary_array[8];
	int i;

	for (i = 0; i < 8; i++)
		binary_array[i] = 0;

	printf("The Binary Form Of The Decimal Integer %d Is\t=\t", decimal_number);
	num = decimal_number;
	i = 7;
	while (num != 0)
	{
		quotient = num / 2;
		remainder = num % 2;
		binary_array[i] = remainder;
		num = quotient;
		i--;
	}

	for (i = 0; i < 8; i++)
		printf("%u", binary_array[i]);

	printf("\n\n");
}
