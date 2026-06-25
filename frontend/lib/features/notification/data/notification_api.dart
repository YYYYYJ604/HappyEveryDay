import 'package:dio/dio.dart';
import '../../../core/network/api_response.dart';
import '../../../core/constants/app_constants.dart';

class NotificationApi {
  final Dio _dio;
  NotificationApi(this._dio);

  Future<ApiResponse<List<dynamic>>> getAll(Map<String, dynamic> query) async {
    final resp = await _dio.get(ApiEndpoints.notifications, queryParameters: query);
    return ApiResponse.fromJson(resp.data, null);
  }

  Future<ApiResponse<Map<String, dynamic>>> getUnreadCount() async {
    final resp = await _dio.get(ApiEndpoints.notificationCount);
    return ApiResponse.fromJson(resp.data, null);
  }
}
