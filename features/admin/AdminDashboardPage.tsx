import React, { useEffect, useState } from 'react';
import { User } from '../../types'; // Assuming User type is defined in types.ts
import { ShieldCheck, Users } from 'lucide-react';

// This key is used to load users for the admin dashboard.
// Note: With Brevo integration for registration, new users will not be added to localStorage via the registration form.
// This dashboard will only show users registered via the old localStorage method (if any) or be empty for new deployments.
const USERS_STORAGE_KEY = 'vibTestRegisteredUsers';

export const AdminDashboardPage: React.FC = () => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        setRegisteredUsers(JSON.parse(storedUsers));
      }
    } catch (error) {
      console.error("Error loading users from localStorage:", error);
      // Optionally set an error state to display to the admin
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="bg-card p-6 rounded-xl shadow-lg flex items-center">
        <ShieldCheck className="w-10 h-10 text-primary mr-4" />
        <div>
            <h1 className="text-3xl font-bold text-textPrimary">Admin Dashboard</h1>
            <p className="text-textSecondary">Manage and view registered users (from local storage).</p>
        </div>
      </header>

      <section className="bg-card p-6 rounded-xl shadow-lg">
        <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-primary-light mr-3" />
            <h2 className="text-xl font-semibold text-textPrimary">Registered Users List (Local Storage)</h2>
        </div>
        {registeredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Full Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Country
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Registered On
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registeredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-textPrimary">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{`${user.name} ${user.lastName}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{user.country}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                      {new Date(user.registrationDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-textSecondary text-center py-10">No users found in local storage. New registrations are sent to Brevo.</p>
        )}
      </section>
    </div>
  );
};