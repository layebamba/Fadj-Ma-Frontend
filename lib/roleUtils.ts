export const isAdmin = (user: any): boolean => {
    return user?.role === 'ADMIN' || user?.role === 'admin';
};

export const canEdit = (user: any): boolean => {
    return isAdmin(user);
};

export const canViewDashboard = (user: any): boolean => {
    return isAdmin(user);
};