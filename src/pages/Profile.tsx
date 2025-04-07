import {
  Box,
  VStack,
  Avatar,
  Text,
  Button,
  HStack,
  Tag,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useVoice } from "../contexts/VoiceContext";

const Profile = () => {
  const navigate = useNavigate();
  const { selectedVoice } = useVoice();

  return (
    <Box p={4} pt={8}>
      <VStack spacing={6}>
        <Avatar size="2xl" name="用户" />
        <Text fontSize="2xl" fontWeight="bold">
          用户名
        </Text>
        <Button colorScheme="blue" width="full">
          编辑资料
        </Button>

        {/* 当前声音 */}
        <Box width="full" p={4} bg="white" borderRadius="md" shadow="sm">
          <Text color="gray.500" mb={2}>
            当前使用的声音
          </Text>
          <HStack justify="space-between" align="center">
            <HStack>
              <Text fontWeight="bold">{selectedVoice.name}</Text>
              <Tag size="sm" colorScheme="purple" variant="subtle">
                #{selectedVoice.type}
              </Tag>
            </HStack>
            <Button
              size="sm"
              colorScheme="purple"
              onClick={() => navigate("/voice-selection")}
            >
              切换声音
            </Button>
          </HStack>
        </Box>

        <VStack width="full" spacing={4} align="stretch">
          <Box p={4} bg="white" borderRadius="md" shadow="sm">
            <Text color="gray.500">冥想次数</Text>
            <Text fontSize="xl" fontWeight="bold">
              12
            </Text>
          </Box>
          <Box p={4} bg="white" borderRadius="md" shadow="sm">
            <Text color="gray.500">总冥想时长</Text>
            <Text fontSize="xl" fontWeight="bold">
              3.5 小时
            </Text>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Profile;
