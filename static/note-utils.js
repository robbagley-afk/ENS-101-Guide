(function exposeNoteUtils(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.NoteUtils = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const CONVERSATION_NOTE_TAG = '#SSTEAM';

  function stripConversationTag(value = '') {
    const raw = String(value ?? '').replace(/\r\n/g, '\n');
    return raw
      .split('\n')
      .filter(line => line.trim() !== CONVERSATION_NOTE_TAG)
      .join('\n')
      .trim();
  }

  function appendConversationTag(value = '') {
    const body = stripConversationTag(value);
    return body ? `${body}\n\n${CONVERSATION_NOTE_TAG}` : CONVERSATION_NOTE_TAG;
  }

  return {
    CONVERSATION_NOTE_TAG,
    stripConversationTag,
    appendConversationTag,
    ensurePermanentConversationTag: appendConversationTag
  };
});
