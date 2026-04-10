import React, { useState, useEffect, useContext } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { SidebarMenuArb } from '../../../assets/assets';
import { FaBackwardStep, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FaSignInAlt, FaSignOutAlt, FaLanguage } from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { AuthContext } from '../../../../context/AuthContext';

const SidebarArb = ({ isRTL = true }) => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Initialize expanded state
  useEffect(() => {
    const initialExpandedState = {};
    SidebarMenuArb.forEach((menu) => {
      if (menu.subItems && menu.subItems.length > 0) {
        initialExpandedState[menu.name] = false;
      }
    });
    setExpandedMenus(initialExpandedState);
  }, []);

  const toggleSubMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubItemActive = (subItems) => {
    if (!subItems) return false;
    return subItems.some(subItem => location.pathname === subItem.path);
  };

  const isMenuActive = (menu) => {
    return isActive(menu.path || '') || isSubItemActive(menu.subItems);
  };

  const handleLanguageSwitch = () => {
    navigate('/en');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return 'أ';
    // For Arabic names, take first character
    return user.name.charAt(0);
  };

  // Get user display name
  const getUserName = () => {
    if (!user || !user.fullName) return 'مدير النظام';
    return user.fullName;
  };

  // Get user role display in Arabic
  const getUserRole = () => {
    if (!user) return 'مدير';
    
    if (user.role) {
      return user.role === 'admin' ? 'مدير' : 
             user.role === 'user' ? 'مستخدم' : 
             user.role;
    }
    
    return 'مدير';
  };

  // RTL Classes - CORRECTED FOR RTL
  const borderSide = isRTL ? 'border-l-5' : 'border-r'; // For RTL, border on left side
  const marginSide = isRTL ? 'ml-3' : 'mr-3'; // For RTL, margin left
  const arrowIcon = isRTL ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />;
  const doubleArrowIcon = isRTL ? <MdKeyboardDoubleArrowLeft className='inline' /> : <MdKeyboardDoubleArrowRight className='inline' />;
  const activeBarPosition = isRTL ? 'left-0' : 'right-0'; // Active bar on LEFT for RTL
  const subMenuBorderSide = isRTL ? 'border-l-2' : 'border-r-2'; // Submenu border on LEFT for RTL
  const subMenuMargin = isRTL ? 'ml-6' : 'mr-6'; // Submenu margin left for RTL
  const subMenuPadding = isRTL ? 'pl-3' : 'pr-3'; // Submenu padding left for RTL
  const arrowPosition = isRTL ? 'mr-auto' : 'ml-auto'; // Arrow position for RTL

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-0 relative md:flex flex-col pt-2 max-w-13 md:max-w-75 w-full bg-white min-h-screen shadow-xl`}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-blue-300 bg-white shadow-lg/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">ERP</span>
            </div>
            <span className='text-blue-700 font-bold text-xl tracking-tight'>
              {isRTL ? 'نظام ERP' : 'ERP System'}
            </span>
          </div>
          
          {/* Language Switch Button */}
          <button
            onClick={handleLanguageSwitch}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-green-100 text-green-600 rounded-lg transition-all duration-200 border border-blue-200 shadow-sm"
            title="English"
          >
            <FaLanguage size={18} />
            <span className="text-sm font-medium">EN</span>
          </button>
        </div>
      </div>

      <div className='w-full flex-1 py-4 overflow-y-auto shadow-lg/30'>
        {SidebarMenuArb.map((link, index) => {
          const hasSubItems = link.subItems && link.subItems.length > 0;
          const isMenuActiveState = isMenuActive(link);
          const isExpanded = expandedMenus[link.name] || false;
          
          const IconComponent = isMenuActiveState ? link.icon : (link.iconUncolored || link.icon);
          
          return (
            <div key={index} className='mb-1 px-3'>
              {/* Main Menu Item - text-lg */}
              <div
                className={`relative flex items-center w-full py-3.5 px-4 rounded-lg cursor-pointer transition-all duration-200 border-l-4 ${
                  isMenuActiveState 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                    : 'border-transparent bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                }`}
                onClick={() => {
                  if (hasSubItems) {
                    toggleSubMenu(link.name);
                  } else {
                    navigate(link.path || '#');
                  }
                }}
              >
                <div className={`flex items-center gap-3 flex-1`}>
                  <IconComponent 
                    className={isMenuActiveState ? 'text-blue-600' : 'text-blue-500'} 
                    size={22}
                  />
                  <span className='max-md:hidden text-lg font-medium'>{link.name}</span>
                </div>
                
                {hasSubItems && (
                  <span className={`text-blue-400 ${arrowPosition}`}>
                    {isExpanded ? <FaChevronDown size={16} /> : arrowIcon}
                  </span>
                )}
                
                {isMenuActiveState && (
                  <div className={`absolute ${activeBarPosition} top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-full`}></div>
                )}
              </div>

              {/* Submenu Items - text-md with left border blue */}
              {hasSubItems && isExpanded && (
                <div className={`${subMenuMargin} mt-1`}>
                  {link.subItems?.map((subItem, subIndex) => {
                    const isSubActive = isActive(subItem.path);
                    const SubIconComponent = subItem.icon;
                    
                    return (
                      <NavLink
                        key={subIndex}
                        to={subItem.path}
                        className={({ isActive: navActive }) => 
                          `flex items-center gap-3 w-full py-2.5 px-4 my-1 rounded-lg transition-all duration-150 border-l-2 ${
                            navActive || isSubActive 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-blue-200 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-400'
                          }`
                        }
                      >
                        {SubIconComponent && (
                          <SubIconComponent 
                            className={isSubActive ? 'text-blue-600' : 'text-blue-400'} 
                            size={18}
                          />
                        )}
                        <span className='max-md:hidden text-md font-medium'>{subItem.name}</span>
                        
                        {isSubActive && (
                          <div className={`${isRTL ? 'ml-auto' : 'mr-auto'} w-1.5 h-5 bg-blue-500 rounded-full`}></div>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile with Dynamic User Info */}
      <div className="mt-auto p-5 border-t border-blue-300 bg-white shadow-lg/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
              {getUserInitials()}
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700 font-semibold text-base">
                {getUserName()}
              </span>
              <span className="text-blue-500 text-sm">
                {getUserRole()}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            title={isRTL ? 'تسجيل خروج' : 'Logout'}
          >
            <RiLogoutCircleRLine className='text-white' size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarArb;


// import React, { useState, useEffect } from 'react';
// import { useLocation, NavLink, useNavigate } from 'react-router-dom';
// import { SidebarMenuArb } from '../../../assets/assets';
// import { FaBackwardStep, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
// import { FaSignInAlt, FaSignOutAlt, FaLanguage } from "react-icons/fa";
// import { RiLogoutCircleRLine } from "react-icons/ri";
// import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";
// import { AuthContext } from '../../../../context/AuthContext';

// const SidebarArb = ({ isRTL = true }) => {
  
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [expandedMenus, setExpandedMenus] = useState({});

//   // Initialize expanded state
//   useEffect(() => {
//     const initialExpandedState = {};
//     SidebarMenuArb.forEach((menu) => {
//       if (menu.subItems && menu.subItems.length > 0) {
//         initialExpandedState[menu.name] = false;
//       }
//     });
//     setExpandedMenus(initialExpandedState);
//   }, []);

//   const toggleSubMenu = (menuName) => {
//     setExpandedMenus(prev => ({
//       ...prev,
//       [menuName]: !prev[menuName]
//     }));
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const isSubItemActive = (subItems) => {
//     if (!subItems) return false;
//     return subItems.some(subItem => location.pathname === subItem.path);
//   };

//   const isMenuActive = (menu) => {
//     return isActive(menu.path || '') || isSubItemActive(menu.subItems);
//   };

//   const handleLanguageSwitch = () => {
//     navigate('/en');
//   };

//   // RTL Classes - CORRECTED FOR RTL
//   const borderSide = isRTL ? 'border-l-5' : 'border-r'; // For RTL, border on left side
//   const marginSide = isRTL ? 'ml-3' : 'mr-3'; // For RTL, margin left
//   const arrowIcon = isRTL ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />;
//   const doubleArrowIcon = isRTL ? <MdKeyboardDoubleArrowLeft className='inline' /> : <MdKeyboardDoubleArrowRight className='inline' />;
//   const activeBarPosition = isRTL ? 'left-0' : 'right-0'; // Active bar on LEFT for RTL
//   const subMenuBorderSide = isRTL ? 'border-l-2' : 'border-r-2'; // Submenu border on LEFT for RTL
//   const subMenuMargin = isRTL ? 'ml-6' : 'mr-6'; // Submenu margin left for RTL
//   const subMenuPadding = isRTL ? 'pl-3' : 'pr-3'; // Submenu padding left for RTL
//   const arrowPosition = isRTL ? 'mr-auto' : 'ml-auto'; // Arrow position for RTL

//   return (
//     <div 
//       dir={isRTL ? 'rtl' : 'ltr'}
//       className={`min-h-0 relative md:flex flex-col pt-2 max-w-13 md:max-w-75 w-full bg-white min-h-screen shadow-xl`}
//     >
//       {/* Sidebar Header */}
//       <div className="p-6 border-b border-blue-300 bg-white shadow-lg/30">
//         <div className="flex items-center justify-between gap-2">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
//               <span className="text-white font-bold text-lg">ERP</span>
//             </div>
//             <span className='text-blue-700 font-bold text-xl tracking-tight'>
//               {isRTL ? 'نظام ERP' : 'ERP System'}
//             </span>
//           </div>
          
//           {/* Language Switch Button */}
//           <button
//             onClick={handleLanguageSwitch}
//             className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200 border border-blue-200 shadow-sm"
//             title="English"
//           >
//             <FaLanguage size={18} />
//             <span className="text-sm font-medium">EN</span>
//           </button>
//         </div>
//       </div>

//       <div className='w-full flex-1 py-4 overflow-y-auto shadow-lg/30'>
//         {SidebarMenuArb.map((link, index) => {
//           const hasSubItems = link.subItems && link.subItems.length > 0;
//           const isMenuActiveState = isMenuActive(link);
//           const isExpanded = expandedMenus[link.name] || false;
          
//           const IconComponent = isMenuActiveState ? link.icon : (link.iconUncolored || link.icon);
          
//           return (
//             <div key={index} className='mb-1 px-3'>
//               {/* Main Menu Item - text-lg */}
//               <div
//                 className={`relative flex items-center w-full py-3.5 px-4 rounded-lg cursor-pointer transition-all duration-200 border-l-4 ${
//                   isMenuActiveState 
//                     ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
//                     : 'border-transparent bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300'
//                 }`}
//                 onClick={() => {
//                   if (hasSubItems) {
//                     toggleSubMenu(link.name);
//                   } else {
//                     navigate(link.path || '#');
//                   }
//                 }}
//               >
//                 <div className={`flex items-center gap-3 flex-1`}>
//                   <IconComponent 
//                     className={isMenuActiveState ? 'text-blue-600' : 'text-blue-500'} 
//                     size={22}
//                   />
//                   <span className='max-md:hidden text-lg font-medium'>{link.name}</span>
//                 </div>
                
//                 {hasSubItems && (
//                   <span className={`text-blue-400 ${arrowPosition}`}>
//                     {isExpanded ? <FaChevronDown size={16} /> : arrowIcon}
//                   </span>
//                 )}
                
//                 {isMenuActiveState && (
//                   <div className={`absolute ${activeBarPosition} top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-full`}></div>
//                 )}
//               </div>

//               {/* Submenu Items - text-md with left border blue */}
//               {hasSubItems && isExpanded && (
//                 <div className={`${subMenuMargin} mt-1`}>
//                   {link.subItems?.map((subItem, subIndex) => {
//                     const isSubActive = isActive(subItem.path);
//                     const SubIconComponent = subItem.icon;
                    
//                     return (
//                       <NavLink
//                         key={subIndex}
//                         to={subItem.path}
//                         className={({ isActive: navActive }) => 
//                           `flex items-center gap-3 w-full py-2.5 px-4 my-1 rounded-lg transition-all duration-150 border-l-2 ${
//                             navActive || isSubActive 
//                               ? 'border-blue-500 bg-blue-50 text-blue-700' 
//                               : 'border-blue-200 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-400'
//                           }`
//                         }
//                       >
//                         {SubIconComponent && (
//                           <SubIconComponent 
//                             className={isSubActive ? 'text-blue-600' : 'text-blue-400'} 
//                             size={18}
//                           />
//                         )}
//                         <span className='max-md:hidden text-md font-medium'>{subItem.name}</span>
                        
//                         {isSubActive && (
//                           <div className={`${isRTL ? 'ml-auto' : 'mr-auto'} w-1.5 h-5 bg-blue-500 rounded-full`}></div>
//                         )}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* User Profile */}
//       <div className="mt-auto p-5 border-t border-blue-300 bg-white shadow-lg/30">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
//               أ
//             </div>
//             <div className="flex flex-col">
//               <span className="text-blue-700 font-semibold text-base">
//                 {isRTL ? 'مدير النظام' : 'Admin User'}
//               </span>
//               <span className="text-blue-500 text-sm">
//                 {isRTL ? 'مدير' : 'Administrator'}
//               </span>
//             </div>
//           </div>
          
//           <RiLogoutCircleRLine 
//             className='cursor-pointer text-white p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg' 
//             size={42}
//             title={isRTL ? 'تسجيل خروج' : 'Logout'}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SidebarArb;