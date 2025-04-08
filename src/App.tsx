import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider, Box } from "@chakra-ui/react";
import TodayFeeling from "./pages/TodayFeeling";
import VoiceSelection from "./pages/VoiceSelection";
import Profile from "./pages/Profile";
import BottomNav from "./components/BottomNav";
import Meditation from "./pages/Meditation";
import MeditationList from "./pages/MeditationList";
import VoiceStore from "./pages/VoiceStore";
import { VoiceProvider } from "./contexts/VoiceContext";

function App() {
  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "20px auto",
        border: "15px solid black",
        height: "100%",
        position: "relative",
        borderRadius: "20px",
      }}
    >
      <ChakraProvider>
        <VoiceProvider>
          <Router>
            <Box pb="70px" maxHeight="90vh" overflow="scroll">
              <Routes>
                <Route path="/" element={<TodayFeeling />} />
                <Route path="/voice-selection" element={<VoiceSelection />} />
                <Route path="/voice-store" element={<VoiceStore />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/meditation" element={<Meditation />} />
                <Route path="/meditation-list" element={<MeditationList />} />
              </Routes>
            </Box>
            <BottomNav />
          </Router>
        </VoiceProvider>
      </ChakraProvider>
    </div>
  );
}

export default App;
