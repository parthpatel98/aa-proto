import React, { createContext, useContext } from 'react';
import { ME, MY_DEPT, USERS } from './data';
import { User } from './types';

const fallback = USERS.find((user) => user.name === ME)!;
const UserContext = createContext<User>(fallback);

export const UserProvider: React.FC<{ user: User; children: React.ReactNode }> = ({ user, children }) => (
  <UserContext.Provider value={user}>{children}</UserContext.Provider>
);

export const useCurrentUser = () => useContext(UserContext);
export const DEFAULT_USER = fallback;
