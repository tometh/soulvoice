import { voiceService } from "./voiceService";

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

  async generateMeditationAudio(prompt: MeditationPrompt): Promise<string> {
    try {
      const script = this.generateMeditationScript(prompt);
      // 使用 voiceService 生成音频
      const audioUrl = await voiceService.textToSpeech(script);
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
      morning: "/meditation/music.wav",
      work: "/meditation/music.wav",
      emotion: "/meditation/music.wav",
      wealth: "/meditation/music.wav",
      energy: "/meditation/music.wav",
      anxiety: "/meditation/music.wav",
      focus: "/meditation/music.wav",
      compassion: "/meditation/music.wav",
      sos: "/meditation/music.wav",
      breathing: "/meditation/music.wav",
      "sleep-music": "/meditation/music.wav",
    };
    return defaultAudios[type] || "/meditation/music.wav";
  }

  generateMeditationScripts(type: string, scene: string): string[] {
    const scripts: string[] = [];
    const phases = ["开始", "进行中", "结束"];

    phases.forEach((phase) => {
      const script = this.generatePhaseScript(type, scene, phase);
      scripts.push(script);
    });

    return scripts;
  }

  private generatePhaseScript(
    type: string,
    scene: string,
    phase: string
  ): string {
    let script = "";

    switch (phase) {
      case "开始":
        script = `${this.getIntroByType(type)}\n让我们进入${scene}的意境...`;
        break;
      case "进行中":
        script = `${this.getMainContentByType(type, scene)}`;
        break;
      case "结束":
        script = `${this.getOutroByType(type)}`;
        break;
    }

    return script;
  }

  async generateScriptAudio(text: string): Promise<string> {
    try {
      // 使用 voiceService 生成音频
      const audioUrl = await voiceService.textToSpeech(text);
      return audioUrl;
    } catch (error) {
      console.error("生成文案音频失败:", error);
      throw error;
    }
  }
}

export const meditationService = new MeditationService();
