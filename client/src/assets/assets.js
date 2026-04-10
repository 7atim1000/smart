// assets.js
import { 
  FaUser,
  FaShoppingCart,
  FaBuilding, 
} from 'react-icons/fa';

import { AiFillCalculator } from "react-icons/ai";
import { PiCurrencyDollarLight } from "react-icons/pi";
import { ImUsers } from "react-icons/im";
import { FaSortAmountUp } from "react-icons/fa";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";

import { ImCalculator } from "react-icons/im";
import { FaCommentsDollar } from "react-icons/fa";
import { AiFillContainer } from "react-icons/ai";
import { IoSettingsSharp } from "react-icons/io5";
import { TbListTree } from "react-icons/tb";
import { CiCalculator2 } from "react-icons/ci";
import { HiChartPie } from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import { BsJournals } from "react-icons/bs";
import { BsJournalText } from "react-icons/bs";
import { IoMdContacts } from "react-icons/io";
import { MdCategory } from "react-icons/md";
import { FaArrowsSpin } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";

// English Menu
export const SidebarMenuLinks = [
  
  { 
    name: "Accounting", 
    path: "#",
    icon: AiFillCalculator,
    isExpanded: false,
    subItems: [
      {
        name: "Chart of Accounts",
        path: "/en/accgroups",
        icon: FiPieChart
      },
      {
        name: "Journals Name",
        path: "/en/journalsdashboard",
        icon: BsJournals
      },
      {
        name: "Journals",
        path: "/en/journals",
        icon: BsJournalText
      },
    ]
  },
  
  // You can add more English menu items here
  { 
    name: "Contacts", 
    path: "/en/contacts", 
    icon: IoMdContacts,
  },

  { 
    name: "Products", 
    path: "/en/categories", 
    icon: MdCategory,
  },

  { 
    name: "Invoices", 
    path: "/en/invoices", 
    icon: FaArrowsSpin,
  },

  

];

// Arabic Menu
export const SidebarMenuArb = [
  { 
    name: "المحاسبه", 
    path: "#",
    icon: AiFillCalculator,
    isExpanded: false,
    subItems: [
      {
        name: "شجرة الحسابات", // Fixed spelling: "شجره" → "شجرة"
        path: "/ar/accgroups",
        icon: FiPieChart
      },
      {
        name: "دفاتر اليوميه",
        path: "/ar/journalsdashboard",
        icon: BsJournals
      },
      {
        name: "قيود اليوميه",
        path: "/ar/journals",
        icon: BsJournalText
      },
    ]
  },
  
  // You can add more Arabic menu items here
  // { 
  //   name: "المعاملات الماليه", 
  //   path: "/ar/transactions", 
  //   icon: GrTransaction,
  // },

  { 
    name: "جهات الاتصال", 
    path: "/ar/contacts", 
    icon: IoMdContacts,
  },

  { 
    name: "اداره الاصناف", 
    path: "/ar/categories", 
    icon: MdCategory,
  },

  { 
    name: "اداره الفواتير", 
    path: "/ar/invoices", 
    icon: FaArrowsSpin,
  },

];

// Optional: Create a function to get menu based on language
export const getMenuByLanguage = (language) => {
  return language === 'ar' ? SidebarMenuArb : SidebarMenuLinks;
};