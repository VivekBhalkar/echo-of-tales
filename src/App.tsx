
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { BottomAudioPlayer } from "@/components/BottomAudioPlayer";
import Index from "./pages/Index";
import StoriesPage from "./pages/Stories";
import AuthPage from "./pages/Auth";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/Home";
import StoryPlayer from "./pages/StoryPlayer";
import VideoPlayer from "./pages/VideoPlayer";
import ProfilePage from "./pages/Profile";
import UserProfilePage from "./pages/UserProfile";
import PlaylistsPage from "./pages/Playlists";
import ChatPage from "./pages/Chat";
import FriendsPage from "./pages/Friends";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AudioPlayerProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/stories/:id" element={<StoryPlayer />} />
            <Route path="/videos/:id" element={<VideoPlayer />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomAudioPlayer />
        </BrowserRouter>
      </AudioPlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
