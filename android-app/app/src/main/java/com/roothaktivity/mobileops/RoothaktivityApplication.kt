package com.roothaktivity.mobileops

import android.app.Application
import android.util.Log
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class RoothaktivityApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        Log.d("RoothaktivityApp", "Application started")
        
        // Initialize any global configurations here
        initializeApp()
    }
    
    private fun initializeApp() {
        // Initialize crash reporting, analytics, etc.
        // This is where you'd initialize Firebase, Crashlytics, etc.
    }
}