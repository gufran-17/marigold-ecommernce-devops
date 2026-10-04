import { useEffect, useState } from 'react';
import { categoryApi } from '../api';

let cache = null;
let pending = null;

// Categories rarely change, so they are fetched once and shared by all components.
export default function useCategories() {
  const [categories, setCategories] = useState(cache || []);
  useEffect(() => {
    if (cache) return;
    pending = pending || categoryApi.list().then((d) => { cache = d.categories; return cache; }).catch(() => { pending = null; return []; });
    pending.then(setCategories);
  }, []);
  return categories;
}
