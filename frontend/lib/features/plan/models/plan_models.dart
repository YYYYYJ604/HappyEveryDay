/// 生成计划请求
class GeneratePlanRequest {
  final String? planDate;
  final bool? force;

  const GeneratePlanRequest({this.planDate, this.force});

  Map<String, dynamic> toJson() => {if (planDate != null) 'planDate': planDate, if (force == true) 'force': force};
}

/// 查询计划历史参数
class PlanQueryParams {
  final int page;
  final int limit;
  final String? status;
  final String? startDate;
  final String? endDate;

  const PlanQueryParams({this.page = 1, this.limit = 20, this.status, this.startDate, this.endDate});

  Map<String, dynamic> toQuery() => {
    'page': page, 'limit': limit,
    if (status != null) 'status': status,
    if (startDate != null) 'startDate': startDate,
    if (endDate != null) 'endDate': endDate,
  };
}

/// 计划项
class PlanItemModel {
  final String id;
  final String durationType;
  final String title;
  final String? description;
  final String? category;
  final String status;
  final bool isAiGenerated;
  final String? sourceInterestId;
  final String? weather;
  final DateTime? completedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const PlanItemModel({
    required this.id, required this.durationType, required this.title,
    this.description, this.category, required this.status, required this.isAiGenerated,
    this.sourceInterestId, this.weather, this.completedAt,
    required this.createdAt, required this.updatedAt,
  });

  factory PlanItemModel.fromJson(Map<String, dynamic> json) => PlanItemModel(
    id: json['id'] as String, durationType: json['durationType'] as String,
    title: json['title'] as String, description: json['description'] as String?,
    category: json['category'] as String?, status: json['status'] as String,
    isAiGenerated: json['isAiGenerated'] as bool,
    sourceInterestId: json['sourceInterestId'] as String?,
    weather: json['weather'] as String?,
    completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
    createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
  );

  bool get isCompleted => status == 'completed';
  bool get isPending => status == 'pending';
  bool get isSkipped => status == 'skipped';
}

/// 今日进度
class TodayProgressModel {
  final int total;
  final int completed;
  final int skipped;
  final int pending;

  const TodayProgressModel({required this.total, required this.completed, required this.skipped, required this.pending});

  factory TodayProgressModel.fromJson(Map<String, dynamic> json) => TodayProgressModel(
    total: json['total'] as int, completed: json['completed'] as int,
    skipped: json['skipped'] as int, pending: json['pending'] as int,
  );
}

/// 生成计划响应
class GeneratePlanResponse {
  final List<PlanItemModel> plans;
  const GeneratePlanResponse({required this.plans});

  factory GeneratePlanResponse.fromJson(Map<String, dynamic> json) => GeneratePlanResponse(
    plans: (json['plans'] as List<dynamic>).map((e) => PlanItemModel.fromJson(e as Map<String, dynamic>)).toList(),
  );
}
