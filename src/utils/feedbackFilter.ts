import { ViewerFeedback } from '../types';

export const MOCK_FEEDBACK_NAMES = [
  'Nguyễn Hồng Quân',
  'Lê Thùy Dung',
  'Trần Đình Trọng',
  'Hoàng Minh Tuấn',
  'Phạm Thu Trang',
];

export const MOCK_FEEDBACK_IDS = ['fb_1', 'fb_2', 'fb_3', 'fb_4', 'fb_5'];

/**
 * Kiểm tra xem một đánh giá có phải là đánh giá ảo / mẫu ban đầu hay không.
 * Đảm bảo loại bỏ 100% đánh giá ảo khỏi hệ thống.
 */
export function isMockFeedback(fb: any): boolean {
  if (!fb) return true;
  if (MOCK_FEEDBACK_IDS.includes(fb.id)) return true;
  if (typeof fb.id === 'string' && (fb.id.startsWith('mock_') || /^fb_[1-9]$/.test(fb.id))) return true;
  if (typeof fb.userName === 'string' && MOCK_FEEDBACK_NAMES.includes(fb.userName.trim())) return true;
  if (fb.isMock === true) return true;
  return false;
}

/**
 * Lọc và chỉ giữ lại những đánh giá thật từ người dùng đã tạo tài khoản thực tế.
 */
export function filterRealFeedbacks(feedbacks: ViewerFeedback[] = []): ViewerFeedback[] {
  if (!Array.isArray(feedbacks)) return [];
  return feedbacks.filter((f) => !isMockFeedback(f));
}
