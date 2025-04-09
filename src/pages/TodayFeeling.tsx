import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  Text,
  useToast,
  Heading,
  HStack,
  Tag,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { voiceService } from "../services/voiceService";
import { EmotionCard } from "../components/EmotionCard";
import { useVoice } from "../contexts/VoiceContext";
import type { Transition } from "framer-motion";

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
  const emotionSummary = suggestions[0] || `我感受到你的${emotion}`;
  const psychologicalComfort =
    suggestions.slice(1, -1).join("\n\n") ||
    "让我们一起保持积极的心态，相信每一天都蕴含着新的可能。";
  const meditationScene = suggestions[suggestions.length - 1];

  return `今天我听到你说："${text}"\n\n${emotionSummary}\n\n${psychologicalComfort}${
    meditationScene ? `\n\n推荐冥想场景：${meditationScene}` : ""
  }`;
};

const pulseAnimation = {
  scale: [1, 1.2, 1],
  opacity: [0.5, 0.8, 0.5],
};

const pulseTransition: Transition = {
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut",
};

const breatheAnimation = {
  scale: [1, 1.1, 1],
};

const breatheTransition: Transition = {
  duration: 1.5,
  repeat: Infinity,
  ease: "easeInOut",
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
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleStartRecording = async (
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRecording || isProcessing) return; // 防止重复触发和处理中的状态

    try {
      setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopRecording = async (
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isRecording || isProcessing) return; // 如果没有在录音或正在处理中，直接返回

    try {
      setIsProcessing(true);
      setIsRecording(false);
      setIsAnalyzing(true);
      const { text, audioBlob } = await voiceService.stopRecording();
      const finalText = text || recognizedText;

      if (!finalText) {
        throw new Error("未能识别到语音内容");
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

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
      setIsProcessing(false);
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

  const resetState = () => {
    setEmotionResult(null);
    setRecognizedText("");
    setAudioUrl(null);
    setIsAnalyzing(false);
    setIsRecording(false);
    setIsProcessing(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <AnimatePresence mode="wait">
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        minH="100vh"
        bgGradient="linear(to-b, pink.50, purple.50, blue.50)"
        p={4}
      >
        <VStack spacing={8} mt={8}>
          {/* 当前使用的声音 */}
          <HStack
            bg="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(8px)"
            p={3}
            px={4}
            borderRadius="full"
            spacing={3}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
            onClick={() => navigate("/voice-selection")}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              bg: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              transform: "translateY(-1px)",
            }}
          >
            <Box
              as="span"
              w={2}
              h={2}
              borderRadius="full"
              bg="green.400"
              boxShadow="0 0 8px rgba(72, 187, 120, 0.4)"
            />
            <Text fontSize="sm" color="gray.700" fontWeight="medium">
              {selectedVoice.name}
            </Text>
            <Tag
              size="sm"
              variant="subtle"
              colorScheme={
                selectedVoice.type === "system"
                  ? "blue"
                  : selectedVoice.type === "purchased"
                  ? "purple"
                  : "orange"
              }
              px={2.5}
              py={1}
              borderRadius="full"
              textTransform="capitalize"
            >
              {selectedVoice.type}
            </Tag>
          </HStack>

          {!isAnalyzing && !emotionResult && (
            <VStack spacing={6} position="relative" w="full" h="70vh">
              <Box position="absolute" top="10%" left="0" right="0" px={4}>
                <Heading
                  fontSize="2xl"
                  fontWeight="black"
                  textAlign="center"
                  color="gray.800"
                  mb={4}
                >
                  How do you feel today?
                </Heading>
                <AnimatePresence mode="wait">
                  <MotionBox
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Text
                      fontSize="md"
                      color="gray.600"
                      textAlign="center"
                      px={4}
                    >
                      {questions[currentQuestion]}
                    </Text>
                  </MotionBox>
                </AnimatePresence>
              </Box>

              {/* 录音按钮 */}
              <Box
                as={motion.div}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                whileTap={{ scale: 1.2 }}
                marginTop="20px"
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleStartRecording(e);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleStopRecording(e);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleStartRecording(e);
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  handleStopRecording(e);
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  if (isRecording) {
                    handleStopRecording(e);
                  }
                }}
                cursor={isProcessing ? "wait" : "pointer"}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                style={{
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                  touchAction: "none",
                  pointerEvents: isProcessing ? "none" : "auto",
                }}
              >
                {/* 外圈渐变光晕 */}
                <Box
                  position="absolute"
                  width="280px"
                  height="280px"
                  borderRadius="full"
                  bgGradient="radial(circle, rgba(255,255,255,0.8) 0%, rgba(255,192,203,0.3) 50%, transparent 70%)"
                  filter="blur(20px)"
                  zIndex={0}
                  as={motion.div}
                  animate={isRecording ? pulseAnimation : {}}
                  transition={pulseTransition}
                />

                {/* 中间圈 */}
                <Box
                  position="absolute"
                  width="200px"
                  height="200px"
                  borderRadius="full"
                  bgGradient="radial(circle, rgba(255,192,203,0.2) 0%, rgba(147,112,219,0.1) 100%)"
                  backdropFilter="blur(8px)"
                  border="1px solid rgba(255,255,255,0.2)"
                  zIndex={1}
                  as={motion.div}
                  animate={isRecording ? breatheAnimation : {}}
                  transition={breatheTransition}
                />

                {/* 中心文字容器 */}
                <Box
                  position="absolute"
                  width="200px"
                  height="200px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  zIndex={2}
                >
                  <Text
                    color="gray.700"
                    fontSize="xl"
                    fontWeight="medium"
                    textAlign="center"
                  >
                    {isRecording ? "松开结束" : "按住说话"}
                  </Text>
                </Box>
              </Box>

              {/* 识别文本显示 */}
              {recognizedText && (
                <Box
                  position="absolute"
                  bottom="15%"
                  left="50%"
                  transform="translateX(-50%)"
                  maxW="80%"
                  w="full"
                >
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    textAlign="center"
                    bg="white"
                    p={3}
                    borderRadius="xl"
                    boxShadow="sm"
                  >
                    {recognizedText}
                  </Text>
                </Box>
              )}
            </VStack>
          )}

          {isAnalyzing && recognizedText && (
            <VStack spacing={4} pt={8}>
              <Box
                as={motion.div}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: "1.5s",
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                width="200px"
                height="200px"
                borderRadius="full"
                bgGradient="radial(circle, rgba(255,192,203,0.3) 0%, rgba(147,112,219,0.2) 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="gray.600" fontSize="lg" textAlign="center" px={4}>
                  正在读取你今天的心情频率...
                </Text>
              </Box>
            </VStack>
          )}

          {emotionResult && (
            <VStack spacing={4} width="full">
              <Box
                alignSelf="flex-start"
                ml={4}
                mb={2}
                onClick={resetState}
                cursor="pointer"
                display="flex"
                alignItems="center"
                color="gray.600"
                _hover={{ color: "gray.800" }}
              >
                <Text fontSize="md">← 返回</Text>
              </Box>
              <EmotionCard
                emotion={emotionResult.emotion}
                affirmation={generateAffirmation(
                  emotionResult.emotion,
                  emotionResult.text,
                  emotionResult.suggestions
                )}
                audioUrl={audioUrl}
                isPlaying={isPlaying}
                onPlay={handlePlayAudio}
                onPause={handlePauseAudio}
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
            </VStack>
          )}
        </VStack>
      </MotionBox>
    </AnimatePresence>
  );
};

export default TodayFeeling;
