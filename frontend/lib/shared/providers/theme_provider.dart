import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';

enum ThemeModeType { light, dark, system }

class ThemeState {
  final ThemeModeType mode;
  final ThemeData theme;
  ThemeState({this.mode = ThemeModeType.light, ThemeData? theme}) : theme = theme ?? AppTheme.light;
  ThemeModeType get opposite => mode == ThemeModeType.light ? ThemeModeType.dark : ThemeModeType.light;
}

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeState>((ref) => ThemeNotifier());

class ThemeNotifier extends StateNotifier<ThemeState> {
  ThemeNotifier() : super(ThemeState());
  void setTheme(ThemeModeType mode) => state = ThemeState(mode: mode, theme: mode == ThemeModeType.dark ? AppTheme.dark : AppTheme.light);
  void toggleTheme() => setTheme(state.opposite);
}