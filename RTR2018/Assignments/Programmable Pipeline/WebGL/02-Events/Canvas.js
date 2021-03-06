//global variables
var canvas=null;
var context=null;
//onload Function
function main()
{
	//get <canvas> element
	canvas=document.getElementById("AMC");
	if(!canvas)
		console.log("Obtaining canvas failed !!!");
	else
		console.log("Obtaining canvas succeded !!!\n");
		
	//print canvas width and height on console
	console.log("Canvas width :"+canvas.width+"\tCanvas Height:"+canvas.height);
	
	//get 2D context
	context=canvas.getContext("2d");
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
	
	//register keyboard's keydown event handler
	window.addEventListener("keydown",keyDown,false);
	window.addEventListener("click",mouseDown,false);
}

function keyDown(event)
{
		alert("Key is Pressed");
}
function mouseDown()
{
		alert("mouse is clicked");
}