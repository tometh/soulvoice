import React from "react";
import {
  Box,
  Text,
  Image,
  Button,
  Flex,
  Heading,
  // HStack,
  // Tag,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
// import { useVoice } from "../contexts/VoiceContext";

const MotionBox = motion(Box);

interface VoicePackItem {
  id: string;
  name: string;
  image: string;
}

const VoiceStore: React.FC = () => {
  // const { selectedVoice } = useVoice();

  // Premium Voice Packs
  const premiumVoices: VoicePackItem[] = [
    {
      id: "iu",
      name: "IU",
      image:
        "https://media.vogue.com.tw/photos/6617e18e3c5ed4e8856e494b/master/w_1600%2Cc_limit/435104356_906263421299779_5768807779230147620_n.jpg",
    },
    {
      id: "xiaozhan",
      name: "肖战",
      image:
        "https://img.win3000.com/m00/97/f3/5eb33a8f4b9d9b59bddabdbeb6fd4d3a_c_345_458.jpg",
    },
  ];

  // Virtual Characters
  const virtualCharacters: VoicePackItem[] = [
    {
      id: "nova",
      name: "Nova",
      image:
        "https://bpic.588ku.com/element_pic/23/04/25/fe973e002aa577c473fc1fd8e3780615.png!/fw/350/quality/99/unsharp/true/compress/true",
    },
    {
      id: "maya",
      name: "Maya",
      image: "https://pic57.photophoto.cn/20201216/0005018380112181_b.jpg",
    },
  ];

  return (
    <Box bg="gray.50" minH="100vh" pb="80px">
      {/* 当前声音 */}
      {/* <Box p={4}>
        <Heading size="md" mb={4} fontWeight="bold">
          当前声音
        </Heading>
        <HStack w="100%" bg="white" p={3} borderRadius="full" boxShadow="sm">
          <Text color="gray.600">{selectedVoice.name}</Text>
          <Tag size="sm" colorScheme="purple" variant="subtle">
            #{selectedVoice.type} voice
          </Tag>
        </HStack>
      </Box> */}

      {/* For You 部分 */}
      <Box p={4}>
        <Heading size="md" mb={4} fontWeight="bold">
          FOR YOU
        </Heading>
        <MotionBox
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          bg="cyan.50"
          borderRadius="lg"
          h="150px"
          w="100%"
          mb={6}
          cursor="pointer"
        >
          <img
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            src="/img/shop-banner.jpeg"
            alt=""
          />
        </MotionBox>
      </Box>

      {/* Premium Voice Packs 部分 */}
      <Box p={4}>
        <Heading size="md" mb={4} fontWeight="bold">
          Premium Voice Packs
        </Heading>
        <Flex justify="space-between">
          {premiumVoices.map((voice) => (
            <Box
              key={voice.id}
              bg="white"
              borderRadius="lg"
              overflow="hidden"
              width="48%"
              boxShadow="sm"
            >
              <Image
                src={voice.image}
                alt={voice.name}
                w="100%"
                // h="130px"
                objectFit="cover"
                aspectRatio={1}
              />
              <Flex p={3} justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{voice.name}</Text>
                <Button
                  size="sm"
                  colorScheme="purple"
                  borderRadius="full"
                  px={6}
                  bg="rgba(216, 180, 254, 0.8)"
                  color="rgba(126, 34, 206, 0.8)"
                  _hover={{
                    bg: "rgba(216, 180, 254, 0.9)",
                  }}
                >
                  BUY
                </Button>
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Virtual Characters 部分 */}
      <Box p={4}>
        <Heading size="md" mb={4} fontWeight="bold">
          Virtual Characters
        </Heading>
        <Flex justify="space-between">
          {virtualCharacters.map((character) => (
            <Box
              key={character.id}
              bg="white"
              borderRadius="lg"
              overflow="hidden"
              width="48%"
              boxShadow="sm"
            >
              <Image
                src={character.image}
                alt={character.name}
                w="100%"
                aspectRatio={1}
                objectFit="cover"
              />
              <Flex p={3} justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{character.name}</Text>
                <Button
                  size="sm"
                  colorScheme="purple"
                  borderRadius="full"
                  px={6}
                  bg="rgba(216, 180, 254, 0.8)"
                  color="rgba(126, 34, 206, 0.8)"
                  _hover={{
                    bg: "rgba(216, 180, 254, 0.9)",
                  }}
                >
                  BUY
                </Button>
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default VoiceStore;
