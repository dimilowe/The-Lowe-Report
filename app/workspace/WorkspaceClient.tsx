'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Star, Clock, Grid, List, 
  FileText, Image, Video, File, Sparkles, 
  Loader2, Trash2, AlertCircle,
  Upload, CheckCircle, ChevronLeft, ChevronRight, Copy, Folder
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

interface WorkspaceItem {
  id: string;
  title: string;
  type: string;
  origin_cloud_id: string | null;
  cloud_id: string | null;
  is_starred: boolean;
  preview_text: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  folder: string | null;
  tags: string[];
  version_group_id: string;
  version_number: number;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
}

const TYPE_ICONS: Record<string, typeof FileText> = {
  copy_output: FileText,
  prompt_output: Sparkles,
  image_asset: Image,
  ad_bundle: FileText,
  workflow_run: File,
  uploaded_image: Image,
  uploaded_video: Video,
  uploaded_audio: File,
  uploaded_document: FileText,
  uploaded_file: File,
  course_resource: FileText,
  file_output: File,
  generic: File,
};

const TYPE_COLORS: Record<string, string> = {
  copy_output: 'from-blue-400 to-blue-500',
  prompt_output: 'from-purple-400 to-purple-500',
  image_asset: 'from-pink-400 to-pink-500',
  ad_bundle: 'from-orange-400 to-orange-500',
  workflow_run: 'from-green-400 to-green-500',
  uploaded_image: 'from-pink-400 to-pink-500',
  uploaded_video: 'from-red-400 to-red-500',
  uploaded_audio: 'from-green-400 to-green-500',
  uploaded_document: 'from-blue-400 to-blue-500',
  uploaded_file: 'from-gray-400 to-gray-500',
  course_resource: 'from-orange-400 to-orange-500',
  file_output: 'from-gray-400 to-gray-500',
  generic: 'from-zinc-400 to-zinc-500',
};

export default function WorkspaceClient() {
  const router = useRouter();
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'recent' | 'updated' | 'name'>('recent');
  const [starredOnly, setStarredOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [recentProjects, setRecentProjects] = useState<WorkspaceItem[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ fileName: string; status: 'uploading' | 'success' | 'error' }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const initialFetchDone = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async (page: number = currentPage) => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      params.set('sort', sort);
      if (starredOnly) params.set('starred', 'true');
      params.set('limit', String(ITEMS_PER_PAGE));
      params.set('offset', String((page - 1) * ITEMS_PER_PAGE));

      const res = await fetch(`/api/workspace/items?${params}`, { cache: 'no-store' });
      
      if (res.status === 401) {
        router.push('/login?redirect=/workspace');
        return;
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch workspace items:', error);
      setFetchError('Failed to load workspace items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, sort, starredOnly, currentPage, router]);

  const fetchRecentProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('sort', 'recent');
      params.set('limit', '6');
      params.set('offset', '0');
      const res = await fetch(`/api/workspace/items?${params}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setRecentProjects(data.items || []);
    } catch (error) {
      console.error('Failed to fetch recent workspace projects:', error);
    }
  }, []);

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchItems();
      fetchRecentProjects();
    }
  }, []);

  useEffect(() => {
    if (initialFetchDone.current) {
      setCurrentPage(1);
      fetchItems(1);
    }
  }, [sort, starredOnly]);

  useEffect(() => {
    if (initialFetchDone.current) {
      fetchItems(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!initialFetchDone.current) return;
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchItems(1);
    }, 300);
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [search]);

  useEffect(() => {
    const onWorkspaceUpdated = () => {
      void fetchItems(currentPage);
      void fetchRecentProjects();
    };
    window.addEventListener('workspace:items-updated', onWorkspaceUpdated);
    return () => window.removeEventListener('workspace:items-updated', onWorkspaceUpdated);
  }, [fetchItems, fetchRecentProjects, currentPage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const toggleStar = async (id: string, currentStarred: boolean) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, is_starred: !currentStarred } : item
      )
    );
    
    try {
      const res = await fetch(`/api/workspace/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_starred: !currentStarred }),
      });
      
      if (!res.ok) {
        setItems(prev => 
          prev.map(item => 
            item.id === id ? { ...item, is_starred: currentStarred } : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
      setItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_starred: currentStarred } : item
        )
      );
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const itemToDelete = items.find(item => item.id === id);
    setItems(prev => prev.filter(item => item.id !== id));
    setTotal(prev => prev - 1);
    
    try {
      const res = await fetch(`/api/workspace/items/${id}`, { method: 'DELETE' });
      
      if (!res.ok) {
        if (itemToDelete) {
          setItems(prev => [...prev, itemToDelete]);
          setTotal(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      if (itemToDelete) {
        setItems(prev => [...prev, itemToDelete]);
        setTotal(prev => prev + 1);
      }
    }
  };

  const duplicateItem = async (id: string) => {
    try {
      const res = await fetch(`/api/workspace/items/${id}/duplicate`, { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to duplicate item');
      }
      await fetchItems(currentPage);
      await fetchRecentProjects();
    } catch (error) {
      console.error('Failed to duplicate workspace item:', error);
      alert('Failed to duplicate item. Please try again.');
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    let uploadedAny = false;
    const newProgress = Array.from(files).map(f => ({ fileName: f.name, status: 'uploading' as const }));
    setUploadProgress(newProgress);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('cloud_id', 'file-data');
        
        const res = await fetch('/api/workspace/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to upload');
        }
        
        uploadedAny = true;
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'success' } : p
        ));
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'error' } : p
        ));
      }
    }
    
    setUploading(false);
    fetchItems();
    if (uploadedAny && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('workspace:items-updated'));
    }
    
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className="min-h-screen bg-zinc-50 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 bg-orange-500/10 border-4 border-dashed border-orange-500 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Upload className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900">Drop files to upload</h3>
            <p className="text-zinc-500 mt-1">Files will be saved to your workspace</p>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Workspace</h1>
            <p className="text-zinc-500 mt-1">Your files locker for course resources, notes, and homework.</p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              multiple
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="font-medium">Upload Files</span>
            </button>
          </div>
        </div>

        {uploadProgress.length > 0 && (
          <div className="mb-4 bg-white rounded-xl border border-zinc-200 p-4">
            <div className="space-y-2">
              {uploadProgress.map((progress, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {progress.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  )}
                  {progress.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {progress.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-zinc-700 truncate flex-1">{progress.fileName}</span>
                  <span className="text-xs text-zinc-500">
                    {progress.status === 'uploading' ? 'Uploading...' : progress.status === 'success' ? 'Done' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentProjects.length > 0 && (
          <div className="mb-6 bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-800">Recent Files</h2>
              <span className="text-xs text-zinc-500">Jump back into your latest files</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/workspace/${project.id}`}
                  className="flex items-center gap-3 border border-zinc-200 rounded-lg p-3 hover:border-orange-300 hover:bg-orange-50/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                    {project.thumbnail_url ? (
                      <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{project.title}</p>
                    <p className="text-xs text-zinc-500">{formatDate(project.last_opened_at || project.updated_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'recent' | 'updated' | 'name')}
              className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="recent">Recent</option>
              <option value="updated">Updated</option>
              <option value="name">Name</option>
            </select>

            <button
              onClick={() => setStarredOnly(!starredOnly)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                starredOnly 
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-700' 
                  : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Star className={`w-4 h-4 ${starredOnly ? 'fill-yellow-400' : ''}`} />
              <span className="text-sm font-medium">Starred</span>
            </button>

            <div className="flex items-center gap-1 border border-zinc-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {fetchError ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Something went wrong</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-4">{fetchError}</p>
            <button
              onClick={() => fetchItems(currentPage)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">No items yet</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">
              {search || starredOnly
                ? 'No items match your filters. Try adjusting your search.'
                : 'Upload your course resources, notes, and homework files to keep everything in one place.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const IconComponent = TYPE_ICONS[item.type] || TYPE_ICONS.generic;
              const colorGradient = TYPE_COLORS[item.type] || TYPE_COLORS.generic;
              
              return (
                <div key={item.id} className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/workspace/${item.id}`}>
                    <div className="aspect-video relative">
                      {item.thumbnail_url ? (
                        <img 
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${colorGradient} flex items-center justify-center`}>
                          <IconComponent className="w-10 h-10 text-white/80" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/workspace/${item.id}`}>
                      <h3 className="font-medium text-zinc-900 text-sm truncate group-hover:text-orange-500 transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    {item.preview_text && (
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.preview_text}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.folder && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600">
                          <Folder className="w-3 h-3" />
                          {item.folder}
                        </span>
                      )}
                      {item.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700">
                          #{tag}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                        v{item.version_number || 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.last_opened_at || item.updated_at)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.preventDefault(); toggleStar(item.id, item.is_starred); }}
                          className="p-1 hover:bg-zinc-100 rounded transition-colors"
                        >
                          <Star className={`w-4 h-4 ${item.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300'}`} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); duplicateItem(item.id); }}
                          className="p-1 hover:bg-zinc-100 rounded transition-colors text-zinc-300 hover:text-zinc-600"
                          title="Duplicate as new version"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); deleteItem(item.id); }}
                          className="p-1 hover:bg-red-50 rounded transition-colors text-zinc-300 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const IconComponent = TYPE_ICONS[item.type] || TYPE_ICONS.generic;
              const colorGradient = TYPE_COLORS[item.type] || TYPE_COLORS.generic;
              
              return (
                <div key={item.id} className="group bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md transition-shadow flex items-center gap-4">
                  <Link href={`/workspace/${item.id}`} className="flex-shrink-0">
                    {item.thumbnail_url ? (
                      <img 
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${colorGradient} flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white/80" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/workspace/${item.id}`}>
                      <h3 className="font-medium text-zinc-900 truncate group-hover:text-orange-500 transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    {item.preview_text && (
                      <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">{item.preview_text}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-zinc-400 uppercase">{item.type.replace('_', ' ')}</span>
                      {item.folder && (
                        <span className="text-xs text-zinc-500 inline-flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          {item.folder}
                        </span>
                      )}
                      {item.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                          #{tag}
                        </span>
                      ))}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        v{item.version_number || 1}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.last_opened_at || item.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStar(item.id, item.is_starred)}
                      className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <Star className={`w-5 h-5 ${item.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300'}`} />
                    </button>
                    <button
                      onClick={() => duplicateItem(item.id)}
                      className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-300 hover:text-zinc-600"
                      title="Duplicate as new version"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-zinc-300 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pb-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-600" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-zinc-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-orange-500 text-white'
                      : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-zinc-600" />
            </button>
            
            <span className="ml-4 text-sm text-zinc-500">
              {total} items
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
