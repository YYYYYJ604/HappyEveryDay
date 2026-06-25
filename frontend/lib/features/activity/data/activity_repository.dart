import '../../../core/network/api_response.dart';
import '../../../core/storage/cache_manager.dart';
import '../models/activity_models.dart';
import 'activity_api.dart';

abstract class ActivityRepository {
  Future<PaginatedResponse<ActivityModel>> getAll(ActivityQueryParams params);
  Future<ActivityModel> getById(String id);
  Future<PaginatedResponse<ActivityModel>> getByInterest(String interestId, ActivityQueryParams params);
  Future<CheckinModel> startCheckin(String activityId);
  Future<CheckinModel> completeCheckin(String activityId, CreateCheckinRequest request);
  Future<PaginatedResponse<CheckinModel>> getMyCheckins(CheckinQueryParams params);
  Future<BookmarkModel> bookmark(String activityId, BookmarkRequest? request);
  Future<void> unbookmark(String activityId);
  Future<PaginatedResponse<BookmarkModel>> getMyBookmarks(CheckinQueryParams params);
  Future<BookmarkStatus> getBookmarkStatus(String activityId);
}

class ActivityRepositoryImpl implements ActivityRepository {
  final ActivityApi _api;
  final CacheManager _cache;
  ActivityRepositoryImpl(this._api, this._cache);

  @override
  Future<PaginatedResponse<ActivityModel>> getAll(ActivityQueryParams params) async {
    final resp = await _api.getAll(params.toQuery());
    return PaginatedResponse.fromApiResponse(
      ApiResponse<List<dynamic>>(code: resp.code, message: resp.message, data: resp.data as List<dynamic>?, meta: resp.meta),
      (json) => ActivityModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<ActivityModel> getById(String id) async {
    final resp = await _api.getById(id);
    return ActivityModel.fromJson(resp.data!);
  }

  @override
  Future<PaginatedResponse<ActivityModel>> getByInterest(String interestId, ActivityQueryParams params) async {
    final resp = await _api.getByInterest(interestId, params.toQuery());
    return PaginatedResponse.fromApiResponse(
      ApiResponse<List<dynamic>>(code: resp.code, message: resp.message, data: resp.data as List<dynamic>?, meta: resp.meta),
      (json) => ActivityModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<CheckinModel> startCheckin(String activityId) async {
    final resp = await _api.startCheckin(activityId);
    return CheckinModel.fromJson(resp.data!);
  }

  @override
  Future<CheckinModel> completeCheckin(String activityId, CreateCheckinRequest request) async {
    final resp = await _api.completeCheckin(activityId, request.toJson());
    return CheckinModel.fromJson(resp.data!);
  }

  @override
  Future<PaginatedResponse<CheckinModel>> getMyCheckins(CheckinQueryParams params) async {
    final resp = await _api.getMyCheckins(params.toQuery());
    return PaginatedResponse.fromApiResponse(
      ApiResponse<List<dynamic>>(code: resp.code, message: resp.message, data: resp.data as List<dynamic>?, meta: resp.meta),
      (json) => CheckinModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BookmarkModel> bookmark(String activityId, BookmarkRequest? request) async {
    final resp = await _api.bookmark(activityId, request?.toJson());
    return BookmarkModel.fromJson(resp.data!);
  }

  @override
  Future<void> unbookmark(String activityId) async {
    await _api.unbookmark(activityId);
  }

  @override
  Future<PaginatedResponse<BookmarkModel>> getMyBookmarks(CheckinQueryParams params) async {
    final resp = await _api.getMyBookmarks(params.toQuery());
    return PaginatedResponse.fromApiResponse(
      ApiResponse<List<dynamic>>(code: resp.code, message: resp.message, data: resp.data as List<dynamic>?, meta: resp.meta),
      (json) => BookmarkModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BookmarkStatus> getBookmarkStatus(String activityId) async {
    final resp = await _api.getBookmarkStatus(activityId);
    return BookmarkStatus.fromJson(resp.data!);
  }
}
