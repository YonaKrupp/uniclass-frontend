import { Toaster } from "@/components/ui/toaster"
import { Toaster as HotToaster } from "react-hot-toast"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import CanonicalUrl from './components/CanonicalUrl';
import RoleGuard from './components/RoleGuard';

// Page imports - student-schedule route fix
import Welcome from './pages/Welcome';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import RegisterStudent from './pages/RegisterStudent';
import StudentWelcome from './pages/StudentWelcome';
import RegisterTeacher from './pages/RegisterTeacher';
import TeacherHome from './pages/TeacherHome';
import TeacherSchedule from './pages/TeacherSchedule';
import TeacherPicture from './pages/TeacherPicture';
import ClassRoom from './pages/ClassRoom';
import TeacherProfile from './pages/TeacherProfile';
import StudentHome from './pages/StudentHome';
import StudentTest from './pages/StudentTest';
import TeacherLayout from './components/TeacherLayout';
import StudentLayout from './components/StudentLayout';
import StudentsList from './pages/StudentsList';
import TeachersList from './pages/TeachersList';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import StudentPayment from './pages/StudentPayment';
import ChooseLesson from './pages/ChooseLesson';
import TeacherResults from './pages/TeacherResults';
import StudentSchedule from './pages/StudentSchedule';
import StudentTerms from './pages/StudentTerms';
import StudentResetPassword from './pages/StudentResetPassword';
import TeacherResetPassword from './pages/TeacherResetPassword';
import TeacherTerms from './pages/TeacherTerms';
import LessonSummary from './pages/LessonSummary';
import StudentLessonSummary from './pages/StudentLessonSummary';
import Chat from './pages/Chat';
import RateTeacher from './pages/RateTeacher';
import Contact from './pages/Contact';
import LoginChoice from './pages/LoginChoice';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Unsubscribe from './pages/Unsubscribe';
import LegalDocumentPage from './components/legal/LegalDocumentPage';
import LegalDocView from './pages/LegalDocView';
import AdminLegalDocs from './pages/AdminLegalDocs';
import SiteFooter from './components/site/SiteFooter';
import AccessibilityToolbar from './components/landing/AccessibilityToolbar';
import AdminInterface from './pages/AdminInterface';
import Blog from './pages/Blog';
import PrivateTutorMath from './pages/PrivateTutorMath';
import PrivateTutorEnglish from './pages/PrivateTutorEnglish';
import BlogPost from './pages/BlogPost';
import AdminBlog from './pages/AdminBlog';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <CanonicalUrl />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login-choice" element={<LoginChoice />} />
            <Route path="/teacher-login" element={<TeacherLogin />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/register-student" element={<RegisterStudent />} />
            <Route path="/student-welcome" element={<StudentWelcome />} />
            <Route path="/register-teacher" element={<RegisterTeacher />} />
            <Route element={<TeacherLayout />}>
              <Route path="/teacher-home" element={<RoleGuard role="teacher"><TeacherHome /></RoleGuard>} />
              <Route path="/teacher-schedule" element={<TeacherSchedule />} />
              <Route path="/teacher-picture" element={<TeacherPicture />} />
              <Route path="/teacher-video" element={<ClassRoom />} />
              <Route path="/teacher-profile" element={<TeacherProfile />} />
              <Route path="/teacher-students" element={<StudentsList />} />
              <Route path="/lesson-summary" element={<LessonSummary />} />
              <Route path="/teacher-chat" element={<Chat />} />
              <Route path="/teacher-contact" element={<Contact />} />
              <Route path="/admin-interface" element={<RoleGuard role="admin"><AdminInterface /></RoleGuard>} />
            </Route>
            <Route element={<StudentLayout />}>
              <Route path="/student-home" element={<StudentHome />} />
              <Route path="/student-video" element={<ClassRoom />} />
              <Route path="/student-test" element={<StudentTest />} />
              <Route path="/student-payment" element={<StudentPayment />} />
              <Route path="/choose-lesson" element={<ChooseLesson />} />
              <Route path="/student-teachers" element={<TeachersList />} />
              <Route path="/teacher-results" element={<TeacherResults />} />
              <Route path="/student-schedule" element={<StudentSchedule />} />
              <Route path="/student-lesson-summary" element={<StudentLessonSummary />} />
              <Route path="/student-chat" element={<Chat />} />
              <Route path="/rate-teacher" element={<RateTeacher />} />
              <Route path="/student-contact" element={<Contact />} />
            </Route>
            <Route path="/student-reset-password" element={<StudentResetPassword />} />
            <Route path="/teacher-reset-password" element={<TeacherResetPassword />} />
            <Route path="/teacher-terms" element={<TeacherTerms />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy" element={<LegalDocView />} />
            <Route path="/terms" element={<LegalDocView />} />
            <Route path="/recording-consent" element={<LegalDocumentPage docKey="recording" />} />
            <Route path="/conduct" element={<LegalDocView />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/accessibility" element={<LegalDocView />} />
            <Route path="/student-terms" element={<LegalDocView />} />
            <Route path="/student-privacy" element={<LegalDocView />} />
            <Route path="/student-recording" element={<LegalDocView />} />
            <Route path="/student-cancellation" element={<LegalDocView />} />
            <Route path="/student-conduct" element={<LegalDocView />} />
            <Route path="/admin/legal" element={<AdminLegalDocs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/private-tutor-math" element={<PrivateTutorMath />} />
            <Route path="/private-tutor-english" element={<PrivateTutorEnglish />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <SiteFooter />
          <AccessibilityToolbar />
        </Router>
        <Toaster />
        <HotToaster position="top-center" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App