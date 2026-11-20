'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useLocale, useTranslations } from 'next-intl';
import { Ban, CornerUpLeft, Flag, Hash, Loader2, MoreHorizontal, Send, Trash2, Trophy, X } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { CoachAvatar } from '@/components/coach/coach-portrait';
import { BeltBadge } from '@/components/community/belt-badge';
import { getCoach } from '@/lib/coaches';
import { flagEmoji } from '@/lib/community/countries';
import { cleanMessage } from '@/lib/community/moderation';
import { deleteMessage, fetchMessages, isRateLimited, reportMessage, sendMessage } from '@/lib/community/api';
import {
  MAX_MESSAGE_LENGTH,
  REPORT_REASONS,
  type Channel,
  type CommunityProfile,
  type Message,
  type ReportReason,
} from '@/lib/community/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 50;

export function useChannelName() {
  const t = useTranslations('community');
  return useCallback(
    (c: Pick<Channel, 'slug' | 'name'>) => (t.has(`channelNames.${c.slug}`) ? t(`channelNames.${c.slug}`) : c.name),
    [t]
  );
}

function ReportDialog({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (reason: ReportReason) => Promise<void>;
}) {
  const t = useTranslations('community');
  const [reason, setReason] = useState<ReportReason>('harassment');
  const [sending, setSending] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title={t('reportTitle')} size="sm">
      <p className="text-sm text-ink-muted">{t('reportBody')}</p>
      <div className="mt-4 space-y-1.5">
        {REPORT_REASONS.map((r) => (
          <label
            key={r}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-sm border px-3 py-2 text-sm',
              reason === r ? 'border-forge/60 bg-forge-dim/40 text-ink' : 'border-line text-ink-muted'
            )}
          >
            <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} className="accent-[#FF4D94]" />
            {t(`reasons.${r}`)}
          </label>
        ))}
      </div>
      <Button
        className="mt-5 w-full"
        variant="danger"
        loading={sending}
        onClick={async () => {
          setSending(true);
          await onSend(reason);
          setSending(false);
        }}
      >
        <Flag size={15} /> {t('reportSend')}
      </Button>
    </Modal>
  );
}

export function ChatRoom({
  supabase,
  me,
  channel,
  profiles,
  requestProfiles,
  blocked,
  onBlock,
  onOpenProfile,
}: {
  supabase: SupabaseClient;
  me: CommunityProfile;
  channel: Channel;
  profiles: Map<string, CommunityProfile>;
  requestProfiles: (ids: string[]) => void;
  blocked: Set<string>;
  onBlock: (userId: string) => void;
  onOpenProfile: (userId: string) => void;
}) {
  const t = useTranslations('community');
  const locale = useLocale();
  const { toast } = useToast();
  const channelName = useChannelName();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [actionsFor, setActionsFor] = useState<number | null>(null);
  const [reporting, setReporting] = useState<Message | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const timeFmt = useMemo(() => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }), [locale]);
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }), [locale]);

  // Initial load + live updates for the selected channel.
  useEffect(() => {
    let alive = true;
    void fetchMessages(supabase, channel.id, undefined, PAGE_SIZE).then(({ data }) => {
      if (!alive) return;
      setMessages(data);
      setHasMore(data.length === PAGE_SIZE);
      setLoading(false);
      stickToBottom.current = true;
      requestProfiles(Array.from(new Set(data.map((m) => m.user_id))));
    });

    const filter = `channel_id=eq.${channel.id}`;
    const live = supabase
      .channel(`messages:${channel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        requestProfiles([m.user_id]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
      })
      .subscribe();

    return () => {
      alive = false;
      void supabase.removeChannel(live);
    };
  }, [supabase, channel.id, requestProfiles]);

  // Keep the view pinned to the newest message unless the person scrolled up.
  useEffect(() => {
    const el = scroller.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadOlder = async () => {
    const oldest = messages[0]?.id;
    if (!oldest) return;
    setLoadingOlder(true);
    stickToBottom.current = false;
    const el = scroller.current;
    const prevHeight = el?.scrollHeight ?? 0;
    const { data } = await fetchMessages(supabase, channel.id, oldest, PAGE_SIZE);
    setMessages((prev) => [...data, ...prev]);
    setHasMore(data.length === PAGE_SIZE);
    requestProfiles(Array.from(new Set(data.map((m) => m.user_id))));
    setLoadingOlder(false);
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - prevHeight;
    });
  };

  const send = async () => {
    const cleaned = cleanMessage(text);
    if (!cleaned.text) return;
    if (cleaned.text.length > MAX_MESSAGE_LENGTH) {
      toast(t('tooLong'), 'error');
      return;
    }
    setSending(true);
    const { data, error } = await sendMessage(supabase, me.id, channel.id, cleaned.text, replyTo?.id ?? null);
    setSending(false);
    if (error) {
      toast(isRateLimited(error) ? t('slowDown') : t('sendError'), 'error');
      return;
    }
    if (cleaned.changed) toast(t('filtered'), 'info');
    stickToBottom.current = true;
    if (data) setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data]));
    setText('');
    setReplyTo(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  };

  const byId = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages]);
  const visible = messages.filter((m) => !blocked.has(m.user_id));
  const nameOf = (userId: string) => {
    const p = profiles.get(userId);
    return p ? p.display_name || p.username : '…';
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <Hash size={16} className="text-forge" />
        <div className="min-w-0">
          <p className="font-display text-base leading-tight tracking-wide">{channelName(channel)}</p>
          {channel.description ? <p className="truncate text-xs text-ink-faint">{channel.description}</p> : null}
        </div>
      </div>

      <div ref={scroller} onScroll={onScroll} className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-3 sm:px-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-ink-faint">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            {hasMore ? (
              <div className="flex justify-center pb-2">
                <Button variant="ghost" size="sm" loading={loadingOlder} onClick={() => void loadOlder()}>
                  {t('loadOlder')}
                </Button>
              </div>
            ) : null}
            {visible.length === 0 ? <p className="py-16 text-center text-sm text-ink-faint">{t('empty')}</p> : null}
            {visible.map((m) => {
              const author = profiles.get(m.user_id);
              const coach = getCoach(author?.avatar_coach);
              const mine = m.user_id === me.id;
              const created = new Date(m.created_at);
              const isToday = created.toDateString() === new Date().toDateString();
              const parent = m.reply_to ? byId.get(m.reply_to) : undefined;
              const deleted = Boolean(m.deleted_at);

              return (
                <div
                  key={m.id}
                  className={cn(
                    'group relative flex gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-hover/50',
                    actionsFor === m.id && 'bg-surface-hover/50'
                  )}
                  onClick={() => setActionsFor((cur) => (cur === m.id ? null : m.id))}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProfile(m.user_id);
                    }}
                    className="shrink-0 self-start"
                    aria-label={author?.username ?? ''}
                  >
                    <CoachAvatar coach={coach} size={36} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProfile(m.user_id);
                        }}
                        className={cn('text-sm font-bold hover:underline', mine ? 'text-forge' : 'text-ink')}
                      >
                        {author ? author.display_name || author.username : '…'}
                      </button>
                      {author?.country ? <span title={author.country}>{flagEmoji(author.country)}</span> : null}
                      {author ? <BeltBadge level={author.level} compact /> : null}
                      <span className="font-mono text-[10px] text-ink-faint">
                        {isToday ? timeFmt.format(created) : `${dateFmt.format(created)} ${timeFmt.format(created)}`}
                      </span>
                    </div>

                    {parent && !deleted ? (
                      <p className="mt-1 truncate border-s-2 border-violet/60 ps-2 text-xs text-ink-faint">
                        <CornerUpLeft size={11} className="me-1 inline" />
                        <span className="font-semibold">{nameOf(parent.user_id)}</span>:{' '}
                        {parent.deleted_at ? t('deletedMessage') : parent.body || '🏆'}
                      </p>
                    ) : null}

                    {deleted ? (
                      <p className="mt-0.5 text-sm italic text-ink-faint">{t('deletedMessage')}</p>
                    ) : m.kind === 'workout' && m.meta ? (
                      <div className="mt-1.5 inline-flex max-w-full items-center gap-3 rounded-md border border-brass/30 bg-brass-dim/50 px-3 py-2">
                        <Trophy size={18} className="shrink-0 text-brass" />
                        <p className="text-sm text-ink">
                          {t('sharedWorkout', { title: m.meta.title, sets: m.meta.sets, minutes: m.meta.minutes })}
                        </p>
                        <CoachAvatar coach={getCoach(m.meta.coachId)} size={28} />
                      </div>
                    ) : (
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{m.body}</p>
                    )}
                  </div>

                  {!deleted ? (
                    <div
                      className={cn(
                        'absolute end-2 top-1 flex items-center gap-0.5 rounded-sm border border-line bg-surface-raised p-0.5 shadow-raised',
                        actionsFor === m.id ? 'flex' : 'hidden group-hover:flex'
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        title={t('reply')}
                        aria-label={t('reply')}
                        onClick={() => {
                          setReplyTo(m);
                          setActionsFor(null);
                        }}
                        className="rounded-xs p-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink"
                      >
                        <CornerUpLeft size={14} />
                      </button>
                      {mine ? (
                        <button
                          title={t('deleteMessage')}
                          aria-label={t('deleteMessage')}
                          onClick={async () => {
                            setActionsFor(null);
                            const { error } = await deleteMessage(supabase, m.id);
                            if (!error) setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, deleted_at: new Date().toISOString(), body: '' } : x)));
                          }}
                          className="rounded-xs p-1.5 text-ink-muted hover:bg-surface-hover hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <>
                          <button
                            title={t('report')}
                            aria-label={t('report')}
                            onClick={() => {
                              setReporting(m);
                              setActionsFor(null);
                            }}
                            className="rounded-xs p-1.5 text-ink-muted hover:bg-surface-hover hover:text-danger"
                          >
                            <Flag size={14} />
                          </button>
                          <button
                            title={t('block', { name: nameOf(m.user_id) })}
                            aria-label={t('block', { name: nameOf(m.user_id) })}
                            onClick={() => {
                              setActionsFor(null);
                              onBlock(m.user_id);
                            }}
                            className="rounded-xs p-1.5 text-ink-muted hover:bg-surface-hover hover:text-danger"
                          >
                            <Ban size={14} />
                          </button>
                        </>
                      )}
                      <span className="px-1 text-ink-faint sm:hidden">
                        <MoreHorizontal size={14} />
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="border-t border-line p-3">
        {replyTo ? (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-sm bg-surface-raised px-3 py-1.5 text-xs text-ink-muted">
            <span className="truncate">
              <CornerUpLeft size={12} className="me-1 inline" />
              {t('replyingTo', { name: nameOf(replyTo.user_id) })}
            </span>
            <button onClick={() => setReplyTo(null)} aria-label={t('cancelReply')} className="text-ink-faint hover:text-ink">
              <X size={14} />
            </button>
          </div>
        ) : null}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('messagePlaceholder', { channel: channelName(channel) })}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH + 50}
            disabled={channel.locked}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-md border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-forge focus:outline-none disabled:opacity-50"
          />
          <Button onClick={() => void send()} loading={sending} disabled={!text.trim() || channel.locked} aria-label={t('send')} className="h-11 px-4">
            {!sending ? <Send size={16} className="rtl:-scale-x-100" /> : null}
          </Button>
        </div>
        {text.length > MAX_MESSAGE_LENGTH * 0.8 ? (
          <p className={cn('mt-1 text-end font-mono text-[10px]', text.length > MAX_MESSAGE_LENGTH ? 'text-danger' : 'text-ink-faint')}>
            {text.length}/{MAX_MESSAGE_LENGTH}
          </p>
        ) : null}
      </div>

      <ReportDialog
        open={reporting !== null}
        onClose={() => setReporting(null)}
        onSend={async (reason) => {
          if (reporting) await reportMessage(supabase, me.id, reporting.id, reason);
          setReporting(null);
          toast(t('reportSent'));
        }}
      />
    </div>
  );
}
