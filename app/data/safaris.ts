export interface Safari {
  id: number;
  title: string;
  location: string;
  duration: string;
  image: string;
  price: string;
  rating: number;
  reviews: number;
  category: string;
  description: string;
}

const safaris: Safari[] = [
  {
    id: 1,
    title: "Luxury Maasai Mara Safari",
    location: "Maasai Mara National Reserve",
    duration: "3 Days / 2 Nights",
    image: "/images/safaris/Maasai-Mara.png",
    price: "$450",
    rating: 4.9,
    reviews: 284,
    category: "Luxury",
    description:
      "Witness the Big Five while staying in premium safari lodges."
  },
  {
    id: 2,
    title: "Amboseli Elephant Experience",
    location: "Amboseli National Park",
    duration: "5 Days / 4 Nights",
    image: "/images/safaris/Amboseli.png",
    price: "$780",
    rating: 4.8,
    reviews: 198,
    category: "Adventure",
    description:
      "Enjoy breathtaking views of Mount Kilimanjaro and massive elephant herds."
  },
  {
    id: 3,
    title: "Tsavo Wilderness Escape",
    location: "Tsavo East & West",
    duration: "4 Days / 3 Nights",
    image: "/images/destinations/tsavo.png",
    price: "$620",
    rating: 4.7,
    reviews: 156,
    category: "Wildlife",
    description:
      "Explore Kenya's largest national park with unforgettable game drives."
  }
];

export default safaris;