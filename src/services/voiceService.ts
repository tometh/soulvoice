import axios from "axios";

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  suggestions: string[];
}

interface EmotionResult {
  label: string;
  score: number;
}

interface EmotionMapping {
  emotionMap: Record<string, string>;
  keywordMap: Record<string, string>;
  suggestionMap: Record<string, string[]>;
  emotionSummaryMap: Record<string, string>;
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private readonly HF_API_TOKEN = import.meta.env.VITE_HF_API_TOKEN;
  private emotionMapping: EmotionMapping | null = null;

  constructor() {
    if ("webkitSpeechRecognition" in window) {
      this.recognition = new webkitSpeechRecognition();
      this.setupRecognition();
    }
    this.initializeEmotionMapping();
  }

  private async initializeEmotionMapping() {
    try {
      // 首先尝试从本地存储获取缓存的映射
      const cachedMapping = localStorage.getItem("emotionMapping");
      if (cachedMapping) {
        try {
          const parsed = JSON.parse(cachedMapping);
          if (this.validateEmotionMapping(parsed)) {
            this.emotionMapping = parsed;
            console.log("使用缓存的情绪映射");

            // 在后台异步更新映射
            this.updateEmotionMappingFromAI().catch((error) => {
              console.warn("后台更新情绪映射失败:", error);
            });
            return;
          }
        } catch {
          console.warn("缓存的情绪映射格式错误");
        }
      }

      // 如果没有有效的缓存，先使用默认映射
      this.emotionMapping = this.getDefaultMapping();
      console.log("使用默认情绪映射");

      // 异步获取 AI 生成的映射
      this.updateEmotionMappingFromAI().catch((error) => {
        console.warn("获取 AI 情绪映射失败:", error);
      });
    } catch (error) {
      console.error("初始化情绪映射失败:", error);
      this.emotionMapping = this.getDefaultMapping();
    }
  }

  private async updateEmotionMappingFromAI() {
    try {
      // 分别获取不同部分的映射
      const [emotionMap, keywordMap] = await Promise.all([
        this.generateEmotionMap(),
        this.generateKeywordMap(),
      ]);

      // 使用情绪分析模型生成建议和总结
      const suggestionMap = await this.generateSuggestionMap(
        Object.keys(emotionMap)
      );
      const emotionSummaryMap = await this.generateSummaryMap(
        Object.keys(emotionMap)
      );

      const newMapping: EmotionMapping = {
        emotionMap,
        keywordMap,
        suggestionMap,
        emotionSummaryMap,
      };

      if (this.validateEmotionMapping(newMapping)) {
        this.emotionMapping = newMapping;
        localStorage.setItem("emotionMapping", JSON.stringify(newMapping));
        console.log("成功更新情绪映射");
      }
    } catch (error) {
      console.warn("从 AI 更新情绪映射失败:", error);
      // 使用默认映射作为后备
      this.emotionMapping = this.getDefaultMapping();
    }
  }

  private async generateEmotionMap(): Promise<Record<string, string>> {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/THUDM/chatglm3-6b",
      {
        inputs:
          "请生成一个情绪英文到中文的映射，格式为JSON对象，key为英文情绪名，value为对应的中文翻译。包括：happiness, sadness, anger, fear, surprise, neutral, disgust, anxiety 等基础情绪。",
        parameters: {
          max_length: 200,
          temperature: 0.1,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  private async generateKeywordMap(): Promise<Record<string, string>> {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/THUDM/chatglm3-6b",
      {
        inputs:
          "请生成一个中文情绪关键词到英文情绪的映射，格式为JSON对象。key为中文情绪词，value为对应的英文情绪分类（happiness, sadness, anger, fear, surprise, neutral, disgust, anxiety）。每个情绪分类至少包含5个常用的中文情绪词。",
        parameters: {
          max_length: 500,
          temperature: 0.1,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  private async generateSuggestionMap(
    emotions: string[]
  ): Promise<Record<string, string[]>> {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/THUDM/chatglm3-6b",
      {
        inputs: `请为以下每种情绪生成3条温暖、专业的心理安抚建议语。每条建议应该体现同理心、专业性和支持性。情绪列表：${emotions.join(
          ", "
        )}。输出格式为JSON对象，key为情绪英文名，value为建议语数组。`,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  private async generateSummaryMap(
    emotions: string[]
  ): Promise<Record<string, string>> {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/THUDM/chatglm3-6b",
      {
        inputs: `请为以下每种情绪生成一段精准的心理分析总结，总结应该简洁专业，体现对该情绪状态的深入理解。情绪列表：${emotions.join(
          ", "
        )}。输出格式为JSON对象，key为情绪英文名，value为分析总结。`,
        parameters: {
          max_length: 800,
          temperature: 0.3,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  private validateEmotionMapping(mapping: unknown): mapping is EmotionMapping {
    if (!mapping || typeof mapping !== "object") return false;

    const requiredKeys = [
      "emotionMap",
      "keywordMap",
      "suggestionMap",
      "emotionSummaryMap",
    ];
    if (!requiredKeys.every((key) => key in mapping)) return false;

    // 验证 emotionMap
    if (
      !this.validateStringMap((mapping as Record<string, unknown>).emotionMap)
    )
      return false;

    // 验证 keywordMap
    if (
      !this.validateStringMap((mapping as Record<string, unknown>).keywordMap)
    )
      return false;

    // 验证 suggestionMap
    if (
      !this.validateArrayMap((mapping as Record<string, unknown>).suggestionMap)
    )
      return false;

    // 验证 emotionSummaryMap
    if (
      !this.validateStringMap(
        (mapping as Record<string, unknown>).emotionSummaryMap
      )
    )
      return false;

    return true;
  }

  private validateStringMap(map: unknown): boolean {
    if (!map || typeof map !== "object") return false;
    return Object.values(map).every((value) => typeof value === "string");
  }

  private validateArrayMap(map: unknown): boolean {
    if (!map || typeof map !== "object") return false;
    return Object.values(map).every(
      (value) =>
        Array.isArray(value) && value.every((item) => typeof item === "string")
    );
  }

  private getDefaultMapping(): EmotionMapping {
    return {
      emotionMap: {
        happiness: "喜悦",
        sadness: "悲伤",
        anger: "愤怒",
        fear: "恐惧",
        surprise: "惊讶",
        neutral: "平静",
        disgust: "厌恶",
        anxiety: "焦虑",
      },
      keywordMap: {
        开心: "happiness",
        快乐: "happiness",
        喜悦: "happiness",
        高兴: "happiness",
        好棒: "happiness",
        太好了: "happiness",
        不错: "happiness",
        满意: "happiness",
        兴奋: "happiness",
        伤心: "sadness",
        难过: "sadness",
        悲伤: "sadness",
        痛苦: "sadness",
        失望: "sadness",
        沮丧: "sadness",
        郁闷: "sadness",
        生气: "anger",
        愤怒: "anger",
        烦躁: "anger",
        恼火: "anger",
        不爽: "anger",
        害怕: "fear",
        恐惧: "fear",
        担心: "fear",
        紧张: "fear",
        不安: "fear",
        惊讶: "surprise",
        震惊: "surprise",
        意外: "surprise",
        没想到: "surprise",
        吃惊: "surprise",
        平静: "neutral",
        平和: "neutral",
        安静: "neutral",
        放松: "neutral",
        淡定: "neutral",
        厌恶: "disgust",
        恶心: "disgust",
        讨厌: "disgust",
        反感: "disgust",
        焦虑: "anxiety",
        着急: "anxiety",
        慌: "anxiety",
        不踏实: "anxiety",
        忐忑: "anxiety",
      },
      suggestionMap: {
        happiness: [
          "你的快乐感染了我，让我们一起珍惜这份美好的心情",
          "看到你如此开心，我也感到温暖，继续保持这份积极的心态",
          "你的喜悦让我也充满能量，让我们一起分享这份快乐",
        ],
        sadness: [
          "我理解你现在的心情，每个人都会有低落的时候，这很正常",
          "你的感受很重要，我在这里倾听你，陪伴你度过这个时刻",
          "悲伤是人生的一部分，它让我们更懂得珍惜快乐，我与你同在",
        ],
        anger: [
          "我感受到你的愤怒，让我们先深呼吸，慢慢平复心情",
          "愤怒是正常的情绪反应，但我们可以选择如何表达它",
          "我理解你的不满，让我们一起找到更好的方式来处理这些情绪",
        ],
        fear: [
          "我理解你的担忧，让我们一起来面对这些恐惧",
          "害怕是人之常情，但请记住，你比想象中更坚强",
          "我在这里陪伴你，让我们一起慢慢克服这些不安",
        ],
        surprise: [
          "这个意外确实让人惊讶，让我们一起来理解这个变化",
          "惊喜或惊吓都是生活的一部分，我在这里支持你",
          "让我们一起来消化这个意外的消息，找到最好的应对方式",
        ],
        neutral: [
          "平静是一种很好的状态，让我们珍惜这份内心的安宁",
          "平和的心态是智慧的体现，继续保持这种状态",
          "你的平静让我也感到放松，让我们一起享受这份宁静",
        ],
        disgust: [
          "我理解你的反感，让我们找到更好的方式来处理这些感受",
          "厌恶是正常的情绪，但我们可以选择如何应对它",
          "我在这里支持你，让我们一起找到更积极的视角",
        ],
        anxiety: [
          "我感受到你的焦虑，让我们一起来缓解这些压力",
          "焦虑是暂时的，我们可以一起找到平静的方法",
          "我理解你的不安，让我们一步步来面对这些担忧",
        ],
      },
      emotionSummaryMap: {
        happiness:
          "你此刻正沉浸在喜悦之中，这种积极向上的情绪让人感到温暖和充满希望",
        sadness: "你正在经历一段低落的时期，这种悲伤的情绪需要被理解和接纳",
        anger: "你此刻感到愤怒，这种强烈的情绪需要被妥善地表达和处理",
        fear: "你正被恐惧和担忧所困扰，这种不安的情绪需要被安抚和疏导",
        surprise: "你正经历着意外的情绪波动，这种惊讶需要时间来消化和理解",
        neutral: "你保持着平静的心态，这种平和的状态让人感到舒适和安心",
        disgust: "你正经历着反感和厌恶的情绪，这种感受需要被理解和转化",
        anxiety: "你正被焦虑所困扰，这种不安的情绪需要被关注和缓解",
      },
    };
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "zh-CN";
  }

  private analyzeTextLocally(text: string): EmotionAnalysis {
    if (!this.emotionMapping) {
      throw new Error("情绪映射未初始化");
    }

    // 计算每种情绪的匹配次数和强度
    const emotionCounts = new Map<
      string,
      { count: number; intensity: number }
    >();

    // 初始化计数器
    Object.keys(this.emotionMapping.emotionMap).forEach((emotion) => {
      emotionCounts.set(emotion, { count: 0, intensity: 0 });
    });

    // 情绪强度关键词映射
    const intensityKeywords: Record<string, number> = {
      非常: 1.5,
      特别: 1.5,
      超级: 1.5,
      极度: 1.5,
      有点: 0.7,
      稍微: 0.7,
      些许: 0.7,
      不太: 0.7,
      不: -1,
      没有: -1,
      毫无: -1,
    };

    // 统计匹配的关键词
    Object.entries(this.emotionMapping.keywordMap).forEach(
      ([keyword, emotion]) => {
        if (text.includes(keyword)) {
          const current = emotionCounts.get(emotion) || {
            count: 0,
            intensity: 0,
          };

          // 检查关键词前的强度修饰词
          let intensity = 1;
          Object.entries(intensityKeywords).forEach(([modifier, value]) => {
            if (text.includes(modifier + keyword)) {
              intensity = value;
            }
          });

          // 更新情绪计数和强度
          emotionCounts.set(emotion, {
            count: current.count + 1,
            intensity: current.intensity + intensity,
          });
        }
      }
    );

    // 找出综合得分最高的情绪
    let maxScore = 0;
    let dominantEmotion = "neutral";

    emotionCounts.forEach(({ count, intensity }, emotion) => {
      // 计算综合得分：基础分 + 强度分
      const score = count * 0.5 + intensity * 0.5;
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    });

    // 如果没有找到任何匹配的关键词，返回平静
    if (maxScore === 0) {
      dominantEmotion = "neutral";
    }

    // 计算置信度（基于综合得分）
    const confidence = Math.min(maxScore * 0.2 + 0.6, 1);

    // 根据情绪强度调整建议
    const baseSuggestions =
      this.emotionMapping.suggestionMap[dominantEmotion] || [];
    const intensity = emotionCounts.get(dominantEmotion)?.intensity || 1;

    let adjustedSuggestions = [...baseSuggestions];
    if (intensity > 1) {
      // 对于强烈情绪，添加更多安抚性建议
      adjustedSuggestions = [
        ...adjustedSuggestions,
        "这种强烈的感受需要被温柔对待，让我们慢慢来",
        "我理解这种感受的强度，我们可以一起找到更好的方式来表达它",
      ];
    } else if (intensity < 1) {
      // 对于轻微情绪，添加更多鼓励性建议
      adjustedSuggestions = [
        ...adjustedSuggestions,
        "这种轻微的感受也值得被关注，让我们一起来理解它",
        "即使是细微的情绪变化也很重要，我在这里倾听你",
      ];
    }

    return {
      emotion: this.emotionMapping.emotionMap[dominantEmotion] || "平静",
      confidence,
      suggestions: [
        this.emotionMapping.emotionSummaryMap[dominantEmotion] ||
          "你保持着平静的心态",
        ...adjustedSuggestions,
      ],
    };
  }

  startRecording(onInterimResult: (text: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("语音识别不可用"));
        return;
      }

      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const text = result[0].transcript;
        onInterimResult(text);
      };

      this.recognition.onerror = (event) => {
        reject(event.error);
      };

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];

          this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
          };

          this.mediaRecorder.start();
          this.recognition?.start();
          resolve();
        })
        .catch(reject);
    });
  }

  stopRecording(): Promise<{ text: string; audioBlob: Blob }> {
    return new Promise((resolve) => {
      if (this.recognition) {
        this.recognition.stop();
      }

      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
          resolve({
            text: "", // 最终文本将从 onresult 事件中获取
            audioBlob,
          });
        };
        this.mediaRecorder.stop();
      }
    });
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    try {
      // 首先尝试使用 Hugging Face API 进行情绪分析
      const response = await axios.post<EmotionResult[]>(
        "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
        {
          inputs: text,
        },
        {
          headers: {
            Authorization: `Bearer ${this.HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      const emotions = response.data;
      if (!emotions || emotions.length === 0) {
        throw new Error("情绪分析返回数据为空");
      }

      const topEmotion = emotions.reduce<EmotionResult>((prev, current) => {
        return prev.score > current.score ? prev : current;
      }, emotions[0]);

      if (
        !topEmotion ||
        !topEmotion.label ||
        !this.emotionMapping ||
        !(topEmotion.label in this.emotionMapping.emotionMap)
      ) {
        throw new Error("无效的情绪标签");
      }

      // 使用 ChatGLM 生成个性化的情绪总结和建议
      const [summaryResponse, meditationResponse] = await Promise.all([
        this.generateEmotionalResponse(
          text,
          this.emotionMapping.emotionMap[topEmotion.label],
          topEmotion.score
        ),
        this.generateMeditationScene(
          text,
          this.emotionMapping.emotionMap[topEmotion.label]
        ),
      ]);

      const suggestions = [
        summaryResponse.data.generated_text,
        ...(this.emotionMapping.suggestionMap[topEmotion.label] || []),
        meditationResponse.data.generated_text,
      ].filter(Boolean);

      return {
        emotion: this.emotionMapping.emotionMap[topEmotion.label],
        confidence: topEmotion.score,
        suggestions,
      };
    } catch (error) {
      console.warn("在线情绪分析失败，使用本地分析:", error);
      return this.analyzeTextLocally(text);
    }
  }

  private async generateEmotionalResponse(
    text: string,
    emotion: string,
    confidence: number
  ) {
    return axios.post(
      "https://api-inference.huggingface.co/models/THUDM/chatglm3-6b",
      {
        inputs: `基于以下信息生成一段温暖、专业的情绪分析和建议：
用户说："${text}"
检测到的情绪：${emotion}
情绪强度：${(confidence * 100).toFixed(1)}%

请生成一段简短的回应，包含：
1. 对用户情绪状态的专业理解
2. 温暖的支持和理解
3. 积极的建议或引导

要求：
- 语言要自然、温暖
- 要体现专业性
- 要基于用户实际说的内容
- 长度控制在100字以内`,
        parameters: {
          max_length: 300,
          temperature: 0.7,
          top_p: 0.9,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
  }

  private async generateMeditationScene(text: string, emotion: string) {
    const hour = new Date().getHours();
    const timeContext = hour >= 18 || hour < 6 ? "夜晚" : "白天";

    return axios.post(
      "https://api-inference.huggingface.co/models/THUDM/chatglm3-6b",
      {
        inputs: `基于以下信息，推荐一个适合冥想的场景：
用户说："${text}"
当前情绪：${emotion}
当前时间：${timeContext}

请生成一段场景描述，要求：
1. 场景要契合用户的情绪状态，针对${emotion}情绪提供治愈和平衡的场景
2. 考虑当前是${timeContext}，描述相应的光线和氛围
3. 场景描述要有代入感和画面感，包含视觉、听觉、触觉等多种感官元素
4. 要包含环境声音的描述和自然元素
5. 长度控制在60字以内
6. 不要包含"推荐冥想场景："这个前缀
7. 描述要能够引导用户进入放松状态

示例：
宁静的海边，温柔的波浪声轻轻拍打着沙滩，晚风送来淡淡的咸味，远处的灯塔为夜空点亮一盏明灯，星光如碎钻洒落海面。`,
        parameters: {
          max_length: 300,
          temperature: 0.8,
          top_p: 0.9,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
  }

  async uploadAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      // 这里应该调用实际的音频上传 API
      // const response = await axios.post('/api/upload-audio', formData);
      // return response.data.url;

      return "mock-audio-url";
    } catch (error) {
      console.error("音频上传失败:", error);
      throw new Error("音频上传失败");
    }
  }

  async textToSpeech(text: string): Promise<string> {
    try {
      const response = await axios.get(
        `https://7513814c8b5b.ngrok.app/tts?text=${encodeURIComponent(
          text
        )}&text_lang=zh&ref_audio_path=t1&prompt_lang=zh&prompt_text=&text_split_method=cut5&batch_size=1&media_type=wav&streaming_mode=true&speed_factor=0.7`,
        {
          responseType: "arraybuffer", // 明确指定响应为二进制数据
        }
      );

      // 检查 Content-Type 是否为音频格式
      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.includes("audio")) {
        throw new Error(
          "Response is not audio data. Content-Type: " + contentType
        );
      }

      // 将二进制数据转换为 Blob
      const audioBlob = new Blob([response.data], { type: "audio/wav" });

      // 创建临时 URL
      const audioUrl = URL.createObjectURL(audioBlob);

      // const response = await axios.get(
      //   `https://7513814c8b5b.ngrok.app/tts?text=${text}&text_lang=zh&ref_audio_path=t1&prompt_lang=zh&prompt_text=&text_split_method=cut5&batch_size=1&media_type=wav&streaming_mode=true&speed_factor=0.7`
      // );

      // console.log(response.data, "response.data");

      // // 将 RIFF 数据转换为 WAV Blob
      // const audioBlob = new Blob([response.data], { type: "audio/wav" });

      // // 创建临时 URL
      // const audioUrl = URL.createObjectURL(audioBlob);
      return audioUrl;
    } catch (error) {
      console.error("TTS API 调用失败:", error);
      throw error;
    }
  }
}

export const voiceService = new VoiceService();
