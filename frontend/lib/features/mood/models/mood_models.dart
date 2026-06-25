/// 记录心情请求
class CreateMoodRequest {
  final String level;
  final int? intensity;
  final String? journal;
  final List<String>? tags;
  final List<String>? factors;
  final int? energyLevel;
  final double? sleepHours;
  final String? recordDate;

  const CreateMoodRequest({
    required this.level,
    this.intensity, this.journal, this.tags, this.factors,
    this.energyLevel, this.sleepHours, this.recordDate,
  });

  Map<String, dynamic> toJson() => {
    'level': level,
    if (intensity != null) 'intensity': intensity,
    if (journal != null) 'journal': journal,
    if (tags != null) 'tags': tags,
    if (factors != null) 'factors': factors,
    if (energyLevel != null) 'energyLevel': energyLevel,
    if (sleepHours != null) 'sleepHours': sleepHours,
    if (recordDate != null) 'recordDate': recordDate,
  };
}

/// 查询心情历史参数
class MoodQueryParams {
  final int page;
  final int limit;
  final String? level;
  final String? startDate;
  final String? endDate;

  const MoodQueryParams({this.page = 1, this.limit = 20, this.level, this.startDate, this.endDate});

  Map<String, dynamic> toQuery() => {
    'page': page, 'limit': limit,
    if (level != null) 'level': level,
    if (startDate != null) 'startDate': startDate,
    if (endDate != null) 'endDate': endDate,
  };
}

/// 心情记录响应
class MoodRecordModel {
  final String id;
  final String level;
  final String moodType;
  final int intensity;
  final String? journal;
  final List<String>? tags;
  final List<String>? factors;
  final int? energyLevel;
  final double? sleepHours;
  final String recordDate;
  final String recordTime;
  final String? weather;
  final DateTime createdAt;

  const MoodRecordModel({
    required this.id, required this.level, required this.moodType,
    required this.intensity, this.journal, this.tags, this.factors,
    this.energyLevel, this.sleepHours, required this.recordDate,
    required this.recordTime, this.weather, required this.createdAt,
  });

  factory MoodRecordModel.fromJson(Map<String, dynamic> json) => MoodRecordModel(
    id: json['id'] as String,
    level: json['level'] as String,
    moodType: json['moodType'] as String,
    intensity: json['intensity'] as int,
    journal: json['journal'] as String?,
    tags: (json['tags'] as List<dynamic>?)?.cast<String>(),
    factors: (json['factors'] as List<dynamic>?)?.cast<String>(),
    energyLevel: json['energyLevel'] as int?,
    sleepHours: (json['sleepHours'] as num?)?.toDouble(),
    recordDate: json['recordDate'] as String,
    recordTime: json['recordTime'] as String,
    weather: json['weather'] as String?,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );
}

/// 月度统计
class MoodMonthStatModel {
  final int year;
  final int month;
  final int totalDays;
  final double averageLevel;
  final double averageIntensity;
  final double averageEnergy;
  final Map<String, Map<String, int>> dailyDistribution;
  final Map<String, int> distribution;
  final int streakDays;

  const MoodMonthStatModel({
    required this.year, required this.month, required this.totalDays,
    required this.averageLevel, required this.averageIntensity, required this.averageEnergy,
    required this.dailyDistribution, required this.distribution, required this.streakDays,
  });

  factory MoodMonthStatModel.fromJson(Map<String, dynamic> json) => MoodMonthStatModel(
    year: json['year'] as int, month: json['month'] as int,
    totalDays: json['totalDays'] as int,
    averageLevel: (json['averageLevel'] as num).toDouble(),
    averageIntensity: (json['averageIntensity'] as num).toDouble(),
    averageEnergy: (json['averageEnergy'] as num?)?.toDouble() ?? 0,
    dailyDistribution: (json['dailyDistribution'] as Map<String, dynamic>).map((k, v) => MapEntry(k, (v as Map<String, dynamic>).map((kk, vv) => MapEntry(kk, (vv as num).toInt())))),
    distribution: (json['distribution'] as Map<String, dynamic>).map((k, v) => MapEntry(k, (v as num).toInt())),
    streakDays: json['streakDays'] as int,
  );
}
