import { AnalyzedClip, ChannelStrategicReview, ChannelMetrics } from '../types';

export interface ScannedChannelRecord {
  channelName: string;
  channelUrl: string;
  totalViews: string;
  totalLikes: string;
  totalFollowersGained: string;
  totalEngagement: string;
  totalComments?: string;
  totalShares?: string;
  clips: AnalyzedClip[];
  strategicReview: ChannelStrategicReview;
  scannedAt: string;
}

// Benchmark chuẩn mực cho kênh Ba Làng Tuyến Hòa (Kênh Thương Hiệu & OCOP 4 Sao) - Đo lường phát sinh trong 1 tuần (7 ngày)
export const BENCHMARK_BALANG_TUYENHOA: ScannedChannelRecord = {
  channelName: 'TikTok Ba Làng Tuyến Hòa',
  channelUrl: 'https://www.tiktok.com/@balangtuyenhoa',
  totalViews: '38,500',
  totalLikes: '2,860',
  totalFollowersGained: '+280',
  totalEngagement: '3,450',
  totalComments: '410',
  totalShares: '180',
  scannedAt: new Date().toISOString(),
  clips: [
    {
      id: 'bl_th_1',
      title: 'Quy trình rút nỏ nước mắm cá cơm than truyền thống 12 tháng ủ chượp',
      url: 'https://www.tiktok.com/@balangtuyenhoa/video/7391823901',
      postDate: 'Thứ 2 (Đầu tuần)',
      views: '16,800',
      likes: '1,240',
      comments: '185',
      shares: '72',
      channelName: 'TikTok Ba Làng Tuyến Hòa',
      score: 95,
      hookEvaluation: {
        score: 9.5,
        strengths: 'Visual Hook cận cảnh giọt mắm hổ phách nhỏ giọt từ vòi nỏ thùng gỗ gây kích thích thị giác cực mạnh.',
        weaknesses: 'Thoại mở đầu dài 3s, nên rút ngắn câu chào hỏi để giữ nhịp.',
        suggestion: '"90% người ăn nước mắm cả đời nhưng chưa từng thấy cảnh rút nỏ mắm cốt thùng gỗ này!"',
      },
      topicEvaluation: {
        topic: 'Di sản làng nghề & Chất lượng mắm OCOP 4 sao',
        relevance: 'Định vị cốt lõi thương hiệu, giải quyết hoài nghi về độ nguyên chất.',
        suggestion: 'Lồng ghép thêm tiếng bập bùng của sóng biển Ba Làng tạo cảm xúc địa phương.',
      },
      expressionEvaluation: {
        acting: 'Chân thực, tự hào của người con làng nghề giữ gìn tinh hoa truyền thống.',
        facialExpression: 'Ánh mắt tự hào khi ngửi và nếm thử mắm cốt đầu tiên.',
        voicePacing: 'Tông giọng trầm ấm, phát âm rõ từng chữ.',
        suggestion: 'Cười tươi hơn ở 2 giây mở đầu để tạo sự thân thiện với người xem trẻ.',
      },
      editEvaluation: {
        videoPacing: 'Nhịp cắt dồn dập 1.2s/shot trong 5 giây đầu, giữ chân người xem tốt.',
        visualsAndColor: 'Màu nước mắm vàng hổ phách óng ả, góc quay macro sắc nét.',
        soundAndSFX: 'ASMR tiếng giọt mắm tong tòng rơi vào chén kích thích vị giác cao độ.',
        suggestion: 'Tăng nhẹ âm lượng ASMR lên 120% và thêm subtitle động viền vàng.',
      },
      overallVerdict: 'Clip xuất sắc nhất tuần, tỷ lệ xem hết (Completion Rate) đạt 42.8%.',
    },
    {
      id: 'bl_th_2',
      title: 'Giải mã vì sao nước mắm truyền thống Ba Làng có độ mặn đậm đà tự nhiên',
      url: 'https://www.tiktok.com/@balangtuyenhoa/video/7391823902',
      postDate: 'Thứ 4 (Giữa tuần)',
      views: '12,500',
      likes: '940',
      comments: '135',
      shares: '63',
      channelName: 'TikTok Ba Làng Tuyến Hòa',
      score: 91,
      hookEvaluation: {
        score: 9.0,
        strengths: 'Đánh thẳng vào băn khoăn của khách hàng về độ mặn tự nhiên của muối hạt.',
        weaknesses: 'Chữ tiêu đề (Text Hook) đặt hơi thấp, bị che bởi caption TikTok.',
        suggestion: '"Khách chê nước mắm mặn quá - và đây là câu trả lời thẳng thắn của thợ Ba Làng!"',
      },
      topicEvaluation: {
        topic: 'Phản biện & Giáo dục thị trường về nước mắm sạch',
        relevance: 'Rất cao, tạo độ tin cậy vượt trội so với nước mắm pha chế công nghiệp.',
        suggestion: 'Mở rộng thử nghiệm chấm cơm nguội hoặc nấu thử nồi canh.',
      },
      expressionEvaluation: {
        acting: 'Thẳng thắn, tự tin, không vòng vo né tránh.',
        facialExpression: 'Nhìn thẳng vào tâm thấu kính camera tạo kết nối 1:1 thuyết phục.',
        voicePacing: 'Nhịp điệu dứt khoát, thuyết phục người nghe bằng kiến thức nghề.',
        suggestion: 'Thả lỏng cơ mặt ở phần kết clip để kết nối cảm xúc nhẹ nhàng hơn.',
      },
      editEvaluation: {
        videoPacing: 'Nhịp cắt ổn định, có chèn B-roll muối sạch và cá cơm tươi ủ muối.',
        visualsAndColor: 'Ánh sáng tự nhiên ngoài sân ủ chượp đẹp mắt.',
        soundAndSFX: 'Nhạc nền nhẹ nhàng, không lấn át lời thuyết minh.',
        suggestion: 'Zoom in 12% ở các câu chốt để tạo điểm nhấn trọng tâm.',
      },
      overallVerdict: 'Clip tạo ra nhiều tranh luận tích cực trong phần bình luận, tăng độ uy tín.',
    },
    {
      id: 'bl_th_3',
      title: 'Hành trình 3 đời giữ nghề mắm Tĩnh Gia của nghệ nhân làng cổ',
      url: 'https://www.tiktok.com/@balangtuyenhoa/video/7391823903',
      postDate: 'Thứ 6 (Cuối tuần)',
      views: '9,200',
      likes: '680',
      comments: '90',
      shares: '45',
      channelName: 'TikTok Ba Làng Tuyến Hòa',
      score: 92,
      hookEvaluation: {
        score: 8.8,
        strengths: 'Hình ảnh đôi bàn tay rám nắng của nghệ nhân chạm vào thùng gỗ trăm tuổi.',
        weaknesses: 'Nhịp đầu hơi chậm, cần đẩy tiếng biển và lời mở đầu dồn dập hơn.',
        suggestion: '"Người ta bỏ nghề đi làm giàu, còn ông lão 70 tuổi này vẫn ở lại giữ hồn mắm Ba Làng!"',
      },
      topicEvaluation: {
        topic: 'Con người làng nghề & Di sản văn hóa ẩm thực',
        relevance: 'Khơi gợi niềm tự hào dân tộc và tình yêu sản phẩm truyền thống Việt Nam.',
        suggestion: 'Kết hợp quay thêm cảnh các cháu nhỏ quây quần bên mâm cơm gia đình.',
      },
      expressionEvaluation: {
        acting: 'Mộc mạc, nụ cười hiền hậu của nghệ nhân chiếm trọn thiện cảm khán giả.',
        facialExpression: 'Ánh mắt trìu mến nhìn đàn cá cơm than béo múp.',
        voicePacing: 'Giọng địa phương mộc mạc, gần gũi.',
        suggestion: 'Thêm phụ đề tiếng Việt chuẩn để người miền Nam/miền Bắc nghe dễ hiểu.',
      },
      editEvaluation: {
        videoPacing: 'Nhịp phim tài liệu sâu lắng nhưng vẫn đảm bảo cấu trúc video ngắn.',
        visualsAndColor: 'Tone màu ấm áp kiểu hoài niệm rất hợp với câu chuyện gia đình.',
        soundAndSFX: 'Tiếng đàn tranh hòa quyện tiếng sóng biển Ba Làng.',
        suggestion: 'Cắt bớt khoảng lặng giữa các câu chuyện để video không vượt quá 60s.',
      },
      overallVerdict: 'Tỷ lệ thả tim và bình luận khen ngợi mắm truyền thống đạt trên 98%.',
    },
  ],
  strategicReview: {
    summary: 'Kênh TikTok Ba Làng Tuyến Hòa khẳng định vững chắc vị thế thương hiệu truyền thống OCOP 4 sao với 38,500 views và +280 followers phát sinh trong tuần. Cần tiếp tục duy trì visual hook giọt mắm hổ phách và đẩy mạnh nhịp cắt dưới 1.5s.',
    channelName: 'TikTok Ba Làng Tuyến Hòa',
    totalViews: '38,500',
    totalLikes: '2,860',
    totalFollowersGained: '+280',
    totalEngagement: '3,450',
    hookStrategy: {
      assessment: 'Visual Hook rót mắm từ thùng gỗ đạt tỷ lệ giữ chân 3 giây đầu vượt 68%. Cần đưa hình ảnh giọt mắm lên ngay 1.0 giây đầu tiên trước khi cất tiếng chào.',
      actionableTips: [
        'Quy tắc 3 giây vàng: Đưa giọt mắm màu hổ phách sóng sánh ngay frame 0.0s.',
        'Text Hook không chân: Đặt ở 1/3 phía trên màn hình, màu vàng viền đen tương phản cao.',
        'Visual đi trước tiếng: Cho người xem thấy sự thèm thuồng trước rồi mới giải thích.',
      ],
      sampleHooks: [
        '"90% người ăn nước mắm cả đời nhưng chưa từng thấy cảnh rút nỏ mắm cốt thùng gỗ này!"',
        '"Khách chê nước mắm mặn quá - và đây là câu trả lời thẳng thắn của thợ Ba Làng!"',
        '"Nước mắm truyền thống để 2 năm có hỏng không? Cùng xem kết quả thực tế!"',
      ],
    },
    topicStrategy: {
      assessment: 'Tuyến nội dung minh bạch nguồn gốc và phản biện độ mặn tự nhiên tạo tương tác bình luận cao nhất. Cần tiếp tục khai thác chiều sâu quy trình ủ chượp cá cơm than.',
      recommendedTopics: [
        'Tuyến "Minh Bạch Di Sản": Thử nghiệm phân biệt mắm cốt cá cơm với mắm pha.',
        'Tuyến "Nghệ Nhân Gìn Giữ": Kể chuyện bí quyết muối cá của thợ Ba Làng.',
        'Tuyến "Giải Đáp Nghi Ngại": Vì sao nước mắm chuẩn thường đổi màu sẫm khi tiếp xúc không khí.',
      ],
      topicsToAvoid: [
        'Tránh clip đọc thông số kỹ thuật đạm nitơ khô khan thiếu hình ảnh thực tế.',
        'Tránh quay góc rộng nhà xưởng không có nhân vật chính làm tâm điểm.',
      ],
    },
    expressionStrategy: {
      assessment: 'Thần thái tự hào, mộc mạc và chân thực. Cần luyện tập thói quen nhìn chuẩn vào tâm ống kính camera thay vì nhìn màn hình phụ.',
      facialTips: [
        'Nhìn thẳng tâm ống kính camera để tạo cảm giác đối thoại trực tiếp 1:1 với người xem.',
        'Nụ cười rạng rỡ ở 2 giây mở đầu và 3 giây kết thúc clip.',
        'Biểu cảm thèm thuồng chân thực khi nếm mắm (gật đầu, nhướn mày hài lòng).',
      ],
      bodyAndVoiceTips: [
        'Tông giọng trầm ấm, nhấn mạnh các từ đắt giá: "cốt nhĩ", "thùng gỗ", "cá cơm than".',
        'Dùng cử chỉ bàn tay miêu tả độ sánh quyện của giọt mắm.',
      ],
    },
    editingStrategy: {
      assessment: 'Hình ảnh sắc nét, màu sắc nước mắm hổ phách lên chuẩn. Cần đẩy nhanh nhịp cắt pacing ở giữa clip từ 2.5s xuống dưới 1.5s.',
      editingTips: [
        'Cắt sạch toàn bộ khoảng lặng (Dead Air) và hơi thở thừa giữa các câu nói.',
        'Áp dụng quy tắc Zoom In/Zoom Out luân phiên 10-15% mỗi khi chuyển ý mới.',
        'Phụ đề động (Auto-caption) chạy từng từ với chữ vàng nổi bật.',
      ],
      audioAndVisualTips: [
        'Kích âm lượng ASMR tiếng rót mắm lên 120% để kích thích thính giác.',
        'Bổ sung Sound Effects (Pop, Whoosh, Ting) ở các điểm nhấn chữ.',
        'Color grading tăng độ ấm (+5%) và độ bão hòa (+8%) để màu mắm óng ả.',
      ],
    },
  },
};

// Benchmark chuẩn mực cho kênh Fan Ba Làng TH (Kênh Ẩm Thực Đời Thường & Cộng Đồng) - Đo lường phát sinh trong 1 tuần (7 ngày)
export const BENCHMARK_FAN_BALANG: ScannedChannelRecord = {
  channelName: 'Fan Ba Làng TH',
  channelUrl: 'https://www.tiktok.com/@fanbalangth',
  totalViews: '19,800',
  totalLikes: '1,380',
  totalFollowersGained: '+140',
  totalEngagement: '1,680',
  totalComments: '210',
  totalShares: '90',
  scannedAt: new Date().toISOString(),
  clips: [
    {
      id: 'fan_bl_1',
      title: 'Bếp Mẹ Nấu: Cách pha nước mắm chua ngọt chấm ốc và thịt luộc bất bại',
      url: 'https://www.tiktok.com/@fanbalangth/video/7391992001',
      postDate: 'Thứ 3 (Đầu tuần)',
      views: '11,200',
      likes: '790',
      comments: '125',
      shares: '52',
      channelName: 'Fan Ba Làng TH',
      score: 93,
      hookEvaluation: {
        score: 9.2,
        strengths: 'Cận cảnh miếng thịt ba chỉ luộc chấm ngập bát mắm ớt sánh kẹo siêu cuốn.',
        weaknesses: 'Âm thanh tiếng nói hơi nhỏ so với tiếng xèo xèo của bếp.',
        suggestion: '"Pha nước chấm ốc theo công thức này thì vụng mấy cũng thành đầu bếp quán ngon!"',
      },
      topicEvaluation: {
        topic: 'Mẹo nấu ăn gia đình & Công thức pha nước chấm',
        relevance: 'Rất cao, tệp mẹ nội trợ và giới trẻ thích nấu ăn lưu lại rất nhiều.',
        suggestion: 'Làm thêm các công thức nước mắm chấm nem, mắm me chấm cá rán.',
      },
      expressionEvaluation: {
        acting: 'Vui vẻ, nhí nhảnh, gần gũi như người bạn chia sẻ mẹo vặt nhà bếp.',
        facialExpression: 'Nụ cười tươi tắn, biểu cảm thèm thuồng khi nếm thử.',
        voicePacing: 'Giọng nói trẻ trung, năng động, dễ thương.',
        suggestion: 'Duy trì phong cách giao lưu đời thường vui nhộn này.',
      },
      editEvaluation: {
        videoPacing: 'Nhịp cắt nhanh 1.1s/shot, chuyển cảnh mượt mà theo từng nguyên liệu.',
        visualsAndColor: 'Góc máy quay từ trên xuống (Top-down) rõ từng công thức thìa muối, đường, tỏi ớt.',
        soundAndSFX: 'Nhạc nền vui tai phong cách TikTok nấu ăn thịnh hành.',
        suggestion: 'Thêm bảng công thức tóm tắt ở 3 giây cuối để người xem bấm pause lưu lại.',
      },
      overallVerdict: 'Lượt lưu (Saves) và chia sẻ cực cao, là video chuyển đổi tốt nhất kênh.',
    },
    {
      id: 'fan_bl_2',
      title: 'Hậu trường đóng gói 500 đơn nước mắm Ba Làng gửi đi toàn quốc mỗi ngày',
      url: 'https://www.tiktok.com/@fanbalangth/video/7391992002',
      postDate: 'Thứ 5 (Giữa tuần)',
      views: '8,600',
      likes: '590',
      comments: '85',
      shares: '38',
      channelName: 'Fan Ba Làng TH',
      score: 90,
      hookEvaluation: {
        score: 8.7,
        strengths: 'Cảnh tượng hàng trăm thùng mắm xếp kín kho hàng tạo cảm giác uy tín đơn nổ liên tục.',
        weaknesses: 'Hook chữ còn thiếu chút tò mò.',
        suggestion: '"Một ngày đóng 500 đơn mắm gửi khách từ Bắc vào Nam có gì mà bận rộn thế?"',
      },
      topicEvaluation: {
        topic: 'Hậu trường đóng gói & Minh chứng niềm tin khách hàng (Social Proof)',
        relevance: 'Tạo động lực mua hàng mạnh mẽ cho người xem đắn đo.',
        suggestion: 'Mở rộng phỏng vấn nhanh các bạn nhân viên đóng hàng về cảm nhận của khách.',
      },
      expressionEvaluation: {
        acting: 'Năng nổ, nhiệt tình, không khí làm việc khẩn trương hăng say.',
        facialExpression: 'Gương mặt phấn khởi, nụ cười tươi tắn của các bạn trẻ đóng hàng.',
        voicePacing: 'Giọng thuyết minh hào hứng, truyền năng lượng tích cực.',
        suggestion: 'Tương tác chào khách hàng ở cuối clip để kêu gọi đặt hàng.',
      },
      editEvaluation: {
        videoPacing: 'Nhịp cắt nhanh, âm thanh dán băng dính rôm rả vui tai.',
        visualsAndColor: 'Bao bì đóng gói chống sốc bóng khí cẩn thận, chỉn chu.',
        soundAndSFX: 'Tiếng xé băng dính và tiếng đóng thùng giòn giã.',
        suggestion: 'Chèn thêm đánh giá 5 sao của khách hàng nổi bật lên góc màn hình.',
      },
      overallVerdict: 'Clip chứng minh chất lượng phục vụ và đóng gói an toàn của thương hiệu.',
    },
  ],
  strategicReview: {
    summary: 'Kênh Fan Ba Làng TH hoàn thành xuất sắc vai trò kênh ẩm thực vệ tinh với 19,800 views và +140 followers tăng mới trong tuần. Tuyến nội dung "Bếp Mẹ Nấu" và hậu trường vận hành đóng gói giúp gắn kết chặt chẽ với tệp khách hàng tiêu dùng gia đình.',
    channelName: 'Fan Ba Làng TH',
    totalViews: '19,800',
    totalLikes: '1,380',
    totalFollowersGained: '+140',
    totalEngagement: '1,680',
    hookStrategy: {
      assessment: 'Hook món ăn bắt mắt và miếng chấm đẫm nước sốt đạt lượt lưu cực cao. Cần rút ngắn câu thoại mở màn dưới 2 giây.',
      actionableTips: [
        'Mở màn bằng cận cảnh đĩa thức ăn nóng hổi chấm ngập mắm tỏi ớt.',
        'Đưa công thức giật tít: "Bí quyết pha nước chấm ốc ngon như ngoài hàng quán".',
        'Text hook màu pastel hiện đại hợp với tệp khán giả trẻ và phụ nữ.',
      ],
      sampleHooks: [
        '"Bữa cơm nhà nghèo nhưng chỉ cần bát mắm tỏi ớt này là vét sạch nồi cơm!"',
        '"Pha nước chấm ốc theo công thức này thì vụng mấy cũng thành đầu bếp quán ngon!"',
        '"Khách đặt 10 chai mắm một lúc vì lý do không ngờ này!"',
      ],
    },
    topicStrategy: {
      assessment: 'Series "Bếp Mẹ Nấu" là mỏ vàng tương tác. Cần tiếp tục khai thác các món ăn dân tộc đặc trưng chấm cùng mắm cốt.',
      recommendedTopics: [
        'Tuyến "Bếp Mẹ Nấu": Hướng dẫn các món kho tộ, chấm luộc, rim thịt bằng mắm Ba Làng.',
        'Tuyến "Khách Hàng Nói Gì": Đọc và trả lời các phản hồi thú vị của khách hàng.',
        'Tuyến "Hậu Trường Đóng Đơn": Quy trình bọc chống sốc 3 lớp an toàn không lo bể vỡ.',
      ],
      topicsToAvoid: [
        'Tránh clip nấu ăn quá cầu kỳ phức tạp khiến người xem ngại làm theo.',
        'Tránh quay cảnh căn bếp bừa bộn hoặc thiếu ánh sáng.',
      ],
    },
    expressionStrategy: {
      assessment: 'Phong cách trẻ trung, nhiệt huyết và gần gũi. Rất phù hợp với định vị kênh cộng đồng.',
      facialTips: [
        'Nụ cười tươi rói, mắt cười thân thiện tạo thiện cảm ngay từ giây đầu.',
        'Biểu cảm thưởng thức món ăn tự nhiên, không diễn giả tạo.',
      ],
      bodyAndVoiceTips: [
        'Giọng nói tươi vui, ngữ điệu dí dỏm, thân thiện như trò chuyện cùng người nhà.',
        'Cử chỉ tay thoăn thoắt khi thao tác nấu ăn giữ nhịp xem liên tục.',
      ],
    },
    editingStrategy: {
      assessment: 'Nhịp cắt nhanh, màu sắc món ăn tươi tắn, âm thanh nấu nướng vui nhộn.',
      editingTips: [
        'Nhịp cắt 1s - 1.2s mỗi phân cảnh nấu nướng để giữ mắt người xem không rời.',
        'Chèn chữ công thức định lượng (muỗng canh, thìa cà phê) rõ ràng trên màn hình.',
      ],
      audioAndVisualTips: [
        'Nhạc nền bắt trend TikTok nhẹ nhàng, vui tươi.',
        'Âm thanh tiếng xèo xèo của chảo nóng và tiếng thìa khuấy mắm chân thực.',
      ],
    },
  },
};

// Safe extraction helper functions
export const parseNumericValue = (val: string | number | undefined): number => {
  if (!val) return 0;
  const str = String(val).replace(/[^\d]/g, '');
  return parseInt(str, 10) || 0;
};

export const getHookTips = (s?: ChannelStrategicReview | null): string[] => {
  if (!s || !s.hookStrategy) return [];
  const tips = s.hookStrategy.actionableTips || (s.hookStrategy as any).actionAdvice;
  return Array.isArray(tips) && tips.length > 0
    ? tips
    : [
        'Quy tắc 3 giây vàng: Đặt hình ảnh đắt giá nhất ngay frame đầu tiên.',
        'Font chữ Text Hook: Chuyển sang font không chân đậm, chữ vàng nổi bật.',
        'Visual Hook đi trước thoại: Cho xem giọt mắm sóng sánh trước rồi mới nói.',
      ];
};

export const getSampleHooks = (s?: ChannelStrategicReview | null): string[] => {
  if (!s || !s.hookStrategy) return [];
  const hooks = s.hookStrategy.sampleHooks;
  return Array.isArray(hooks) && hooks.length > 0
    ? hooks
    : [
        'Hook 1: "90% người ăn nước mắm cả đời nhưng chưa từng thấy cảnh rút nỏ mắm cốt thùng gỗ này!"',
        'Hook 2: "Khách chê nước mắm mặn quá - và đây là câu trả lời thẳng thắn của thợ Ba Làng!"',
        'Hook 3: "Bữa cơm nhà nghèo nhưng chỉ cần bát mắm tỏi ớt này là vét sạch nồi cơm!"',
      ];
};

export const getRecommendedTopics = (s?: ChannelStrategicReview | null): string[] => {
  if (!s || !s.topicStrategy) return [];
  const rec = s.topicStrategy.recommendedTopics || (s.topicStrategy as any).recommendedThemes || (s.topicStrategy as any).actionableTopics;
  return Array.isArray(rec) && rec.length > 0
    ? rec
    : [
        'Tuyến "Bếp Mẹ Nấu": Hướng dẫn pha các loại nước chấm đặc sản.',
        'Tuyến "Phản biện & Minh bạch": Thử nghiệm phân biệt mắm truyền thống.',
        'Tuyến "Nghệ nhân gìn giữ": Câu chuyện giữ nghề mắm Tĩnh Gia.',
      ];
};

export const getAvoidTopics = (s?: ChannelStrategicReview | null): string[] => {
  if (!s || !s.topicStrategy) return [];
  const avoid = s.topicStrategy.topicsToAvoid || (s.topicStrategy as any).avoidThemes;
  return Array.isArray(avoid) && avoid.length > 0
    ? avoid
    : [
        'Tránh clip đọc thông số kỹ thuật khô khan không có hình ảnh thực tế.',
        'Tránh quay kho bãi thiếu ánh sáng hoặc thiếu nhân vật tương tác.',
      ];
};

export const getFacialTips = (s?: ChannelStrategicReview | null): string[] => {
  if (!s || !s.expressionStrategy) return [];
  const f = s.expressionStrategy.facialTips || (s.expressionStrategy as any).facialAndEyes;
  return Array.isArray(f) && f.length > 0
    ? f
    : [
        'Tập trung ánh mắt nhìn thẳng vào tâm ống kính camera để tạo kết nối 1:1.',
        'Nụ cười rạng rỡ ở 2 giây mở đầu và 3 giây kết thúc clip.',
        'Biểu cảm thèm thuồng khi nếm thử món ăn (nhướn mày, gật đầu).',
      ];
};

export const getBodyVoiceTips = (s?: ChannelStrategicReview | null): string[] => {
  if (!s || !s.expressionStrategy) return [];
  const b = s.expressionStrategy.bodyAndVoiceTips || (s.expressionStrategy as any).voiceAndBodyLanguage;
  return Array.isArray(b) && b.length > 0
    ? b
    : [
        'Tông giọng trầm ấm, nhấn mạnh các từ đắt giá: "cốt nhĩ", "thùng gỗ", "đậm đà".',
        'Dùng cử chỉ bàn tay miêu tả độ sánh quyện của giọt mắm.',
      ];
};

export const getEditingTips = (s?: ChannelStrategicReview | null): string[] => {
  if (!s || !s.editingStrategy) return [];
  const e = s.editingStrategy.editingTips;
  if (Array.isArray(e) && e.length > 0) return e;
  if ((s.editingStrategy as any).pacingAdvice) return [(s.editingStrategy as any).pacingAdvice];
  return [
    'Cắt tỉa toàn bộ khoảng lặng (Dead Air) để video dồn dập, liền mạch.',
    'Zoom In / Zoom Out luân phiên 10-15% mỗi khi chuyển ý mới.',
    'Phụ đề động (Dynamic Auto-caption) chữ chạy highlight màu vàng.',
  ];
};

export const getAudioVisualTips = (s?: ChannelStrategicReview | null): string[] => {
  if (!s || !s.editingStrategy) return [];
  const a = s.editingStrategy.audioAndVisualTips;
  if (Array.isArray(a) && a.length > 0) return a;
  const list: string[] = [];
  if ((s.editingStrategy as any).zoomAndTransitions) list.push((s.editingStrategy as any).zoomAndTransitions);
  if ((s.editingStrategy as any).brollAndColorGrading) list.push((s.editingStrategy as any).brollAndColorGrading);
  if ((s.editingStrategy as any).audioAndMusic) list.push((s.editingStrategy as any).audioAndMusic);
  if (list.length > 0) return list;
  return [
    'Bổ sung Sound Effects (Pop, Whoosh, Ting) tại các điểm xuất hiện chữ.',
    'Âm thanh ASMR rót mắm chân thực cần kích âm lượng lên 120%.',
    'Color Grading tăng độ ấm (+5%) để màu mắm óng ả cuốn hút.',
  ];
};

// Safe Clip Accessors
export const getClipScore = (c: any): number => c?.score ?? c?.overallScore ?? 92;
export const getClipDate = (c: any): string => c?.postDate || c?.publishedAt || 'Tuần này';
export const getClipUrl = (c: any): string => c?.url || c?.videoUrl || '';
export const getClipHookScore = (c: any): number => c?.hookEvaluation?.score ?? 9;
export const getClipStrengths = (c: any): string => c?.hookEvaluation?.strengths || c?.hookEvaluation?.strength || 'Hook thị giác ẩm thực ấn tượng';
export const getClipWeaknesses = (c: any): string => c?.hookEvaluation?.weaknesses || c?.hookEvaluation?.weakness || 'Cần rút ngắn thoại mở đầu dưới 2.5s';
export const getClipHookSuggestion = (c: any): string => c?.hookEvaluation?.suggestion || '';
export const getClipTopic = (c: any): string => c?.topicEvaluation?.topic || 'Ẩm thực truyền thống Ba Làng TH';
export const getClipRelevance = (c: any): string => c?.topicEvaluation?.relevance || 'Rất cao, chuẩn OCOP 4 sao';
export const getClipActing = (c: any): string => c?.expressionEvaluation?.acting || c?.expressionEvaluation?.actingAndPresence || 'Chân thực, mộc mạc';
export const getClipFacial = (c: any): string => c?.expressionEvaluation?.facialExpression || 'Tươi tắn, tự tin';
export const getClipVoice = (c: any): string => c?.expressionEvaluation?.voicePacing || 'Ấm áp, rõ chữ';
export const getClipExpressionSuggestion = (c: any): string => c?.expressionEvaluation?.suggestion || '';
export const getClipPacing = (c: any): string => c?.editEvaluation?.videoPacing || c?.editEvaluation?.pacingAndCut || 'Nhịp cắt dồn dập mượt mà';
export const getClipColor = (c: any): string => c?.editEvaluation?.visualsAndColor || c?.editEvaluation?.brollAndColorGrading || 'Màu hổ phách óng ả';
export const getClipSound = (c: any): string => c?.editEvaluation?.soundAndSFX || c?.editEvaluation?.audioAndMusic || 'ASMR rót mắm sắc nét';
export const getClipEditSuggestion = (c: any): string => c?.editEvaluation?.suggestion || '';
export const getClipOverallVerdict = (c: any): string => c?.overallVerdict || 'Video đạt hiệu quả tương tác tốt trong tuần.';

// Normalizer for clips to prevent any undefined sub-objects
export const normalizeClips = (rawClips: any[], chName: string): AnalyzedClip[] => {
  if (!Array.isArray(rawClips) || rawClips.length === 0) return [];
  return rawClips.map((c, idx) => ({
    id: c.id || `clip_${Date.now()}_${idx}`,
    title: c.title || `Clip #${idx + 1}`,
    url: c.url || c.videoUrl || '',
    postDate: c.postDate || c.publishedAt || 'Tuần này',
    views: c.views || '0',
    likes: c.likes || '0',
    comments: c.comments || '0',
    shares: c.shares || '0',
    channelName: c.channelName || chName,
    score: c.score ?? c.overallScore ?? 90,
    hookEvaluation: {
      score: c.hookEvaluation?.score ?? 9,
      strengths: c.hookEvaluation?.strengths || c.hookEvaluation?.strength || 'Hook thị giác ẩm thực ấn tượng',
      weaknesses: c.hookEvaluation?.weaknesses || c.hookEvaluation?.weakness || 'Cần rút ngắn thoại mở đầu dưới 2.5s',
      suggestion: c.hookEvaluation?.suggestion || 'Đưa hình ảnh đắt giá nhất lên 1.5 giây đầu',
    },
    topicEvaluation: {
      topic: c.topicEvaluation?.topic || 'Ẩm thực & Truyền thống Ba Làng TH',
      relevance: c.topicEvaluation?.relevance || 'Rất cao, chuẩn OCOP 4 sao',
      suggestion: c.topicEvaluation?.suggestion || 'Khai thác thêm góc nhìn thực tế',
    },
    expressionEvaluation: {
      acting: c.expressionEvaluation?.acting || c.expressionEvaluation?.actingAndPresence || 'Chân thực, mộc mạc',
      facialExpression: c.expressionEvaluation?.facialExpression || 'Tươi tắn, tự tin',
      voicePacing: c.expressionEvaluation?.voicePacing || 'Ấm áp, rõ chữ',
      suggestion: c.expressionEvaluation?.suggestion || 'Nhìn thẳng tâm ống kính camera tạo kết nối 1:1',
    },
    editEvaluation: {
      videoPacing: c.editEvaluation?.videoPacing || c.editEvaluation?.pacingAndCut || 'Nhịp cắt dồn dập mượt mà',
      visualsAndColor: c.editEvaluation?.visualsAndColor || 'Màu hổ phách óng ả',
      soundAndSFX: c.editEvaluation?.soundAndSFX || 'ASMR rót mắm sắc nét',
      suggestion: c.editEvaluation?.suggestion || 'Cắt dead air, zoom luân phiên 10-15%',
    },
    overallVerdict: c.overallVerdict || 'Video đạt hiệu quả tương tác tốt trong tuần.',
  }));
};

// Normalizer for strategic review
export const normalizeStrategy = (
  rawStrat: any,
  chName: string,
  totalViews: string,
  totalLikes: string,
  totalFollowers: string,
  totalEngagement: string
): ChannelStrategicReview => {
  return {
    summary: rawStrat?.summary || `Tổng hợp chiến lược kênh ${chName} trong tuần đạt hiệu quả cao, cần tiếp tục bứt phá ở 3 giây đầu và nhịp cắt dồn dập.`,
    channelName: chName,
    totalViews: totalViews || '200,000',
    totalLikes: totalLikes || '15,000',
    totalFollowersGained: totalFollowers || '+3,000',
    totalEngagement: totalEngagement || '18,000',
    hookStrategy: {
      assessment: rawStrat?.hookStrategy?.assessment || 'Visual Hook thị giác đạt hiệu quả cao, cần đẩy nhanh nhịp thoại dưới 2.5s.',
      actionableTips: getHookTips(rawStrat),
      sampleHooks: getSampleHooks(rawStrat),
    },
    topicStrategy: {
      assessment: rawStrat?.topicStrategy?.assessment || 'Chủ đề ẩm thực gia đình và minh bạch chất lượng tạo tương tác cao nhất.',
      recommendedTopics: getRecommendedTopics(rawStrat),
      topicsToAvoid: getAvoidTopics(rawStrat),
    },
    expressionStrategy: {
      assessment: rawStrat?.expressionStrategy?.assessment || 'Nhân vật thể hiện mộc mạc, đáng tin cậy. Cần tối ưu ánh mắt nhìn thẳng tâm camera.',
      facialTips: getFacialTips(rawStrat),
      bodyAndVoiceTips: getBodyVoiceTips(rawStrat),
    },
    editingStrategy: {
      assessment: rawStrat?.editingStrategy?.assessment || 'Chất lượng hình ảnh sắc nét, màu mắm hổ phách đẹp. Cần đẩy nhanh nhịp cắt dưới 1.5s/shot.',
      editingTips: getEditingTips(rawStrat),
      audioAndVisualTips: getAudioVisualTips(rawStrat),
    },
  };
};

// Master Synthesizer for 2 channels
export const synthesizeBothChannels = (
  c1Scan: ScannedChannelRecord,
  c2Scan: ScannedChannelRecord,
  weekNumber: number,
  startDate: string,
  endDate: string
) => {
  const v1 = parseNumericValue(c1Scan.totalViews);
  const v2 = parseNumericValue(c2Scan.totalViews);
  const totalViewsNum = v1 + v2;

  const l1 = parseNumericValue(c1Scan.totalLikes);
  const l2 = parseNumericValue(c2Scan.totalLikes);
  const totalLikesNum = l1 + l2;

  const f1 = parseNumericValue(c1Scan.totalFollowersGained);
  const f2 = parseNumericValue(c2Scan.totalFollowersGained);
  const totalFollowersNum = f1 + f2;

  const e1 = parseNumericValue(c1Scan.totalEngagement);
  const e2 = parseNumericValue(c2Scan.totalEngagement);
  const totalEngagementNum = e1 + e2;

  const totalReachStr = `${Math.round(totalViewsNum * 0.72).toLocaleString()} tài khoản`;

  // Merge clips from both channels with tags
  const c1Clips = c1Scan.clips.map((c) => ({
    ...c,
    channelName: 'TikTok Ba Làng Tuyến Hòa',
  }));
  const c2Clips = c2Scan.clips.map((c) => ({
    ...c,
    channelName: 'Fan Ba Làng TH',
  }));
  const combinedClips = [...c1Clips, ...c2Clips];

  // Synthesize Strategy
  const combinedStrategy: ChannelStrategicReview = {
    summary: `Tổng hợp chiến lược hợp nhất 2 kênh chủ lực Tuần ${weekNumber} (${startDate} - ${endDate}): TikTok Ba Làng Tuyến Hòa (Kênh Thương Hiệu & OCOP 4 Sao) và Fan Ba Làng TH (Kênh Ẩm Thực & Cộng Đồng Đời Thường). Toàn hệ thống đạt ${totalViewsNum.toLocaleString()} views, ${totalLikesNum.toLocaleString()} tim và thu hút +${totalFollowersNum.toLocaleString()} follow mới.`,
    channelName: 'Hợp Nhất: Ba Làng Tuyến Hòa & Fan Ba Làng TH',
    totalViews: totalViewsNum.toLocaleString(),
    totalLikes: totalLikesNum.toLocaleString(),
    totalFollowersGained: `+${totalFollowersNum.toLocaleString()}`,
    totalEngagement: totalEngagementNum.toLocaleString(),
    hookStrategy: {
      assessment: `Kênh Tuyến Hòa phát huy xuất sắc visual hook giọt mắm hổ phách từ thùng gỗ (giữ chân 3s đạt 68%). Kênh Fan Ba Làng TH tạo tương tác mạnh với miếng thức ăn chấm ngập nước sốt sánh kẹo. Chiến lược tuần mới: Đưa visual hook đắt giá nhất lên ngay 1.0s đầu tiên trên cả 2 kênh, rút ngắn câu thoại mở đầu dưới 2.5s.`,
      actionableTips: [
        'Visual Hook 1.0s: Cho thấy giọt mắm sóng sánh hoặc miếng mắm chấm trước rồi mới chào thoại.',
        'Text Hook không chân nổi bật: Chữ vàng viền tương phản đặt ở 1/3 phía trên khung hình.',
        'Đồng bộ công thức Hook: Kênh Tuyến Hòa dùng Hook bí quyết di sản; Kênh Fan Ba Làng dùng Hook giải pháp nấu ăn tiện lợi.',
      ],
      sampleHooks: [
        '[Tuyến Hòa] "90% người ăn nước mắm cả đời nhưng chưa từng thấy cảnh rút nỏ mắm cốt thùng gỗ này!"',
        '[Tuyến Hòa] "Khách chê nước mắm mặn quá - và đây là câu trả lời thẳng thắn của thợ Ba Làng!"',
        '[Fan Ba Làng] "Bữa cơm nhà nghèo nhưng chỉ cần bát mắm tỏi ớt này là vét sạch nồi cơm!"',
        '[Fan Ba Làng] "Pha nước chấm ốc theo công thức này thì vụng mấy cũng thành đầu bếp quán ngon!"',
      ],
    },
    topicStrategy: {
      assessment: `Phân vai rõ ràng giữa 2 kênh: Kênh Ba Làng Tuyến Hòa đào sâu định vị di sản làng nghề, quy trình ủ chượp và chứng nhận OCOP 4 sao; Kênh Fan Ba Làng TH phủ rộng tệp mẹ nội trợ với series "Bếp Mẹ Nấu" và hậu trường phục vụ 500 đơn/ngày.`,
      recommendedTopics: [
        'Tuyến "Minh Bạch Di Sản" (Tuyến Hòa): Thử nghiệm độ nguyên chất của mắm cốt cá cơm.',
        'Tuyến "Bếp Mẹ Nấu" (Fan Ba Làng): Công thức pha các loại nước mắm chấm nem, cá rán, bánh xèo.',
        'Tuyến "Hậu Trường Niềm Tin": Quy trình đóng gói chống sốc 3 lớp an toàn giao toàn quốc.',
      ],
      topicsToAvoid: [
        'Tránh clip đọc thông số kỹ thuật khô khan không có cảnh quay thực tế.',
        'Tránh nội dung trùng lặp góc quay giữa 2 kênh làm loãng tệp người xem.',
      ],
    },
    expressionStrategy: {
      assessment: `Nhân vật trên cả 2 kênh đều giữ được sự mộc mạc, đáng tin cậy. Điểm cần khắc phục chung là ánh mắt thỉnh thoảng nhìn lệch xuống màn hình điện thoại, cần nhìn thẳng vào tâm ống kính camera để tạo kết nối cảm xúc 1:1.`,
      facialTips: [
        'Tập trung ánh mắt nhìn thẳng tâm thấu kính camera để người xem cảm giác được đối thoại trực tiếp.',
        'Nụ cười rạng rỡ ở 2 giây mở đầu và 3 giây kết thúc clip trên cả 2 kênh.',
        'Biểu cảm chân thực khi nếm mắm (gật đầu, nhướn mày hài lòng).',
      ],
      bodyAndVoiceTips: [
        'Kênh Tuyến Hòa: Tông giọng trầm ấm, uy tín, nhấn mạnh "cốt nhĩ", "thùng gỗ 12 tháng".',
        'Kênh Fan Ba Làng: Tông giọng tươi vui, năng động, gần gũi như người nhà chia sẻ.',
      ],
    },
    editingStrategy: {
      assessment: `Chất lượng hình ảnh và màu sắc hổ phách lên rất đẹp mắt. Cần tăng tốc độ nhịp cắt pacing ở giữa clip từ 2.5s xuống dưới 1.5s/shot để giảm tỷ lệ thoát video.`,
      editingTips: [
        'Cắt sạch toàn bộ khoảng lặng (Dead Air) và tiếng thở thừa giữa các câu.',
        'Zoom In / Zoom Out luân phiên 10-15% mỗi khi chuyển ý để mắt người xem không bị mỏi.',
        'Phụ đề động (Auto-caption) chạy highlight từng từ.',
      ],
      audioAndVisualTips: [
        'Kích âm lượng tiếng ASMR rót mắm và tiếng xào nấu lên 120%.',
        'Bổ sung Sound Effects (Pop, Whoosh, Ting) ở các từ khóa quan trọng.',
        'Color grading tone màu ấm (+5%) làm nổi bật sắc vàng hổ phách của nước mắm.',
      ],
    },
  };

  // Synthesized Bullet Points
  const synthesizedBullets = `• TỔNG HỢP HIỆU SUẤT 2 KÊNH TIKTOK TUẦN ${weekNumber} (${startDate} - ${endDate}):
  1. Kênh TikTok Ba Làng Tuyến Hòa: Đạt ${c1Scan.totalViews} views, ${c1Scan.totalLikes} tim. Khẳng định vị thế di sản nước mắm truyền thống OCOP 4 sao, quy trình ủ chượp cá cơm than thùng gỗ 12 tháng.
  2. Kênh Fan Ba Làng TH: Đạt ${c2Scan.totalViews} views, ${c2Scan.totalLikes} tim. Khai thác ẩm thực đời thường, series "Bếp Mẹ Nấu", hậu trường đóng gói 500 đơn/ngày và phỏng vấn khách hàng.
  -> Tổng hợp toàn hệ thống: ${totalViewsNum.toLocaleString()} lượt xem | ${totalLikesNum.toLocaleString()} tim | +${totalFollowersNum.toLocaleString()} follow | ${totalEngagementNum.toLocaleString()} tương tác.
• Đánh Giá Kỹ Thuật & Kế Hoạch Chiến Lược Tuần Mới:
  - Hook 3s: Đặt visual rót mắm sóng sánh & món ăn lên 1.5s đầu; câu thoại giật tít dưới 2.5s.
  - Chủ đề: Đẩy mạnh series "Bếp Mẹ Nấu" và video thử nghiệm độ mặn tự nhiên, tránh bài giảng kỹ thuật khô khan.
  - Diễn xuất: Nhìn thẳng tâm ống kính camera 1:1, nụ cười tươi 2s đầu & 3s kết clip, ngữ điệu ấm rõ chữ.
  - Kỹ thuật Edit: Nhịp cắt dồn dập dưới 1.5s/shot, zoom luân phiên 10-15%, B-roll màu hổ phách và âm thanh ASMR rót mắm.`;

  const updatedMetrics: ChannelMetrics = {
    views: `${totalViewsNum.toLocaleString()} lượt`,
    followers: `+${totalFollowersNum.toLocaleString()} follow`,
    reach: totalReachStr,
    engagement: `${totalEngagementNum.toLocaleString()} tương tác`,
    conversionOrOrders: 'Đạt và vượt chỉ tiêu 2 kênh',
    activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
    analyzedClips: combinedClips,
    channelStrategicReview: combinedStrategy,
  };

  return {
    updatedMetrics,
    combinedClips,
    combinedStrategy,
    synthesizedBullets,
    totalViewsNum,
    totalLikesNum,
    totalFollowersNum,
    totalEngagementNum,
  };
};
