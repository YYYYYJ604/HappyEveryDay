import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'shared/providers/theme_provider.dart';
import 'shared/providers/auth_provider.dart';

/// 应用根组件
class App extends ConsumerStatefulWidget {
  const App({super.key});

  @override
  ConsumerState<App> createState() => _AppState();
}

class _AppState extends ConsumerState<App> {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _router = AppRouter.create(ref);
    ref.listenManual(authProvider, (prev, next) {
      // if (next.status == AuthStatus.unauthenticated) {
      //   _router.go('/login');
      // }
      if (next.status == AuthStatus.authenticated) {
        _router.go('/home');
      } else if (next.status == AuthStatus.unauthenticated) {
        _router.go('/login');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeState = ref.watch(themeProvider);
    return MaterialApp.router(
      title: 'Happy Every Day',
      debugShowCheckedModeBanner: false,
      theme: themeState.theme,
      darkTheme: AppTheme.dark,
      themeMode: _resolveThemeMode(themeState.mode),
      routerConfig: _router,
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
