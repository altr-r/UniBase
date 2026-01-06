import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyStartups } from "../services/startups";
import {
  getMyProfile,
  updateProfile,
  getInvestorPortfolio,
} from "../services/user";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [myStartups, setMyStartups] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ensure phones is always an array to avoid crashes
  const [formData, setFormData] = useState({
    bio: "",
    photo_url: "",
    location: "",
    website: "",
    phones: [""],
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
      setFormData({
        bio: data?.profile?.bio || "",
        photo_url: data?.profile?.photo_url || "",
        location: data?.profile?.location || "",
        website: data?.profile?.website || "",
        phones: data?.profile?.phones?.length ? data.profile.phones : [""],
      });

      if (data?.roles?.includes("investor")) {
        const portfolioData = await getInvestorPortfolio();
        setPortfolio(portfolioData || []);
      }
      if (data?.roles?.includes("founder")) {
        const startupsData = await getMyStartups();
        setMyStartups(startupsData || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const cleanData = {
        ...formData,
        phones: (formData.phones || []).filter((p) => p.trim() !== ""),
      };

      await updateProfile(cleanData);
      toast.success("Profile updated!");
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  const handlePhoneChange = (index, value) => {
    const phones = formData.phones || [];
    const newPhones = [...phones];
    newPhones[index] = value;
    setFormData({ ...formData, phones: newPhones });
  };

  const addPhoneField = () => {
    setFormData({ ...formData, phones: [...(formData.phones || []), ""] });
  };

  const removePhoneField = (index) => {
    const newPhones = (formData.phones || []).filter((_, i) => i !== index);
    setFormData({ ...formData, phones: newPhones });
  };

  if (loading)
    return <div className="p-10 text-center">Loading Profile...</div>;
  if (!profile)
    return <div className="p-10 text-center">Profile not found.</div>;

  const isFounder = profile.roles?.includes("founder");
  const isInvestor = profile.roles?.includes("investor");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 h-32 relative">
          <div className="absolute top-4 right-4 flex items-center gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-2 rounded-lg backdrop-blur-sm flex items-center transition"
                title="Cancel Editing"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center transition"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="relative -top-12 mb-[-30px]">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              {profile?.profile?.photo_url ? (
                <img
                  src={profile.profile.photo_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-500 flex items-center text-sm mt-1">
              <Mail className="w-3 h-3 mr-1" /> {profile.email}
              <span className="mx-2">•</span>
              <span className="capitalize bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">
                {(profile.roles || []).join(", ")}
              </span>
            </p>
          </div>

          <hr className="my-6 border-gray-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Bio</h3>
              {isEditing ? (
                <textarea
                  className="w-full border rounded-lg p-3 text-sm"
                  rows="4"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {profile?.profile?.bio || "No bio added yet."}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {isInvestor && (
                <>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Location</h3>
                    {isEditing ? (
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    ) : (
                      <p className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />{" "}
                        {profile?.profile?.location || "N/A"}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Website</h3>
                    {isEditing ? (
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                      />
                    ) : (
                      <p className="flex items-center text-blue-600">
                        <Globe className="w-4 h-4 mr-2" />{" "}
                        {profile?.profile?.website || "N/A"}
                      </p>
                    )}
                  </div>
                </>
              )}

              {isFounder && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">
                    Contact Numbers
                  </h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      {(formData.phones || []).map((phone, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            className="flex-grow border rounded px-3 py-2"
                            placeholder="+1 555..."
                            value={phone}
                            onChange={(e) =>
                              handlePhoneChange(idx, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removePhoneField(idx)}
                            className="text-red-500 p-2 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addPhoneField}
                        className="text-sm text-blue-600 flex items-center font-medium mt-2"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Phone
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {profile?.profile?.phones &&
                      profile.profile.phones.length > 0 ? (
                        profile.profile.phones.map((p, i) => (
                          <p
                            key={i}
                            className="flex items-center text-gray-600"
                          >
                            <Phone className="w-4 h-4 mr-2" /> {p}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-400 italic">
                          No phone numbers added.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFounder && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-blue-600" /> My Startups
            </h2>
            <Link
              to="/create-startup"
              className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 font-medium transition"
            >
              + Create New
            </Link>
          </div>

          {myStartups.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-2">
                You haven't created any startups yet.
              </p>
              <Link
                to="/create-startup"
                className="text-blue-600 font-bold hover:underline"
              >
                Launch your first startup
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {myStartups.map((startup) => (
                <div
                  key={startup.startup_id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center mr-4 text-gray-500 font-bold text-lg overflow-hidden">
                      {startup.logo_url ? (
                        <img
                          src={startup.logo_url}
                          alt={startup.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        startup.name?.[0] || "?"
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {startup.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {startup.sector} • {startup.status}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/startup/${startup.startup_id}`}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isInvestor && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-blue-600" /> Investment
            Portfolio
          </h2>

          {portfolio.length === 0 ? (
            <p className="text-gray-500">
              You haven't made any investments yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-sm">
                    <th className="pb-3 font-medium">Startup</th>
                    <th className="pb-3 font-medium">Round</th>
                    <th className="pb-3 font-medium text-right pr-6">
                      Invested
                    </th>
                    <th className="pb-3 font-medium text-center">Equity</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {portfolio.map((inv, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50 transition">
                      <td className="py-4 font-medium text-gray-800">
                        {inv.startup_name}
                      </td>
                      <td className="py-4 text-gray-600">{inv.round_label}</td>
                      <td className="py-4 text-right font-bold text-green-600">
                        ${Number(inv.amount).toLocaleString()}
                      </td>
                      {/* add right padding to match header spacing */}
                      <td className="hidden" />
                      <td className="py-4 text-center">
                        {/* Equity column */}
                        {inv.equity_share != null &&
                        Number(inv.equity_share) > 0
                          ? `${Number(inv.equity_share)}%`
                          : "-"}
                      </td>
                      <td className="py-4 text-center">
                        {/* Status column */}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            inv.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
