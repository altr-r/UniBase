import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllStartups, getSectors, getTags } from "../services/startups";
import { ArrowRight, Search, Tag } from "lucide-react";

const Home = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [existingSectors, setExistingSectors] = useState([]);
  const [existingTags, setExistingTags] = useState([]);

  // Search States
  const [filters, setFilters] = useState({
    name: "",
    sector: "",
    status: "",
    tags: "", // <--- Added Tag Filter
  });

  const fetchStartups = async (overrideFilters = null) => {
    setLoading(true);
    try {
      // Backend expects 'tags' as a string for partial match (e.g. "AI")
      const query = overrideFilters ?? filters;
      const data = await getAllStartups(query);
      setStartups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  useEffect(() => {
    fetchStartups();

    // Load dynamic sectors
    const loadEnums = async () => {
      try {
        const [sectors, tags] = await Promise.all([getSectors(), getTags()]);
        setExistingSectors(sectors || []);
        setExistingTags(tags || []);
      } catch (e) {
        console.error("Failed to load sectors/tags", e);
      }
    };
    loadEnums();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStartups();
  };

  return (
    <div>
      {/* Search & Filter Section */}
      <div className="bg-blue-600 text-white rounded-xl p-8 mb-10 shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Discover the Next Unicorn</h1>

        <form
          onSubmit={handleSearch}
          className="bg-white p-4 rounded-lg shadow-md max-w-5xl space-y-3"
        >
          {/* Top Row: Name & Tag Search */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow flex items-center bg-gray-50 rounded-md px-3 border border-gray-200">
              <Search className="text-gray-400 w-5 h-5 mr-2" />
              <input
                type="text"
                placeholder="Search by startup name..."
                className="bg-transparent w-full py-2 outline-none text-gray-700 placeholder-gray-400"
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
              />
            </div>

            <div className="flex-grow md:w-1/3 flex items-center bg-gray-50 rounded-md px-3 border border-gray-200">
              <Tag className="text-gray-400 w-5 h-5 mr-2" />
              <input
                type="text"
                placeholder="Filter by tag (e.g. AI)"
                className="bg-transparent w-full py-2 outline-none text-gray-700 placeholder-gray-400"
                value={filters.tags}
                onChange={(e) =>
                  setFilters({ ...filters, tags: e.target.value })
                }
                list="tag-options"
              />
              <datalist id="tag-options">
                {existingTags.map((t) => (
                  <option key={t} value={t} />
                ))}
                {existingTags.length === 0 && (
                  <>
                    <option value="AI" />
                    <option value="B2B" />
                    <option value="Marketplace" />
                  </>
                )}
              </datalist>
            </div>
          </div>

          {/* Bottom Row: Sector, Status & Button */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Dynamic Sector Input */}
            <div className="flex-grow relative">
              <input
                className="w-full bg-gray-50 text-gray-700 rounded-md px-4 py-2 outline-none border border-gray-200"
                placeholder="Sector (e.g. SaaS)"
                list="sector-options"
                value={filters.sector}
                onChange={(e) =>
                  setFilters({ ...filters, sector: e.target.value })
                }
              />

              {/* 3. Render Dynamic Options */}
              <datalist id="sector-options">
                {existingSectors.map((sect) => (
                  <option key={sect} value={sect} />
                ))}
                {/* You can still keep these "Popular" defaults if the DB is empty */}
                {existingSectors.length === 0 && (
                  <>
                    <option value="SaaS" />
                    <option value="AI" />
                    <option value="FinTech" />
                  </>
                )}
              </datalist>
            </div>

            <select
              className="bg-gray-50 text-gray-700 rounded-md px-4 py-2 outline-none border border-gray-200"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Acquired">Acquired</option>
              <option value="Closed">Closed</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-bold transition md:w-auto w-full"
            >
              Search Results
            </button>
          </div>
        </form>
      </div>

      {/* Startup Grid */}
      {loading ? (
        <div className="text-center p-10 text-gray-500">
          Scanning ecosystem...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500 text-lg">
                No startups match your specific criteria.
              </p>
              <button
                onClick={() => {
                  const newFilters = {
                    name: "",
                    sector: "",
                    status: "",
                    tags: "",
                  };
                  setFilters(newFilters);
                  fetchStartups(newFilters); // immediately refresh results
                }}
                className="mt-2 text-blue-600 font-medium hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            startups.map((startup) => (
              <div
                key={startup.startup_id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition duration-200 p-5 flex flex-col h-full group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-3 overflow-hidden border border-gray-200">
                      {startup.logo_url ? (
                        <img
                          src={startup.logo_url}
                          alt={startup.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-400">
                          {startup.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">
                        {startup.name}
                      </h3>
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium border border-blue-100">
                        {startup.sector}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
                  {startup.description}
                </p>

                {/* Tags Display (Optional Polish) */}
                {startup.tags && startup.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {startup.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <Link
                    to={`/startup/${startup.startup_id}`}
                    className="w-full flex items-center justify-center text-blue-600 font-medium hover:bg-blue-50 py-2 rounded-lg transition"
                  >
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
