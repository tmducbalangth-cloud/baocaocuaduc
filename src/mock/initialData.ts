import { DailyReport, TaskItem, User, ViewerFeedback } from '../types';
import { AUGUST_TASKS, AUGUST_DAILY_REPORTS } from './augustTasks';

export const DEFAULT_ADMIN_AVATAR = '/admin-avatar.jpg';

export function getStoredAdminAvatar(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('3d_workreport_permanent_admin_avatar');
    if (saved && !saved.includes('photo-1507003211169')) return saved;
  }
  return DEFAULT_ADMIN_AVATAR;
}

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    username: 'admin',
    name: 'Trịnh Minh Đức',
    role: 'admin',
    avatar: DEFAULT_ADMIN_AVATAR,
    email: 'tmduc.balangth@gmail.com',
    title: 'Lead Architect / Trịnh Minh Đức',
  },
  {
    id: 'user_viewer',
    username: 'viewer',
    name: 'Trịnh Minh Đức (Người Xem)',
    role: 'viewer',
    avatar: DEFAULT_ADMIN_AVATAR,
    email: 'tmduc.balangth@gmail.com',
    title: 'Giám Sát Dự Án / Stakeholder',
  },
];

// Helper to format date YYYY-MM-DD
export function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = new Date();
const todayStr = formatDateStr(today);

const d1 = new Date(today);
d1.setDate(d1.getDate() - 1);
const yesterdayStr = formatDateStr(d1);

const d2 = new Date(today);
d2.setDate(d2.getDate() - 2);
const day2Str = formatDateStr(d2);

const d3 = new Date(today);
d3.setDate(d3.getDate() - 3);
const day3Str = formatDateStr(d3);

const d4 = new Date(today);
d4.setDate(d4.getDate() - 4);
const day4Str = formatDateStr(d4);

export const INITIAL_TASKS: TaskItem[] = [
  // Today's tasks (Admin entered)
  {
    id: 'task_today_1',
    title: 'Lên lịch cụ thể cho từng ngày trong tuần',
    description: 'Phân bổ và lập kế hoạch chi tiết các nhiệm vụ cho từng ngày trong tuần',
    category: 'Marketing',
    status: 'in_progress',
    priority: 'medium',
    date: todayStr,
    quantity: 1,
    timeSpentHours: 1.0,
    completionPercent: 50,
    kpiMetric: 'Phân chia rõ nhiệm vụ cho cả tuần',
    outcome: 'Đã thiết lập khung lịch biểu công việc tuần',
    assignedTo: 'Trịnh Minh Đức',
    tags: ['Lập lịch', 'Kế hoạch tuần', 'Marketing'],
  },
  {
    id: 'task_today_2',
    title: 'Dựng clip Kênh Bán Hàng',
    description: 'Dựng, hiệu đính và hoàn thiện video clip bán hàng đăng tải trên hệ thống',
    category: 'Marketing',
    status: 'completed',
    priority: 'high',
    date: todayStr,
    quantity: 1,
    timeSpentHours: 2.0,
    completionPercent: 100,
    kpiMetric: 'Đã hoàn thành và đăng tải clip bán hàng',
    outcome: 'Clip đã dựng xong và sẵn sàng phát hành',
    assignedTo: 'Trịnh Minh Đức',
    tags: ['Video', 'Clip', 'Kênh Bán Hàng'],
  },

  // Yesterday's tasks
  {
    id: 'task_5',
    title: 'Xây dựng cấu trúc Dashboard Báo cáo Tuần & Tháng',
    description: 'Thiết kế bộ lọc ngày tháng năm tùy chỉnh và các biểu đồ thống kê năng suất tuần',
    category: 'Marketing',
    status: 'completed',
    priority: 'high',
    date: yesterdayStr,
    timeSpentHours: 4.0,
    completionPercent: 100,
    kpiMetric: 'Liên kết 7 ngày trong tuần vào bộ lọc',
    outcome: 'Bộ lọc hoạt động mượt mà, phản hồi tức thì',
    assignedTo: 'Trịnh Minh Đức',
  },
  {
    id: 'task_6',
    title: 'Lập biểu đồ đo lường tiến độ theo danh mục công việc',
    description: 'Trực quan hóa tỷ lệ phần trăm giờ làm việc theo Marketing, Hỗ trợ, CV ngoài',
    category: 'Marketing',
    status: 'completed',
    priority: 'medium',
    date: yesterdayStr,
    timeSpentHours: 2.5,
    completionPercent: 100,
    kpiMetric: 'Biểu đồ tròn 3D & Biểu đồ cột tương tác',
    outcome: 'Dữ liệu phân bổ rõ ràng, trực quan',
    assignedTo: 'Trịnh Minh Đức',
  },
  {
    id: 'task_7',
    title: 'Họp rà soát tiến độ và phân chia công việc tuần',
    description: 'Thảo luận các tính năng trọng tâm và chuẩn bị kịch bản đo lường hiệu suất',
    category: 'CV ngoài',
    status: 'completed',
    priority: 'low',
    date: yesterdayStr,
    timeSpentHours: 1.5,
    completionPercent: 100,
    kpiMetric: 'Thống nhất 100% các mục tiêu sprint',
    outcome: 'Biên bản cuộc họp được gửi tới toàn bộ thành viên',
    assignedTo: 'Trịnh Minh Đức',
  },

  // Day -2
  {
    id: 'task_8',
    title: 'Nghiên cứu kiến trúc 3D Three.js và Motion layout',
    description: 'Đánh giá hiệu năng card tilt 3D, perspective depth và shader ánh sáng',
    category: 'CV ngoài',
    status: 'completed',
    priority: 'high',
    date: day2Str,
    timeSpentHours: 3.5,
    completionPercent: 100,
    kpiMetric: 'Đạt chuẩn 60fps trên cả thiết bị di động',
    outcome: 'Chọn giải pháp Three.js kết hợp Tailwind CSS 3D',
    assignedTo: 'Trịnh Minh Đức',
  },
  {
    id: 'task_9',
    title: 'Xây dựng API Backend Express và middleware',
    description: 'Thiết lập các endpoint phân tích báo cáo và tích hợp Gemini API an toàn',
    category: 'Marketing',
    status: 'completed',
    priority: 'high',
    date: day2Str,
    timeSpentHours: 3.0,
    completionPercent: 100,
    kpiMetric: '3 API endpoint hoàn chỉnh với error handling',
    outcome: 'Server phản hồi chuẩn format JSON',
    assignedTo: 'Trịnh Minh Đức',
  },
  {
    id: 'task_10',
    title: 'Xử lý dữ liệu bảng tính demo và case study thực tế',
    description: 'Chuẩn bị dữ liệu mẫu báo cáo ngày, tuần, tháng, năm chân thực',
    category: 'Hỗ trợ',
    status: 'completed',
    priority: 'medium',
    date: day2Str,
    timeSpentHours: 1.5,
    completionPercent: 100,
    kpiMetric: '50+ đầu việc trải đều các phòng ban',
    outcome: 'Bộ dữ liệu phong phú, sinh động',
    assignedTo: 'Trịnh Minh Đức',
  },

  // Day -3
  {
    id: 'task_11',
    title: 'Tối ưu hóa UI/UX trên màn hình rộng & Tablet',
    description: 'Cân đối không gian hiển thị, căn lề và hiệu ứng neon hover',
    category: 'Marketing',
    status: 'completed',
    priority: 'medium',
    date: day3Str,
    timeSpentHours: 3.0,
    completionPercent: 100,
    kpiMetric: 'Đáp ứng 100% tiêu chuẩn responsive',
    outcome: 'Giao diện hiển thị sắc nét trên mọi thiết bị',
    assignedTo: 'Trịnh Minh Đức',
  },
  {
    id: 'task_12',
    title: 'Phát triển tính năng Xuất Báo Cáo PDF & Markdown',
    description: 'Hỗ trợ in ấn trực tiếp, sao chép định dạng chuyên nghiệp gửi đối tác',
    category: 'Marketing',
    status: 'completed',
    priority: 'medium',
    date: day3Str,
    timeSpentHours: 2.5,
    completionPercent: 100,
    kpiMetric: 'Hỗ trợ 3 định dạng: PDF In, Thẻ ảnh 3D, Markdown',
    outcome: 'Xuất bản nhanh chóng, thiết kế sang trọng',
    assignedTo: 'Trịnh Minh Đức',
  },

  // Day -4
  {
    id: 'task_13',
    title: 'Khởi tạo kiến trúc dự án và thiết lập môi trường',
    description: 'Cài đặt các gói phụ thuộc, TypeScript, Tailwind CSS v4, Lucide icons',
    category: 'CV ngoài',
    status: 'completed',
    priority: 'high',
    date: day4Str,
    timeSpentHours: 4.0,
    completionPercent: 100,
    kpiMetric: 'Setup 100% sạch, build không lỗi',
    outcome: 'Dự án sẵn sàng phát triển thần tốc',
    assignedTo: 'Trịnh Minh Đức',
  },
  {
    id: 'task_14',
    title: 'Thiết kế wireframe hệ thống báo cáo 4 cấp độ',
    description: 'Xác định luồng tương tác giữa Ngày -> Tuần -> Tháng -> Năm',
    category: 'Marketing',
    status: 'completed',
    priority: 'high',
    date: day4Str,
    timeSpentHours: 3.0,
    completionPercent: 100,
    kpiMetric: 'Sơ đồ luồng logic 4 cấp độ báo cáo',
    outcome: 'Được phê duyệt bởi hội đồng chuyên môn',
    assignedTo: 'Trịnh Minh Đức',
  },
  // Toàn bộ 40 đầu việc Tháng 8/2026 của Ba Làng TH (Đồng bộ theo Google Sheet)
  ...AUGUST_TASKS,
];

export const INITIAL_DAILY_REPORTS: DailyReport[] = [
  ...AUGUST_DAILY_REPORTS,
  {
    id: `report_${todayStr}`,
    date: todayStr,
    tasks: INITIAL_TASKS.filter(t => t.date === todayStr),
    summary: `Báo cáo Ngày ${todayStr}: Hoàn thành 2/2 đầu việc trọng tâm bao gồm Dựng clip Kênh Bán Hàng và Lên lịch cụ thể cho từng ngày trong tuần. Tiến độ bám sát kế hoạch đề ra.`,
    productivityScore: 90,
    evaluationGrade: 'A+',
    highlights: [
      'Hoàn thành: Dựng clip Kênh Bán Hàng',
      'Đã lên lịch cụ thể cho từng ngày trong tuần',
    ],
    bottlenecks: [],
    aiAnalysis: {
      strengths: [
        'Hoàn thành dứt điểm clip bán hàng chất lượng cao.',
        'Kế hoạch làm việc tuần rõ ràng, mạch lạc.',
      ],
      improvements: [
        'Tiếp tục duy trì tính chủ động trong công việc.',
      ],
      workloadScore: 2,
      burnoutRisk: 'Thấp',
      recommendations: [
        'Tối ưu hóa thời gian xử lý thủ công.',
        'Tiếp tục duy trì tiến độ hoàn thiện video và kế hoạch tuần.',
      ],
      infographicSummary: 'Hiệu suất đạt 90/100 điểm (Hạng A+). Hoàn thành 100% mục tiêu quan trọng.',
    },
    author: 'Trịnh Minh Đức',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `report_${yesterdayStr}`,
    date: yesterdayStr,
    tasks: INITIAL_TASKS.filter(t => t.date === yesterdayStr),
    summary: `Báo cáo Ngày ${yesterdayStr}: Hoàn thành 100% các công việc với tổng thời gian 8.0h. Thiết lập trọn vẹn cấu trúc tuần, tháng và trực quan hóa biểu đồ phân bổ danh mục.`,
    productivityScore: 90,
    evaluationGrade: 'A+',
    highlights: [
      'Hoàn tất bộ lọc tùy chỉnh Ngày/Tháng/Năm linh hoạt.',
      'Thiết kế biểu đồ 3D phân bổ danh mục công việc sắc nét.',
    ],
    bottlenecks: [],
    aiAnalysis: {
      strengths: [
        '100% công việc hoàn thành đúng hạn.',
        'Phân bổ thời gian đồng đều giữa Marketing, Hỗ trợ và CV ngoài.',
      ],
      improvements: [
        'Nên bổ sung thêm các chỉ số đo lường định lượng cho các buổi họp.',
      ],
      workloadScore: 8,
      burnoutRisk: 'Thấp',
      recommendations: [
        'Tiếp tục giữ vững nhịp độ làm việc.',
      ],
      infographicSummary: 'Điểm hiệu suất 90/100 (Hạng A+). Hoàn thành trọn vẹn 3/3 mục tiêu trong ngày.',
    },
    author: 'Trịnh Minh Đức',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const INITIAL_FEEDBACK: ViewerFeedback[] = [];
