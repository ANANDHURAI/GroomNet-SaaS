import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux'
import { store } from './redux/store'
import LoginPage from './pages/authservice/LoginPage'
import RegisterPage from './pages/authservice/RegsiterPage'
import HomePage from './pages/commonpages/HomePage'
import OtpPage from './pages/authservice/OtpPage'
import AdminLogin from './pages/authservice/AdminLogin'
import AdminDasboard from './pages/adminsite/AdminDasboard'
import CustomersList from './pages/adminsite/CustomersList'
import UsersDetails from './pages/adminsite/UsersDeatails'
import Landing from './pages/commonpages/LandingPage'
import ProfilePage from './pages/commonpages/ProfilePage'
import BarberPersDetails from './pages/authservice/BarberPersDetails'
import DocumentUpload from './pages/authservice/DocumentUpload'
import BarberStatus from './pages/authservice/BarberStatus'
import VerificationPage from './pages/adminsite/VericationPage'
import BarberDash from './pages/barbersite/BarberDash'
import BarbersList from './pages/adminsite/BarbersList'
import BarberDetails from './pages/adminsite/BarberDetails'
import Portfolio from './pages/barbersite/Portfolio'
import Categoryslist from './pages/adminsite/Categoryslist'
import Servicelist from './pages/adminsite/Servicelist'
import BookServices from './pages/barbersite/BookServices'
import SelectService from './pages/barbersite/SelectService'
import MyServices from './pages/barbersite/MyServices'
import { ServiceProvider } from './contexts/ServiceContext'
import BarberSlotBooking from './pages/barbersite/BarberSlotBooking'
import CategoryList from './pages/customersite/CategoryList'
import ServicesList from './pages/customersite/ServicesList'
import SelectBarber from './pages/customersite/SelectBarbers'
import SelectDate from './pages/customersite/SelectDate'
import SelectTime from './pages/customersite/SelectTimeSlots'
import AddAddress from './pages/customersite/AddAddress'
import { ConfirmBooking } from './pages/customersite/ConfirmBooking'
import ProtectedRoute from './components/protectRoute/ProtectedRoute'
import PaymentPage from './pages/customersite/PaymentPage'
import SuccessPage from './pages/customersite/SussessPage'
import Appointments from './pages/barbersite/Appointments'
import BarberChatPage from './pages/barbersite/BarberChatPage'
import CancelledPage from './pages/customersite/CancelledPage'
import BookingDetailsPage from './pages/customersite/BookingDetailsPage'
import BookingHistoryPage from './pages/customersite/BookingHistoryPage'
import AddressList from './pages/customersite/AddressList'
import CustomerChatPage from './pages/customersite/CustomerChatPage'
import CustomerLayout from './components/customercompo/CustomerLayout'
import AdminWallet from './pages/adminsite/AdminWallet'
import FindBarbers from './pages/customersite/FindBarbers'
import ForgetPassword from './pages/authservice/ForgetPassword'
import ForgetOtp from './pages/authservice/ForgetOtp'
import ResetPassword from './pages/authservice/ResetPassword'
import WorkingArea from './pages/barbersite/WorkingArea'
import TravelPage from './pages/barbersite/TravelPage'
import StatusCheaking from './pages/customersite/StatusCheaking'
import CustomerWallet from './pages/customersite/CustomerWallet'
import ServiceCompletePage from './pages/barbersite/ServiceCompletePage'
import CompletedAppointments from './pages/barbersite/CompletedAppointments';
import Earnings from './pages/barbersite/Earnings';
import CouponManagePage from './pages/adminsite/CouponManagePage';
import BarberRatingsPage from './pages/barbersite/BarberRatingsPage';
import Complaints from './pages/adminsite/Complaints';

function App() {
  return (
    <GoogleOAuthProvider clientId="137089648588-63scrg565l4a5qqo39i1ibrd96ogptjr.apps.googleusercontent.com">
      <Provider store={store}>
        <BrowserRouter>
          <ServiceProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/landing-page" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/otp" element={<OtpPage />} />
              <Route path="/barber-personal" element={<BarberPersDetails />} />
              <Route path="/barber-document-upload" element={<DocumentUpload />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/barber-status" element={<BarberStatus />} />

              <Route 
                path="/home" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <HomePage />
                  </ProtectedRoute>
                } 
              />
              

              <Route 
                path="/customer/categoryes" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <CategoryList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/services" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <ServicesList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/select-barber" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <SelectBarber />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/select-date" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <SelectDate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/select-time" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <SelectTime />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-address" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <AddAddress />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/confirm-booking" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <ConfirmBooking />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/payment" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <PaymentPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/booking-success" 
                element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <SuccessPage />
                  </ProtectedRoute>
                } 
              />


              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminDasboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customers-list" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <CustomersList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer-details/:id" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <UsersDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin-verification" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <VerificationPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/barbers-list" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <BarbersList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/barbers-details/:id" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <BarberDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/category" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <Categoryslist />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/service" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <Servicelist />
                  </ProtectedRoute>
                } 
              />


              <Route 
                path="/barber-dash" 
                element={
                  <ProtectedRoute allowedUserTypes={['barber']} requireVerification={true}>
                    <BarberDash />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/barbers-portfolio" 
                element={
                  <ProtectedRoute allowedUserTypes={['barber']} requireVerification={true}>
                    <Portfolio />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/barber/book-services" 
                element={
                  <ProtectedRoute allowedUserTypes={['barber']} requireVerification={true}>
                    <BookServices />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/barber/select-service/:id" 
                element={
                  <ProtectedRoute allowedUserTypes={['barber']} requireVerification={true}>
                    <SelectService />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/barber/my-services" 
                element={
                  <ProtectedRoute allowedUserTypes={['barber']} requireVerification={true}>
                    <MyServices />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/barber-slot-booking" 
                element={
                  <ProtectedRoute allowedUserTypes={['barber']} requireVerification={true}>
                    <BarberSlotBooking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/barber-appointments" 
                element={
                  <ProtectedRoute allowedUserTypes={['barber']} requireVerification={true}>
                    <Appointments />
                  </ProtectedRoute>
                } 
              />
              <Route path="/payment-cancelled" element={<CancelledPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />

              <Route path="/booking-history" element={<BookingHistoryPage />} />
              <Route path="/booking-details/:id" element={<BookingDetailsPage />} />
              <Route path="/my-addresses" element={<AddressList />} />

              <Route path="/admin-wallet/" element={<AdminWallet />} />
              <Route path="/find-barber/" element={<FindBarbers />} />
              <Route path="/instant-booking/" element={<WorkingArea />} />
              <Route path="/barber/chat/:bookingId" element={<BarberChatPage />} />

              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/forget-otp" element={<ForgetOtp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/travel-status/:bookingId" element={<TravelPage />} />
              
              <Route path="/booking-status/:bookingId" element={<StatusCheaking />} />

              <Route
                path="/customer/chat/:bookingId"
                element={
                  <CustomerLayout>
                    <CustomerChatPage />
                  </CustomerLayout>
                }
              />
              <Route path="/customer-wallet" element={<CustomerWallet />} />
              <Route path="/barber/service-complete/:bookingId" element={<ServiceCompletePage />}/>
              <Route path="/completed-appointments" element={<CompletedAppointments />} />

              <Route path="/barber-earnings" element={<Earnings />} />
              <Route path="/coupons-management" element={<CouponManagePage />} />
              <Route path="/barber/ratings/" element={<BarberRatingsPage />} />
              <Route path="/customer-complaints" element={<Complaints />} />

            </Routes>
         </ServiceProvider>
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  )
}

export default App