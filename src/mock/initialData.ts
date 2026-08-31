import { DailyReport, TaskItem, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    username: 'admin',
    name: 'Nguyễn Thành Nam (Quản Trị Viên)',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'admin@workreport3d.pro',
    title: 'Lead Architect / Trưởng Nhóm Điều Hành',
  },
  {
    id: 'user_viewer',
    username: 'viewer',
    name: 'Trần Minh Đức (Người Xem)',
    role: 'viewer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
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
  // Today's tasks
  {
    id: 'task_1',
    title: 'Thiết kế giao diện 3D Cyber Workspace & Glassmorphism',
    description: 'Xây dựng Canvas WebGL Three.js tương tác hạt và đổ bóng 3D trực quan cho trang báo cáo',
    category: 'Thiết kế',
    status: 'completed',
    priority: 'high',
    date: todayStr,
    timeSpentHours: 3.5,
    completionPercent: 100,
    kpiMetric: 'Hoàn thành 4/4 khối viewport 3D đạt 60fps',
    outcome: 'Giao diện chạy mượt mà, hiệu ứng parallax sống động',
    assignedTo: 'Nguyễn Thành Nam',
    tags: ['UI/UX', 'Three.js', '3D UI'],
  },
  {
    id: 'task_2',
    title: 'Phát triển module bóc tách Sheet/Excel tự động',
    description: 'Hỗ trợ kéo thả file .xlsx, .csv và paste dữ liệu từ Google Sheets với auto column mapping',
    category: 'Phát triển',
    status: 'completed',
    priority: 'high',
    date: todayStr,
    timeSpentHours: 2.5,
    completionPercent: 100,
    kpiMetric: 'Parse 100% các cột Tên việc, Giờ, Trạng thái, KPI',
    outcome: 'Đã test thành công với 5 mẫu file Excel doanh nghiệp',
    assignedTo: 'Nguyễn Thành Nam',
    tags: ['Sheet Parser', 'Excel', 'Data Import'],
  },
  {
    id: 'task_3',
    title: 'Tích hợp AI Gemini đánh giá & tái thiết kế báo cáo',
    description: 'Tự động tính điểm hiệu suất, phân tích thế mạnh, điểm nghẽn và đo lường rủi ro công việc',
    category: 'Phát triển',
    status: 'completed',
    priority: 'high',
    date: todayStr,
    timeSpentHours: 2.0,
    completionPercent: 100,
    kpiMetric: 'Thời gian phản hồi AI < 1.5s, xuất Infographic đầy đủ',
    outcome: 'Xuất sắc đạt điểm A+ với đầy đủ khuyến nghị tối ưu',
    assignedTo: 'Nguyễn Thành Nam',
    tags: ['Gemini AI', 'Analytics', 'Infographic'],
  },
  {
    id: 'task_4',
    title: 'Kiểm thử phân quyền Admin & Viewer',
    description: 'Đảm bảo Admin có toàn quyền chỉnh sửa và Viewer xem an toàn, bảo mật dữ liệu',
    category: 'Quản trị',
    status: 'in_progress',
    priority: 'medium',
    date: todayStr,
    timeSpentHours: 1.0,
    completionPercent: 80,
    kpiMetric: 'Phân quyền chính xác 100% theo vai trò',
    outcome: 'Đã hoàn thành kiểm thử giao diện và API',
    assignedTo: 'Nguyễn Thành Nam',
    tags: ['Auth', 'Security', 'RBAC'],
  },

  // Yesterday's tasks
  {
    id: 'task_5',
    title: 'Xây dựng cấu trúc Dashboard Báo cáo Tuần & Tháng',
    description: 'Thiết kế bộ lọc ngày tháng năm tùy chỉnh và các biểu đồ thống kê năng suất tuần',
    category: 'Phát triển',
    status: 'completed',
    priority: 'high',
    date: yesterdayStr,
    timeSpentHours: 4.0,
    completionPercent: 100,
    kpiMetric: 'Liên kết 7 ngày trong tuần vào bộ lọc',
    outcome: 'Bộ lọc hoạt động mượt mà, phản hồi tức thì',
    assignedTo: 'Nguyễn Thành Nam',
  },
  {
    id: 'task_6',
    title: 'Lập biểu đồ đo lường tiến độ theo danh mục công việc',
    description: 'Trực quan hóa tỷ lệ phần trăm giờ làm việc theo Phát triển, Thiết kế, Quản trị, Marketing',
    category: 'Thiết kế',
    status: 'completed',
    priority: 'medium',
    date: yesterdayStr,
    timeSpentHours: 2.5,
    completionPercent: 100,
    kpiMetric: 'Biểu đồ tròn 3D & Biểu đồ cột tương tác',
    outcome: 'Dữ liệu phân bổ rõ ràng, trực quan',
    assignedTo: 'Nguyễn Thành Nam',
  },
  {
    id: 'task_7',
    title: 'Họp rà soát tiến độ và phân chia công việc tuần',
    description: 'Thảo luận các tính năng trọng tâm và chuẩn bị kịch bản đo lường hiệu suất',
    category: 'Quản trị',
    status: 'completed',
    priority: 'low',
    date: yesterdayStr,
    timeSpentHours: 1.5,
    completionPercent: 100,
    kpiMetric: 'Thống nhất 100% các mục tiêu sprint',
    outcome: 'Biên bản cuộc họp được gửi tới toàn bộ thành viên',
    assignedTo: 'Nguyễn Thành Nam',
  },

  // Day -2
  {
    id: 'task_8',
    title: 'Nghiên cứu kiến trúc 3D Three.js và Motion layout',
    description: 'Đánh giá hiệu năng card tilt 3D, perspective depth và shader ánh sáng',
    category: 'Nghiên cứu',
    status: 'completed',
    priority: 'high',
    date: day2Str,
    timeSpentHours: 3.5,
    completionPercent: 100,
    kpiMetric: 'Đạt chuẩn 60fps trên cả thiết bị di động',
    outcome: 'Chọn giải pháp Three.js kết hợp Tailwind CSS 3D',
    assignedTo: 'Nguyễn Thành Nam',
  },
  {
    id: 'task_9',
    title: 'Xây dựng API Backend Express và middleware',
    description: 'Thiết lập các endpoint phân tích báo cáo và tích hợp Gemini API an toàn',
    category: 'Phát triển',
    status: 'completed',
    priority: 'high',
    date: day2Str,
    timeSpentHours: 3.0,
    completionPercent: 100,
    kpiMetric: '3 API endpoint hoàn chỉnh với error handling',
    outcome: 'Server phản hồi chuẩn format JSON',
    assignedTo: 'Nguyễn Thành Nam',
  },
  {
    id: 'task_10',
    title: 'Xử lý dữ liệu bảng tính demo và case study thực tế',
    description: 'Chuẩn bị dữ liệu mẫu báo cáo ngày, tuần, tháng, năm chân thực',
    category: 'Kinh doanh',
    status: 'completed',
    priority: 'medium',
    date: day2Str,
    timeSpentHours: 1.5,
    completionPercent: 100,
    kpiMetric: '50+ đầu việc trải đều các phòng ban',
    outcome: 'Bộ dữ liệu phong phú, sinh động',
    assignedTo: 'Nguyễn Thành Nam',
  },

  // Day -3
  {
    id: 'task_11',
    title: 'Tối ưu hóa UI/UX trên màn hình rộng & Tablet',
    description: 'Cân đối không gian hiển thị, căn lề và hiệu ứng neon hover',
    category: 'Thiết kế',
    status: 'completed',
    priority: 'medium',
    date: day3Str,
    timeSpentHours: 3.0,
    completionPercent: 100,
    kpiMetric: 'Đáp ứng 100% tiêu chuẩn responsive',
    outcome: 'Giao diện hiển thị sắc nét trên mọi thiết bị',
    assignedTo: 'Nguyễn Thành Nam',
  },
  {
    id: 'task_12',
    title: 'Phát triển tính năng Xuất Báo Cáo PDF & Markdown',
    description: 'Hỗ trợ in ấn trực tiếp, sao chép định dạng chuyên nghiệp gửi đối tác',
    category: 'Phát triển',
    status: 'completed',
    priority: 'medium',
    date: day3Str,
    timeSpentHours: 2.5,
    completionPercent: 100,
    kpiMetric: 'Hỗ trợ 3 định dạng: PDF In, Thẻ ảnh 3D, Markdown',
    outcome: 'Xuất bản nhanh chóng, thiết kế sang trọng',
    assignedTo: 'Nguyễn Thành Nam',
  },

  // Day -4
  {
    id: 'task_13',
    title: 'Khởi tạo kiến trúc dự án và thiết lập môi trường',
    description: 'Cài đặt các gói phụ thuộc, TypeScript, Tailwind CSS v4, Lucide icons',
    category: 'Phát triển',
    status: 'completed',
    priority: 'high',
    date: day4Str,
    timeSpentHours: 4.0,
    completionPercent: 100,
    kpiMetric: 'Setup 100% sạch, build không lỗi',
    outcome: 'Dự án sẵn sàng phát triển thần tốc',
    assignedTo: 'Nguyễn Thành Nam',
  },
  {
    id: 'task_14',
    title: 'Thiết kế wireframe hệ thống báo cáo 4 cấp độ',
    description: 'Xác định luồng tương tác giữa Ngày -> Tuần -> Tháng -> Năm',
    category: 'Thiết kế',
    status: 'completed',
    priority: 'high',
    date: day4Str,
    timeSpentHours: 3.0,
    completionPercent: 100,
    kpiMetric: 'Sơ đồ luồng logic 4 cấp độ báo cáo',
    outcome: 'Được phê duyệt bởi hội đồng chuyên môn',
    assignedTo: 'Nguyễn Thành Nam',
  },
];

export const INITIAL_DAILY_REPORTS: DailyReport[] = [
  {
    id: `report_${todayStr}`,
    date: todayStr,
    tasks: INITIAL_TASKS.filter(t => t.date === todayStr),
    summary: `Báo cáo Ngày ${todayStr}: Hoàn thành xuất sắc 3/4 công việc trọng điểm bao gồm tích hợp Three.js 3D không gian sống động, bộ xử lý file Sheet/Excel và động cơ AI đo lường hiệu suất. Năng suất vượt 15% so với mức kỳ vọng.`,
    productivityScore: 94,
    evaluationGrade: 'A+',
    highlights: [
      'Xây dựng thành công Canvas 3D mượt mà với 60fps.',
      'Bộ bóc tách dữ liệu Sheet/Excel parse chính xác 100% cấu trúc cột.',
      'Động cơ AI đánh giá năng suất và đưa ra gợi ý hành động cụ thể.',
    ],
    bottlenecks: [
      'Cần hoàn thiện nốt bước kiểm thử phân quyền cuối cùng trước khi bàn giao.',
    ],
    aiAnalysis: {
      strengths: [
        'Tập trung cao độ vào các tính năng kỹ thuật cốt lõi.',
        'Thời gian làm việc hiệu quả (9.0h với 3.5h Deep Work chất lượng).',
        'Tỷ lệ hoàn thành công việc đạt 95%.',
      ],
      improvements: [
        'Nên dành 15 phút đầu ngày để ưu tiên thứ tự công việc nhằm giảm tải cuối ngày.',
      ],
      workloadScore: 9,
      burnoutRisk: 'Thấp',
      recommendations: [
        'Duy trì cường độ và chuẩn bị chuyển giao tài liệu cho người xem (Viewer).',
        'Tận dụng tính năng xuất báo cáo PDF để lưu trữ định kỳ.',
      ],
      infographicSummary: 'Hiệu suất đạt 94/100 điểm (Hạng A+). Năng suất bứt phá với các tính năng 3D & AI đột phá.',
    },
    author: 'Nguyễn Thành Nam',
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
        'Phân bổ thời gian đồng đều giữa Phát triển, Thiết kế và Quản trị.',
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
    author: 'Nguyễn Thành Nam',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
