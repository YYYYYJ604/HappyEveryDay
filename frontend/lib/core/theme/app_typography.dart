import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTypography {
  static const String fontFamily = 'NotoSansSC';

  static const TextStyle displayLarge = TextStyle(fontFamily: fontFamily, fontSize: 34, fontWeight: FontWeight.w700, height: 1.2, color: AppColors.textPrimary);
  static const TextStyle displayMedium = TextStyle(fontFamily: fontFamily, fontSize: 28, fontWeight: FontWeight.w700, height: 1.3, color: AppColors.textPrimary);
  static const TextStyle displaySmall = TextStyle(fontFamily: fontFamily, fontSize: 24, fontWeight: FontWeight.w600, height: 1.3, color: AppColors.textPrimary);
  static const TextStyle headlineLarge = TextStyle(fontFamily: fontFamily, fontSize: 22, fontWeight: FontWeight.w600, height: 1.4, color: AppColors.textPrimary);
  static const TextStyle headlineMedium = TextStyle(fontFamily: fontFamily, fontSize: 20, fontWeight: FontWeight.w600, height: 1.4, color: AppColors.textPrimary);
  static const TextStyle headlineSmall = TextStyle(fontFamily: fontFamily, fontSize: 18, fontWeight: FontWeight.w600, height: 1.4, color: AppColors.textPrimary);
  static const TextStyle bodyLarge = TextStyle(fontFamily: fontFamily, fontSize: 16, fontWeight: FontWeight.w400, height: 1.6, color: AppColors.textPrimary);
  static const TextStyle bodyMedium = TextStyle(fontFamily: fontFamily, fontSize: 14, fontWeight: FontWeight.w400, height: 1.5, color: AppColors.textPrimary);
  static const TextStyle bodySmall = TextStyle(fontFamily: fontFamily, fontSize: 12, fontWeight: FontWeight.w400, height: 1.4, color: AppColors.textSecondary);
  static const TextStyle labelLarge = TextStyle(fontFamily: fontFamily, fontSize: 14, fontWeight: FontWeight.w500, height: 1.4, color: AppColors.textPrimary);
  static const TextStyle labelMedium = TextStyle(fontFamily: fontFamily, fontSize: 12, fontWeight: FontWeight.w500, height: 1.4, color: AppColors.textSecondary);
  static const TextStyle labelSmall = TextStyle(fontFamily: fontFamily, fontSize: 10, fontWeight: FontWeight.w500, height: 1.4, color: AppColors.textTertiary);
  static const TextStyle buttonLarge = TextStyle(fontFamily: fontFamily, fontSize: 16, fontWeight: FontWeight.w600, height: 1.4, color: Colors.white);
  static const TextStyle buttonMedium = TextStyle(fontFamily: fontFamily, fontSize: 14, fontWeight: FontWeight.w500, height: 1.4, color: Colors.white);

  static TextTheme get textTheme => const TextTheme(
    displayLarge: displayLarge, displayMedium: displayMedium, displaySmall: displaySmall,
    headlineLarge: headlineLarge, headlineMedium: headlineMedium, headlineSmall: headlineSmall,
    bodyLarge: bodyLarge, bodyMedium: bodyMedium, bodySmall: bodySmall,
    labelLarge: labelLarge, labelMedium: labelMedium, labelSmall: labelSmall,
  );
}
