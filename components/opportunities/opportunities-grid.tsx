'use client';

import React, { useState } from 'react';
import { OpportunityCard } from './opportunity-card';
import { summerAppData, filterByCity, filterByCategory, getUpcomingDeadlines } from '@/lib/data/summer-opportunities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, MapPin } from 'lucide-react';

export const OpportunitiesGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Get all opportunities
  let filteredOpportunities = summerAppData.opportunities;

  // Filter by search term
  if (searchTerm) {
    filteredOpportunities = filteredOpportunities.filter(opp =>
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter by category
  if (selectedCategory !== 'all') {
    filteredOpportunities = filteredOpportunities.filter(opp => opp.category === selectedCategory);
  }

  // Filter by city
  if (selectedCity !== 'all') {
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.location.city === selectedCity || opp.location.city === "Multiple"
    );
  }

  // Filter by urgent deadlines
  if (showUrgentOnly) {
    filteredOpportunities = filteredOpportunities.filter(opp => {
      const deadline = new Date(opp.timeline.applicationDeadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
    });
  }

  // Get unique categories and cities for filters
  const categories = Array.from(new Set(summerAppData.opportunities.map(opp => opp.category)));
  const cities = Array.from(new Set(summerAppData.opportunities.map(opp => opp.location.city)));

  // Get urgent opportunities count
  const urgentCount = getUpcomingDeadlines(7).length;

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Summer Opportunities 2025
        </h1>
        <p className="text-gray-600">
          Discover {summerAppData.opportunities.length} verified opportunities across tech, finance, consulting, research, and more.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showUrgentOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowUrgentOnly(!showUrgentOnly)}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Urgent Deadlines ({urgentCount})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedCity('all');
              setShowUrgentOnly(false);
            }}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredOpportunities.length} of {summerAppData.opportunities.length} opportunities
        </p>
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find more opportunities.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedCity('all');
              setShowUrgentOnly(false);
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{summerAppData.opportunities.length}</div>
            <div className="text-sm text-gray-600">Total Opportunities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{Object.keys(summerAppData.collectionMetadata.coverageByCities).length}</div>
            <div className="text-sm text-gray-600">Cities Covered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{Object.keys(summerAppData.collectionMetadata.coverageByCategory).length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{urgentCount}</div>
            <div className="text-sm text-gray-600">Urgent Deadlines</div>
          </div>
        </div>
      </div>
    </div>
  );
};
