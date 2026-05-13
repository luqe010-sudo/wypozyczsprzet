const getActiveListings = (allListings) => {
  return allListings
    .filter((item) => {
      if (!item.Status) return true;
      const status = String(item.Status).toLowerCase().trim();
      return status === 'aktywne' || status === 'aktywny' || status === 'niekompletne' || status === 'active' || status === 'incomplete';
    })
    .map((item, idx) => ({ ...item, _origIdx: idx }))
    .sort((a, b) => {
      // 1. Priority (promoted items first)
      if ((b.priority || 0) !== (a.priority || 0)) {
        return (b.priority || 0) - (a.priority || 0);
      }
      // 2. Date created (newest first)
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      // 3. Fallback to original index
      return b._origIdx - a._origIdx;
    });
};

const data = [
  { name: 'Oldest, Low Priority', priority: 1, created_at: '2023-01-01', Status: 'active' },
  { name: 'Newest, Low Priority', priority: 1, created_at: '2023-12-31', Status: 'active' },
  { name: 'Middle, High Priority', priority: 5, created_at: '2023-06-01', Status: 'active' },
  { name: 'Newest, High Priority', priority: 5, created_at: '2024-01-01', Status: 'active' },
];

const sorted = getActiveListings(data);

console.log('Sorted Data:');
sorted.forEach(item => {
  console.log(`${item.priority} | ${item.created_at} | ${item.name}`);
});

// Expectations:
// 1. High Priority (5) first
// 2. Among High Priority, newest (2024) first
// 3. Low Priority (1) next
// 4. Among Low Priority, newest (2023-12-31) first
