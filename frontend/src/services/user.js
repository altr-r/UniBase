import api from "./api";

export const getMyProfile = async () => {
  const response = await api.get("/user/me");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put("/user/me", data);
  return response.data;
};


export { getMyPortfolio as getInvestorPortfolio } from "./investment";
