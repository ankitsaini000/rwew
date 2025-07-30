const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api/brand-preferences';

export async function createBrandPreference(data: any) {
  const res = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getBrandPreference(brandId: string) {
  const res = await fetch(`${API_BASE}/${brandId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateBrandPreference(brandId: string, data: any) {
  const res = await fetch(`${API_BASE}/${brandId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteBrandPreference(brandId: string) {
  const res = await fetch(`${API_BASE}/${brandId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 