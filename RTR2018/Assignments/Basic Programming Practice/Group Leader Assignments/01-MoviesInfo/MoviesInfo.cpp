#include<iostream>
using namespace std;
int main()
{
	char continu;
	int choice;
	do
	{
		cout << "======================List of Directors========================="<<endl;
		cout << "1-James Cameron" << endl;
		cout << "2-Peter Jackson" << endl;
		cout << "3-Francis Ford Coppola" << endl;
		cout << "4-Christopher Nolan" << endl;
		cout << "5-Jack Synder" << endl;
		cout << "Enter your choice :";
		cin >> choice;
		switch (choice)
		{
		case 1:
			cout << "\t1-Titanic" << endl;
			cout << "\t2-Avatar" << endl;
			cout << "\t3-The Terminator" << endl;
			cout << "\t4-The Terminator 2" << endl;
			cout << "\t5-Piranha 2" << endl;
			cout << "Enter your choice :";
			cin >> choice;
			switch (choice)
			{
			case 1:
				cout << "======================Movie Info========================= "<< endl;
				cout << "\t\tMovie Name -Titanic" << endl;
				cout << "\t\tProduced by- James Cameron" << endl;
				cout << "\t\tScreenPlay - Russel Carpenter" << endl;
				cout << "\t\tMusic Director - James Horner" << endl;
				cout << "\t\tLead Actor - Leonardo Dicaprio & Kate Winslet" << endl;
				break;
			case 2:
				cout << "======================Movie Info========================= " << endl;
				cout << "\t\tMovie Name -Avatar" << endl;
				cout << "\t\tProduced by- James Cameron" << endl;
				cout << "\t\tScreenPlay - Mauro Fiore" << endl;
				cout << "\t\tMusic Director - James Horner" << endl;
				cout << "\t\tLead Actor - Sam Worthington & Zoe Saldana" << endl;
				break;
			case 3:
				cout << "======================Movie Info========================= " << endl;
				cout << "\t\tMovie Name -The Terminator" << endl;
				cout << "\t\tProduced by- Gale Anne Hurd" << endl;
				cout << "\t\tScreenPlay - Adam Greenberg" << endl;
				cout << "\t\tMusic Director - Brad Fredal" << endl;
				cout << "\t\tLead Actor - Arnold Schwarzenegger & Linda Hamilton" << endl;
				break;
			case 4:
				cout << "======================Movie Info========================= " << endl;
				cout << "\t\tMovie Name -The Terminator 2" << endl;
				cout << "\t\tProduced by- Gale Anne Hurd" << endl;
				cout << "\t\tScreenPlay - Adam Greenberg" << endl;
				cout << "\t\tMusic Director - Brad Fredal" << endl;
				cout << "\t\tLead Actor - Arnold Schwarzenegger & Linda Hamilton" << endl;
				break;
			case 5:
				cout << "======================Movie Info========================= " << endl;
				cout << "\t\tMovie Name -Piranha 2" << endl;
				cout << "\t\tProduced by- Mark Canton" << endl;
				cout << "\t\tScreenPlay - Alex Lehmann" << endl;
				cout << "\t\tMusic Director - Elia Cmiral" << endl;
				cout << "\t\tLead Actor - Matt Bush & Katrina Bowden" << endl;
				break;
			default:
				cout << "\tInvalid Choice Choose Again!!!" << endl;
				cout << "\tEnter your choice :";
				break;
			}
			
			break;
		case 2:
			cout << "\t1-King Kong" << endl;
			cout << "\t2-Bad Taste" << endl;
			cout << "\t3-The Hobbit : An Unexpected Journey" << endl;
			cout << "\t4-The Hobbit : The Desolation of Smaug" << endl;
			cout << "\t5-The Hobbit : The Battle of Five Armies" << endl;
			cout << "\tEnter your choice :";
			cin >> choice;
			switch (choice)
			{
			case 1:
				cout << "======================Movie Info========================= " << endl;
				cout << "\t\tMovie Name -king Kong" << endl;
				cout << "\t\tProduced by- Peter Jackson" << endl;
				cout << "\t\tScreenPlay - Andrew Lesnie" << endl;
				cout << "\t\tMusic Director - James Newton Howard" << endl;
				cout << "\t\tLead Actor - Jack Black & Naomi Watts" << endl;
				break;
			case 2:
				cout << "======================Movie Info========================= " << endl;
				cout << "\t\tMovie Name -Bad Taste" << endl;
				cout << "\t\tProduced by- Peter Jackson" << endl;
				cout << "\t\tScreenPlay - Peter Jackson" << endl;
				cout << "\t\tMusic Director - Jay Snowfield" << endl;
				cout << "\t\tLead Actor - Terry Potter & Laurie Yarral" << endl;
				break;
			case 3:
				cout << "======================Movie Info========================= " << endl;
				cout << "\t\tMovie Name -The Hobbit :An Unexpected Journey" << endl;
				cout << "\t\tProduced by- peter Jackson" << endl;
				cout << "\t\tScreenPlay - Andrew Lesnie" << endl;
				cout << "\t\tMusic Director - Howard Shore" << endl;
				cout << "\t\tLead Actor - Martin Freeman & Kate Blanchett" << endl;
				break;
			case 4:
				cout << "\t\tMovie Name -The Hobbit :The Desolation of Smaug" << endl;
				cout << "\t\tProduced by- peter Jackson" << endl;
				cout << "\t\tScreenPlay - Andrew Lesnie" << endl;
				cout << "\t\tMusic Director - Howard Shore" << endl;
				cout << "\t\tLead Actor - Martin Freeman & Kate Blanchett" << endl;
				break;
			case 5:
				cout << "\t\tMovie Name -The Hobbit :The Battle of Five Armies" << endl;
				cout << "\t\tProduced by- peter Jackson" << endl;
				cout << "\t\tScreenPlay - Andrew Lesnie" << endl;
				cout << "\t\tMusic Director - Howard Shore" << endl;
				cout << "\t\tLead Actor - Martin Freeman & Kate Blanchett" << endl;
				break;
			default:
				cout << "\tInvalid Choice Choose Again!!!" << endl;
				cout << "\tEnter your choice :";
				break;
			}
			break;
		case 3:
			cout << "\t1-The Godfather I" << endl;
			cout << "\t2-The Godfather II" << endl;
			cout << "\t3-The Godfather III" << endl;
			cout << "\t4-Apocolypse Now" << endl;
			cout << "\t5-The Conversation" << endl;
			cout << "\tEnter your choice :";
			cin >> choice;
			switch (choice)
			{
			case 1:
				cout << "\t\tMovie Name -The Godfather I" << endl;
				cout << "\t\tProduced by- Albert Ruddy" << endl;
				cout << "\t\tScreenPlay - Gorden Willis" << endl;
				cout << "\t\tMusic Director - Nino Rota" << endl;
				cout << "\t\tLead Actor -Al Pachino & Daina Keaton " << endl;
				break;
			case 2:
				cout << "\t\tMovie Name -The Godfather II" << endl;
				cout << "\t\tProduced by- Albert Ruddy" << endl;
				cout << "\t\tScreenPlay - Gorden Willis" << endl;
				cout << "\t\tMusic Director - Nino Rota" << endl;
				cout << "\t\tLead Actor -Al Pachino & Daina Keaton " << endl;
				break;
			case 3:
				cout << "\t\tMovie Name -The Godfather III" << endl;
				cout << "\t\tProduced by- Albert Ruddy" << endl;
				cout << "\t\tScreenPlay - Gorden Willis" << endl;
				cout << "\t\tMusic Director - Nino Rota" << endl;
				cout << "\t\tLead Actor -Al Pachino & Daina Keaton " << endl;
				break;
			case 4:
				cout << "\t\tMovie Name -The Apocolypse Now" << endl;
				cout << "\t\tProduced by- Francis Coppola" << endl;
				cout << "\t\tScreenPlay - Vittorio Storaro" << endl;
				cout << "\t\tMusic Director - Carmine Coppola" << endl;
				cout << "\t\tLead Actor -Marlon Brando & Colleen Camp " << endl;
				break;
			case 5:
				cout << "\t\tMovie Name -The Conversation" << endl;
				cout << "\t\tProduced by- Francis Coppola" << endl;
				cout << "\t\tScreenPlay - Bill Butler" << endl;
				cout << "\t\tMusic Director - David Shire" << endl;
				cout << "\t\tLead Actor -John Cazale & CIndy Williams " << endl;
				break;
			default:
				cout << "\tInvalid Choice Choose Again!!!" << endl;
				cout << "\tEnter your choice :";
				break;
			}
			break;
		case 4:
			cout << "\t1-The Prestige" << endl;
			cout << "\t2-Inception" << endl;
			cout << "\t3-Batman Begins" << endl;
			cout << "\t4-The Dark Knight Rises" << endl;
			cout << "\t5-Interstellar" << endl;
			cout << "\tEnter your choice :";
			cin >> choice;
			switch (choice)
			{
			case 1:
				cout << "\t\tMovie Name -The Prestige" << endl;
				cout << "\t\tProduced by- Aaron Ryder" << endl;
				cout << "\t\tScreenPlay - Wally Pfister" << endl;
				cout << "\t\tMusic Director - David Julyan" << endl;
				cout << "\t\tLead Actor -Hugh Jackman & Scarlett Johnson" << endl;
				break;
			case 2:
				cout << "\t\tMovie Name -Inception" << endl;
				cout << "\t\tProduced by- Christopher Nolan" << endl;
				cout << "\t\tScreenPlay - Wally Pfister" << endl;
				cout << "\t\tMusic Director - Hans Zimmer" << endl;
				cout << "\t\tLead Actor -leonardo DiCaprio & Ellen Page " << endl;
				break;
			case 3:
				cout << "\t\tMovie Name -Batman Begins" << endl;
				cout << "\t\tProduced by- Larry Franco" << endl;
				cout << "\t\tScreenPlay - Wally Pfister" << endl;
				cout << "\t\tMusic Director - Hans Zimmer" << endl;
				cout << "\t\tLead Actor -Christane Bale & Katie Holmes " << endl;
				break;
			case 4:
				cout << "\t\tMovie Name -The Dark Knight Rises" << endl;
				cout << "\t\tProduced by- Christopher Nolan" << endl;
				cout << "\t\tScreenPlay - Wally Pfister" << endl;
				cout << "\t\tMusic Director - Hans Zimmer" << endl;
				cout << "\t\tLead Actor -Christane Bale & Anne Hathway " << endl;
				break;
			case 5:
				cout << "\t\tMovie Name -Interstellar" << endl;
				cout << "\t\tProduced by- Christopher Nolan" << endl;
				cout << "\t\tScreenPlay - Hoyte Van Hoytema" << endl;
				cout << "\t\tMusic Director - Hans Zimmer" << endl;
				cout << "\t\tLead Actor -Matthew McConaughey " << endl;
				break;
			default:
				cout << "\tInvalid Choice Choose Again!!!" << endl;
				cout << "\tEnter your choice :";
				break;
			}
			break;
		case 5:
			cout << "\t1-Dawn of the Dead" << endl;
			cout << "\t2-300" << endl;
			cout << "\t3-Man of Steel" << endl;
			cout << "\t4-Justice League" << endl;
			cout << "\t5-Batman vs Superman" << endl;
			cout << "\tEnter your choice :";
			cin >> choice;
			switch (choice)
			{
			case 1:
				cout << "\t\tMovie Name -Dawn of the Dead" << endl;
				cout << "\t\tProduced by- Marc Abrahman" << endl;
				cout << "\t\tScreenPlay - Matthew Leonetti" << endl;
				cout << "\t\tMusic Director - Tyler Bates" << endl;
				cout << "\t\tLead Actor -Jake Weber & Sarah Polley" << endl;
				break;
			case 2:
				cout << "\t\tMovie Name -300" << endl;
				cout << "\t\tProduced by- Mark Canton" << endl;
				cout << "\t\tScreenPlay - Larry Fong" << endl;
				cout << "\t\tMusic Director - Tyler Bates" << endl;
				cout << "\t\tLead Actor -Gerard Buttler & Lena Headey " << endl;
				break;
			case 3:
				cout << "\t\tMovie Name -Man of Steel" << endl;
				cout << "\t\tProduced by- Christopher Nolan" << endl;
				cout << "\t\tScreenPlay - Amir Mokri" << endl;
				cout << "\t\tMusic Director - Hans Zimmer" << endl;
				cout << "\t\tLead Actor -Henry Cavill & Amy Adams " << endl;
				break;
			case 4:
				cout << "\t\tMovie Name -Justice League" << endl;
				cout << "\t\tProduced by- Christopher Nolan" << endl;
				cout << "\t\tScreenPlay - Fabien Wagner" << endl;
				cout << "\t\tMusic Director - Danny Elfman" << endl;
				cout << "\t\tLead Actor -Ben Affleck & Amy Adams " << endl;
				break;
			case 5:
				cout << "\t\tMovie Name -Batman vs Superman" << endl;
				cout << "\t\tProduced by- Christopher Nolan" << endl;
				cout << "\t\tScreenPlay - Larry Fong" << endl;
				cout << "\t\tMusic Director - Hans Zimmer" << endl;
				cout << "\t\tLead Actor -Ben Affleck & Amy Adams " << endl; 
				break;
			default:
				cout << "\tInvalid Choice Choose Again!!!" << endl;
				cout << "\tEnter your choice :";
				break;
			}
			break;
		default:
			cout << "Invalid Choice Choose Again!!!"<<endl;
			cout << "Enter your choice :" ;
			break;
		}
		cout << "Do U want to Continue y/n :";
		cin >> continu;
	} while (continu=='y'|| continu=='Y');
	return 0;
}
