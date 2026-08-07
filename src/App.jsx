import { Toaster } from "@/components/ui/toaster"
import { Toaster as HotToaster } from "react-hot-toast"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';

// Page imports - student-schedule route fix
import Landing from './pages/Landing';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import RegisterStudent from './pages/RegisterStudent';
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
import PaymentPackages from './pages/PaymentPackages';
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
import PilotRegistrationsExport from './pages/PilotRegistrationsExport';
import LoginChoice from './pages/LoginChoice';
import AdminInterface from './pages/AdminInterface';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login-choice" element={<LoginChoice />} />
            <Route path="/teacher-login" element={<TeacherLogin />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/register-student" element={<RegisterStudent />} />
            <Route path="/register-teacher" element={<RegisterTeacher />} />
            <Route element={<TeacherLayout />}>
              <Route path="/teacher-home" element={<TeacherHome />} />
              <Route path="/teacher-schedule" element={<TeacherSchedule />} />
              <Route path="/teacher-picture" element={<TeacherPicture />} />
              <Route path="/teacher-video" element={<ClassRoom />} />
              <Route path="/teacher-profile" element={<TeacherProfile />} />
              <Route path="/teacher-students" element={<StudentsList />} />
              <Route path="/lesson-summary" element={<LessonSummary />} />
              <Route path="/teacher-chat" element={<Chat />} />
              <Route path="/teacher-contact" element={<Contact />} />
              <Route path="/admin-interface" element={<AdminInterface />} />
            </Route>
            <Route element={<StudentLayout />}>
              <Route path="/student-home" element={<StudentHome />} />
              <Route path="/student-video" element={<ClassRoom />} />
              <Route path="/student-test" element={<StudentTest />} />
              <Route path="/payment-packages" element={<PaymentPackages />} />
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
            <Route path="/student-terms" element={<StudentTerms />} />
            <Route path="/student-reset-password" element={<StudentResetPassword />} />
            <Route path="/teacher-reset-password" element={<TeacherResetPassword />} />
            <Route path="/teacher-terms" element={<TeacherTerms />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/pilot-export" element={<PilotRegistrationsExport />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
        <HotToaster position="top-center" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App