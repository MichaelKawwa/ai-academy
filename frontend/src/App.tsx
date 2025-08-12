import { Container } from '@chakra-ui/react';
import { QuizApp } from './myComponents/quizApp'; 
import HeaderBar from './myComponents/headerBar';

function App() {

  return (
    <>
      <HeaderBar />
      <Container maxW="container.md" py={8} centerContent>
      <QuizApp />
      </Container>
    </>
  )
}

export default App


