/// 环境配置枚举
enum Env { dev, test, prod }

/// 应用全局配置常量
class AppConfig {
  static const Env env = Env.dev;
  static const String appName = 'Happy Every Day';
  static const String appVersion = '1.0.0';
  static const int buildNumber = 1;
  static bool get isDebug => env == Env.dev;
}

/// API 配置
class ApiConfig {
  static String get baseUrl {
    switch (AppConfig.env) {
      case Env.dev:
        return 'http://10.0.2.2:3000/api/v1';
      case Env.test:
        return 'https://test-api.happy-everyday.app/api/v1';
      case Env.prod:
        return 'https://api.happy-everyday.app/api/v1';
    }
  }

  static const int connectTimeout = 10000;
  static const int receiveTimeout = 15000;
  static const int sendTimeout = 10000;
  static const int maxRetries = 2;
  static const Duration retryDelay = Duration(seconds: 1);
}
