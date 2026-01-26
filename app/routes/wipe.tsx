import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);

    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading]);

    const handleDelete = async () => {
        files.forEach(async (file) => {
            await fs.delete(file.path);
        });
        await kv.flush();
        loadFiles();
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error {error}</div>;
    }

    console.log(files)

    return (
        <div className="p-6 bg-[#EEF2FF] w-full h-screen flex flex-col items-start justify-items-start">
            <Link to='/' className='back-button mb-4'>
            <img src="/icons/back.svg" alt="back-button" className='w-2.5 h-2.5' />
            <span className='text-gray-800 text-sm font-semibold'>Back to homepage</span>
            </Link>
            Authenticated as: {auth.user?.username}
            <div className="text-2xl font-bold mb-4">Existing files:</div>
            <div className="flex flex-col gap-4 mb-4">
                {files.map((file) => (
                    <div key={file.id} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>
            <div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                    onClick={() => handleDelete()}
                >
                    Wipe App Data
                </button>
            </div>
        </div>
    );
};

export default WipeApp;