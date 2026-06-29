import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/secure_storage.dart';
import 'api_exceptions.dart';

class DioClient {
  static DioClient? _instance;
  late final Dio dio;

  DioClient._() {
    dio = _createDio();
  }

  static DioClient get instance {
    _instance ??= DioClient._();
    return _instance!;
  }

  Dio _createDio() {
    final d = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: Duration(milliseconds: ApiConfig.connectTimeout),
        receiveTimeout: Duration(milliseconds: ApiConfig.receiveTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    d.interceptors.addAll([
      _AuthInterceptor(),
      _LogInterceptor(),
      _ErrorInterceptor(),
    ]);
    return d;
  }

  static Dio get pure => Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    try {
      final token = await SecureStorage.instance.readAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    } catch (_) {}
    handler.next(options);
  }
}

class _LogInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (AppConfig.isDebug) {
      print('[API] => ${options.uri}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (AppConfig.isDebug) {
      print('[API] <= ${response.statusCode}');
    }
    handler.next(response);
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    handler.reject(ApiException.fromDioException(err));
  }
}
