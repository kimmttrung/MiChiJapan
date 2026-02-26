// app/events/components/Pagination.tsx

export default function Pagination({ page, totalPages, setPage }: any) {
    return (
        <div className="flex justify-center mt-12 space-x-2">
            {Array.from({ length: totalPages }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-full border transition ${page === i + 1
                            ? "bg-red-600 text-white"
                            : "hover:bg-red-600 hover:text-white"
                        }`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    )
}