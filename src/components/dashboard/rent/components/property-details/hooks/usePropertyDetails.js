// src/dashboards/rent/components/property-details/hooks/usePropertyDetails.js
import { useState, useEffect } from 'react';
import { resolvePropertyById } from '../../../../../shared/utils/propertyResolver';

export const usePropertyDetails = (propertyId) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 200));
        const resolved = resolvePropertyById(propertyId);
        if (!resolved) {
          setProperty(null);
          setError('Property not found.');
          return;
        }
        setProperty(resolved);
        setError(null);
      } catch (err) {
        setError('Failed to load property details');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  return { property, loading, error };
};
