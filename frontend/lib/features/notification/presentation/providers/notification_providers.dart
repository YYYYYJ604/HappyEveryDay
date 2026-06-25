import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import 'notification_api.dart';
import 'notification_repository.dart';

final notificationApiProvider = Provider<NotificationApi>((ref) => NotificationApi(DioClient.instance.dio));
final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepositoryImpl(ref.watch(notificationApiProvider));
});

final unreadCountProvider = FutureProvider<int>((ref) {
  return ref.watch(notificationRepositoryProvider).getUnreadCount();
});
