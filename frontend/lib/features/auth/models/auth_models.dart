/// 登录请求
class LoginRequest {
  final String phone;
  final String password;
  const LoginRequest({required this.phone, required this.password});
  Map<String, dynamic> toJson() => {'phone': phone, 'password': password};
}

/// 注册请求
class RegisterRequest {
  final String phone;
  final String password;
  final String code;
  final String nickname;
  const RegisterRequest({required this.phone, required this.password, required this.code, required this.nickname});
  Map<String, dynamic> toJson() => {'phone': phone, 'password': password, 'code': code, 'nickname': nickname};
}

/// 短信验证码请求
class SmsRequest {
  final String phone;
  final String type;
  const SmsRequest({required this.phone, required this.type});
  Map<String, dynamic> toJson() => {'phone': phone, 'type': type};
}

/// Token 响应
class AuthTokenModel {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;

  const AuthTokenModel({required this.accessToken, required this.refreshToken, required this.expiresIn});

  factory AuthTokenModel.fromJson(Map<String, dynamic> json) => AuthTokenModel(
    accessToken: json['accessToken'] as String, refreshToken: json['refreshToken'] as String,
    expiresIn: json['expiresIn'] as int? ?? 3600,
  );
}
