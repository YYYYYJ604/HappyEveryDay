import 'package:dio/dio.dart';
import '../../../core/network/api_response.dart';
import '../../../core/constants/app_constants.dart';

class MoodApi {
  final Dio _dio;
  MoodApi(this._dio);

  /// POST /moods — 记录心情
  Future<ApiResponse<Map<String, dynamic>>> create(
    Map<String, dynamic> body,
  ) async {
    final resp = await _dio.post(ApiEndpoints.moods, data: body);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /moods — 查询心情历史
  Future<ApiResponse<List<dynamic>>> getHistory(
    Map<String, dynamic> query,
  ) async {
    final resp = await _dio.get(ApiEndpoints.moods, queryParameters: query);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /moods/latest — 获取最新心情
  Future<ApiResponse<Map<String, dynamic>?>> getLatest() async {
    final resp = await _dio.get('/latest');
    return ApiResponse.fromJson(resp.data, null);
  }

  /// GET /moods/stats/monthly — 月度统计
  Future<ApiResponse<Map<String, dynamic>>> getMonthlyStats(
    int year,
    int month,
  ) async {
    final resp = await _dio.get(
      '',
      queryParameters: {'year': year, 'month': month},
    );
    return ApiResponse.fromJson(resp.data, null);
  }
}
