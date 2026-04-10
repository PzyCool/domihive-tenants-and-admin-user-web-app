import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Heart, Home } from 'lucide-react';
import { useProperties } from '../contexts/PropertiesContext';
import PropertyGrid from '../components/browse-properties/components/PropertyGrid/PropertyGrid';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import { useUnitCardView } from '../contexts/UnitCardViewContext';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { favoriteProperties, toggleFavorite, isFavorite } = useProperties();
  const { viewType, isGrid } = useUnitCardView();

  const handleFavoriteToggle = (property) => toggleFavorite(property);

  const stats = useMemo(() => {
    const total = favoriteProperties.length;
    const available = favoriteProperties.filter((item) =>
      ['vacant', 'available'].includes(String(item.tenantStatus || item.status || '').toLowerCase())
    ).length;
    const occupied = favoriteProperties.filter((item) =>
      ['occupied', 'rented'].includes(String(item.tenantStatus || item.status || '').toLowerCase())
    ).length;
    return { total, available, occupied };
  }, [favoriteProperties]);

  return (
    <UnifiedPanelPage
      title="Favorites"
      subtitle="Saved units from your browse journey."
      stats={[
        {
          label: 'Saved Units',
          value: stats.total,
          meta: `${stats.total} total`,
          icon: <Heart size={18} />,
          iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
          label: 'Available',
          value: stats.available,
          meta: `${stats.available} ready to book`,
          icon: <CheckCircle2 size={18} />,
          iconClass: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
        },
        {
          label: 'Occupied',
          value: stats.occupied,
          meta: `${stats.occupied} unavailable`,
          icon: <Home size={18} />,
          iconClass: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
        }
      ]}
    >
      {favoriteProperties.length === 0 ? (
        <UnifiedPanelSection>
          <div className="text-[var(--text-muted,#64748b)]">
            No favorites yet. Browse properties and tap the heart icon to save units you like.
          </div>
        </UnifiedPanelSection>
      ) : (
        <UnifiedPanelSection>
          <PropertyGrid
            properties={favoriteProperties.map((p) => ({
              ...p,
              isFavorite: isFavorite(p.id || p.propertyId)
            }))}
            viewType={viewType}
            onFavoriteToggle={handleFavoriteToggle}
            onPropertyClick={(propertyId) =>
              navigate('/dashboard/rent/browse', { state: { openPropertyId: propertyId } })
            }
            onBookNowClick={(propertyId) =>
              navigate('/dashboard/rent/browse', { state: { openPropertyId: propertyId } })
            }
          />
          {isGrid ? <div className="h-1"></div> : null}
        </UnifiedPanelSection>
      )}
    </UnifiedPanelPage>
  );
};

export default FavoritesPage;
