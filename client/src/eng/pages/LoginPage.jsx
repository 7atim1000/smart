import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLogin, setIsLogin] = useState(true); // true for login, false for register
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get redirect message from state if available
    const redirectMessage = location.state?.message;

    const { login, axios } = useContext(AuthContext);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        
        try {
            if (isLogin) {
                // Login
                await login("login", { email, password });
            } else {
                // Register
                const response = await axios.post('/v1/api/auth/register', {
                    fullName,
                    email,
                    password
                });
                
                if (response.data.success) {
                    // Auto login after successful registration
                    await login("login", { email, password });
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setFullName('');
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4 md:p-6'>
            <div className='grid grid-cols-1 max-w-md w-full items-center'>
                {/** Login/Register Form with White/Blue Theme */}
                <div className='bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden border border-blue-100 transform transition-all duration-500 hover:shadow-blue-200/50'>
                    <div className='p-5 sm:p-6 md:p-8 lg:p-10'>
                        {/* Header */}
                        <div className='mb-5 sm:mb-6 md:mb-8 text-center'>
                            <div className='inline-block p-2 sm:p-3 bg-blue-50 rounded-full mb-3 sm:mb-4'>
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-1 sm:mb-2'>
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            
                            {redirectMessage && (
                                <div className='mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-lg border border-blue-200 shadow-sm'>
                                    <div className='flex items-center justify-center gap-2'>
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        {redirectMessage}
                                    </div>
                                </div>
                            )}
                            
                            <p className='text-gray-600 text-xs sm:text-sm md:text-base'>
                                {isLogin 
                                    ? 'Enter your credentials to access your account'
                                    : 'Fill in the details to create your account'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={onSubmitHandler} className='space-y-4 sm:space-y-5 md:space-y-6'>
                            {/* Full Name Field - Only for Register */}
                            {!isLogin && (
                                <div>
                                    <div className='flex justify-between items-center mb-1 sm:mb-2'>
                                        <label className='text-xs sm:text-sm md:text-base font-semibold text-blue-800'>
                                            Full Name
                                        </label>
                                        <span className='text-xs sm:text-sm text-blue-600 font-medium'>
                                            الاسم الكامل
                                        </span>
                                    </div>

                                    <div className='relative group'>
                                        <input
                                            type="text"
                                            onChange={(e) => setFullName(e.target.value)}
                                            value={fullName}
                                            placeholder="John Doe"
                                            className='w-full p-2.5 sm:p-3 md:p-4 px-4 border-2 border-blue-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm sm:text-base'
                                            required={!isLogin}
                                            autoComplete='off'
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email Field */}
                            <div>
                                <div className='flex justify-between items-center mb-1 sm:mb-2'>
                                    <label className='text-xs sm:text-sm md:text-base font-semibold text-blue-800'>
                                        Email Address
                                    </label>
                                    <span className='text-xs sm:text-sm text-blue-600 font-medium'>
                                        الايميل
                                    </span>
                                </div>

                                <div className='relative group'>
                                    <input
                                        type="email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                        placeholder="admin@example.com"
                                        className='w-full p-2.5 sm:p-3 md:p-4 px-4 border-2 border-blue-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm sm:text-base'
                                        required
                                        autoComplete='off'
                                    />
                                </div>
                            </div>
                            
                            {/* Password Field */}
                            <div>
                                <div className='flex justify-between items-center mb-1 sm:mb-2'>
                                    <label className='text-xs sm:text-sm md:text-base font-semibold text-blue-800'>
                                        Password
                                    </label>
                                    <span className='text-xs sm:text-sm text-blue-600 font-medium'>
                                        كلمة المرور
                                    </span>
                                </div>

                                <div className='relative group'>
                                    <input
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                        type="password"
                                        placeholder="Enter your password"
                                        className='w-full p-2.5 sm:p-3 md:p-4 px-4 border-2 border-blue-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm sm:text-base'
                                        required
                                        autoComplete='off'
                                    />
                                </div>
                            </div>

                            {/* Forgot Password Link - Only for Login */}
                            {isLogin && (
                                <div className='text-right'>
                                    <button
                                        type='button'
                                        className='text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline transition-all font-medium'
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type='submit'
                                disabled={loading}
                                className='w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2.5 sm:p-3 md:p-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] text-sm sm:text-base flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading ? (
                                    <div className='flex items-center gap-2'>
                                        <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Login to Account' : 'Create Account'}</span>
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                        </svg>
                                    </>
                                )}
                            </button>

                            {/* Toggle between Login and Register */}
                            <div className='text-center'>
                                <button
                                    type='button'
                                    onClick={toggleMode}
                                    className='text-xs sm:text-lg text-blue-600 hover:text-blue-800 hover:underline transition-all font-medium'
                                >
                                    {isLogin 
                                        ? "Don't have an account? Register here" 
                                        : "Already have an account? Login here"}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className='relative py-2 sm:py-3'>
                                <div className='absolute inset-0 flex items-center'>
                                    <div className='w-full border-t border-blue-200'></div>
                                </div>
                                <div className='relative flex justify-center'>
                                    <span className='px-3 sm:px-4 bg-white text-xs sm:text-sm font-medium text-blue-600'>
                                        Secure Access
                                    </span>
                                </div>
                            </div>

                            {/* Back to Home Button */}
                            <div className='pt-1 sm:pt-2'>
                                <button
                                    type='button'
                                    onClick={() => navigate('/')}
                                    className='flex items-center justify-center gap-1 sm:gap-2 w-full p-2 sm:p-3 text-blue-600 hover:text-blue-800 transition-colors group text-xs sm:text-sm md:text-base'
                                >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                    </svg>
                                    <span className='font-medium'>Back to Homepage</span>
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    {/* Footer */}
                    <div className='bg-gradient-to-r from-blue-50 to-blue-100/50 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border-t border-blue-200'>
                        <div className='text-center'>
                            <p className='text-xs sm:text-sm text-blue-600 mb-0.5 sm:mb-1'>
                                <span className='inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5'></span>
                                For security reasons, please log out when finished
                            </p>
                            <p className='text-[10px] sm:text-xs text-blue-400'>
                                © {new Date().getFullYear()} Co. Company. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

// import React, { useContext, useState } from 'react';
// import { AuthContext } from '../../../context/AuthContext';
// import { useNavigate, useLocation } from 'react-router-dom';

// const LoginPage = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const navigate = useNavigate();
//     const location = useLocation();
    
//     // Get redirect message from state if available
//     const redirectMessage = location.state?.message;

//     const { login } = useContext(AuthContext);

//     const onSubmitHandler = (event) => {
//         event.preventDefault();
//         login("login", { email, password });
//     };

//     return (
//         <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4 md:p-6'>
//             <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 max-w-4xl xl:max-w-6xl w-full items-center'>
                
//                 {/** Left Section - Brand/Logo with Blue Theme */}
//                 <div className='flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 order-2 lg:order-1'>
//                     <div className='relative mb-4 sm:mb-6 md:mb-8'>
//                         {/* Decorative blue circle behind logo - larger to match bigger image */}
//                         <div className='absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-70 animate-pulse scale-150'></div>

//                         {/* Image container with LARGER dimensions */}
//                         <div className='relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96'>
//                             <img
//                                 src={"https://nq5udmrdco.ufs.sh/f/Kfo4jX11Imre6BoSRWVxkpN8rj53y9vX0cHbRIMOUfQheqLo"}
//                                 alt="Company Logo"
//                                 className='w-full h-full object-contain cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-2 drop-shadow-2xl'
//                                 onClick={() => navigate('/')}
//                             />
//                         </div>
//                     </div>

//                     <div className='text-center px-2 space-y-1 sm:space-y-2'>
//                         <h1 className='text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-blue-800 mb-1 sm:mb-2 tracking-tight'>
//                             Admin Portal
//                         </h1>
//                         <p className='text-blue-600 text-sm sm:text-base md:text-lg lg:text-xl font-medium'>
//                             Secure access to system management
//                         </p>

//                         {/* Decorative dots - slightly larger */}
//                         <div className='flex justify-center gap-2 sm:gap-3 mt-3 sm:mt-4'>
//                             <div className='w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-400 rounded-full'></div>
//                             <div className='w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full'></div>
//                             <div className='w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-600 rounded-full'></div>
//                         </div>
//                     </div>
//                 </div>

//                 {/** Right Section - Login Form with White/Blue Theme */}
//                 <div className='bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden border border-blue-100 order-1 lg:order-2 transform transition-all duration-500 hover:shadow-blue-200/50'>
//                     <div className='p-5 sm:p-6 md:p-8 lg:p-10'>
//                         {/* Header */}
//                         <div className='mb-5 sm:mb-6 md:mb-8 text-center'>
//                             <div className='inline-block p-2 sm:p-3 bg-blue-50 rounded-full mb-3 sm:mb-4'>
//                                 <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
//                                 </svg>
//                             </div>
//                             <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-1 sm:mb-2'>
//                                 Welcome Back
//                             </h2>
                            
//                             {redirectMessage && (
//                                 <div className='mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-lg border border-blue-200 shadow-sm'>
//                                     <div className='flex items-center justify-center gap-2'>
//                                         <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                                         </svg>
//                                         {redirectMessage}
//                                     </div>
//                                 </div>
//                             )}
                            
//                             <p className='text-gray-600 text-xs sm:text-sm md:text-base'>
//                                 Enter your credentials to access your account
//                             </p>
//                         </div>

//                         {/* Form */}
//                         <form onSubmit={onSubmitHandler} className='space-y-4 sm:space-y-5 md:space-y-6'>
//                             {/* Email Field */}
//                             <div>
//                                 <label className='block text-xs sm:text-sm md:text-base font-semibold text-blue-800 mb-1 sm:mb-2'>
//                                     Email Address
//                                 </label>

//                                 <div className='relative group'>
//                                     <input
//                                         type="email"
//                                         onChange={(e) => setEmail(e.target.value)}
//                                         value={email}
//                                         placeholder="admin@example.com"
//                                         className='w-full p-2.5 sm:p-3 md:p-4 pl-9 sm:pl-10 md:pl-12 border-2 border-blue-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm sm:text-base'
//                                         required
//                                         autoComplete='off'
//                                     />
                                    
//                                     <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors'>
//                                         <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             {/* Password Field */}
//                             <div>
//                                 <label className='block text-xs sm:text-sm md:text-base font-semibold text-blue-800 mb-1 sm:mb-2'>
//                                     Password
//                                 </label>

//                                 <div className='relative group'>
//                                     <input
//                                         onChange={(e) => setPassword(e.target.value)}
//                                         value={password}
//                                         type="password"
//                                         placeholder="Enter your password"
//                                         className='w-full p-2.5 sm:p-3 md:p-4 pl-9 sm:pl-10 md:pl-12 border-2 border-blue-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm sm:text-base'
//                                         autoComplete='off'
//                                     />
                                    
//                                     <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors'>
//                                         <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Forgot Password Link */}
//                             <div className='text-right'>
//                                 <button
//                                     type='button'
//                                     className='text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline transition-all font-medium'
//                                 >
//                                     Forgot password?
//                                 </button>
//                             </div>

//                             {/* Submit Button */}
//                             <button
//                                 type='submit'
//                                 className='w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2.5 sm:p-3 md:p-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] text-sm sm:text-base flex items-center justify-center gap-2 group'
//                             >
//                                 <span>Login to Account</span>
//                                 <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
//                                 </svg>
//                             </button>

//                             {/* Divider */}
//                             <div className='relative py-2 sm:py-3'>
//                                 <div className='absolute inset-0 flex items-center'>
//                                     <div className='w-full border-t border-blue-200'></div>
//                                 </div>
//                                 <div className='relative flex justify-center'>
//                                     <span className='px-3 sm:px-4 bg-white text-xs sm:text-sm font-medium text-blue-600'>
//                                         Secure Admin Access
//                                     </span>
//                                 </div>
//                             </div>

//                             {/* Back to Home Button */}
//                             <div className='pt-1 sm:pt-2'>
//                                 <button
//                                     type='button'
//                                     onClick={() => navigate('/')}
//                                     className='flex items-center justify-center gap-1 sm:gap-2 w-full p-2 sm:p-3 text-blue-600 hover:text-blue-800 transition-colors group text-xs sm:text-sm md:text-base'
//                                 >
//                                     <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
//                                     </svg>
//                                     <span className='font-medium'>Back to Homepage</span>
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
                    
//                     {/* Footer */}
//                     <div className='bg-gradient-to-r from-blue-50 to-blue-100/50 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border-t border-blue-200'>
//                         <div className='text-center'>
//                             <p className='text-xs sm:text-sm text-blue-600 mb-0.5 sm:mb-1'>
//                                 <span className='inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5'></span>
//                                 For security reasons, please log out when finished
//                             </p>
//                             <p className='text-[10px] sm:text-xs text-blue-400'>
//                                 © {new Date().getFullYear()} Alain Company. All rights reserved.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;
