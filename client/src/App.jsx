import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import FullScreenLayout from './FullScreenLayout';
import LoginPage from './eng/pages/LoginPage';

// English Layout and Pages
import EngLayout from './eng/pages/Layout';
import EngDashboard from './eng/pages/Dashboard';
import EngAccountGroups from './eng/pages/AccountGroups';
import JournalsDashboard from './eng/pages/JournalsDashboard' ;
import Journals from './eng/pages/Journals' ;

// Arabic Layout and Pages  
import ArbLayout from './arb/pages/Layout';
import ArbDashboard from './arb/pages/Dashboard'; // Make sure this exists
import ArbAccountGroups from './arb/pages/AccountGroups';
import ArbTransactions from './arb/pages/Transactions' ;
import ArbJournalsDashboard from './arb/pages/JournalsDashboard' ;
import ArbJournals from './arb/pages/Journals' ;
import TrialBalance from './eng/pages/TrialBalance' ;

import Contacts from './eng/pages/Contacts' ;
import ContactDetails from './eng/pages/ContactDetails';
import ArbContacts from './arb/pages/Contacts' ;
import ArbContactDetails from './arb/pages/ContactDetails';

import Categories from './eng/pages/Categories';
import CategoriesArb from './arb/pages/Categories';

import Invoices from './eng/pages/Invoices' ;
import Sales from './eng/pages/Sales';
import Purchase from './eng/pages/Purchase';

import InvDetails from './eng/pages/InvDetails';
import ArbInvoices from './arb/pages/Invoices' ;
import ArbSales from './arb/pages/Sales' ;
import ArbPurchase from './arb/pages/Purchase';
import ArbInvDetails from './arb/pages/InvDetails' ;
import BalanceSheet from './eng/pages/BalanceSheet';
import ArbTrialBalance from './arb/pages/TrialBalance';
import ArbBalanceSheet from './arb/pages/BalanceSheet';


const App = () => {
  const { authUser, loading } = useContext(AuthContext);
  const location = useLocation();
  
  // Determine language from URL
  const getLanguage = () => {
    const path = location.pathname;
    if (path.startsWith('/ar')) return 'ar';
    if (path.startsWith('/en')) return 'en';
    // Default to English
    return 'en';
  };

  const language = getLanguage();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<LoginPage />} />


        
        {/* English Routes - with /en prefix */}
        <Route path='/en' element={<EngLayout />}>
          <Route index element={authUser ? <EngDashboard /> : <Navigate to="/login" />} />
          <Route path='accgroups' element={authUser ? <EngAccountGroups /> : <Navigate to="/login" />} />
          <Route path='journalsdashboard' element={authUser ? <JournalsDashboard /> : <Navigate to="/login" />} />
          <Route path='journals' element={authUser ? <Journals /> : <Navigate to="/login" />} />
          {/* Add more English routes here */}
          <Route path='trialbalance' element={authUser ? <TrialBalance /> : <Navigate to="/login" />} />
          <Route path='balancesheet' element={authUser ? <BalanceSheet /> : <Navigate to="/login" />} />
          <Route path='contacts' element={authUser ? <Contacts /> : <Navigate to="/login" />} />
           {/* Update this line to include :id parameter */}
          <Route path='contactdetails/:id' element={authUser ? <ContactDetails /> : <Navigate to="/login" />} />

          <Route path='categories' element={authUser ? <Categories /> : <Navigate to="/login" />} />

          <Route path='invoices' element={authUser ? <Invoices /> : <Navigate to="/login" />} />
          <Route path='sales' element={authUser ? <Sales /> : <Navigate to="/login" />} />
          <Route path='purchases' element={authUser ? <Purchase /> : <Navigate to="/login" />} />
          <Route path='invdetails/:id' element={authUser ? <InvDetails /> : <Navigate to="/login" />} />
          {/* English Routes - Full Screen (no sidebar) */}
          {/* <Route path='/en' element={<FullScreenLayout />}>
            <Route path='sales' element={authUser ? <Sales /> : <Navigate to="/login" />} />
          </Route> */}

        </Route>

        {/* Arabic Routes - with /ar prefix */}
        <Route path='/ar' element={<ArbLayout />}>
          <Route index element={authUser ? <ArbDashboard /> : <Navigate to="/login" />} />
          <Route path='accgroups' element={authUser ? <ArbAccountGroups /> : <Navigate to="/login" />} />
          <Route path='journalsdashboard' element={authUser ? <ArbJournalsDashboard /> : <Navigate to="/login" />} />
          <Route path='journals' element={authUser ? <ArbJournals /> : <Navigate to="/login" />} />
          <Route path='transactions' element={authUser ? <ArbTransactions /> : <Navigate to="/login" />} />
          <Route path='trialbalance' element={authUser ? <ArbTrialBalance /> : <Navigate to="/login" />} />
          <Route path='balancesheet' element={authUser ? <ArbBalanceSheet /> : <Navigate to="/login" />} />
          
          {/* Add more Arabic routes here */}
          <Route path='contacts' element={authUser ? <ArbContacts /> : <Navigate to="/login" />} />
          <Route path='contactdetails/:id' element={authUser ? <ArbContactDetails /> : <Navigate to="/login" />} />
          <Route path='categories' element={authUser ? <CategoriesArb /> : <Navigate to="/login" />} />
          <Route path='invoices' element={authUser ? <ArbInvoices /> : <Navigate to="/login" />} />
          <Route path='sales' element={authUser ? <ArbSales /> : <Navigate to="/login" />} />
          <Route path='purchases' element={authUser ? <ArbPurchase /> : <Navigate to="/login" />} />
          <Route path='invdetails/:id' element={authUser ? <ArbInvDetails /> : <Navigate to="/login" />} />
        
        </Route>

        {/* Redirect root to appropriate language */}
        <Route path='/' element={<Navigate to={`/${language}`} replace />} />
        
        {/* Catch all - redirect to appropriate language */}
        <Route path='*' element={<Navigate to={`/${language}`} replace />} />
      </Routes>
    </>
  );
};

export default App;

// import {Route, Routes, Navigate, useLocation} from 'react-router-dom' ;
// import {Toaster} from 'react-hot-toast';
// import { useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import LoginPage from './eng/pages/LoginPage';

// import Dashboard from './eng/pages/Dashboard';

// import Layout from './eng/pages/Layout';
// import Layout from './arb/pages/Layout';

// import AccountGroups from './eng/pages/AccountGroups';
// import AccountGroups from './arb/pages/AccountGroups';



// const App = () => {

//   const {authUser, loading} = useContext(AuthContext);
 
//   // Show loading spinner while checking authentication
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster />
//       <Routes>
        
//         {/* <Route path='/' element= {<Dashboard /> }/> */}
//         <Route path='/login' element={<LoginPage />} />

//         {/* Eng LayOut */}
//         <Route path='/' element={<Layout />} >
//             <Route path='/' element={authUser ? <Dashboard /> : <Navigate to="/login" />} />
//             <Route path='accgroups' element={authUser ? <AccountGroups /> : <Navigate to="/login" />} />
//         </Route>

//          {/* Arb LayOut */}
//         <Route path='/' element={<Layout />} >
//             <Route path='/' element={authUser ? <Dashboard /> : <Navigate to="/login" />} />
//             <Route path='accgroupsarb' element={authUser ? <AccountGroups /> : <Navigate to="/login" />} />
//         </Route>
      
//       </Routes>
//     </>
    
//   )
// };

// export default App ;
