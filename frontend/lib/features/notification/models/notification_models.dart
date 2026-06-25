class NotificationModel {
  final String id;
  final String type;
  final String title;
  final String? body;
  final bool isRead;
  final String? imageUrl;
  final String? actionUrl;
  final DateTime createdAt;

  const NotificationModel({required this.id, required this.type, required this.title, this.body, required this.isRead, this.imageUrl, this.actionUrl, required this.createdAt});

  factory NotificationModel.fromJson(Map<String, dynamic> json) => NotificationModel(
    id: json['id'] as String, type: json['type'] as String,
    title: json['title'] as String, body: json['body'] as String?,
    isRead: json['isRead'] as bool? ?? false, imageUrl: json['imageUrl'] as String?,
    actionUrl: json['actionUrl'] as String?, createdAt: DateTime.parse(json['createdAt'] as String),
  );
}

class NotificationQueryParams {
  final int page;
  final int limit;
  const NotificationQueryParams({this.page = 1, this.limit = 20});
  Map<String, dynamic> toQuery() => {'page': page, 'limit': limit};
}
