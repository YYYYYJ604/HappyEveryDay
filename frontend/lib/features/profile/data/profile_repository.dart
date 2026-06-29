import '../../../core/storage/cache_manager.dart';
import '../models/profile_models.dart';
import 'profile_api.dart';

abstract class ProfileRepository {
  Future<ProfileModel> getById(String id);
  Future<ProfileModel> updateProfile(String id, UpdateProfileRequest request);
}

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileApi _api;
  final CacheManager _cache;
  ProfileRepositoryImpl(this._api, this._cache);

  @override
  Future<ProfileModel> getById(String id) async {
    final cacheKey = 'profile_$id';
    if (_cache.has(cacheKey)) return _cache.get<ProfileModel>(cacheKey)!;
    final resp = await _api.getById(id);
    final model = ProfileModel.fromJson(resp.data!);
    _cache.set(cacheKey, model, ttl: Duration(minutes: 2));
    return model;
  }

  @override
  Future<ProfileModel> updateProfile(String id, UpdateProfileRequest request) async {
    final resp = await _api.updateProfile(id, request.toJson());
    _cache.remove('profile_$id');
    return ProfileModel.fromJson(resp.data!);
  }
}
