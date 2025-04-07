import { Box, HStack, IconButton, useColorMode } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaMicrophone,
  FaUser,
  FaPrayingHands,
  FaStore,
} from "react-icons/fa";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const navItems = [
    { path: "/", icon: FaHome, label: "首页" },
    { path: "/meditation-list", icon: FaPrayingHands, label: "冥想" },
    { path: "/voice-selection", icon: FaMicrophone, label: "语音" },
    { path: "/voice-store", icon: FaStore, label: "商店" },
    { path: "/profile", icon: FaUser, label: "我的" },
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={colorMode === "light" ? "white" : "gray.800"}
      boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
      zIndex={1000}
    >
      <HStack justify="space-around" py={2}>
        {navItems.map((item) => (
          <IconButton
            key={item.path}
            aria-label={item.label}
            icon={<item.icon />}
            variant="ghost"
            colorScheme={location.pathname === item.path ? "purple" : "gray"}
            onClick={() => navigate(item.path)}
            size="lg"
          />
        ))}
      </HStack>
    </Box>
  );
};

export default BottomNav;
