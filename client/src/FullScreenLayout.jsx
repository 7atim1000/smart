// FullScreenLayout.jsx
import { Outlet } from 'react-router-dom';

const FullScreenLayout = () => {
    return (
        <div className="min-h-screen w-full">
            <Outlet />
        </div>
    );
};

export default FullScreenLayout;