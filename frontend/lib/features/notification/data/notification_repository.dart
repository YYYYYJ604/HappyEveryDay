import '../../../core/network/api_response.dart';
import '../models/notification_models.dart';
import 'notification_api.dart';

abstract class NotificationRepository {
  Future<PaginatedResponse<NotificationModel>> getAll(NotificationQueryParams params);
  Future<int> getUnreadCount();
}

class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationApi _api;
  NotificationRepositoryImpl(this._api);

  @override
  Future<PaginatedResponse<NotificationModel>> getAll(NotificationQueryParams params) async {
    final resp = await _api.getAll(params.toQuery());
    return PaginatedResponse.fromApiResponse(
      ApiResponse<List<dynamic>>(code: resp.code, message: resp.message, data: resp.data as List<dynamic>?, meta: resp.meta),
      (json) => NotificationModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<int> getUnreadCount() async {
    final resp = await _api.getUnreadCount();
    return (resp.data?['count'] as int?) ?? 0;
  }
}
