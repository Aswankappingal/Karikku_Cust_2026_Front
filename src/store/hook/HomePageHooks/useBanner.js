// src/store/hooks/useBanners.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanners } from '../../slice/HomePageSilces/BannerSlice';

export default function useBanners() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.banners);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  return { banners: data, loading, error };
}
