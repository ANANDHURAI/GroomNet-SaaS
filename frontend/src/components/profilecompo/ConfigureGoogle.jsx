import GoogleSignInButton from "./GoogleSignInButton";
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_AUTH_CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID;
const API_URL = process.env.API_URL;

<GoogleOAuthProvider clientId={GOOGLE_AUTH_CLIENT_ID}>
    <GoogleSignInButton
        handleGoogleSignIn={handleGoogleSignIn}
    />
</GoogleOAuthProvider>

const handleGoogleSignIn = async (response) => {
    try{
        const { data } = await axios.post(
            `${API_URL}/auth/google-login/`,
            {
                token: response.access_token
            },
        )
      
    }
    catch (e) {
      console.log(error)
    }
}