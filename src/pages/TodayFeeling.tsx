import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  Text,
  Circle,
  useToast,
  Heading,
  Button,
  HStack,
  Tag,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { voiceService } from "../services/voiceService";
import LoadingDots from "../components/LoadingDots";
import { EmotionCard } from "../components/EmotionCard";
import { useVoice } from "../contexts/VoiceContext";

const MotionBox = motion(Box);

const questions = [
  "你现在最需要的是什么？",
  "今天有什么感受浮现上来了？",
  "想对今天的自己说一句什么话？",
];

const generateAffirmation = (
  emotion: string,
  text: string,
  suggestions: string[]
) => {
  // 使用 AI 生成的情绪分析和建议
  const emotionSummary = suggestions[0] || `我感受到你的${emotion}`;
  const psychologicalComfort =
    suggestions.slice(1, -1).join("\n\n") ||
    "让我们一起保持积极的心态，相信每一天都蕴含着新的可能。";
  const meditationScene = suggestions[suggestions.length - 1];

  return `今天我听到你说："${text}"\n\n${emotionSummary}\n\n${psychologicalComfort}${
    meditationScene ? `\n\n推荐冥想场景：${meditationScene}` : ""
  }`;
};

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const TodayFeeling: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [emotionResult, setEmotionResult] = useState<{
    emotion: string;
    text: string;
    suggestions: string[];
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { selectedVoice } = useVoice();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestion((prev) => (prev + 1) % questions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePressStart = async () => {
    try {
      setIsRecording(true);
      setRecognizedText("");
      setAudioUrl(null);
      await voiceService.startRecording((text) => {
        setRecognizedText(text);
      });
    } catch (error) {
      toast({
        title: "错误",
        description: "无法启动语音识别，请检查麦克风权限",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsRecording(false);
      console.error(error);
    }
  };

  const handlePressEnd = async () => {
    try {
      setIsRecording(false);
      setIsAnalyzing(true);
      const { text, audioBlob } = await voiceService.stopRecording();
      const finalText = text || recognizedText;

      if (!finalText) {
        throw new Error("未能识别到语音内容");
      }

      // 创建音频 URL 用于预览
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

      // 上传音频并分析情绪
      await voiceService.uploadAudio(audioBlob);
      const analysis = await voiceService.analyzeEmotion(finalText);

      setEmotionResult({
        emotion: analysis.emotion,
        text: finalText,
        suggestions: analysis.suggestions,
      });
    } catch (error) {
      toast({
        title: "错误",
        description:
          error instanceof Error ? error.message : "处理语音时出现错误",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayAudio = async () => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.addEventListener("ended", () => {
          setIsPlaying(false);
        });
      }
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleMeditation = (emotion: string) => {
    // 根据情绪类型选择对应的冥想类型和场景
    const meditationType = getMeditationTypeByEmotion(emotion);
    const meditationScene = getMeditationSceneByEmotion(emotion);
    navigate("/meditation", {
      state: {
        type: meditationType,
        scene: meditationScene,
      },
    });
  };

  const getMeditationTypeByEmotion = (emotion: string): string => {
    // 根据情绪选择合适的冥想类型
    const typeMap: Record<string, string> = {
      喜悦: "morning",
      悲伤: "emotion",
      愤怒: "anxiety",
      恐惧: "breathing",
      焦虑: "anxiety",
      平静: "focus",
      厌恶: "compassion",
      惊讶: "energy",
    };
    return typeMap[emotion] || "emotion";
  };

  const getMeditationSceneByEmotion = (emotion: string): string => {
    const sceneMap: Record<string, string> = {
      喜悦: "阳光洒落的森林小径，鸟儿在枝头欢唱",
      悲伤: "宁静的湖边，涟漪轻轻荡漾",
      愤怒: "平静的山谷，微风吹拂着脸颊",
      恐惧: "安全的小屋，壁炉里的火焰温暖舒适",
      焦虑: "空旷的草原，柔软的风抚过每一寸肌肤",
      平静: "清澈的溪流，水声轻快地流淌",
      厌恶: "整洁的空间，淡淡的花香弥漫",
      惊讶: "宽阔的海滩，波浪有节奏地拍打岸边",
    };
    return sceneMap[emotion] || "平静喜悦";
  };

  return (
    <AnimatePresence mode="wait">
      <MotionBox
        {...pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        minH="100vh"
        bgGradient="linear(to-b, pink.50, purple.50, blue.50)"
        p={4}
      >
        <VStack spacing={8} mt={8}>
          {/* 当前使用的声音 */}
          <HStack
            bg="white"
            p={2}
            borderRadius="full"
            spacing={2}
            boxShadow="sm"
            onClick={() => navigate("/voice-selection")}
            cursor="pointer"
          >
            <Text fontSize="sm" color="gray.600">
              当前声音: {selectedVoice.name}
            </Text>
            <Tag size="sm" colorScheme="purple" variant="subtle">
              #{selectedVoice.type}
            </Tag>
          </HStack>

          {!isAnalyzing && !emotionResult && (
            <>
              <Heading
                fontSize="2xl"
                fontWeight="black"
                textAlign="center"
                color="gray.800"
                mb={8}
              >
                WHAT ARE YOU MANIFESTING TODAY?
              </Heading>
              <VStack spacing={2}>
                <Text fontSize="md" color="gray.600" textAlign="center">
                  {questions[currentQuestion]}
                </Text>
              </VStack>
            </>
          )}

          {isAnalyzing ? (
            <VStack spacing={4} mt={20}>
              <Text fontSize="lg" color="gray.700" textAlign="center">
                正在读取你今天的心情频率...
              </Text>
              <LoadingDots />
            </VStack>
          ) : emotionResult ? (
            <>
              <EmotionCard
                emotion={emotionResult.emotion}
                affirmation={generateAffirmation(
                  emotionResult.emotion,
                  emotionResult.text,
                  emotionResult.suggestions
                )}
                audioUrl={audioUrl}
                onPlay={handlePlayAudio}
                onPause={handlePauseAudio}
                isPlaying={isPlaying}
                onFavorite={() => {
                  toast({
                    title: "收藏成功",
                    status: "success",
                    duration: 2000,
                  });
                }}
                onMeditate={() => handleMeditation(emotionResult.emotion)}
                onShare={() => {
                  toast({
                    title: "分享功能开发中",
                    status: "info",
                    duration: 2000,
                  });
                }}
                onMore={() => {
                  toast({
                    title: "更多功能开发中",
                    status: "info",
                    duration: 2000,
                  });
                }}
              />
              <Button
                colorScheme="pink"
                variant="ghost"
                onClick={() => {
                  setEmotionResult(null);
                  setRecognizedText("");
                  setAudioUrl(null);
                }}
                mt={4}
              >
                重新录制
              </Button>
            </>
          ) : (
            <Box position="relative">
              <Circle
                as={motion.div}
                size="200px"
                bg={isRecording ? "pink.100" : "white"}
                boxShadow="lg"
                cursor="pointer"
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
                justifyContent="center"
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                animate={{
                  scale: isRecording ? 1.1 : 1,
                }}
                whileHover={{ scale: 1.05 }}
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: "-20px",
                  left: "-20px",
                  right: "-20px",
                  bottom: "-20px",
                  background:
                    "radial-gradient(circle, rgba(255,192,203,0.2) 0%, rgba(255,255,255,0) 70%)",
                  borderRadius: "50%",
                  zIndex: -1,
                }}
              >
                <AnimatePresence>
                  {isRecording && (
                    <>
                      <Circle
                        as={motion.div}
                        key="circle-1"
                        position="absolute"
                        size="100%"
                        border="1.5px solid"
                        borderColor="pink.300"
                        opacity={0.7}
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{
                          scale: [1, 1.4, 1.8],
                          opacity: [0.7, 0.3, 0],
                        }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{
                          duration: 1.8,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      />
                      <Circle
                        as={motion.div}
                        key="circle-2"
                        position="absolute"
                        size="100%"
                        border="1.5px solid"
                        borderColor="pink.200"
                        opacity={0.5}
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{
                          scale: [1, 1.3, 1.6],
                          opacity: [0.5, 0.2, 0],
                        }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{
                          duration: 1.8,
                          ease: "easeInOut",
                          delay: 0.3,
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      />
                      <Circle
                        as={motion.div}
                        key="circle-3"
                        position="absolute"
                        size="100%"
                        border="1.5px solid"
                        borderColor="pink.100"
                        opacity={0.4}
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{
                          scale: [1, 1.2, 1.4],
                          opacity: [0.4, 0.2, 0],
                        }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{
                          duration: 1.8,
                          ease: "easeInOut",
                          delay: 0.6,
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      />
                    </>
                  )}
                </AnimatePresence>
                <Text fontSize="lg" color="gray.600">
                  {isRecording ? "松开结束" : "按住说话"}
                </Text>
              </Circle>
              {recognizedText && (
                <Text
                  position="absolute"
                  top="-40px"
                  left="50%"
                  transform="translateX(-50%)"
                  fontSize="sm"
                  color="gray.600"
                  width="280px"
                  textAlign="center"
                  bg="white"
                  p={2}
                  borderRadius="md"
                  boxShadow="sm"
                >
                  {recognizedText}
                </Text>
              )}
              <Text
                position="absolute"
                bottom="-80px"
                left="50%"
                transform="translateX(-50%)"
                fontSize="sm"
                color="gray.500"
                width="280px"
                textAlign="center"
              >
                我们不会记录你的语音，所有内容只为生成当日引导。
              </Text>
            </Box>
          )}
        </VStack>
      </MotionBox>
    </AnimatePresence>
  );
};

export default TodayFeeling;
