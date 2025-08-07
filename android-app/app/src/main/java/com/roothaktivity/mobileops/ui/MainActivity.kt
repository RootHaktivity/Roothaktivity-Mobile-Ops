package com.roothaktivity.mobileops.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.compose.rememberNavController
import com.roothaktivity.mobileops.ui.navigation.RoothaktivityNavigation
import com.roothaktivity.mobileops.ui.theme.RoothaktivityTheme
import com.roothaktivity.mobileops.ui.auth.AuthViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    private val authViewModel: AuthViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Install splash screen
        installSplashScreen().apply {
            setKeepOnScreenCondition {
                authViewModel.isLoading.value
            }
        }
        
        setContent {
            RoothaktivityTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    RoothaktivityApp(authViewModel)
                }
            }
        }
    }
}

@Composable
fun RoothaktivityApp(authViewModel: AuthViewModel) {
    val navController = rememberNavController()
    val authState by authViewModel.authState.collectAsState()
    val isLoading by authViewModel.isLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        authViewModel.checkAuthStatus()
    }
    
    if (!isLoading) {
        RoothaktivityNavigation(
            navController = navController,
            isAuthenticated = authState.isAuthenticated,
            startDestination = if (authState.isAuthenticated) "dashboard" else "auth"
        )
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    RoothaktivityTheme {
        // Preview content here
    }
}