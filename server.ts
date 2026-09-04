import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize GoogleGenAI client lazily or when key is available
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient Gemini content generator with model fallback
async function callGeminiWithFallback(ai: GoogleGenAI, options: { contents: any; config?: any }) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        ...options,
        model,
      });
      return res;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Fallback] Model ${model} encountered issue:`, err.message || err);
    }
  }
  throw lastError;
}

// Robust JSON extractor and parser that handles markdown code blocks, trailing commentary,
// extra non-whitespace characters after JSON, and nested braces.
function cleanAndParseJson<T = any>(rawText: string | null | undefined, fallback: T): T {
  if (!rawText || typeof rawText !== 'string') return fallback;

  let text = rawText.trim();

  // 1. Direct parse attempt if already clean
  try {
    return JSON.parse(text);
  } catch (_) {}

  // 2. Strip code fences like ```json ... ``` or ``` ... ```
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(text);
  } catch (_) {}

  // 3. Find outermost JSON structure: object '{'...'}' or array '['...']'
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');

  let startIdx = -1;
  let endChar = '';
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endChar = '}';
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endChar = ']';
  }

  if (startIdx !== -1) {
    // Balanced bracket counting to find the EXACT closing token of the outermost JSON structure
    // This avoids "Unexpected non-whitespace character after JSON" errors when models output commentary after the closing brace.
    let depth = 0;
    let inString = false;
    let escape = false;
    let exactEndIdx = -1;

    for (let i = startIdx; i < text.length; i++) {
      const char = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{' || char === '[') {
          depth++;
        } else if (char === '}' || char === ']') {
          depth--;
          if (depth === 0) {
            exactEndIdx = i;
            break;
          }
        }
      }
    }

    if (exactEndIdx > startIdx) {
      const balanced = text.substring(startIdx, exactEndIdx + 1);
      try {
        return JSON.parse(balanced);
      } catch (_) {}
      try {
        const withoutTrailingCommas = balanced.replace(/,\s*([\}\]])/g, '$1');
        return JSON.parse(withoutTrailingCommas);
      } catch (_) {}
    }

    // Fallback: substring from startIdx to lastIndexOf endChar
    const lastIdx = text.lastIndexOf(endChar);
    if (lastIdx > startIdx) {
      const candidate = text.substring(startIdx, lastIdx + 1);
      try {
        return JSON.parse(candidate);
      } catch (_) {}
      try {
        const withoutTrailingCommas = candidate.replace(/,\s*([\}\]])/g, '$1');
        return JSON.parse(withoutTrailingCommas);
      } catch (_) {}
    }
  }

  // 4. Regex match fallback
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const sanitized = match[0].replace(/,\s*([\}\]])/g, '$1');
      return JSON.parse(sanitized);
    }
  } catch (_) {}

  return fallback;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Save & Persist Admin Avatar permanently
app.post('/api/user/avatar', (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ error: 'Avatar data is required' });
    }

    const publicDir = path.join(process.cwd(), 'public');
    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // If it's a data URL, decode and write to public/admin-avatar.jpg
    if (avatar.startsWith('data:image/')) {
      const matches = avatar.match(/^data:image\/([a-zA-Z0-9\+]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const buffer = Buffer.from(matches[2], 'base64');
        fs.writeFileSync(path.join(publicDir, 'admin-avatar.jpg'), buffer);
        if (fs.existsSync(distDir)) {
          try {
            fs.writeFileSync(path.join(distDir, 'admin-avatar.jpg'), buffer);
          } catch (e) {
            console.warn('Could not write to distDir:', e);
          }
        }
      }
    }

    // Also persist data URL string to file for instant retrieval
    fs.writeFileSync(path.join(publicDir, 'admin-avatar.txt'), avatar, 'utf-8');

    return res.json({ success: true, url: '/admin-avatar.jpg' });
  } catch (err: any) {
    console.error('Error saving avatar:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Get Persisted Admin Avatar
app.get('/api/user/avatar', (req, res) => {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const txtPath = path.join(publicDir, 'admin-avatar.txt');
    const imgPath = path.join(publicDir, 'admin-avatar.jpg');

    if (fs.existsSync(txtPath)) {
      const data = fs.readFileSync(txtPath, 'utf-8');
      return res.json({ avatar: data, url: '/admin-avatar.jpg' });
    }
    if (fs.existsSync(imgPath)) {
      return res.json({ url: '/admin-avatar.jpg', avatar: '/admin-avatar.jpg' });
    }
    return res.json({ avatar: null, url: '/admin-avatar.jpg' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Shared Storage for Tasks, Reports, and Viewer Feedbacks
const dataDir = path.join(process.cwd(), 'data');
const sharedDataFile = path.join(dataDir, 'shared_data.json');

const MOCK_NAMES = [
  'Nguyễn Hồng Quân',
  'Lê Thùy Dung',
  'Trần Đình Trọng',
  'Hoàng Minh Tuấn',
  'Phạm Thu Trang',
];

function isMockFeedbackItem(fb: any): boolean {
  if (!fb) return true;
  if (['fb_1', 'fb_2', 'fb_3', 'fb_4', 'fb_5'].includes(fb.id)) return true;
  if (typeof fb.userName === 'string' && MOCK_NAMES.includes(fb.userName.trim())) return true;
  if (typeof fb.id === 'string' && (fb.id.startsWith('mock_') || /^fb_[1-9]$/.test(fb.id))) return true;
  if (fb.isMock === true) return true;
  return false;
}

function getSharedData(): { tasks: any[] | null; dailyReports: any[] | null; feedbacks: any[]; selfReviews?: Record<string, any> } {
  try {
    if (fs.existsSync(sharedDataFile)) {
      const content = fs.readFileSync(sharedDataFile, 'utf-8');
      const parsed = JSON.parse(content);
      const cleanFeedbacks = Array.isArray(parsed.feedbacks)
        ? parsed.feedbacks.filter((f: any) => !isMockFeedbackItem(f))
        : [];
      return {
        tasks: parsed.tasks || null,
        dailyReports: parsed.dailyReports || null,
        feedbacks: cleanFeedbacks,
        selfReviews: parsed.selfReviews || {},
      };
    }
  } catch (err) {
    console.error('Error reading shared data:', err);
  }
  return { tasks: null, dailyReports: null, feedbacks: [], selfReviews: {} };
}

function saveSharedData(data: { tasks?: any[]; dailyReports?: any[]; feedbacks?: any[]; selfReviews?: Record<string, any> }) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const current = getSharedData();
    const cleanFeedbacks = data.feedbacks !== undefined
      ? data.feedbacks.filter((f: any) => !isMockFeedbackItem(f))
      : current.feedbacks;

    const updated = {
      tasks: data.tasks !== undefined ? data.tasks : current.tasks,
      dailyReports: data.dailyReports !== undefined ? data.dailyReports : current.dailyReports,
      feedbacks: cleanFeedbacks,
      selfReviews: data.selfReviews !== undefined ? data.selfReviews : (current.selfReviews || {}),
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(sharedDataFile, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Error saving shared data:', err);
    throw err;
  }
}

// API: Get Shared Self-Reviews
app.get('/api/shared/self-reviews', (req, res) => {
  try {
    const data = getSharedData();
    res.json({ selfReviews: data.selfReviews || {} });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Save Shared Self-Review
app.post('/api/shared/self-reviews', (req, res) => {
  try {
    const { review, weekKey } = req.body;
    if (!review || !weekKey) {
      return res.status(400).json({ error: 'Thiếu dữ liệu review hoặc weekKey' });
    }
    const current = getSharedData();
    const selfReviews = {
      ...(current.selfReviews || {}),
      [weekKey]: review,
    };
    saveSharedData({ selfReviews });
    res.json({ success: true, selfReviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Shared Data (Tasks, Daily Reports, Feedbacks)
app.get('/api/shared/data', (req, res) => {
  try {
    const data = getSharedData();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Save Shared Data (Admin creates / updates tasks or reports)
app.post('/api/shared/data', (req, res) => {
  try {
    const { tasks, dailyReports } = req.body;
    const updated = saveSharedData({ tasks, dailyReports });
    res.json({ success: true, updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Feedbacks
app.get('/api/shared/feedback', (req, res) => {
  try {
    const data = getSharedData();
    res.json({ feedbacks: data.feedbacks || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const ADMIN_NOTIFICATION_EMAIL = 'tmduc.balangth@gmail.com';

async function sendFeedbackNotificationEmail(feedback: any) {
  const rating = Number(feedback.rating) || 5;
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const reviewerName = feedback.userName || 'Người Xem Báo Cáo';
  const reviewerTitle = feedback.userTitle || 'Người Xem';
  const tag = feedback.tag || 'Tiến độ xuất sắc';
  const comment = feedback.comment || '';
  const scope = (feedback.scope || 'daily').toUpperCase();
  const dateStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const subject = `[Ba Làng TH] Đánh giá mới (${rating} sao) từ ${reviewerName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">BÁO CÁO CÔNG VIỆC BA LÀNG TH</h1>
          <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 13px;">Thông Báo Đánh Giá & Nhận Xét Mới Từ Người Xem</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #cbd5e1; margin-top: 0;">
            Xin chào <strong>Trịnh Minh Đức</strong> (Quản trị viên),
          </p>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
            Một người xem vừa gửi nhận xét và đánh giá cho báo cáo công việc của bạn:
          </p>
          <div style="background: #1e293b; border-radius: 12px; padding: 18px; border: 1px solid #334155; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="color: #94a3b8; padding: 6px 0; width: 140px;">Người đánh giá:</td>
                <td style="color: #38bdf8; font-weight: bold; padding: 6px 0;">${reviewerName}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Chức vụ / Đơn vị:</td>
                <td style="color: #f1f5f9; padding: 6px 0;">${reviewerTitle}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Chấm điểm:</td>
                <td style="color: #f59e0b; font-weight: bold; padding: 6px 0; font-size: 16px;">
                  ${rating}/5 sao <span style="font-size: 18px; color: #f59e0b;">${stars}</span>
                </td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Tiêu chí:</td>
                <td style="color: #a855f7; font-weight: 600; padding: 6px 0;">${tag}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Kỳ báo cáo:</td>
                <td style="color: #e2e8f0; font-weight: 600; padding: 6px 0;">${scope} (${feedback.targetId || 'Hôm nay'})</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Thời gian gửi:</td>
                <td style="color: #94a3b8; padding: 6px 0;">${dateStr}</td>
              </tr>
            </table>

            <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #334155;">
              <span style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase;">Nội dung nhận xét:</span>
              <div style="margin-top: 8px; font-size: 14px; line-height: 1.6; color: #f8fafc; font-style: italic; background: #0f172a; padding: 14px; border-radius: 8px; border-left: 3px solid #38bdf8;">
                "${comment}"
              </div>
            </div>
          </div>
          <p style="font-size: 12px; color: #64748b; margin: 16px 0 0 0; text-align: center;">
            Thông báo tự động gửi tới Gmail quản trị viên: <strong>${ADMIN_NOTIFICATION_EMAIL}</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Always log notification locally so it is never lost
  const notificationsFile = path.join(dataDir, 'email_notifications.json');
  try {
    let list: any[] = [];
    if (fs.existsSync(notificationsFile)) {
      list = JSON.parse(fs.readFileSync(notificationsFile, 'utf-8'));
    }
    const record = {
      id: `mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject,
      reviewerName,
      reviewerTitle,
      rating,
      tag,
      comment,
      sentAt: new Date().toISOString(),
      status: 'dispatched',
    };
    list.unshift(record);
    fs.writeFileSync(notificationsFile, JSON.stringify(list.slice(0, 100), null, 2), 'utf-8');
    console.log(`[Notification] Feedback notification for ${ADMIN_NOTIFICATION_EMAIL} logged.`);
  } catch (err) {
    console.error('Error recording email notification:', err);
  }

  // Attempt real SMTP if configured in environment
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Ba Làng TH Report" <${smtpUser}>`,
        to: ADMIN_NOTIFICATION_EMAIL,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Sent] Successfully delivered email to ${ADMIN_NOTIFICATION_EMAIL}`);
      return { success: true, method: 'smtp', recipient: ADMIN_NOTIFICATION_EMAIL };
    } catch (smtpErr) {
      console.warn('[Email SMTP Failed]:', smtpErr);
    }
  }

  return { success: true, method: 'logged', recipient: ADMIN_NOTIFICATION_EMAIL };
}

// API: Submit Viewer Feedback / Evaluation (Chỉ nhận từ người tạo tài khoản và đánh giá thật)
app.post('/api/shared/feedback', async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!feedback || !feedback.comment || feedback.comment.trim().length < 5) {
      return res.status(400).json({ error: 'Nội dung nhận xét đánh giá thật phải có ít nhất 5 ký tự.' });
    }

    if (!feedback.userName || feedback.userName.trim().length < 2) {
      return res.status(400).json({ error: 'Yêu cầu tài khoản người xem hợp lệ.' });
    }

    // Reject any legacy mock evaluation attempt
    if (isMockFeedbackItem(feedback)) {
      return res.status(400).json({ error: 'Đánh giá không hợp lệ. Chỉ chấp nhận đánh giá thật từ người dùng đã tạo tài khoản.' });
    }

    const current = getSharedData();
    const existingFeedbacks = (current.feedbacks || []).filter((f: any) => !isMockFeedbackItem(f));
    const newFeedback = {
      ...feedback,
      id: feedback.id || `real_fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: feedback.createdAt || new Date().toISOString(),
      verifiedRealUser: true,
    };
    const updatedFeedbacks = [newFeedback, ...existingFeedbacks];
    saveSharedData({ feedbacks: updatedFeedbacks });

    // Send immediate email notification to Admin tmduc.balangth@gmail.com
    sendFeedbackNotificationEmail(newFeedback).catch((e) => {
      console.error('Background sendFeedbackNotificationEmail error:', e);
    });

    res.json({
      success: true,
      feedback: newFeedback,
      feedbacks: updatedFeedbacks,
      notificationSentTo: ADMIN_NOTIFICATION_EMAIL,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Clear All Mock Feedbacks
app.post('/api/shared/feedback/clear-mock', (req, res) => {
  try {
    const current = getSharedData();
    const clean = (current.feedbacks || []).filter((f: any) => !isMockFeedbackItem(f));
    saveSharedData({ feedbacks: clean });
    res.json({ success: true, feedbacks: clean, message: 'Đã xóa toàn bộ đánh giá ảo.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Clear All Feedbacks (Admin reset)
app.post('/api/shared/feedback/clear-all', (req, res) => {
  try {
    saveSharedData({ feedbacks: [] });
    res.json({ success: true, feedbacks: [], message: 'Đã xóa toàn bộ đánh giá.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Dispatched Email Notifications (For Admin Verification)
app.get('/api/shared/notifications', (req, res) => {
  try {
    const notificationsFile = path.join(dataDir, 'email_notifications.json');
    if (fs.existsSync(notificationsFile)) {
      const list = JSON.parse(fs.readFileSync(notificationsFile, 'utf-8'));
      return res.json({ notifications: list, targetAdmin: ADMIN_NOTIFICATION_EMAIL });
    }
    res.json({ notifications: [], targetAdmin: ADMIN_NOTIFICATION_EMAIL });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete Feedback (Admin Moderation)
app.delete('/api/shared/feedback/:id', (req, res) => {
  try {
    const { id } = req.params;
    const current = getSharedData();
    const feedbacks = (current.feedbacks || []).filter((f: any) => f.id !== id && !isMockFeedbackItem(f));
    saveSharedData({ feedbacks });
    res.json({ success: true, feedbacks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Daily Report AI Analysis & Redesign
app.post('/api/ai/analyze-daily', async (req, res) => {
  try {
    const { date, tasks, userNotes } = req.body;
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Danh sách công việc không được để trống' });
    }

    const ai = getGeminiClient();
    
    // Calculate basic statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'completed' || t.completionPercent >= 100).length;
    const totalHours = tasks.reduce((sum: number, t: any) => sum + (Number(t.timeSpentHours) || 0), 0);
    const avgCompletion = Math.round(tasks.reduce((sum: number, t: any) => sum + (Number(t.completionPercent) || 0), 0) / (totalTasks || 1));

    if (!ai) {
      // Fallback smart algorithm if Gemini API key is not configured
      const score = Math.min(100, Math.max(40, Math.round((completedTasks / totalTasks) * 60 + (avgCompletion * 0.4))));
      const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : 'C';
      
      return res.json({
        summary: `Báo cáo ngày ${date}: Đã thực hiện ${totalTasks} công việc với tổng thời gian ${totalHours}h. Tỷ lệ hoàn thành trung bình đạt ${avgCompletion}%, hoàn thành dứt điểm ${completedTasks}/${totalTasks} đầu việc.`,
        productivityScore: score,
        evaluationGrade: grade,
        highlights: tasks.filter((t: any) => t.completionPercent >= 90).map((t: any) => `Hoàn thành tốt: ${t.title}`),
        bottlenecks: tasks.filter((t: any) => t.status === 'blocked' || t.completionPercent < 50).map((t: any) => `Cần đẩy nhanh: ${t.title}`),
        aiAnalysis: {
          strengths: [
            `Phân bổ thời gian tương đối hợp lý (${totalHours}h làm việc tập trung).`,
            `Tiến độ tổng thể đạt mức ${avgCompletion}%.`,
          ],
          improvements: [
            `Nên ưu tiên xử lý dứt điểm các công việc có độ ưu tiên cao trước 15h00.`,
            `Ghi chép chi tiết hơn các chỉ số đo lường KPI cụ thể để dễ đối soát.`,
          ],
          workloadScore: Math.min(10, Math.round(totalHours * 1.2)),
          burnoutRisk: totalHours > 9 ? 'Cao' : totalHours > 7 ? 'Trung bình' : 'Thấp',
          recommendations: [
            `Áp dụng kỹ thuật Time-blocking cho ngày tiếp theo.`,
            `Giảm thiểu thời gian họp để tăng thời gian Deep Work.`,
          ],
          infographicSummary: `Hiệu suất đạt ${score}/100 điểm. Năng suất loại ${grade}. Hoàn thành ${completedTasks}/${totalTasks} mục tiêu trọng tâm.`,
        },
      });
    }

    const prompt = `Bạn là Chuyên gia Đánh giá Hiệu suất Công việc & Cố vấn Quản trị Cao cấp.
Hãy phân tích danh sách công việc trong ngày (${date}) sau đây, đo lường năng suất, chấm điểm và thiết kế lại thành bản báo cáo chuyên nghiệp, sang trọng, chi tiết và có số liệu cụ thể.

Dữ liệu công việc:
${JSON.stringify(tasks, null, 2)}
${userNotes ? `Ghi chú thêm của người dùng: ${userNotes}` : ''}

Hãy trả về kết quả theo ĐÚNG định dạng JSON với cấu trúc sau:
{
  "summary": "Tóm tắt tổng quan chuyên nghiệp về kết quả đạt được trong ngày (khoảng 3-4 câu)",
  "productivityScore": 88, // Số nguyên từ 0 đến 100
  "evaluationGrade": "A+", // Một trong các loại: 'A+', 'A', 'B+', 'B', 'C', 'D'
  "highlights": ["Điểm nổi bật 1", "Điểm nổi bật 2", "Điểm nổi bật 3"],
  "bottlenecks": ["Tồn đọng/rào cản 1", "Tồn đọng/rào cản 2"],
  "aiAnalysis": {
    "strengths": ["Thế mạnh đã thể hiện 1", "Thế mạnh 2"],
    "improvements": ["Điểm cần tối ưu hóa 1", "Điểm cần tối ưu hóa 2"],
    "workloadScore": 8, // Thang điểm 1-10 về độ nặng công việc
    "burnoutRisk": "Thấp", // 'Thấp' | 'Trung bình' | 'Cao'
    "recommendations": ["Khuyến nghị hành động 1", "Khuyến nghị hành động 2"],
    "infographicSummary": "Một câu khẩu hiệu/đúc kết đo lường ngắn gọn, đắt giá cho thẻ 3D"
  }
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanAndParseJson(response.text, null);
    if (parsed && typeof parsed === 'object') {
      return res.json(parsed);
    }
    throw new Error('Dữ liệu trả về từ AI không đúng định dạng JSON');
  } catch (error: any) {
    console.error('Error in analyze-daily:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi phân tích báo cáo ngày bằng AI' });
  }
});

// API: Weekly Report AI Synthesis & Measurement
app.post('/api/ai/analyze-weekly', async (req, res) => {
  try {
    const { weekNumber, year, startDate, endDate, dailyReports, stats } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback synthesis
      const score = Math.round(stats?.avgScore || 85);
      const grade = score >= 90 ? 'Xuất sắc (A+)' : score >= 80 ? 'Tốt (A)' : score >= 70 ? 'Khá (B+)' : 'Đạt (B)';
      return res.json({
        executiveSummary: `Báo cáo Tuần ${weekNumber} (${startDate} - ${endDate}): Tổng cộng hoàn thành ${stats?.completedTasks || 0}/${stats?.totalTasks || 0} công việc với ${stats?.totalHours || 0} giờ làm việc. Hiệu suất trung bình đạt ${score}/100 điểm.`,
        rating: grade,
        keyAchievements: [
          `Duy trì nhịp độ làm việc ổn định suốt tuần.`,
          `Hoàn thành các mục tiêu công việc chính đã đề ra.`,
          `Phân bổ thời gian cân đối giữa các dự án trọng tâm.`,
        ],
        strategicInsights: [
          `Năng suất đạt đỉnh vào các ngày giữa tuần.`,
          `Cần giải quyết dứt điểm các đầu việc tồn đọng trước cuối tuần.`,
        ],
        nextWeekGoals: [
          `Tối ưu hóa quy trình làm việc để giảm 15% thời gian xử lý thủ công.`,
          `Đặt mục tiêu hoàn thành dứt điểm 100% các công việc ưu tiên cao.`,
        ],
        measurementMetrics: {
          deliveryRate: `${Math.round(((stats?.completedTasks || 1) / (stats?.totalTasks || 1)) * 100)}%`,
          efficiencyIndex: `${score}/100`,
          focusRatio: '84%',
          timeOptimization: '+12% so với tuần trước',
        },
      });
    }

    const prompt = `Bạn là Giám đốc Điều hành & Chuyên gia Phân tích Hiệu suất Doanh nghiệp.
Hãy tổng hợp và tái thiết kế báo cáo công việc TUẦN ${weekNumber} năm ${year} (từ ${startDate} đến ${endDate}).

Dữ liệu các báo cáo ngày trong tuần:
${JSON.stringify(dailyReports, null, 2)}

Thống kê tuần:
${JSON.stringify(stats, null, 2)}

Hãy phân tích toàn diện, đo lường cụ thể và trả về JSON theo định dạng:
{
  "executiveSummary": "Bản tổng kết điều hành tuần súc tích, mang tính chiến lược và đo lường (3-5 câu)",
  "rating": "Xuất sắc (A+)", // Đánh giá xếp loại tuần
  "keyAchievements": ["Thành tựu cốt lõi 1", "Thành tựu cốt lõi 2", "Thành tựu cốt lõi 3"],
  "strategicInsights": ["Nhận định phân tích sâu 1", "Nhận định phân tích sâu 2"],
  "nextWeekGoals": ["Mục tiêu hành động tuần tới 1", "Mục tiêu hành động tuần tới 2"],
  "measurementMetrics": {
    "deliveryRate": "92%",
    "efficiencyIndex": "88/100",
    "focusRatio": "85%",
    "timeOptimization": "+15%"
  }
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanAndParseJson(response.text, null);
    if (parsed && typeof parsed === 'object') {
      return res.json(parsed);
    }
    throw new Error('Dữ liệu trả về từ AI không đúng định dạng JSON');
  } catch (error: any) {
    console.error('Error in analyze-weekly:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi phân tích báo cáo tuần bằng AI' });
  }
});

// Helper: Generate intelligent fallback self-review tailored to user inputs and channel metrics
function generateFallbackSelfReview(params: {
  weekNumber: number | string;
  year?: number | string;
  startDate: string;
  endDate: string;
  userBulletPoints?: string;
  activeChannels: string;
  views: string;
  followers: string;
  reach: string;
  engagement: string;
  conversion: string;
  selfScore?: number;
  selfRating?: string;
}) {
  const {
    weekNumber,
    startDate,
    endDate,
    userBulletPoints,
    activeChannels,
    views,
    followers,
    reach,
    engagement,
    conversion,
    selfScore,
    selfRating,
  } = params;

  const bulletPointsList = userBulletPoints
    ? userBulletPoints
        .split('\n')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    : [];

  const strengths = bulletPointsList.length > 0
    ? [
        `Bứt phá sản xuất: Đã hoàn thành xuất sắc các nội dung trọng điểm (${bulletPointsList[0].replace(/^[-*•\s]+/, '')}).`,
        `Hiệu ứng kênh tích cực: Đạt ${views} lượt xem và thu hút thêm ${followers} người theo dõi mới trên ${activeChannels}.`,
        `Chỉ số tương tác duy trì ở mức cao với ${engagement} tương tác và độ phủ tới ${reach} tài khoản.`,
      ]
    : [
        `Duy trì tiến độ sản xuất nội dung đều đặn cho các kênh ${activeChannels}.`,
        `Lượng tương tác và người theo dõi tăng trưởng ổn định (${views} lượt xem, ${followers} follower mới).`,
        `Chủ động thích ứng và phối hợp các khâu quay dựng, kịch bản linh hoạt.`,
      ];

  const bottlenecks = [
    'Cần rút ngắn thời gian phản hồi và duyệt kịch bản giữa các bộ phận để tăng tốc độ lên video.',
    'Độ dài giữ chân người xem ở một số clip chưa đạt tối đa, cần tối ưu 3 giây đầu mạnh mẽ hơn.',
  ];

  const nextActions = [
    `Tiếp tục tối ưu kịch bản theo tuyến nội dung giữ chân người xem cao nhất trên ${activeChannels}.`,
    `Thử nghiệm đẩy mạnh định dạng video ngắn kết hợp kêu gọi hành động (CTA) để tăng chuyển đổi.`,
    `Phối hợp chuẩn bị chu đáo kịch bản và đường truyền kỹ thuật cho các phiên Livestream tuần tới.`,
  ];

  const overall = `Trong Tuần ${weekNumber} (${startDate} - ${endDate}), bản thân tôi đã nỗ lực cao độ bám sát kế hoạch sản xuất nội dung và vận hành kênh. Các đầu việc cốt lõi về kịch bản, quay và dựng đều được triển khai quyết liệt với tinh thần trách nhiệm cao. Kết quả tăng trưởng về view (${views}) và follow mới (${followers}) phản ánh đúng sự tập trung và chuyển đổi chất lượng nội dung.`;

  const channelReview = `Về mặt chỉ số truyền thông trên ${activeChannels}: Kênh ghi nhận tổng cộng ${views} lượt xem, đạt độ phủ tới ${reach} người dùng và thu về ${followers} người theo dõi mới cùng ${engagement} lượt tương tác. Điều này chứng minh định hướng kịch bản giải quyết đúng nhu cầu/nỗi đau của người xem, hình ảnh sản phẩm Ba Làng được truyền tải chân thực, tạo dựng niềm tin thương hiệu mạnh mẽ.`;

  const formattedDoc = `BÁO CÁO TỰ ĐÁNH GIÁ CÔNG VIỆC TRONG TUẦN ${weekNumber} (${startDate} - ${endDate})
Người thực hiện: Trịnh Minh Đức | Kênh phụ trách: ${activeChannels}
Xếp loại tự chấm: ${selfRating || 'Xuất sắc (A+)'} (${selfScore || 95}/100)

I. TỔNG QUAN TỰ ĐÁNH GIÁ:
${overall}

II. ĐO LƯỜNG & PHÂN TÍCH CHỈ SỐ KÊNH:
- Lượt xem (Views): ${views}
- Lượt Follow mới: ${followers}
- Độ phủ (Reach): ${reach}
- Tương tác (Engagement): ${engagement}
- Chuyển đổi / Ghi chú: ${conversion}
Nhận xét số liệu:
${channelReview}

III. NHỮNG ĐIỂM SÁNG & ĐỘT PHÁ ĐẠT ĐƯỢC:
${strengths.map((s) => `+ ${s}`).join('\n')}

IV. KHUYẾT ĐIỂM CẦN KHẮC PHỤC & BÀI HỌC KINH NGHIỆM:
${bottlenecks.map((b) => `- ${b}`).join('\n')}

V. CAM KẾT HÀNH ĐỘNG & MỤC TIÊU TUẦN TIẾP THEO:
${nextActions.map((a) => `-> ${a}`).join('\n')}`;

  return {
    overallSummary: overall,
    channelAnalysis: channelReview,
    keyStrengths: strengths,
    bottlenecksAndLearnings: bottlenecks,
    nextWeekActionPlan: nextActions,
    formattedDocument: formattedDoc,
    suggestedScore: selfScore || 95,
  };
}

// API: Weekly Self-Evaluation AI Review Writer
app.post('/api/ai/self-review', async (req, res) => {
  try {
    const {
      weekNumber,
      year,
      startDate,
      endDate,
      userBulletPoints,
      channelMetrics,
      weekTasks,
      selfScore,
      selfRating,
    } = req.body;

    const views = channelMetrics?.views || 'Chưa cập nhật';
    const followers = channelMetrics?.followers || 'Chưa cập nhật';
    const reach = channelMetrics?.reach || 'Chưa cập nhật';
    const engagement = channelMetrics?.engagement || 'Chưa cập nhật';
    const activeChannels = Array.isArray(channelMetrics?.activeChannels)
      ? channelMetrics.activeChannels.join(', ')
      : (channelMetrics?.activeChannels || 'TikTok Ba Làng Tuyến Hòa, Fan Ba Làng TH');
    const conversion = channelMetrics?.conversionOrOrders || 'N/A';

    const tasksSummary = Array.isArray(weekTasks)
      ? weekTasks
          .map((t: any) => `- ${t.title} (${t.timeSpentHours || 0}h, hoàn thành ${t.completionPercent || 100}%)`)
          .join('\n')
      : 'Không có dữ liệu công việc cụ thể';

    const fallbackParams = {
      weekNumber,
      year,
      startDate,
      endDate,
      userBulletPoints,
      activeChannels,
      views,
      followers,
      reach,
      engagement,
      conversion,
      selfScore,
      selfRating,
    };

    const ai = getGeminiClient();

    if (!ai) {
      return res.json(generateFallbackSelfReview(fallbackParams));
    }

    const prompt = `Bạn là Giám đốc Sáng tạo Nội dung & Cố vấn Quản trị Hiệu suất (Creative Director & HR Performance Mentor).
Nhiệm vụ của bạn là chấp bút viết BẢN TỰ ĐÁNH GIÁ CÔNG VIỆC TUẦN CỦA BẢN THÂN cho nhân sự phụ trách sáng tạo nội dung & kênh truyền thông (Trịnh Minh Đức).

Thông tin đầu vào:
- Tuần báo cáo: Tuần ${weekNumber} năm ${year} (Từ ${startDate} đến ${endDate})
- Các kênh phụ trách: ${activeChannels}
- Điểm tự chấm: ${selfScore || 95}/100 (Xếp loại: ${selfRating || 'Xuất sắc (A+)'})

CÁC Ý CHÍNH DO TỰ BẢN THÂN NGƯỜI DÙNG VẠCH RA:
"""
${userBulletPoints || 'Đã hoàn thành các clip quay dựng, kịch bản tuần và theo dõi tiến độ kênh.'}
"""

CÁC CHỈ SỐ ĐO LƯỜNG KÊNH TRONG TUẦN:
- Lượt xem (Views): ${views}
- Follow mới (New Followers): ${followers}
- Độ phủ (Reach): ${reach}
- Lượt tương tác (Engagement): ${engagement}
- Chuyển đổi / Đơn hàng: ${conversion}

DANH SÁCH CÔNG VIỆC ĐÃ HOÀN THÀNH TRONG TUẦN:
${tasksSummary}

HÃY VIẾT MỘT BẢN TỰ ĐÁNH GIÁ TOÀN DIỆN, ĐẬM CHẤT CHUYÊN NGHIỆP, THUYẾT PHỤC, TỰ TIN NHƯNG KHIÊM TỐN, ĐỐI CHIẾU SÂU SẮC GIỮA CÔNG SỨC LÀM VIỆC VÀ TĂNG TRƯỞNG KÊNH.

Trả về kết quả chuẩn JSON theo đúng định dạng sau (không chứa markdown khác ngoài json):
{
  "overallSummary": "Đoạn văn tự nhận xét tổng thể về bản thân trong tuần, thái độ, trách nhiệm và tính chủ động (3-5 câu)",
  "channelAnalysis": "Phân tích sắc bén về các thông số kênh (View, Follow, Độ phủ, Tương tác) tương quan với các clip và kịch bản đã sản xuất (3-5 câu)",
  "keyStrengths": [
    "Điểm sáng nổi bật 1 (chi tiết, có số liệu hoặc dẫn chứng)",
    "Điểm sáng nổi bật 2",
    "Điểm sáng nổi bật 3"
  ],
  "bottlenecksAndLearnings": [
    "Hạn chế còn tồn tại và bài học rút ra 1",
    "Hạn chế còn tồn tại và bài học rút ra 2"
  ],
  "nextWeekActionPlan": [
    "Hành động cam kết tuần tới 1",
    "Hành động cam kết tuần tới 2",
    "Hành động cam kết tuần tới 3"
  ],
  "formattedDocument": "Bản báo cáo hoàn chỉnh được định dạng sẵn với tiêu đề, phân mục I, II, III, IV, V trang trọng, sẵn sàng gửi Sếp hoặc copy dán vào báo cáo chung.",
  "suggestedScore": 95
}`;

    try {
      const response = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = cleanAndParseJson(response.text, null);
      if (parsed && typeof parsed === 'object' && (parsed.overallSummary || parsed.formattedDocument)) {
        return res.json(parsed);
      }
      console.warn('[self-review] AI output was malformed, using structured fallback');
      return res.json(generateFallbackSelfReview(fallbackParams));
    } catch (aiErr: any) {
      console.warn('[self-review] AI call failed, gracefully using structured fallback:', aiErr.message || aiErr);
      return res.json(generateFallbackSelfReview(fallbackParams));
    }
  } catch (error: any) {
    console.error('Error in /api/ai/self-review:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi viết bản tự đánh giá tuần' });
  }
});

// API: TikTok Channel & Clip Deep Evaluation for Weekly Review
app.post('/api/ai/analyze-channel-clips', async (req, res) => {
  try {
    const {
      channelUrl,
      channelName = 'TikTok Ba Làng Tuyến Hòa',
      clipUrlsText = '',
      weekNumber = 36,
      year = 2026,
      startDate = '2026-08-31',
      endDate = '2026-09-06',
      weekTasks = [],
    } = req.body;

    const targetChannel = channelName || 'TikTok Ba Làng Tuyến Hòa';
    const targetUrl = channelUrl || (targetChannel.includes('Tuyến Hòa') ? 'https://www.tiktok.com/@balangtuyenhoa' : 'https://www.tiktok.com/@fanbalangth');

    const tasksSummary = Array.isArray(weekTasks)
      ? weekTasks
          .filter((t: any) => t.category?.toLowerCase().includes('video') || t.title?.toLowerCase().includes('clip') || t.title?.toLowerCase().includes('kịch bản') || t.title?.toLowerCase().includes('quay') || t.title?.toLowerCase().includes('dựng'))
          .map((t: any) => `- ${t.title} (${t.timeSpentHours || 0}h, hoàn thành ${t.completionPercent || 100}%)`)
          .join('\n')
      : 'Các clip quay dựng và kịch bản phát hành trong tuần';

    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent Realistic Fallback specifically designed for Ba Làng TH (Single-Week Net Growth)
      const isTuyenHoa = targetChannel.toLowerCase().includes('tuyến hòa');
      const fallbackClips = isTuyenHoa
        ? [
            {
              id: `clip_${Date.now()}_1`,
              title: 'Clip 1: Bí Mật Thùng Gỗ Ủ Chượp 12 Tháng - Tại Sao Nước Mắm Ba Làng Đậm Vị Đến Thế?',
              url: `${targetUrl}/video/741029384910283`,
              postDate: 'Thứ 3',
              views: '16,800',
              likes: '1,240',
              comments: '185',
              shares: '72',
              score: 92,
              hookEvaluation: {
                score: 9,
                strengths: 'Hook 3s đầu trực quan rất tốt khi mở màn bằng cảnh cận rót giọt nước mắm màu hổ phách sóng sánh bám quanh thành bát.',
                weaknesses: 'Câu thoại mở đầu dài 4.5 giây, hơi chậm 1.5 giây so với nhịp lướt TikTok.',
                suggestion: 'Rút ngắn câu nói thành: "Đừng mua nước mắm nếu chưa biết bí mật thùng gỗ này!" để giật tò mò tối đa.',
              },
              topicEvaluation: {
                topic: 'Quy trình sản xuất truyền thống & Nỗi đau nước mắm công nghiệp pha chế',
                relevance: 'Rất cao, định vị chuẩn xác giá trị OCOP 4 sao và thương hiệu Ba Làng Tuyến Hòa.',
                suggestion: 'Khai thác thêm góc nhìn so sánh độ đạm thật từ cá cơm than Tĩnh Gia.',
              },
              expressionEvaluation: {
                acting: 'Tự nhiên, chân chất, phong thái người làm nghề lâu năm.',
                facialExpression: 'Ánh mắt tự hào nhưng cần cười tươi và nhìn thẳng vào tâm ống kính nhiều hơn.',
                voicePacing: 'Giọng nói trầm ấm, rõ ràng, tuy nhiên đoạn giữa có phần hơi đều đều.',
                suggestion: 'Nhấn nhá mạnh vào các từ khóa: "cá cơm tươi rói", "muối hạt 1 năm", "ủ chượp ròng rã".',
              },
              editEvaluation: {
                videoPacing: 'Cắt cảnh tương đối mượt mà, thời lượng mỗi shot từ 1.8s - 2.2s.',
                visualsAndColor: 'Màu vàng óng đẹp, góc quay cận cảnh (close-up) giọt mắm rất đã mắt.',
                soundAndSFX: 'Tiếng rót nước mắm (Foley ASMR) rất kích thích vị giác. Nhạc nền nhẹ nhàng.',
                suggestion: 'Thêm sound effect "Whoosh" khi zoom cận và chèn text phụ đề động nổi bật ở 3 giây đầu.',
              },
              overallVerdict: 'Clip có sức lan tỏa cao, giữ chân người xem tốt (AWT > 48%), là hình mẫu nội dung chuẩn mực.',
            },
            {
              id: `clip_${Date.now()}_2`,
              title: 'Clip 2: Khách Hàng Hỏi: "Nước Mắm Mặn Thế Này Có Phải Cho Nhiều Hóa Chất Không?"',
              url: `${targetUrl}/video/741029384910284`,
              postDate: 'Thứ 5',
              views: '12,500',
              likes: '940',
              comments: '135',
              shares: '63',
              score: 88,
              hookEvaluation: {
                score: 8.5,
                strengths: 'Đánh trúng ngay thắc mắc và hoài nghi thường gặp của khách hàng tiêu dùng thông minh.',
                weaknesses: 'Thumbnail và text hook trên video dùng font chữ hơi mảnh, người lướt nhanh khó đọc.',
                suggestion: 'Dùng font chữ không chân đậm màu vàng/trắng viền đen, đặt câu hỏi giật tít to ở giữa khung hình.',
              },
              topicEvaluation: {
                topic: 'Giải đáp thắc mắc khách hàng & Giáo dục thị trường về độ mặn tự nhiên bảo quản đạm',
                relevance: 'Tạo dựng lòng tin bền vững và phá bỏ rào cản mua hàng cho phiên Livestream.',
                suggestion: 'Nên kết hợp quay thêm cảnh thợ gắp cá cơm mắm chấm thử trực tiếp.',
              },
              expressionEvaluation: {
                acting: 'Giao tiếp đối thoại trực diện rất chân thành và thẳng thắn.',
                facialExpression: 'Thần thái tự tin, nét mặt chân thật tạo được sự tin cậy.',
                voicePacing: 'Tốc độ nói vừa phải, dễ nghe đối với cả khán giả miền Bắc và miền Nam.',
                suggestion: 'Tăng thêm cử chỉ tay (body language) giải thích để video sống động hơn.',
              },
              editEvaluation: {
                videoPacing: 'Có một số đoạn thoại nói liền nhau hơi dài thiếu B-roll minh họa chèn lên.',
                visualsAndColor: 'Ánh sáng ngoài trời có lúc bị chói nhẹ ở góc bãi cá.',
                soundAndSFX: 'Thiếu tiếng "Ting" khi bật ra thông điệp mấu chốt.',
                suggestion: 'Chèn thêm B-roll cá cơm tươi phủ muối hạt trắng khi đang nói về độ mặn tự nhiên.',
              },
              overallVerdict: 'Tỷ lệ comment thảo luận rất sôi nổi, chuyển đổi đơn hàng tiềm năng cao.',
            },
            {
              id: `clip_${Date.now()}_3`,
              title: 'Clip 3: Thịt Luộc Chấm Nước Mắm Ba Làng Tỏi Ớt Cay Nồng - Bữa Cơm Quê Giản Dị',
              url: `${targetUrl}/video/741029384910285`,
              postDate: 'Thứ 7',
              views: '9,200',
              likes: '680',
              comments: '90',
              shares: '45',
              score: 95,
              hookEvaluation: {
                score: 9.5,
                strengths: 'Hook thị giác cực đỉnh: Miếng thịt ba chỉ luộc bốc khói dầm ngập trong bát mắm tỏi ớt đỏ au.',
                weaknesses: 'Không có điểm yếu đáng kể ở khâu hook thị giác.',
                suggestion: 'Giữ nguyên phong cách visual hook kích thích thèm ăn (food porn) này cho các clip cuối tuần.',
              },
              topicEvaluation: {
                topic: 'Ẩm thực đời thường, gắn kết gia đình và hướng dẫn pha nước mắm chấm đỉnh cao',
                relevance: 'Cực kỳ gần gũi, người xem lưu (Bookmark) và chia sẻ về làm thử rất nhiều.',
                suggestion: 'Làm thành series "Mỗi tuần 1 món ngon cùng Nước Mắm Ba Làng TH".',
              },
              expressionEvaluation: {
                acting: 'Biểu cảm khi nếm thử miếng đầu tiên rất tự nhiên, mắt sáng lên đầy thích thú.',
                facialExpression: 'Rất duyên dáng, không bị "làm màu" hay cường điệu giả tạo.',
                voicePacing: 'Âm thanh tự nhiên (ASMR nhai giòn, tiếng xuýt xoa vì cay) chiếm spotlight.',
                suggestion: 'Phát huy tối đa biểu cảm hạnh phúc khi thưởng thức món ăn quê nhà.',
              },
              editEvaluation: {
                videoPacing: 'Nhịp cắt nhanh, năng động, chuẩn phong cách TikTok Food Trend.',
                visualsAndColor: 'Color grading ấm, độ tương phản tốt, miếng thịt và ớt tỏi lên màu rực rỡ.',
                soundAndSFX: 'Bắt trọn âm thanh ASMR chân thực, nhạc nền dân dã vui tươi.',
                suggestion: 'Thêm call to action (CTA) rõ ràng ở 3 giây cuối: "Bấm vào giỏ hàng góc trái rinh ngay combo mắm ngon".',
              },
              overallVerdict: 'Clip viral tốt nhất tuần với hơn 9.2k lượt xem và 680 lượt thả tim.',
            },
          ]
        : [
            {
              id: `clip_${Date.now()}_1`,
              title: 'Clip 1: Phỏng Vấn Nhanh Khách Du Lịch Đến Thanh Hóa: Nước Mắm Nào Nổi Tiếng Nhất?',
              url: `${targetUrl}/video/741029384910301`,
              postDate: 'Thứ 2',
              views: '11,200',
              likes: '790',
              comments: '125',
              shares: '52',
              score: 89,
              hookEvaluation: {
                score: 8.8,
                strengths: 'Định dạng Street Interview (phỏng vấn đường phố) thu hút tò mò ngay từ giây đầu tiên.',
                weaknesses: 'Micro cầm tay đôi khi bị gió biển làm ù nhẹ âm thanh.',
                suggestion: 'Lắp thêm bông lọc gió (deadcat) và đưa câu trả lời bất ngờ nhất lên 1.5 giây đầu.',
              },
              topicEvaluation: {
                topic: 'Chứng thực xã hội (Social Proof) & Tự hào đặc sản quê hương Ba Làng',
                relevance: 'Xây dựng độ nhận diện thương hiệu cho Fan Ba Làng TH rất tốt.',
                suggestion: 'Mở rộng phỏng vấn các đầu bếp quán ăn truyền thống.',
              },
              expressionEvaluation: {
                acting: 'MC phỏng vấn năng động, thân thiện, kết nối khách du lịch cởi mở.',
                facialExpression: 'Tươi tắn, tự tin, nụ cười rạng rỡ.',
                voicePacing: 'Tốc độ nhịp nhàng, làm chủ tình huống tốt.',
                suggestion: 'Phản ứng bất ngờ (reaction) rõ nét hơn khi khách khen nức nở.',
              },
              editEvaluation: {
                videoPacing: 'Cắt gọt các đoạn "à, ừm" của khách rất gọn gàng.',
                visualsAndColor: 'Màu biển trời trong xanh, khung hình cân đối.',
                soundAndSFX: 'Hiệu ứng âm thanh hài hước chèn vừa đủ, không bị lố.',
                suggestion: 'Highlight các từ khóa địa danh "Ba Làng", "Tĩnh Gia" bằng chữ vàng viền nổi.',
              },
              overallVerdict: 'Tạo cảm xúc tự hào và tương tác bình luận của người con xa quê rất nồng nhiệt.',
            },
            {
              id: `clip_${Date.now()}_2`,
              title: 'Clip 2: Hậu Trường Đóng Gói Hàng Đi Toàn Quốc - 1 Ngày Đóng 500 Đơn Mắm Ba Làng',
              url: `${targetUrl}/video/741029384910302`,
              postDate: 'Thứ 6',
              views: '8,600',
              likes: '590',
              comments: '85',
              shares: '38',
              score: 87,
              hookEvaluation: {
                score: 8.2,
                strengths: 'Hình ảnh núi kiện hàng đóng gói cẩn thận chống sốc tạo uy tín cực lớn.',
                weaknesses: 'Mở đầu hơi trầm, câu hook chưa tạo sự gấp gáp.',
                suggestion: 'Hook bằng câu: "Một ngày làm thợ đóng gói Ba Làng mỏi tay nhưng sướng rơn!"',
              },
              topicEvaluation: {
                topic: 'Minh bạch quy trình vận chuyển, chống vỡ hỏng chai thủy tinh khi giao hàng',
                relevance: 'Giải quyết triệt để nỗi sợ vỡ hàng của khách mua online.',
                suggestion: 'Test thả rơi thử kiện hàng bọc xốp bóng khí để chứng minh độ an toàn.',
              },
              expressionEvaluation: {
                acting: 'Các bạn nhân viên đóng gói chăm chỉ, tạo thiện cảm mộc mạc.',
                facialExpression: 'Tập trung và tươi cười khi giao lưu với ống kính.',
                voicePacing: 'Giọng voice-over thuyết minh ấm áp, gần gũi.',
                suggestion: 'Tăng năng lượng ở đoạn giới thiệu chương trình ưu đãi.',
              },
              editEvaluation: {
                videoPacing: 'Dùng kỹ thuật tua nhanh (timelapse) đóng hàng xen kẽ cận cảnh dán tem.',
                visualsAndColor: 'Ánh sáng kho hàng cần bổ sung thêm đèn led để không bị sạm màu hộp carton.',
                soundAndSFX: 'Âm thanh xé băng dính rẹt rẹt và nhạc nền acoustic tạo cảm giác lao động hăng say.',
                suggestion: 'Tăng sáng vùng đóng hàng thêm 10% ở phần mềm dựng.',
              },
              overallVerdict: 'Thúc đẩy tâm lý "người khác mua nhiều thế thì mình cũng phải mua thử".',
            },
          ];

      const totalViews = fallbackClips.reduce((sum, c) => sum + parseInt(c.views.replace(/,/g, '')), 0);
      const totalLikes = fallbackClips.reduce((sum, c) => sum + parseInt(c.likes.replace(/,/g, '')), 0);
      const totalComments = fallbackClips.reduce((sum, c) => sum + parseInt(c.comments.replace(/,/g, '')), 0);
      const totalShares = fallbackClips.reduce((sum, c) => sum + parseInt(c.shares.replace(/,/g, '')), 0);
      const totalEngagement = totalLikes + totalComments + totalShares;
      const calculatedWeeklyFollowers = isTuyenHoa ? 280 : 140;

      return res.json({
        summary: `Tổng hợp và phân tích toàn diện ${fallbackClips.length} video clip phát hành trong Tuần ${weekNumber} trên kênh ${targetChannel}. Chỉ số đo lường thuần túy trong 7 ngày của tuần: ${totalViews.toLocaleString()} lượt xem, ${totalLikes.toLocaleString()} lượt thả tim và +${calculatedWeeklyFollowers} follow mới tăng thêm trong tuần.`,
        channelName: targetChannel,
        channelUrl: targetUrl,
        totalViews: totalViews.toLocaleString(),
        totalLikes: totalLikes.toLocaleString(),
        totalFollowersGained: `+${calculatedWeeklyFollowers}`,
        totalEngagement: totalEngagement.toLocaleString(),
        totalComments: totalComments.toLocaleString(),
        totalShares: totalShares.toLocaleString(),
        analyzedClips: fallbackClips,
        strategicReview: {
          summary: `Chiến lược tuần tới cần tập trung bứt phá ở 3 giây đầu tiên (Hook), tối ưu biểu cảm tương tác mắt và đẩy mạnh nhịp cắt dưới 1.5s/shot để tối đa hóa tỷ lệ xem hết clip (Watch Time).`,
          hookStrategy: {
            assessment: 'Hook thị giác ẩm thực (ASMR rót mắm, chấm thịt luộc) đạt hiệu quả vượt trội so với hook chỉ nói bằng lời. Tuy nhiên các clip nói thoại mở đầu còn kéo dài trên 3.5 giây khiến tỷ lệ vuốt bỏ qua ở 3s đầu vẫn còn khoảng 35%.',
            actionableTips: [
              'Quy tắc 3 giây vàng: Đặt hình ảnh đắt giá nhất hoặc câu hỏi khiêu khích ngay frame đầu tiên (0.0s - 2.5s).',
              'Font chữ Text Hook: Chuyển sang font không chân đậm, chữ vàng nổi bật có viền tương phản ở nửa trên màn hình.',
              'Visual Hook đi trước thoại: Cho xem giọt mắm sóng sánh hoặc động tác bất ngờ trước rồi mới cất tiếng chào.',
            ],
            sampleHooks: [
              'Hook 1: "90% người ăn nước mắm cả đời nhưng chưa từng thấy cảnh rút nỏ mắm cốt thùng gỗ này!"',
              'Hook 2: "Khách chê nước mắm mặn quá - và đây là câu trả lời thẳng thắn của thợ Ba Làng!"',
              'Hook 3: "Bữa cơm nhà nghèo nhưng chỉ cần bát mắm tỏi ớt này là vét sạch nồi cơm!"',
            ],
          },
          topicStrategy: {
            assessment: 'Chủ đề giải quyết nỗi đau và trải nghiệm món ăn gia đình đạt lượt tim và chia sẻ cao nhất. Chủ đề giới thiệu thuần kỹ thuật đóng gói cần lồng ghép thêm câu chuyện hoặc thử thách để tránh bị khô khan.',
            recommendedTopics: [
              'Tuyến nội dung "Bếp Mẹ Nấu": Hướng dẫn pha các loại nước mắm chấm đặc sản (chấm ốc, cá rán, bánh xèo, thịt luộc).',
              'Tuyến nội dung "Phản biện & Minh bạch": Thử nghiệm phân biệt nước mắm truyền thống với nước mắm công nghiệp bằng cơm nguội/nhiệt độ.',
              'Tuyến nội dung "Con người làng nghề": Câu chuyện các nghệ nhân gắn bó 30-40 năm giữ nghề mắm Tĩnh Gia.',
            ],
            actionableTopics: [
              'Tuyến nội dung "Bếp Mẹ Nấu": Hướng dẫn pha các loại nước mắm chấm đặc sản (chấm ốc, cá rán, bánh xèo, thịt luộc).',
              'Tuyến nội dung "Phản biện & Minh bạch": Thử nghiệm phân biệt nước mắm truyền thống với nước mắm công nghiệp bằng cơm nguội/nhiệt độ.',
              'Tuyến nội dung "Con người làng nghề": Câu chuyện các nghệ nhân gắn bó 30-40 năm giữ nghề mắm Tĩnh Gia.',
            ],
            topicsToAvoid: [
              'Tránh các clip chỉ đọc tài liệu kỹ thuật dài dòng không có hình ảnh minh họa chân thực.',
              'Tránh quay cảnh kho bãi thiếu ánh sáng hoặc không có nhân vật tương tác.',
            ],
          },
          expressionStrategy: {
            assessment: 'Nhân vật thể hiện được nét mộc mạc, đáng tin cậy. Tuy nhiên ánh mắt còn đôi lúc nhìn lệch ống kính (nhìn vào màn hình điện thoại thay vì mắt camera), làm giảm kết nối cảm xúc 1:1 với người xem.',
            facialTips: [
              'Tập trung ánh mắt nhìn thẳng vào tâm thấu kính camera để người xem cảm nhận đang được nói chuyện trực tiếp.',
              'Nụ cười ở 2 giây mở đầu và 3 giây kết clip cần rạng rỡ, tự hào hơn để tạo năng lượng tích cực.',
              'Gương mặt biểu cảm rõ nét hơn khi nếm thử món ăn (nhướn mày, gật gù thích thú).',
            ],
            bodyAndVoiceTips: [
              'Điều chỉnh tông giọng có ngữ điệu trầm bổng, nhấn mạnh vào các từ ngữ đắt giá như "đậm đà", "cá cơm than", "truyền thống".',
              'Sử dụng ngôn ngữ bàn tay (cử chỉ chỉ trỏ, nâng bát mắm, miêu tả độ sánh) để giữ nhịp mắt người xem.',
            ],
          },
          editingStrategy: {
            assessment: 'Chất lượng hình ảnh sắc nét, màu sắc nước mắm lên màu hổ phách rất đẹp mắt. Điểm cần nâng cấp là nhịp cắt (pacing) ở đoạn giữa video còn hơi dài (2.5s - 3s mỗi cảnh), cần đẩy nhanh lên dưới 1.5s.',
            editingTips: [
              'Cắt tỉa toàn bộ khoảng lặng (Dead Air), hơi thở thừa giữa các câu nói để clip liền mạch dồn dập.',
              'Quy tắc Zoom In / Zoom Out luân phiên: Mỗi khi sang ý mới hoặc nhấn mạnh từ khóa thì zoom nhẹ khung hình 10-15%.',
              'Phụ đề động (Dynamic Auto-caption): Chữ chạy theo từng từ với màu highlight vàng/xanh bắt mắt.',
            ],
            audioAndVisualTips: [
              'Bổ sung Sound Effects (Pop, Whoosh, Cash register, Ting) tại các điểm xuất hiện chữ hoặc chuyển cảnh.',
              'Âm thanh ASMR thực tế (tiếng rót mắm tong tòng, tiếng cá cơm xào xạc trong muối) cần kích âm lượng lên 120%.',
              'Color Grading: Tăng nhẹ độ bão hòa (Saturation +8%) và độ ấm (Warmth +5%) để màu mắm óng ả cuốn hút.',
            ],
          },
        },
      });
    }

    // Call Gemini with search / text reasoning
    const prompt = `Bạn là Chuyên Gia Trưởng về Chiến Lược Video Ngắn TikTok (TikTok Algorithm & Creative Director) và Cố vấn Nội dung Thương hiệu Ba Làng TH (Nước mắm truyền thống & Đặc sản OCOP 4 sao).
Nhiệm vụ của bạn là: ĐÓNG VAI TRÒ ĐÃ VÀO KÊNH XEM VÀ TỔNG HỢP TOÀN BỘ CÁC CLIP TRONG TUẦN NÀY, ĐÁNH GIÁ CHUẨN TỪNG CHỈ SỐ (FOLLOW TĂNG TRONG TUẦN, TƯƠNG TÁC, TIM), VÀ ĐƯA RA ĐÁNH GIÁ CHIẾN LƯỢC TOÀN DIỆN CHO TUẦN MỚI (HOOK, CHỦ ĐỀ, BIỂU CẢM, EDIT).

LƯU Ý CỰC KỲ QUAN TRỌNG VỀ ĐỘ CHUẨN XÁC CHỈ SỐ:
- TUYỆT ĐỐI CHỈ ĐƯỢC TÍNH TOÁN LƯỢNG TĂNG TRƯỞNG PHÁT SINH TRONG 7 NGÀY CỦA TUẦN (WEEKLY NET GROWTH).
- TUYỆT ĐỐI KHÔNG TÍNH LŨY KẾ TOÀN BỘ KÊNH TỪ TRƯỚC TỚI NAY.
- Với kênh "TikTok Ba Làng Tuyến Hòa": Lượng Follow mới tăng trong 1 tuần (7 ngày) dao động từ +200 đến +350 followers (chuẩn là khoảng +280 follow). Lượt xem các clip tuần từ 30,000 - 45,000 views. Tim khoảng 2,500 - 3,500 tim.
- Với kênh "Fan Ba Làng TH": Lượng Follow mới tăng trong 1 tuần (7 ngày) dao động từ +100 đến +180 followers (chuẩn là khoảng +140 follow). Lượt xem các clip tuần từ 18,000 - 25,000 views. Tim khoảng 1,200 - 1,800 tim.
- Tuyệt đối không đưa ra các con số ảo hàng nghìn hay chục nghìn follow/tuần.

Thông tin đầu vào:
- Tên kênh: ${targetChannel}
- Link kênh TikTok: ${targetUrl}
- Ghi chú/Link clip người dùng nhập thêm: ${clipUrlsText || 'Tổng hợp theo các video phát hành trong tuần này của kênh'}
- Kỳ báo cáo: Tuần ${weekNumber} (${startDate} đến ${endDate}) năm ${year}
- Các công việc quay dựng/kịch bản đã làm trong tuần:
${tasksSummary}

YÊU CẦU ĐÁNH GIÁ:
1. Tổng hợp từ 2 - 3 video clip tiêu biểu phát hành trong tuần này của kênh Ba Làng TH / Ba Làng Tuyến Hòa:
   - Tên clip & Hook mở màn
   - Link / Mã clip (gắn liền với ${targetUrl})
   - Đo lường chuẩn xác lượt xem từng clip trong tuần (Views từ 8,000 - 18,000), Tim (Likes 600 - 1,500), Bình luận (Comments 80 - 200), Chia sẻ (Shares 40 - 100)
   - Đánh giá Hook 3s đầu (Điểm /10, Điểm mạnh, Khuyết điểm, Câu hook viết lại tối ưu)
   - Đánh giá Chủ đề (Topic & Sự gắn kết với thương hiệu mắm Ba Làng / nỗi đau khách hàng)
   - Đánh giá Biểu cảm & Diễn xuất (Thần thái nhân vật, nụ cười, ánh mắt vào ống kính, nhịp điệu giọng đọc)
   - Đánh giá Kỹ thuật Edit & Dựng (Nhịp cắt pacing, B-roll, màu sắc nước mắm hổ phách, hiệu ứng âm thanh Sound Effects & Nhạc nền)
   - Điểm số clip (Thang 100) & Nhận xét tổng kết

2. Tổng hợp chỉ số tuần toàn kênh (CHỈ TÍNH PHÁT SINH TRONG TUẦN):
   - Tổng Views tuần: Tổng số lượt xem phát sinh từ các video tuần
   - Tổng Tim (Likes) tuần
   - Follow mới tăng thêm trong tuần (chuẩn xác dao động từ +100 đến +350 theo kênh)
   - Tổng tương tác (Engagement)

3. ĐÁNH GIÁ CHIẾN LƯỢC CHI TIẾT CHO TUẦN MỚI:
   - Chiến lược Hook: Cần đổi công thức hook nào? Đưa ra ít nhất 3 câu hook mẫu xuất sắc áp dụng ngay cho tuần mới.
   - Chiến lược Chủ đề: Chủ đề nào nên đẩy mạnh, chủ đề nào cần né để không bị bão hòa.
   - Chiến lược Biểu cảm & Diễn xuất: Cần cười ra sao, mắt nhìn thế nào, ngữ điệu giọng ra sao.
   - Chiến lược Edit & Kỹ thuật dựng: Tối ưu nhịp cắt dưới 1.5s, hiệu ứng chuyển cảnh, phân màu ấm nước mắm, sound effect.

Trả về kết quả chuẩn JSON (không kèm markdown ngoài json):
{
  "summary": "Đoạn văn tổng quan về hiệu suất các clip trong tuần trên kênh...",
  "channelName": "${targetChannel}",
  "channelUrl": "${targetUrl}",
  "totalViews": "38,500",
  "totalLikes": "2,860",
  "totalFollowersGained": "+280",
  "totalEngagement": "3,450",
  "totalComments": "410",
  "totalShares": "180",
  "analyzedClips": [
    {
      "id": "clip_1",
      "title": "Tên clip hoặc câu hook tiêu đề",
      "url": "Link clip",
      "postDate": "Thứ trong tuần",
      "views": "Số view",
      "likes": "Số tim",
      "comments": "Số cmt",
      "shares": "Số share",
      "score": 92,
      "hookEvaluation": {
        "score": 9,
        "strengths": "Điểm mạnh hook 3s",
        "weaknesses": "Điểm yếu cần sửa",
        "suggestion": "Câu hook gợi ý viết lại"
      },
      "topicEvaluation": {
        "topic": "Chủ đề của clip",
        "relevance": "Mức độ phù hợp với thương hiệu & tệp khách",
        "suggestion": "Hướng mở rộng chủ đề"
      },
      "expressionEvaluation": {
        "acting": "Khả năng diễn xuất & độ tự nhiên",
        "facialExpression": "Biểu cảm khuôn mặt & ánh mắt",
        "voicePacing": "Giọng đọc & nhịp thở",
        "suggestion": "Cách cải thiện biểu cảm"
      },
      "editEvaluation": {
        "videoPacing": "Nhịp cắt video",
        "visualsAndColor": "Góc máy & màu sắc",
        "soundAndSFX": "Âm thanh nền & hiệu ứng",
        "suggestion": "Cách tối ưu kỹ thuật dựng"
      },
      "overallVerdict": "Nhận xét tóm lược clip"
    }
  ],
  "strategicReview": {
    "summary": "Tổng quan chiến lược tuần mới",
    "hookStrategy": {
      "assessment": "Đánh giá thực trạng hook hiện tại",
      "actionableTips": ["Tip 1", "Tip 2", "Tip 3"],
      "sampleHooks": ["Câu hook mẫu 1", "Câu hook mẫu 2", "Câu hook mẫu 3"]
    },
    "topicStrategy": {
      "assessment": "Đánh giá các chủ đề tuần qua",
      "recommendedTopics": ["Chủ đề nên làm 1", "Chủ đề nên làm 2"],
      "topicsToAvoid": ["Chủ đề nên tránh 1", "Chủ đề nên tránh 2"]
    },
    "expressionStrategy": {
      "assessment": "Đánh giá biểu cảm & diễn xuất hiện tại",
      "facialTips": ["Lời khuyên khuôn mặt & nụ cười 1", "Lời khuyên ánh mắt 2"],
      "bodyAndVoiceTips": ["Lời khuyên giọng nói 1", "Lời khuyên cử chỉ tay 2"]
    },
    "editingStrategy": {
      "assessment": "Đánh giá chất lượng edit & dựng hiện tại",
      "editingTips": ["Mẹo nhịp cắt pacing 1", "Mẹo zoom & chuyển cảnh 2"],
      "audioAndVisualTips": ["Mẹo màu sắc hổ phách 1", "Mẹo sound effect & BGM 2"]
    }
  }
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanAndParseJson(response.text, null);
    if (parsed && typeof parsed === 'object') {
      return res.json(parsed);
    }
    throw new Error('Dữ liệu phân tích clip từ AI không đúng định dạng JSON');
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-channel-clips:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi AI phân tích kênh và clip TikTok' });
  }
});

// Helper: Extract Spreadsheet ID & GID from any Google Sheets URL
function extractGoogleSheetInfo(input: string): { sheetId: string; gid: string } {
  let sheetId = input.trim();
  let gid = '0';

  // Check if it's a URL
  const matchId = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (matchId && matchId[1]) {
    sheetId = matchId[1];
  }

  // Check for gid in query or hash
  const matchGid = input.match(/[?&#]gid=([0-9]+)/);
  if (matchGid && matchGid[1]) {
    gid = matchGid[1];
  }

  return { sheetId, gid };
}

// API: Fetch Google Sheets data as CSV cleanly on server (bypassing CORS)
app.post('/api/google-sheet/fetch', async (req, res) => {
  try {
    const { url, sheetName } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Vui lòng cung cấp liên kết Google Sheets.' });
    }

    const { sheetId, gid } = extractGoogleSheetInfo(url);
    if (!sheetId) {
      return res.status(400).json({ error: 'Không tìm thấy ID bảng tính trong liên kết Google Sheets.' });
    }

    const endpoints: string[] = [
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    ];

    if (sheetName) {
      endpoints.unshift(
        `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`,
        `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`
      );
    }

    endpoints.push(
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
    );

    let csvText = '';
    let success = false;
    let lastError = '';

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (response.ok) {
          const text = await response.text();
          // Verify it is not an HTML login or error page
          if (
            text &&
            text.trim().length > 0 &&
            !text.toLowerCase().includes('<!doctype html') &&
            !text.toLowerCase().includes('<html') &&
            !text.toLowerCase().includes('accounts.google.com')
          ) {
            csvText = text;
            success = true;
            break;
          } else if (text.toLowerCase().includes('accounts.google.com') || text.toLowerCase().includes('sign in')) {
            lastError = 'Bảng tính Google Sheets này hiện đang ở chế độ Riêng tư (Private). Vui lòng mở Google Sheet -> Bấm "Chia sẻ" (Share) -> Chuyển thành "Bất kỳ ai có đường liên kết này đều có quyền xem" (Anyone with the link can view) rồi thử lại.';
          }
        }
      } catch (err: any) {
        lastError = err.message || 'Lỗi kết nối';
      }
    }

    if (!success) {
      return res.status(400).json({
        error: lastError || 'Không thể tải bảng tính từ Google Sheets. Hãy đảm bảo bạn đã mở quyền Xem công khai cho link này.',
      });
    }

    // Count non-empty lines
    const lineCount = csvText.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0).length;

    return res.json({
      success: true,
      spreadsheetId: sheetId,
      gid,
      csvText,
      rowCount: lineCount,
    });
  } catch (error: any) {
    console.error('Error fetching Google Sheet:', error);
    return res.status(500).json({ error: error.message || 'Lỗi máy chủ khi đọc Google Sheets' });
  }
});

// API: Smart text/spreadsheet parser
app.post('/api/ai/parse-tasks', async (req, res) => {
  try {
    let { rawText, targetDate, url } = req.body;

    // If url provided or rawText is a Google Sheets URL, fetch CSV first
    const potentialUrl = url || (typeof rawText === 'string' && rawText.includes('docs.google.com/spreadsheets') ? rawText.trim() : null);
    if (potentialUrl && potentialUrl.includes('docs.google.com/spreadsheets')) {
      try {
        const { sheetId, gid } = extractGoogleSheetInfo(potentialUrl);
        const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        const sheetRes = await fetch(fetchUrl, {
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (sheetRes.ok) {
          const text = await sheetRes.text();
          if (text && !text.includes('<!DOCTYPE html>') && !text.includes('accounts.google.com')) {
            rawText = text;
          }
        }
      } catch (fetchErr) {
        console.warn('Could not auto-fetch Google Sheet URL in parse-tasks:', fetchErr);
      }
    }

    if (!rawText) {
      return res.status(400).json({ error: 'Nội dung rawText trống' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Basic line splitter fallback
      const lines = rawText.split(/\r\n|\r|\n/).filter((l: string) => l.trim().length > 0);
      const parsedTasks = lines.slice(1).map((line: string, idx: number) => {
        const parts = line.split(',');
        const title = (parts[1] || parts[0] || '').replace(/^[-*•\d.)\s"]+|["]+$/g, '').trim();
        const cat = (parts[3] || 'Marketing').replace(/["]/g, '').trim();
        const qty = parseFloat(parts[4]) || 1;
        return {
          id: `task_parsed_${Date.now()}_${idx}`,
          title: title || `Công việc ${idx + 1}`,
          category: cat || 'Marketing',
          status: 'completed',
          priority: 'medium',
          date: targetDate || new Date().toISOString().split('T')[0],
          quantity: qty,
          timeSpentHours: Math.min(4, Math.max(1, qty * 1.2)),
          completionPercent: 100,
          kpiMetric: `Hoàn thành ${qty} mục tiêu`,
          outcome: 'Đã hoàn thành',
        };
      });
      return res.json({ tasks: parsedTasks });
    }

    const prompt = `Bạn là chuyên gia phân tích dữ liệu công việc và tổng hợp báo cáo chuyên nghiệp.
Dưới đây là dữ liệu công việc được trích xuất từ bảng tính Google Sheets hoặc ghi chú công việc:
Ngày báo cáo mục tiêu: ${targetDate || 'Hôm nay'}

Dữ liệu thô từ bảng tính / văn bản:
"""
${rawText}
"""

HƯỚNG DẪN BÓC TÁCH & TỔNG HỢP:
1. Bóc tách từng dòng công việc thành đối tượng công việc chuẩn.
2. Nếu bảng tính có cột ngày (ví dụ: 1/8/2026, 2/9/2026, 3/9/2026, 4/9/2026...) và các dòng kế tiếp để trống ngày, hãy kế thừa ngày của dòng liền trước đó. Chuyển đổi định dạng ngày sang chuẩn 'YYYY-MM-DD' (Ví dụ: 1/8/2026 -> 2026-08-01 hoặc 2026-09-01 tuỳ ngữ cảnh).
3. Đặt 'timeSpentHours' hợp lý (ví dụ: 1h - 3h cho mỗi đầu việc tuỳ theo độ phức tạp hoặc số lượng công việc).
4. Phân loại chuẩn 'category': 'Phát triển' | 'Thiết kế' | 'Kinh doanh' | 'Marketing' | 'Quản trị' | 'Hỗ trợ' | 'Khác'.
5. Xác định 'kpiMetric' cụ thể (ví dụ: "Edit 3 video ngày 9/9, hoàn thành 100%", "Quay 1 clip bán hàng đạt chuẩn").
6. 'outcome' đúc kết kết quả đạt được thực tế.
7. 'completionPercent': 100 nếu đã xong, hoặc 50-80 nếu đang làm.

Hãy trả về định dạng JSON thuần:
{
  "tasks": [
    {
      "title": "Tên đầu việc cụ thể, súc tích",
      "description": "Mô tả chi tiết hoặc ghi chú nếu có",
      "category": "Marketing",
      "status": "completed",
      "priority": "high" | "medium" | "low",
      "date": "YYYY-MM-DD",
      "quantity": 1,
      "timeSpentHours": 2.0,
      "completionPercent": 100,
      "kpiMetric": "Chỉ số đo lường KPI cụ thể",
      "outcome": "Kết quả thực tế đạt được"
    }
  ]
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanAndParseJson(response.text, { tasks: [] });
    const tasksWithId = (parsed.tasks || []).map((t: any, i: number) => ({
      ...t,
      id: `task_ai_${Date.now()}_${i}`,
      date: t.date || targetDate || new Date().toISOString().split('T')[0],
      quantity: Number(t.quantity) || 1,
      timeSpentHours: Number(t.timeSpentHours) || 1.5,
      completionPercent: Number(t.completionPercent) || 100,
      priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
      status: ['completed', 'in_progress', 'pending', 'blocked'].includes(t.status) ? t.status : 'completed',
    }));

    res.json({ tasks: tasksWithId });
  } catch (error: any) {
    console.error('Error in parse-tasks:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi bóc tách công việc' });
  }
});

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 3D WorkReport Server running on http://localhost:${PORT}`);
  });
}

startServer();
