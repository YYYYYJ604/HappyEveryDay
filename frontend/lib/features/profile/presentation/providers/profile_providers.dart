import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/cache_manager.dart';
import '../../data/profile_api.dart';
import '../../data/profile_repository.dart';

final profileApiProvider = Provider<ProfileApi>((ref) => ProfileApi(DioClient.instance.dio));
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(ref.watch(profileApiProvider), CacheManager.instance);
});
