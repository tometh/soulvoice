import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Text,
  VStack,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spinner,
  useToast,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaHeart,
  FaRedo,
  FaArrowLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { meditationService } from "../services/meditationService";
import WaveSurfer from "wavesurfer.js";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const Meditation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { state } = location;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [meditationScripts, setMeditationScripts] = useState<string[]>([]);
  const [scriptAudioUrl, setScriptAudioUrl] = useState<string | null>(null);
  const scriptAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isScriptEnabled, setIsScriptEnabled] = useState(true);

  useEffect(() => {
    if (!state?.type || !state?.scene) {
      navigate("/meditation-list");
      return;
    }

    const generateAudio = async () => {
      try {
        setIsLoading(true);
        const url = await meditationService.generateMeditationAudio({
          type: state.type,
          scene: state.scene,
        });
        setAudioUrl(url);
      } catch (error) {
        console.error("生成音频失败:", error);
        // 直接使用默认音频
        const defaultUrl = meditationService.getDefaultAudioByType(state.type);
        setAudioUrl(defaultUrl);
        toast({
          title: "使用默认音频",
          description: "已切换到默认冥想音乐",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // 清理临时 URL，但不清理默认音频 URL
      if (audioUrl && !audioUrl.startsWith("/meditation/")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [state?.type, state?.scene, navigate, toast]);

  useEffect(() => {
    if (audioUrl && !isLoading) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration || 0);
      });

      audio.addEventListener("error", (e) => {
        console.error("音频加载错误:", e);
        toast({
          title: "音频加载失败",
          description: "无法加载音频文件，请检查文件路径",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime || 0);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      return () => {
        audio.pause();
        audio.removeEventListener("loadedmetadata", () => {});
        audio.removeEventListener("error", () => {});
        audio.removeEventListener("timeupdate", () => {});
        audio.removeEventListener("ended", () => {});
      };
    }
  }, [audioUrl, isLoading, toast]);

  useEffect(() => {
    // 初始化波形显示
    if (containerRef.current && audioUrl) {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      try {
        wavesurferRef.current = WaveSurfer.create({
          container: containerRef.current,
          waveColor: "violet",
          progressColor: "purple",
          cursorColor: "transparent",
          barWidth: 2,
          barRadius: 3,
          height: 40,
          normalize: true,
        });

        wavesurferRef.current.on("error", (err) => {
          console.error("WaveSurfer 错误:", err);
          toast({
            title: "波形显示错误",
            description: "无法加载音频波形",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        });

        wavesurferRef.current.load(audioUrl);
      } catch (error) {
        console.error("WaveSurfer 初始化错误:", error);
      }
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl, toast]);

  useEffect(() => {
    // 生成三段冥想文案
    if (state?.scene) {
      const scripts = meditationService.generateMeditationScripts(
        state.type,
        state.scene
      );
      setMeditationScripts(scripts);
    }
  }, [state?.type, state?.scene]);

  // 生成当前脚本的音频
  useEffect(() => {
    const generateScriptAudio = async () => {
      if (meditationScripts.length > 0 && isScriptEnabled) {
        try {
          setIsScriptLoading(true);
          const url = await meditationService.generateScriptAudio(
            meditationScripts[currentScriptIndex]
          );
          setScriptAudioUrl(url);
        } catch (error) {
          console.error("生成脚本音频失败:", error);
          toast({
            title: "文案音频生成失败",
            description: "无法生成文案音频，请稍后再试",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsScriptLoading(false);
        }
      }
    };

    generateScriptAudio();

    return () => {
      if (scriptAudioRef.current) {
        scriptAudioRef.current.pause();
        scriptAudioRef.current = null;
      }
      // 清理临时 URL
      if (scriptAudioUrl && !scriptAudioUrl.startsWith("/")) {
        URL.revokeObjectURL(scriptAudioUrl);
      }
    };
  }, [currentScriptIndex, meditationScripts, isScriptEnabled, toast]);

  // 加载和控制脚本音频
  useEffect(() => {
    if (scriptAudioUrl && !isScriptLoading) {
      const audio = new Audio(scriptAudioUrl);
      scriptAudioRef.current = audio;

      audio.addEventListener("error", (e) => {
        console.error("脚本音频加载错误:", e);
        toast({
          title: "文案音频加载失败",
          description: "无法加载文案音频文件",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });

      audio.addEventListener("ended", () => {
        // 当前文案播放完毕，自动切换到下一段
        if (
          isScriptEnabled &&
          currentScriptIndex < meditationScripts.length - 1
        ) {
          setCurrentScriptIndex((prev) => prev + 1);
        }
      });

      // 如果背景音乐正在播放，自动播放脚本音频
      if (isPlaying && isScriptEnabled) {
        audio.play().catch((error) => {
          console.error("脚本播放失败:", error);
        });
      }

      return () => {
        audio.pause();
        audio.removeEventListener("error", () => {});
        audio.removeEventListener("ended", () => {});
      };
    }
  }, [
    scriptAudioUrl,
    isScriptLoading,
    isPlaying,
    isScriptEnabled,
    toast,
    currentScriptIndex,
    meditationScripts.length,
  ]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);

        // 同时暂停脚本音频
        if (scriptAudioRef.current && isScriptEnabled) {
          scriptAudioRef.current.pause();
        }
      } else {
        audioRef.current.play().catch((error) => {
          console.error("播放失败:", error);
          toast({
            title: "播放失败",
            description: "无法播放音频文件",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
        setIsPlaying(true);

        // 同时播放脚本音频
        if (scriptAudioRef.current && isScriptEnabled) {
          scriptAudioRef.current.play().catch((error) => {
            console.error("脚本播放失败:", error);
          });
        }
      }

      // 同步波形显示
      if (wavesurferRef.current) {
        if (isPlaying) {
          wavesurferRef.current.pause();
        } else {
          wavesurferRef.current.play();
        }
      }
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(
        Math.max(audioRef.current.currentTime + seconds, 0),
        audioRef.current.duration
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleNextScript = () => {
    // 停止当前脚本音频
    if (scriptAudioRef.current && isScriptEnabled) {
      scriptAudioRef.current.pause();
    }

    setCurrentScriptIndex((prev) => (prev + 1) % meditationScripts.length);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "已取消收藏" : "已添加到收藏",
      status: "success",
      duration: 2000,
    });
  };

  const toggleScript = () => {
    if (isScriptEnabled) {
      // 关闭脚本朗读
      if (scriptAudioRef.current) {
        scriptAudioRef.current.pause();
      }
      setIsScriptEnabled(false);
    } else {
      // 开启脚本朗读
      setIsScriptEnabled(true);
      if (isPlaying && scriptAudioRef.current) {
        scriptAudioRef.current.play().catch((error) => {
          console.error("脚本播放失败:", error);
        });
      }
    }
  };

  const getMeditationTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      sleep: "睡前放松",
      morning: "早安觉醒",
      work: "工作小憩",
      emotion: "情绪疗愈",
      wealth: "财富显化",
      energy: "重启能量",
      anxiety: "焦虑释放",
      focus: "专注练习",
      compassion: "自我慈悲",
      sos: "情绪SOS",
      breathing: "呼吸引导",
      "sleep-music": "伴你入眠",
    };
    return typeLabels[type] || "冥想";
  };

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-b, blue.50, purple.50)"
    >
      <IconButton
        aria-label="返回"
        icon={<FaArrowLeft />}
        position="absolute"
        top={4}
        left={4}
        onClick={() => navigate(-1)}
        colorScheme="purple"
        variant="solid"
        zIndex={3}
        boxShadow="md"
      />

      <VStack
        spacing={8}
        bg="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(10px)"
        p={8}
        borderRadius="2xl"
        boxShadow="xl"
        w="100%"
        maxW="500px"
        position="relative"
        mx="auto"
        mt={20}
        zIndex={2}
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <HStack spacing={2} alignSelf="center">
          <Text
            fontSize="xl"
            fontWeight="bold"
            textAlign="center"
            color="gray.700"
            flex="1"
          >
            {state?.scene || "冥想场景"}
          </Text>
          {state?.type && (
            <Box
              bg="purple.100"
              color="purple.700"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="bold"
            >
              {getMeditationTypeLabel(state.type)}
            </Box>
          )}
        </HStack>

        {isLoading ? (
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" />
            <Text color="gray.600">正在生成冥想音频...</Text>
          </VStack>
        ) : (
          <>
            <FormControl display="flex" alignItems="center">
              <FormLabel
                htmlFor="script-toggle"
                mb="0"
                fontSize="sm"
                color="gray.600"
              >
                文案朗读
              </FormLabel>
              <Switch
                id="script-toggle"
                isChecked={isScriptEnabled}
                onChange={toggleScript}
                colorScheme="purple"
              />
            </FormControl>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentScriptIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Text
                  color="gray.700"
                  textAlign="center"
                  fontSize="lg"
                  lineHeight="tall"
                  mb={6}
                >
                  {meditationScripts[currentScriptIndex]}
                  {isScriptLoading && (
                    <Spinner size="sm" color="purple.500" ml={2} />
                  )}
                </Text>
              </motion.div>
            </AnimatePresence>

            <Box w="100%" ref={containerRef} mb={4} />

            <Box w="100%" px={4}>
              <Slider
                aria-label="audio-progress"
                value={currentTime}
                min={0}
                max={duration || 100}
                onChange={handleSeek}
              >
                <SliderTrack bg="gray.200">
                  <SliderFilledTrack bg="purple.500" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" w="100%" mt={2}>
                <Text fontSize="sm" color="gray.600">
                  {formatTime(currentTime)}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {formatTime(duration)}
                </Text>
              </HStack>
            </Box>

            <HStack spacing={8}>
              <IconButton
                aria-label="后退15秒"
                icon={<FaBackward />}
                onClick={() => handleSkip(-15)}
                variant="ghost"
                colorScheme="purple"
                size="lg"
              />
              <IconButton
                aria-label={isPlaying ? "暂停" : "播放"}
                icon={isPlaying ? <FaPause /> : <FaPlay />}
                onClick={handlePlayPause}
                colorScheme="purple"
                size="lg"
                rounded="full"
                isDisabled={!audioUrl}
              />
              <IconButton
                aria-label="快进15秒"
                icon={<FaForward />}
                onClick={() => handleSkip(15)}
                variant="ghost"
                colorScheme="purple"
                size="lg"
              />
            </HStack>

            <HStack spacing={4} mt={4}>
              <IconButton
                aria-label="换一段"
                icon={<FaRedo />}
                onClick={handleNextScript}
                variant="ghost"
                colorScheme="purple"
                size="sm"
              />
              <IconButton
                aria-label={isFavorited ? "取消收藏" : "收藏"}
                icon={<FaHeart />}
                onClick={handleFavorite}
                variant="ghost"
                colorScheme="purple"
                size="sm"
                color={isFavorited ? "red.500" : "gray.600"}
              />
            </HStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default Meditation;
