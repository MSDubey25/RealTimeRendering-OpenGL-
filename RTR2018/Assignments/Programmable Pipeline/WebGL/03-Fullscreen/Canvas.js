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
	
	drawText("Hello World !!!");
	
	//register keyboard's keydown event handler
	window.addEventListener("keydown",keyDown,false);
	window.addEventListener("click",mouseDown,false);
}
function drawText(text)
{
	//center the text
	context.textAlign="center";	//center horizontally
	context.textBaseline="middle";	//center vertically

	//text font
	context.font="48px sans-serif";
	
	//text color
	context.fillStyle="white";
	
	//display the text in center
	context.fillText(text,canvas.width/2,canvas.height/2);
	
}

function toggleFullScreen()
{
		var fullscreen_element=document.fullscreenElement || document.webkitFullscreenElement || 
		document.mozFullScreenElement || document.msFullscreenElement || null;
		
		//if not fullscreen
		if(!fullscreen_element)
		{
				if(canvas.requestFullscreen)
					canvas.requestFullscreen();
				else if(canvas.webkitRequestFullscreen)
					canvas.webkitRequestFullscreen();
				else if(canvas.mozRequestFullScreen)
					canvas.mozRequestFullScreen();
				else if(canvas.msRequestFullscreen)
					canvas.msRequestFullscreen();
		}
		else
		{
				if(document.exitFullscreen)
					document.exitFullscreen();
				else if(document.webkitExitFullscreen)
					document.webkitExitFullscreen();
				else if(document.mozCancelFullScreen)
					document.mozCancelFullScreen();
				else if(document.msExitFullscreen)
					document.msExitFullscreen();
		}
}

function keyDown(event)
{
		switch(event.keyCode)
		{
			case 70: //for 'F' or 'f'
				toggleFullScreen();
				
				//repaint
				drawText("Hello World !!!");
				break;
		}
}
function mouseDown()
{
		
}