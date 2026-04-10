import Sidebar from '../components/shared/SidebarEng';
import { Outlet, useLocation } from 'react-router-dom';

const EngLayout = () => {
    const location = useLocation();
    
    // Define routes that should be full screen (no sidebar)
    const fullScreenRoutes = ['/en/sales', '/en/purchases']; // Add more routes as needed
    const isFullScreen = fullScreenRoutes.includes(location.pathname);
    
    if (isFullScreen) {
        // Return only the content without sidebar
        return (
            <div className="min-h-screen w-full">
                <Outlet />
            </div>
        );
    }
    
    // Return normal layout with sidebar
    return(
        <div className='flex flex-col'>
            <div className='flex'>
                <Sidebar isRTL={false} />
                <Outlet />
            </div>
        </div>
    );
}

export default EngLayout;


// import Sidebar from '../components/shared/SidebarEng'; // Make sure this path is correct
// import { Outlet } from 'react-router-dom';

// const EngLayout = () => {
//     return(
//         <div className='flex flex-col'>
//             <div className='flex'>
//                 <Sidebar isRTL={false} />
//                 <Outlet />
//             </div>
//         </div>
//     );
// }

// export default EngLayout;