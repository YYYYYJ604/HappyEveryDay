import '../../../core/network/api_response.dart';
import '../../../core/storage/cache_manager.dart';
import '../models/plan_models.dart';
import 'plan_api.dart';

abstract class PlanRepository {
  Future<GeneratePlanResponse> generate(GeneratePlanRequest request);
  Future<List<PlanItemModel>> getToday();
  Future<TodayProgressModel> getTodayProgress();
  Future<List<PlanItemModel>> getByDate(String date);
  Future<PaginatedResponse<PlanItemModel>> getHistory(PlanQueryParams params);
  Future<PlanItemModel> complete(String id);
  Future<PlanItemModel> skip(String id);
}

class PlanRepositoryImpl implements PlanRepository {
  final PlanApi _api;
  final CacheManager _cache;
  PlanRepositoryImpl(this._api, this._cache);

  @override
  Future<GeneratePlanResponse> generate(GeneratePlanRequest request) async {
    final resp = await _api.generate(request.toJson());
    _cache.remove('plan_today');
    return GeneratePlanResponse.fromJson(resp.data!);
  }

  @override
  Future<List<PlanItemModel>> getToday() async {
    const cacheKey = 'plan_today';
    if (_cache.has(cacheKey)) return _cache.get<List<PlanItemModel>>(cacheKey)!;
    final resp = await _api.getToday();
    final items = (resp.data as List<dynamic>?)?.map((e) => PlanItemModel.fromJson(e as Map<String, dynamic>)).toList() ?? [];
    _cache.set(cacheKey, items, ttl: Duration(minutes: 1));
    return items;
  }

  @override
  Future<TodayProgressModel> getTodayProgress() async {
    final resp = await _api.getTodayProgress();
    return TodayProgressModel.fromJson(resp.data!);
  }

  @override
  Future<List<PlanItemModel>> getByDate(String date) async {
    final resp = await _api.getByDate(date);
    return (resp.data as List<dynamic>?)?.map((e) => PlanItemModel.fromJson(e as Map<String, dynamic>)).toList() ?? [];
  }

  @override
  Future<PaginatedResponse<PlanItemModel>> getHistory(PlanQueryParams params) async {
    final resp = await _api.getHistory(params.toQuery());
    return PaginatedResponse.fromApiResponse(
      ApiResponse<List<dynamic>>(code: resp.code, message: resp.message, data: resp.data as List<dynamic>?, meta: resp.meta),
      (json) => PlanItemModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<PlanItemModel> complete(String id) async {
    final resp = await _api.complete(id);
    _cache.remove('plan_today');
    return PlanItemModel.fromJson(resp.data!);
  }

  @override
  Future<PlanItemModel> skip(String id) async {
    final resp = await _api.skip(id);
    _cache.remove('plan_today');
    return PlanItemModel.fromJson(resp.data!);
  }
}
