/// 活动
class ActivityModel {
  final String id;
  final String interestId;
  final String title;
  final String? description;
  final int difficulty;
  final int? durationMin;
  final String guideType;
  final String? guideContent;
  final String? guideUrl;
  final int participantCount;
  final int completionCount;
  final double avgRating;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const ActivityModel({required this.id, required this.interestId, required this.title, this.description, required this.difficulty, this.durationMin, required this.guideType, this.guideContent, this.guideUrl, required this.participantCount, required this.completionCount, required this.avgRating, required this.isActive, required this.createdAt, required this.updatedAt});

  factory ActivityModel.fromJson(Map<String, dynamic> json) => ActivityModel(
    id: json['id'] as String, interestId: json['interestId'] as String,
    title: json['title'] as String, description: json['description'] as String?,
    difficulty: json['difficulty'] as int, durationMin: json['durationMin'] as int?,
    guideType: json['guideType'] as String, guideContent: json['guideContent'] as String?,
    guideUrl: json['guideUrl'] as String?, participantCount: json['participantCount'] as int,
    completionCount: json['completionCount'] as int, avgRating: (json['avgRating'] as num).toDouble(),
    isActive: json['isActive'] as bool, createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
  );
}

/// 活动查询参数
class ActivityQueryParams {
  final int page;
  final int limit;
  final String? interestId;
  final String? keyword;
  final int? difficulty;
  final String? sortBy;
  final String? sortOrder;

  const ActivityQueryParams({this.page = 1, this.limit = 20, this.interestId, this.keyword, this.difficulty, this.sortBy, this.sortOrder});

  Map<String, dynamic> toQuery() => {
    'page': page, 'limit': limit,
    if (interestId != null) 'interestId': interestId,
    if (keyword != null) 'keyword': keyword,
    if (difficulty != null) 'difficulty': difficulty,
    if (sortBy != null) 'sortBy': sortBy,
    if (sortOrder != null) 'sortOrder': sortOrder,
  };
}

/// 打卡记录
class CheckinModel {
  final String id;
  final String activityId;
  final String userId;
  final String status;
  final int? rating;
  final String? feedback;
  final int? durationSpent;
  final DateTime? completedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const CheckinModel({required this.id, required this.activityId, required this.userId, required this.status, this.rating, this.feedback, this.durationSpent, this.completedAt, required this.createdAt, required this.updatedAt});

  factory CheckinModel.fromJson(Map<String, dynamic> json) => CheckinModel(
    id: json['id'] as String, activityId: json['activityId'] as String,
    userId: json['userId'] as String, status: json['status'] as String,
    rating: json['rating'] as int?, feedback: json['feedback'] as String?,
    durationSpent: json['durationSpent'] as int?,
    completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
    createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
  );
}

/// 打卡查询参数
class CheckinQueryParams {
  final int page;
  final int limit;
  final String? status;
  const CheckinQueryParams({this.page = 1, this.limit = 20, this.status});
  Map<String, dynamic> toQuery() => {'page': page, 'limit': limit, if (status != null) 'status': status};
}

/// 收藏
class BookmarkModel {
  final String id;
  final String userId;
  final String targetType;
  final String targetId;
  final String? note;
  final DateTime createdAt;

  const BookmarkModel({required this.id, required this.userId, required this.targetType, required this.targetId, this.note, required this.createdAt});

  factory BookmarkModel.fromJson(Map<String, dynamic> json) => BookmarkModel(
    id: json['id'] as String, userId: json['userId'] as String,
    targetType: json['targetType'] as String, targetId: json['targetId'] as String,
    note: json['note'] as String?, createdAt: DateTime.parse(json['createdAt'] as String),
  );
}

class BookmarkStatus {
  final bool bookmarked;
  const BookmarkStatus({required this.bookmarked});
  factory BookmarkStatus.fromJson(Map<String, dynamic> json) => BookmarkStatus(bookmarked: json['bookmarked'] as bool);
}

class CreateCheckinRequest {
  final String status;
  final int? rating;
  final String? feedback;
  final int? durationSpent;
  const CreateCheckinRequest({required this.status, this.rating, this.feedback, this.durationSpent});
  Map<String, dynamic> toJson() => {'status': status, if (rating != null) 'rating': rating, if (feedback != null) 'feedback': feedback, if (durationSpent != null) 'durationSpent': durationSpent};
}

class BookmarkRequest {
  final String? note;
  const BookmarkRequest({this.note});
  Map<String, dynamic> toJson() => {if (note != null) 'note': note};
}
