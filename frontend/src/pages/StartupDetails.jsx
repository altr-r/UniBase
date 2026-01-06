import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getStartupById } from "../services/startups";
import { getFundingHistory } from "../services/funding";
import {
  getComments,
  addComment,
  getRatings,
  addRating,
  toggleFavorite,
  getFavoriteCount,
} from "../services/community";
import { makeInvestment } from "../services/investment";
import { getStartupAnalytics } from "../services/analytics";
import { toast } from "react-hot-toast";
import {
  MapPin,
  User,
  Tag,
  DollarSign,
  MessageSquare,
  Star,
  Heart,
  Edit,
  TrendingUp,
  X,
  BarChart3, // <--- Added Close Icon
} from "lucide-react";

const StartupDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // State for Data
  const [startup, setStartup] = useState(null);
  const [funding, setFunding] = useState([]);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [analytics, setAnalytics] = useState(null);

  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // MODAL STATE
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [investAmount, setInvestAmount] = useState("");
  const [investEquity, setInvestEquity] = useState("");

  // Form State
  const [commentText, setCommentText] = useState("");
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [startupRes, fundingRes, commentsRes, ratingsRes, favCountRes] =
          await Promise.all([
            getStartupById(id),
            getFundingHistory(id),
            getComments(id),
            getRatings(id),
            getFavoriteCount(id),
          ]);

        setStartup(startupRes);
        setIsFavorite(!!startupRes?.is_favorited);
        setFunding(fundingRes);
        setComments(commentsRes);
        setRatings(ratingsRes);
        setFavCount(favCountRes);

        if (user) {
          const profileRes = await api.get("/user/me");
          setUserRoles(profileRes.data.roles || []);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load startup details");
      } finally {
        setLoading(false);
      }

      try {
        const analyticsData = await getStartupAnalytics(id);
        setAnalytics(analyticsData);
      } catch (e) {
        console.log(e);
        console.log("No analytics data");
      }
    };
    fetchData();
  }, [id, user]);

  // --- NEW: HANDLERS FOR MODAL ---
  const openInvestModal = (round) => {
    setSelectedRound(round);
    setInvestAmount("");
    setInvestEquity("");
    setShowInvestModal(true);
  };

  const handleInvestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRound) return;

    if (!investAmount || Number(investAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Prevent negative equity (extra safeguard)
    if (investEquity !== "" && Number(investEquity) < 0) {
      toast.error("Equity cannot be negative");
      return;
    }
    try {
      await makeInvestment(
        id,
        selectedRound.round_seq,
        investAmount,
        investEquity // Sending Equity to Backend
      );

      toast.success(`Successfully invested $${investAmount}!`);
      setShowInvestModal(false); // Close Modal

      // Refresh funding data
      const updatedFunding = await getFundingHistory(id);
      setFunding(updatedFunding);
    } catch (error) {
      toast.error(error.response?.data?.error || "Investment failed");
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    try {
      await addComment(id, commentText);
      toast.success("Comment added");
      setCommentText("");
      const updatedComments = await getComments(id);
      setComments(updatedComments);
    } catch (error) {
      console.log(error);
      toast.error("Failed to post comment");
    }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    try {
      await addRating(id, ratingScore, ratingFeedback);
      toast.success("Rating submitted");
      const updatedRatings = await getRatings(id);
      setRatings(updatedRatings);
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit rating");
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Log in to favorite startups");
      return;
    }
    try {
      const res = await toggleFavorite(id);
      toast.success(res.message);
      setIsFavorite(res.is_favorited);
      setFavCount((prev) => (res.is_favorited ? prev + 1 : prev - 1));
    } catch (error) {
      console.log(error);
      toast.error("Could not update favorite");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading Details...</div>;
  if (!startup)
    return (
      <div className="p-10 text-center text-red-500">Startup not found</div>
    );

  const isInvestor = userRoles.includes("investor");
  const statusKey = (startup.status || "").toLowerCase();
  const prettyStatus =
    startup.status?.charAt(0).toUpperCase() + (startup.status?.slice(1) || "");
  const isOwner =
    user &&
    startup.founders &&
    startup.founders.some((f) => f.user_id === user.user_id);

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6 flex items-center justify-between border border-gray-100">
        <div className="flex items-center">
          <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center mr-6 overflow-hidden">
            {startup.logo_url ? (
              <img
                src={startup.logo_url}
                className="w-full h-full object-cover"
                alt={startup.name}
              />
            ) : (
              <span className="text-3xl font-bold text-gray-400">
                {startup.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{startup.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-gray-600">
              <span className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-1" /> {startup.location}
              </span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                {startup.sector}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-bold ${
                  statusKey === "active"
                    ? "bg-green-100 text-green-700"
                    : statusKey === "closed"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {prettyStatus || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ml-4 flex items-center space-x-3">
          {isOwner && (
            <>
              <Link
                to={`/startup/${id}/new-round`}
                className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition shadow-sm text-sm font-medium"
              >
                <TrendingUp className="w-4 h-4 mr-1" /> Raise Funds
              </Link>
              <Link
                to={`/startup/${id}/edit`}
                className="p-3 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition border border-gray-200"
                title="Edit Startup"
              >
                <Edit className="w-6 h-6" />
              </Link>
            </>
          )}
          {user && (
            <button
              onClick={handleToggleFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`p-2 rounded-lg transition flex items-center justify-center ${
                isFavorite
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs text-gray-500 font-medium mt-1">
                {favCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-200 p-1 rounded-lg w-fit">
        {["overview", "funding", "community"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-md font-medium capitalize transition ${
              activeTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {analytics && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                  <p className="text-xs text-blue-600 uppercase font-bold">
                    Total Raised
                  </p>
                  <p className="text-xl font-bold text-gray-800">
                    ${Number(analytics.funding).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                  <p className="text-xs text-green-600 uppercase font-bold">
                    Avg Rating
                  </p>
                  <p className="text-xl font-bold text-gray-800">
                    {Number(analytics.ratings.average).toFixed(1)}/10.0
                  </p>
                </div>
              </div>
            )}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">
                {startup.description}
              </p>
            </section>
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Founders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {startup.founders?.map((f) => (
                  <div
                    key={f.user_id}
                    className="flex items-center p-3 border rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{f.name}</p>
                      <p className="text-sm text-gray-500">{f.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {startup.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3 mr-1" /> {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* --- FUNDING TAB --- */}
        {activeTab === "funding" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Funding Rounds</h3>
            {funding.length === 0 ? (
              <p className="text-gray-500">No funding rounds yet.</p>
            ) : (
              <div className="grid gap-6">
                {funding.map((round) => (
                  <div
                    key={round.round_seq}
                    className="border rounded-lg p-5 hover:border-blue-200 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold">{round.label}</h4>
                        <p className="text-gray-500 text-sm">
                          {new Date(round.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          ${Number(round.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Target
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            (round.raised_amount / round.amount) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>
                        Raised: $
                        {Number(round.raised_amount || 0).toLocaleString()}
                      </span>
                      <span>{round.investor_count} Investors</span>
                    </div>

                    {/* REPLACED INLINE INPUTS WITH BUTTON */}
                    {isInvestor && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => openInvestModal(round)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium flex items-center shadow-sm"
                        >
                          <DollarSign className="w-4 h-4 mr-1" /> Invest in this
                          Round
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- COMMUNITY TAB --- */}
        {activeTab === "community" && (
          /* ... (No changes here, keeping existing community code) ... */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" /> Comments
              </h3>
              {user && (
                <form onSubmit={handlePostComment} className="mb-6">
                  <textarea
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="2"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Post
                  </button>
                </form>
              )}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.comment_id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold text-sm mr-2">
                        {c.user_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" /> Ratings
              </h3>
              {user && (
                <form
                  onSubmit={handleRate}
                  className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100"
                >
                  <label className="block text-sm font-bold text-yellow-800 mb-2">
                    Rate this Startup
                  </label>
                  <div className="flex gap-4 mb-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={ratingScore}
                      onChange={(e) => setRatingScore(e.target.value)}
                      className="w-16 p-2 border rounded-md text-center"
                    />
                    <input
                      type="text"
                      placeholder="Feedback (Optional)"
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value)}
                      className="flex-grow p-2 border rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                  >
                    Submit Rating
                  </button>
                </form>
              )}
              <div className="space-y-3">
                {ratings.map((r, idx) => (
                  <div key={idx} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{r.user_name}</span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                        {r.score}/10
                      </span>
                    </div>
                    {r.feedback && (
                      <p className="text-gray-600 text-sm italic">
                        "{r.feedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- INVESTMENT MODAL (NEW) --- */}
      {showInvestModal && selectedRound && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowInvestModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Invest in {startup.name}
            </h3>
            <div className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-100">
              <p className="text-sm text-blue-800 font-semibold">
                Round: {selectedRound.label}
              </p>
              <p className="text-xs text-blue-600">
                Target: ${Number(selectedRound.amount).toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleInvestSubmit} className="space-y-5">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Amount ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Equity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equity Share (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max="100"
                  placeholder="e.g. 5.0"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition"
                  value={investEquity}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") {
                      setInvestEquity("");
                      return;
                    }
                    const n = parseFloat(v);
                    if (Number.isNaN(n)) return;
                    // Clamp negatives to 0
                    if (n < 0) setInvestEquity("0");
                    else setInvestEquity(String(n));
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty for 0%.
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowInvestModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 transition shadow-md"
                >
                  Confirm Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupDetails;
