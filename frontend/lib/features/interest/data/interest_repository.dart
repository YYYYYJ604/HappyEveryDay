import '../../../core/network/api_response.dart';
import '../../../core/storage/cache_manager.dart';
import '../models/interest_models.dart';
import 'interest_api.dart';

abstract class InterestRepository {
  Future<List<InterestModel>> getAll();
  Future<InterestModel> getById(String id);
  Future<List<UserInterestModel>> getMyInterests();
  Future<List<UserInterestModel>> select(SelectInterestRequest request);
  Future<void> remove(String interestId);
  Future<UserInterestModel> updateLevel(String interestId, UpdateInterestLevelRequest request);
  Future<PaginatedResponse<InterestTaskModel>> getTasks(String interestId, InterestTaskQueryParams params);
  Future<PaginatedResponse<InterestTaskModel>> getRecommendedTasks(InterestTaskQueryParams params);
  Future<List<InterestGrowthModel>> getGrowthRecords(InterestGrowthQueryParams params);
  Future<InterestMonthlySummaryModel> getMonthlySummary({int? year, int? month});
}

class InterestRepositoryImpl implements InterestRepository {
  final InterestApi _api;
  final CacheManager _cache;
  InterestRepositoryImpl(this._api, this._cache);

  @override
  Future<List<InterestModel>> getAll() async {
    const key = 'interests_all';
    if (_cache.has(key)) return _cache.get<List<InterestModel>>(key)!;
    final resp = await _api.getAll();
    final items = (resp.data as List<dynamic>?)?.map((e) => InterestModel.fromJson(e as Map<String, dynamic>)).toList() ?? [];
    _cache.set(key, items, ttl: Duration(hours: 1));
    return items;
  }

  @override
  Future<InterestModel> getById(String id) async {
    final resp = await _api.getById(id);
    return InterestModel.fromJson(resp.data!);
  }

  @override
  Future<List<UserInterestModel>> getMyInterests() async {
    const key = 'interests_mine';
    if (_cache.has(key)) return _cache.get<List<UserInterestModel>>(key)!;
    final resp = await _api.getMyInterests();
    final items = (resp.data as List<dynamic>?)?.map((e) => UserInterestModel.fromJson(e as Map<String, dynamic>)).toList() ?? [];
    _cache.set(key, items, ttl: Duration(minutes: 2));
    return items;
  }

  @override
  Future<List<UserInterestModel>> select(SelectInterestRequest request) async {
    final resp = await _api.select(request.toJson());
    _cache.remove('interests_mine');
    return (resp.data as List<dynamic>?)?.map((e) => UserInterestModel.fromJson(e as Map<String, dynamic>)).toList() ?? [];
  }

  @override
  Future<void> remove(String interestId) async {
    await _api.remove(interestId);
    _cache.remove('interests_mine');
  }

  @override
  Future<UserInterestModel> updateLevel(String interestId, UpdateInterestLevelRequest request) async {
    final resp = await _api.updateLevel(interestId, request.toJson());
    _cache.remove('interests_mine');
    return UserInterestModel.fromJson(resp.data!);
  }

  @override
  Future<PaginatedResponse<InterestTaskModel>> getTasks(String interestId, InterestTaskQueryParams params) async {
    final resp = await _api.getTasks(interestId, params.toQuery());
    return PaginatedResponse.fromApiResponse(
      ApiResponse<List<dynamic>>(code: resp.code, message: resp.message, data: resp.data as List<dynamic>?, meta: resp.meta),
      (json) => InterestTaskModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<PaginatedResponse<InterestTaskModel>> getRecommendedTasks(InterestTaskQueryParams params) async {
    final resp = await _api.getRecommendedTasks(params.toQuery());
    return PaginatedResponse.fromApiResponse(
      ApiResponse<List<dynamic>>(code: resp.code, message: resp.message, data: resp.data as List<dynamic>?, meta: resp.meta),
      (json) => InterestTaskModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<List<InterestGrowthModel>> getGrowthRecords(InterestGrowthQueryParams params) async {
    final resp = await _api.getGrowthRecords(params.toQuery());
    return (resp.data as List<dynamic>?)?.map((e) => InterestGrowthModel.fromJson(e as Map<String, dynamic>)).toList() ?? [];
  }

  @override
  Future<InterestMonthlySummaryModel> getMonthlySummary({int? year, int? month}) async {
    final cacheKey = 'interest_summary_\_\';
    if (_cache.has(cacheKey)) return _cache.get<InterestMonthlySummaryModel>(cacheKey)!;
    final resp = await _api.getMonthlySummary(year, month);
    final model = InterestMonthlySummaryModel.fromJson(resp.data!);
    _cache.set(cacheKey, model, ttl: Duration(minutes: 5));
    return model;
  }
}
