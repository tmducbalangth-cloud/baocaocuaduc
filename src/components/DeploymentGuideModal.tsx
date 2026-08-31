import React, { useState } from 'react';
import { X, Globe, Terminal, Server, Cloud, Check, Copy, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'vercel' | 'vps' | 'docker' | 'local'>('local');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.3)] p-6 md:p-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-display flex items-center gap-2">
                Hướng Dẫn Triển Khai App Ra Môi Trường Ngoài
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                  Production Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cách tải mã nguồn, chạy trên máy cá nhân hoặc đưa lên máy chủ Cloud / Vercel / Docker
              </p>
            </div>
          </div>
          <button
            id="close-deploy-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center gap-2 py-3 border-b border-slate-800/80 overflow-x-auto shrink-0">
          {[
            { id: 'local', label: '1. Chạy trên máy (Localhost)', icon: Terminal },
            { id: 'vercel', label: '2. Deploy Vercel / Netlify (Miễn phí)', icon: Cloud },
            { id: 'docker', label: '3. Docker & VPS Linux', icon: Server },
            { id: 'vps', label: '4. Google Cloud Run / Render', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 my-3 pr-2 space-y-4 text-xs text-slate-300">
          {activeTab === 'local' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Bước 1: Tải mã nguồn về máy tính
                </h3>
                <p className="text-slate-400">
                  Bạn có thể bấm vào menu góc trên của Google AI Studio và chọn <strong>Export to ZIP</strong> hoặc kết nối <strong>GitHub</strong> để tải mã nguồn về máy.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Bước 2: Cài đặt thư viện và chạy ứng dụng
                </h3>
                <p className="text-slate-400">Mở thư mục dự án trong Terminal / VS Code và chạy các lệnh sau:</p>

                <div className="relative group">
                  <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-300 overflow-x-auto text-[11px]">
{`# 1. Cài đặt các gói phụ thuộc (Dependencies)
npm install

# 2. Chạy môi trường phát triển (Dev server)
npm run dev`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard('npm install\nnpm run dev', 1)}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 flex items-center gap-1"
                  >
                    {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 1 ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <p className="text-slate-400">
                  Mở trình duyệt truy cập: <span className="text-cyan-300 font-mono">http://localhost:3000</span> hoặc <span className="text-cyan-300 font-mono">http://localhost:5173</span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  Triển khai lên Vercel chỉ trong 2 phút (Khuyên dùng)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-400">
                  <li>Đẩy code lên tài khoản GitHub của bạn (<span className="font-mono text-cyan-300">git push origin main</span>).</li>
                  <li>Truy cập <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-300 underline font-semibold">vercel.com</a> và chọn <strong>Add New Project</strong>.</li>
                  <li>Chọn Repository GitHub của bạn.</li>
                  <li>Cấu hình tự động nhận diện: Framework <strong>Vite</strong>, Build Command <strong>npm run build</strong>, Output Directory <strong>dist</strong>.</li>
                  <li>Bấm <strong>Deploy</strong>. Vercel sẽ cung cấp tên miền miễn phí dạng <span className="font-mono text-emerald-300">your-project.vercel.app</span> có HTTPS sẵn sàng.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 text-xs">
                💡 <strong>Ưu điểm Vercel/Netlify:</strong> Hoàn toàn miễn phí, tự động cập nhật khi bạn push code mới lên GitHub, tốc độ tải cực nhanh với CDN toàn cầu.
              </div>
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Triển khai bằng Dockerfile & Nginx trên VPS
                </h3>
                <p className="text-slate-400">Tạo file <span className="font-mono text-cyan-300">Dockerfile</span> ở thư mục gốc:</p>

                <div className="relative group">
                  <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-300 overflow-x-auto text-[11px]">
{`# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]`, 2)}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 flex items-center gap-1"
                  >
                    {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 2 ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>

                <p className="text-slate-400">Chạy lệnh build container:</p>
                <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-200 text-[11px]">
{`docker build -t 3d-workreport .
docker run -d -p 80:80 --name workreport-app 3d-workreport`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'vps' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Triển khai trên Google Cloud Run hoặc Render
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li><strong>Render / Railway:</strong> Tạo Static Site, chọn repository GitHub, đặt Build Command là <span className="font-mono text-cyan-300">npm run build</span> và Publish Directory là <span className="font-mono text-cyan-300">dist</span>.</li>
                  <li><strong>Google Cloud Run:</strong> Sử dụng lệnh <span className="font-mono text-cyan-300">gcloud run deploy</span> để triển khai container serverless tự động co giãn.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Dữ liệu công việc & báo cáo được lưu trữ tự động an toàn trong trình duyệt hoặc đồng bộ Cloud.
          </span>
          <button
            id="deploy-modal-close-action"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
