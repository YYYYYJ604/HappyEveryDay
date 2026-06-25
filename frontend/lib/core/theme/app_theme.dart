import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';

class AppTheme {
  static ThemeData get light {
    final colorScheme = ColorScheme.light(
      primary: AppColors.primary, secondary: AppColors.secondary,
      surface: AppColors.surface, error: AppColors.error,
      onPrimary: AppColors.textOnPrimary, onSecondary: Colors.black,
      onSurface: AppColors.textPrimary, onError: Colors.white,
    );
    return ThemeData(
      useMaterial3: true, fontFamily: AppTypography.fontFamily, colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.background,
      appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0, backgroundColor: Colors.white, foregroundColor: AppColors.textPrimary, titleTextStyle: AppTypography.headlineSmall),
      cardTheme: CardTheme(elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border, width: 0.5)), color: Colors.white),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(backgroundColor: Colors.white, selectedItemColor: AppColors.primary, unselectedItemColor: AppColors.textTertiary, type: BottomNavigationBarType.fixed, elevation: 8),
      elevatedButtonTheme: ElevatedButtonThemeData(style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, elevation: 0, padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), textStyle: AppTypography.buttonLarge)),
      outlinedButtonTheme: OutlinedButtonThemeData(style: OutlinedButton.styleFrom(foregroundColor: AppColors.primary, side: const BorderSide(color: AppColors.primary), padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), textStyle: AppTypography.buttonMedium)),
      inputDecorationTheme: InputDecorationTheme(filled: true, fillColor: AppColors.background, contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)), focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)), hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textTertiary)),
      dividerTheme: const DividerThemeData(color: AppColors.divider, thickness: 1, space: 1),
      chipTheme: ChipThemeData(backgroundColor: AppColors.background, selectedColor: AppColors.primary.withOpacity(0.15), labelStyle: AppTypography.labelMedium, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppColors.border))),
      snackBarTheme: SnackBarThemeData(behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
    );
  }

  static ThemeData get dark {
    final colorScheme = ColorScheme.dark(
      primary: AppColors.primary, secondary: AppColors.secondary,
      surface: AppColors.darkSurface, error: AppColors.error,
      onPrimary: Colors.white, onSecondary: Colors.black,
      onSurface: AppColors.darkTextPrimary, onError: Colors.white,
    );
    return ThemeData(
      useMaterial3: true, fontFamily: AppTypography.fontFamily, colorScheme: colorScheme,
      brightness: Brightness.dark, scaffoldBackgroundColor: AppColors.darkBackground,
      appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0, backgroundColor: AppColors.darkSurface, foregroundColor: AppColors.darkTextPrimary),
      cardTheme: CardTheme(elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.darkBorder, width: 0.5)), color: AppColors.darkSurface),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(backgroundColor: AppColors.darkSurface, selectedItemColor: AppColors.primary, unselectedItemColor: AppColors.textTertiary, type: BottomNavigationBarType.fixed, elevation: 8),
      dividerTheme: const DividerThemeData(color: AppColors.darkBorder, thickness: 1),
    );
  }
}
