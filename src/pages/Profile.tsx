import { Box, VStack, Avatar, Text, Button } from "@chakra-ui/react";

const Profile = () => {
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
