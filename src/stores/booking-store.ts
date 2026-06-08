'use client';

import { create } from 'zustand';

interface BookingExtras {
  boosterSeatQty: number;
  babySeatQty: number;
  wheelChairQty: number;
}

interface CustomExtraSelection {
  extraId: string;
  qty: number;
}

interface BookingState {
  // Step 1 - Search
  serviceType: string;
  fromZoneId: string;
  toZoneId: string;
  fromPlaceName: string;
  fromPlaceId: string;
  toPlaceName: string;
  toPlaceId: string;
  // Precise pickup/drop-off point from the Google Places picker.
  pickupPlaceId: string;
  pickupLat: number | null;
  pickupLng: number | null;
  pickupAddress: string;
  dropoffPlaceId: string;
  dropoffLat: number | null;
  dropoffLng: number | null;
  dropoffAddress: string;
  hotelId: string;
  hotelName: string;
  originAirportId: string;
  destinationAirportId: string;
  jobDate: string;
  pickupTime: string;
  paxCount: number;
  vehicleTypeId: string;
  // 2-Way (return) transfer
  roundTrip: boolean;
  returnDate: string;
  returnTime: string;
  returnFlightNo: string;
  returnCarrier: string;
  returnTerminal: string;
  returnQuotePrice: number | null;
  // Quote result
  quotePrice: number | null;
  quoteCurrency: string;
  quoteBreakdown: Record<string, unknown> | null;
  // Step 2 - Guest Details
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  flightNo: string;
  carrier: string;
  terminal: string;
  extras: BookingExtras;
  customExtras: CustomExtraSelection[];
  notes: string;
  // Step 3 - Payment
  paymentMethod: string;
  paymentGateway: string;
  // Result
  bookingRef: string;
  accountCreated: boolean;
  accountEmail: string | null;
  accountPassword: string | null;
  // Actions
  setField: (field: string, value: unknown) => void;
  setQuote: (price: number, currency: string, breakdown: Record<string, unknown>) => void;
  setCustomExtraQty: (extraId: string, qty: number) => void;
  reset: () => void;
}

const initialState = {
  serviceType: '',
  fromZoneId: '',
  toZoneId: '',
  fromPlaceName: '',
  fromPlaceId: '',
  toPlaceName: '',
  toPlaceId: '',
  pickupPlaceId: '',
  pickupLat: null,
  pickupLng: null,
  pickupAddress: '',
  dropoffPlaceId: '',
  dropoffLat: null,
  dropoffLng: null,
  dropoffAddress: '',
  hotelId: '',
  hotelName: '',
  originAirportId: '',
  destinationAirportId: '',
  jobDate: '',
  pickupTime: '',
  paxCount: 1,
  vehicleTypeId: '',
  roundTrip: false,
  returnDate: '',
  returnTime: '',
  returnFlightNo: '',
  returnCarrier: '',
  returnTerminal: '',
  returnQuotePrice: null,
  quotePrice: null,
  quoteCurrency: 'USD',
  quoteBreakdown: null,
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  guestCountry: '',
  flightNo: '',
  carrier: '',
  terminal: '',
  extras: { boosterSeatQty: 0, babySeatQty: 0, wheelChairQty: 0 },
  customExtras: [],
  notes: '',
  paymentMethod: '',
  paymentGateway: '',
  bookingRef: '',
  accountCreated: false,
  accountEmail: null,
  accountPassword: null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setField: (field: string, value: unknown) =>
    set((state) => {
      if (field.startsWith('extras.')) {
        const extraKey = field.split('.')[1] as keyof BookingExtras;
        return { extras: { ...state.extras, [extraKey]: value } };
      }
      return { [field]: value } as Partial<BookingState>;
    }),

  setQuote: (price: number, currency: string, breakdown: Record<string, unknown>) =>
    set({ quotePrice: price, quoteCurrency: currency, quoteBreakdown: breakdown }),

  setCustomExtraQty: (extraId: string, qty: number) =>
    set((state) => {
      const others = state.customExtras.filter((e) => e.extraId !== extraId);
      return {
        customExtras: qty > 0 ? [...others, { extraId, qty }] : others,
      };
    }),

  reset: () => set(initialState),
}));
