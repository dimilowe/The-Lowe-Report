'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Star, Copy, Check, Clock, Calendar, 
  FileText, Image, Sparkles, File, Trash2, Download, Folder, Tag, Save, GitBranch
} from 'lucide-react';

interface WorkspaceItemData {
  id: string;
  title: string;
  type: string;
  origin_cloud_id: string | null;
  cloud_id: string | null;
  workflow_id: string | null;
  is_starred: boolean;
  preview_text: string | null;
  payload_json: Record<string, any>;
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

interface Props {
  item: WorkspaceItemData;
}

const TYPE_ICONS: Record<string, typeof FileText> = {
  copy_output: FileText,
  prompt_output: Sparkles,
  image_asset: Image,
  ad_bundle: FileText,
  workflow_run: File,
  course_resource: FileText,
  generic: File,
};

export default function WorkspaceItemClient({ item }: Props) {
  const router = useRouter();
  const [isStarred, setIsStarred] = useState(item.is_starred);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [folderInput, setFolderInput] = useState(item.folder || '');
  const [tagsInput, setTagsInput] = useState((item.tags || []).join(', '));
  const [savingMeta, setSavingMeta] = useState(false);
  const [versions, setVersions] = useState<Array<{
    id: string;
    title: string;
    type: string;
    created_at: string;
    last_opened_at: string | null;
    updated_at: string;
    version_group_id: string;
    version_number: number;
    version_note?: string | null;
  }>>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNoteInput, setVersionNoteInput] = useState('');
  const [creatingVersion, setCreatingVersion] = useState(false);

  const IconComponent = TYPE_ICONS[item.type] || TYPE_ICONS.generic;

  const toggleStar = async () => {
    try {
      await fetch(`/api/workspace/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_starred: !isStarred }),
      });
      setIsStarred(!isStarred);
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const deleteItem = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/workspace/items/${item.id}`, { method: 'DELETE' });
      router.push('/workspace');
    } catch (error) {
      console.error('Failed to delete:', error);
      setDeleting(false);
    }
  };

  const saveMetadata = async () => {
    setSavingMeta(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 20);

      const res = await fetch(`/api/workspace/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: folderInput.trim(),
          tags,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save metadata');
      }
    } catch (error) {
      console.error('Failed to save metadata:', error);
      alert('Failed to save metadata. Please try again.');
    } finally {
      setSavingMeta(false);
    }
  };

  const duplicateAsVersion = async (sourceId: string = item.id) => {
    setCreatingVersion(true);
    try {
      const res = await fetch(`/api/workspace/items/${sourceId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version_note: versionNoteInput.trim(),
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to duplicate version');
      }
      const data = await res.json();
      if (data?.id) {
        setShowVersionModal(false);
        setVersionNoteInput('');
        router.push(`/workspace/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to duplicate as version:', error);
      alert('Failed to create a new version.');
    } finally {
      setCreatingVersion(false);
    }
  };

  const loadVersions = async () => {
    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/workspace/items/${item.id}/versions`);
      if (!res.ok) return;
      const data = await res.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoadingVersions(false);
    }
  };

  const restoreVersionAsLatest = async (versionId: string) => {
    try {
      const res = await fetch(`/api/workspace/items/${versionId}/duplicate`, { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to restore version');
      }
      const data = await res.json();
      if (data?.id) {
        router.push(`/workspace/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert('Failed to restore this version.');
    }
  };

  const deleteVersion = async (versionId: string) => {
    if (!confirm('Delete this version permanently?')) return;
    try {
      const res = await fetch(`/api/workspace/items/${versionId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete version');
      }
      if (versionId === item.id) {
        router.push('/workspace');
        return;
      }
      await loadVersions();
    } catch (error) {
      console.error('Failed to delete version:', error);
      alert('Failed to delete this version.');
    }
  };

  useEffect(() => {
    loadVersions();
  }, [item.id]);

  const openSaveVersionModal = () => {
    setVersionNoteInput('');
    setShowVersionModal(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPayload = () => {
    const payload = item.payload_json;
    if (!payload || Object.keys(payload).length === 0) {
      return (
        <p className="text-zinc-500 italic">No content available</p>
      );
    }

    const renderValue = (key: string, value: any) => {
      if (typeof value === 'string') {
        return (
          <div key={key} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-zinc-700 capitalize">
                {key.replace(/_/g, ' ')}
              </h4>
              <button
                onClick={() => copyToClipboard(value, key)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-500 transition-colors"
              >
                {copied === key ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm text-zinc-800 whitespace-pre-wrap font-mono overflow-x-auto">
              {value}
            </pre>
          </div>
        );
      }
      
      if (Array.isArray(value)) {
        return (
          <div key={key} className="mb-6">
            <h4 className="text-sm font-semibold text-zinc-700 capitalize mb-2">
              {key.replace(/_/g, ' ')}
            </h4>
            <ul className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2">
              {value.map((item, idx) => (
                <li key={idx} className="text-sm text-zinc-800">
                  {typeof item === 'string' ? item : JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </div>
        );
      }

      if (typeof value === 'object' && value !== null) {
        return (
          <div key={key} className="mb-6">
            <h4 className="text-sm font-semibold text-zinc-700 capitalize mb-2">
              {key.replace(/_/g, ' ')}
            </h4>
            <pre className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm text-zinc-800 whitespace-pre-wrap font-mono overflow-x-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        );
      }

      return null;
    };

    return (
      <div>
        {Object.entries(payload)
          .filter(([key]) => !['folder', 'tags', 'version_group_id', 'version_number', 'duplicated_from_item_id'].includes(key))
          .map(([key, value]) => renderValue(key, value))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/workspace"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          {item.thumbnail_url ? (
            <div className="w-full aspect-video bg-zinc-100">
              <img 
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full aspect-video bg-zinc-100 flex items-center justify-center">
              <IconComponent className="w-12 h-12 text-zinc-400" />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-zinc-500 uppercase bg-zinc-100 px-2 py-0.5 rounded">
                    {item.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    v{item.version_number || 1}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-zinc-900">{item.title}</h1>
                {item.preview_text && (
                  <p className="text-zinc-500 mt-2">{item.preview_text}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {item.file_url && (
                  <a
                    href={item.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
                <button
                  onClick={toggleStar}
                  className={`p-2 rounded-lg transition-colors ${
                    isStarred ? 'bg-yellow-50 text-yellow-500' : 'bg-zinc-100 text-zinc-400 hover:text-yellow-500'
                  }`}
                >
                  <Star className={`w-5 h-5 ${isStarred ? 'fill-yellow-400' : ''}`} />
                </button>
                <button
                  onClick={openSaveVersionModal}
                  className="p-2 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 rounded-lg transition-colors"
                  title="Save as new version"
                >
                  <GitBranch className="w-5 h-5" />
                </button>
                <button
                  onClick={deleteItem}
                  disabled={deleting}
                  className="p-2 bg-zinc-100 text-zinc-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-zinc-500 mb-8 pb-6 border-b border-zinc-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(item.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated: {formatDate(item.updated_at)}
              </span>
            </div>

            <div className="mb-8 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-900">Project Organization</h3>
                <button
                  onClick={saveMetadata}
                  disabled={savingMeta}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingMeta ? 'Saving...' : 'Save'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Folder</label>
                  <div className="relative mt-1">
                    <Folder className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={folderInput}
                      onChange={(e) => setFolderInput(e.target.value)}
                      placeholder="e.g. Client Campaigns"
                      className="w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Tags</label>
                  <div className="relative mt-1">
                    <Tag className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="comma,separated,tags"
                      className="w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 p-4 rounded-xl border border-zinc-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-900">Version History</h3>
                <span className="text-xs text-zinc-500">Version group: {item.version_group_id}</span>
              </div>
              <div className="mb-3">
                <button
                  onClick={openSaveVersionModal}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                >
                  <GitBranch className="w-4 h-4" />
                  Save as New Version
                </button>
              </div>
              {loadingVersions ? (
                <p className="text-sm text-zinc-500">Loading versions...</p>
              ) : versions.length === 0 ? (
                <p className="text-sm text-zinc-500">No versions found.</p>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={`flex items-center justify-between border rounded-lg px-3 py-2 text-sm transition-colors ${
                        version.id === item.id
                          ? 'border-orange-300 bg-orange-50 text-orange-700'
                          : 'border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <Link href={`/workspace/${version.id}`} className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">v{version.version_number} - {version.title}</span>
                          {version.id === item.id && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Current</span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          Updated {formatDate(version.updated_at)}
                        </div>
                        {version.version_note && (
                          <div className="text-xs text-zinc-600 mt-1 line-clamp-2">
                            Note: {version.version_note}
                          </div>
                        )}
                      </Link>
                      <div className="flex items-center gap-2">
                        {version.id !== item.id && (
                          <button
                            onClick={() => restoreVersionAsLatest(version.id)}
                            className="text-xs px-2 py-1 rounded border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                          >
                            Restore as Latest
                          </button>
                        )}
                        <button
                          onClick={() => deleteVersion(version.id)}
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Content</h3>
              {renderPayload()}
            </div>
          </div>
        </div>
      </div>
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-xl p-5">
            <h3 className="text-lg font-semibold text-zinc-900">Save as New Version</h3>
            <p className="text-sm text-zinc-600 mt-1">
              This keeps your current version unchanged and creates a new snapshot.
            </p>
            <div className="mt-4">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                Version Note (optional)
              </label>
              <textarea
                value={versionNoteInput}
                onChange={(e) => setVersionNoteInput(e.target.value)}
                maxLength={280}
                placeholder="What changed in this version?"
                className="mt-1 w-full min-h-[110px] border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="mt-1 text-right text-xs text-zinc-500">
                {versionNoteInput.length}/280
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowVersionModal(false)}
                disabled={creatingVersion}
                className="px-3 py-2 text-sm rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => duplicateAsVersion(item.id)}
                disabled={creatingVersion}
                className="px-3 py-2 text-sm rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {creatingVersion ? 'Creating...' : 'Create Version'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
