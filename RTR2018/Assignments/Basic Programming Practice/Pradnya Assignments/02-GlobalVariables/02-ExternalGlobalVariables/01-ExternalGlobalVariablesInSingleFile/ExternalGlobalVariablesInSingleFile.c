#include <stdio.h>
int main(void)
{
	void change_count(void);
	extern int global_count;
	printf("\n");
	printf("Global Count = %d\n", global_count);
	change_count();
	return(0);
}
int global_count = 0;

void change_count(void)
{
	global_count = global_count + 1;
	printf("Global Count = %d\n", global_count);
}

