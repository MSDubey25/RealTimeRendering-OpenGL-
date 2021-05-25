package com.astromedicomp.win_viewasobj;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import androidx.appcompat.widget.AppCompatTextView;
import android.content.Context;
import android.view.Gravity;
import android.graphics.Color;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        AppCompatTextView myView=new AppCompatTextView(this);
	super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
	myView.setTextColor(Color.rgb(0,255,0));
	myView.setTextSize(60);
	myView.setGravity(Gravity.CENTER);
	myView.setText("Hello World");
    }
}
