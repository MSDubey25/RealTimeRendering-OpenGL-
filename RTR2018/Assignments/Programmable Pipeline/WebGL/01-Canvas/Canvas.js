//onload Function
function main()
{
	//get <canvas> element
	var canvas=document.getElementById("AMC");
	if(!canvas)
		console.log("Obtaining canvas failed !!!");
	else
		console.log("Obtaining canvas succeded !!!\n");
		
	//print canvas width and height on console
	console.log("Canvas width :"+canvas.width+"\tCanvas Height:"+canvas.height);
	
	//get 2D context
	var context=canvas.getContext("2d");
	if(!context)
		console.log("Obtaining 2D context failed !!!");
	else
		console.log("Obtaining 2D context succeded !!!");
		
	//fill canvas with black color
	context.fillStyle="black";
	context.fillRect(0,0,canvas.width,canvas.height);
	
	//center the text
	context.textAlign="center";	//center horizontally
	context.textBaseline="middle";	//center vertically
	
	//text
	var str="Hello World !!!";
	
	//text font
	context.font="48px sans-serif";
	
	//text color
	context.fillStyle="white";
	
	//display the text in center
	context.fillText(str,canvas.width/2,canvas.height/2);
}