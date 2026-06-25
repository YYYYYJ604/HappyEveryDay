import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'shared/providers/theme_provider.dart';
import 'shared/providers/auth_provider.dart';

/// 应用根组件
class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeState = ref.watch(themeProvider);
    final router = AppRouter.create(ref);

    ref.listen(authProvider, (prev, next) {
      if (next.status == AuthStatus.unauthenticated) {
        router.go('/login');
      }
    });

    return MaterialApp.router(
      title: 'Happy Every Day',
      debugShowCheckedModeBanner: false,
      theme: themeState.theme,
      darkTheme: AppTheme.dark,
      themeMode: _resolveThemeMode(themeState.mode),
      routerConfig: router,
    );
  }

  ThemeMode _resolveThemeMode(ThemeModeType mode) {
    switch (mode) {
      case ThemeModeType.light:
        return ThemeMode.light;
      case ThemeModeType.dark:
        return ThemeMode.dark;
      case ThemeModeType.system:
        return ThemeMode.system;
    }
  }
}
