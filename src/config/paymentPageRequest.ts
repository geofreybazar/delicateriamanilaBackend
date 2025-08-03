import axios from "axios";
import config from "./config";

const PAYMONGO_SECRET_KEY_TEST_BASE64 = config.PAYMONGO_SECRET_KEY_TEST_BASE64;

const axiosConfig = {
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
    authorization: `Basic ${PAYMONGO_SECRET_KEY_TEST_BASE64}`,
  },
};

export const paymentPageRequest = async (paymentDetails: any) => {
  const response = await axios.post(
    `https://api.paymongo.com/v1/checkout_sessions`,
    paymentDetails,
    axiosConfig
  );

  return response.data;
};
