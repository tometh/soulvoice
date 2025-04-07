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
  useColorMode,
  Spinner,
  useToast,
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

interface MeditationState {
  type: string;
  scene: string;
  audioUrl?: string;
}

const Meditation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { state } = location;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [meditationScript, setMeditationScript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { colorMode } = useColorMode();
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [meditationScripts, setMeditationScripts] = useState<string[]>([]);

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
      if (audioUrl && !audioUrl.startsWith("./meditation/")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [state?.type, state?.scene, navigate, toast]);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);

      const handleLoadError = () => {
        console.error("音频加载失败:", audioUrl);
        if (!audioUrl.includes("music.mp3")) {
          // 如果不是默认音频才切换到默认音频
          const defaultUrl = "./meditation/music.mp3";
          setAudioUrl(defaultUrl);
          toast({
            title: "使用默认音频",
            description: "原音频加载失败，已切换到默认冥想音乐",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        } else {
          // 如果默认音频也加载失败，显示错误并返回列表页
          toast({
            title: "音频加载失败",
            description: "无法加载音频文件，请检查网络连接",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate("/meditation-list");
        }
      };

      audio.addEventListener("error", handleLoadError);
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration || 0);
        audioRef.current = audio;
      });
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime || 0);
      });
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      return () => {
        audio.removeEventListener("error", handleLoadError);
        audio.pause();
      };
    }
  }, [audioUrl, toast, navigate]);

  useEffect(() => {
    // 初始化波形显示
    if (containerRef.current && audioUrl) {
      wavesurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "violet",
        progressColor: "purple",
        cursorColor: "transparent",
        barWidth: 2,
        barRadius: 3,
        height: 40,
      });
      wavesurferRef.current.load(audioUrl);
    }
    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [audioUrl]);

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

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
        <Text
          fontSize="xl"
          fontWeight="bold"
          textAlign="center"
          color="gray.700"
        >
          {state?.scene || "冥想场景"}
        </Text>

        {isLoading ? (
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" />
            <Text color="gray.600">正在生成冥想音频...</Text>
          </VStack>
        ) : (
          <>
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
