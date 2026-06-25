/// 用户资料（含 profile 和 interests）
class ProfileModel {
  final String id;
  final String phone;
  final String? email;
  final String nickname;
  final String? avatarUrl;
  final String bio;
  final int gender;
  final String? birthday;
  final String? occupation;
  final String? region;
  final String? zodiacSign;
  final String role;
  final bool isActive;
  final bool isOnboarded;
  final DateTime? lastLoginAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final ProfileConfigModel? profile;
  final List<ProfileInterestItem>? interests;

  const ProfileModel({required this.id, required this.phone, this.email, required this.nickname, this.avatarUrl, required this.bio, required this.gender, this.birthday, this.occupation, this.region, this.zodiacSign, required this.role, required this.isActive, required this.isOnboarded, this.lastLoginAt, required this.createdAt, required this.updatedAt, this.profile, this.interests});

  factory ProfileModel.fromJson(Map<String, dynamic> json) => ProfileModel(
    id: json['id'] as String, phone: json['phone'] as String,
    email: json['email'] as String?, nickname: json['nickname'] as String,
    avatarUrl: json['avatarUrl'] as String?, bio: json['bio'] as String? ?? '',
    gender: json['gender'] as int? ?? 0, birthday: json['birthday'] as String?,
    occupation: json['occupation'] as String?, region: json['region'] as String?,
    zodiacSign: json['zodiacSign'] as String?, role: json['role'] as String? ?? 'user',
    isActive: json['isActive'] as bool? ?? true, isOnboarded: json['isOnboarded'] as bool? ?? false,
    lastLoginAt: json['lastLoginAt'] != null ? DateTime.parse(json['lastLoginAt'] as String) : null,
    createdAt: DateTime.parse(json['createdAt'] as String), updatedAt: DateTime.parse(json['updatedAt'] as String),
    profile: json['profile'] != null ? ProfileConfigModel.fromJson(json['profile'] as Map<String, dynamic>) : null,
    interests: (json['interests'] as List<dynamic>?)?.map((e) => ProfileInterestItem.fromJson(e as Map<String, dynamic>)).toList(),
  );
}

/// 用户配置
class ProfileConfigModel {
  final bool notifyLike, notifyComment, notifyFollow, notifySystem, notifyDailyReminder;
  final String dailyReminderTime;
  final bool moodReminderEnabled;
  final String? moodReminderTime;
  final String privacyShowPlans, privacyShowMood, privacyShowJournal;
  final String themeMode, language;
  final int planStreakDays, moodStreakDays, longestPlanStreak;

  const ProfileConfigModel({required this.notifyLike, required this.notifyComment, required this.notifyFollow, required this.notifySystem, required this.notifyDailyReminder, required this.dailyReminderTime, required this.moodReminderEnabled, this.moodReminderTime, required this.privacyShowPlans, required this.privacyShowMood, required this.privacyShowJournal, required this.themeMode, required this.language, required this.planStreakDays, required this.moodStreakDays, required this.longestPlanStreak});

  factory ProfileConfigModel.fromJson(Map<String, dynamic> json) => ProfileConfigModel(
    notifyLike: json['notifyLike'] as bool? ?? true, notifyComment: json['notifyComment'] as bool? ?? true,
    notifyFollow: json['notifyFollow'] as bool? ?? true, notifySystem: json['notifySystem'] as bool? ?? true,
    notifyDailyReminder: json['notifyDailyReminder'] as bool? ?? true,
    dailyReminderTime: json['dailyReminderTime'] as String? ?? '09:00',
    moodReminderEnabled: json['moodReminderEnabled'] as bool? ?? false,
    moodReminderTime: json['moodReminderTime'] as String?,
    privacyShowPlans: json['privacyShowPlans'] as String? ?? 'public',
    privacyShowMood: json['privacyShowMood'] as String? ?? 'private',
    privacyShowJournal: json['privacyShowJournal'] as String? ?? 'private',
    themeMode: json['themeMode'] as String? ?? 'light', language: json['language'] as String? ?? 'zh-CN',
    planStreakDays: json['planStreakDays'] as int? ?? 0, moodStreakDays: json['moodStreakDays'] as int? ?? 0,
    longestPlanStreak: json['longestPlanStreak'] as int? ?? 0,
  );
}

/// 用户兴趣条目
class ProfileInterestItem {
  final String id;
  final String name;
  final String? icon;
  final String? category;
  final String level;

  const ProfileInterestItem({required this.id, required this.name, this.icon, this.category, required this.level});

  factory ProfileInterestItem.fromJson(Map<String, dynamic> json) => ProfileInterestItem(
    id: json['id'] as String, name: json['name'] as String,
    icon: json['icon'] as String?, category: json['category'] as String?,
    level: json['level'] as String? ?? 'beginner',
  );
}

/// 更新资料请求
class UpdateProfileRequest {
  final String? nickname;
  final String? avatarUrl;
  final String? bio;
  final int? gender;
  final String? birthday;
  final String? occupation;
  final String? region;
  final String? zodiacSign;

  const UpdateProfileRequest({this.nickname, this.avatarUrl, this.bio, this.gender, this.birthday, this.occupation, this.region, this.zodiacSign});

  Map<String, dynamic> toJson() => {
    if (nickname != null) 'nickname': nickname, if (avatarUrl != null) 'avatarUrl': avatarUrl,
    if (bio != null) 'bio': bio, if (gender != null) 'gender': gender,
    if (birthday != null) 'birthday': birthday, if (occupation != null) 'occupation': occupation,
    if (region != null) 'region': region, if (zodiacSign != null) 'zodiacSign': zodiacSign,
  };
}
