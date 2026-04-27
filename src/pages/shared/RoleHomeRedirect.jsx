import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_ROUTE_BY_ROLE } from '../../auth/roleConfig';
import { runtimeApi } from '../../api/runtime';

const RoleHomeRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!loading && user?.role) {
        // For restaurant roles, check if onboarding is needed
        if (user.role === 'restaurant_admin' || user.role === 'restaurant_staff') {
          try {
            // Check if restaurant has completed onboarding
            const restaurantId = user.restaurantId || 'r1';
            const settings = await runtimeApi.getRestaurantSettings(restaurantId);
            
            // Check if essential settings are configured
            const hasBasicSettings = settings && 
              settings.name && 
              settings.email && 
              settings.phone && 
              settings.address;
            
            // If no basic settings, redirect to onboarding
            if (!hasBasicSettings) {
              setNeedsOnboarding(true);
              navigate('/onboarding', { replace: true });
            } else {
              // Onboarding complete, proceed to default route
              navigate(DEFAULT_ROUTE_BY_ROLE[user.role], { replace: true });
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
            // If we can't check, assume onboarding is needed for safety
            setNeedsOnboarding(true);
            navigate('/onboarding', { replace: true });
          }
        } else {
          // Non-restaurant roles go to their default route
          navigate(DEFAULT_ROUTE_BY_ROLE[user.role], { replace: true });
        }
      } else if (!loading && !user?.role) {
        navigate('/login', { replace: true });
      }
      setCheckingOnboarding(false);
    };

    checkOnboardingStatus();
  }, [user, loading, navigate]);

  if (loading || checkingOnboarding) {
    return <div>Loading...</div>;
  }

  return null;
};

export default RoleHomeRedirect;