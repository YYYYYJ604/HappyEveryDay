import '../../../core/storage/secure_storage.dart';
import '../models/auth_models.dart';
import 'auth_api.dart';

abstract class AuthRepository {
  Future<AuthTokenModel> login(LoginRequest request);
  Future<AuthTokenModel> register(RegisterRequest request);
  Future<AuthTokenModel> refreshToken();
  Future<void> sendSms(String phone, String type);
  Future<bool> verifySms(String phone, String code);
  Future<void> logout();
  Future<bool> hasToken();
}

class AuthRepositoryImpl implements AuthRepository {
  final AuthApi _api;
  final SecureStorage _storage;
  AuthRepositoryImpl(this._api, this._storage);

  @override
  Future<AuthTokenModel> login(LoginRequest request) async {
    final resp = await _api.login(request.toJson());
    final token = AuthTokenModel.fromJson(resp.data!);
    await _storage.saveAccessToken(token.accessToken);
    await _storage.saveRefreshToken(token.refreshToken);
    return token;
  }

  @override
  Future<AuthTokenModel> register(RegisterRequest request) async {
    final resp = await _api.register(request.toJson());
    final token = AuthTokenModel.fromJson(resp.data as Map<String, dynamic>);
    await _storage.saveAccessToken(token.accessToken);
    await _storage.saveRefreshToken(token.refreshToken);
    return token;
  }

  @override
  Future<AuthTokenModel> refreshToken() async {
    final saved = await _storage.readRefreshToken();
    if (saved == null) throw Exception('No refresh token');
    final resp = await _api.refreshToken(saved);
    final token = AuthTokenModel.fromJson(resp.data!);
    await _storage.saveAccessToken(token.accessToken);
    await _storage.saveRefreshToken(token.refreshToken);
    return token;
  }

  @override
  Future<void> sendSms(String email, String type) async {
    await _api.sendVerificationCode({'email': email, 'type': type});
  }

  @override
  Future<bool> verifySms(String email, String code) async {
    final resp = await _api.verifySms({'email': email, 'code': code});
    return resp.isSuccess;
  }

  @override
  Future<void> logout() async {
    await _storage.clearTokens();
  }

  @override
  Future<bool> hasToken() async {
    final token = await _storage.readAccessToken();
    return token != null && token.isNotEmpty;
  }
}
