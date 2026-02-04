import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-sentinel-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/5 p-10 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white font-sans tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? 'Sign in to access your statutory dashboard' : 'Join the premier legal intelligence platform'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-400 mb-1">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/10 bg-black/50 placeholder-gray-600 text-white rounded-lg focus:outline-none focus:ring-sentinel-green focus:border-sentinel-green focus:z-10 sm:text-sm transition-colors"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/10 bg-black/50 placeholder-gray-600 text-white rounded-lg focus:outline-none focus:ring-sentinel-green focus:border-sentinel-green focus:z-10 sm:text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
             {/* Rememeber me / Forgot password placeholders */}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sentinel-green hover:bg-[#096646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sentinel-green transition-all shadow-lg shadow-sentinel-green/20"
            >
              {isLogin ? 'Sign in' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center">
           <button 
             onClick={() => setIsLogin(!isLogin)}
             className="text-sm text-gray-500 hover:text-white hover:underline font-medium transition-colors"
           >
             {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
