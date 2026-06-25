import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/cache_manager.dart';
import '../models/mood_models.dart';
import 'mood_api.dart';
import 'mood_repository.dart';

final moodApiProvider = Provider<MoodApi>((ref) => MoodApi(DioClient.instance.dio));
final moodRepositoryProvider = Provider<MoodRepository>((ref) {
  return MoodRepositoryImpl(ref.watch(moodApiProvider), CacheManager.instance);
});

/// 心情列表状态
class MoodListState {
  final List<MoodRecordModel> records;
  final bool isLoading;
  final bool hasMore;
  final int page;
  final String? error;

  const MoodListState({this.records = const [], this.isLoading = false, this.hasMore = true, this.page = 1, this.error});

  MoodListState copyWith({List<MoodRecordModel>? records, bool? isLoading, bool? hasMore, int? page, String? error}) => MoodListState(
    records: records ?? this.records, isLoading: isLoading ?? this.isLoading,
    hasMore: hasMore ?? this.hasMore, page: page ?? this.page, error: error,
  );
}

final moodListProvider = StateNotifierProvider<MoodListNotifier, MoodListState>((ref) {
  return MoodListNotifier(ref.watch(moodRepositoryProvider));
});

class MoodListNotifier extends StateNotifier<MoodListState> {
  final MoodRepository _repo;
  MoodListNotifier(this._repo) : super(const MoodListState());

  Future<void> loadMore() async {
    if (state.isLoading || !state.hasMore) return;
    state = state.copyWith(isLoading: true);
    try {
      final result = await _repo.getHistory(MoodQueryParams(page: state.page, limit: 20));
      state = state.copyWith(
        records: [...state.records, ...result.items],
        page: state.page + 1,
        hasMore: state.page < result.totalPages,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}
