class SecureStorage {
  static SecureStorage? _instance;
  SecureStorage._();
  static SecureStorage get instance { _instance ??= SecureStorage._(); return _instance!; }
  Future<void> saveAccessToken(String token) async {}
  Future<String?> readAccessToken() async => null;
  Future<void> saveRefreshToken(String token) async {}
  Future<String?> readRefreshToken() async => null;
  Future<void> clearTokens() async {}
  Future<void> clearAll() async {}
}
