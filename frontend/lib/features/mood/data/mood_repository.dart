import '../../../core/network/api_response.dart';
import '../../../core/storage/cache_manager.dart';
import '../models/mood_models.dart';
import 'mood_api.dart';

/// 心情 Repository 接口
abstract class MoodRepository {
  Future<MoodRecordModel> create(CreateMoodRequest request);
  Future<PaginatedResponse<MoodRecordModel>> getHistory(MoodQueryParams params);
  Future<MoodRecordModel?> getLatest();
  Future<MoodMonthStatModel> getMonthlyStats(int year, int month);
}

/// 心情 Repository 实现
class MoodRepositoryImpl implements MoodRepository {
  final MoodApi _api;
  final CacheManager _cache;

  MoodRepositoryImpl(this._api, this._cache);

  @override
  Future<MoodRecordModel> create(CreateMoodRequest request) async {
    final resp = await _api.create(request.toJson());
    _cache.remove('mood_latest');
    return MoodRecordModel.fromJson(resp.data!);
  }

  @override
  Future<PaginatedResponse<MoodRecordModel>> getHistory(MoodQueryParams params) async {
    final resp = await _api.getHistory(params.toQuery());
    return PaginatedResponse.fromApiResponse(
      ApiResponse<List<dynamic>>(code: resp.code, message: resp.message, data: resp.data as List<dynamic>?, meta: resp.meta),
      (json) => MoodRecordModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<MoodRecordModel?> getLatest() async {
    if (_cache.has('mood_latest')) return _cache.get<MoodRecordModel>('mood_latest');
    final resp = await _api.getLatest();
    if (resp.data == null) return null;
    final model = MoodRecordModel.fromJson(resp.data!);
    _cache.set('mood_latest', model, ttl: Duration(minutes: 2));
    return model;
  }

  @override
  Future<MoodMonthStatModel> getMonthlyStats(int year, int month) async {
    final cacheKey = 'mood_stats_\_\';
    if (_cache.has(cacheKey)) return _cache.get<MoodMonthStatModel>(cacheKey)!;
    final resp = await _api.getMonthlyStats(year, month);
    final model = MoodMonthStatModel.fromJson(resp.data!);
    _cache.set(cacheKey, model, ttl: Duration(minutes: 5));
    return model;
  }
}
