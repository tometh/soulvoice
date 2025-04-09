import { Box, HStack, VStack, Text, useColorMode } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaMicrophone,
  FaMagic,
  FaImage,
  FaShoppingBag,
} from "react-icons/fa";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const navItems = [
    { path: "/voice-selection", icon: FaStar, label: "声音" },
    { path: "/meditation-list", icon: FaImage, label: "冥想" },
    { path: "/", icon: FaMicrophone, label: "情绪" },
    { path: "/voice-store", icon: FaShoppingBag, label: "商城" },
    { path: "/profile", icon: FaMagic, label: "我的" },
  ];

  return (
    <Box
      position="absolute"
      maxWidth="570px"
      margin="0 auto"
      bottom={0}
      left={0}
      right={0}
      bg={
        colorMode === "light"
          ? "rgba(255, 255, 255, 0.9)"
          : "rgba(26, 32, 44, 0.9)"
      }
      backdropFilter="blur(10px)"
      borderTopWidth="1px"
      borderTopColor={colorMode === "light" ? "gray.100" : "gray.700"}
      zIndex={1000}
    >
      <HStack justify="space-around" py={2}>
        {navItems.map((item) => (
          <VStack
            key={item.path}
            spacing={1}
            cursor="pointer"
            onClick={() => navigate(item.path)}
            opacity={location.pathname === item.path ? 1 : 0.6}
            transition="all 0.2s"
            color={
              location.pathname === item.path
                ? "purple.500"
                : colorMode === "light"
                ? "gray.600"
                : "gray.400"
            }
          >
            <Box fontSize="20px">
              <item.icon />
            </Box>
            <Text
              fontSize="12px"
              fontWeight={location.pathname === item.path ? "bold" : "normal"}
            >
              {item.label}
            </Text>
          </VStack>
        ))}
      </HStack>
    </Box>
  );
};

export default BottomNav;
