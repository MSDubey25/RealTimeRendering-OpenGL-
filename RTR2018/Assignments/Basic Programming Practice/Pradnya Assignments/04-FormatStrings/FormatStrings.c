#include <stdio.h>
int main(void)
{
	printf("\n");
	printf("Hello World !!!\n\n");

	int a = 13;
	printf("Integer Decimal Value Of 'A' = %d\n", a);
	printf("Integer Octal Value Of 'A' = %o\n", a);
	printf("Integer Hexadecimal Value Of 'A' (Hexadecimal Letters In Lower Case) = %x\n", a);
	printf("Integer Hexadecimal Value Of 'A' (Hexadecimal Letters In Lower Case) = %X\n\n", a);

	char ch = 'P';
	printf("Character ch = %c\n", ch);
	char str[] = "Pradnya Gokhale";
	printf("String str = %s\n\n", str);

	long num = 30121995L;
	printf("Long Integer = %ld\n\n", num);

	unsigned int b = 7;
	printf("Unsigned Integer 'b' = %u\n\n", b);

	float f_num = 3012.1995f;
	printf("Floating Point Number With Just %%f 'f_num' = %f\n", f_num);
	printf("Floating Point Number With %%4.2f 'f_num' = %4.2f\n", f_num);
	printf("Floating Point Number With %%2.5f 'f_num' = %2.5f\n\n", f_num);

	double d_pi = 3.14159265358979323846;
	printf("Double Precision Floating Point Number Without Exponential = %g\n", d_pi);
	printf("Double Precision Floating Point Number With Exponential (Lower Case) = %e\n", d_pi);
	printf("Double Precision Floating Point Number With Exponential (Upper Case) = %E\n\n", d_pi);
	printf("Double Hexadecimal Value Of 'd_pi' (Hexadecimal Letters In Lower Case) = %a\n", d_pi);
	printf("Double Hexadecimal Value Of 'd_pi' (Hexadecimal Letters In Upper Case) = %A\n", d_pi);

	return(0);
}
