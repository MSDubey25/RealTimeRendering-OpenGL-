package com.astromedicomp.win_hello;

//added by user/developer
import androidx.appcompat.widget.AppCompatTextView;
import android.content.Context;
import android.view.Gravity;
import android.graphics.Color;

public class MyView extends AppCompatTextView
{
	public MyView(Context drawing)
	{
		super(drawing);
		setTextColor(Color.rgb(0,255,0));
		setTextSize(60);
		setGravity(Gravity.CENTER);
		setText("Hello World!!!");	
	}
}