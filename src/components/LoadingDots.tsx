import { HStack, Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const pulse = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
`;

const LoadingDots = () => {
  return (
    <HStack spacing={2} justify="center" mt={4}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          w="8px"
          h="8px"
          borderRadius="full"
          bg="gray.500"
          css={{
            animation: `${pulse} 1.5s ease-in-out infinite`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </HStack>
  );
};

export default LoadingDots;
