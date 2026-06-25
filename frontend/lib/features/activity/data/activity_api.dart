import "package:dio/dio.dart'';
import "../../../core/network/api_response.dart'';
import "../../../core/constants/app_constants.dart'';
import "../models/activity_models.dart";

class ActivityApi {
  final Dio _dio;
  ActivityApi(this._dio);

  /// GET /activities
  Future<ApiResponse<List<dynamic>>> getAll(Map<String, dynamic> query) async {
    final resp = await _dio.get(ApiEndpoints.activities, queryParameters: query);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /activities/:id
  Future<ApiResponse<Map<String, dynamic>>> getById(String id) async {
    final resp = await _dio.get('${ApiEndpoints.activities}/${id}');
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /activities/interest/:interestId
  Future<ApiResponse<List<dynamic>>> getByInterest(String interestId, Map<String, dynamic> query) async {
    final resp = await _dio.get('${ApiEndpoints.activities}/interest/${interestId}', queryParameters: query);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// POST /activities/:id/checkin
  Future<ApiResponse<Map<String, dynamic>>> startCheckin(String id) async {
    final resp = await _dio.post('${ApiEndpoints.activities}/${id}/checkin');
    return ApiResponse.fromJson(resp.data, null);
  }

  /// PUT /activities/:id/checkin
  Future<ApiResponse<Map<String, dynamic>>> completeCheckin(String id, Map<String, dynamic> body) async {
    final resp = await _dio.put('${ApiEndpoints.activities}/${id}/checkin', data: body);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /activities/checkins/mine
  Future<ApiResponse<List<dynamic>>> getMyCheckins(Map<String, dynamic> query) async {
    final resp = await _dio.get('${ApiEndpoints.activities}/checkins/mine', queryParameters: query);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// POST /activities/:id/bookmark
  Future<ApiResponse<Map<String, dynamic>>> bookmark(String id, Map<String, dynamic>? body) async {
    final resp = await _dio.post('${ApiEndpoints.activities}/${id}/bookmark', data: body);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// DELETE /activities/:id/bookmark
  Future<void> unbookmark(String id) async {
    await _dio.delete('${ApiEndpoints.activities}/${id}/bookmark');
  }

  /// GET /activities/bookmarks/mine
  Future<ApiResponse<List<dynamic>>> getMyBookmarks(Map<String, dynamic> query) async {
    final resp = await _dio.get('${ApiEndpoints.activities}/bookmarks/mine', queryParameters: query);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /activities/:id/bookmark-status
  Future<ApiResponse<Map<String, dynamic>>> getBookmarkStatus(String id) async {
    final resp = await _dio.get('${ApiEndpoints.activities}/${id}/bookmark-status');
    return ApiResponse.fromJson(resp.data, null);
  }
}
