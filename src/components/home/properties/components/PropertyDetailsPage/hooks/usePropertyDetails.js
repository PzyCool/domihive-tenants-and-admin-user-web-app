// src/components/home/properties/components/PropertyDetailsPage/hooks/usePropertyDetails.js
import { useState, useEffect } from 'react';
import { resolvePropertyById } from '../../../../../shared/utils/propertyResolver';

const usePropertyDetails = (propertyId, propertyData = null) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 200));
        let resolved = null;
        try {
          resolved = resolvePropertyById(propertyId);
        } catch (resolverError) {
          console.error('Property resolver failed:', resolverError);
          resolved = null;
        }
        if (!resolved && propertyData) {
          resolved = propertyData;
        }
        if (!resolved) {
          setProperty(null);
          setError('Property not found.');
          return;
        }
        setProperty(resolved);
        setError(null);
      } catch (err) {
        setError('Property not found.');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId || propertyData) {
      fetchProperty();
    } else {
      setLoading(false);
      setProperty(null);
      setError('Property not found.');
    }
  }, [propertyId, propertyData]);

  return { property, loading, error };
};

export default usePropertyDetails;
