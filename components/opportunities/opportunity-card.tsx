'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, Users, ExternalLink } from 'lucide-react';

interface Opportunity {
  id: string;
  type: string;
  title: string;
  organization: string;
  location: {
    city: string;
    specificAddress: string;
    remoteOption: boolean;
  };
  category: string;
  compensation: {
    amount: string;
    type: string;
    additionalBenefits: string[];
  };
  timeline: {
    applicationDeadline: string;
    programStart: string;
    programEnd: string;
    durationWeeks: number;
  };
  requirements: {
    gpaMinimum: number | null;
    classYear: string[];
    citizenship: string;
    major: string[];
    skills: string[];
    other: string;
  };
  description: string;
  applicationLink: string;
  contacts: Array<{
    name: string;
    role: string;
    email?: string;
    phone?: string;
  }>;
  image: string;
  dataFreshness: {
    lastUpdated: string;
    sourceUrl: string;
    verificationStatus: string;
  };
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const isUrgent = () => {
    const deadline = new Date(opportunity.timeline.applicationDeadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Tech (FAANG)': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-green-100 text-green-800',
      'Consulting': 'bg-purple-100 text-purple-800',
      'Research': 'bg-orange-100 text-orange-800',
      'Housing': 'bg-gray-100 text-gray-800',
      'Study Abroad': 'bg-pink-100 text-pink-800',
      'Social Impact': 'bg-red-100 text-red-800',
      'Experience': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={opportunity.image}
          alt={opportunity.title}
          fill
          className="object-cover"
        />
        {isUrgent() && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
            🚨 URGENT
          </Badge>
        )}
        <Badge className={`absolute top-2 left-2 ${getCategoryColor(opportunity.category)}`}>
          {opportunity.category}
        </Badge>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Title and Organization */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
            {opportunity.title}
          </h3>
          <p className="text-sm text-gray-600">
            {opportunity.organization}
          </p>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{opportunity.location.city}</span>
          {opportunity.location.remoteOption && (
            <Badge variant="secondary" className="text-xs">Remote Available</Badge>
          )}
        </div>

        {/* Compensation */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-600">{opportunity.compensation.amount}</span>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Deadline: {new Date(opportunity.timeline.applicationDeadline).toLocaleDateString()}</span>
        </div>

        {/* Requirements */}
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4" />
            <span className="font-medium">Requirements:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs">
            {opportunity.requirements.classYear.length > 0 && (
              <li>Class Year: {opportunity.requirements.classYear.join(', ')}</li>
            )}
            {opportunity.requirements.major.length > 0 && (
              <li>Major: {opportunity.requirements.major.slice(0, 2).join(', ')}</li>
            )}
            {opportunity.requirements.gpaMinimum && (
              <li>GPA: {opportunity.requirements.gpaMinimum}+</li>
            )}
          </ul>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 line-clamp-3">
          {opportunity.description}
        </p>

        {/* Action Button */}
        <Button 
          className="w-full" 
          onClick={() => window.open(opportunity.applicationLink, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Apply Now
        </Button>
      </div>
    </div>
  );
};
