import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/cache_manager.dart';
import '../models/activity_models.dart';
import 'activity_api.dart';
import 'activity_repository.dart';

final activityApiProvider = Provider<ActivityApi>((ref) => ActivityApi(DioClient.instance.dio));
final activityRepositoryProvider = Provider<ActivityRepository>((ref) {
  return ActivityRepositoryImpl(ref.watch(activityApiProvider), CacheManager.instance);
});
