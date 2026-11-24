export type Stay = {
  id: number;
  name: string;
  location: string;
  image: string;
  price: string;
  rating: number;
  description: string;
};

export const hotels: Stay[] = [
  {
    id: 1,
    name: "Sarova Stanley",
    location: "Nairobi, Kenya",
    image: "/images/hotels/Sarova Stanely.png",
    price: "$180",
    rating: 4.8,
    description: "Historic luxury hotel in the heart of Nairobi.",
  },
  {
    id: 2,
    name: "Serena Beach Resort",
    location: "Mombasa, Kenya",
    image: "/images/hotels/serena beach.png",
    price: "$240",
    rating: 4.9,
    description: "Luxury beachfront resort overlooking the Indian Ocean.",
  },
  {
    id: 3,
    name: "Fairmont Mount Kenya Safari Club",
    location: "Nanyuki, Kenya",
    image: "/images/hotels/fairmont mt fenya.png",
    price: "$350",
    rating: 5.0,
    description: "World-class luxury with spectacular Mount Kenya views.",
  },
];

export const airbnbStays: Stay[] = [
  {
    id: 101,
    name: "Diani Beach Apartment",
    location: "Diani Beach, Kenya",
    image: "/images/destinations/Diani.png",
    price: "$95",
    rating: 4.8,
    description: "A relaxed self-catering stay close to Diani's white-sand beach.",
  },
  {
    id: 102,
    name: "Nairobi Garden Guesthouse",
    location: "Nairobi, Kenya",
    image: "/images/hotels/Sarova Stanely.png",
    price: "$80",
    rating: 4.7,
    description: "A comfortable city stay with easy access to central Nairobi.",
  },
  {
    id: 103,
    name: "Zanzibar Seaside Villa",
    location: "Zanzibar, Tanzania",
    image: "/images/destinations/Zanzibar.PNG",
    price: "$130",
    rating: 4.9,
    description: "A private island stay for a quiet beach getaway.",
  },
];
