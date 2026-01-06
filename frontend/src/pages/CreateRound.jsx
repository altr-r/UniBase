import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { openFundingRound } from "../services/funding";
import { getStartupById } from "../services/startups";
import { toast } from "react-hot-toast";
import { ArrowLeft, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CreateRound = () => {
  const { id } = useParams(); // startup_id
  const navigate = useNavigate();
  const { user } = useAuth();

  const [startupName, setStartupName] = useState("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    round_name: "Seed",
    target_amount: "",
    round_date: new Date().toISOString().split("T")[0], // Default to today
  });

  // Verify ownership and get name
  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const data = await getStartupById(id);

        // Simple client-side check (Backend also enforces this)
        const isFounder = data.founders.some(
          (f) => f.user_id === user?.user_id
        );
        if (!isFounder) {
          toast.error("Authorized founders only.");
          navigate("/");
          return;
        }

        setStartupName(data.name);
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error("Startup not found");
        navigate("/profile");
      }
    };
    fetchStartup();
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await openFundingRound({
        startup_id: id,

        amount: formData.target_amount,
        label: formData.round_name,
        date: formData.round_date,
      });

      toast.success(`${formData.round_name} Round Opened!`);
      navigate(`/startup/${id}`);
    } catch (error) {
      console.error(error); // Helpful for debugging
      toast.error(error.response?.data?.message || "Failed to open round");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Verifying credentials...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Startup
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-green-600" /> Open Funding
          Round
        </h2>
        <p className="text-gray-500 mt-1">
          Raising capital for{" "}
          <span className="font-bold text-gray-700">{startupName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Round Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Round Stage
          </label>
          <select
            className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-green-500 outline-none"
            value={formData.round_name}
            onChange={(e) =>
              setFormData({ ...formData, round_name: e.target.value })
            }
          >
            <option value="Pre-Seed">Pre-Seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Series C">Series C</option>
            <option value="IPO">IPO</option>
          </select>
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Amount ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="number"
              required
              min="1"
              placeholder="1000000"
              className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.target_amount}
              onChange={(e) =>
                setFormData({ ...formData, target_amount: e.target.value })
              }
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            How much are you looking to raise?
          </p>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opening Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="date"
              required
              className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.round_date}
              onChange={(e) =>
                setFormData({ ...formData, round_date: e.target.value })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition shadow-md"
        >
          Launch Round
        </button>
      </form>
    </div>
  );
};

export default CreateRound;
