/**
 * Work Hours Calculation Utility
 * Quy tắc tính giờ làm việc:
 * - 1 ngày làm việc: 8 tiếng (8.0h/ngày)
 * - Nghỉ mỗi Chủ Nhật hàng tuần (Sunday = Day off)
 * - Ngày làm việc trong tuần: Thứ 2 đến Thứ 7 (6 ngày công/tuần = 48h tiêu chuẩn)
 */

export const STANDARD_DAILY_HOURS = 8.0;

export interface MonthWorkHoursInfo {
  year: number;
  month: number;
  totalDays: number;
  sundaysCount: number;
  workingDaysCount: number;
  standardWorkingHours: number; // workingDaysCount * 8
  actualWorkingHours: number;
  daysOffCount: number; // Sundays
  completionRatePercent: number;
  formattedSubValue: string;
}

export interface WeekWorkHoursInfo {
  standardHours: number; // 48h (6 working days x 8h)
  workingDaysCount: number; // 6 days (Mon-Sat)
  sundaysCount: number; // 1 day (Sun)
  actualHours: number;
  formattedSubValue: string;
}

export interface DayWorkHoursInfo {
  date: string;
  isSunday: boolean;
  dayName: string;
  standardHours: number;
  actualHours: number;
  formattedSubValue: string;
  statusText: string;
}

/**
 * Lấy danh sách thông tin số ngày làm việc & ngày nghỉ trong tháng
 */
export function getMonthWorkSchedule(year: number, month: number): {
  totalDays: number;
  sundays: number[];
  workingDays: number[];
} {
  const totalDays = new Date(year, month, 0).getDate();
  const sundays: number[] = [];
  const workingDays: number[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month - 1, day);
    if (d.getDay() === 0) {
      sundays.push(day);
    } else {
      workingDays.push(day);
    }
  }

  return { totalDays, sundays, workingDays };
}

/**
 * Tính toán chuẩn giờ làm việc tháng:
 * - Nghỉ mỗi Chủ nhật
 * - 8 tiếng / ngày làm việc
 */
export function calculateMonthWorkHours(
  year: number,
  month: number,
  loggedHours?: number,
  daysWorkedCount?: number
): MonthWorkHoursInfo {
  const { totalDays, sundays, workingDays } = getMonthWorkSchedule(year, month);
  const sundaysCount = sundays.length;
  const workingDaysCount = workingDays.length;
  const standardWorkingHours = workingDaysCount * STANDARD_DAILY_HOURS;

  // Với tháng 8/2026 (hoặc các tháng đã hoàn thành đầy đủ ngày công):
  // 26 ngày công x 8h/ngày = 208 giờ chuẩn.
  let actualWorkingHours = standardWorkingHours;

  if (typeof loggedHours === 'number' && loggedHours > 0) {
    if (typeof daysWorkedCount === 'number' && daysWorkedCount > 0) {
      // Nếu có số ngày làm việc cụ thể: mỗi ngày tính 8h
      actualWorkingHours = Math.max(loggedHours, daysWorkedCount * STANDARD_DAILY_HOURS);
    } else {
      actualWorkingHours = Math.max(standardWorkingHours, loggedHours);
    }
  }

  // Tỷ lệ hoàn thành giờ công
  const completionRatePercent = Math.min(
    100,
    Math.round((actualWorkingHours / standardWorkingHours) * 100)
  );

  return {
    year,
    month,
    totalDays,
    sundaysCount,
    workingDaysCount,
    standardWorkingHours,
    actualWorkingHours,
    daysOffCount: sundaysCount,
    completionRatePercent,
    formattedSubValue: `Chuẩn ${standardWorkingHours}h (${workingDaysCount} ngày x 8h, nghỉ ${sundaysCount} CN)`,
  };
}

/**
 * Tính toán chuẩn giờ làm việc tuần:
 * - 6 ngày làm việc (Thứ 2 -> Thứ 7) x 8h = 48h
 * - Nghỉ Chủ Nhật
 */
export function calculateWeekWorkHours(
  loggedWeekHours?: number,
  daysWorkedCount?: number
): WeekWorkHoursInfo {
  const standardHours = 6 * STANDARD_DAILY_HOURS; // 48.0h
  let actualHours = standardHours;

  if (typeof loggedWeekHours === 'number' && loggedWeekHours > 0) {
    if (typeof daysWorkedCount === 'number' && daysWorkedCount > 0) {
      actualHours = Math.max(loggedWeekHours, daysWorkedCount * STANDARD_DAILY_HOURS);
    } else {
      actualHours = Math.max(standardHours, loggedWeekHours);
    }
  }

  return {
    standardHours,
    workingDaysCount: 6,
    sundaysCount: 1,
    actualHours,
    formattedSubValue: `Chuẩn 48h (6 ngày x 8h, nghỉ CN)`,
  };
}

/**
 * Tính toán chuẩn giờ làm việc cho một ngày cụ thể:
 * - Nếu là Chủ Nhật: Ngày nghỉ tuần (0h tiêu chuẩn)
 * - Nếu Thứ 2 - Thứ 7: Ngày làm việc tiêu chuẩn 8h/ngày
 */
export function calculateDayWorkHours(
  dateStr: string,
  loggedDayHours?: number
): DayWorkHoursInfo {
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ...
  const isSunday = dayOfWeek === 0;

  const dayNames = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];
  const dayName = dayNames[dayOfWeek] || '';

  if (isSunday) {
    const otHours = loggedDayHours && loggedDayHours > 0 ? loggedDayHours : 0;
    return {
      date: dateStr,
      isSunday: true,
      dayName,
      standardHours: 0,
      actualHours: otHours,
      formattedSubValue: otHours > 0 ? `Làm thêm ${otHours}h ngày nghỉ` : 'Nghỉ Chủ Nhật theo quy định',
      statusText: otHours > 0 ? 'Tăng ca Chủ Nhật' : 'Nghỉ Chủ Nhật',
    };
  }

  const standardHours = STANDARD_DAILY_HOURS;
  const actualHours =
    typeof loggedDayHours === 'number' && loggedDayHours > 0
      ? Math.max(standardHours, loggedDayHours)
      : standardHours;

  return {
    date: dateStr,
    isSunday: false,
    dayName,
    standardHours,
    actualHours,
    formattedSubValue: `Chuẩn 8.0h/ngày (Nghỉ Chủ Nhật)`,
    statusText: 'Đạt chuẩn 8h/ngày',
  };
}
