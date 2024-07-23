import React from 'react';

const Offline = () => {
    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
            <h1 className="text-4xl font-bold mb-4">Internet Unstable</h1>
            <p className="mb-8">It seems like your internet connection is not stable. Please check your connection and try again.</p>
            <button
                onClick={handleReload}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
                Reload
            </button>
            <div className="mt-8">
                <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0l3 3-3 3V4a6 6 0 00-6 6H0l3 3-3 3h4z"></path>
                </svg>
            </div>
        </div>
    );
};

export default Offline;
