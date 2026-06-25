import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/cache_manager.dart';
import 'profile_api.dart';
import 'profile_repository.dart';

final profileApiProvider = Provider<ProfileApi>((ref) => ProfileApi(DioClient.instance.dio));
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(ref.watch(profileApiProvider), CacheManager.instance);
});
