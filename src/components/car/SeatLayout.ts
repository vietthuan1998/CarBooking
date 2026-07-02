import type { CarLayout } from "../../features/car/types";

export const sevenSeatLayout: CarLayout = {
  seats: [
    {
      id: 1,
      x: 60,
      y: 20,
      label: "T",
      isDriver: true,
    },

    {
      id: 2,
      x: 60,
      y: 60,
    },

    {
      id: 3,
      x: 45,
      y: 20,
    },
    {
      id: 4,
      x: 45,
      y: 40,
    },
    {
      id: 5,
      x: 45,
      y: 60,
    },

    {
      id: 6,
      x: 28,
      y: 20,
    },
    {
      id: 7,
      x: 28,
      y: 40,
    },
    {
      id: 8,
      x: 28,
      y: 60,
    },
  ],
};

export const fourSeatLayout: CarLayout = {
  seats: [
    {
      id: 1,
      x: 55,
      y: 20,
      label: "T",
      isDriver: true,
    },

    {
      id: 2,
      x: 55,
      y: 60,
    },
    {
      id: 3,
      x: 28,
      y: 20,
    },
    {
      id: 4,
      x: 28,
      y: 40,
    },
    {
      id: 5,
      x: 28,
      y: 60,
    },
  ],
};
