import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';

enum AuthStatus { initial, authenticated, unauthenticated, loading }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? error;
  const AuthState({this.status = AuthStatus.initial, this.user, this.error});
  bool get isAuthenticated => status == AuthStatus.authenticated;
  AuthState copyWith({AuthStatus? status, UserModel? user, String? error}) =>
      AuthState(
        status: status ?? this.status,
        user: user ?? this.user,
        error: error,
      );
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState());

  void setAuthenticated(UserModel user) {
    state = state.copyWith(status: AuthStatus.authenticated, user: user);
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      await Future.delayed(const Duration(seconds: 1));
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: const UserModel(id: '1', nickname: '用户'),
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: e.toString(),
      );
    }
  }

  Future<void> logout() async =>
      state = const AuthState(status: AuthStatus.unauthenticated);

  Future<void> checkAuth() async {
    state = state.copyWith(status: AuthStatus.unauthenticated);
  }
}
