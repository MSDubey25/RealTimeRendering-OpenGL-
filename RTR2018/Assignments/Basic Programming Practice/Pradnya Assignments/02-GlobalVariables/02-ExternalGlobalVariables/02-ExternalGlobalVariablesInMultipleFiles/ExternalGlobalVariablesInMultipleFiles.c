#include <stdio.h>
int global_count = 0;

int main(void)
{
	void change_count(void);
	void change_count_one(void);
	void change_count_two(void);	printf("\n");

	change_count();
	change_count_one();
	change_count_two();
	
	return(0);
}

void change_count(void)
{
	
	global_count = global_count + 1;
	printf("Global Count = %d\n", global_count);
}
