/// 登录请求
class LoginRequest {
  final String email;
  final String password;
  const LoginRequest({required this.email, required this.password});
  Map<String, dynamic> toJson() => {'email': email, 'password': password};
}

/// 注册请求
class RegisterRequest {
  final String email;
  final String password;
  final String code;
  final String nickname;
  const RegisterRequest({
    required this.email,
    required this.password,
    required this.code,
    required this.nickname,
  });
  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
    'code': code,
    'nickname': nickname,
  };
}

/// Token 响应
class AuthTokenModel {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;

  const AuthTokenModel({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
  });

  factory AuthTokenModel.fromJson(Map<String, dynamic> json) => AuthTokenModel(
    accessToken: json['accessToken'] as String,
    refreshToken: json['refreshToken'] as String,
    expiresIn: json['expiresIn'] as int? ?? 3600,
  );
}
