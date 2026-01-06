import api from "./api";

export const getMyProfile = async () => {
  const response = await api.get("/user/me");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put("/user/me", data);
  return response.data;
};

// Also reuse the portfolio service we made earlier for investors
export { getMyPortfolio as getInvestorPortfolio } from "./investment";
