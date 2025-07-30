export const categories = [
  {
    icon: "https://cdn-icons-png.flaticon.com/128/12516/12516451.png",
    title: "Fashion & Beauty",
  },
  // ... rest of the categories
];

export const heroInfluencers = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  // ... rest of the hero images
];

export const stats = [
  { value: "5,234", label: "Active Influencers" },
  { value: "3,400+", label: "Brands" },
  { value: "24/7", label: "Support" },
];

interface Influencer {
  name: string;
  avatar: string;
  category: string;
  rating: number;
  followers: string;
  location: string;
  price: string;
  description: string;
}

export const influencers: Influencer[] = [
  {
    name: "James Wilson",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    category: "Fashion & Beauty",
    rating: 4.8,
    followers: "1.2M",
    location: "New York, USA",
    price: "$500",
    description:
      "Fashion and lifestyle content creator specializing in sustainable fashion and minimalist style guides.",
  },
  // ... other influencers
];
