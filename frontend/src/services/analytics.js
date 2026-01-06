import api from "./api";

// Get Top 5 Startups by Funding
export const getLeaderboard = async () => {
  const response = await api.get("/analytics/leaderboard");
  return response.data;
};

// Get aggregated stats for a specific startup (Optional usage)
export const getStartupAnalytics = async (startupId) => {
  const response = await api.get(`/analytics/${startupId}`);
  return response.data;
};
