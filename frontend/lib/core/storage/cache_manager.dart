class CacheManager {
  static CacheManager? _instance;
  final Map<String, _Entry> _cache = {};
  CacheManager._();
  static CacheManager get instance { _instance ??= CacheManager._(); return _instance!; }
  void set(String key, dynamic value, {Duration ttl = const Duration(minutes: 5)}) { _cache[key] = _Entry(data: value, expiresAt: DateTime.now().add(ttl)); }
  T? get<T>(String key) { final e = _cache[key]; if (e == null || DateTime.now().isAfter(e.expiresAt)) { _cache.remove(key); return null; } return e.data as T; }
  bool has(String key) { final e = _cache[key]; if (e == null) return false; if (DateTime.now().isAfter(e.expiresAt)) { _cache.remove(key); return false; } return true; }
  void remove(String key) => _cache.remove(key);
  void clear() => _cache.clear();
}

class _Entry { final dynamic data; final DateTime expiresAt; _Entry({required this.data, required this.expiresAt}); }
