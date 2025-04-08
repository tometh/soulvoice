import { voiceService } from "./voiceService";
import { useVoice } from "../contexts/VoiceContext";
import axios from "axios";

interface MeditationPrompt {
  type: string;
  scene: string;
  duration?: number;
}

class MeditationService {
  private generateMeditationScript(prompt: MeditationPrompt): string {
    const intro = this.getIntroByType(prompt.type);
    const mainContent = this.getMainContentByType(prompt.type, prompt.scene);
    const outro = this.getOutroByType(prompt.type);

    return `${intro}\n${mainContent}\n${outro}`;
  }

  private getIntroByType(type: string): string {
    const intros: { [key: string]: string } = {
      sleep:
        "让我们开始今晚的睡前放松冥想。请找一个舒适的位置躺下，深呼吸几次...",
      morning: "早安。让我们以平和的心态开启新的一天。请保持坐姿放松...",
      work: "接下来的10分钟，让我们暂时放下工作，给心灵一个小憩的空间...",
      emotion: "不论此刻的你感受如何，让我们一起进入内心的空间...",
      wealth: "让我们开始财富能量的冥想之旅，打开内在的丰盛之门...",
      energy: "让我们一起唤醒内在的能量，重新找回生命的活力...",
      anxiety: "现在，让我们一起进入平静的空间，温柔地面对焦虑...",
      focus: "让我们开始专注力的训练，找回清晰的心智状态...",
      compassion: "让我们开始自我慈悲的练习，学会温柔地对待自己...",
      sos: "不要担心，我在这里陪着你。让我们一起度过这个时刻...",
      breathing: "让我们跟随呼吸的节奏，找回内在的平静...",
      "sleep-music": "让轻柔的音乐带你进入宁静的梦乡...",
    };
    return intros[type] || "让我们开始今天的冥想练习...";
  }

  private getMainContentByType(type: string, scene: string): string {
    const baseContent = `
现在，${scene}

感受此刻的存在...

${this.getBreathingGuide(type)}

${this.getTypeSpecificContent(type)}
`;
    return baseContent;
  }

  private getBreathingGuide(type: string): string {
    if (type === "sleep-music") return "";
    return `
让我们做几次深呼吸...
吸气...2...3...4...
呼气...2...3...4...5...6...
再次吸气...感受空气流入身体...
缓缓呼气...让所有的紧张都随之而去...
继续保持这样的呼吸节奏...`;
  }

  private getTypeSpecificContent(type: string): string {
    const contents: { [key: string]: string } = {
      sleep:
        "让每一次呼吸都带走今天的疲惫，感受身体渐渐放松，准备进入甜美的梦乡...",
      morning: "让晨光唤醒你的每一个细胞，感受新的一天带来的无限可能...",
      work: "让注意力轻轻回到当下，感受内在的清明与专注...",
      emotion: "温柔地觉察当下的情绪，不评判，不抗拒，只是温和地觉察与接纳...",
      wealth:
        "想象丰盛的能量在你周围流动，每一次呼吸都在吸引更多的富足与机遇...",
      energy: "感受生命能量在体内流动，唤醒每一个细胞的活力...",
      anxiety: "让每一次呼吸都带走一些焦虑，为内心创造更多的空间与平静...",
      focus: "将注意力轻轻带回呼吸，就像温柔地牵引一只蝴蝶落在花朵上...",
      compassion: "用最温柔的目光看待自己，接纳当下的一切感受...",
      sos: "记住，这一刻的感受终将过去，你是安全的，你并不孤单...",
      breathing: "跟随呼吸的自然节律，不需要改变什么，只是觉察与陪伴...",
    };
    return contents[type] || "";
  }

  private getOutroByType(type: string): string {
    if (type === "sleep-music") return "";
    return `
慢慢地，让意识回到当下...
感受此刻的平静与安宁...
带着这份宁静的能量，继续你的旅程...
${type === "sleep" ? "祝你好梦..." : "愿你拥有美好的一天..."}`;
  }

  async generateMeditationAudio(
    prompt: MeditationPrompt,
    selectedVoice: { name: string }
  ): Promise<string> {
    try {
      const script = this.generateMeditationScript(prompt);
      // 使用 voiceService 生成音频
      const audioUrl = await voiceService.textToSpeech(script, selectedVoice);
      return audioUrl;
    } catch (error) {
      console.error("生成冥想音频失败:", error);
      // 返回默认音频文件
      return this.getDefaultAudioByType(prompt.type);
    }
  }

  getDefaultAudioByType(type: string): string {
    // 检查默认音频文件是否存在
    const defaultAudios: { [key: string]: string } = {
      sleep: "/meditation/music.wav",
      morning: "/meditation/music1.wav",
      work: "/meditation/music2.wav",
      emotion: "/meditation/music1.wav",
      wealth: "/meditation/music2.wav",
      energy: "/meditation/music1.wav",
      anxiety: "/meditation/music2.wav",
      focus: "/meditation/music.wav",
      compassion: "/meditation/music.wav",
      sos: "/meditation/music.wav",
      breathing: "/meditation/music.wav",
      "sleep-music": "/meditation/music.wav",
    };
    return defaultAudios[type] || "/meditation/music.wav";
  }

  }
  async generateMeditationScripts(
    type: string,
    scene: string,
    selectedVoice: { name: string }
  ): Promise<string> {
    try {
      const prompt = `请生成一段${type}类型的冥想引导词，场景是${scene}。要求：1. 语言优美流畅；2. 富有画面感；3. 引导自然；4. 适合冥想场景。`;
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "你是一个专业的冥想引导师，擅长创作各种类型的冥想引导词。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("生成冥想脚本失败:", error);
      // 如果 API 调用失败，返回默认的冥想脚本
      return this.getDefaultScriptByType(type, scene);
    }
  }

  private getDefaultScriptByType(type: string, scene: string): string {
    const defaultScripts: { [key: string]: string } = {
      sleep: `让我们开始今晚的睡前放松冥想。请找一个舒适的位置躺下，深呼吸几次...

现在，${scene}

感受此刻的存在...

让我们做几次深呼吸...
吸气...2...3...4...
呼气...2...3...4...5...6...
再次吸气...感受空气流入身体...
缓缓呼气...让所有的紧张都随之而去...
继续保持这样的呼吸节奏...

让每一次呼吸都带走今天的疲惫，感受身体渐渐放松，准备进入甜美的梦乡...

慢慢地，让意识回到当下...
感受此刻的平静与安宁...
带着这份宁静的能量，继续你的旅程...
祝你好梦...`,
      morning: `早安。让我们以平和的心态开启新的一天。请保持坐姿放松...

现在，${scene}

感受此刻的存在...

让我们做几次深呼吸...
吸气...2...3...4...
呼气...2...3...4...5...6...
再次吸气...感受空气流入身体...
缓缓呼气...让所有的紧张都随之而去...
继续保持这样的呼吸节奏...

让晨光唤醒你的每一个细胞，感受新的一天带来的无限可能...

慢慢地，让意识回到当下...
感受此刻的平静与安宁...
带着这份宁静的能量，继续你的旅程...
愿你拥有美好的一天...`,
      // 添加其他类型的默认脚本...
    };

    return (
      defaultScripts[type] ||
      `让我们开始今天的冥想练习...

现在，${scene}

感受此刻的存在...

让我们做几次深呼吸...
吸气...2...3...4...
呼气...2...3...4...5...6...
再次吸气...感受空气流入身体...
缓缓呼气...让所有的紧张都随之而去...
继续保持这样的呼吸节奏...

慢慢地，让意识回到当下...
感受此刻的平静与安宁...
带着这份宁静的能量，继续你的旅程...
愿你拥有美好的一天...`
    );
  }

  async generateScriptAudio(
    text: string,
    selectedVoice: { name: string }
  ): Promise<string> {
    try {
      // 使用 voiceService 生成音频
      const audioUrl = await voiceService.textToSpeech(text, selectedVoice);
      return audioUrl;
    } catch (error) {
      console.error("生成文案音频失败:", error);
      throw error;
    }
  }
}

export const meditationService = new MeditationService();
