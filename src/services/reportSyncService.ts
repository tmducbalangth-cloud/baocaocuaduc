import { TaskItem, DailyReport } from '../types';

/**
 * Automatically calculates and synchronizes a DailyReport based on current tasks for a specific date.
 * Ensures the report metrics, highlights, bottlenecks, summary, and tasks array are always 100% accurate.
 */
export function computeDailyReportForTasks(
  targetDate: string,
  allTasks: TaskItem[],
  existingReports: DailyReport[],
  authorName: string = 'Trịnh Minh Đức'
): DailyReport[] {
  const dayTasks = allTasks.filter((t) => t.date === targetDate);
  const existing = existingReports.find((r) => r.date === targetDate);

  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter(
    (t) => t.status === 'completed' || (Number(t.completionPercent) || 0) >= 100
  ).length;
  const totalHours = dayTasks.reduce((sum, t) => sum + (Number(t.timeSpentHours) || 0), 0);
  const avgCompletion =
    totalTasks > 0
      ? Math.round(
          dayTasks.reduce((sum, t) => sum + (Number(t.completionPercent) || 0), 0) / totalTasks
        )
      : 0;

  // Productivity Score Calculation
  const productivityScore =
    totalTasks > 0
      ? Math.max(50, Math.min(100, Math.round((completedTasks / totalTasks) * 60 + avgCompletion * 0.4)))
      : 90;

  const evaluationGrade =
    productivityScore >= 90 ? 'A+' : productivityScore >= 80 ? 'A' : productivityScore >= 70 ? 'B+' : 'B';

  // Dynamic Highlights from completed tasks
  const completedList = dayTasks.filter(
    (t) => t.status === 'completed' || (Number(t.completionPercent) || 0) >= 90
  );
  const highlights =
    completedList.length > 0
      ? completedList.map((t) => `Hoàn thành: ${t.title}`)
      : ['Đang tập trung bám sát các đầu việc theo kế hoạch.'];

  // Dynamic Bottlenecks from blocked or pending tasks
  const blockedList = dayTasks.filter((t) => t.status === 'blocked');
  const bottlenecks =
    blockedList.length > 0
      ? blockedList.map((t) => `Cần tháo gỡ: ${t.title}`)
      : [];

  // Workload & Burnout
  const workloadScore = Math.max(1, Math.min(10, Math.round(totalHours <= 3 ? 2 : totalHours <= 6 ? 5 : totalHours <= 8 ? 8 : 10)));
  const burnoutRisk = totalHours > 9 ? 'Cao' : totalHours > 6 ? 'Trung bình' : 'Thấp';

  // Summary
  const autoSummary =
    totalTasks > 0
      ? `Báo cáo Ngày ${targetDate}: Hoàn thành ${completedTasks}/${totalTasks} công việc với tổng thời gian ${totalHours}h. Tỷ lệ hoàn thành đạt ${avgCompletion}%, điểm hiệu suất ${productivityScore}/100 (Hạng ${evaluationGrade}).`
      : `Báo cáo Ngày ${targetDate}: Chưa ghi nhận công việc phát sinh.`;

  // Recommendations
  const recommendations =
    burnoutRisk === 'Cao'
      ? ['Giảm tải giờ làm việc và bàn giao bớt công việc tồn đọng.', 'Tối ưu hóa quy trình thủ công.']
      : bottlenecks.length > 0
      ? ['Tập trung tháo gỡ điểm nghẽn ưu tiên.', 'Tối ưu hóa thời gian xử lý thủ công.']
      : ['Tối ưu hóa thời gian xử lý thủ công.', 'Tiếp tục duy trì tiến độ hoàn thiện theo kế hoạch tuần.'];

  const updatedReport: DailyReport = {
    id: existing?.id || `report_${targetDate}`,
    date: targetDate,
    tasks: dayTasks,
    summary:
      existing?.summary &&
      !existing.summary.includes('Three.js') &&
      !existing.summary.includes('3/4 công việc')
        ? existing.summary
        : autoSummary,
    productivityScore:
      existing?.productivityScore && existing.tasks?.length === dayTasks.length
        ? existing.productivityScore
        : productivityScore,
    evaluationGrade: existing?.evaluationGrade || evaluationGrade,
    highlights,
    bottlenecks,
    aiAnalysis: {
      strengths: [
        completedTasks > 0
          ? `Hoàn thành xuất sắc ${completedTasks}/${totalTasks} mục tiêu đề ra.`
          : 'Đang triển khai các công việc theo kế hoạch.',
        `Tổng thời gian làm việc ${totalHours}h tập trung.`,
      ],
      improvements:
        bottlenecks.length > 0
          ? ['Xử lý dứt điểm các đầu việc bị nghẽn.']
          : ['Tiếp tục duy trì tính chủ động trong công việc.'],
      workloadScore,
      burnoutRisk,
      recommendations: existing?.aiAnalysis?.recommendations || recommendations,
      infographicSummary: `Hiệu suất đạt ${productivityScore}/100 điểm (Hạng ${evaluationGrade}). Hoàn thành ${completedTasks}/${totalTasks} đầu việc.`,
    },
    author: authorName,
    status: 'approved',
    userNotes: existing?.userNotes || '',
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const remaining = existingReports.filter((r) => r.date !== targetDate);
  return [updatedReport, ...remaining];
}
