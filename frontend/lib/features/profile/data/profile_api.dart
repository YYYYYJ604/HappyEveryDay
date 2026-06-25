import "package:dio/dio.dart'';
import "../../../core/network/api_response.dart'';
import "../models/profile_models.dart";

class ProfileApi {
  final Dio _dio;
  ProfileApi(this._dio);

  static const String _users = "/users";

  /// GET /users/:id
  Future<ApiResponse<Map<String, dynamic>>> getById(String id) async {
    final resp = await _dio.get('${_users}/${id}');
    return ApiResponse.fromJson(resp.data, null);
  }

  /// PUT /users/:id/profile
  Future<ApiResponse<Map<String, dynamic>>> updateProfile(String id, Map<String, dynamic> body) async {
    final resp = await _dio.put('${_users}/${id}/profile', data: body);
    return ApiResponse.fromJson(resp.data, null);
  }
}
