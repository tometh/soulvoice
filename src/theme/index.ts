import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxW: "container.sm",
      },
    },
  },
});

export default theme;
