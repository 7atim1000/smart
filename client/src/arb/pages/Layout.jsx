// import SidebarArb from '../components/shared/SidebarArb';
// import { Outlet } from 'react-router-dom';
// const ArbLayout = () => {
//     return(
//         <div className='flex flex-col' dir="rtl"> {/* Add dir="rtl" here */}
//             <div className='flex'>
//                 <SidebarArb isRTL={true} />
//                 <Outlet />
//             </div>
//         </div>
//     );
// }
// export default ArbLayout;

import SidebarArb from '../components/shared/SidebarArb';
import { Outlet, useLocation } from 'react-router-dom';

const ArbLayout = () => {
    const location = useLocation();
    
    // Define routes that should be full screen (no sidebar)
    const fullScreenRoutes = ['/ar/sales', '/ar/purchases'];
    const isFullScreen = fullScreenRoutes.includes(location.pathname);
    
    if (isFullScreen) {
        // Return only the content without sidebar for full screen
        return (
            <div className='min-h-screen w-full' dir="rtl">
                <Outlet />
            </div>
        );
    }
    
    // Return normal layout with sidebar
    return(
        <div className='flex flex-col' dir="rtl">
            <div className='flex'>
                <SidebarArb isRTL={true} />
                <Outlet />
            </div>
        </div>
    );
}

export default ArbLayout;