
import axios from "axios";

const getPayPalAccessToken = async () => {
  const response = await axios.post(
    `${process.env.PAYPAL_API_BASE}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

export default getPayPalAccessToken;
