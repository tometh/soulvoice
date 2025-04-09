import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Button,
  useToast,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  Flex,
  Image,
  Tag,
  Spinner,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone,
  FaUpload,
  FaTimes,
  FaTrash,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import { voiceService } from "../services/voiceService";
import { useVoice } from "../contexts/VoiceContext";
import axios from "axios";

const MotionBox = motion(Box);

interface CustomVoice {
  id: string;
  name: string;
  description: string;
  image: string;
  bgColor: string;
  audioUrl: string;
  url?: string;
}

interface Voice {
  id: number;
  name: string;
  url: string;
}

interface SelectedVoice {
  id: string;
  name: string;
  audioUrl: string;
  type: "custom" | "purchased" | "system";
}

// 生成随机浅色
const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
};

const VoiceSelection: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tempSelectedVoice, setTempSelectedVoice] =
    useState<SelectedVoice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { selectedVoice, setSelectedVoice } = useVoice();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [voices, setVoices] = useState<Voice[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mock 已购声音
  const purchasedVoices = [
    {
      id: "p1",
      name: "肖战声音",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://img.win3000.com/m00/97/f3/5eb33a8f4b9d9b59bddabdbeb6fd4d3a_c_345_458.jpg",
      bgColor: "#EDE9FF",
      audioUrl:
        "https://7513814c8b5b.ngrok.app/voices/不管是路线的规划还是随机应变的能力，这台小家伙都比对空布的制式邦布更出色呢。-1.wav",
      sendName:
        "不管是路线的规划还是随机应变的能力，这台小家伙都比对空布的制式邦布更出色呢。-1",
    },
    {
      id: "p2",
      name: "Nova声音",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://bpic.588ku.com/element_pic/23/04/25/fe973e002aa577c473fc1fd8e3780615.png!/fw/350/quality/99/unsharp/true/compress/true",
      bgColor: "#EFF6FF",
      audioUrl:
        "https://7513814c8b5b.ngrok.app/voices/但这个世界上哪里有什么事情，是只有好处没有代价的呢？-1.wav",
      sendName: "但这个世界上哪里有什么事情，是只有好处没有代价的呢？-1",
    },
  ];

  // 系统声音
  const systemVoices = [
    {
      id: "sys1",
      name: "温柔女声",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image: "https://t1.tp88.net/tp88/uploads/allimg/191213/1G0213057-0.jpg",
      bgColor: "#FCE7F3",
      audioUrl:
        "https://7513814c8b5b.ngrok.app/voices/你没事吧，你没事吧，你没事吧，你没事吧-1.wav",
      sendName: "你没事吧，你没事吧，你没事吧，你没事吧-1",
    },
    {
      id: "sys2",
      name: "性感女声",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://s.alicdn.com/@sc04/kf/H0ab28dbdeb85479eab7fc548e2755824f.jpg_720x720q50.jpg",
      bgColor: "#FDF2F8",
      audioUrl:
        "https://7513814c8b5b.ngrok.app/voices/想要获得什么补给尽管说，当然，我只能帮你祈愿一下。-1.wav",
      sendName: "想要获得什么补给尽管说，当然，我只能帮你祈愿一下。-1",
    },
    {
      id: "sys3",
      name: "沉稳男声",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://bpic.588ku.com/element_pic/23/07/04/7833d9718e47f0084c4f05fe3b1302f1.jpg!/fw/350/quality/99/unsharp/true/compress/true",
      bgColor: "#EFF6FF",
      audioUrl:
        "https://7513814c8b5b.ngrok.app/voices/但这个世界上哪里有什么事情，是只有好处没有代价的呢？-1.wav",
      sendName: "但这个世界上哪里有什么事情，是只有好处没有代价的呢？-1",
    },
    {
      id: "sys4",
      name: "老练男声",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://img.freepik.com/premium-vector/cute-grandfather-old-man-elder-cartoon-illustration_1058532-12606.jpg",
      bgColor: "#DBEAFE",
      audioUrl:
        "https://7513814c8b5b.ngrok.app/voices/无事逢客休，席上校两棋…我们开局吧。-1.wav",
      sendName: "无事逢客休，席上校两棋…我们开局吧。-1",
    },
  ];

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://7513814c8b5b.ngrok.app/voices_list"
      );
      const voiceUrls = response.data.voices;

      // 处理声音列表
      const processedVoices = voiceUrls.map((url: string, index: number) => {
        // 从 URL 中提取文件名
        const fileName = url.split("/").pop()?.replace(".wav", "") || "";
        // 将文件名转换为更友好的显示名称
        const displayName = fileName
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim();

        return {
          id: String(index + 1),
          name: displayName,
          url: url,
          type: "custom" as const,
          audioUrl: url,
        };
      });

      setVoices(processedVoices);
      setCustomVoices(processedVoices);
    } catch (error) {
      console.error("获取声音列表失败:", error);
      toast({
        title: "获取声音列表失败",
        description: "请稍后重试",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      // 先检查是否支持 getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("您的浏览器不支持录音功能");
      }

      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 如果成功获取到流，说明已经获得权限
      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);

      await voiceService.startRecording(() => {
        console.log("正在录音...");
      });
    } catch (error) {
      console.error("开始录音失败:", error);
      let errorMessage = "请检查麦克风权限";

      // 根据不同错误类型显示不同提示
      if (error instanceof Error) {
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          errorMessage = "麦克风权限被拒绝，请在浏览器设置中允许访问麦克风";
        } else if (
          error.name === "NotFoundError" ||
          error.name === "DevicesNotFoundError"
        ) {
          errorMessage = "未找到麦克风设备，请检查设备连接";
        } else if (
          error.name === "NotReadableError" ||
          error.name === "TrackStartError"
        ) {
          errorMessage = "麦克风设备被占用，请关闭其他使用麦克风的应用";
        }
      }

      toast({
        title: "开始录音失败",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      const { audioBlob } = await voiceService.stopRecording();

      // 创建 AudioContext
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // 将 Blob 转换为 ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();

      // 解码音频数据
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 创建离线 AudioContext
      const offlineAudioContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // 创建音频源
      const source = offlineAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineAudioContext.destination);
      source.start();

      // 渲染音频
      const renderedBuffer = await offlineAudioContext.startRendering();

      // 将 AudioBuffer 转换为 WAV 格式
      const wavBlob = await convertToWav(renderedBuffer);

      setAudioBlob(wavBlob);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("录音处理失败:", error);
      toast({
        title: "错误",
        description: "录音失败，请重试",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 将 AudioBuffer 转换为 WAV 格式的 Blob
  const convertToWav = async (audioBuffer: AudioBuffer): Promise<Blob> => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);

    // WAV 文件头
    writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeUTFBytes(view, 8, "WAVE");
    writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChannels, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeUTFBytes(view, 36, "data");
    view.setUint32(40, length, true);

    // 写入音频数据
    const channelData = [];
    let offset = 44;
    for (let i = 0; i < numOfChannels; i++) {
      channelData[i] = audioBuffer.getChannelData(i);
    }

    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numOfChannels; channel++) {
        const sample = channelData[channel][i];
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  // 辅助函数：写入 UTF-8 字节
  const writeUTFBytes = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 直接设置文件，不进行转换
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    } catch (error) {
      console.error("文件处理失败:", error);
      toast({
        title: "文件处理失败",
        description: "请确保上传的是有效的音频文件",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return;

    try {
      setIsLoading(true);
      const formData = new FormData();

      // 如果是File类型，使用原始文件名，否则使用默认名称
      const fileName =
        audioBlob instanceof File ? audioBlob.name : "recorded.wav";
      const finalFileName = fileName.endsWith(".wav")
        ? fileName
        : `${fileName}.wav`;

      formData.append("file", audioBlob, finalFileName);

      const response = await fetch("https://7513814c8b5b.ngrok.app/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      toast({
        title: "上传成功",
        status: "success",
        duration: 2000,
      });

      onClose();
      setAudioBlob(null);
      setAudioUrl(null);
      fetchVoices();
    } catch (error) {
      console.error("上传失败:", error);
      toast({
        title: "上传失败",
        description: "请检查网络连接",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVoice = (
    id: string,
    name: string,
    type: "custom" | "purchased" | "system",
    audioUrl: string
  ) => {
    setTempSelectedVoice({ id, name, type, audioUrl });
    toast({
      title: "已选择声音",
      description: `您选择了 ${name}`,
      status: "success",
      duration: 1500,
      isClosable: true,
    });
  };

  const handleRemoveSelectedVoice = () => {
    setTempSelectedVoice(null);
  };

  const handleConfirmVoice = () => {
    if (tempSelectedVoice) {
      setSelectedVoice({
        id: tempSelectedVoice.id,
        name: tempSelectedVoice.name,
        type: tempSelectedVoice.type,
        audioUrl: tempSelectedVoice.audioUrl,
      });

      toast({
        title: "声音已设置",
        description: `您的声音已设置为 ${tempSelectedVoice.name}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // 检查音频文件可访问性
  const checkAudioAccessibility = async (audioUrl: string) => {
    try {
      const response = await fetch(audioUrl, {
        method: "HEAD",
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("audio/")) {
        throw new Error("URL does not point to an audio file");
      }

      return true;
    } catch (error) {
      console.error("音频文件检查失败:", error);
      return false;
    }
  };

  const handlePlaySample = async (audioUrl: string) => {
    if (currentlyPlaying === audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
      return;
    }

    try {
      // 先停止当前播放的音频
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // 创建新的音频对象
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // 添加事件监听器
      audio.addEventListener("error", (e) => {
        console.error("音频加载错误:", e);
        toast({
          title: "音频加载失败",
          description: "无法加载音频文件",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setCurrentlyPlaying(null);
      });

      audio.addEventListener("loadeddata", () => {
        console.log("音频加载完成");
      });

      audio.addEventListener("ended", () => {
        setCurrentlyPlaying(null);
      });

      // 尝试播放音频
      await audio.play();
      setCurrentlyPlaying(audioUrl);
    } catch (error) {
      console.error("播放失败:", error);
      toast({
        title: "播放失败",
        description: "无法播放音频文件",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setCurrentlyPlaying(null);
    }
  };

  // 在组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }
    };
  }, [currentAudio]);

  return (
    <AnimatePresence mode="wait">
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        minH="100vh"
        bgGradient="linear(to-b, blue.50, purple.50)"
        p={4}
        pb="200px"
      >
        {/* 标题区域 */}
        <VStack spacing={2} mb={6} mt={4}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            UPLOAD A FAMILIAR VOICE
          </Text>
          <Text fontSize="md" color="gray.600">
            Upload a familiar voice. We will train a personalized meditation
            voice for you.
          </Text>
        </VStack>

        {/* 自己上传的声音 - 横向滑动 */}
        <Box mb={8} overflow="hidden" position="relative">
          <Flex
            ref={scrollRef}
            overflowX="auto"
            py={2}
            css={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
            }}
          >
            {/* 上传按钮 */}
            <Box
              minW="80px"
              h="80px"
              mr={3}
              borderRadius="xl"
              bg="purple.100"
              onClick={onOpen}
              cursor="pointer"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              backdropFilter="blur(8px)"
            >
              <FaUpload size={24} color="#805AD5" />
              <Text fontSize="xs" mt={1} color="purple.600">
                上传
              </Text>
            </Box>

            {/* 接口返回的声音 */}
            {voices.map((voice) => (
              <Box
                key={voice.id}
                minW="80px"
                h="80px"
                mr={3}
                borderRadius="xl"
                bg={getRandomPastelColor()}
                cursor="pointer"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ transform: "scale(1.05)" }}
                transition="transform 0.2s"
                onClick={() =>
                  handleSelectVoice(
                    String(voice.id),
                    voice.name,
                    "custom",
                    voice.url || ""
                  )
                }
              >
                <Text color="white" fontWeight="bold">
                  {voice.name}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>

        {/* 已购声音 */}
        <VStack spacing={4} w="100%" mx="auto" mb={8} align="stretch">
          <Text
            fontSize="lg"
            fontWeight="medium"
            color="gray.600"
            alignSelf="flex-start"
          >
            已购声音
          </Text>
          {purchasedVoices.map((voice) => (
            <Box
              key={voice.id}
              w="100%"
              bgColor={voice.bgColor}
              borderRadius="20px"
              padding="16px"
              overflow="hidden"
              cursor="pointer"
              _hover={{ transform: "scale(1.02)" }}
              transition="transform 0.2s"
              onClick={() =>
                handleSelectVoice(
                  voice.id,
                  voice.sendName,
                  "purchased",
                  voice.audioUrl
                )
              }
            >
              <HStack spacing={4}>
                <Image
                  src={voice.image}
                  boxSize="80px"
                  borderRadius="12px"
                  objectFit="cover"
                  alt={voice.name}
                />
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="bold" fontSize="lg">
                    {voice.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {voice.description}
                  </Text>
                </VStack>
                <Button size="sm" colorScheme="purple" variant="outline">
                  选择
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>

        {/* 系统声音列表 */}
        <VStack spacing={4} w="100%" mx="auto" mb={8} align="stretch">
          <Text
            fontSize="lg"
            fontWeight="medium"
            color="gray.600"
            alignSelf="flex-start"
          >
            系统声音
          </Text>
          {systemVoices.map((voice) => (
            <Box
              key={voice.id}
              w="100%"
              bgColor={voice.bgColor}
              borderRadius="20px"
              padding="16px"
              overflow="hidden"
              cursor="pointer"
              _hover={{ transform: "scale(1.02)" }}
              transition="transform 0.2s"
              onClick={() =>
                handleSelectVoice(
                  voice.id,
                  voice.sendName,
                  "system",
                  voice.audioUrl
                )
              }
            >
              <HStack spacing={4}>
                <Image
                  src={voice.image}
                  boxSize="80px"
                  borderRadius="12px"
                  objectFit="cover"
                  alt={voice.name}
                />
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="bold" fontSize="lg">
                    {voice.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {voice.description}
                  </Text>
                </VStack>
                <Button size="sm" colorScheme="purple" variant="outline">
                  选择
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>

        {/* 已选声音和确认按钮 */}
        <VStack
          position={"fixed"}
          bottom={"100px"}
          spacing={4}
          w="100%"
          maxW="438px"
          background={"white"}
          borderRadius={"16px"}
          boxShadow={"0px 0px 10px 0px rgba(0, 0, 0, 0.1)"}
          padding={"16px"}
          mx="auto"
          mt={8}
          mb={6}
        >
          {(tempSelectedVoice || selectedVoice) && (
            <HStack
              w="100%"
              bg="#ffef4f"
              p={"8px 16px"}
              borderRadius="full"
              justify="space-between"
              boxShadow="sm"
            >
              <HStack>
                <Text color="gray.600">
                  {tempSelectedVoice
                    ? tempSelectedVoice.name
                    : selectedVoice.name}
                </Text>
                <Tag size="sm" colorScheme="purple" variant="subtle">
                  #
                  {tempSelectedVoice
                    ? tempSelectedVoice.type
                    : selectedVoice.type}{" "}
                  voice
                </Tag>
              </HStack>
              <HStack>
                {/* 添加播放按钮 */}
                {currentlyPlaying ===
                (tempSelectedVoice?.audioUrl || selectedVoice?.audioUrl) ? (
                  <IconButton
                    aria-label="暂停播放"
                    icon={<FaPause />}
                    size="sm"
                    colorScheme="purple"
                    variant="ghost"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.pause();
                        setCurrentlyPlaying(null);
                      }
                    }}
                  />
                ) : (
                  <IconButton
                    aria-label="播放声音样本"
                    icon={<FaPlay />}
                    size="sm"
                    colorScheme="purple"
                    variant="ghost"
                    onClick={() => {
                      const voiceInfo = tempSelectedVoice || selectedVoice;
                      if (voiceInfo?.audioUrl) {
                        handlePlaySample(voiceInfo.audioUrl);
                      }
                    }}
                  />
                )}
                {tempSelectedVoice && (
                  <IconButton
                    aria-label="删除声音"
                    icon={<FaTrash />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={handleRemoveSelectedVoice}
                  />
                )}
              </HStack>
            </HStack>
          )}

          <Button
            w="100%"
            h="48px"
            colorScheme="purple"
            isDisabled={!tempSelectedVoice}
            borderRadius="full"
            fontSize="16px"
            onClick={handleConfirmVoice}
            _hover={{ bg: "purple.500" }}
            _active={{ bg: "purple.600" }}
          >
            I'VE CHOSEN THIS VOICE
          </Button>
        </VStack>

        {/* 上传弹框 */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>上传声音</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6}>
                {/* 录音选项 */}
                <FormControl>
                  <FormLabel>录制声音</FormLabel>
                  <Button
                    leftIcon={<FaMicrophone />}
                    colorScheme={isRecording ? "red" : "purple"}
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                    w="100%"
                  >
                    {isRecording ? "停止录音" : "开始录音"}
                  </Button>
                </FormControl>

                {/* 上传文件选项 */}
                <FormControl>
                  <FormLabel>上传本地文件</FormLabel>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    display="none"
                  />
                  <Button
                    leftIcon={<FaUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    w="100%"
                  >
                    选择文件
                  </Button>
                </FormControl>

                {/* 音频预览 */}
                {audioUrl && (
                  <Box w="100%">
                    <Text mb={2}>预览:</Text>
                    <Box display="flex" alignItems="center">
                      <audio
                        controls
                        src={audioUrl}
                        style={{ width: "100%" }}
                      />
                      <HStack justifyContent="flex-end" mt={2}>
                        <IconButton
                          aria-label="删除录音"
                          icon={<FaTimes />}
                          onClick={() => {
                            setAudioUrl(null);
                            setAudioBlob(null);
                          }}
                          colorScheme="red"
                          variant="ghost"
                        />
                      </HStack>
                    </Box>
                  </Box>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                取消
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleUpload}
                isLoading={isLoading}
                isDisabled={!audioBlob}
              >
                确认上传
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </MotionBox>
    </AnimatePresence>
  );
};

export default VoiceSelection;
