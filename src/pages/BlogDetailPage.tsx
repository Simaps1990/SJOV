import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ChevronLeft } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { BlogPost } from '../types';
import { formatDate, sanitizeHtml } from '../utils/formatters';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { blogPosts } = useContent();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (id) {
      const foundPost = blogPosts.find(p => p.id === id);
      if (foundPost) {
        setPost(foundPost);
      } else {
        navigate('/blog');
      }
    }
  }, [id, blogPosts, navigate]);

  if (!post) {
    return (
      <div className="pt-24 pb-16">
        <div className="container-custom">
          <p>Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-custom">
        <Link 
          to="/blog" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ChevronLeft size={16} className="mr-1" /> Retour au blog
        </Link>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-72 md:h-96 overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6 md:p-8">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">{post.title}</h1>
            
            <div className="flex items-center text-neutral-600 mb-6">
              <div className="flex items-center mr-6">
                <Calendar size={18} className="mr-2" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center">
                <User size={18} className="mr-2" />
                <span>{post.author}</span>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
            </div>
{post.imagesannexes && post.imagesannexes.length > 0 && (
  <div
    className={`mt-6 grid gap-4 ${
      post.imagesannexes.length === 1 ? 'grid-cols-1' :
      post.imagesannexes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
    }`}
  >
    {post.imagesannexes.map((img, i) =>
      img ? (
        <div key={i} className="w-full flex justify-center">
          <img
            src={img}
            alt={`Image annexe ${i + 1}`}
            className="max-h-[500px] w-auto object-contain rounded"
          />
        </div>
      ) : null
    )}
  </div>
)}


          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetailPage;