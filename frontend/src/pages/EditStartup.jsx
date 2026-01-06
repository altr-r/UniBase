import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getStartupById,
  updateStartup,
  deleteStartup,
} from "../services/startups"; // <--- Added deleteStartup
import { toast } from "react-hot-toast";
import { Edit, Save, ArrowLeft, Tag, Trash2 } from "lucide-react"; // <--- Added Trash2

const EditStartup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sector: "",
    location: "",
    logo_url: "",
    status: "Active",
    tags: "",
  });

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const data = await getStartupById(id);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          sector: data.sector || "",
          location: data.location || "",
          logo_url: data.logo_url || "",
          status: data.status || "Active",
          tags: data.tags ? data.tags.join(", ") : "",
        });
      } catch (error) {
        console.log(error);
        toast.error("Failed to load startup data");
        navigate(`/startup/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStartup();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
      };

      await updateStartup(id, payload);
      toast.success("Startup updated successfully!");
      navigate(`/startup/${id}`);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("You are not authorized to edit this startup.");
      } else {
        toast.error(error.response?.data?.error || "Update failed");
      }
    }
  };

  // --- NEW DELETE HANDLER ---
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this startup? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteStartup(id);
      toast.success("Startup deleted successfully.");
      navigate("/profile"); // Send them back to their profile
    } catch (error) {
      toast.error(error.response?.data?.error || "Delete failed");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Data...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Edit className="w-6 h-6 mr-2 text-blue-600" /> Edit Startup
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
            Description
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
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <div className="relative">
              <input
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. SaaS"
                list="sector-options"
                value={formData.sector}
                onChange={(e) =>
                  setFormData({ ...formData, sector: e.target.value })
                }
              />
              <datalist id="sector-options">
                <option value="SaaS" />
                <option value="AI" />
                <option value="FinTech" />
                <option value="EdTech" />
                <option value="Health" />
                <option value="Hardware" />
              </datalist>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
              value={formData.logo_url}
              onChange={(e) =>
                setFormData({ ...formData, logo_url: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="Active">Active</option>
              <option value="Acquired">Acquired</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center"
        >
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </button>
      </form>

      {/* --- DANGER ZONE --- */}
      <div className="mt-10 pt-6 border-t border-red-100">
        <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete a startup, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDelete}
          className="w-full border border-red-500 text-red-600 hover:bg-red-50 font-bold py-3 rounded-lg transition flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete Startup
        </button>
      </div>
    </div>
  );
};

export default EditStartup;
