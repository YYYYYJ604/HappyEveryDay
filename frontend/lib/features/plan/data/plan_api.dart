import 'package:dio/dio.dart';
import '../../../core/network/api_response.dart';
import '../../../core/constants/app_constants.dart';

class PlanApi {
  final Dio _dio;
  PlanApi(this._dio);

  /// POST /daily-plans/generate
  Future<ApiResponse<Map<String, dynamic>>> generate(
    Map<String, dynamic> body,
  ) async {
    final resp = await _dio.post(ApiEndpoints.dailyPlanGenerate, data: body);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /daily-plans/today
  Future<ApiResponse<List<dynamic>>> getToday() async {
    final resp = await _dio.get(ApiEndpoints.dailyPlanToday);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /daily-plans/today/progress
  Future<ApiResponse<Map<String, dynamic>>> getTodayProgress() async {
    final resp = await _dio.get('${ApiEndpoints.dailyPlanToday}/progress');
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /daily-plans/:date
  Future<ApiResponse<List<dynamic>>> getByDate(String date) async {
    final resp = await _dio.get('${ApiEndpoints.dailyPlans}/$date');
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /daily-plans/history
  Future<ApiResponse<List<dynamic>>> getHistory(
    Map<String, dynamic> query,
  ) async {
    final resp = await _dio.get(
      '${ApiEndpoints.dailyPlans}/history',
      queryParameters: query,
    );
    return ApiResponse.fromJson(resp.data, null);
  }

  /// PUT /daily-plans/:id/complete
  Future<ApiResponse<Map<String, dynamic>>> complete(String id) async {
    final resp = await _dio.put('${ApiEndpoints.dailyPlans}/$id/complete');
    return ApiResponse.fromJson(resp.data, null);
  }

  /// PUT /daily-plans/:id/skip
  Future<ApiResponse<Map<String, dynamic>>> skip(String id) async {
    final resp = await _dio.put('${ApiEndpoints.dailyPlans}/$id/skip');
    return ApiResponse.fromJson(resp.data, null);
  }
}
