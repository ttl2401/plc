import { authenticatedFetch } from '../utils/api';

export async function fetchMaintenanceSetting() {
  const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/system-settings/maintenance_clean_filter`, {
    method: 'GET',
  });
  return res.json();
}

export async function updateSettingMaintenance(value: string) {
  const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/system-settings`, {
    method: 'POST',
    body: JSON.stringify({
      key: 'maintenance_clean_filter',
      value,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.json();
} 