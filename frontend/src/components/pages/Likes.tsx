import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layout/DashboardLayout";
import { useCreatorStore } from "../../store/creatorStore";
import type { Creator } from "../../store/creatorStore";

export const Likes = () => {
  const navigate = useNavigate();
  const { likedCreators, removeLike } = useCreatorStore();

  return (
    <DashboardLayout>
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Liked Creators
            </h2>
            <p className="text-gray-500">
              {likedCreators.length}{" "}
              {likedCreators.length === 1 ? "Creator" : "Creators"}
            </p>
          </div>

          {likedCreators.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No liked creators
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start liking creators to see them here.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Browse Creators
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedCreators.map((creator: Creator) => (
                <div
                  key={creator.id}
                  className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
                  onClick={() => navigate(`/creator/${creator.username}`)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLike(creator.id);
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};
