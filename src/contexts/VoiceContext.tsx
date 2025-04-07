import React, { createContext, useState, useContext, useEffect } from "react";

interface Voice {
  id: string;
  name: string;
  type: "default" | "custom" | "purchased" | "system";
}

interface VoiceContextType {
  selectedVoice: Voice;
  setSelectedVoice: (voice: Voice) => void;
}

// 默认声音
const defaultVoice: Voice = {
  id: "default-voice",
  name: "温柔女声",
  type: "default",
};

// 创建上下文
const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<Voice>(() => {
    // 从 localStorage 获取保存的声音，如果没有则使用默认声音
    const savedVoice = localStorage.getItem("selectedVoice");
    return savedVoice ? JSON.parse(savedVoice) : defaultVoice;
  });

  // 当选择的声音变化时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem("selectedVoice", JSON.stringify(selectedVoice));
  }, [selectedVoice]);

  // 提供上下文值
  const contextValue: VoiceContextType = {
    selectedVoice,
    setSelectedVoice,
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};

// 自定义钩子，用于在组件中访问声音上下文
export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
};

export default VoiceContext;
