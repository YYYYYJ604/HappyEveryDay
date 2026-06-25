import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/cache_manager.dart';
import '../models/plan_models.dart';
import 'plan_api.dart';
import 'plan_repository.dart';

final planApiProvider = Provider<PlanApi>((ref) => PlanApi(DioClient.instance.dio));
final planRepositoryProvider = Provider<PlanRepository>((ref) {
  return PlanRepositoryImpl(ref.watch(planApiProvider), CacheManager.instance);
});

// ─── 今日计划 ───
final todayPlansProvider = FutureProvider<List<PlanItemModel>>((ref) {
  return ref.watch(planRepositoryProvider).getToday();
});

final todayProgressProvider = FutureProvider<TodayProgressModel>((ref) {
  return ref.watch(planRepositoryProvider).getTodayProgress();
});
