import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import { getListings, deleteListing } from '../services/storageService';
import { RentalListing } from '../types';
import { Lock, Loader2 } from 'lucide-react';

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
        fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
      setIsLoading(true);
      try {
          const data = await getListings();
          setListings(data);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'DreamTeam') {
      setIsLoggedIn(true);
    } else {
      alert('Login Failed');
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
        const updated = await deleteListing(id);
        setListings(updated);
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการลบ');
    } finally {
        setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
           <div className="flex justify-center mb-4 text-blue-600">
               <Lock size={48} />
           </div>
           <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Admin Login</h2>
           <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  className="mt-1 w-full p-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1 w-full p-2 border border-slate-300 rounded-md"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-bold">
                Login
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">จัดการข้อมูล ({listings.length})</h2>
            <button 
                onClick={() => setIsLoggedIn(false)} 
                className="text-sm text-red-600 hover:underline"
            >
                Logout
            </button>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
        ) : (
            <div className="space-y-6">
                {listings.map(listing => (
                    <ListingCard 
                        key={listing.id} 
                        listing={listing} 
                        isAdmin={true} 
                        onDelete={handleDelete} 
                    />
                ))}
                {listings.length === 0 && (
                    <p className="text-center text-slate-400">ไม่มีข้อมูลในระบบ</p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;