import { useDispatch, useSelector } from 'react-redux';
import { createGiftWithImage, createGiftJson, CreateGiftWithImagePayload } from '../../store/slices/giftSlice';
import { AppDispatch, RootState } from '../../store';

export type CreateGiftForm = {
  name: string;
  description?: string;
  type: 'coin' | 'badge' | 'sticker' | 'special';
  value: number;
  coinCost: number;
  category: 'music' | 'celebration' | 'love' | 'support' | 'funny' | 'custom';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  isActive?: boolean;
  isSeasonal?: boolean;
  seasonalStart?: string;
  seasonalEnd?: string;
};

export const useCreateGift = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.gift.actionLoading.create || false);

  const createGiftHandler = async (giftData: CreateGiftForm, imageFile?: File) => {
    if (imageFile) {
      const payload: CreateGiftWithImagePayload = {
        image: imageFile,
        name: giftData.name,
        type: giftData.type,
        value: Number(giftData.value),
        coinCost: Number(giftData.coinCost),
        category: giftData.category,
        description: giftData.description,
        rarity: giftData.rarity,
        isSeasonal: giftData.isSeasonal,
        seasonalStart: giftData.seasonalStart,
        seasonalEnd: giftData.seasonalEnd,
      };
      return await dispatch(createGiftWithImage(payload));
    } else {
      return await dispatch(createGiftJson({
        name: giftData.name,
        description: giftData.description,
        image: '',
        type: giftData.type,
        value: giftData.value,
        coinCost: giftData.coinCost,
        rarity: giftData.rarity || 'common',
        category: giftData.category,
        isActive: giftData.isActive ?? true,
        isSeasonal: giftData.isSeasonal ?? false,
        seasonalStart: giftData.seasonalStart,
        seasonalEnd: giftData.seasonalEnd,
      }));
    }
  };

  return { createGiftHandler, isLoading };
};