"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  ArrowLeft,
  Share2,
  Bookmark,
  Eye,
  Clock,
} from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  readTime: number;
  tags: string[];
  featuredImage: string;
  views: number;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchBlogPost = async () => {
      // TODO: Replace with actual API call
      // For now, simulate loading with mock data
      setTimeout(() => {
        const mockPost: BlogPost = {
          id: "1",
          slug: slug,
          title: `The Future of Real Estate in Nigeria: Trends for ${
            new Date().getFullYear() + 1
          }`,
          excerpt:
            "Discover the emerging trends shaping Nigeria's real estate market and how RealEST is adapting to meet the needs of modern property seekers.",
          content: `
            <h2>The Rise of Smart Homes</h2>
            <p>Nigeria's real estate market is undergoing a digital transformation. Smart home technology is becoming increasingly accessible, with features like automated security systems, energy-efficient appliances, and remote monitoring becoming standard in new developments.</p>
            <br>
            <h2>Sustainable Living</h2>
            <p>Environmental consciousness is growing among Nigerian property owners. Green building practices, solar power integration, and water conservation systems are becoming more prevalent in both residential and commercial properties.</p>
            <br>
            <h2>Urban Regeneration</h2>
            <p>Cities across Nigeria are investing in urban regeneration projects, transforming older neighborhoods into modern, livable spaces. This trend is creating new opportunities for property investors and developers.</p>
            <br>
            <h2>Flexible Workspaces</h2>
            <p>The rise of remote work has led to increased demand for co-working spaces and home offices. Properties that can accommodate flexible work arrangements are seeing higher demand and rental yields.</p>
            <br>
            <h2>RealEST's Role</h2>
            <p>At RealEST, we're committed to staying ahead of these trends. Our platform incorporates advanced verification technologies, supports sustainable property listings, and provides tools for flexible workspace management.</p>
          `,
          author: {
            name: "Adebayo Johnson",
            avatar: "/avatars/adebayo.jpg",
            bio: "Real Estate Analyst with 10+ years of experience in Nigerian property market trends.",
          },
          publishedAt: "2024-01-15T10:00:00Z",
          readTime: 5,
          tags: [
            "Real Estate Trends",
            "Nigeria",
            "Technology",
            "Sustainability",
          ],
          featuredImage: "/blog/featured/real-estate-trends-2025.jpg",
          views: 1247,
        };

        const mockRelatedPosts: BlogPost[] = [
          {
            id: "2",
            slug: "investing-in-nigerian-real-estate",
            title: "Investing in Nigerian Real Estate: A Beginner's Guide",
            excerpt:
              "Learn the fundamentals of real estate investment in Nigeria's growing market.",
            content: "",
            author: { name: "Sarah Adeolu", avatar: "", bio: "" },
            publishedAt: "2024-01-10T08:00:00Z",
            readTime: 7,
            tags: ["Investment", "Beginners"],
            featuredImage: "",
            views: 892,
          },
          {
            id: "3",
            slug: "home-buying-tips-nigeria",
            title: "Essential Tips for Buying Your First Home in Nigeria",
            excerpt:
              "Navigate the home buying process with confidence using these expert tips.",
            content: "",
            author: { name: "Michael Okafor", avatar: "", bio: "" },
            publishedAt: "2024-01-08T14:00:00Z",
            readTime: 6,
            tags: ["Home Buying", "Tips"],
            featuredImage: "",
            views: 654,
          },
        ];

        setPost(mockPost);
        setRelatedPosts(mockRelatedPosts);
        setIsLoading(false);
      }, 1000);
    };

    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded-lg mb-4"></div>
              <div className="h-64 bg-muted rounded-2xl mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-3 py-2 bg-surface/90 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-surface transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Chip key={tag} variant="secondary" size="sm">
                  {tag}
                </Chip>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{post.views.toLocaleString()} views</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-8">
            <div className="relative h-64 md:h-96 bg-muted rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-accent/10 to-primary/30" />
              {/* Placeholder for actual image */}
            </div>
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none mb-12">
            <div
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Article Actions */}
          <div className="flex items-center justify-between py-6 border-t border-border">
            <div className="flex items-center gap-4">
              <Button variant="secondary">
                <Bookmark className="w-4 h-4 mr-2" />
                Save Article
              </Button>
              <Button variant="secondary">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Published {new Date(post.publishedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Author Bio */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{post.author.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {post.author.bio}
                  </p>
                  <Button variant="secondary" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <Card className="group bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {relatedPost.tags.slice(0, 2).map((tag) => (
                            <Chip key={tag} variant="secondary" size="sm">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{relatedPost.readTime} min read</span>
                          <span>{relatedPost.views} views</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
