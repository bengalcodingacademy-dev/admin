import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/authContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AdminLanding from "./pages/AdminLanding";
import Courses from "./pages/Courses";
import CourseContent from "./pages/CourseContent";
import Webinars from "./pages/Webinars";
import Announcements from "./pages/Announcements";
import Sales from "./pages/Sales";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import Testimonials from "./pages/Testimonials";
import YouTubeVideos from "./pages/YouTubeVideos";
import MeetingRequests from "./pages/MeetingRequests";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-bca-black flex items-center justify-center">
        <video
          src="https://sauvikbcabucket.s3.ap-south-1.amazonaws.com/assets/shimmer.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-40 h-40 md:w-60 md:h-60 object-contain"
        />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

// App component
export default function App() {
  const navigate = useNavigate();


  return (
    <AuthProvider navigate={navigate}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <Protected>
              <Layout>
                <Routes>
                  <Route path="/" element={<AdminLanding />} />
                  <Route path="courses" element={<Courses />} />
                  <Route path="course-content" element={<CourseContent />} />
                  <Route path="webinars" element={<Webinars />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="sales" element={<Sales />} />
                  <Route path="users" element={<Users />} />
                  <Route path="testimonials" element={<Testimonials />} />
                  <Route path="youtube-videos" element={<YouTubeVideos />} />
                  <Route path="meeting-requests" element={<MeetingRequests />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
