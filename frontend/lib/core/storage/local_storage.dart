class LocalStorage {
  static LocalStorage? _instance;
  LocalStorage._();
  static LocalStorage get instance { _instance ??= LocalStorage._(); return _instance!; }
  Future<void> init() async {}
  Future<void> setString(String key, String value) async {}
  String? getString(String key) => null;
  Future<void> setBool(String key, bool value) async {}
  bool? getBool(String key) => null;
  Future<void> setInt(String key, int value) async {}
  int? getInt(String key) => null;
  Future<void> remove(String key) async {}
  Future<void> clear() async {}
}
