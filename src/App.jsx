import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import GatePage from "./pages/GatePage";
import CeremonyPage from "./pages/CeremonyPage";
import "./styles/main.css";
import CollectionPage from "./pages/CollectionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>} />

        <Route>
          <Route path="/gate" element={<GatePage />} />
          <Route path="/ceremony" element={<CeremonyPage />} />
          <Route path="/collection" element={<CollectionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
