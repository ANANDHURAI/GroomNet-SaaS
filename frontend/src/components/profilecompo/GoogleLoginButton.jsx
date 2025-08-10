
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../../slices/auth/LoginSlice';
import { useNavigate } from 'react-router-dom';


const GoogleLoginButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleLogin = async (response) => {
    const { credential: access_token } = response;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/google-login/`,
        { access_token },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { access, refresh, user } = res.data;
      dispatch(login({ user, access, refresh }));

      if (user.user_type === 'customer') {
        navigate('/home');
      } else if (user.user_type === 'barber') {
        sessionStorage.setItem('barber_id', user.id);

        if (user.is_active && user.is_verified) {
          navigate('/barber-dash');
        } else {
          navigate('/barber-status');
        }
      }
    } catch (err) {
      console.error('Google Login failed:', err.response?.data || err.message);
      alert('Google login failed!');
    }
  };

  return (
    <div className="mt-4">
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => alert('Google Login Failed')}
      />
    </div>
  );
};

export default GoogleLoginButton;
