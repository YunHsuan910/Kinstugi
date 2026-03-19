import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import GatePage from "./pages/GatePage";
import CeremonyPage from "./pages/CeremonyPage";
import CollectionPage from "./pages/CollectionPage";
import AboutPage from "./pages/AboutPage";
import "./styles/main.css";
import MenuLayout from "./layouts/MenuLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route>
          <Route path="/gate" element={<GatePage />} />
          <Route path="/ceremony" element={<CeremonyPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Routes>
      <MenuLayout />
    </BrowserRouter>
  );
}

export default App;
