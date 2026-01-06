import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { createStartup, getSectors, getTags } from "../services/startups";
import { getMyProfile } from "../services/user";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { Rocket, Tag } from "lucide-react";

const CreateStartup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isFounder, setIsFounder] = useState(false);
  const [existingSectors, setExistingSectors] = useState([]);
  const [existingTags, setExistingTags] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sector: "SaaS",
    location: "",
    logo_url: "",
    founding_date: "",
    tags: "", // Store as string for input "AI, Tech, Data"
  });

  useEffect(() => {
    checkRole();
    fetchEnums();
  }, []);

  const checkRole = async () => {
    try {
      const profile = await getMyProfile();
      if (profile.roles && profile.roles.includes("founder")) {
        setIsFounder(true);
      }
    } catch (error) {
      console.log(error);
      toast.error("Please login first");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnums = async () => {
    try {
      const [sectorsRes, tagsRes] = await Promise.all([
        getSectors(),
        getTags(),
      ]);
      setExistingSectors(
        (sectorsRes || []).map((s) => (s && (s.name || s)) || s)
      );
      setExistingTags((tagsRes || []).map((t) => (t && (t.name || t)) || t));
    } catch (err) {
      console.error("Failed to load sectors/tags:", err);
    }
  };

  const handleBecomeFounder = async () => {
    try {
      await api.post("/user/role", { role: "founder" });
      toast.success("Account upgraded to Founder!");
      setIsFounder(true);
    } catch (error) {
      toast.error("Failed to upgrade role.");
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert comma-separated string to array
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
      };

      await createStartup(payload);
      toast.success("Startup launched successfully!");
      navigate("/profile");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create startup");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Checking eligibility...</div>;

  if (!isFounder) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center bg-white p-10 rounded-xl shadow-lg">
        <Rocket className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Ready to Launch?
        </h2>
        <p className="text-gray-600 mb-8">
          To publish a startup, you need to enable the <strong>Founder</strong>{" "}
          role. It's free and instant.
        </p>
        <button
          onClick={handleBecomeFounder}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition shadow-md"
        >
          Activate Founder Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Rocket className="w-6 h-6 mr-2 text-blue-600" /> Create New Startup
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Startup Name
          </label>
          <input
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            One-Liner / Description
          </label>
          <textarea
            required
            rows="3"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (Comma separated)
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. AI, Machine Learning, B2B"
              list="tag-options"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
            <datalist id="tag-options">
              {existingTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add keywords to help investors find you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <div className="relative">
              <input
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. SaaS, AI, BioTech..."
                list="sector-options" // Connects to the datalist below
                value={formData.sector}
                onChange={(e) =>
                  setFormData({ ...formData, sector: e.target.value })
                }
              />
              <datalist id="sector-options">
                {(existingSectors.length
                  ? existingSectors
                  : [
                      "SaaS",
                      "AI",
                      "FinTech",
                      "EdTech",
                      "Health",
                      "Hardware",
                      "E-commerce",
                    ]
                ).map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. San Francisco"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
              value={formData.logo_url}
              onChange={(e) =>
                setFormData({ ...formData, logo_url: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Founding Date
            </label>
            <input
              type="date"
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.founding_date}
              onChange={(e) =>
                setFormData({ ...formData, founding_date: e.target.value })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
        >
          Launch Startup
        </button>
      </form>
    </div>
  );
};

export default CreateStartup;
