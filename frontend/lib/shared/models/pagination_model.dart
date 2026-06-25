class PaginationModel {
  final int page, limit, total, totalPages;
  final bool hasPrev, hasNext;
  const PaginationModel({this.page = 1, this.limit = 20, this.total = 0, this.totalPages = 0, this.hasPrev = false, this.hasNext = false});

  factory PaginationModel.fromJson(Map<String, dynamic> json) {
    final p = json['page'] as int? ?? 1;
    final l = json['limit'] as int? ?? 20;
    final t = json['total'] as int? ?? 0;
    final tp = json['totalPages'] as int? ?? (t > 0 ? (t / l).ceil() : 0);
    return PaginationModel(page: p, limit: l, total: t, totalPages: tp, hasPrev: p > 1, hasNext: p < tp);
  }
}
