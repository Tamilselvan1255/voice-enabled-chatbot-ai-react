import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const ProtectedRoutes = ({element: Component}) => {
    const auth = useSelector((x) => x.user.token);

    if(!auth){
        return <Navigate to="/" replace />
    };

    return <Component />
};
