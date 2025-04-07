import React from "react";
import {
  Box,
  SimpleGrid,
  VStack,
  Text,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdMusicNote, MdFileUpload } from "react-icons/md";

const mockVoices = [
  {
    id: 1,
    name: "温柔女声",
    description: "柔和舒缓的声线，适合放松冥想",
    icon: MdMusicNote,
  },
  {
    id: 2,
    name: "自然男声",
    description: "清晰平稳的声线，富有安全感",
    icon: MdMusicNote,
  },
  {
    id: 3,
    name: "治愈童声",
    description: "天真纯净的声线，唤醒内在童真",
    icon: MdMusicNote,
  },
  {
    id: 4,
    name: "上传声音",
    description: "使用自己喜欢的声音进行冥想",
    icon: MdFileUpload,
  },
];

const VoiceSelection: React.FC = () => {
  const bgGradient = useColorModeValue(
    "linear(to-b, blue.50, pink.50)",
    "linear(to-b, gray.800, purple.900)"
  );
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.200");

  const handleVoiceSelect = (voiceId: number) => {
    console.log("Selected voice:", voiceId);
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient} p={4}>
      <VStack spacing={6} mb={6} mt={8}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          选择冥想声音
        </Text>
        <Text fontSize="md" color={textColor}>
          挑选一个让你感到舒适的声音
        </Text>
      </VStack>

      <SimpleGrid columns={2} spacing={4}>
        {mockVoices.map((voice) => (
          <Box
            key={voice.id}
            bg={cardBg}
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            onClick={() => handleVoiceSelect(voice.id)}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "md",
            }}
          >
            <VStack spacing={3} align="center">
              <Icon as={voice.icon} boxSize={8} color="blue.500" />
              <Text fontWeight="bold" fontSize="md">
                {voice.name}
              </Text>
              <Text fontSize="sm" color={textColor} textAlign="center">
                {voice.description}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default VoiceSelection;
