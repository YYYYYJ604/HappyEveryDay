import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../mood/presentation/providers/mood_providers.dart';
import '../../../plan/presentation/providers/plan_providers.dart';
import '../../../../shared/providers/auth_provider.dart';
import '../../../plan/models/plan_models.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final todayPlansAsync = ref.watch(todayPlansProvider);
    final todayProgressAsync = ref.watch(todayProgressProvider);
    final now = DateTime.now();

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(todayPlansProvider);
            ref.invalidate(todayProgressProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ─── 顶部问候 ───
                _buildGreeting(context, now),
                const SizedBox(height: 24),

                // ─── 今日进度卡片 ───
                todayProgressAsync.when(
                  data: (progress) => _buildProgressCard(context, progress),
                  loading: () => const _LoadingCard(height: 120),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 24),

                // ─── 快捷操作 ───
                _buildQuickActions(context),
                const SizedBox(height: 24),

                // ─── 今日计划 ───
                Text('今日计划', style: AppTypography.headlineSmall),
                const SizedBox(height: 12),
                todayPlansAsync.when(
                  data: (plans) => plans.isEmpty
                      ? _buildEmptyState()
                      : _buildPlanList(context, plans),
                  loading: () => const _LoadingCard(height: 100),
                  error: (e, _) =>
                      Text('加载失败', style: TextStyle(color: Colors.red)),
                ),
                const SizedBox(height: 24),

                // ─── 心情速记快捷入口 ───
                _buildMoodEntry(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGreeting(BuildContext context, DateTime now) {
    final hour = now.hour;
    final greeting = hour < 6
        ? '夜深了'
        : hour < 9
        ? '早上好'
        : hour < 12
        ? '上午好'
        : hour < 14
        ? '中午好'
        : hour < 18
        ? '下午好'
        : '晚上好';
    return Row(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(greeting, style: AppTypography.displaySmall),
            const SizedBox(height: 4),
            Text(
              '今天是美好的一天',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        const Spacer(),
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          onPressed: () => context.go('/notifications'),
        ),
      ],
    );
  }

  Widget _buildProgressCard(BuildContext context, TodayProgressModel progress) {
    final pct = progress.total > 0
        ? (progress.completed / progress.total).toStringAsFixed(0)
        : '0';
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.7)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '今日进度',
                  style: AppTypography.bodyMedium.copyWith(
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '$pct%',
                  style: AppTypography.displaySmall.copyWith(
                    color: Colors.white,
                    fontSize: 36,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '已完成 ${progress.completed}/${progress.total} 项',
                  style: const TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 80,
            height: 80,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CircularProgressIndicator(
                  value: progress.total > 0
                      ? progress.completed / progress.total
                      : 0,
                  strokeWidth: 6,
                  backgroundColor: Colors.white24,
                  color: Colors.white,
                ),
                Text(
                  '$pct%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        _ActionButton(
          icon: Icons.add_task,
          label: '新建计划',
          color: Colors.orange,
          onTap: () => context.go('/home/plan'),
        ),
        const SizedBox(width: 12),
        _ActionButton(
          icon: Icons.emoji_emotions,
          label: '记录心情',
          color: Colors.pink,
          onTap: () => context.go('/home/mood'),
        ),
        const SizedBox(width: 12),
        _ActionButton(
          icon: Icons.explore,
          label: '发现活动',
          color: Colors.teal,
          onTap: () => context.go('/home/discovery'),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(Icons.inbox, size: 40, color: Colors.grey[400]),
          const SizedBox(height: 8),
          Text(
            '今天还没有计划',
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text('点击上方按钮创建', style: AppTypography.bodySmall),
        ],
      ),
    );
  }

  Widget _buildPlanList(BuildContext context, List<PlanItemModel> plans) {
    return Column(
      children: plans
          .take(5)
          .map(
            (plan) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: plan.isCompleted ? Colors.green[50] : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Row(
                children: [
                  Icon(
                    plan.isCompleted
                        ? Icons.check_circle
                        : Icons.radio_button_unchecked,
                    color: plan.isCompleted ? Colors.green : Colors.grey,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          plan.title,
                          style: AppTypography.bodyLarge.copyWith(
                            decoration: plan.isCompleted
                                ? TextDecoration.lineThrough
                                : null,
                          ),
                        ),
                        if (plan.description != null)
                          Text(
                            plan.description!,
                            style: AppTypography.bodySmall,
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildMoodEntry(BuildContext context) {
    return InkWell(
      onTap: () => context.go('/home/mood'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.pink[50]!, Colors.purple[50]!],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            const Icon(Icons.auto_awesome, size: 32, color: Colors.pink),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('今天心情怎么样？', style: AppTypography.headlineSmall),
                  const SizedBox(height: 4),
                  Text('记录此刻的感受', style: AppTypography.bodySmall),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(
                label,
                style: AppTypography.labelMedium.copyWith(color: color),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LoadingCard extends StatelessWidget {
  final double height;
  const _LoadingCard({required this.height});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Center(child: CircularProgressIndicator()),
    );
  }
}
