import 'package:dio/dio.dart';
import '../../../core/network/api_response.dart';
import '../../../core/constants/app_constants.dart';

class InterestApi {
  final Dio _dio;
  InterestApi(this._dio);

  /// GET /interests
  Future<ApiResponse<List<dynamic>>> getAll() async {
    final resp = await _dio.get(ApiEndpoints.interests);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /interests/:id
  Future<ApiResponse<Map<String, dynamic>>> getById(String id) async {
    final resp = await _dio.get('${ApiEndpoints.interests}/$id');
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /interests/user/mine
  Future<ApiResponse<List<dynamic>>> getMyInterests() async {
    final resp = await _dio.get(ApiEndpoints.myInterests);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// POST /interests/user/select
  Future<ApiResponse<List<dynamic>>> select(Map<String, dynamic> body) async {
    final resp = await _dio.post(ApiEndpoints.selectInterests, data: body);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// DELETE /interests/user/:interestId
  Future<void> remove(String interestId) async {
    await _dio.delete('${ApiEndpoints.interests}/user/$interestId');
  }

  /// PUT /interests/user/:interestId/level
  Future<ApiResponse<Map<String, dynamic>>> updateLevel(
    String interestId,
    Map<String, dynamic> body,
  ) async {
    final resp = await _dio.put(
      '${ApiEndpoints.interests}/user/$interestId/level',
      data: body,
    );
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /interests/:interestId/tasks
  Future<ApiResponse<List<dynamic>>> getTasks(
    String interestId,
    Map<String, dynamic> query,
  ) async {
    final resp = await _dio.get(
      '${ApiEndpoints.interests}/$interestId/tasks',
      queryParameters: query,
    );
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /interests/tasks/recommended
  Future<ApiResponse<List<dynamic>>> getRecommendedTasks(
    Map<String, dynamic> query,
  ) async {
    final resp = await _dio.get(
      ApiEndpoints.interestTasks,
      queryParameters: query,
    );
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /interests/growth/mine
  Future<ApiResponse<List<dynamic>>> getGrowthRecords(
    Map<String, dynamic> query,
  ) async {
    final resp = await _dio.get(
      ApiEndpoints.interestGrowth,
      queryParameters: query,
    );
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /interests/growth/monthly-summary
  Future<ApiResponse<Map<String, dynamic>>> getMonthlySummary(
    int? year,
    int? month,
  ) async {
    final resp = await _dio.get(
      ApiEndpoints.interestMonthlySummary,
      queryParameters: {'year': ?year, 'month': ?month},
    );
    return ApiResponse.fromJson(resp.data, null);
  }
}
