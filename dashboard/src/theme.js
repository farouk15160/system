import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        bg: "#f7fafc", // Light gray background color
        color: "gray.800",
      },
    },
  },
});

export default theme;
