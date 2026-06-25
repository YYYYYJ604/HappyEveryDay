import 'package:dio/dio.dart';
import '../../core/config/app_config.dart';

/// API 异常基类
class ApiException extends DioException {
  final String? businessCode;
  final String? businessMessage;

  ApiException({
    required super.requestOptions, super.response, super.error,
    super.type = DioExceptionType.unknown,
    this.businessCode, this.businessMessage, String? message,
  }) : super(message: message);

  int get httpStatusCode => response?.statusCode ?? 0;
  bool get isServerError => httpStatusCode >= 500;
  bool get isClientError => httpStatusCode >= 400 && httpStatusCode < 500;
  bool get isUnauthorized => httpStatusCode == 401;
  bool get isNotFound => httpStatusCode == 404;
  bool get isConflict => httpStatusCode == 409;

  factory ApiException.fromDioException(DioException err) {
    String? businessCode;
    String? businessMessage;
    String? message;
    if (err.response?.data != null) {
      final data = err.response!.data;
      if (data is Map<String, dynamic>) {
        businessCode = data['code']?.toString();
        businessMessage = data['message']?.toString();
        message = data['message']?.toString();
      }
    }
    return ApiException(
      requestOptions: err.requestOptions, response: err.response,
      error: err.error, type: err.type,
      businessCode: businessCode, businessMessage: businessMessage,
      message: message ?? err.message,
    );
  }
}

class NetworkException extends ApiException {
  NetworkException({required super.requestOptions, super.message})
      : super(type: DioExceptionType.connectionError);
}

class UnauthorizedException extends ApiException {
  UnauthorizedException({required super.requestOptions, super.message})
      : super(type: DioExceptionType.badResponse);
}
