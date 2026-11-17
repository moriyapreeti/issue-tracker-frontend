import { useEffect, useState } from 'react';
import { commentsApi, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Avatar } from './Badges';
import { Spinner } from './Spinner';
import { timeAgo } from '../utils/helpers';

export default function CommentSection({ ticketId }) {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    commentsApi.list(ticketId).then(setComments).catch((e) => { toast.error(errorMessage(e)); setComments([]); });
  }, [ticketId]); // eslint-disable-line react-hooks/exhaustive-deps

  const post = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const c = await commentsApi.add(ticketId, text.trim());
      setComments((x) => [...x, c]);
      setText('');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsApi.remove(c.id);
      setComments((x) => x.filter((i) => i.id !== c.id));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <section aria-label="Comments">
      <h3 className="mb-3 text-lg font-bold">Comments {comments && <span className="text-ink-300">{comments.length}</span>}</h3>
      {comments === null ? (
        <div className="py-4"><Spinner /></div>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar user={c.author} size="h-8 w-8 text-xs" />
              <div className="min-w-0 flex-1">
                <p className="text-sm"><span className="font-semibold">{c.author.name}</span> <span className="text-ink-300">{timeAgo(c.createdAt)}</span></p>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-700">{c.content}</p>
                {c.canDelete && <button className="mt-1 text-xs font-semibold text-ink-300 hover:text-red-600" onClick={() => remove(c)}>Delete</button>}
              </div>
            </li>
          ))}
          {comments.length === 0 && <li className="text-sm text-ink-500">No comments yet. Start the discussion below.</li>}
        </ul>
      )}
      <form onSubmit={post} className="mt-5 space-y-2">
        <label className="sr-only" htmlFor="new-comment">Add a comment</label>
        <textarea id="new-comment" className="input min-h-20" maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…" />
        <div className="flex justify-end">
          <button className="btn-primary" disabled={posting || !text.trim()}>{posting && <Spinner className="h-4 w-4 text-white" />} Post comment</button>
        </div>
      </form>
    </section>
  );
}
