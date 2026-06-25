import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/providers/auth_provider.dart';

class RouteNames {
  static const String splash = 'splash';
  static const String login = 'login';
  static const String register = 'register';
  static const String home = 'home';
  static const String planList = 'plan-list';
  static const String planDetail = 'plan-detail';
  static const String moodCheckin = 'mood-checkin';
  static const String moodHistory = 'mood-history';
  static const String discovery = 'discovery';
  static const String profile = 'profile';
  static const String settings = 'settings';
  static const String notifications = 'notifications';
}

class AppRouter {
  static final _rootNavKey = GlobalKey<NavigatorState>();
  static final _shellNavKey = GlobalKey<NavigatorState>();

  static GoRouter create(Ref ref) {
    return GoRouter(
      navigatorKey: _rootNavKey,
      initialLocation: '/',
      redirect: (context, state) {
        final authenticated = ref.read(authProvider).isAuthenticated;
        final onAuthPage = state.matchedLocation == '/login';
        if (!authenticated && !onAuthPage && state.matchedLocation != '/') return '/login';
        if (authenticated && onAuthPage) return '/home';
        return null;
      },
      routes: [
        GoRoute(path: '/', name: RouteNames.splash, builder: (_, __) => const _Placeholder('Splash')),
        GoRoute(path: '/login', name: RouteNames.login, builder: (_, __) => const _Placeholder('Login')),
        GoRoute(path: '/register', name: RouteNames.register, builder: (_, __) => const _Placeholder('Register')),
        ShellRoute(
          navigatorKey: _shellNavKey,
          builder: (_, __, child) => _Shell(child: child),
          routes: [
            GoRoute(path: '/home', name: RouteNames.home, builder: (_, __) => const _Placeholder('Home')),
            GoRoute(path: '/home/plan', name: RouteNames.planList, builder: (_, __) => const _Placeholder('Plans')),
            GoRoute(path: '/home/mood', name: RouteNames.moodCheckin, builder: (_, __) => const _Placeholder('Mood')),
            GoRoute(path: '/home/discovery', name: RouteNames.discovery, builder: (_, __) => const _Placeholder('Discover')),
            GoRoute(path: '/home/profile', name: RouteNames.profile, builder: (_, __) => const _Placeholder('Profile')),
          ],
        ),
        GoRoute(path: '/plan/detail/:id', name: RouteNames.planDetail, builder: (_, __) => const _Placeholder('Plan Detail')),
        GoRoute(path: '/mood/history', name: RouteNames.moodHistory, builder: (_, __) => const _Placeholder('Mood History')),
        GoRoute(path: '/settings', name: RouteNames.settings, builder: (_, __) => const _Placeholder('Settings')),
        GoRoute(path: '/notifications', name: RouteNames.notifications, builder: (_, __) => const _Placeholder('Notifications')),
      ],
    );
  }
}

class _Shell extends StatelessWidget {
  final Widget child;
  const _Shell({required this.child});
  @override
  Widget build(BuildContext context) => Scaffold(
    body: child,
    bottomNavigationBar: BottomNavigationBar(
      currentIndex: _index(context),
      onTap: (i) => GoRouter.of(context).go(['/home', '/home/plan', '/home/mood', '/home/discovery', '/home/profile'][i]),
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: '首页'),
        BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: '计划'),
        BottomNavigationBarItem(icon: Icon(Icons.emoji_emotions_outlined), label: '心情'),
        BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), label: '发现'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: '我的'),
      ],
    ),
  );
  int _index(BuildContext c) {
    final loc = GoRouterState.of(c).matchedLocation;
    if (loc.startsWith('/home/plan')) return 1;
    if (loc.startsWith('/home/mood')) return 2;
    if (loc.startsWith('/home/discovery')) return 3;
    if (loc.startsWith('/home/profile')) return 4;
    return 0;
  }
}

class _Placeholder extends StatelessWidget {
  final String title;
  const _Placeholder(this.title);
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: Text(title)), body: Center(child: Text('\n开发中...', textAlign: TextAlign.center)));
}
