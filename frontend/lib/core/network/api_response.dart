class ApiResponse<T> {
  final String code;
  final String message;
  final T? data;
  final Map<String, dynamic>? meta;

  const ApiResponse({required this.code, required this.message, this.data, this.meta});

  bool get isSuccess => code == 'A00000';

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic)? fromJsonT) {
    return ApiResponse(
      code: json['code'] as String? ?? 'A10000',
      message: json['message'] as String? ?? '未知错误',
      data: json['data'] != null && fromJsonT != null ? fromJsonT(json['data']) : json['data'] as T?,
      meta: json['meta'] as Map<String, dynamic>?,
    );
  }
}

class PaginatedResponse<T> {
  final List<T> items;
  final int total, page, limit, totalPages;
  final bool hasPrev, hasNext;

  const PaginatedResponse({
    required this.items, required this.total, required this.page, required this.limit,
    required this.totalPages, required this.hasPrev, required this.hasNext,
  });

  factory PaginatedResponse.fromApiResponse(ApiResponse<List<dynamic>> apiResponse, T Function(dynamic) fromJsonT) {
    final meta = apiResponse.meta;
    final items = apiResponse.data?.map(fromJsonT).toList() ?? [];
    final page = meta?['page'] as int? ?? 1;
    final limit = meta?['limit'] as int? ?? 20;
    final total = meta?['total'] as int? ?? 0;
    final totalPages = meta?['totalPages'] as int? ?? (total > 0 ? (total / limit).ceil() : 0);
    return PaginatedResponse(
      items: items, total: total, page: page, limit: limit,
      totalPages: totalPages, hasPrev: page > 1, hasNext: page < totalPages,
    );
  }
}
