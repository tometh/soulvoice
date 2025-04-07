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
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaUpload, FaTimes, FaTrash } from "react-icons/fa";
import { voiceService } from "../services/voiceService";
import { useVoice } from "../contexts/VoiceContext";

const MotionBox = motion(Box);

interface CustomVoice {
  id: string;
  name: string;
  url: string;
}

interface SelectedVoice {
  id: string;
  name: string;
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

  // Mock 自己上传的声音
  const mockUploads = [
    { id: "up1", name: "upload1", color: "purple.100" },
    { id: "up2", name: "upload2", color: "blue.100" },
  ];

  // Mock 已购声音
  const purchasedVoices = [
    {
      id: "p1",
      name: "肖战声音",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://img.win3000.com/m00/97/f3/5eb33a8f4b9d9b59bddabdbeb6fd4d3a_c_345_458.jpg",
      bgColor: "#EDE9FF",
    },
    {
      id: "p2",
      name: "Nova声音",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://bpic.588ku.com/element_pic/23/04/25/fe973e002aa577c473fc1fd8e3780615.png!/fw/350/quality/99/unsharp/true/compress/true",
      bgColor: "#EFF6FF",
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
    },
    {
      id: "sys2",
      name: "性感女声",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://s.alicdn.com/@sc04/kf/H0ab28dbdeb85479eab7fc548e2755824f.jpg_720x720q50.jpg",
      bgColor: "#FDF2F8",
    },
    {
      id: "sys3",
      name: "沉稳男声",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://bpic.588ku.com/element_pic/23/07/04/7833d9718e47f0084c4f05fe3b1302f1.jpg!/fw/350/quality/99/unsharp/true/compress/true",
      bgColor: "#EFF6FF",
    },
    {
      id: "sys4",
      name: "老练男声",
      description: "Please upload a clear, unobstructed voice clip(10-60s)",
      image:
        "https://img.freepik.com/premium-vector/cute-grandfather-old-man-elder-cartoon-illustration_1058532-12606.jpg",
      bgColor: "#DBEAFE",
    },
  ];

  useEffect(() => {
    fetchCustomVoices();
  }, []);

  const fetchCustomVoices = async () => {
    try {
      const response = await fetch("http://192.168.1.4:9880/voices");
      const data = await response.json();
      setCustomVoices(data);
    } catch {
      toast({
        title: "获取声音列表失败",
        description: "请检查网络连接",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);
      await voiceService.startRecording(() => {
        console.log("正在录音...");
      });
    } catch {
      toast({
        title: "错误",
        description: "无法启动录音，请检查麦克风权限",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      const { audioBlob } = await voiceService.stopRecording();
      setAudioBlob(audioBlob);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch {
      toast({
        title: "错误",
        description: "录音失败，请重试",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", audioBlob);

      const response = await fetch("http://192.168.1.4:9880/upload", {
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
      fetchCustomVoices();
    } catch {
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
    type: "custom" | "purchased" | "system"
  ) => {
    setTempSelectedVoice({ id, name, type });
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

  return (
    <AnimatePresence mode="wait">
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        minH="100vh"
        bgGradient="linear(to-b, blue.50, purple.50)"
        p={4}
        pb="80px"
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

            {/* Mock上传的声音 */}
            {mockUploads.map((voice) => (
              <Box
                key={voice.id}
                minW="80px"
                h="80px"
                mr={3}
                borderRadius="xl"
                bg={voice.color}
                cursor="pointer"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ transform: "scale(1.05)" }}
                transition="transform 0.2s"
                onClick={() =>
                  handleSelectVoice(voice.id, voice.name, "custom")
                }
              >
                <Text color="white" fontWeight="bold">
                  {voice.name}
                </Text>
              </Box>
            ))}

            {/* 接口返回的声音 */}
            {customVoices.map((voice) => (
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
                  handleSelectVoice(voice.id, voice.name, "custom")
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
                handleSelectVoice(voice.id, voice.name, "purchased")
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
              onClick={() => handleSelectVoice(voice.id, voice.name, "system")}
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
        <VStack spacing={4} w="100%" maxW="500px" mx="auto" mt={8} mb={6}>
          {(tempSelectedVoice || selectedVoice) && (
            <HStack
              w="100%"
              bg="white"
              p={3}
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
          )}

          <Box h="2px" w="50%" bg="gray.300" mx="auto" my={2}></Box>

          <Button
            w="100%"
            h="60px"
            colorScheme="purple"
            isDisabled={!tempSelectedVoice}
            fontSize="lg"
            borderRadius="full"
            onClick={handleConfirmVoice}
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
                    <audio controls src={audioUrl} style={{ width: "100%" }} />
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
