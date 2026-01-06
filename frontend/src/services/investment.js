import api from "./api";

export const makeInvestment = async (startupId, roundSeq, amount, equity) => {
  const response = await api.post("/invests", {
    startup_id: startupId,
    round_seq: roundSeq,
    amount,
    equity,
  });
  return response.data;
};

export const getMyPortfolio = async () => {
  const response = await api.get("/invests/me");
  return response.data;
};
