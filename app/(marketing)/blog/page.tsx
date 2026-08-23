"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { 
  Card, 
  Input,
  CardContent,
  Button
} from "@/components/ui";
import {
  Calendar,
  User,
  Search,
  Filter,
  TrendingUp,
  BookOpen,
  Clock,
  Eye,
} from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  tags: string[];
  featuredImage: string;
  views: number;
  featured: boolean;
}

interface BlogCategory {
  id: string;
  name: string;
  count: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchBlogData = async () => {
      // TODO: Replace with actual API calls
      // For now, simulate loading with mock data
      setTimeout(() => {
        const mockCategories: BlogCategory[] = [
          { id: "all", name: "All Posts", count: 24 },
          { id: "real-estate-trends", name: "Real Estate Trends", count: 8 },
          { id: "investment", name: "Investment", count: 6 },
          { id: "home-buying", name: "Home Buying", count: 5 },
          { id: "market-analysis", name: "Market Analysis", count: 5 },
        ];

        const mockPosts: BlogPost[] = [
          {
            id: "1",
            slug: "future-of-real-estate-nigeria-2025",
            title: "The Future of Real Estate in Nigeria: Trends for 2025",
            excerpt:
              "Discover the emerging trends shaping Nigeria's real estate market and how RealEST is adapting to meet the needs of modern property seekers.",
            author: { name: "Adebayo Johnson", avatar: "" },
            publishedAt: "2024-01-15T10:00:00Z",
            readTime: 5,
            tags: ["Real Estate Trends", "Nigeria", "Technology"],
            featuredImage: "",
            views: 1247,
            featured: true,
          },
          {
            id: "2",
            slug: "investing-in-nigerian-real-estate",
            title: "Investing in Nigerian Real Estate: A Beginner's Guide",
            excerpt:
              "Learn the fundamentals of real estate investment in Nigeria's growing market.",
            author: { name: "Sarah Adeolu", avatar: "" },
            publishedAt: "2024-01-10T08:00:00Z",
            readTime: 7,
            tags: ["Investment", "Beginners"],
            featuredImage: "",
            views: 892,
            featured: false,
          },
          {
            id: "3",
            slug: "home-buying-tips-nigeria",
            title: "Essential Tips for Buying Your First Home in Nigeria",
            excerpt:
              "Navigate the home buying process with confidence using these expert tips.",
            author: { name: "Michael Okafor", avatar: "" },
            publishedAt: "2024-01-08T14:00:00Z",
            readTime: 6,
            tags: ["Home Buying", "Tips"],
            featuredImage: "",
            views: 654,
            featured: false,
          },
          {
            id: "4",
            slug: "sustainable-living-nigeria",
            title: "Sustainable Living: Green Homes in Nigeria",
            excerpt:
              "Explore how eco-friendly homes are becoming more accessible in Nigeria's urban centers.",
            author: { name: "Ngozi Eze", avatar: "" },
            publishedAt: "2024-01-05T09:00:00Z",
            readTime: 4,
            tags: ["Sustainability", "Green Living"],
            featuredImage: "",
            views: 567,
            featured: true,
          },
          {
            id: "5",
            slug: "property-valuation-guide",
            title: "Understanding Property Valuation in Nigeria",
            excerpt:
              "A comprehensive guide to property valuation methods and factors affecting property prices.",
            author: { name: "David Nwosu", avatar: "" },
            publishedAt: "2024-01-03T11:00:00Z",
            readTime: 8,
            tags: ["Property Valuation", "Market Analysis"],
            featuredImage: "",
            views: 723,
            featured: false,
          },
          {
            id: "6",
            slug: "rental-property-management",
            title: "Managing Rental Properties: Best Practices",
            excerpt:
              "Learn how to effectively manage rental properties and maximize your returns.",
            author: { name: "Grace Adebayo", avatar: "" },
            publishedAt: "2023-12-28T13:00:00Z",
            readTime: 6,
            tags: ["Property Management", "Investment"],
            featuredImage: "",
            views: 445,
            featured: false,
          },
        ];

        setCategories(mockCategories);
        setPosts(mockPosts);
        setFeaturedPosts(mockPosts.filter((post) => post.featured));
        setIsLoading(false);
      }, 1000);
    };

    fetchBlogData();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      post.tags.some((tag) =>
        tag.toLowerCase().replace(/\s+/g, "-").includes(selectedCategory),
      );
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-12 bg-muted rounded-lg mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                RealEST Blog
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Insights & Trends in Nigerian Real Estate
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay informed with expert analysis, market trends, and practical
              advice for navigating Nigeria's dynamic real estate landscape.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="secondary">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface/90 hover:bg-surface border border-border/50"
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">Featured Articles</h2>
              <p className="text-muted-foreground">
                Must-read insights from our expert contributors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* Featured Image */}
                    <div className="relative h-48 bg-muted rounded-t-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-accent/10 to-primary/30" />
                      <div className="absolute top-3 left-3">
                        <Chip
                          variant="secondary"
                          className="bg-accent/20 text-accent border-accent/30"
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Featured
                        </Chip>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Chip key={tag} variant="secondary" size="sm">
                            {tag}
                          </Chip>
                        ))}
                      </div>

                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime} min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all"
                ? "All Articles"
                : `${categories.find((c) => c.id === selectedCategory)?.name || "Articles"}`}
            </h2>
            <span className="text-muted-foreground">
              {filteredPosts.length} articles
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                <Search className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-body-m text-muted-foreground mb-2">
                  No articles found matching your criteria.
                </p>
                <p className="text-body-s text-muted-foreground/80 mb-4">
                  Try adjusting your search or filter settings.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* Post Image */}
                    <div className="relative h-48 bg-muted rounded-t-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-accent/10 to-primary/30" />
                      {post.featured && (
                        <div className="absolute top-3 left-3">
                          <Chip
                            variant="secondary"
                            className="bg-accent/20 text-accent border-accent/30 text-xs"
                          >
                            Featured
                          </Chip>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Chip key={tag} variant="secondary" size="sm">
                            {tag}
                          </Chip>
                        ))}
                      </div>

                      <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(post.publishedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}m</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Get the latest real estate insights and market trends delivered to
              your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button variant="default">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
