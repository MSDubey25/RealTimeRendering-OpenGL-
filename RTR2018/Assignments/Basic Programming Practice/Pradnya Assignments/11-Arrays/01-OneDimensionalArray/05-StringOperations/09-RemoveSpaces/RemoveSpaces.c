#include <stdio.h>

#define MAX_STRING_LENGTH 512

int main(void)
{
	int MyStrlen(char[]);
	void MyStrcpy(char[], char[]);

	char chArray[MAX_STRING_LENGTH], chArray_SpacesRemoved[MAX_STRING_LENGTH];
	int iStringLength;
	int i, j;

	//code
	printf("\n\n");
	printf("Enter A String : \n\n");
	gets_s(chArray, MAX_STRING_LENGTH);

	iStringLength = MyStrlen(chArray);
	j = 0;
	for (i = 0; i < iStringLength; i++)
	{
		if (chArray[i] == ' ')
			continue;
		else
		{
			chArray_SpacesRemoved[j] = chArray[i];
			j++;
		}
	}

	chArray_SpacesRemoved[j] = '\0';

	printf("\n\n");
	printf("String Entered By You Is : \n\n");
	printf("%s\n", chArray);

	printf("\n\n");
	printf("String After Removal Of Spaces Is : \n\n");
	printf("%s\n", chArray_SpacesRemoved);

	return(0);
}

int MyStrlen(char str[])
{
	int j;
	int string_length = 0;

	//code
	for (j = 0; j < MAX_STRING_LENGTH; j++)
	{
		if (str[j] == '\0')
			break;
		else
			string_length++;
	}
	return(string_length);
}
