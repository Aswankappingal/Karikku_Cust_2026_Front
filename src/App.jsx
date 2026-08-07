import './App.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import HomePage from './Component/HomePage/HomePage'
import PageNotFound from './Component/common/PageNotFound/PageNotFound'
import Productsidebar from './Component/Theme/ProductSidebar/Productsidebar'
import Cart from './Component/pages/Cart/Cart'
import AllProducts from './Component/pages/AllProducts/AllProducts'
import ExploreProducts from './Component/pages/ExploreProducts/ExploreProducts'
import AboutUs from './Component/pages/AboutUs/AboutUs'
import ProductPage from './Component/pages/ProductPage/ProductPage'
import Blogs from './Component/pages/Blogs/Blogs'
import ContactUs from './Component/pages/ContactUs/ContactUs'
import Store from './Component/pages/Store/Store'
import Wishlist from './Component/pages/Wishlist/Wishlist'
import BlogDetailsPage from './Component/pages/BlogDetailsPage/BlogDetailsPage'
import Address from './Component/pages/Address/Address'
import PrivacyPolicy from './Component/Datas/PrivacyPolicy'
import RefundPolicy from './Component/Datas/RefundPolicy'
import ShippingPolicy from './Component/Datas/ShippingPolicy'
import TermsOfService from './Component/Datas/TermsofService'
import Payment from './Component/pages/Payment/Payment'
import PaymentSuccess from './Component/common/PaymentSuccess/PaymentSuccess'
import PaymentFailed from './Component/common/PaymentFailed/PaymentFailed'
import FaqSection from './Component/pages/Blogs/FaqSection/FaqSection'
import EmptyCart from './Component/pages/EmptyCart/EmptyCart'
import { Provider } from 'react-redux'
import store from './store/store'
import OrderComplete from './Component/pages/OrderComplete/OrderComplete'
import OrderDetails from './Component/pages/OrderDetails/OrderDetails'
import CancelOrder from './Component/pages/CancelOrder/CancelOrder'
import ProtectedRoute from './Component/common/ProtectedRoute/ProtectedRoute'
import ContactSupport from './Component/pages/ContactSupport/ContactSupport'
import LoginModal from './Component/Theme/LoginModal/LoginModal'
import WhatsAppFloat from './Component/common/Whatsapp/WhatsappFloat'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// import { FaQ } from 'react-icons/fa6'

function App() {

  return (
    <>
      <HashRouter>
        <Provider store={store}>
          <Routes>
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
            <Route path='/refund-policy' element={<RefundPolicy />} />
            <Route path='/shipping-policy' element={<ShippingPolicy />} />
            <Route path='/Terms-of-service' element={<TermsOfService />} />



            <Route path='/' element={<HomePage />} />
            <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path='*' element={<PageNotFound />} />
            <Route path='/login-modal' element={<LoginModal />} />
            <Route path='/products' element={<AllProducts />} />
            <Route path='/Sidebar' element={<Productsidebar />} />
            <Route path='/ExploreProducts' element={<ExploreProducts />} />
            <Route path='/about-us' element={<AboutUs />} />
            <Route path='/Product-page/:id' element={<ProductPage />} />
            <Route path='/blogs' element={<Blogs />} />
            <Route path='/contact-us' element={<ContactUs />} />
            <Route path='/store' element={<Store />} />
            <Route path='/wishlist' element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path='/blog-details/:id' element={<BlogDetailsPage />} />
            <Route path='/address' element={<ProtectedRoute><Address /></ProtectedRoute>} />
            <Route path='/order-details' element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path='/order-complete' element={<ProtectedRoute><OrderComplete /></ProtectedRoute>} />
            <Route path="/cancel-order/:orderId" element={<ProtectedRoute><CancelOrder /></ProtectedRoute>} />
            <Route path='/payment' element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path='/payment-success' element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path='/payment-failed' element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />
            <Route path='/Empty' element={<EmptyCart />} />
            <Route path='/Faq' element={<FaqSection />} />
            <Route path='/Contact-support' element={<ContactSupport />} />






          </Routes>

        </Provider>


        {/* <WhatsAppFloat /> */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

      </HashRouter>
    </>
  )
}

export default App




 