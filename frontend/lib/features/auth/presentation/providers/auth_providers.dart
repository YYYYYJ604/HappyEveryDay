import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../data/auth_api.dart';
import '../../data/auth_repository.dart';

final authApiProvider = Provider<AuthApi>(
  (ref) => AuthApi(DioClient.instance.dio),
);
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(authApiProvider), SecureStorage.instance);
});
