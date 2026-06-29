import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/cache_manager.dart';
import '../../models/interest_models.dart';
import '../../data/interest_api.dart';
import '../../data/interest_repository.dart';

final interestApiProvider = Provider<InterestApi>((ref) => InterestApi(DioClient.instance.dio));
final interestRepositoryProvider = Provider<InterestRepository>((ref) {
  return InterestRepositoryImpl(ref.watch(interestApiProvider), CacheManager.instance);
});

final interestsProvider = FutureProvider<List<InterestModel>>((ref) {
  return ref.watch(interestRepositoryProvider).getAll();
});

final myInterestsProvider = FutureProvider<List<UserInterestModel>>((ref) {
  return ref.watch(interestRepositoryProvider).getMyInterests();
});
