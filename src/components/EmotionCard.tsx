import {
  Box,
  Text,
  HStack,
  IconButton,
  Divider,
  useColorMode,
  Icon,
} from "@chakra-ui/react";
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaPrayingHands,
  FaShare,
  FaEllipsisH,
  FaCloudSun,
} from "react-icons/fa";

interface EmotionCardProps {
  emotion: string;
  affirmation: string;
  audioUrl: string | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onFavorite: () => void;
  onMeditate: () => void;
  onShare: () => void;
  onMore: () => void;
}

export function EmotionCard({
  emotion,
  affirmation,
  audioUrl,
  isPlaying,
  onPlay,
  onPause,
  onFavorite,
  onMeditate,
  onShare,
  onMore,
}: EmotionCardProps) {
  const { colorMode } = useColorMode();
  const bgColor = colorMode === "light" ? "white" : "gray.700";
  const borderColor = colorMode === "light" ? "gray.200" : "gray.600";

  const [analysis, scene] = affirmation.split(/推荐冥想场景：/);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      p={4}
      shadow="sm"
      position="relative"
    >
      <HStack spacing={4} mb={4}>
        <Box flex="1">
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            {emotion}
          </Text>
          <Text color="gray.600">{analysis}</Text>
        </Box>
        <IconButton
          aria-label={isPlaying ? "暂停" : "播放"}
          icon={isPlaying ? <FaPause /> : <FaPlay />}
          onClick={isPlaying ? onPause : onPlay}
          isDisabled={!audioUrl}
          colorScheme="purple"
          variant="outline"
        />
      </HStack>

      {scene && (
        <Box mt={4}>
          <Divider mb={4} />
          <HStack spacing={2} mb={2}>
            <Icon as={FaCloudSun} />
            <Text fontWeight="bold">推荐冥想场景</Text>
          </HStack>
          <Box
            p={4}
            borderRadius="md"
            bg="purple.50"
            _dark={{ bg: "purple.900" }}
          >
            <Text>{scene}</Text>
          </Box>
        </Box>
      )}

      <HStack spacing={2} mt={4} justify="flex-end">
        <IconButton
          aria-label="收藏"
          icon={<FaHeart />}
          onClick={onFavorite}
          variant="ghost"
          size="sm"
        />
        <IconButton
          aria-label="冥想"
          icon={<FaPrayingHands />}
          onClick={onMeditate}
          variant="ghost"
          size="sm"
        />
        <IconButton
          aria-label="分享"
          icon={<FaShare />}
          onClick={onShare}
          variant="ghost"
          size="sm"
        />
        <IconButton
          aria-label="更多"
          icon={<FaEllipsisH />}
          onClick={onMore}
          variant="ghost"
          size="sm"
        />
      </HStack>
    </Box>
  );
}
