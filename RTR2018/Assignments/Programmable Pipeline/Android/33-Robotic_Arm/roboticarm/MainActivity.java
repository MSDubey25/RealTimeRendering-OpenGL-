package com.astromedicomp.roboticarm;
//default given packages
import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;

//added by user/developer
import android.view.Window;
import android.view.View;
import android.view.WindowManager;
import android.content.pm.ActivityInfo;
import android.graphics.Color;

public class MainActivity extends AppCompatActivity {

    private GLESView glesView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
       // setContentView(R.layout.activity_main);
	//get rid of title bar
	//this.requestWindowFeature(Window.FEATURE_NO_TITLE);
	this.getSupportActionBar().hide();
	//to hide navigationBar
	this.getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
	//make fullscreen
	this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);
	//forced landscape orientation
	this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
	//set background color
	this.getWindow().getDecorView().setBackgroundColor(Color.BLACK);
	//define our own view
	glesView=new GLESView(this);
	//set this view as our main view
	setContentView(glesView);
	
    }
    @Override
    protected void onPause()
    {
	super.onPause();
    }
    @Override
    protected void onResume()
    {
	super.onResume();
    }
}
