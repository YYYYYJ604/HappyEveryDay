/// API 接口端点常量
class ApiEndpoints {
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh';
  static const String userProfile = '/users/profile';
  static const String interests = '/interests';
  static const String myInterests = '/interests/user/mine';
  static const String selectInterests = '/interests/user/select';
  static const String interestTasks = '/interests/tasks/recommended';
  static const String interestGrowth = '/interests/growth/mine';
  static const String interestMonthlySummary = '/interests/growth/monthly-summary';
  static const String dailyPlans = '/daily-plans';
  static const String dailyPlanGenerate = '/daily-plans/generate';
  static const String dailyPlanToday = '/daily-plans/today';
  static const String moods = '/moods';
  static const String moodLatest = '/moods/latest';
  static const String moodMonthlyStats = '/moods/stats/monthly';
  static const String activities = '/activities';
  static const String activityCheckin = '/activities/checkin';
  static const String notifications = '/notifications';
  static const String notificationCount = '/notifications/unread-count';
}

class StorageKeys {
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';
  static const String themeMode = 'theme_mode';
  static const String locale = 'locale';
  static const String onboardingCompleted = 'onboarding_completed';
  static const String lastMoodCheckin = 'last_mood_checkin_date';
  static const String cachedHomeData = 'cached_home_data';
}

class UIConstants {
  static const double spacingXs = 4;
  static const double spacingSm = 8;
  static const double spacingMd = 16;
  static const double spacingLg = 24;
  static const double spacingXl = 32;
  static const double spacingXxl = 48;
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 24;
  static const double radiusFull = 999;
  static const double iconSm = 16;
  static const double iconMd = 24;
  static const double iconLg = 32;
  static const double iconXl = 48;
  static const Duration animFast = Duration(milliseconds: 200);
  static const Duration animNormal = Duration(milliseconds: 350);
  static const Duration animSlow = Duration(milliseconds: 600);
  static const double bottomNavHeight = 64;
  static const double maxContentWidth = 428;
}
