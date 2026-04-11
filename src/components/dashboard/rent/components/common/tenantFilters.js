export const TENANCY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending Move-in' },
  { value: 'ended', label: 'Ended' }
];

export const MY_PROPERTIES_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Currently Active' },
  { value: 'pending', label: 'Pending Move-in' },
  { value: 'ended', label: 'Ended' }
];

export const LEASE_WINDOW_FILTER_OPTIONS = [
  { value: 'all', label: 'All Lease Window' },
  { value: 'endingSoon', label: 'Ending Soon (60 days)' }
];

export const APPLICATION_STATUS_FILTER_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const SORT_ORDER_OPTIONS = [
  { value: 'newest', label: 'Sort: Newest' },
  { value: 'oldest', label: 'Sort: Oldest' }
];

export const MESSAGE_THREAD_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending Chat' },
  { value: 'ended', label: 'Ended Chat' },
  { value: 'resolved', label: 'Resolved' }
];

const TENANCY_STATUS_FILTER_MAP = {
  active: 'ACTIVE',
  pending: 'PENDING_MOVE_IN',
  ended: 'ENDED'
};

const normalizeSearchValue = (value) => String(value ?? '').trim().toLowerCase();

const getPropertySearchText = (property, searchFields) =>
  searchFields
    .map((field) => {
      if (typeof field === 'function') return field(property);
      return property?.[field];
    })
    .map((value) => String(value ?? '').trim())
    .join(' ')
    .toLowerCase();

export const filterByTenancyStatus = (items = [], tenancyFilter = 'all') => {
  const targetStatus = TENANCY_STATUS_FILTER_MAP[tenancyFilter];
  if (!targetStatus) return [...items];
  return items.filter((item) => String(item?.tenancyStatus || '').toUpperCase() === targetStatus);
};

export const filterPropertiesByTenancyAndSearch = (
  properties = [],
  {
    tenancyFilter = 'all',
    search = '',
    searchFields = ['name', 'location', 'description', 'unitCode']
  } = {}
) => {
  const tenancyFiltered = filterByTenancyStatus(properties, tenancyFilter);
  const query = normalizeSearchValue(search);
  if (!query) return tenancyFiltered;

  return tenancyFiltered.filter((property) => getPropertySearchText(property, searchFields).includes(query));
};

