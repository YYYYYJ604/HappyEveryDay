class UserModel {
  final String id;
  final String nickname;
  final String? avatarUrl;
  final String? bio;
  final int? gender;
  final String? birthday;
  final String? phone;
  final bool isOnboarded;
  final DateTime? lastLoginAt;

  const UserModel({required this.id, required this.nickname, this.avatarUrl, this.bio, this.gender, this.birthday, this.phone, this.isOnboarded = false, this.lastLoginAt});

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: json['id'] as String, nickname: json['nickname'] as String? ?? '',
    avatarUrl: json['avatarUrl'] as String?, bio: json['bio'] as String?,
    gender: json['gender'] as int?, birthday: json['birthday'] as String?,
    phone: json['phone'] as String?, isOnboarded: json['isOnboarded'] as bool? ?? false,
    lastLoginAt: json['lastLoginAt'] != null ? DateTime.tryParse(json['lastLoginAt'] as String) : null,
  );

  Map<String, dynamic> toJson() => {'id': id, 'nickname': nickname, 'avatarUrl': avatarUrl, 'bio': bio, 'gender': gender, 'birthday': birthday, 'phone': phone, 'isOnboarded': isOnboarded, 'lastLoginAt': lastLoginAt?.toIso8601String()};
}
