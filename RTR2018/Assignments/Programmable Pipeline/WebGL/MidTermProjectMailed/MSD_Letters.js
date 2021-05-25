
//msdDrawE(vbo,vbo_color,vbo_texture,rectangle_texture);

function msdDrawU(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var UCoordinates=new Float32Array([
									  
										0.4,-0.8, 0.0,//front bottom 2
									   -0.1,-0.8, 0.0,//front bottom
									   -0.1,-1.0, 0.0,//front bottom
										0.4,-1.0, 0.0,//front bottom
									    0.6, 1.0, 0.0,//front right 3
										0.4, 1.0, 0.0,//front right
										0.4,-1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.1, 1.0, 0.0,//front left 4
									   -0.1, 1.0, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.4,-0.8, 0.1,//front bottom 6
									   -0.1,-0.8, 0.1,//front bottom
									   -0.1,-1.0, 0.1,//front bottom
										0.4,-1.0, 0.1,//front bottom
									    0.6, 1.0, 0.1,//front right 7
										0.4, 1.0, 0.1,//front right 
										0.4,-1.0, 0.1,//front right 
										0.6,-1.0, 0.1,//front right 
										0.1, 1.0, 0.1,//front left 8
									   -0.1, 1.0, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.6, 1.0, 0.1,//right right 9
										0.6, 1.0, 0.0,//right right
										0.6,-1.0, 0.0,//right right
										0.6,-1.0, 0.1,//right right
										0.4, 1.0, 0.1,//right left 10
										0.4, 1.0, 0.0,//right left 
										0.4,-0.8, 0.0,//right left 
										0.4,-0.8, 0.1,//right left 
										0.1, 1.0, 0.1,//left right 11
										0.1, 1.0, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 1.0, 0.1,//left left 12
									   -0.1, 1.0, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.1, 1.0, 0.1,//top top 13
									   -0.1, 1.0, 0.0,//top top 
									    0.1, 1.0, 0.0,//top top 
									    0.1, 1.0, 0.1,//top top 
									    0.6, 1.0, 0.1,//top bottom 14
									    0.6, 1.0, 0.0,//top bottom
									    0.4, 1.0, 0.0,//top bottom
										0.4, 1.0, 0.1,//top bottom
									   -0.1,-0.8, 0.1,//bottom top 15
									   -0.1,-0.8, 0.0,//bottom top
									    0.4,-0.8, 0.0,//bottom top
										0.4,-0.8, 0.1,//bottom top
									   -0.1,-1.0, 0.1,//bottom bottom 16
									   -0.1,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.1, 1.0, 0.1,//top left 17
									   -0.1, 1.0, 0.0,//top left
									   -0.1, 0.8, 0.0,//top left
									   -0.1, 0.8, 0.1,//top left
									   -0.1,-0.8, 0.1,//bottom left 18
									   -0.1,-0.8, 0.0,//bottom left
									   -0.1,-1.0, 0.0,//bottom left
									   -0.1,-1.0, 0.1 //bottom left
									    
										   ]);
	var UcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//front left 4
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 0.0, 1.0,//front top 5
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										1.0, 0.0, 0.0,//front bottom 6
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										0.0, 1.0, 1.0,//front right 7
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front left 8
 										0.0, 1.0, 1.0,//front left
	                                    0.0, 1.0, 1.0,//front left
										0.0, 1.0, 1.0,//front left
										1.0, 1.0, 0.0,//right right 9
 										1.0, 1.0, 0.0,//right right
	                                    1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right left 10
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 1.0,//left right 11
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left left 12
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 0.0, 1.0,//top top 13
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 1.0, 0.0,//top bottom 14
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 15
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										0.0, 0.6, 1.0,//bottom bottom 16
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//top left 17
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.6, 0.6, 1.0,//bottom left 18
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										
								
										]);
	var UTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front left 4
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 5
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 6
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 7
											1.0,0.0,//front right 
											1.0,1.0,//front right 
											0.0,1.0,//front right 
											0.0,0.0,//front left 8
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//right right 9
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 10
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//left right 11
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 12
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 13
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 14
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 15
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 16
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top left 17
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom left 18
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
										
									
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,UCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,UcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,UTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
		
	gl.bindVertexArray(null);
}



function msdDrawY(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var YCoordinates=new Float32Array([
										0.0, 0.8, 0.0,//front middle 1
										0.0, 0.4, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.0,//front middle
										0.0, 0.8, 0.1,//back middle 2
										0.0, 0.4, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.3, 0.2, 0.1,//back middle
										0.0, 0.8, 0.1,//middle up 3
										0.0, 0.8, 0.0,//middle up
										0.3, 0.2, 0.0,//middle up
										0.3, 0.2, 0.1,//middle up
										0.0, 0.4, 0.1,//middle down 4
										0.0, 0.4, 0.0,//middle down
										0.3,-0.2, 0.0,//middle down
										0.3,-0.2, 0.1,//middle down
										0.6, 0.8, 0.0,//front middle 5
										0.6, 0.4, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.0,//front middle
										0.6, 0.8, 0.1,//back middle 6
										0.6, 0.4, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.3, 0.2, 0.1,//back middle
										0.6, 0.8, 0.1,//middle up 7
										0.6, 0.8, 0.0,//middle up
										0.3, 0.2, 0.0,//middle up
										0.3, 0.2, 0.1,//middle up
										0.6, 0.4, 0.1,//middle down 8
										0.6, 0.4, 0.0,//middle down
										0.3,-0.2, 0.0,//middle down
										0.3,-0.2, 0.1,//middle down
									   0.35, 0.0, 0.0,//middle left half front 9
										0.3,-0.2, 0.0,//middle left half front
										0.3,-1.0, 0.0,//middle left half front
									   0.35,-1.0, 0.0,//middle left half front
									   0.35, 0.0, 0.1,//middle left half back 10
										0.3,-0.2, 0.1,//middle left half back
										0.3,-1.0, 0.1,//middle left half back
									   0.35,-1.0, 0.1,//middle left half back
									   0.25, 0.0, 0.0,//middle right half front 11
										0.3,-0.2, 0.0,//middle right half front
										0.3,-1.0, 0.0,//middle right half front
									   0.25,-1.0, 0.0,//middle right half front
									   0.25, 0.0, 0.1,//middle right half back 12
										0.3,-0.2, 0.1,//middle right half back
										0.3,-1.0, 0.1,//middle right half back
									   0.25,-1.0, 0.1,//middle right half back
									   0.35, 0.0, 0.1,//middle right half right 13
									   0.35, 0.0, 0.0,//middle right half right
									   0.35,-1.0, 0.0,//middle right half right
									   0.35,-1.0, 0.1,//middle right half right
									   0.25, 0.0, 0.1,//middle right half left 14
									   0.25, 0.0, 0.0,//middle right half left
									   0.25,-1.0, 0.0,//middle right half left
									   0.25,-1.0, 0.1,//middle right half left
									   0.25,-1.0, 0.1,//middle bottom 15
									   0.25,-1.0, 0.0,//middle bottom 
									   0.35,-1.0, 0.0,//middle bottom 
									   0.35,-1.0, 0.1,//middle bottom 
									    0.6, 0.8, 0.1,//top right 16
										0.6, 0.8, 0.0,//top right
										0.6, 0.4, 0.0,//top right
										0.6, 0.4, 0.1,//top right
									   -0.0, 0.8, 0.1,//top left 17
									   -0.0, 0.8, 0.0,//top left
									   -0.0, 0.4, 0.0,//top left
									   -0.0, 0.4, 0.1,//top left
									   
										   ]);
	var YcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front middle 1
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										0.0, 0.0, 1.0,//back middle 2
										0.0, 0.0, 1.0,//back middle
										0.0, 0.0, 1.0,//back middle
										0.0, 0.0, 1.0,//back middle
										1.0, 0.0, 0.0,//middle up 3
										1.0, 0.0, 0.0,//middle up
										1.0, 0.0, 0.0,//middle up
										1.0, 0.0, 0.0,//middle up
										0.0, 1.0, 0.0,//middle down 4
										0.0, 1.0, 0.0,//middle down
										0.0, 1.0, 0.0,//middle down
										0.0, 1.0, 0.0,//middle down
										0.0, 0.0, 1.0,//front middle 5
										0.0, 0.0, 1.0,//front middle
										0.0, 0.0, 1.0,//front middle
										0.0, 0.0, 1.0,//front middle
										1.0, 0.0, 0.0,//back middle 6
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										0.0, 1.0, 1.0,//middle up 7
										0.0, 1.0, 1.0,//middle up
										0.0, 1.0, 1.0,//middle up
										0.0, 1.0, 1.0,//middle up
										0.0, 1.0, 1.0,//middle down 8
 										0.0, 1.0, 1.0,//middle down
	                                    0.0, 1.0, 1.0,//middle down
										0.0, 1.0, 1.0,//middle down
										1.0, 1.0, 0.0,//middle left half front 9
 										1.0, 1.0, 0.0,//middle left half front
	                                    1.0, 1.0, 0.0,//middle left half front
										1.0, 1.0, 0.0,//middle left half front
										1.0, 1.0, 0.0,//middle left half back 10
										1.0, 1.0, 0.0,//middle left half back
										1.0, 1.0, 0.0,//middle left half back
										1.0, 1.0, 0.0,//middle left half back
										1.0, 1.0, 1.0,//middle right half front 11
										1.0, 1.0, 1.0,//middle right half front
										1.0, 1.0, 1.0,//middle right half front
										1.0, 1.0, 1.0,//middle right half front
										1.0, 1.0, 1.0,//middle right half back 12
										1.0, 1.0, 1.0,//middle right half back
										1.0, 1.0, 1.0,//middle right half back
										1.0, 1.0, 1.0,//middle right half back
										1.0, 0.0, 1.0,//middle right half right 13
										1.0, 0.0, 1.0,//middle right half right
										1.0, 0.0, 1.0,//middle right half right
										1.0, 0.0, 1.0,//middle right half right
										1.0, 1.0, 0.0,//middle right half left 14
										1.0, 1.0, 0.0,//middle right half left
										1.0, 1.0, 0.0,//middle right half left
										1.0, 1.0, 0.0,//middle right half left
										1.0, 1.0, 0.0,//middle bottom 15
										1.0, 1.0, 0.0,//middle bottom 
										1.0, 1.0, 0.0,//middle bottom 
										1.0, 1.0, 0.0,//middle bottom 
										0.0, 0.6, 1.0,//top right 16
										0.0, 0.6, 1.0,//top right
										0.0, 0.6, 1.0,//top right
										0.0, 0.6, 1.0,//top right
										1.0, 1.0, 0.0,//top left 17
										1.0, 1.0, 0.0,//top left
										1.0, 1.0, 0.0,//top left
										1.0, 1.0, 0.0,//top left
										
										]);
	var YTexture=new Float32Array([
											0.0,0.0,//front middle 1
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back middle 2
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//middle up 3
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 4
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//front middle 5
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back middle 6
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//middle up 7
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 8
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//middle left half front 9
											1.0,0.0,//middle left half front
											1.0,1.0,//middle left half front
											0.0,1.0,//middle left half front
											0.0,0.0,//middle left half back 10
											1.0,0.0,//middle left half back
											1.0,1.0,//middle left half back
											0.0,1.0,//middle left half back
											0.0,0.0,//middle right half front 11
											1.0,0.0,//middle right half front
											1.0,1.0,//middle right half front
											0.0,1.0,//middle right half front
											0.0,0.0,//middle right half back 12
											1.0,0.0,//middle right half back
											1.0,1.0,//middle right half back
											0.0,1.0,//middle right half back
											0.0,0.0,//middle right half right 13
											1.0,0.0,//middle right half right
											1.0,1.0,//middle right half right
											0.0,1.0,//middle right half right
											0.0,0.0,//middle right half left 14
											1.0,0.0,//middle right half left
											1.0,1.0,//middle right half left
											0.0,1.0,//middle right half left
											0.0,0.0,//middle bottom 15
											1.0,0.0,//middle bottom 
											1.0,1.0,//middle bottom 
											0.0,1.0,//middle bottom 
											0.0,0.0,//top right 16
											1.0,0.0,//top right
											1.0,1.0,//top right
											0.0,1.0,//top right
											0.0,0.0,//top left 17
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,YCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,YcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,YTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
		
	gl.bindVertexArray(null);
}


function msdDrawDash(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var DashCoordinates=new Float32Array([
										    0.2, 0.1, 0.0,//front 1
										   -0.2, 0.1, 0.0,//front
										   -0.2,-0.1, 0.0,//front
										    0.2,-0.1, 0.0,//front
											0.2, 0.1, 0.1,//back 2
										   -0.2, 0.1, 0.1,//back
										   -0.2,-0.1, 0.1,//back
										    0.2,-0.1, 0.1,//back
											0.2, 0.1, 0.1,//right 3
											0.2, 0.1, 0.0,//right
											0.2,-0.1, 0.0,//right
											0.2,-0.1, 0.1,//right
										   -0.2, 0.1, 0.1,//left 4
										   -0.2, 0.1, 0.0,//left
										   -0.2,-0.1, 0.0,//left
										   -0.2,-0.1, 0.1,//left
										   -0.2, 0.1, 0.1,//top 5
										   -0.2, 0.1, 0.0,//top
										    0.2, 0.1, 0.0,//top
											0.2, 0.1, 0.1,//top
										   -0.2,-0.1, 0.1,//bottom 5
										   -0.2,-0.1, 0.0,//bottom
										    0.2,-0.1, 0.0,//bottom
											0.2,-0.1, 0.1,//bottom
											
										   ]);
	var DashcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front left 3
										1.0, 0.0, 0.0,//front left 
										1.0, 0.0, 0.0,//front left 
										1.0, 0.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front top 4
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 0.0, 1.0,//front bottom 5
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front left 6
										1.0, 0.0, 0.0,//front left
										1.0, 0.0, 0.0,//front left
										1.0, 0.0, 0.0,//front left
										
										]);
	var DashTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front left 3
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 4
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 5
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front left 6
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
																																
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,DashCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,DashcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,DashTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	
	gl.bindVertexArray(null);
}


function msdDrawG(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var GCoordinates=new Float32Array([
									    0.6, 1.0, 0.0,//front top 1
									   -0.1, 1.0, 0.0,//front top
									   -0.1, 0.8, 0.0,//front top
									    0.6, 0.8, 0.0,//front top
										0.6,-0.8, 0.0,//front bottom 2
									   -0.1,-0.8, 0.0,//front bottom
									   -0.1,-1.0, 0.0,//front bottom
										0.6,-1.0, 0.0,//front bottom
										0.1, 0.8, 0.0,//front left 3
									   -0.1, 0.8, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.6, 1.0, 0.1,//front top 4
									   -0.1, 1.0, 0.1,//front top 
									   -0.1, 0.8, 0.1,//front top 
									    0.6, 0.8, 0.1,//front top 
										0.6,-0.8, 0.1,//front bottom 5
									   -0.1,-0.8, 0.1,//front bottom
									   -0.1,-1.0, 0.1,//front bottom
										0.6,-1.0, 0.1,//front bottom
									    0.1, 0.8, 0.1,//front left 6
									   -0.1, 0.8, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.1, 0.8, 0.1,//left right 7
										0.1, 0.8, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 0.8, 0.1,//left left 8
									   -0.1, 0.8, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.1, 1.0, 0.1,//top top 9
									   -0.1, 1.0, 0.0,//top top 
									    0.6, 1.0, 0.0,//top top 
										0.6, 1.0, 0.1,//top top 
									   -0.1, 0.8, 0.1,//top bottom 10
									   -0.1, 0.8, 0.0,//top bottom
									    0.6, 0.8, 0.0,//top bottom
										0.6, 0.8, 0.1,//top bottom
									   -0.1,-0.8, 0.1,//bottom top 11
									   -0.1,-0.8, 0.0,//bottom top
									    0.6,-0.8, 0.0,//bottom top
										0.6,-0.8, 0.1,//bottom top
									   -0.1,-1.0, 0.1,//bottom bottom 12
									   -0.1,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.1, 1.0, 0.1,//top left 13
									   -0.1, 1.0, 0.0,//top left
									   -0.1, 0.8, 0.0,//top left
									   -0.1, 0.8, 0.1,//top left
									   -0.1,-0.8, 0.1,//bottom left 14
									   -0.1,-0.8, 0.0,//bottom left
									   -0.1,-1.0, 0.0,//bottom left
									   -0.1,-1.0, 0.1,//bottom left
									    0.6, 1.0, 0.1,//top right 15
									    0.6, 1.0, 0.0,//top right
										0.6, 0.8, 0.0,//top right
										0.6, 0.8, 0.1,//top right
										0.6,-0.8, 0.1,//bottom right 16
									    0.6,-0.8, 0.0,//bottom right
										0.6,-1.0, 0.0,//bottom right
										0.6,-1.0, 0.1,//bottom right
										0.6,-0.2, 0.0,//front right bar 17
										0.4,-0.2, 0.0,//front right bar
										0.4,-0.8, 0.0,//front right bar
										0.6,-0.8, 0.0,//front right bar
										0.6,-0.2, 0.1,//back right bar 18
										0.4,-0.2, 0.1,//back right bar
										0.4,-0.8, 0.1,//back right bar
										0.6,-0.8, 0.1,//back right bar
										0.6,-0.2, 0.1,//right bar right 19
										0.6,-0.2, 0.0,//right bar right 
										0.6,-0.8, 0.0,//right bar right 
										0.6,-0.8, 0.1,//right bar right 
										0.4,-0.2, 0.1,//right bar left 20
										0.4,-0.2, 0.0,//right bar left 
										0.4,-0.8, 0.0,//right bar left 
										0.4,-0.8, 0.1,//right bar left 
										0.4,-0.2, 0.1,//right bar top 21
										0.4,-0.2, 0.0,//right bar top 
										0.6,-0.2, 0.0,//right bar top 
										0.6,-0.2, 0.1,//right bar top 
										
										   ]);
	var GcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front left 3
										1.0, 0.0, 0.0,//front left 
										1.0, 0.0, 0.0,//front left 
										1.0, 0.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front top 4
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 0.0, 1.0,//front bottom 5
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front left 6
										1.0, 0.0, 0.0,//front left
										1.0, 0.0, 0.0,//front left
										1.0, 0.0, 0.0,//front left
										0.0, 1.0, 1.0,//left right 7
										0.0, 1.0, 1.0,//left right 
										0.0, 1.0, 1.0,//left right 
										0.0, 1.0, 1.0,//left right 
										0.0, 1.0, 1.0,//left left 8
 										0.0, 1.0, 1.0,//left left
	                                    0.0, 1.0, 1.0,//left left
										0.0, 1.0, 1.0,//left left
										1.0, 1.0, 0.0,//top top 9
 										1.0, 1.0, 0.0,//top top 
	                                    1.0, 1.0, 0.0,//top top 
										1.0, 1.0, 0.0,//top top 
										1.0, 1.0, 0.0,//top bottom 10
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 1.0,//bottom top 11
										1.0, 1.0, 1.0,//bottom top
										1.0, 1.0, 1.0,//bottom top
										1.0, 1.0, 1.0,//bottom top
										1.0, 1.0, 1.0,//bottom bottom 12
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 0.0, 1.0,//top left 13
										1.0, 0.0, 1.0,//top left
										1.0, 0.0, 1.0,//top left
										1.0, 0.0, 1.0,//top left
										1.0, 1.0, 0.0,//bottom left 14
										1.0, 1.0, 0.0,//bottom left
										1.0, 1.0, 0.0,//bottom left
										1.0, 1.0, 0.0,//bottom left
										1.0, 1.0, 0.0,//top right 15
										1.0, 1.0, 0.0,//top right
										1.0, 1.0, 0.0,//top right
										1.0, 1.0, 0.0,//top right
										0.0, 0.6, 1.0,//bottom right 16
										0.0, 0.6, 1.0,//bottom right
										0.0, 0.6, 1.0,//bottom right
										0.0, 0.6, 1.0,//bottom right
										0.6, 0.6, 1.0,//front right bar 17
										0.6, 0.6, 1.0,//front right bar
										0.6, 0.6, 1.0,//front right bar
										0.6, 0.6, 1.0,//front right bar
										1.0, 0.0, 1.0,//back right bar 18
										1.0, 0.0, 1.0,//back right bar
										1.0, 0.0, 1.0,//back right bar
										1.0, 0.0, 1.0,//back right bar
										1.0, 0.3, 0.2,//right bar right 19
										1.0, 0.3, 0.2,//right bar right 
										1.0, 0.3, 0.2,//right bar right 
										1.0, 0.3, 0.2,//right bar right 
										0.8, 0.0, 1.0,//right bar left 20
										0.8, 0.0, 1.0,//right bar left 
										0.8, 0.0, 1.0,//right bar left 
										0.8, 0.0, 1.0,//right bar left 
										1.0, 0.1, 0.7,//right bar top 21
										1.0, 0.1, 0.7,//right bar top 
										1.0, 0.1, 0.7,//right bar top 
										1.0, 0.1, 0.7,//right bar top 
										
										]);
	var GTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front left 3
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 4
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 5
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front left 6
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//left right 7
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 8
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 9
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 10
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 11
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 12
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top left 13
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom left 14
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
											0.0,0.0,//top right 15
											1.0,0.0,//top right
											1.0,1.0,//top right
											0.0,1.0,//top right
											0.0,0.0,//bottom right 16
											1.0,0.0,//bottom right
											1.0,1.0,//bottom right
											0.0,1.0,//bottom right
											0.0,0.0,//front right bar 17
											1.0,0.0,//front right bar
											1.0,1.0,//front right bar
											0.0,1.0,//front right bar
											0.0,0.0,//back right bar 18
											1.0,0.0,//back right bar
											1.0,1.0,//back right bar
											0.0,1.0,//back right bar
											0.0,0.0,//right bar right 19
											1.0,0.0,//right bar right 
											1.0,1.0,//right bar right 
											0.0,1.0,//right bar right 
											0.0,0.0,//right bar left 20
											1.0,0.0,//right bar left 
											1.0,1.0,//right bar left 
											0.0,1.0,//right bar left 
											0.0,0.0,//right bar top 21
											1.0,0.0,//right bar top 
											1.0,1.0,//right bar top 
											0.0,1.0,//right bar top 
																																
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,GCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,GcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,GTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
	gl.drawArrays(gl.TRIANGLE_FAN,80,4);//21
	
	gl.bindVertexArray(null);
}

function msdDrawK(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var KCoordinates=new Float32Array([
									   	0.0, 1.0, 0.0,//front left 1
									   -0.2, 1.0, 0.0,//front left
									   -0.2,-1.0, 0.0,//front left
										0.0,-1.0, 0.0,//front left
										0.0, 1.0, 0.1,//back left 2
									   -0.2, 1.0, 0.1,//back left
									   -0.2,-1.0, 0.1,//back left
										0.0,-1.0, 0.1,//back left
										0.0, 1.0, 0.1,//left right 3
										0.0, 1.0, 0.0,//left right
										0.0,-1.0, 0.0,//left right
										0.0,-1.0, 0.1,//left right
									   -0.2, 1.0, 0.1,//left left 4
									   -0.2, 1.0, 0.0,//left left
									   -0.2,-1.0, 0.0,//left left
									   -0.2,-1.0, 0.1,//left left
									   -0.2, 1.0, 0.1,//left top 5
									   -0.2, 1.0, 0.0,//left top
										0.0, 1.0, 0.0,//left top
										0.0, 1.0, 0.1,//left top
									   -0.2,-1.0, 0.1,//left bottom 6
									   -0.2,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.1,//left bottom
										0.6, 1.0, 0.0,//front upper / 7
										0.0, 0.2, 0.0,//front upper /
										0.0,-0.2, 0.0,//front upper /
										0.6, 0.6, 0.0,//front upper /
										0.6, 1.0, 0.1,//back upper / 8
										0.0, 0.2, 0.1,//back upper /
										0.0,-0.2, 0.1,//back upper /
										0.6, 0.6, 0.1,//back upper /
										0.6, 1.0, 0.1,//right / 9
										0.6, 1.0, 0.0,//right / 
										0.6, 0.6, 0.0,//right / 
										0.6, 0.6, 0.1,//right / 
										0.6, 0.6, 0.1,//bottom  / 10
										0.6, 0.6, 0.0,//bottom  /
										0.0,-0.2, 0.0,//bottom  /
										0.0,-0.2, 0.1,//bottom  /
										0.6, 1.0, 0.1,//top  / 11
										0.6, 1.0, 0.0,//top  /
										0.0, 0.2, 0.0,//top  /
										0.0, 0.2, 0.1,//top  /
										0.16,0.02,0.0,// front \. 12
										0.0,-0.2, 0.0,// front \.
										0.6,-1.0, 0.0,// front \.
										0.6,-0.6, 0.0,// front \.
										0.16,0.02,0.1,// back \. 13
										0.0,-0.2, 0.1,// back \.
										0.6,-1.0, 0.1,// back \.
										0.6,-0.6, 0.1,// back \.
										0.16,0.02,0.1,// top \. 14
										0.16,0.02,0.0,// top \.
										0.6,-0.6, 0.0,// top \.
										0.6,-0.6, 0.1,// top \.
										0.0,-0.2, 0.1,// bottom \. 15
										0.0,-0.2, 0.0,// bottom \.
										0.6,-1.0, 0.0,// bottom \.
										0.6,-1.0, 0.1,// bottom \.
										0.6,-0.6, 0.1,//right \. 16
										0.6,-0.6, 0.0,//right \.
										0.6,-1.0, 0.0,//right \.
										0.6,-1.0, 0.1,//right \.
										   ]);
	var KcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front left 1
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 0.0, 1.0,//back left 2
										0.0, 0.0, 1.0,//back left
										0.0, 0.0, 1.0,//back left
										0.0, 0.0, 1.0,//back left
										1.0, 0.0, 0.0,//left right 3
										1.0, 0.0, 0.0,//left right
										1.0, 0.0, 0.0,//left right
										1.0, 0.0, 0.0,//left right
										0.0, 1.0, 0.0,//left left 4
										0.0, 1.0, 0.0,//left left
										0.0, 1.0, 0.0,//left left
										0.0, 1.0, 0.0,//left left
										0.0, 0.0, 1.0,//left top 5
										0.0, 0.0, 1.0,//left top
										0.0, 0.0, 1.0,//left top
										0.0, 0.0, 1.0,//left top
										1.0, 0.0, 0.0,//left bottom 6
										1.0, 0.0, 0.0,//left bottom
										1.0, 0.0, 0.0,//left bottom
										1.0, 0.0, 0.0,//left bottom
										0.0, 1.0, 1.0,//front upper / 7
										0.0, 1.0, 1.0,//front upper /
										0.0, 1.0, 1.0,//front upper /
										0.0, 1.0, 1.0,//front upper /
										0.0, 1.0, 1.0,//back upper / 8
 										0.0, 1.0, 1.0,//back upper /
	                                    0.0, 1.0, 1.0,//back upper /
										0.0, 1.0, 1.0,//back upper /
										1.0, 1.0, 0.0,//right / 9
 										1.0, 1.0, 0.0,//right / 
	                                    1.0, 1.0, 0.0,//right / 
										1.0, 1.0, 0.0,//right / 
										1.0, 0.0, 1.0,//bottom  / 10
										1.0, 0.0, 1.0,//bottom  /
										1.0, 0.0, 1.0,//bottom  /
										1.0, 0.0, 1.0,//bottom  /
										1.0, 1.0, 0.0,//top  / 11
										1.0, 1.0, 0.0,//top  /
										1.0, 1.0, 0.0,//top  /
										1.0, 1.0, 0.0,//top  /
										1.0, 1.0, 0.0,// front \. 12
										1.0, 1.0, 0.0,// front \.
										1.0, 1.0, 0.0,// front \.
										1.0, 1.0, 0.0,// front \.
										0.0, 0.6, 1.0,// back \. 13
										0.0, 0.6, 1.0,// back \.
										0.0, 0.6, 1.0,// back \.
										0.0, 0.6, 1.0,// back \.
										1.0, 1.0, 0.0,// top \. 14
										1.0, 1.0, 0.0,// top \.
										1.0, 1.0, 0.0,// top \.
										1.0, 1.0, 0.0,// top \.
										1.0, 0.0, 0.5,// bottom \. 15
										1.0, 0.0, 0.5,// bottom \.
										1.0, 0.0, 0.5,// bottom \.
										1.0, 0.0, 0.5,// bottom \.
										0.5, 1.0, 0.0,//right \. 16
										0.5, 1.0, 0.0,//right \.
										0.5, 1.0, 0.0,//right \.
										0.5, 1.0, 0.0,//right \.

										]);
	var KTexture=new Float32Array([
											0.0,0.0,//front left 1
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//back left 2
											1.0,0.0,//back left
											1.0,1.0,//back left
											0.0,1.0,//back left
											0.0,0.0,//left right 3
											1.0,0.0,//left right
											1.0,1.0,//left right
											0.0,1.0,//left right
											0.0,0.0,//left left 4
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//left top 5
											1.0,0.0,//left top
											1.0,1.0,//left top
											0.0,1.0,//left top
											0.0,0.0,//left bottom 6
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//front upper / 7
											1.0,0.0,//front upper /
											1.0,1.0,//front upper /
											0.0,1.0,//front upper /
											0.0,0.0,//back upper / 8
											1.0,0.0,//back upper /
											1.0,1.0,//back upper /
											0.0,1.0,//back upper /
											0.0,0.0,//right / 9
											1.0,0.0,//right / 
											1.0,1.0,//right / 
											0.0,1.0,//right / 
											0.0,0.0,//bottom  / 10
											1.0,0.0,//bottom  /
											1.0,1.0,//bottom  /
											0.0,1.0,//bottom  /
											0.0,0.0,//top  / 11
											1.0,0.0,//top  /
											1.0,1.0,//top  /
											0.0,1.0,//top  /
											0.0,0.0,// front \. 12
											1.0,0.0,// front \.
											1.0,1.0,// front \.
											0.0,1.0,// front \.
											0.0,0.0,// back \. 13
											1.0,0.0,// back \.
											1.0,1.0,// back \.
											0.0,1.0,// back \.
											0.0,0.0,// top \. 14
											1.0,0.0,// top \.
											1.0,1.0,// top \.
											0.0,1.0,// top \.
											0.0,0.0,// bottom \. 15
											1.0,0.0,// bottom \.
											1.0,1.0,// bottom \.
											0.0,1.0,// bottom \.
											0.0,0.0,//right \. 16
											1.0,0.0,//right \.
											1.0,1.0,//right \.
											0.0,1.0,//right \.
											
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,KCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,KcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,KTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
			
	gl.bindVertexArray(null);
}

function msdDrawW(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var WCoordinates=new Float32Array([
									   	0.0, 1.0, 0.0,//front left 1
									   -0.2, 1.0, 0.0,//front left
									   -0.2,-1.0, 0.0,//front left
										0.0,-1.0, 0.0,//front left
										0.8, 1.0, 0.0,//front right 2
										0.6, 1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.8,-1.0, 0.0,//front right
										0.3, 0.2, 0.0,//front middle 3
										0.0,-0.4, 0.0,//front middle
										0.0,-0.8, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.0, 1.0, 0.1,//back left 4
									   -0.2, 1.0, 0.1,//back left
									   -0.2,-1.0, 0.1,//back left
										0.0,-1.0, 0.1,//back left
										0.8, 1.0, 0.1,//back right 5
										0.6, 1.0, 0.1,//back right
										0.6,-1.0, 0.1,//back right
										0.8,-1.0, 0.1,//back right
										0.3, 0.2, 0.1,//back middle 6
										0.0,-0.4, 0.1,//back middle
										0.0,-0.8, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.8, 1.0, 0.1,//right right 7
										0.8, 1.0, 0.0,//right right
										0.8,-1.0, 0.0,//right right
										0.8,-1.0, 0.1,//right right
										0.6, 1.0, 0.1,//right left 8
										0.6, 1.0, 0.0,//right left
										0.6,-1.0, 0.0,//right left
										0.6,-1.0, 0.1,//right left
										0.0, 1.0, 0.1,//left right 9
										0.0, 1.0, 0.0,//left right
										0.0,-1.0, 0.0,//left right
										0.0,-1.0, 0.1,//left right
									   -0.2, 1.0, 0.1,//left left 10
									   -0.2, 1.0, 0.0,//left left
									   -0.2,-1.0, 0.0,//left left
									   -0.2,-1.0, 0.1,//left left
									    0.0,-0.8, 0.1,//middle up 11
										0.0,-0.8, 0.0,//middle up
										0.3,-0.2, 0.0,//middle up
										0.3,-0.2, 0.1,//middle up
										0.0,-0.4, 0.1,//middle down 12
										0.0,-0.4, 0.0,//middle down
										0.3, 0.2, 0.0,//middle down
										0.3, 0.2, 0.1,//middle down
										0.6, 1.0, 0.1,//right top 13
										0.6, 1.0, 0.0,//right top
										0.8, 1.0, 0.0,//right top
										0.8, 1.0, 0.1,//right top
										0.6,-1.0, 0.1,//right bottom 14
										0.6,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.1,//right bottom
									   -0.2, 1.0, 0.1,//left top 15
									   -0.2, 1.0, 0.0,//left top
										0.0, 1.0, 0.0,//left top
										0.0, 1.0, 0.1,//left top
									   -0.2,-1.0, 0.1,//left bottom 16
									   -0.2,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.1,//left bottom
										0.3, 0.2, 0.0,//front middle 17
										0.6,-0.4, 0.0,//front middle
										0.6,-0.8, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.1,//back middle 18
										0.6,-0.4, 0.1,//back middle
										0.6,-0.8, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.6,-0.8, 0.1,//middle up 19
										0.6,-0.8, 0.0,//middle up
										0.3,-0.2, 0.0,//middle up
										0.3,-0.2, 0.1,//middle up
										0.6,-0.4, 0.1,//middle down 20
										0.6,-0.4, 0.0,//middle down
										0.3, 0.2, 0.0,//middle down
										0.3, 0.2, 0.1,//middle down
										
										   ]);
	var WcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front left 1
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 0.0, 1.0,//front right 2
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										1.0, 0.0, 0.0,//front middle 3
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 0.0,//back left 4
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 0.0, 1.0,//back right 5
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										1.0, 0.0, 0.0,//back middle 6
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										0.0, 1.0, 1.0,//right right 7
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right left 8
 										0.0, 1.0, 1.0,//right left
	                                    0.0, 1.0, 1.0,//right left
										0.0, 1.0, 1.0,//right left
										1.0, 1.0, 0.0,//left right 9
 										1.0, 1.0, 0.0,//left right
	                                    1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left left 10
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//right top 13
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 1.0, 0.0,//right bottom 14
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//left top 15
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										0.0, 0.6, 1.0,//left bottom 16
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										1.0, 1.0, 0.0,//left top 17
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 0.0, 0.5,//left top 18
										1.0, 0.0, 0.5,//left top
										1.0, 0.0, 0.5,//left top
										1.0, 0.0, 0.5,//left top
										0.5, 1.0, 0.0,//left top 19
										0.5, 1.0, 0.0,//left top
										0.5, 1.0, 0.0,//left top
										0.5, 1.0, 0.0,//left top
										1.0, 0.2, 0.2,//left top 20
										1.0, 0.2, 0.2,//left top
										1.0, 0.2, 0.2,//left top
										1.0, 0.2, 0.2,//left top
										
										]);
	var WTexture=new Float32Array([
											0.0,0.0,//front left 1
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//front right 2
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front middle 3
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back left 4
											1.0,0.0,//back left
											1.0,1.0,//back left
											0.0,1.0,//back left
											0.0,0.0,//back right 5
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 6
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//right right 7
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 8
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0,//right left
											0.0,0.0,//left right 9
											1.0,0.0,//left right
											1.0,1.0,//left right
											0.0,1.0,//left right
											0.0,0.0,//left left 10
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//right top 13
											1.0,0.0,//right top
											1.0,1.0,//right top
											0.0,1.0,//right top
											0.0,0.0,//right bottom 14
											1.0,0.0,//right bottom
											1.0,1.0,//right bottom
											0.0,1.0,//right bottom
											0.0,0.0,//left top 15
											1.0,0.0,//left top
											1.0,1.0,//left top
											0.0,1.0,//left top
											0.0,0.0,//left bottom 16
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 17
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom	
											0.0,0.0,//left bottom 18
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 19
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 20
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,WCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,WcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,WTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
		
	gl.bindVertexArray(null);
}
function msdDrawS(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var SCoordinates=new Float32Array([
									   0.6, 1.0, 0.0,//front top 1
									  -0.2, 1.0, 0.0,//front top 
									  -0.2, 0.8, 0.0,//front top 
									   0.6, 0.8, 0.0,//front top 
									  -0.2, 1.0, 0.0,//front left mid 2
									  -0.4, 1.0, 0.0,//front left mid
									  -0.4, 0.1, 0.0,//front left mid
									  -0.2, 0.1, 0.0,//front left mid
									   0.6,-0.1, 0.0,//front mid 3
									  -0.4,-0.1, 0.0,//front mid 
									  -0.4, 0.1, 0.0,//front mid 
									   0.6, 0.1, 0.0,//front mid 
									   0.6,-0.1, 0.0,//front right 4
									   0.4,-0.1, 0.0,//front right
									   0.4,-1.0, 0.0,//front right
									   0.6,-1.0, 0.0,//front right
									   0.4,-0.8, 0.0,//front bottom 5
									  -0.4,-0.8, 0.0,//front bottom
									  -0.4,-1.0, 0.0,//front bottom
									   0.4,-1.0, 0.0,//front bottom
									   0.6, 1.0, 0.1,//back top 6
									  -0.2, 1.0, 0.1,//back top 
									  -0.2, 0.8, 0.1,//back top 
									   0.6, 0.8, 0.1,//back top 
									  -0.2, 1.0, 0.1,//back left mid 7
									  -0.4, 1.0, 0.1,//back left mid
									  -0.4, 0.1, 0.1,//back left mid
									  -0.2, 0.1, 0.1,//back left mid
									   0.6,-0.1, 0.1,//back mid 8
									  -0.4,-0.1, 0.1,//back mid 
									  -0.4, 0.1, 0.1,//back mid 
									   0.6, 0.1, 0.1,//back mid 
									   0.6,-0.1, 0.1,//back right 9
									   0.4,-0.1, 0.1,//back right
									   0.4,-1.0, 0.1,//back right
									   0.6,-1.0, 0.1,//back right
									   0.4,-0.8, 0.1,//back bottom 10
									  -0.4,-0.8, 0.1,//back bottom
									  -0.4,-1.0, 0.1,//back bottom
									   0.4,-1.0, 0.1,//back bottom
									  -0.4, 1.0, 0.1,//top top 11
									  -0.4, 1.0, 0.0,//top top
									   0.6, 1.0, 0.0,//top top
									   0.6, 1.0, 0.1,//top top
									  -0.4,-1.0, 0.1,//bottom bottom 12
									  -0.4,-1.0, 0.0,//bottom bottom
									   0.6,-1.0, 0.0,//bottom bottom
									   0.6,-1.0, 0.1,//bottom bottom
									  -0.2, 0.8, 0.1,//top bottom 13
									  -0.2, 0.8, 0.0,//top bottom
									   0.6, 0.8, 0.0,//top bottom
									   0.6, 0.8, 0.1,//top bottom
									  -0.2, 0.1, 0.1,//middle top 14
									  -0.2, 0.1, 0.0,//middle top 
									   0.6, 0.1, 0.0,//middle top 
									   0.6, 0.1, 0.1,//middle top 
									  -0.4,-0.1, 0.1,//middle bottom 15
									  -0.4,-0.1, 0.0,//middle bottom
									   0.4,-0.1, 0.0,//middle bottom
									   0.4,-0.1, 0.1,//middle bottom
									  -0.4,-0.8, 0.1,//bottom top 16
									  -0.4,-0.8, 0.0,//bottom top 
									   0.4,-0.8, 0.0,//bottom top 
									   0.4,-0.8, 0.1,//bottom top 
									  -0.4, 1.0, 0.1,//left left 17
									  -0.4, 1.0, 0.0,//left left 
									  -0.4,-0.1, 0.0,//left left 
									  -0.4,-0.1, 0.1,//left left 
									  -0.2, 0.8, 0.1,//left right 18
									  -0.2, 0.8, 0.0,//left right 
									  -0.2, 0.1, 0.0,//left right 
									  -0.2, 0.1, 0.1,//left right 
									   0.6, 0.1, 0.1,//right right 19
									   0.6, 0.1, 0.0,//right right 
									   0.6,-1.0, 0.0,//right right 
									   0.6,-1.0, 0.1,//right right 
									   0.4,-0.1, 0.1,//right left 20
									   0.4,-0.1, 0.0,//right left 
									   0.4,-1.0, 0.0,//right left 
									   0.4,-1.0, 0.1,//right left 
									  -0.4,-0.8, 0.1,//bottom left 21
									  -0.4,-0.8, 0.0,//bottom left
									  -0.4,-1.0, 0.0,//bottom left
									  -0.4,-1.0, 0.1,//bottom left
									   0.6, 0.8, 0.1,//top right 22
									   0.6, 0.8, 0.0,//top right
									   0.6, 1.0, 0.0,//top right
									   0.6, 1.0, 0.1,//top right
										   ]);
	var ScolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 1.0, 0.0,//front top 
										0.0, 0.0, 1.0,//front left mid 2
										0.0, 0.0, 1.0,//front left mid
										0.0, 0.0, 1.0,//front left mid
										0.0, 0.0, 1.0,//front left mid
										1.0, 0.0, 0.0,//front mid 3
										1.0, 0.0, 0.0,//front mid 
										1.0, 0.0, 0.0,//front mid 
										1.0, 0.0, 0.0,//front mid 
										0.0, 1.0, 0.0,//front right 4
										0.0, 1.0, 0.0,//front right
										0.0, 1.0, 0.0,//front right
										0.0, 1.0, 0.0,//front right
										0.0, 0.0, 1.0,//front bottom 5
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//back top 6
										1.0, 0.0, 0.0,//back top 
										1.0, 0.0, 0.0,//back top 
										1.0, 0.0, 0.0,//back top 
										0.0, 1.0, 1.0,//back left mid 7
										0.0, 1.0, 1.0,//back left mid
										0.0, 1.0, 1.0,//back left mid
										0.0, 1.0, 1.0,//back left mid
										0.0, 1.0, 1.0,//back mid 8
 										0.0, 1.0, 1.0,//back mid 
	                                    0.0, 1.0, 1.0,//back mid 
										0.0, 1.0, 1.0,//back mid 
										1.0, 1.0, 0.0,//back right 9
 										1.0, 1.0, 0.0,//back right
	                                    1.0, 1.0, 0.0,//back right
										1.0, 1.0, 0.0,//back right
										1.0, 1.0, 0.0,//back bottom 10
										1.0, 1.0, 0.0,//back bottom
										1.0, 1.0, 0.0,//back bottom
										1.0, 1.0, 0.0,//back bottom
										1.0, 1.0, 1.0,//top top 11
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//bottom bottom 12
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 0.0, 1.0,//top bottom 13
										1.0, 0.0, 1.0,//top bottom
										1.0, 0.0, 1.0,//top bottom
										1.0, 0.0, 1.0,//top bottom
										1.0, 1.0, 0.0,//middle top 14
										1.0, 1.0, 0.0,//middle top 
										1.0, 1.0, 0.0,//middle top 
										1.0, 1.0, 0.0,//middle top 
										1.0, 1.0, 0.0,//middle bottom 15
										1.0, 1.0, 0.0,//middle bottom
										1.0, 1.0, 0.0,//middle bottom
										1.0, 1.0, 0.0,//middle bottom
										0.0, 0.6, 1.0,//bottom top 16
										0.0, 0.6, 1.0,//bottom top 
										0.0, 0.6, 1.0,//bottom top 
										0.0, 0.6, 1.0,//bottom top 
										1.0, 1.0, 0.0,//left left 17
										1.0, 1.0, 0.0,//left left 
										1.0, 1.0, 0.0,//left left 
										1.0, 1.0, 0.0,//left left 
										1.0, 0.0, 0.5,//left right 18
										1.0, 0.0, 0.5,//left right 
										1.0, 0.0, 0.5,//left right 
										1.0, 0.0, 0.5,//left right 
										0.5, 1.0, 0.0,//right right 19
										0.5, 1.0, 0.0,//right right 
										0.5, 1.0, 0.0,//right right 
										0.5, 1.0, 0.0,//right right 
										1.0, 0.2, 0.2,//right left 20
										1.0, 0.2, 0.2,//right left 
										1.0, 0.2, 0.2,//right left 
										1.0, 0.2, 0.2,//right left 
										0.8, 0.2, 0.2,//bottom left 21
										0.8, 0.2, 0.2,//bottom left
										0.8, 0.2, 0.2,//bottom left
										0.8, 0.2, 0.2,//bottom left
										0.3, 0.8, 0.1,//top right 22
										0.3, 0.8, 0.1,//top right
										0.3, 0.8, 0.1,//top right
										0.3, 0.8, 0.1,//top right
										
										]);
	var STexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front left mid 2
											1.0,0.0,//front left mid
											1.0,1.0,//front left mid
											0.0,1.0,//front left mid
											0.0,0.0,//front mid 3
											1.0,0.0,//front mid 
											1.0,1.0,//front mid 
											0.0,1.0,//front mid 
											0.0,0.0,//front right 4
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front bottom 5
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//back top 6
											1.0,0.0,//back top 
											1.0,1.0,//back top 
											0.0,1.0,//back top 
											0.0,0.0,//back left mid 7
											1.0,0.0,//back left mid
											1.0,1.0,//back left mid
											0.0,1.0,//back left mid
											0.0,0.0,//back mid 8
											1.0,0.0,//back mid 
											1.0,1.0,//back mid 
											0.0,1.0,//back mid 
											0.0,0.0,//back right 9
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back bottom 10
											1.0,0.0,//back bottom
											1.0,1.0,//back bottom
											0.0,1.0,//back bottom
											0.0,0.0,//top top 11
											1.0,0.0,//top top
											1.0,1.0,//top top
											0.0,1.0,//top top
											0.0,0.0,//bottom bottom 12
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top bottom 13
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//middle top 14
											1.0,0.0,//middle top 
											1.0,1.0,//middle top 
											0.0,1.0,//middle top 
											0.0,0.0,//middle bottom 15
											1.0,0.0,//middle bottom
											1.0,1.0,//middle bottom
											0.0,1.0,//middle bottom
											0.0,0.0,//bottom top 16
											1.0,0.0,//bottom top 
											1.0,1.0,//bottom top 
											0.0,1.0,//bottom top 
											0.0,0.0,//left left 17
											1.0,0.0,//left left 
											1.0,1.0,//left left 
											0.0,1.0,//left left 
											0.0,0.0,//left right 18
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//right right 19
											1.0,0.0,//right right 
											1.0,1.0,//right right 
											0.0,1.0,//right right 
											0.0,0.0,//right left 20
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//bottom left 21
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
											0.0,0.0,//top right 22
											1.0,0.0,//top right
											1.0,1.0,//top right
											0.0,1.0,//top right
											
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,SCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,ScolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,STexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
	gl.drawArrays(gl.TRIANGLE_FAN,80,4);//21
	gl.drawArrays(gl.TRIANGLE_FAN,84,4);//22
			
	gl.bindVertexArray(null);
}
function msdDrawM(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var MCoordinates=new Float32Array([
									   	0.0, 1.0, 0.0,//front left 1
									   -0.2, 1.0, 0.0,//front left
									   -0.2,-1.0, 0.0,//front left
										0.0,-1.0, 0.0,//front left
										0.8, 1.0, 0.0,//front right 2
										0.6, 1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.8,-1.0, 0.0,//front right
										0.0, 0.8, 0.0,//front middle 3
										0.0, 0.4, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.0,//front middle
										0.0, 1.0, 0.1,//back left 4
									   -0.2, 1.0, 0.1,//back left
									   -0.2,-1.0, 0.1,//back left
										0.0,-1.0, 0.1,//back left
										0.8, 1.0, 0.1,//back right 5
										0.6, 1.0, 0.1,//back right
										0.6,-1.0, 0.1,//back right
										0.8,-1.0, 0.1,//back right
										0.0, 0.8, 0.1,//back middle 6
										0.0, 0.4, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.3, 0.2, 0.1,//back middle
										0.8, 1.0, 0.1,//right right 7
										0.8, 1.0, 0.0,//right right
										0.8,-1.0, 0.0,//right right
										0.8,-1.0, 0.1,//right right
										0.6, 1.0, 0.1,//right left 8
										0.6, 1.0, 0.0,//right left
										0.6,-1.0, 0.0,//right left
										0.6,-1.0, 0.1,//right left
										0.0, 1.0, 0.1,//left right 9
										0.0, 1.0, 0.0,//left right
										0.0,-1.0, 0.0,//left right
										0.0,-1.0, 0.1,//left right
									   -0.2, 1.0, 0.1,//left left 10
									   -0.2, 1.0, 0.0,//left left
									   -0.2,-1.0, 0.0,//left left
									   -0.2,-1.0, 0.1,//left left
									    0.0, 0.8, 0.1,//middle up 11
										0.0, 0.8, 0.0,//middle up
										0.3, 0.2, 0.0,//middle up
										0.3, 0.2, 0.1,//middle up
										0.0, 0.4, 0.1,//middle down 12
										0.0, 0.4, 0.0,//middle down
										0.3,-0.2, 0.0,//middle down
										0.3,-0.2, 0.1,//middle down
										0.6, 1.0, 0.1,//right top 13
										0.6, 1.0, 0.0,//right top
										0.8, 1.0, 0.0,//right top
										0.8, 1.0, 0.1,//right top
										0.6,-1.0, 0.1,//right bottom 14
										0.6,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.1,//right bottom
									   -0.2, 1.0, 0.1,//left top 15
									   -0.2, 1.0, 0.0,//left top
										0.0, 1.0, 0.0,//left top
										0.0, 1.0, 0.1,//left top
									   -0.2,-1.0, 0.1,//left bottom 16
									   -0.2,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.1,//left bottom
										0.6, 0.8, 0.0,//front middle 17
										0.6, 0.4, 0.0,//front middle
										0.3,-0.2, 0.0,//front middle
										0.3, 0.2, 0.0,//front middle
										0.6, 0.8, 0.1,//back middle 18
										0.6, 0.4, 0.1,//back middle
										0.3,-0.2, 0.1,//back middle
										0.3, 0.2, 0.1,//back middle
										0.6, 0.8, 0.1,//middle up 19
										0.6, 0.8, 0.0,//middle up
										0.3, 0.2, 0.0,//middle up
										0.3, 0.2, 0.1,//middle up
										0.6, 0.4, 0.1,//middle down 20
										0.6, 0.4, 0.0,//middle down
										0.3,-0.2, 0.0,//middle down
										0.3,-0.2, 0.1,//middle down
										   ]);
	var McolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front left 1
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 0.0, 1.0,//front right 2
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										1.0, 0.0, 0.0,//front middle 3
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 0.0,//back left 4
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 0.0, 1.0,//back right 5
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										1.0, 0.0, 0.0,//back middle 6
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										0.0, 1.0, 1.0,//right right 7
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right left 8
 										0.0, 1.0, 1.0,//right left
	                                    0.0, 1.0, 1.0,//right left
										0.0, 1.0, 1.0,//right left
										1.0, 1.0, 0.0,//left right 9
 										1.0, 1.0, 0.0,//left right
	                                    1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left left 10
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//right top 13
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 1.0, 0.0,//right bottom 14
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//left top 15
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										0.0, 0.6, 1.0,//left bottom 16
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										1.0, 1.0, 0.0,//left top 17
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 0.0, 0.5,//left top 18
										1.0, 0.0, 0.5,//left top
										1.0, 0.0, 0.5,//left top
										1.0, 0.0, 0.5,//left top
										0.5, 1.0, 0.0,//left top 19
										0.5, 1.0, 0.0,//left top
										0.5, 1.0, 0.0,//left top
										0.5, 1.0, 0.0,//left top
										1.0, 0.2, 0.2,//left top 20
										1.0, 0.2, 0.2,//left top
										1.0, 0.2, 0.2,//left top
										1.0, 0.2, 0.2,//left top
										
										]);
	var MTexture=new Float32Array([
											0.0,0.0,//front left 1
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//front right 2
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front middle 3
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back left 4
											1.0,0.0,//back left
											1.0,1.0,//back left
											0.0,1.0,//back left
											0.0,0.0,//back right 5
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 6
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//right right 7
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 8
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0,//right left
											0.0,0.0,//left right 9
											1.0,0.0,//left right
											1.0,1.0,//left right
											0.0,1.0,//left right
											0.0,0.0,//left left 10
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//right top 13
											1.0,0.0,//right top
											1.0,1.0,//right top
											0.0,1.0,//right top
											0.0,0.0,//right bottom 14
											1.0,0.0,//right bottom
											1.0,1.0,//right bottom
											0.0,1.0,//right bottom
											0.0,0.0,//left top 15
											1.0,0.0,//left top
											1.0,1.0,//left top
											0.0,1.0,//left top
											0.0,0.0,//left bottom 16
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 17
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom	
											0.0,0.0,//left bottom 18
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 19
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
											0.0,0.0,//left bottom 20
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,MCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,McolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,MTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
		
	gl.bindVertexArray(null);
}
function msdDrawN(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var NCoordinates=new Float32Array([
									   	0.0, 1.0, 0.0,//front left 1
									   -0.2, 1.0, 0.0,//front left
									   -0.2,-1.0, 0.0,//front left
										0.0,-1.0, 0.0,//front left
										0.8, 1.0, 0.0,//front right 2
										0.6, 1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.8,-1.0, 0.0,//front right
										0.0, 0.8, 0.0,//front middle 3
										0.0, 0.4, 0.0,//front middle
										0.6,-0.8, 0.0,//front middle
										0.6,-0.4, 0.0,//front middle
										0.0, 1.0, 0.1,//back left 4
									   -0.2, 1.0, 0.1,//back left
									   -0.2,-1.0, 0.1,//back left
										0.0,-1.0, 0.1,//back left
										0.8, 1.0, 0.1,//back right 5
										0.6, 1.0, 0.1,//back right
										0.6,-1.0, 0.1,//back right
										0.8,-1.0, 0.1,//back right
										0.0, 0.8, 0.1,//back middle 6
										0.0, 0.4, 0.1,//back middle
										0.6,-0.8, 0.1,//back middle
										0.6,-0.4, 0.1,//back middle
										0.8, 1.0, 0.1,//right right 7
										0.8, 1.0, 0.0,//right right
										0.8,-1.0, 0.0,//right right
										0.8,-1.0, 0.1,//right right
										0.6, 1.0, 0.1,//right left 8
										0.6, 1.0, 0.0,//right left
										0.6,-1.0, 0.0,//right left
										0.6,-1.0, 0.1,//right left
										0.0, 1.0, 0.1,//left right 9
										0.0, 1.0, 0.0,//left right
										0.0,-1.0, 0.0,//left right
										0.0,-1.0, 0.1,//left right
									   -0.2, 1.0, 0.1,//left left 10
									   -0.2, 1.0, 0.0,//left left
									   -0.2,-1.0, 0.0,//left left
									   -0.2,-1.0, 0.1,//left left
									    0.0, 0.8, 0.1,//middle up 11
										0.0, 0.8, 0.0,//middle up
										0.6,-0.4, 0.0,//middle up
										0.6,-0.4, 0.1,//middle up
										0.0, 0.4, 0.1,//middle down 12
										0.0, 0.4, 0.0,//middle down
										0.6,-0.8, 0.0,//middle down
										0.6,-0.8, 0.1,//middle down
										0.6, 1.0, 0.1,//right top 13
										0.6, 1.0, 0.0,//right top
										0.8, 1.0, 0.0,//right top
										0.8, 1.0, 0.1,//right top
										0.6,-1.0, 0.1,//right bottom 14
										0.6,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.0,//right bottom
										0.8,-1.0, 0.1,//right bottom
									   -0.2, 1.0, 0.1,//left top 15
									   -0.2, 1.0, 0.0,//left top
										0.0, 1.0, 0.0,//left top
										0.0, 1.0, 0.1,//left top
									   -0.2,-1.0, 0.1,//left bottom 16
									   -0.2,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.0,//left bottom
										0.0,-1.0, 0.1,//left bottom
										   ]);
	var NcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front left 1
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 1.0, 0.0,//front left
										0.0, 0.0, 1.0,//front right 2
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										0.0, 0.0, 1.0,//front right
										1.0, 0.0, 0.0,//front middle 3
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 0.0,//back left 4
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 1.0, 0.0,//back left
										0.0, 0.0, 1.0,//back right 5
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										0.0, 0.0, 1.0,//back right
										1.0, 0.0, 0.0,//back middle 6
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										1.0, 0.0, 0.0,//back middle
										0.0, 1.0, 1.0,//right right 7
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right right
										0.0, 1.0, 1.0,//right left 8
 										0.0, 1.0, 1.0,//right left
	                                    0.0, 1.0, 1.0,//right left
										0.0, 1.0, 1.0,//right left
										1.0, 1.0, 0.0,//left right 9
 										1.0, 1.0, 0.0,//left right
	                                    1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left right
										1.0, 1.0, 0.0,//left left 10
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 0.0,//left left
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//right top 13
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 0.0, 1.0,//right top
										1.0, 1.0, 0.0,//right bottom 14
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//right bottom
										1.0, 1.0, 0.0,//left top 15
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										1.0, 1.0, 0.0,//left top
										0.0, 0.6, 1.0,//left bottom 16
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
										0.0, 0.6, 1.0,//left bottom
								
										]);
	var NTexture=new Float32Array([
											0.0,0.0,//front left 1
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//front right 2
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front middle 3
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back left 4
											1.0,0.0,//back left
											1.0,1.0,//back left
											0.0,1.0,//back left
											0.0,0.0,//back right 5
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 6
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//right right 7
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 8
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0,//right left
											0.0,0.0,//left right 9
											1.0,0.0,//left right
											1.0,1.0,//left right
											0.0,1.0,//left right
											0.0,0.0,//left left 10
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//right top 13
											1.0,0.0,//right top
											1.0,1.0,//right top
											0.0,1.0,//right top
											0.0,0.0,//right bottom 14
											1.0,0.0,//right bottom
											1.0,1.0,//right bottom
											0.0,1.0,//right bottom
											0.0,0.0,//left top 15
											1.0,0.0,//left top
											1.0,1.0,//left top
											0.0,1.0,//left top
											0.0,0.0,//left bottom 16
											1.0,0.0,//left bottom
											1.0,1.0,//left bottom
											0.0,1.0,//left bottom
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,NCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,NcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,NTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
		
	gl.bindVertexArray(null);
}
function msdDrawC(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var CCoordinates=new Float32Array([
									    0.6, 1.0, 0.0,//front top 1
									   -0.1, 1.0, 0.0,//front top
									   -0.1, 0.8, 0.0,//front top
									    0.6, 0.8, 0.0,//front top
										0.6,-0.8, 0.0,//front bottom 2
									   -0.1,-0.8, 0.0,//front bottom
									   -0.1,-1.0, 0.0,//front bottom
										0.6,-1.0, 0.0,//front bottom
										0.1, 0.8, 0.0,//front left 3
									   -0.1, 0.8, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.6, 1.0, 0.1,//front top 4
									   -0.1, 1.0, 0.1,//front top 
									   -0.1, 0.8, 0.1,//front top 
									    0.6, 0.8, 0.1,//front top 
										0.6,-0.8, 0.1,//front bottom 5
									   -0.1,-0.8, 0.1,//front bottom
									   -0.1,-1.0, 0.1,//front bottom
										0.6,-1.0, 0.1,//front bottom
									    0.1, 0.8, 0.1,//front left 6
									   -0.1, 0.8, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.1, 0.8, 0.1,//left right 7
										0.1, 0.8, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 0.8, 0.1,//left left 8
									   -0.1, 0.8, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.1, 1.0, 0.1,//top top 9
									   -0.1, 1.0, 0.0,//top top 
									    0.6, 1.0, 0.0,//top top 
										0.6, 1.0, 0.1,//top top 
									   -0.1, 0.8, 0.1,//top bottom 10
									   -0.1, 0.8, 0.0,//top bottom
									    0.6, 0.8, 0.0,//top bottom
										0.6, 0.8, 0.1,//top bottom
									   -0.1,-0.8, 0.1,//bottom top 11
									   -0.1,-0.8, 0.0,//bottom top
									    0.6,-0.8, 0.0,//bottom top
										0.6,-0.8, 0.1,//bottom top
									   -0.1,-1.0, 0.1,//bottom bottom 12
									   -0.1,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.1, 1.0, 0.1,//top left 13
									   -0.1, 1.0, 0.0,//top left
									   -0.1, 0.8, 0.0,//top left
									   -0.1, 0.8, 0.1,//top left
									   -0.1,-0.8, 0.1,//bottom left 14
									   -0.1,-0.8, 0.0,//bottom left
									   -0.1,-1.0, 0.0,//bottom left
									   -0.1,-1.0, 0.1,//bottom left
									    0.6, 1.0, 0.1,//top right 15
									    0.6, 1.0, 0.0,//top right
										0.6, 0.8, 0.0,//top right
										0.6, 0.8, 0.1,//top right
										0.6,-0.8, 0.1,//bottom right 16
									    0.6,-0.8, 0.0,//bottom right
										0.6,-1.0, 0.0,//bottom right
										0.6,-1.0, 0.1,//bottom right
										   ]);
	var CcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//front left 4
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 0.0, 1.0,//front top 5
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										1.0, 0.0, 0.0,//front bottom 6
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										0.0, 1.0, 1.0,//front right 7
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front left 8
 										0.0, 1.0, 1.0,//front left
	                                    0.0, 1.0, 1.0,//front left
										0.0, 1.0, 1.0,//front left
										1.0, 1.0, 0.0,//right right 9
 										1.0, 1.0, 0.0,//right right
	                                    1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right left 10
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 1.0,//left right 11
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left left 12
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 0.0, 1.0,//top top 13
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 1.0, 0.0,//top bottom 14
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 15
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										0.0, 0.6, 1.0,//bottom bottom 16
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
								
										]);
	var CTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front left 4
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 5
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 6
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 7
											1.0,0.0,//front right 
											1.0,1.0,//front right 
											0.0,1.0,//front right 
											0.0,0.0,//front left 8
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//right right 9
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 10
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//left right 11
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 12
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 13
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 14
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 15
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 16
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,CCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,CcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,CTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
		
	gl.bindVertexArray(null);
}
function msdDrawO(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var OCoordinates=new Float32Array([
									    0.4, 1.0, 0.0,//front top 1
									   -0.1, 1.0, 0.0,//front top
									   -0.1, 0.8, 0.0,//front top
									    0.4, 0.8, 0.0,//front top
										0.4,-0.8, 0.0,//front bottom 2
									   -0.1,-0.8, 0.0,//front bottom
									   -0.1,-1.0, 0.0,//front bottom
										0.4,-1.0, 0.0,//front bottom
									    0.6, 1.0, 0.0,//front right 3
										0.4, 1.0, 0.0,//front right
										0.4,-1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.1, 0.8, 0.0,//front left 4
									   -0.1, 0.8, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.4, 1.0, 0.1,//front top 5
									   -0.1, 1.0, 0.1,//front top 
									   -0.1, 0.8, 0.1,//front top 
									    0.4, 0.8, 0.1,//front top 
										0.4,-0.8, 0.1,//front bottom 6
									   -0.1,-0.8, 0.1,//front bottom
									   -0.1,-1.0, 0.1,//front bottom
										0.4,-1.0, 0.1,//front bottom
									    0.6, 1.0, 0.1,//front right 7
										0.4, 1.0, 0.1,//front right 
										0.4,-1.0, 0.1,//front right 
										0.6,-1.0, 0.1,//front right 
										0.1, 0.8, 0.1,//front left 8
									   -0.1, 0.8, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.6, 1.0, 0.1,//right right 9
										0.6, 1.0, 0.0,//right right
										0.6,-1.0, 0.0,//right right
										0.6,-1.0, 0.1,//right right
										0.4, 0.8, 0.1,//right left 10
										0.4, 0.8, 0.0,//right left 
										0.4,-0.8, 0.0,//right left 
										0.4,-0.8, 0.1,//right left 
										0.1, 0.8, 0.1,//left right 11
										0.1, 0.8, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 0.8, 0.1,//left left 12
									   -0.1, 0.8, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.1, 1.0, 0.1,//top top 13
									   -0.1, 1.0, 0.0,//top top 
									    0.6, 1.0, 0.0,//top top 
										0.6, 1.0, 0.1,//top top 
									   -0.1, 0.8, 0.1,//top bottom 14
									   -0.1, 0.8, 0.0,//top bottom
									    0.4, 0.8, 0.0,//top bottom
										0.4, 0.8, 0.1,//top bottom
									   -0.1,-0.8, 0.1,//bottom top 15
									   -0.1,-0.8, 0.0,//bottom top
									    0.4,-0.8, 0.0,//bottom top
										0.4,-0.8, 0.1,//bottom top
									   -0.1,-1.0, 0.1,//bottom bottom 16
									   -0.1,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.1, 1.0, 0.1,//top left 17
									   -0.1, 1.0, 0.0,//top left
									   -0.1, 0.8, 0.0,//top left
									   -0.1, 0.8, 0.1,//top left
									   -0.1,-0.8, 0.1,//bottom left 18
									   -0.1,-0.8, 0.0,//bottom left
									   -0.1,-1.0, 0.0,//bottom left
									   -0.1,-1.0, 0.1 //bottom left
									    
										   ]);
	var OcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//front left 4
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 0.0, 1.0,//front top 5
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										1.0, 0.0, 0.0,//front bottom 6
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										0.0, 1.0, 1.0,//front right 7
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front left 8
 										0.0, 1.0, 1.0,//front left
	                                    0.0, 1.0, 1.0,//front left
										0.0, 1.0, 1.0,//front left
										1.0, 1.0, 0.0,//right right 9
 										1.0, 1.0, 0.0,//right right
	                                    1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right left 10
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 1.0,//left right 11
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left left 12
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 0.0, 1.0,//top top 13
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 1.0, 0.0,//top bottom 14
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 15
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										0.0, 0.6, 1.0,//bottom bottom 16
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//top left 17
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.6, 0.6, 1.0,//bottom left 18
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										
								
										]);
	var OTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front left 4
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 5
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 6
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 7
											1.0,0.0,//front right 
											1.0,1.0,//front right 
											0.0,1.0,//front right 
											0.0,0.0,//front left 8
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//right right 9
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 10
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//left right 11
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 12
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 13
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 14
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 15
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 16
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top left 17
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom left 18
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
										
									
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,OCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,OcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,OTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
		
	gl.bindVertexArray(null);
}
function msdDrawD(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var DCoordinates=new Float32Array([
									    0.4, 1.0, 0.0,//front top 1
									   -0.3, 1.0, 0.0,//front top
									   -0.3, 0.8, 0.0,//front top
									    0.4, 0.8, 0.0,//front top
										0.4,-0.8, 0.0,//front bottom 2
									   -0.3,-0.8, 0.0,//front bottom
									   -0.3,-1.0, 0.0,//front bottom
										0.4,-1.0, 0.0,//front bottom
									    0.6, 1.0, 0.0,//front right 3
										0.4, 1.0, 0.0,//front right
										0.4,-1.0, 0.0,//front right
										0.6,-1.0, 0.0,//front right
										0.1, 0.8, 0.0,//front left 4
									   -0.1, 0.8, 0.0,//front left 
									   -0.1,-0.8, 0.0,//front left 
									    0.1,-0.8, 0.0,//front left 
										0.4, 1.0, 0.1,//front top 5
									   -0.3, 1.0, 0.1,//front top 
									   -0.3, 0.8, 0.1,//front top 
									    0.4, 0.8, 0.1,//front top 
										0.4,-0.8, 0.1,//front bottom 6
									   -0.3,-0.8, 0.1,//front bottom
									   -0.3,-1.0, 0.1,//front bottom
										0.4,-1.0, 0.1,//front bottom
									    0.6, 1.0, 0.1,//front right 7
										0.4, 1.0, 0.1,//front right 
										0.4,-1.0, 0.1,//front right 
										0.6,-1.0, 0.1,//front right 
										0.1, 0.8, 0.1,//front left 8
									   -0.1, 0.8, 0.1,//front left
									   -0.1,-0.8, 0.1,//front left
									    0.1,-0.8, 0.1,//front left
										0.6, 1.0, 0.1,//right right 9
										0.6, 1.0, 0.0,//right right
										0.6,-1.0, 0.0,//right right
										0.6,-1.0, 0.1,//right right
										0.4, 0.8, 0.1,//right left 10
										0.4, 0.8, 0.0,//right left 
										0.4,-0.8, 0.0,//right left 
										0.4,-0.8, 0.1,//right left 
										0.1, 0.8, 0.1,//left right 11
										0.1, 0.8, 0.0,//left right 
										0.1,-0.8, 0.0,//left right 
										0.1,-0.8, 0.1,//left right 
									   -0.1, 0.8, 0.1,//left left 12
									   -0.1, 0.8, 0.0,//left left
									   -0.1,-0.8, 0.0,//left left
									   -0.1,-0.8, 0.1,//left left
									   -0.3, 1.0, 0.1,//top top 13
									   -0.3, 1.0, 0.0,//top top 
									    0.6, 1.0, 0.0,//top top 
										0.6, 1.0, 0.1,//top top 
									   -0.3, 0.8, 0.1,//top bottom 14
									   -0.3, 0.8, 0.0,//top bottom
									    0.4, 0.8, 0.0,//top bottom
										0.4, 0.8, 0.1,//top bottom
									   -0.3,-0.8, 0.1,//bottom top 15
									   -0.3,-0.8, 0.0,//bottom top
									    0.4,-0.8, 0.0,//bottom top
										0.4,-0.8, 0.1,//bottom top
									   -0.3,-1.0, 0.1,//bottom bottom 16
									   -0.3,-1.0, 0.0,//bottom bottom
									    0.6,-1.0, 0.0,//bottom bottom
										0.6,-1.0, 0.1,//bottom bottom
									   -0.3, 1.0, 0.1,//top left 17
									   -0.3, 1.0, 0.0,//top left
									   -0.3, 0.8, 0.0,//top left
									   -0.3, 0.8, 0.1,//top left
									   -0.3,-0.8, 0.1,//bottom left 18
									   -0.3,-0.8, 0.0,//bottom left
									   -0.3,-1.0, 0.0,//bottom left
									   -0.3,-1.0, 0.1 //bottom left
									    
										   ]);
	var DcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//front left 4
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 1.0, 0.0,//front left 
										0.0, 0.0, 1.0,//front top 5
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top 
										1.0, 0.0, 0.0,//front bottom 6
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										1.0, 0.0, 0.0,//front bottom
										0.0, 1.0, 1.0,//front right 7
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front right 
										0.0, 1.0, 1.0,//front left 8
 										0.0, 1.0, 1.0,//front left
	                                    0.0, 1.0, 1.0,//front left
										0.0, 1.0, 1.0,//front left
										1.0, 1.0, 0.0,//right right 9
 										1.0, 1.0, 0.0,//right right
	                                    1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right right
										1.0, 1.0, 0.0,//right left 10
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 0.0,//right left 
										1.0, 1.0, 1.0,//left right 11
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left right 
										1.0, 1.0, 1.0,//left left 12
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 1.0, 1.0,//left left
										1.0, 0.0, 1.0,//top top 13
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 0.0, 1.0,//top top 
										1.0, 1.0, 0.0,//top bottom 14
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 15
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										0.0, 0.6, 1.0,//bottom bottom 16
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//bottom bottom
										0.0, 0.6, 1.0,//top left 17
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.0, 0.6, 1.0,//top left
										0.6, 0.6, 1.0,//bottom left 18
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										0.6, 0.6, 1.0,//bottom left
										
								
										]);
	var DTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//front left 4
											1.0,0.0,//front left 
											1.0,1.0,//front left 
											0.0,1.0,//front left 
											0.0,0.0,//front top 5
											1.0,0.0,//front top 
											1.0,1.0,//front top 
											0.0,1.0,//front top 
											0.0,0.0,//front bottom 6
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom
											0.0,1.0,//front bottom
											0.0,0.0,//front right 7
											1.0,0.0,//front right 
											1.0,1.0,//front right 
											0.0,1.0,//front right 
											0.0,0.0,//front left 8
											1.0,0.0,//front left
											1.0,1.0,//front left
											0.0,1.0,//front left
											0.0,0.0,//right right 9
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 10
											1.0,0.0,//right left 
											1.0,1.0,//right left 
											0.0,1.0,//right left 
											0.0,0.0,//left right 11
											1.0,0.0,//left right 
											1.0,1.0,//left right 
											0.0,1.0,//left right 
											0.0,0.0,//left left 12
											1.0,0.0,//left left
											1.0,1.0,//left left
											0.0,1.0,//left left
											0.0,0.0,//top top 13
											1.0,0.0,//top top 
											1.0,1.0,//top top 
											0.0,1.0,//top top 
											0.0,0.0,//top bottom 14
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 15
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 16
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//top left 17
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom left 18
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0,//bottom left
										
									
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,DCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,DcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,DTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
		
	gl.bindVertexArray(null);
}
function msdDrawR(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var RCoordinates=new Float32Array([
									    0.1, 1.0, 0.0,//front straight 1
									   -0.1, 1.0, 0.0,//front straight
									   -0.1,-1.0, 0.0,//front straight
									    0.1,-1.0, 0.0,//front straight
										0.7, 1.0, 0.0,//front top 2
									    0.1, 1.0, 0.0,//front top
									    0.1, 0.8, 0.0,//front top 
									    0.7, 0.8, 0.0,//front top
									    0.7, 0.8, 0.0,//front right 3
									    0.5, 0.8, 0.0,//front right
									    0.5,-0.1, 0.0,//front right
									    0.7,-0.1, 0.0,//front right
									    0.5, 0.1, 0.0,//middle 4
									    0.1, 0.1, 0.0,//middle
									    0.1,-0.1, 0.0,//middle 
									    0.5,-0.1, 0.0,//middle
									    0.1, 1.0, 0.1,//back straight 5
									   -0.1, 1.0, 0.1,//back straight
									   -0.1,-1.0, 0.1,//back straight
									    0.1,-1.0, 0.1,//back straight
										0.7, 1.0, 0.1,//back top 6
									    0.1, 1.0, 0.1,//back top
									    0.1, 0.8, 0.1,//back top 
									    0.7, 0.8, 0.1,//back top
									    0.7, 0.8, 0.1,//back right 7
									    0.5, 0.8, 0.1,//back right
									    0.5,-0.1, 0.1,//back right
									    0.7,-0.1, 0.1,//back right
									    0.5, 0.1, 0.1,//back middle 8
									    0.1, 0.1, 0.1,//back middle
									    0.1,-0.1, 0.1,//back middle 
									    0.5,-0.1, 0.1,//back middle
									   -0.1, 1.0, 0.1,//top top 9	
									   -0.1, 1.0, 0.0,//top top
									    0.7, 1.0, 0.0,//top top
										0.7, 1.0, 0.1,//top top
									    0.1, 0.8, 0.1,//top bottom 10	
									    0.1, 0.8, 0.0,//top bottom
									    0.5, 0.8, 0.0,//top bottom
										0.5, 0.8, 0.1,//top bottom
									    0.1, 0.1, 0.1,//middle up 11
									    0.1, 0.1, 0.0,//middle up
									    0.5, 0.1, 0.0,//middle up
									    0.5, 0.1, 0.1,//middle up
										0.1,-0.1, 0.1,//middle down 12
									    0.1,-0.1, 0.0,//middle down
									    0.7,-0.1, 0.0,//middle down
									    0.7,-0.1, 0.1,//middle down
									   -0.1,-1.0, 0.1,//bottom 13
									   -0.1,-1.0, 0.0,//bottom
									    0.1,-1.0, 0.0,//bottom
										0.1,-1.0, 0.1,//bottom
									   -0.1, 1.0, 0.1,//straight left 14
									   -0.1, 1.0, 0.0,//straight left
									   -0.1,-1.0, 0.0,//straight left
									   -0.1,-1.0, 0.1,//straight left
									    0.1, 1.0, 0.1,//straight right 15
									    0.1, 1.0, 0.0,//straight right
									    0.1,-1.0, 0.0,//straight right
									    0.1,-1.0, 0.1,//straight right
										0.7, 1.0, 0.1,//right right 16
										0.7, 1.0, 0.0,//right right
										0.7,-0.1, 0.0,//right right
										0.7,-0.1, 0.1,//right right
										0.5, 0.8, 0.1,//right left 17
										0.5, 0.8, 0.0,//right left
										0.5, 0.1, 0.0,//right left
										0.5, 0.1, 0.1,//right left
										0.3,-0.1, 0.0,//right front \.18
										0.1,-0.1, 0.0,//right front \.
										0.5,-1.0, 0.0,//right front \.
										0.7,-1.0, 0.0,//right front \.
										0.3,-0.1, 0.1,//right back \.19
										0.1,-0.1, 0.1,//right back \.
										0.5,-1.0, 0.1,//right back \.
										0.7,-1.0, 0.1,//right back \.
										0.3,-0.1, 0.1,//right right \.20
										0.3,-0.1, 0.0,//right right \.
										0.7,-1.0, 0.0,//right right \.
										0.7,-1.0, 0.1,//right right \.
										0.1,-0.1, 0.1,//right left \.21
										0.1,-0.1, 0.0,//right left \.
										0.5,-1.0, 0.0,//right left \.
										0.5,-1.0, 0.1,//right left \.
										0.5,-1.0, 0.1,//right bottom \.22
										0.5,-1.0, 0.0,//right bottom \.
										0.7,-1.0, 0.0,//right bottom \.
										0.7,-1.0, 0.1//right bottom \.
										   ]);
	var RcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front straight 1
										0.0, 1.0, 0.0,//front straight
										0.0, 1.0, 0.0,//front straight
										0.0, 1.0, 0.0,//front straight
										0.0, 0.0, 1.0,//front top 2
										0.0, 0.0, 1.0,//front top
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//middle 4
										0.0, 1.0, 0.0,//middle
										0.0, 1.0, 0.0,//middle 
										0.0, 1.0, 0.0,//middle
										0.0, 0.0, 1.0,//back straight 5
										0.0, 0.0, 1.0,//back straight
										0.0, 0.0, 1.0,//back straight
										0.0, 0.0, 1.0,//back straight
										1.0, 0.0, 0.0,//back top 6
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top 
										1.0, 0.0, 0.0,//back top
										0.0, 1.0, 1.0,//back right 7
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back middle 8
 										0.0, 1.0, 1.0,//back middle
	                                    0.0, 1.0, 1.0,//back middle 
										0.0, 1.0, 1.0,//back middle
										1.0, 1.0, 0.0,//top top 9	
 										1.0, 1.0, 0.0,//top top
	                                    1.0, 1.0, 0.0,//top top
										1.0, 1.0, 0.0,//top top
										1.0, 1.0, 0.0,//top bottom 10	
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//bottom 13
										1.0, 0.0, 1.0,//bottom
										1.0, 0.0, 1.0,//bottom
										1.0, 0.0, 1.0,//bottom
										1.0, 1.0, 0.0,//straight left 14
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight right 15
										1.0, 1.0, 0.0,//straight right
										1.0, 1.0, 0.0,//straight right
										1.0, 1.0, 0.0,//straight right
										0.0, 0.6, 1.0,//right right 16
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right left 17
										0.0, 0.6, 1.0,//right left
										0.0, 0.6, 1.0,//right left
										0.0, 0.6, 1.0,//right left
										0.6, 0.6, 1.0,//right front \.18
										0.6, 0.6, 1.0,//right front \.
										0.6, 0.6, 1.0,//right front \.
										0.6, 0.6, 1.0,//right front \.
										0.6, 0.1, 0.3,//right back \.19
										0.6, 0.1, 0.3,//right back \.
										0.6, 0.1, 0.3,//right back \.
										0.6, 0.1, 0.3,//right back \.
										0.3, 0.3, 0.3,//right right \.20
										0.3, 0.3, 0.3,//right right \.
										0.3, 0.3, 0.3,//right right \.
										0.3, 0.3, 0.3,//right right \.
										0.3, 0.1, 0.3,//right left \.21
										0.3, 0.1, 0.3,//right left \.
										0.3, 0.1, 0.3,//right left \.
										0.3, 0.1, 0.3,//right left \.
										0.1, 0.1, 1.0,//right bottom \.22
										0.1, 0.1, 1.0,//right bottom \.
										0.1, 0.1, 1.0,//right bottom \.
										0.1, 0.1, 1.0//right bottom \.
										]);
	var RTexture=new Float32Array([
											0.0,0.0,//front straight 1
											1.0,0.0,//front straight
											1.0,1.0,//front straight
											0.0,1.0,//front straight
											0.0,0.0,//front top 2
											1.0,0.0,//front top
											1.0,1.0,//front top 
											0.0,1.0,//front top
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//middle 4
											1.0,0.0,//middle
											1.0,1.0,//middle 
											0.0,1.0,//middle
											0.0,0.0,//back straight 5
											1.0,0.0,//back straight
											1.0,1.0,//back straight
											0.0,1.0,//back straight
											0.0,0.0,//back top 6
											1.0,0.0,//back top
											1.0,1.0,//back top 
											0.0,1.0,//back top
											0.0,0.0,//back right 7
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 8
											1.0,0.0,//back middle
											1.0,1.0,//back middle 
											0.0,1.0,//back middle
											0.0,0.0,//top top 9	
											1.0,0.0,//top top
											1.0,1.0,//top top
											0.0,1.0,//top top
											0.0,0.0,//top bottom 10	
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//bottom 13
											1.0,0.0,//bottom
											1.0,1.0,//bottom
											0.0,1.0,//bottom
											0.0,0.0,//straight left 14
											1.0,0.0,//straight left
											1.0,1.0,//straight left
											0.0,1.0,//straight left
											0.0,0.0,//straight right 15
											1.0,0.0,//straight right
											1.0,1.0,//straight right
											0.0,1.0,//straight right
											0.0,0.0,//right right 16
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 17
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0,//right left
											0.0,0.0,//right front \.18
											1.0,0.0,//right front \.
											1.0,1.0,//right front \.
											0.0,1.0,//right front \.
											0.0,0.0,//right back \.19
											1.0,0.0,//right back \.
											1.0,1.0,//right back \.
											0.0,1.0,//right back \.
											0.0,0.0,//right right \.20
											1.0,0.0,//right right \.
											1.0,1.0,//right right \.
											0.0,1.0,//right right \.
											0.0,0.0,//right left \.21
											1.0,0.0,//right left \.
											1.0,1.0,//right left \.
											0.0,1.0,//right left \.
											0.0,0.0,//right bottom \.22
											1.0,0.0,//right bottom \.
											1.0,1.0,//right bottom \.
											0.0,1.0,//right bottom \.
																						
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,RCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,RcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,RTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	gl.drawArrays(gl.TRIANGLE_FAN,76,4);//20
	gl.drawArrays(gl.TRIANGLE_FAN,80,4);//21
	gl.drawArrays(gl.TRIANGLE_FAN,84,4);//22
	
	gl.bindVertexArray(null);
}

function msdDrawA(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var ACoordinates=new Float32Array([
										    0.0, 1.0, 0.0,//front A
										    0.0, 0.6, 0.0,//front A
										    0.8,-1.0, 0.0,//front A
										    1.0,-1.0, 0.0,//front A
										    0.0, 1.0, 0.0,//front A
										    0.0, 0.6, 0.0,//front A
										   -0.8,-1.0, 0.0,//front A
										   -1.0,-1.0, 0.0,//front A
										    0.3, 0.0, 0.0,//front A mid
										   -0.3, 0.0, 0.0,//front A mid
										   -0.4,-0.2, 0.0,//front A mid
										    0.4,-0.2, 0.0,//front A mid
										    0.0, 1.0, 0.1,//back A
	                                        0.0, 0.6, 0.1,//back A
	                                        0.8,-1.0, 0.1,//back A
	                                        1.0,-1.0, 0.1,//back A
	                                        0.0, 1.0, 0.1,//back A
	                                        0.0, 0.6, 0.1,//back A
	                                       -0.8,-1.0, 0.1,//back A
	                                       -1.0,-1.0, 0.1, //back A
										    0.3, 0.0, 0.1,//mid A mid
										   -0.3, 0.0, 0.1,//mid A mid
										   -0.4,-0.2, 0.1,//mid A mid
										    0.4,-0.2, 0.1,//mid A mid
											0.0, 1.0, 0.0,//right A
											0.0, 1.0, 0.1,//right A
											1.0,-1.0, 0.1,//right A
											1.0,-1.0, 0.0, //right A
											0.0, 1.0, 0.0,//left A
											0.0, 1.0, 0.1,//left A
										   -1.0,-1.0, 0.1,//left A
										   -1.0,-1.0, 0.0, //left A
										    0.0, 0.6, 0.0,//right A down
										    0.0, 0.6, 0.1,//right A down
											0.8,-1.0, 0.1,//right A down
											0.8,-1.0, 0.0,//right A down
											0.0, 0.6, 0.0,//left A down
										    0.0, 0.6, 0.1,//left A down
										   -0.8,-1.0, 0.1,//left A down
										   -0.8,-1.0, 0.0,//left A down
										    0.3, 0.0, 0.0,//mid A mid
										    0.3, 0.0, 0.1,//mid A mid
										   -0.3, 0.0, 0.1,//mid A mid
										   -0.3, 0.0, 0.0,//mid A mid
										    0.4,-0.2, 0.0,//mid A mid
										    0.4,-0.2, 0.1,//mid A mid
										   -0.4,-0.2, 0.1,//mid A mid
										   -0.4,-0.2, 0.0,//mid A mid
										    1.0,-1.0, 0.0,//bottom A
											1.0,-1.0, 0.1,//bottom A
											0.8,-1.0, 0.1,//bottom A
											0.8,-1.0, 0.0,//bottom A
										   -1.0,-1.0, 0.0,//bottom A
										   -1.0,-1.0, 0.1,//bottom A
										   -0.8,-1.0, 0.1,//bottom A
										   -0.8,-1.0, 0.0 //bottom A
										   ]);
	var AcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front A green
										0.0, 1.0, 0.0,//front A green
										0.0, 1.0, 0.0,//front A green
										0.0, 1.0, 0.0,//front A green
										0.0, 0.0, 1.0,//front A blue
										0.0, 0.0, 1.0,//front A blue
										0.0, 0.0, 1.0,//front A blue
										0.0, 0.0, 1.0,//front A blue
										1.0, 0.0, 0.0,//front A red
										1.0, 0.0, 0.0,//front A red
										1.0, 0.0, 0.0,//front A red
										1.0, 0.0, 0.0,//front A red
										0.0, 1.0, 0.0,//back A green
										0.0, 1.0, 0.0,//back A green
										0.0, 1.0, 0.0,//back A green
										0.0, 1.0, 0.0,//back A green
										0.0, 0.0, 1.0,//back A blue
										0.0, 0.0, 1.0,//back A blue
										0.0, 0.0, 1.0,//back A blue
										0.0, 0.0, 1.0,//back A blue
										1.0, 0.0, 0.0,//back A red
										1.0, 0.0, 0.0,//back A red
										1.0, 0.0, 0.0,//back A red
										1.0, 0.0, 0.0,//back A red
										0.0, 1.0, 1.0,// right A cyan
										0.0, 1.0, 1.0,// right A cyan
										0.0, 1.0, 1.0,// right A cyan
										0.0, 1.0, 1.0,// right A cyan
										0.0, 1.0, 1.0,// left A cyan
 										0.0, 1.0, 1.0,// left A cyan
	                                    0.0, 1.0, 1.0,// left A cyan
										0.0, 1.0, 1.0,// left A cyan
										1.0, 1.0, 0.0,// right A yellow
 										1.0, 1.0, 0.0,// right A yellow
	                                    1.0, 1.0, 0.0,// right A yellow
										1.0, 1.0, 0.0, // right A yellow
										1.0, 1.0, 0.0,// left A yellow
										1.0, 1.0, 0.0,// left A yellow
										1.0, 1.0, 0.0,// left A yellow
										1.0, 1.0, 0.0,// left A yellow
										1.0, 0.0, 1.0,// mid up A voilet
										1.0, 0.0, 1.0,// mid up A voilet
										1.0, 0.0, 1.0,// mid up A voilet
										1.0, 0.0, 1.0, // mid up A voilet
										1.0, 0.0, 1.0,// mid down A voilet
										1.0, 0.0, 1.0,// mid down A voilet
										1.0, 0.0, 1.0,// mid down A voilet
										1.0, 0.0, 1.0, // mid down A voilet
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0,//bottom A white
										1.0, 1.0, 1.0 //bottom A white
										]);
	var ATexture=new Float32Array([
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0,
											0.0,0.0,// front
											1.0,0.0,//
											1.0,1.0,//
											0.0,1.0
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,ACoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,AcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,ATexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);
	//gl.drawArrays(gl.LINES,3,3);
	gl.bindVertexArray(null);
}
function msdDrawE(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var ECoordinates=new Float32Array([
										0.8, 1.0, 0.0,//top front 1
									    0.2, 1.0, 0.0,//top front
									    0.2, 0.8, 0.0,//top front
										0.8, 0.8, 0.0,//top front
										0.8,-1.0, 0.0,//botoom front 2
									    0.2,-1.0, 0.0,//botoom front
									    0.2,-0.8, 0.0,//botoom front
										0.8,-0.8, 0.0,//botoom front
										0.5, 0.1, 0.0,//middle front 3
									    0.2, 0.1, 0.0,//middle front
									    0.2,-0.1, 0.0,//middle front
									    0.5,-0.1, 0.0,//middle front
										0.2, 1.0, 0.0,//straight 4
										0.0, 1.0, 0.0,//straight
										0.0,-1.0, 0.0,//straight
										0.2,-1.0, 0.0,//straight
										0.8, 1.0, 0.1,//top back 5
									    0.2, 1.0, 0.1,//top back
									    0.2, 0.8, 0.1,//top back
										0.8, 0.8, 0.1,//top back
										0.8,-1.0, 0.1,//botoom back 6
									    0.2,-1.0, 0.1,//botoom back
									    0.2,-0.8, 0.1,//botoom back
										0.8,-0.8, 0.1,//botoom back
										0.5, 0.1, 0.1,//middle back 7
									    0.2, 0.1, 0.1,//middle back
									    0.2,-0.1, 0.1,//middle back
									    0.5,-0.1, 0.1,//middle back
										0.2, 1.0, 0.1,//straight back 8
										0.0, 1.0, 0.1,//straight back 
										0.0,-1.0, 0.1,//straight back 
										0.2,-1.0, 0.1,//straight back
										0.0, 1.0, 0.1,//top top 9
										0.0, 1.0, 0.0,//top top
										0.8, 1.0, 0.0,//top top
										0.8, 1.0, 0.1,//top top
										0.0,-1.0, 0.1,//bottom bottom 10
										0.0,-1.0, 0.0,//bottom bottom
										0.8,-1.0, 0.0,//bottom bottom
										0.8,-1.0, 0.1,//bottom bottom
										0.2, 0.8, 0.1,//top bottom 11
										0.2, 0.8, 0.0,//top bottom
										0.8, 0.8, 0.0,//top bottom
										0.8, 0.8, 0.1,//top bottom
										0.2,-0.8, 0.1,//bottom top 12
										0.2,-0.8, 0.0,//bottom top
										0.8,-0.8, 0.0,//bottom top
										0.8,-0.8, 0.1,//bottom top
										0.2, 0.1, 0.1,//middle top 13
										0.2, 0.1, 0.0,//middle top 
										0.5, 0.1, 0.0,//middle top 
										0.5, 0.1, 0.1,//middle top
										0.2,-0.1, 0.1,//middle bottom 14
										0.2,-0.1, 0.0,//middle bottom 
										0.5,-0.1, 0.0,//middle bottom 
										0.5,-0.1, 0.1,//middle bottom
										0.0, 1.0, 0.1,//straight left 15
										0.0, 1.0, 0.0,//straight left 
										0.0,-1.0, 0.0,//straight left 
										0.0,-1.0, 0.1,//straight left
										0.2, 1.0, 0.1,//straight right 16
										0.2, 1.0, 0.0,//straight right 
										0.2,-1.0, 0.0,//straight right 
										0.2,-1.0, 0.1,//straight right
										0.8, 1.0, 0.1,//top right 17
										0.8, 1.0, 0.0,//top right
										0.8, 0.8, 0.0,//top right
										0.8, 0.8, 0.1,//top right
										0.5, 0.1, 0.1,//middle right 18
										0.5, 0.1, 0.0,//middle right
										0.5,-0.1, 0.0,//middle right
										0.5,-0.1, 0.1,//middle right
									    0.8,-1.0, 0.1,//bottom right 19
									    0.8,-1.0, 0.0,//bottom right
									    0.8,-0.8, 0.0,//bottom right
									    0.8,-0.8, 0.1//bottom right
									   ]);
	var EcolorCoordinates=new Float32Array([
										1.0, 0.0, 0.0,//top front 1
										1.0, 0.0, 0.0,//top front
										1.0, 0.0, 0.0,//top front
										1.0, 0.0, 0.0,//top front
										0.0, 1.0, 0.0,//botoom front 2
										0.0, 1.0, 0.0,//botoom front
										0.0, 1.0, 0.0,//botoom front
										0.0, 1.0, 0.0,//botoom front
										0.0, 0.0, 1.0,//middle front 3
										0.0, 0.0, 1.0,//middle front
										0.0, 0.0, 1.0,//middle front
										0.0, 0.0, 1.0,//middle front
										1.0, 1.0, 0.0,//straight 4
										1.0, 1.0, 0.0,//straight
										1.0, 1.0, 0.0,//straight
										1.0, 1.0, 0.0,//straight
										0.0, 0.0, 1.0,//top back 5
										0.0, 0.0, 1.0,//top back
										0.0, 0.0, 1.0,//top back
										0.0, 0.0, 1.0,//top back
										0.0, 0.0, 1.0,//botoom back 6
										0.0, 0.0, 1.0,//botoom back
										0.0, 0.0, 1.0,//botoom back
										0.0, 0.0, 1.0,//botoom back
										0.0, 1.0, 1.0,//middle back 7
										0.0, 1.0, 1.0,//middle back
										0.0, 1.0, 1.0,//middle back
										0.0, 1.0, 1.0,//middle back
										0.0, 1.0, 1.0,//straight back 8
										0.0, 1.0, 1.0,//straight back 
										0.0, 1.0, 1.0,//straight back 
										0.0, 1.0, 1.0,//straight back
										1.0, 1.0, 1.0,//top top 9
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//top top
										1.0, 1.0, 1.0,//bottom bottom 10
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//bottom bottom
										1.0, 1.0, 1.0,//top bottom 11
										1.0, 1.0, 1.0,//top bottom
										1.0, 1.0, 1.0,//top bottom
										1.0, 1.0, 1.0,//top bottom
										1.0, 0.0, 1.0,//bottom top 12
										1.0, 0.0, 1.0,//bottom top
										1.0, 0.0, 1.0,//bottom top
										1.0, 0.0, 1.0,//bottom top
										1.0, 0.0, 1.0,//middle top 13
										1.0, 0.0, 1.0,//middle top
										1.0, 0.0, 1.0,//middle top
										1.0, 0.0, 1.0,//middle top
										1.0, 1.0, 0.0,//middle bottom 14
										1.0, 1.0, 0.0,//middle bottom
										1.0, 1.0, 0.0,//middle bottom
										1.0, 1.0, 0.0,//middle bottom
										1.0, 0.0, 0.0,//straight left 15
										1.0, 0.0, 0.0,//straight left
										1.0, 0.0, 0.0,//straight left
										1.0, 0.0, 0.0,//straight left
										1.0, 0.0, 1.0,//straight right 16
										1.0, 0.0, 1.0,//straight right
										1.0, 0.0, 1.0,//straight right
										1.0, 0.0, 1.0,//straight right
										1.0, 0.0, 1.0,//top right 17
										1.0, 0.0, 1.0,//top right
										1.0, 0.0, 0.0,//top right
										1.0, 0.0, 0.0,//top right
										1.0, 0.0, 1.0,//middle right 18
										1.0, 0.0, 1.0,//middle right
										1.0, 0.0, 0.0,//middle right
										1.0, 0.0, 0.0,//middle right
										1.0, 0.0, 1.0,//bottom right 19
										1.0, 0.0, 1.0,//bottom right
										1.0, 0.0, 0.0,//bottom right
										1.0, 0.0, 0.0 //bottom right
										
										]);
	
	var ETexture=new Float32Array([
											0.0,0.0,//top front 1
											1.0,0.0,//top front
											1.0,1.0,//top front
											0.0,1.0,//top front
											0.0,0.0,//botoom front 2
											1.0,0.0,//botoom front
											1.0,1.0,//botoom front
											0.0,1.0,//botoom front
											0.0,0.0,//middle front 3
											1.0,0.0,//middle front
											1.0,1.0,//middle front
											0.0,1.0,//middle front
											0.0,0.0,//straight 4
											1.0,0.0,//straight
											1.0,1.0,//straight
											0.0,1.0,//straight
											0.0,0.0,//top back 5
											1.0,0.0,//top back
											1.0,1.0,//top back
											0.0,1.0,//top back
											0.0,0.0,//botoom back 6
											1.0,0.0,//botoom back
											1.0,1.0,//botoom back
											0.0,1.0,//botoom back
											0.0,0.0,//middle back 7
                                            1.0,0.0,//middle back
                                            1.0,1.0,//middle back
                                            0.0,1.0,//middle back
											0.0,0.0,//straight back 8
                                            1.0,0.0,//straight back 
                                            1.0,1.0,//straight back 
                                            0.0,1.0,//straight back
											0.0,0.0,//top top 9
                                            1.0,0.0,//top top
                                            1.0,1.0,//top top
                                            0.0,1.0,//top top
											0.0,0.0,//bottom bottom 10
                                            1.0,0.0,//bottom bottom
                                            1.0,1.0,//bottom bottom
                                            0.0,1.0,//bottom bottom
											0.0,0.0,//top bottom 11
                                            1.0,0.0,//top bottom
                                            1.0,1.0,//top bottom
                                            0.0,1.0,//top bottom
											0.0,0.0,//bottom top 12
                                            1.0,0.0,//bottom top
                                            1.0,1.0,//bottom top
                                            0.0,1.0,//bottom top
											0.0,0.0,//middle top 13
                                            1.0,0.0,//middle top
                                            1.0,1.0,//middle top
                                            0.0,1.0,//middle top
											0.0,0.0,//middle bottom 14
                                            1.0,0.0,//middle bottom
                                            1.0,1.0,//middle bottom
                                            0.0,1.0,//middle bottom
											0.0,0.0,//straight left 15
                                            1.0,0.0,//straight left
                                            1.0,1.0,//straight left
                                            0.0,1.0,//straight left
											0.0,0.0,//straight right 16
                                            1.0,0.0,//straight right
                                            1.0,1.0,//straight right
                                            0.0,1.0,//straight right
											0.0,0.0,//top right 17
                                            1.0,0.0,//top right
                                            1.0,1.0,//top right
                                            0.0,1.0,//top right
											0.0,0.0,//middle right 18
                                            1.0,0.0,//middle right
                                            1.0,1.0,//middle right
                                            0.0,1.0,//middle right
											0.0,0.0,//bottom right 19
                                            1.0,0.0,//bottom right
                                            1.0,1.0,//bottom right
                                            0.0,1.0//bottom right
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,ECoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,EcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,ETexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	gl.drawArrays(gl.TRIANGLE_FAN,68,4);//18
	gl.drawArrays(gl.TRIANGLE_FAN,72,4);//19
	
	gl.bindVertexArray(null);
}
function msdDrawI(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var ICoordinates=new Float32Array([
									    0.5, 1.0, 0.0,//front top 1
									   -0.5, 1.0, 0.0,//front top
									   -0.5, 0.8, 0.0,//front top
									    0.5, 0.8, 0.0,//front top
										0.5,-0.8, 0.0,//front bottom 2
									   -0.5,-0.8, 0.0,//front bottom
									   -0.5,-1.0, 0.0,//front bottom 
									    0.5,-1.0, 0.0,//front bottom
										0.1, 0.8, 0.0,//front middle 3
									   -0.1, 0.8, 0.0,//front middle
									   -0.1,-0.8, 0.0,//front middle 
									    0.1,-0.8, 0.0,//front middle
										0.5, 1.0, 0.1,//front top 4
									   -0.5, 1.0, 0.1,//front top
									   -0.5, 0.8, 0.1,//front top
									    0.5, 0.8, 0.1,//front top
										0.5,-0.8, 0.1,//front bottom 5
									   -0.5,-0.8, 0.1,//front bottom
									   -0.5,-1.0, 0.1,//front bottom 
									    0.5,-1.0, 0.1,//front bottom
										0.1, 0.8, 0.1,//front middle 6
									   -0.1, 0.8, 0.1,//front middle
									   -0.1,-0.8, 0.1,//front middle 
									    0.1,-0.8, 0.1,//front middle
									   -0.5, 1.0, 0.1,//top top 7
									   -0.5, 1.0, 0.0,//top top
									    0.5, 1.0, 0.0,//top top
									    0.5, 1.0, 0.1,//top top
									   -0.5, 0.8, 0.1,//top bottom 8
									   -0.5, 0.8, 0.0,//top bottom
									    0.5, 0.8, 0.0,//top bottom
									    0.5, 0.8, 0.1,//top bottom
									   -0.5,-0.8, 0.1,//bottom top 9
									   -0.5,-0.8, 0.0,//bottom top
									    0.5,-0.8, 0.0,//bottom top
									    0.5,-0.8, 0.1,//bottom top
									   -0.5,-1.0, 0.1,//bottom bottom 10
									   -0.5,-1.0, 0.0,//bottom bottom
									    0.5,-1.0, 0.0,//bottom bottom
									    0.5,-1.0, 0.1,//bottom bottom
										0.1, 0.8, 0.1,//middle right 11
										0.1, 0.8, 0.0,//middle right
										0.1,-0.8, 0.0,//middle right
										0.1,-0.8, 0.1,//middle right
									   -0.1, 0.8, 0.1,//middle left 12
									   -0.1, 0.8, 0.0,//middle left
									   -0.1,-0.8, 0.0,//middle left
									   -0.1,-0.8, 0.1,//middle left
									    0.5, 1.0, 0.1,//top right 13
										0.5, 1.0, 0.0,//top right
										0.5, 0.8, 0.0,//top right
										0.5, 0.8, 0.1,//top right
									   -0.5, 1.0, 0.1,//top left 14
									   -0.5, 1.0, 0.0,//top left
									   -0.5, 0.8, 0.0,//top left
									   -0.5, 0.8, 0.1,//top left
									    0.5,-0.8, 0.1,//bottom right 15
										0.5,-0.8, 0.0,//bottom right
										0.5,-1.0, 0.0,//bottom right
										0.5,-1.0, 0.1,//bottom right
									   -0.5,-0.8, 0.1,//bottom left 16
									   -0.5,-0.8, 0.0,//bottom left
									   -0.5,-1.0, 0.0,//bottom left
									   -0.5,-1.0, 0.1//bottom left
										   ]);
	var IcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom 
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front middle 3
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle 
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front top 4
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 5
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom 
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//front middle 6
										1.0, 0.0, 0.0,//front middle
										1.0, 0.0, 0.0,//front middle 
										1.0, 0.0, 0.0,//front middle
										0.0, 1.0, 1.0,//top top 7
										0.0, 1.0, 1.0,//top top
										0.0, 1.0, 1.0,//top top
										0.0, 1.0, 1.0,//top top
										0.0, 1.0, 1.0,//top bottom 8
 										0.0, 1.0, 1.0,//top bottom
	                                    0.0, 1.0, 1.0,//top bottom
										0.0, 1.0, 1.0,//top bottom
										1.0, 1.0, 0.0,//bottom top 9
 										1.0, 1.0, 0.0,//bottom top
	                                    1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom top
										1.0, 1.0, 0.0,//bottom bottom 10
										1.0, 1.0, 0.0,//bottom bottom
										1.0, 1.0, 0.0,//bottom bottom
										1.0, 1.0, 0.0,//bottom bottom
										1.0, 0.0, 1.0,//middle right 11
										1.0, 0.0, 1.0,//middle right
										1.0, 0.0, 1.0,//middle right
										1.0, 0.0, 1.0,//middle right
										1.0, 0.0, 1.0,//middle left 12
										1.0, 0.0, 1.0,//middle left
										1.0, 0.0, 1.0,//middle left
										1.0, 0.0, 1.0,//middle left
										1.0, 1.0, 1.0,//top right 13
										1.0, 1.0, 1.0,//top right
										1.0, 1.0, 1.0,//top right
										1.0, 1.0, 1.0,//top right
										1.0, 1.0, 1.0,//top left 14
										1.0, 1.0, 1.0,//top left
										1.0, 1.0, 1.0,//top left
										1.0, 1.0, 1.0,//top left
										1.0, 1.0, 1.0,//bottom right 15
										1.0, 1.0, 1.0,//bottom right
										1.0, 1.0, 1.0,//bottom right
										1.0, 1.0, 1.0,//bottom right
										1.0, 1.0, 1.0,//bottom left 16
										1.0, 1.0, 1.0,//bottom left
										1.0, 1.0, 1.0,//bottom left
										1.0, 1.0, 1.0 //bottom left
										
										]);
	var ITexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom 
											0.0,1.0,//front bottom
											0.0,0.0,//front middle 3
											1.0,0.0,//front middle
											1.0,1.0,//front middle 
											0.0,1.0,//front middle
											0.0,0.0,//front top 4
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 5
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom 
											0.0,1.0,//front bottom
											0.0,0.0,//front middle 6
											1.0,0.0,//front middle
											1.0,1.0,//front middle 
											0.0,1.0,//front middle
											0.0,0.0,//top top 7
											1.0,0.0,//top top
											1.0,1.0,//top top
											0.0,1.0,//top top
											0.0,0.0,//top bottom 8
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//bottom top 9
											1.0,0.0,//bottom top
											1.0,1.0,//bottom top
											0.0,1.0,//bottom top
											0.0,0.0,//bottom bottom 10
											1.0,0.0,//bottom bottom
											1.0,1.0,//bottom bottom
											0.0,1.0,//bottom bottom
											0.0,0.0,//middle right 11
											1.0,0.0,//middle right
											1.0,1.0,//middle right
											0.0,1.0,//middle right
											0.0,0.0,//middle left 12
											1.0,0.0,//middle left
											1.0,1.0,//middle left
											0.0,1.0,//middle left
											0.0,0.0,//top right 13
											1.0,0.0,//top right
											1.0,1.0,//top right
											0.0,1.0,//top right
											0.0,0.0,//top left 14
											1.0,0.0,//top left
											1.0,1.0,//top left
											0.0,1.0,//top left
											0.0,0.0,//bottom right 15
											1.0,0.0,//bottom right
											1.0,1.0,//bottom right
											0.0,1.0,//bottom right
											0.0,0.0,//bottom left 16
											1.0,0.0,//bottom left
											1.0,1.0,//bottom left
											0.0,1.0 //bottom left
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,ICoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,IcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,ITexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	
	gl.bindVertexArray(null);
}

function msdDrawL(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var LCoordinates=new Float32Array([
									    0.1, 1.0, 0.0,//front top 1
									   -0.1, 1.0, 0.0,//front top
									   -0.1,-1.0, 0.0,//front top
									    0.1,-1.0, 0.0,//front top
										0.5,-0.8, 0.0,//front bottom 2
									    0.1,-0.8, 0.0,//front bottom
									    0.1,-1.0, 0.0,//front bottom 
									    0.5,-1.0, 0.0,//front bottom
									    0.1, 1.0, 0.1,//back top 3
									   -0.1, 1.0, 0.1,//back top
									   -0.1,-1.0, 0.1,//back top
									    0.1,-1.0, 0.1,//back top
									    0.5,-0.8, 0.1,//back bottom 4
									    0.1,-0.8, 0.1,//back bottom
									    0.1,-1.0, 0.1,//back bottom 
									    0.5,-1.0, 0.1,//back bottom
									   -0.1, 1.0, 0.1,//top 5
									   -0.1, 1.0, 0.0,//top
									    0.1, 1.0, 0.0,//top
										0.1, 1.0, 0.1,//top
									   -0.1,-1.0, 0.1,//bottom 6
									   -0.1,-1.0, 0.0,//bottom
									    0.5,-1.0, 0.0,//bottom
										0.5,-1.0, 0.1,//bottom
									    0.1,-0.8, 0.1,//bottom up 7
									    0.1,-0.8, 0.0,//bottom up 
									    0.5,-0.8, 0.0,//bottom up 
										0.5,-0.8, 0.1,//bottom up 
									    0.1, 1.0, 0.1,//middle right 8
									    0.1, 1.0, 0.0,//middle right
									    0.1,-0.8, 0.0,//middle right
										0.1,-0.8, 0.1,//middle right
									   -0.1, 1.0, 0.1,//middle left 9
									   -0.1, 1.0, 0.0,//middle left
									   -0.1,-1.0, 0.0,//middle left
									   -0.1,-1.0, 0.1,//middle left
									    0.5,-0.8, 0.1,//bottom right 10
									    0.5,-0.8, 0.0,//bottom right
									    0.5,-1.0, 0.0,//bottom right
										0.5,-1.0, 0.1 //bottom right
										
										   ]);
	var LcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front top 1
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 1.0, 0.0,//front top
										0.0, 0.0, 1.0,//front bottom 2
										0.0, 0.0, 1.0,//front bottom
										0.0, 0.0, 1.0,//front bottom 
										0.0, 0.0, 1.0,//front bottom
										1.0, 0.0, 0.0,//back top 3
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										0.0, 1.0, 0.0,//back bottom 4
										0.0, 1.0, 0.0,//back bottom
										0.0, 1.0, 0.0,//back bottom 
										0.0, 1.0, 0.0,//back bottom
										0.0, 0.0, 1.0,//top 5
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										1.0, 0.0, 0.0,//bottom 6
										1.0, 0.0, 0.0,//bottom
										1.0, 0.0, 0.0,//bottom
										1.0, 0.0, 0.0,//bottom
										0.0, 1.0, 1.0,//bottom up 7
										0.0, 1.0, 1.0,//bottom up 
										0.0, 1.0, 1.0,//bottom up 
										0.0, 1.0, 1.0,//bottom up 
										0.0, 1.0, 1.0,//middle right 8
 										0.0, 1.0, 1.0,//middle right
	                                    0.0, 1.0, 1.0,//middle right
										0.0, 1.0, 1.0,//middle right
										1.0, 1.0, 0.0,//middle left 9
 										1.0, 1.0, 0.0,//middle left
	                                    1.0, 1.0, 0.0,//middle left
										1.0, 1.0, 0.0,//middle left
										1.0, 1.0, 0.0,//bottom right 10
										1.0, 1.0, 0.0,//bottom right
										1.0, 1.0, 0.0,//bottom right
										1.0, 1.0, 0.0,//bottom right
										
										]);
	var LTexture=new Float32Array([
											0.0,0.0,//front top 1
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front bottom 2
											1.0,0.0,//front bottom
											1.0,1.0,//front bottom 
											0.0,1.0,//front bottom
											0.0,0.0,//back top 3
											1.0,0.0,//back top
											1.0,1.0,//back top
											0.0,1.0,//back top
											0.0,0.0,//back bottom 4
											1.0,0.0,//back bottom
											1.0,1.0,//back bottom 
											0.0,1.0,//back bottom
											0.0,0.0,//top 5
											1.0,0.0,//top
											1.0,1.0,//top
											0.0,1.0,//top
											0.0,0.0,//bottom 6
											1.0,0.0,//bottom
											1.0,1.0,//bottom
											0.0,1.0,//bottom
											0.0,0.0,//bottom up 7
											1.0,0.0,//bottom up 
											1.0,1.0,//bottom up 
											0.0,1.0,//bottom up 
											0.0,0.0,//middle right 8
											1.0,0.0,//middle right
											1.0,1.0,//middle right
											0.0,1.0,//middle right
											0.0,0.0,//middle left 9
											1.0,0.0,//middle left
											1.0,1.0,//middle left
											0.0,1.0,//middle left
											0.0,0.0,//bottom right 10
											1.0,0.0,//bottom right
											1.0,1.0,//bottom right
											0.0,1.0,//bottom right

										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,LCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,LcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,LTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	
	gl.bindVertexArray(null);
}

function msdDrawP(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var PCoordinates=new Float32Array([
									    0.1, 1.0, 0.0,//front straight 1
									   -0.1, 1.0, 0.0,//front straight
									   -0.1,-1.0, 0.0,//front straight
									    0.1,-1.0, 0.0,//front straight
										0.7, 1.0, 0.0,//front top 2
									    0.1, 1.0, 0.0,//front top
									    0.1, 0.8, 0.0,//front top 
									    0.7, 0.8, 0.0,//front top
									    0.7, 0.8, 0.0,//front right 3
									    0.5, 0.8, 0.0,//front right
									    0.5,-0.1, 0.0,//front right
									    0.7,-0.1, 0.0,//front right
									    0.5, 0.1, 0.0,//middle 4
									    0.1, 0.1, 0.0,//middle
									    0.1,-0.1, 0.0,//middle 
									    0.5,-0.1, 0.0,//middle
									    0.1, 1.0, 0.1,//back straight 5
									   -0.1, 1.0, 0.1,//back straight
									   -0.1,-1.0, 0.1,//back straight
									    0.1,-1.0, 0.1,//back straight
										0.7, 1.0, 0.1,//back top 6
									    0.1, 1.0, 0.1,//back top
									    0.1, 0.8, 0.1,//back top 
									    0.7, 0.8, 0.1,//back top
									    0.7, 0.8, 0.1,//back right 7
									    0.5, 0.8, 0.1,//back right
									    0.5,-0.1, 0.1,//back right
									    0.7,-0.1, 0.1,//back right
									    0.5, 0.1, 0.1,//back middle 8
									    0.1, 0.1, 0.1,//back middle
									    0.1,-0.1, 0.1,//back middle 
									    0.5,-0.1, 0.1,//back middle
									   -0.1, 1.0, 0.1,//top top 9	
									   -0.1, 1.0, 0.0,//top top
									    0.7, 1.0, 0.0,//top top
										0.7, 1.0, 0.1,//top top
									    0.1, 0.8, 0.1,//top bottom 10	
									    0.1, 0.8, 0.0,//top bottom
									    0.5, 0.8, 0.0,//top bottom
										0.5, 0.8, 0.1,//top bottom
									    0.1, 0.1, 0.1,//middle up 11
									    0.1, 0.1, 0.0,//middle up
									    0.5, 0.1, 0.0,//middle up
									    0.5, 0.1, 0.1,//middle up
										0.1,-0.1, 0.1,//middle down 12
									    0.1,-0.1, 0.0,//middle down
									    0.7,-0.1, 0.0,//middle down
									    0.7,-0.1, 0.1,//middle down
									   -0.1,-1.0, 0.1,//bottom 13
									   -0.1,-1.0, 0.0,//bottom
									    0.1,-1.0, 0.0,//bottom
										0.1,-1.0, 0.1,//bottom
									   -0.1, 1.0, 0.1,//straight left 14
									   -0.1, 1.0, 0.0,//straight left
									   -0.1,-1.0, 0.0,//straight left
									   -0.1,-1.0, 0.1,//straight left
									    0.1, 1.0, 0.1,//straight right 15
									    0.1, 1.0, 0.0,//straight right
									    0.1,-1.0, 0.0,//straight right
									    0.1,-1.0, 0.1,//straight right
										0.7, 1.0, 0.1,//right right 16
										0.7, 1.0, 0.0,//right right
										0.7,-0.1, 0.0,//right right
										0.7,-0.1, 0.1,//right right
										0.5, 0.8, 0.1,//right left 17
										0.5, 0.8, 0.0,//right left
										0.5, 0.1, 0.0,//right left
										0.5, 0.1, 0.1//right left
										   ]);
	var PcolorCoordinates=new Float32Array([
										0.0, 1.0, 0.0,//front straight 1
										0.0, 1.0, 0.0,//front straight
										0.0, 1.0, 0.0,//front straight
										0.0, 1.0, 0.0,//front straight
										0.0, 0.0, 1.0,//front top 2
										0.0, 0.0, 1.0,//front top
										0.0, 0.0, 1.0,//front top 
										0.0, 0.0, 1.0,//front top
										1.0, 0.0, 0.0,//front right 3
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										1.0, 0.0, 0.0,//front right
										0.0, 1.0, 0.0,//middle 4
										0.0, 1.0, 0.0,//middle
										0.0, 1.0, 0.0,//middle 
										0.0, 1.0, 0.0,//middle
										0.0, 0.0, 1.0,//back straight 5
										0.0, 0.0, 1.0,//back straight
										0.0, 0.0, 1.0,//back straight
										0.0, 0.0, 1.0,//back straight
										1.0, 0.0, 0.0,//back top 6
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top 
										1.0, 0.0, 0.0,//back top
										0.0, 1.0, 1.0,//back right 7
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back right
										0.0, 1.0, 1.0,//back middle 8
 										0.0, 1.0, 1.0,//back middle
	                                    0.0, 1.0, 1.0,//back middle 
										0.0, 1.0, 1.0,//back middle
										1.0, 1.0, 0.0,//top top 9	
 										1.0, 1.0, 0.0,//top top
	                                    1.0, 1.0, 0.0,//top top
										1.0, 1.0, 0.0,//top top
										1.0, 1.0, 0.0,//top bottom 10	
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 0.0,//top bottom
										1.0, 1.0, 1.0,//middle up 11
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle up
										1.0, 1.0, 1.0,//middle down 12
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 1.0, 1.0,//middle down
										1.0, 0.0, 1.0,//bottom 13
										1.0, 0.0, 1.0,//bottom
										1.0, 0.0, 1.0,//bottom
										1.0, 0.0, 1.0,//bottom
										1.0, 1.0, 0.0,//straight left 14
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight left
										1.0, 1.0, 0.0,//straight right 15
										1.0, 1.0, 0.0,//straight right
										1.0, 1.0, 0.0,//straight right
										1.0, 1.0, 0.0,//straight right
										0.0, 0.6, 1.0,//right right 16
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right right
										0.0, 0.6, 1.0,//right left 17
										0.0, 0.6, 1.0,//right left
										0.0, 0.6, 1.0,//right left
										0.0, 0.6, 1.0//right left
										
										]);
	var PTexture=new Float32Array([
											0.0,0.0,//front straight 1
											1.0,0.0,//front straight
											1.0,1.0,//front straight
											0.0,1.0,//front straight
											0.0,0.0,//front top 2
											1.0,0.0,//front top
											1.0,1.0,//front top 
											0.0,1.0,//front top
											0.0,0.0,//front right 3
											1.0,0.0,//front right
											1.0,1.0,//front right
											0.0,1.0,//front right
											0.0,0.0,//middle 4
											1.0,0.0,//middle
											1.0,1.0,//middle 
											0.0,1.0,//middle
											0.0,0.0,//back straight 5
											1.0,0.0,//back straight
											1.0,1.0,//back straight
											0.0,1.0,//back straight
											0.0,0.0,//back top 6
											1.0,0.0,//back top
											1.0,1.0,//back top 
											0.0,1.0,//back top
											0.0,0.0,//back right 7
											1.0,0.0,//back right
											1.0,1.0,//back right
											0.0,1.0,//back right
											0.0,0.0,//back middle 8
											1.0,0.0,//back middle
											1.0,1.0,//back middle 
											0.0,1.0,//back middle
											0.0,0.0,//top top 9	
											1.0,0.0,//top top
											1.0,1.0,//top top
											0.0,1.0,//top top
											0.0,0.0,//top bottom 10	
											1.0,0.0,//top bottom
											1.0,1.0,//top bottom
											0.0,1.0,//top bottom
											0.0,0.0,//middle up 11
											1.0,0.0,//middle up
											1.0,1.0,//middle up
											0.0,1.0,//middle up
											0.0,0.0,//middle down 12
											1.0,0.0,//middle down
											1.0,1.0,//middle down
											0.0,1.0,//middle down
											0.0,0.0,//bottom 13
											1.0,0.0,//bottom
											1.0,1.0,//bottom
											0.0,1.0,//bottom
											0.0,0.0,//straight left 14
											1.0,0.0,//straight left
											1.0,1.0,//straight left
											0.0,1.0,//straight left
											0.0,0.0,//straight right 15
											1.0,0.0,//straight right
											1.0,1.0,//straight right
											0.0,1.0,//straight right
											0.0,0.0,//right right 16
											1.0,0.0,//right right
											1.0,1.0,//right right
											0.0,1.0,//right right
											0.0,0.0,//right left 17
											1.0,0.0,//right left
											1.0,1.0,//right left
											0.0,1.0//right left

										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,PCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,PcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,PTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);//1
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);//2
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);//3
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);//4
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);//5
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);//6
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);//7
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);//8
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);//9
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);//10
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);//11
	gl.drawArrays(gl.TRIANGLE_FAN,44,4);//12
	gl.drawArrays(gl.TRIANGLE_FAN,48,4);//13
	gl.drawArrays(gl.TRIANGLE_FAN,52,4);//14
	gl.drawArrays(gl.TRIANGLE_FAN,56,4);//15
	gl.drawArrays(gl.TRIANGLE_FAN,60,4);//16
	gl.drawArrays(gl.TRIANGLE_FAN,64,4);//17
	
	gl.bindVertexArray(null);
}


function msdDrawT(vbo,vbo_color,vbo_texture,rectangle_texture)
{
	var TCoordinates=new Float32Array([
										0.4, 1.0, 0.0,//front 1
									   -0.4, 1.0, 0.0,//front
									   -0.4, 0.8, 0.0,//front
										0.4, 0.8, 0.0,//front
										0.1, 0.8, 0.0,//front 2
									   -0.1, 0.8, 0.0,//front
									   -0.1,-1.0, 0.0,//front
									    0.1,-1.0, 0.0,//front
										0.4, 1.0, 0.1,//back 3
									   -0.4, 1.0, 0.1,//back
									   -0.4, 0.8, 0.1,//back
										0.4, 0.8, 0.1,//back
										0.1, 0.8, 0.1,//back 4
									   -0.1, 0.8, 0.1,//back
									   -0.1,-1.0, 0.1,//back
										0.1,-1.0, 0.1,//back
									   -0.4, 1.0, 0.1,//top 5
									   -0.4, 1.0, 0.0,//top
									    0.4, 1.0, 0.0,//top
									    0.4, 1.0, 0.1,//top
									   -0.4, 0.8, 0.0,//top bottom 6
									   -0.4, 0.8, 0.1,//top bottom
									    0.4, 0.8, 0.1,//top bottom
									    0.4, 0.8, 0.0, //top  bottom
									   -0.1, 0.8, 0.0,//left side middle 7
									   -0.1, 0.8, 0.1,//left side middle
									   -0.1,-1.0, 0.1,//left side middle
									   -0.1,-1.0, 0.0,//left side middle
									    0.1, 0.8, 0.0,//right side middle 8
									    0.1, 0.8, 0.1,//right side middle
									    0.1,-1.0, 0.1,//right side middle
									    0.1,-1.0, 0.0,//right side middle
										0.4, 1.0, 0.1,//right top side
										0.4, 1.0, 0.0,//right top side
										0.4, 0.8, 0.0,//right top side
										0.4, 0.8, 0.1,//right top side
									   -0.4, 1.0, 0.1,//left top side
									   -0.4, 1.0, 0.0,//left top side
									   -0.4, 0.8, 0.0,//left top side
									   -0.4, 0.8, 0.1,//left top side
									   -0.1,-1.0, 0.1,//bottom
									   -0.1,-1.0, 0.0,//bottom
									    0.1,-1.0, 0.0,//bottom
									    0.1,-1.0, 0.1 //bottom
									   ]);
	var TcolorCoordinates=new Float32Array([
										1.0, 0.0, 0.0,//front top
										1.0, 0.0, 0.0,//front top
										1.0, 0.0, 0.0,//front top
										1.0, 0.0, 0.0,//front top
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										0.0, 1.0, 0.0,//front middle
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										1.0, 0.0, 0.0,//back top
										0.0, 1.0, 0.0,//back middle
										0.0, 1.0, 0.0,//back middle
										0.0, 1.0, 0.0,//back middle
										0.0, 1.0, 0.0,//back middle
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top
										0.0, 0.0, 1.0,//top bottom
										0.0, 0.0, 1.0,//top bottom
										0.0, 0.0, 1.0,//top bottom
										0.0, 0.0, 1.0,//top bottom
										0.0, 1.0, 1.0,//left side middle
										0.0, 1.0, 1.0,//left side middle
										0.0, 1.0, 1.0,//left side middle
										0.0, 1.0, 1.0,//left side middle
										0.0, 1.0, 1.0,//right side middle
										0.0, 1.0, 1.0,//right side middle
										0.0, 1.0, 1.0,//right side middle
										0.0, 1.0, 1.0,//right side middle
										1.0, 1.0, 1.0,//right top side
										1.0, 1.0, 1.0,//right top side
										1.0, 1.0, 1.0,//right top side
										1.0, 1.0, 1.0,//right top side
										1.0, 1.0, 1.0,//left top side
										1.0, 1.0, 1.0,//left top side
										1.0, 1.0, 1.0,//left top side
										1.0, 1.0, 1.0,//left top side
										1.0, 1.0, 1.0,//bottom
										1.0, 1.0, 1.0,//bottom
										1.0, 1.0, 1.0,//bottom
										1.0, 1.0, 1.0 //bottom
										]);
	
	var TTexture=new Float32Array([
											0.0,0.0,//front top
											1.0,0.0,//front top
											1.0,1.0,//front top
											0.0,1.0,//front top
											0.0,0.0,//front middle
											1.0,0.0,//front middle
											1.0,1.0,//front middle
											0.0,1.0,//front middle
											0.0,0.0,//back top
											1.0,0.0,//back top
											1.0,1.0,//back top
											0.0,1.0,//back top
											0.0,0.0,//back middle
											1.0,0.0,//back middle
											1.0,1.0,//back middle
											0.0,1.0,//back middle
											0.0,0.0,//top
											1.0,0.0,//top
											1.0,1.0,//top
											0.0,1.0,//top
											0.0,0.0,//top bottom 
											1.0,0.0,//top bottom 
											1.0,1.0,//top bottom 
											0.0,1.0,//top bottom
											0.0,0.0,//left side middle
                                            1.0,0.0,//left side middle
                                            1.0,1.0,//left side middle
                                            0.0,1.0,//left side middle
											0.0,0.0,//right side middle
                                            1.0,0.0,//right side middle
                                            1.0,1.0,//right side middle
                                            0.0,1.0,//right side middle
											0.0,0.0,//top right side
                                            1.0,0.0,//top right side
                                            1.0,1.0,//top right side
                                            0.0,1.0,//top right side
											0.0,0.0,//top left side
                                            1.0,0.0,//top left side
                                            1.0,1.0,//top left side
                                            0.0,1.0,//top left side
											0.0,0.0,//bottom
                                            1.0,0.0,//bottom
                                            1.0,1.0,//bottom
                                            0.0,1.0 //bottom
										]);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,TCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,TcolorCoordinates,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_COLOR);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
	gl.bufferData(gl.ARRAY_BUFFER,TTexture,gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(AMC_WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,rectangle_texture);
	gl.uniform1i(msd_samplerUniform,0);
	gl.lineWidth(2.0);
	gl.bindVertexArray(msd_vao);
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	gl.drawArrays(gl.TRIANGLE_FAN,4,4);
	gl.drawArrays(gl.TRIANGLE_FAN,8,4);
	gl.drawArrays(gl.TRIANGLE_FAN,12,4);
	gl.drawArrays(gl.TRIANGLE_FAN,16,4);
	gl.drawArrays(gl.TRIANGLE_FAN,20,4);
	gl.drawArrays(gl.TRIANGLE_FAN,24,4);
	gl.drawArrays(gl.TRIANGLE_FAN,28,4);
	gl.drawArrays(gl.TRIANGLE_FAN,32,4);
	gl.drawArrays(gl.TRIANGLE_FAN,36,4);
	gl.drawArrays(gl.TRIANGLE_FAN,40,4);
	gl.bindVertexArray(null);
}
