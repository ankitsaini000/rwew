import React from 'react';
import { Star, Users, MapPin } from 'lucide-react';
import { Button } from './ui/button';

interface InfluencerCardProps {
  name: string;
  avatar: string;
  category: string;
  rating: number;
  followers: string;
  location: string;
  price: string;
  description: string;
}

export function InfluencerCard({
  name,
  avatar,
  category,
  rating,
  followers,
  location,
  price,
  description,
}: InfluencerCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <img
          src={avatar}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-500">{category}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{followers}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{location}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">{price}</p>
          <p className="text-sm text-gray-500">per post</p>
        </div>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="flex gap-2">
        <Button className="flex-1">Book Now</Button>
        <Button variant="outline" className="flex-1">View Profile</Button>
      </div>
    </div>
  );
}