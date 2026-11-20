'use client';

/* eslint-disable @next/next/no-img-element -- signed Supabase URLs are short-lived and private; next/image would cache them */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ImagePlus, Lock, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/context/progress-context';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import { cn, parseDateKey, todayKey } from '@/lib/utils';

export const PHOTO_BUCKET = 'progress-photos';
const MAX_EDGE = 1280;

async function resizeToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', 0.85)
  );
}

function formatDate(key: string) {
  return parseDateKey(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ProgressPhotos() {
  const { progress, addProgressPhoto, removeProgressPhoto } = useProgress();
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);
  const fileInput = useRef<HTMLInputElement>(null);
  /** Paths a signed URL was already requested for — never re-request a failing one in a loop. */
  const requested = useRef(new Set<string>());

  const [urls, setUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [setupMissing, setSetupMissing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [beforeId, setBeforeId] = useState<string | null>(null);
  const [afterId, setAfterId] = useState<string | null>(null);
  const [split, setSplit] = useState(50);

  const photos = useMemo(
    () => [...progress.progressPhotos].sort((a, b) => a.date.localeCompare(b.date)),
    [progress.progressPhotos]
  );
  const before = photos.find((p) => p.id === beforeId) ?? photos[0];
  const after = photos.find((p) => p.id === afterId) ?? photos[photos.length - 1];

  // Signed URLs (1 hour) for any photo we don't have one for yet.
  useEffect(() => {
    const missing = photos.map((p) => p.path).filter((path) => !urls[path] && !requested.current.has(path));
    if (missing.length === 0) return;
    missing.forEach((path) => requested.current.add(path));
    void supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrls(missing, 3600)
      .then(({ data, error }) => {
        if (error) {
          if (/bucket not found/i.test(error.message)) setSetupMissing(true);
          return;
        }
        const next: Record<string, string> = {};
        for (const item of data ?? []) if (item.signedUrl && item.path) next[item.path] = item.signedUrl;
        setUrls((prev) => ({ ...prev, ...next }));
      });
  }, [photos, urls, supabase]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file.', 'error');
      return;
    }
    setUploading(true);
    try {
      const blob = await resizeToJpeg(file);
      const id = crypto.randomUUID();
      const path = `${user.id}/${id}.jpg`;
      const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
      if (error) {
        if (/bucket not found/i.test(error.message)) setSetupMissing(true);
        throw error;
      }
      addProgressPhoto({ id, date: todayKey(), path });
      setAfterId(id);
      toast('Photo added.');
    } catch {
      toast('Could not upload the photo.', 'error');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    const photo = photos.find((p) => p.id === id);
    setConfirmDelete(null);
    if (!photo) return;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([photo.path]);
    if (error) {
      toast('Could not delete the photo.', 'error');
      return;
    }
    removeProgressPhoto(id);
    toast('Photo deleted.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Photos</CardTitle>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          <Lock size={11} /> Private to you
        </span>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        {setupMissing ? (
          <p className="mb-4 rounded-sm border border-danger/30 bg-danger-dim px-3 py-2 text-sm text-ink-muted">
            Photo storage isn&apos;t set up on the server yet. Run the &ldquo;progress photos&rdquo; section of{' '}
            <code className="font-mono text-xs">supabase/schema.sql</code> in the Supabase SQL editor, then try again.
          </p>
        ) : null}

        {photos.length >= 2 && before && after ? (
          <div className="mb-5">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-md border border-line bg-surface-raised">
              {urls[after.path] ? (
                <img src={urls[after.path]} alt={`After — ${formatDate(after.date)}`} className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              {urls[before.path] ? (
                <img
                  src={urls[before.path]}
                  alt={`Before — ${formatDate(before.date)}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
                />
              ) : null}
              <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-ink/80" style={{ left: `${split}%` }} />
              <span className="absolute left-2 top-2 rounded-xs bg-bg/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink">
                {formatDate(before.date)}
              </span>
              <span className="absolute right-2 top-2 rounded-xs bg-bg/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink">
                {formatDate(after.date)}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={split}
                onChange={(e) => setSplit(Number(e.target.value))}
                aria-label="Compare before and after"
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>
            <div className="mx-auto mt-3 grid max-w-sm grid-cols-2 gap-2">
              {[
                { label: 'Before', value: before.id, set: setBeforeId },
                { label: 'After', value: after.id, set: setAfterId },
              ].map((s) => (
                <label key={s.label} className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {s.label}
                  <select
                    value={s.value}
                    onChange={(e) => s.set(e.target.value)}
                    className="rounded-sm border border-line bg-bg px-2 py-2 text-sm normal-case tracking-normal text-ink focus:border-forge focus:outline-none"
                  >
                    {photos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {formatDate(p.date)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-ink-faint">Drag across the photo to compare.</p>
          </div>
        ) : null}

        {photos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line px-6 py-8 text-center">
            <Camera size={22} className="text-ink-faint" />
            <p className="text-sm text-ink-muted">Take one now and another every few weeks — same spot, same light.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {[...photos].reverse().map((p) => (
              <div key={p.id} className="group relative aspect-[3/4] overflow-hidden rounded-sm border border-line bg-surface-raised">
                {urls[p.path] ? <img src={urls[p.path]} alt={`Progress photo, ${formatDate(p.date)}`} className="h-full w-full object-cover" /> : null}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 to-transparent px-1.5 pb-1 pt-4 font-mono text-[10px] text-ink">
                  {formatDate(p.date)}
                </span>
                <button
                  onClick={() => void handleDelete(p.id)}
                  aria-label={confirmDelete === p.id ? 'Tap again to delete photo' : 'Delete photo'}
                  className={cn(
                    'absolute right-1 top-1 rounded-xs p-1 transition-colors',
                    confirmDelete === p.id ? 'bg-danger text-bg' : 'bg-bg/70 text-ink-muted hover:text-danger'
                  )}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={() => fileInput.current?.click()} loading={uploading} variant="secondary" className="mt-4">
          <ImagePlus size={16} />
          Add Photo
        </Button>
      </CardContent>
    </Card>
  );
}
