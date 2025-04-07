import React from "react";
import { Box, Flex, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMicrophone, FaStore } from "react-icons/fa";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  onClick,
}) => {
  const activeColor = useColorModeValue("purple.600", "purple.300");
  const inactiveColor = useColorModeValue("gray.500", "gray.400");

  return (
    <VStack
      spacing={1}
      px={4}
      py={2}
      cursor="pointer"
      color={isActive ? activeColor : inactiveColor}
      onClick={onClick}
      opacity={isActive ? 1 : 0.8}
      transition="all 0.2s"
    >
      <Box fontSize="xl">{icon}</Box>
      <Text fontSize="xs" fontWeight={isActive ? "bold" : "normal"}>
        {label}
      </Text>
    </VStack>
  );
};

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.800");

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
      bg={bgColor}
      zIndex={100}
    >
      <Flex justify="space-around" align="center" h="60px">
        <NavItem
          icon={<FaMicrophone />}
          label="声音选择"
          isActive={isActive("/voice-selection")}
          onClick={() => navigate("/voice-selection")}
        />
        <NavItem
          icon={<FaStore />}
          label="声音商店"
          isActive={isActive("/voice-store")}
          onClick={() => navigate("/voice-store")}
        />
      </Flex>
    </Box>
  );
};

export default BottomNavigation;
