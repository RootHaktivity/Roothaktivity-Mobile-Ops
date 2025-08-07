package com.roothaktivity.mobileops.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = CyberBlue,
    onPrimary = DarkBlack,
    primaryContainer = CyberBlueOverlay,
    onPrimaryContainer = CyberBlue,
    
    secondary = CyberPink,
    onSecondary = DarkBlack,
    secondaryContainer = CyberPinkOverlay,
    onSecondaryContainer = CyberPink,
    
    tertiary = CyberGreen,
    onTertiary = DarkBlack,
    tertiaryContainer = MatrixGreenDark,
    onTertiaryContainer = MatrixGreenLight,
    
    error = ErrorRed,
    onError = DarkBlack,
    errorContainer = Color(0xFF930006),
    onErrorContainer = Color(0xFFFFDAD4),
    
    background = DarkBlack,
    onBackground = CyberBlue,
    
    surface = DarkGray,
    onSurface = CyberBlue,
    surfaceVariant = MediumGray,
    onSurfaceVariant = NeonBlue,
    
    outline = LightGray,
    outlineVariant = MediumGray,
    
    scrim = BlackOverlay,
    
    inverseSurface = LightSurface,
    inverseOnSurface = DarkBlack,
    inversePrimary = CyberBlue,
    
    surfaceDim = SurfaceGray,
    surfaceBright = LightGray,
    surfaceContainerLowest = DarkBlack,
    surfaceContainerLow = DarkGray,
    surfaceContainer = MediumGray,
    surfaceContainerHigh = LightGray,
    surfaceContainerHighest = Color(0xFF3A3A3A)
)

private val LightColorScheme = lightColorScheme(
    primary = CyberBlue,
    onPrimary = DarkBlack,
    primaryContainer = Color(0xFFB3E5FC),
    onPrimaryContainer = Color(0xFF001E2B),
    
    secondary = CyberPink,
    onSecondary = DarkBlack,
    secondaryContainer = Color(0xFFFFE0F2),
    onSecondaryContainer = Color(0xFF2D001A),
    
    tertiary = MatrixGreenDark,
    onTertiary = DarkBlack,
    tertiaryContainer = Color(0xFFB8F5C4),
    onTertiaryContainer = Color(0xFF002106),
    
    error = Color(0xFFBA1A1A),
    onError = Color(0xFFFFFFFF),
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    
    background = Color(0xFFFAFCFF),
    onBackground = Color(0xFF001F25),
    
    surface = Color(0xFFFAFCFF),
    onSurface = Color(0xFF001F25),
    surfaceVariant = Color(0xFFDDE3EA),
    onSurfaceVariant = Color(0xFF41474D),
    
    outline = Color(0xFF71787E),
    outlineVariant = Color(0xFFC1C7CE),
    
    scrim = Color(0xFF000000),
    
    inverseSurface = Color(0xFF00363F),
    inverseOnSurface = Color(0xFFD6F6FF),
    inversePrimary = Color(0xFF5DDBFF)
)

@Composable
fun RoothaktivityTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    // We're forcing cyberpunk theme instead of dynamic colors
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        // Always use dark theme for cyberpunk aesthetic
        else -> DarkColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as androidx.activity.ComponentActivity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}