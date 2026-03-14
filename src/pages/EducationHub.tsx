import { useState } from 'react';
import { 
  BookOpen, Search, Clock, User, ArrowRight, Apple, Dumbbell,
  Brain, Baby, HeartPulse, Sparkles, X, Calendar, Tag
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { educationArticles, type EducationArticle } from '@/data/education';

const categories = [
  { id: 'all', label: 'All Topics', icon: BookOpen },
  { id: 'nutrition', label: 'Nutrition & Diet', icon: Apple },
  { id: 'exercise', label: 'Exercise & Fitness', icon: Dumbbell },
  { id: 'mental-health', label: 'Mental Health', icon: Brain },
  { id: 'prenatal', label: 'Prenatal Care', icon: Baby },
  { id: 'postnatal', label: 'Postnatal Care', icon: HeartPulse },
  { id: 'newborn', label: 'Newborn Care', icon: Sparkles },
];

export default function EducationHub() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<EducationArticle | null>(null);

  const filteredArticles = educationArticles.filter((article) => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Parse markdown-like content to JSX
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: React.ReactElement[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-2xl font-bold text-mamacare-charcoal mt-8 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-xl font-semibold text-mamacare-charcoal mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={key++} className="ml-6 text-gray-700 leading-relaxed">
            {line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
          </li>
        );
      } else if (line.startsWith('**') && line.includes(':**')) {
        elements.push(
          <p key={key++} className="text-gray-700 leading-relaxed mt-2">
            <strong>{line.split(':**')[0].replace('**', '')}:</strong>
            {line.split(':**')[1]}
          </p>
        );
      } else if (line === '') {
        continue;
      } else {
        elements.push(
          <p key={key++} className="text-gray-700 leading-relaxed mt-2">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-mamacare-coral/10 via-white to-mamacare-champagne">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-mamacare-charcoal mb-6">
              {t('educationTitle')}
            </h1>
            <p className="text-xl text-mamacare-dark-grey max-w-2xl mx-auto">
              {t('educationSubtitle')}
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mt-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg rounded-full shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-mamacare-coral text-white'
                    : 'bg-mamacare-champagne text-mamacare-charcoal hover:bg-mamacare-coral/20'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 bg-mamacare-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className="overflow-hidden card-lift bg-white border-none shadow-lg cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="px-3 py-1 bg-mamacare-coral/10 text-mamacare-coral text-xs font-medium rounded-full">
                        {categories.find(c => c.id === article.category)?.label}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {article.readTime} min read
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-mamacare-charcoal mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{article.author}</span>
                      </div>
                      <button className="flex items-center gap-1 text-mamacare-coral text-sm font-medium hover:underline">
                        {t('readMore')} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-display text-xl text-gray-500">No articles found</h3>
              <p className="text-gray-400">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Topics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-mamacare-charcoal mb-8">Featured Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Nutrition & Diet', desc: 'Essential nutrients for a healthy pregnancy', icon: Apple, color: 'bg-green-100 text-green-600' },
              { title: 'Exercise & Fitness', desc: 'Safe exercises during each trimester', icon: Dumbbell, color: 'bg-blue-100 text-blue-600' },
              { title: 'Mental Health', desc: 'Managing pregnancy anxiety and stress', icon: Brain, color: 'bg-purple-100 text-purple-600' },
              { title: 'Prenatal Care', desc: 'What to expect during pregnancy', icon: Baby, color: 'bg-pink-100 text-pink-600' },
              { title: 'Postnatal Care', desc: 'Recovery after childbirth', icon: HeartPulse, color: 'bg-red-100 text-red-600' },
              { title: 'Newborn Care', desc: 'Essential tips for new parents', icon: Sparkles, color: 'bg-amber-100 text-amber-600' },
            ].map((topic, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-mamacare-champagne/30 transition-colors cursor-pointer">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${topic.color}`}>
                  <topic.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-mamacare-charcoal">{topic.title}</h3>
                  <p className="text-sm text-gray-600">{topic.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Header Image */}
            <div className="relative h-64 sm:h-80">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover rounded-t-2xl"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <span className="px-3 py-1 bg-mamacare-coral text-white text-sm font-medium rounded-full">
                  {categories.find(c => c.id === selectedArticle.category)?.label}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Title and Meta */}
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-mamacare-charcoal mb-4">
                {selectedArticle.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {selectedArticle.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedArticle.publishedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.readTime} min read
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedArticle.tags.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-600 italic mb-6">{selectedArticle.excerpt}</p>
                <div className="border-t pt-6">
                  {renderContent(selectedArticle.content)}
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-8 pt-6 border-t flex justify-end">
                <Button onClick={() => setSelectedArticle(null)} variant="outline">
                  Close Article
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
