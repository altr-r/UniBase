import api from "./api";

export const getFundingHistory = async (startupId) => {
  const response = await api.get(`/funding-rounds/${startupId}`);
  return response.data;
};

// For Founders only
export const openFundingRound = async (data) => {
  const response = await api.post("/funding-rounds", data);
  return response.data;
};
