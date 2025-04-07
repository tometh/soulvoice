import React from "react";
import {
  Box,
  VStack,
  Text,
  useColorMode,
  Card,
  CardBody,
  HStack,
  Icon,
  Heading,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaMoon,
  FaSun,
  FaBriefcase,
  FaHeart,
  FaCoins,
  FaBolt,
  FaLeaf,
  FaBullseye,
  FaLightbulb,
  FaExclamationTriangle,
  FaWind,
  FaBed,
} from "react-icons/fa";

interface MeditationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  emoji: string;
  audioUrl?: string;
  scene?: string;
}

const meditationItems: MeditationItem[] = [
  {
    id: "sleep",
    title: "睡前放松",
    description: "放下今天的重量，温柔入眠",
    icon: FaMoon,
    emoji: "🌙",
    audioUrl: "/meditations/sleep.mp3",
    scene: "想象自己躺在柔软的云朵上，随着轻柔的夜风缓缓飘荡...",
  },
  {
    id: "morning",
    title: "早安觉醒",
    description: "以清晰和勇气开启新的一天",
    icon: FaSun,
    emoji: "☀️",
    audioUrl: "/meditations/morning.mp3",
    scene: "晨光透过树叶洒在你的脸上，带来温暖的能量...",
  },
  {
    id: "work",
    title: "工作小憩",
    description: "10分钟安静，让注意力归位",
    icon: FaBriefcase,
    emoji: "🧘",
    audioUrl: "/meditations/work.mp3",
    scene: "在繁忙中找到一片宁静的绿洲，让思绪沉淀...",
  },
  {
    id: "emotion",
    title: "情绪疗愈",
    description: "不被情绪压垮，用声音自我复位",
    icon: FaHeart,
    emoji: "💞",
    audioUrl: "/meditations/emotion.mp3",
    scene: "让温暖的阳光照进心房，融化所有的不安...",
  },
  {
    id: "wealth",
    title: "财富显化",
    description: "打开丰盛之门，激活内在信念",
    icon: FaCoins,
    emoji: "💰",
    audioUrl: "/meditations/wealth.mp3",
    scene: "宇宙的能量在你周围流动，带来无限的可能...",
  },
  {
    id: "energy",
    title: "重启能量",
    description: "在倦怠中恢复自我火力与动力",
    icon: FaBolt,
    emoji: "🔥",
    audioUrl: "/meditations/energy.mp3",
    scene: "感受内在的火焰重新燃起，温暖全身...",
  },
  {
    id: "anxiety",
    title: "焦虑释放",
    description: "学会让情绪缓缓流动、排解焦虑",
    icon: FaLeaf,
    emoji: "🍃",
    audioUrl: "/meditations/anxiety.mp3",
    scene: "像树叶一样轻轻飘落，随风舞动...",
  },
  {
    id: "focus",
    title: "专注练习",
    description: "训练脑力聚焦，减少分心想法",
    icon: FaBullseye,
    emoji: "🧠",
    audioUrl: "/meditations/focus.mp3",
    scene: "注意力如明亮的光束，照亮前方的道路...",
  },
  {
    id: "compassion",
    title: "自我慈悲",
    description: "给自己一份不带评判的接纳",
    icon: FaLightbulb,
    emoji: "🕯️",
    audioUrl: "/meditations/compassion.mp3",
    scene: "用温柔的目光看待自己，接纳所有的不完美...",
  },
  {
    id: "sos",
    title: "情绪崩溃SOS",
    description: "急救式语音支持，帮你稳住当下",
    icon: FaExclamationTriangle,
    emoji: "🌀",
    audioUrl: "/meditations/sos.mp3",
    scene: "在风暴中找到安全的港湾，慢慢平静下来...",
  },
  {
    id: "breathing",
    title: "呼吸引导",
    description: "进入身体节奏，静静跟随呼吸",
    icon: FaWind,
    emoji: "🐚",
    audioUrl: "/meditations/breathing.mp3",
    scene: "随着海浪的节奏，深深地呼吸...",
  },
  {
    id: "sleep-music",
    title: "伴你入眠（无语音）",
    description: "纯音乐 / 自然音，辅助快速入眠",
    icon: FaBed,
    emoji: "🛌",
    audioUrl: "/meditations/sleep-music.mp3",
    scene: "在舒缓的音乐中，慢慢进入梦乡...",
  },
];

const MeditationList: React.FC = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  const handleSelectMeditation = (item: MeditationItem) => {
    navigate("/meditation", {
      state: {
        type: item.id,
        scene: item.scene,
      },
    });
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-b, purple.50, blue.50)"
      p={4}
      pt={8}
    >
      <Heading
        fontSize="2xl"
        textAlign="center"
        mb={6}
        color={colorMode === "light" ? "gray.700" : "white"}
      >
        选择冥想
      </Heading>
      <VStack spacing={4} align="stretch" pb={20}>
        {meditationItems.map((item) => (
          <Card
            key={item.id}
            as={motion.div}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            cursor="pointer"
            onClick={() => handleSelectMeditation(item)}
            bg={colorMode === "light" ? "white" : "gray.700"}
            shadow="md"
          >
            <CardBody>
              <HStack spacing={4}>
                <Box
                  bg={colorMode === "light" ? "purple.50" : "purple.900"}
                  p={3}
                  borderRadius="lg"
                  color={colorMode === "light" ? "purple.500" : "purple.200"}
                >
                  <Text fontSize="xl">{item.emoji}</Text>
                </Box>
                <Box flex={1}>
                  <HStack>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={colorMode === "light" ? "gray.700" : "white"}
                    >
                      {item.title}
                    </Text>
                    <Icon
                      as={item.icon}
                      color={
                        colorMode === "light" ? "purple.500" : "purple.200"
                      }
                    />
                  </HStack>
                  <Text
                    fontSize="sm"
                    color={colorMode === "light" ? "gray.600" : "gray.300"}
                    mt={1}
                  >
                    {item.description}
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
};

export default MeditationList;
