import { Flex, Heading, Spacer, Highlight, Text, VStack } from '@chakra-ui/react';
import logo_nt from '../assets/logo_nt.png'; 
import { ColorModeButton } from "@/components/ui/color-mode"


const HeaderBar = () => {

   return (
    <Flex
      position="sticky"
      top={0}
      zIndex={10}
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
      py={2}
      px={4}
      align="center"
      gap={3}
    >
      <img src={logo_nt} width="75" height="75" />
            <Spacer />


         <VStack
        flex="1"
        align="center" 
        gap={1}
        textAlign="center"
      >
        <Heading size="3xl" letterSpacing="tight" fontFamily={"heading"}>
          <Highlight query="Academy" styles={{ color: "secondary", textDecoration: "underline", textDecorationColor: "brand.greenLight" }}>
            AI Academy
          </Highlight>
        </Heading>
        <Text
          fontSize="medium"
          color="text.default"
          fontWeight="normal"
          textAlign="center" 
          maxW="3xl" 
          lineHeight="100%"
          letterSpacing="-1%"
          fontStyle="italic"
        >
          Create instant AI generated quizzes with speed. Simply add in your notes and PDF files, and AI Academy will generate quizzes for you.
        </Text>
      </VStack>
      
      <Spacer />
      <ColorModeButton size={"xl"} variant={"subtle"}/>
    </Flex>
  );
}
export default HeaderBar;
