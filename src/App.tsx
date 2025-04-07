import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider, Box } from "@chakra-ui/react";
import TodayFeeling from "./pages/TodayFeeling";
import VoiceSelection from "./pages/VoiceSelection";
import Profile from "./pages/Profile";
import BottomNav from "./components/BottomNav";
import Meditation from "./pages/Meditation";
import MeditationList from "./pages/MeditationList";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box pb="70px">
          <Routes>
            <Route path="/" element={<TodayFeeling />} />
            <Route path="/voice-selection" element={<VoiceSelection />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/meditation" element={<Meditation />} />
            <Route path="/meditation-list" element={<MeditationList />} />
          </Routes>
        </Box>
        <BottomNav />
      </Router>
    </ChakraProvider>
  );
}

export default App;
