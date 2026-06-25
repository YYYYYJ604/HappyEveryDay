/// 兴趣标签
class InterestModel {
  final String id;
  final String name;
  final String? icon;
  final String? category;
  final String? description;
  final String? color;
  final int sortOrder;

  const InterestModel({required this.id, required this.name, this.icon, this.category, this.description, this.color, required this.sortOrder});

  factory InterestModel.fromJson(Map<String, dynamic> json) => InterestModel(
    id: json['id'] as String, name: json['name'] as String,
    icon: json['icon'] as String?, category: json['category'] as String?,
    description: json['description'] as String?, color: json['color'] as String?,
    sortOrder: json['sortOrder'] as int? ?? 0,
  );
}

/// 用户兴趣（含等级和成长）
class UserInterestModel {
  final String id;
  final String interestId;
  final InterestModel interest;
  final String level;
  final int totalActivities;
  final int totalDurationMin;
  final int streakDays;
  final DateTime? lastActivityAt;

  const UserInterestModel({required this.id, required this.interestId, required this.interest, required this.level, required this.totalActivities, required this.totalDurationMin, required this.streakDays, this.lastActivityAt});

  factory UserInterestModel.fromJson(Map<String, dynamic> json) => UserInterestModel(
    id: json['id'] as String, interestId: json['interestId'] as String,
    interest: InterestModel.fromJson(json['interest'] as Map<String, dynamic>),
    level: json['level'] as String, totalActivities: json['totalActivities'] as int,
    totalDurationMin: json['totalDurationMin'] as int, streakDays: json['streakDays'] as int,
    lastActivityAt: json['lastActivityAt'] != null ? DateTime.parse(json['lastActivityAt'] as String) : null,
  );
}

/// 兴趣推荐任务
class InterestTaskModel {
  final String id;
  final String interestId;
  final String title;
  final String? description;
  final int difficulty;
  final int? durationMin;
  final int participantCount;
  final int completionCount;
  final double avgRating;
  final bool isCompleted;

  const InterestTaskModel({required this.id, required this.interestId, required this.title, this.description, required this.difficulty, this.durationMin, required this.participantCount, required this.completionCount, required this.avgRating, required this.isCompleted});

  factory InterestTaskModel.fromJson(Map<String, dynamic> json) => InterestTaskModel(
    id: json['id'] as String, interestId: json['interestId'] as String,
    title: json['title'] as String, description: json['description'] as String?,
    difficulty: json['difficulty'] as int, durationMin: json['durationMin'] as int?,
    participantCount: json['participantCount'] as int, completionCount: json['completionCount'] as int,
    avgRating: (json['avgRating'] as num).toDouble(), isCompleted: json['isCompleted'] as bool,
  );
}

/// 兴趣成长记录
class InterestGrowthModel {
  final String userInterestId;
  final InterestModel interest;
  final String currentLevel;
  final int totalActivities;
  final int totalDurationMin;
  final int streakDays;
  final int weeklyActivities;
  final int monthlyActivities;
  final DateTime? lastActivityAt;

  const InterestGrowthModel({required this.userInterestId, required this.interest, required this.currentLevel, required this.totalActivities, required this.totalDurationMin, required this.streakDays, required this.weeklyActivities, required this.monthlyActivities, this.lastActivityAt});

  factory InterestGrowthModel.fromJson(Map<String, dynamic> json) => InterestGrowthModel(
    userInterestId: json['userInterestId'] as String,
    interest: InterestModel.fromJson(json['interest'] as Map<String, dynamic>),
    currentLevel: json['currentLevel'] as String, totalActivities: json['totalActivities'] as int,
    totalDurationMin: json['totalDurationMin'] as int, streakDays: json['streakDays'] as int,
    weeklyActivities: json['weeklyActivities'] as int, monthlyActivities: json['monthlyActivities'] as int,
    lastActivityAt: json['lastActivityAt'] != null ? DateTime.parse(json['lastActivityAt'] as String) : null,
  );
}

/// 月度兴趣汇总
class InterestMonthlySummaryModel {
  final int year;
  final int month;
  final int totalInterests;
  final int totalActivities;
  final int totalDurationMin;
  final double dailyAvgMin;
  final List<InterestGrowthModel> topInterests;

  const InterestMonthlySummaryModel({required this.year, required this.month, required this.totalInterests, required this.totalActivities, required this.totalDurationMin, required this.dailyAvgMin, required this.topInterests});

  factory InterestMonthlySummaryModel.fromJson(Map<String, dynamic> json) => InterestMonthlySummaryModel(
    year: json['year'] as int, month: json['month'] as int,
    totalInterests: json['totalInterests'] as int, totalActivities: json['totalActivities'] as int,
    totalDurationMin: json['totalDurationMin'] as int, dailyAvgMin: (json['dailyAvgMin'] as num).toDouble(),
    topInterests: (json['topInterests'] as List<dynamic>).map((e) => InterestGrowthModel.fromJson(e as Map<String, dynamic>)).toList(),
  );
}

/// 选择兴趣请求
class SelectInterestRequest {
  final List<String> interestIds;
  const SelectInterestRequest({required this.interestIds});
  Map<String, dynamic> toJson() => {'interestIds': interestIds};
}

/// 更新等级请求
class UpdateInterestLevelRequest {
  final String level;
  const UpdateInterestLevelRequest({required this.level});
  Map<String, dynamic> toJson() => {'level': level};
}

/// 兴趣任务查询参数
class InterestTaskQueryParams {
  final int page;
  final int limit;
  final int? difficulty;
  final int? durationMin;

  const InterestTaskQueryParams({this.page = 1, this.limit = 20, this.difficulty, this.durationMin});

  Map<String, dynamic> toQuery() => {
    'page': page, 'limit': limit,
    if (difficulty != null) 'difficulty': difficulty,
    if (durationMin != null) 'durationMin': durationMin,
  };
}

/// 兴趣成长查询参数
class InterestGrowthQueryParams {
  final int? year;
  final int? month;
  final String? startDate;
  final String? endDate;

  const InterestGrowthQueryParams({this.year, this.month, this.startDate, this.endDate});

  Map<String, dynamic> toQuery() => {
    if (year != null) 'year': year,
    if (month != null) 'month': month,
    if (startDate != null) 'startDate': startDate,
    if (endDate != null) 'endDate': endDate,
  };
}
