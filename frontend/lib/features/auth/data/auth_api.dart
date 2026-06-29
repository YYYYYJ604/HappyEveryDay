import 'package:dio/dio.dart';
import '../../../core/network/api_response.dart';
import '../../../core/constants/app_constants.dart';

class AuthApi {
  final Dio _dio;
  AuthApi(this._dio);

  /// POST /auth/login
  Future<ApiResponse<Map<String, dynamic>>> login(
    Map<String, dynamic> body,
  ) async {
    final resp = await _dio.post(ApiEndpoints.login, data: body);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// POST /auth/register
  Future<ApiResponse<Map<String, dynamic>>> register(
    Map<String, dynamic> body,
  ) async {
    final resp = await _dio.post(ApiEndpoints.register, data: body);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// POST /auth/refresh — 刷新 Token
  Future<ApiResponse<Map<String, dynamic>>> refreshToken(
    String refreshToken,
  ) async {
    final resp = await _dio.post(
      ApiEndpoints.refreshToken,
      data: {'refreshToken': refreshToken},
    );
    return ApiResponse.fromJson(resp.data, null);
  }

  /// POST /auth/sms/send
  Future<ApiResponse<Map<String, dynamic>>> sendVerificationCode(
    Map<String, dynamic> body,
  ) async {
    final resp = await _dio.post('/auth/code/send', data: body);
    return ApiResponse.fromJson(resp.data, null);
  }

  /// POST /auth/sms/verify
  Future<ApiResponse<Map<String, dynamic>>> verifySms(
    Map<String, dynamic> body,
  ) async {
    final resp = await _dio.post(ApiEndpoints.verifySms, data: body);
    return ApiResponse.fromJson(resp.data, null);
  }
}
